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
                    <KeepAlive>
                        <component :is="Component" />
                    </KeepAlive>
            </router-view>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue"
import ChatItem from '../components/ChatItem.vue'
import { useChatStore } from '../store/chatStore'
import SideTopToolBar from '../components/SideTopToolBar.vue'
import { useRoute, useRouter } from "vue-router"
import { useReconnect } from '../assets/js/reconnectMixin'

const chatStore = useChatStore()
const route = useRoute()
const router = useRouter()

useReconnect(() => {
    chatStore.getRecentChatList().then((res) => {
        if (res.code === 200) {
            // 获取当前的roomId
            const roomId = route.params.roomId
            if (roomId) {
                // 存在roomId，则打开聊天室
                chatStore.recordCurrentChatInfo(roomId)
            }
        }
    })
})

const recentChatList = computed(() => {
    return chatStore.recentChatList
})

const openChat = (item) => {
    chatStore.recordCurrentChatInfo(item.recentChat.roomId)
    if (item.recentChat.type == 0) {
        router.push({ path: '/chat/single/' + item.recentChat.roomId })
    } else {
        router.push({ path: '/chat/group/' + item.recentChat.roomId })
    }
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