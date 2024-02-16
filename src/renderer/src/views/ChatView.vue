<template>
    <div class="chat-view-container">
        <div class="chat-side-container">
            <div class="side-tool-container">
                <SideTopToolBar />
            </div>
            <div class="side-list-container">
                <template v-if="recentChatList.length > 0">
                    <template v-for="item in recentChatList" :key="item.id">
                        <ChatItem :chat-item="item" @click="openChat(item)"></ChatItem>
                    </template>
                </template>
                <template v-else>
                    <el-empty class="side-list-data" description="暂无会话" />
                </template>
            </div>
        </div>
        <div class="chat-main-container">
            <router-view v-slot="{ Component }">
                <component :is="Component" />
            </router-view>
        </div>

        <el-image-viewer v-if="imageViewerVisible" :url-list="imageUrl" @close="imageViewerVisible = false" />
    </div>
</template>

<script setup>
import { ref, computed, onBeforeMount, onBeforeUnmount } from "vue"
import ChatItem from '../components/ChatItem.vue'
import { useChatStore } from '../store/chatStore'
import SideTopToolBar from '../components/SideTopToolBar.vue'
import { useRouter } from "vue-router"
import { useReconnect } from '../assets/js/reconnectMixin'

const chatStore = useChatStore()
const router = useRouter()

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

useReconnect(() => {
    chatStore.getRecentChatList().then((res) => {
        if (res.code === 200) {
            if (currentChatInfo) {
                if (currentChatInfo.value.type === 0) {
                    router.push('/chat/single/' + currentChatInfo.value.toUserId)
                } else if (currentChatInfo.type === 1) {
                    router.push('/chat/group/' + currentChatInfo.value.groupId)
                }
            } else {
                router.push('/chat/home')
            }
        }
    })
})

const recentChatList = computed(() => {
    return chatStore.recentChatList.sort((a, b) => {
        if (a.recentChat.top > b.recentChat.top) {
            return -1
        }
        if (a.recentChat.top < b.recentChat.top) {
            return 1
        }
        let atime = a.recentChat.createTime
        let btime = b.recentChat.createTime
        if (a.lastMessage) {
            atime = a.lastMessage.createTime
        }
        if (b.lastMessage) {
            btime = b.lastMessage.createTime
        }
        return btime - atime
    })
})

const currentChatInfo = computed(() => {
    return chatStore.currentChatInfo
})

const openChat = (item) => {
    chatStore.recordCurrentChatInfo(item)
    if (item.recentChat.type == 0) {
        router.push({ path: '/chat/single/' + item.recentChat.toUserId })
    } else {
        router.push({ path: '/chat/group/' + item.recentChat.groupId })
    }
}

const imageViewerVisible = ref(false)
const imageUrl = ref([])

const openImageViewer = (url) => {
    imageViewerVisible.value = true
    imageUrl.value = [url]
}
</script>

<style lang="scss" scoped>
.chat-view-container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;

    .chat-side-container {
        min-width: 350px;
        border-right: 1px solid var(--el-color-info-light-5);
        display: flex;
        flex-direction: column;
        background-color: #f0f2f5;

        .side-tool-container {
            padding: 0 10px;
            min-height: 100px;
            background-color: white;
            border-bottom: 1px solid var(--el-color-info-light-5);
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
        }

        .side-list-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 10px;
            height: 100%;

            .side-list-data {
                display: flex;
                flex: 1;
                flex-direction: column;
                gap: 10px;
            }
        }

    }

    .chat-main-container {
        width: 100%;
        height: 100%;
        background-color: #f0f2f5;
        display: flex;
    }
}
</style>