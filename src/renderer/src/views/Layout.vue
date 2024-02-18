<template>
    <div class="layout-container">
        <MenuBar />
        <router-view v-slot="{ Component }">
            <component :is="Component"></component>
        </router-view>
    </div>
    <el-image-viewer v-if="imageViewerVisible" :url-list="imageUrl" @close="imageViewerVisible = false" />
</template>

<script setup>
import MenuBar from '../components/MenuBar.vue';
import { ref, onBeforeMount, onBeforeUnmount, computed } from 'vue';
import { useUserStore } from '../store/userStore';
import { useChatStore } from '../store/chatStore';
import { useFriendStore } from '../store/friendStore';
import { useGroupStore } from '../store/groupStore'
import { useUserInfoStore } from '../store/userInfoStore';
import { createWS } from '../assets/js/ws';
import { ElMessage } from 'element-plus';
import { getPlatform } from '../assets/js/platform';
import { useRoute } from 'vue-router';
import { ElLoading } from 'element-plus'
import { useReconnect } from '../assets/js/reconnectMixin'
import { ElNotification } from 'element-plus'
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const chatStore = useChatStore();
const friendStore = useFriendStore();
const groupStore = useGroupStore()
const userInfoStore = useUserInfoStore();
const route = useRoute();

const recentChatList = computed(() => chatStore.recentChatList);

const dbclickImage = (e) => {
    const target = e.target;
    if (target.tagName === 'IMG' && !target.classList.contains('cim-emoji')) {
        // 阻止事件冒泡
        e.stopPropagation();
        // 调用预览方法
        openImageViewer(e.target.src)
    }
}

onBeforeMount(() => {
    // 对img元素进行点击事件监听，实现图片预览功能
    document.addEventListener('dblclick', dbclickImage)
})

onBeforeUnmount(() => {
    document.removeEventListener('dblclick', dbclickImage)
})

const imageViewerVisible = ref(false)
const imageUrl = ref([])

const openImageViewer = (url) => {
    imageViewerVisible.value = true
    imageUrl.value = [url]
}

useReconnect(() => {
    userStore.getUserInfo()
    friendStore.getFriendList()
    groupStore.getGroupList()
})

// ws收到消息的回调
// 系统消息，广播和消息通知todo
const messageCallBack = (message) => {
    const messageContent = message.messageRequest
    // 用户或群组的消息
    if (message.headType == 4) {
        handleChatMessage(messageContent)
    }
    // 广播消息
    if (message.headType == 5) {
        handleBroadcastMessage(messageContent)
    }
    // 系统通知
    if (message.headType == 6) {
        handleSystemNotification(messageContent)
    }
}

//用户和群组消息：先判断是否是最近会话界面再判断是否当前会话，
//直接向当前聊天记录添加消息，如果不是，则先判断最近聊天是否存在该聊天室，
const handleChatMessage = (msg) => {
    console.log('收到聊天消息', msg)
    const message = {
        content: msg.content,
        createTime: msg.createTime,
        messageId: msg.messageId.toString(),
        senderId: msg.senderId.toString(),
        receiverId: msg.receiverId.toString(),
        roomId: msg.roomId.toString(),
        type: msg.type,
        fileInfo: msg.fileInfo ? {
            recordId: msg.fileInfo.recordId.toString(),
            realName: msg.fileInfo.realName,
            ext: msg.fileInfo.ext,
            fileSize: msg.fileInfo.fileSize
        } : null
    }
    const roomId = message.roomId
    // 先判断是否有当前会话记录
    const currentChat = chatStore.currentChatInfo
    if (!currentChat) {
        // 不存在则不是在聊天页面
        // 判断最近聊天是否存在该聊天室
        notCurrentChat(roomId, message)
    } else {
        // 存在判断当前路径
        if (route.path.startsWith('/chat/single') || route.path.startsWith('/chat/group')) {
            // 先判断是否是当前会话
            if (currentChat.recentChat.roomId == roomId) {
                // 是
                chatStore.addCurrentChatHistory(message)
            } else {
                // 不是
                notCurrentChat(roomId, message)
            }
        } else {
            notCurrentChat(roomId, message)
        }
    }
}

const notCurrentChat = (roomId, message) => {
    const recentChat = chatStore.findRecentChatByRoomId(roomId)
    const friend = friendStore.findFriendByRoomId(roomId)
    if (friend) {
        if (recentChat) {
            recentChat.lastMessage = message
            recentChat.recentChat.unreadCount++
        } else {
            chatStore.addSingleChat(friend.friendId)
        }
        const friendUserInfo = userInfoStore.getUserInfo(friend.friendId)
        ElNotification({
            title: '新消息',
            message: `${friend.remark || friendUserInfo.name} 发来一条消息`,
            duration: 1000,
        })
    } else {
        const group = groupStore.findGroupByRoomId(roomId)
        if (group) {
            if (recentChat) {
                recentChat.lastMessage = message
                recentChat.recentChat.unreadCount++
            } else {
                chatStore.addGroupChat(group.id)
            }
            const myGroupSetting = groupStore.findMyGroupSettingByGroupId(group.id)
            ElNotification({
                title: '新消息',
                message: `${myGroupSetting.groupUserNickName || group.name} 发来一条消息`,
                duration: 1000,
            })
        }
    }
}

const handleBroadcastMessage = (message) => {
    console.log('handleBroadcastMessage', message);
}

const handleSystemNotification = (message) => {
    console.log('handleSystemNotification', message);
}

let fullScreenLoading

const closeCallBack = () => {
    // 关闭连接
    // 页面显示重连中
    fullScreenLoading = ElLoading.service({
        target: '.chat-view-container',
        lock: true,
        text: '重连中',
        background: 'rgba(0, 0, 0, 0.2)'
    })
    userStore.reconnectSuccess = false
}

const errorCallBack = (error) => {
    // 错误
    ElMessage.error('ws连接错误');
}

const reconnectCallBack = () => {
    // 重连
    console.log('ws重连成功');
    if (fullScreenLoading) {
        fullScreenLoading.close();
        userStore.reconnectSuccess = true
    }
}

onBeforeMount(() => {
    console.log('Layout onBeforeMount 获取所有数据');
    const userInfo = userStore.userInfo;
    // 重新获取
    userStore.getUserInfo().then(res => {
        if (res.code == 200) {
            console.log('获取用户数据成功')
        }
    }).catch(err => {
        ElMessage.error('获取用户数据失败');
    })
    // 获取好友
    friendStore.getFriendList()
    // 获取群组
    groupStore.getGroupList()
    // 获取最近会话
    chatStore.getRecentChatList().then((res) => {
        if (res.code === 200) {
            const routeName = route.name
            if (routeName === '个人聊天') {
                const recentChat = chatStore.findRecentChatByToUserId(route.params.userId)
                chatStore.recordCurrentChatInfo(recentChat)
            }
            if (routeName === '群会话') {
                const recentChat = chatStore.findRecentChatByGroupId(route.params.groupId)
                chatStore.recordCurrentChatInfo(recentChat)
            }
        }
    })

    const loginParam = {
        userId: userInfo.userId,
        userToken: userStore.tokenInfo.access_token,
        platform: getPlatform()
    }
    createWS(loginParam, messageCallBack, closeCallBack, errorCallBack, reconnectCallBack);
})
</script>

<style scoped>
.layout-container {
    height: 100%;
    width: 100%;
    display: flex;
}
</style>