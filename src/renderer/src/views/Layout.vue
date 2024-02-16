<template>
    <div class="layout-container">
        <MenuBar />
        <router-view v-slot="{ Component }">
            <Transition>
                <KeepAlive include="ChatView">
                    <component :is="Component"></component>
                </KeepAlive>
            </Transition>
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
import { createWS } from '../assets/js/ws';
import { ElMessage } from 'element-plus';
import { getPlatform } from '../assets/js/platform';
import { useRoute } from 'vue-router';
import { ElLoading } from 'element-plus'
import { useReconnect } from '../assets/js/reconnectMixin'

const userStore = useUserStore();
const chatStore = useChatStore();
const friendStore = useFriendStore();
const groupStore = useGroupStore()
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

// ws收到消息的回调，todo:先做简单的，
// 用户和群组消息：先判断是否是最近会话界面再判断是否当前会话，直接向当前聊天记录添加消息，如果不是，则先判断最近聊天是否存在该聊天室，不存在则就发送请求获取该聊天室信息添加进去，存在则直接更新最新消息和未读数
// 系统消息，广播和消息通知todo
const messageCallBack = (message) => {
    console.log('messageCallBack', message);
    // 用户或群组的消息
    if (message.headType == 7) {
        const msg = message.messageRequest;
        // 先判断是否是最近会话界面
        if (route.path.startsWith('/chat')) {
            // 先判断是否是当前会话
            if (msg.roomId == chatStore.currentChat.roomId) {
                // 如果是当前会话，直接向当前聊天记录添加消息
                chatStore.addCurrentChatHistory(msg);
            } else {
                // 不是当前会话，先判断最近聊天是否存在该聊天室，不存在则就发送请求获取该聊天室信息添加进去，存在则直接更新最新消息和未读数
                const index = recentChatList.value.findIndex(item => item.roomId == msg.roomId);
                if (index === -1) {
                    // 不存在就请求创建这条最近会话记录，后台返回信息并记录到store
                    // chatStore.createRecentChat(msg.roomId);
                }
                // 存在则直接更新最新消息和未读数
                chatStore.updateRecentChat(msg);
            }
        } else {
            // todo:不是最近会话界面
        }
    }
    // 系统通知
    if (message.headType == 8) {
        const msg = message.messageSystem
        if (msg.type == 1) {
            // 广播
            //todo
            ElMessage.warning(msg.content);
        } else if (msg.type == 2) {
            // 个人通知
            //todo
            ElMessage.info(msg.content);
        }
    }
}

let fullScreenLoading

const closeCallBack = () => {
    // 关闭连接
    // 页面显示重连中
    fullScreenLoading = ElLoading.service({
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