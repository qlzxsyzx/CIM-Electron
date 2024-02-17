<template>
    <div class="history-item-container">
        <el-skeleton :loading="loading" animated>
            <template #template>
                <el-skeleton-item variant="circle" :size="50" />
                <div class="history-item-content">
                    <el-skeleton-item variant="text" style="width: 50%" />
                    <el-skeleton-item variant="text" style="width: 80%" />
                </div>
            </template>
            <template #default>
                <el-avatar :size="50" :src="avatarUrl" style="min-width: 50px;"/>
                <div class="history-item-content">
                    <div class="history-item-title">
                        <span class="name">{{ name }}</span>
                        <span>{{ formatTime(props.message.createTime) }}</span>
                    </div>
                    <div class="history-item-text">
                        <template v-if="type === 1">
                            <!-- 文字消息 -->
                            <div class="msg-text" v-html="decodeMessageToHtml(props.message.content)">
                            </div>
                        </template>
                        <!-- 文件消息,实时显示上传下载进度，重试，取消，下载按钮，文件大小 -->
                        <template v-else-if="type === 3">
                            <template v-if="position === 'right'">
                                <FileUploadMessage :messageInfo="props.message" />
                            </template>
                            <template v-else>
                                <FileDownloadMessage :fileInfo="props.message.fileInfo" />
                            </template>
                        </template>
                    </div>
                </div>
            </template>
        </el-skeleton>
    </div>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { formatTime } from '../assets/js/format';
import { getMemberInfo } from '../api/group';
import { useChatStore } from '../store/chatStore';
import { useFriendStore } from '../store/friendStore';
import { useUserInfoStore } from '../store/userInfoStore';
import { useUserStore } from '../store/userStore';
import { decodeMessageToHtml } from '../assets/js/utils';
import FileUploadMessage from './FileUploadMessage.vue';
import FileDownloadMessage from './FileDownloadMessage.vue';

const props = defineProps(['message', 'type'])
const chatStore = useChatStore()
const friendStore = useFriendStore()
const userInfoStore = useUserInfoStore()
const userStore = useUserStore()
const loading = ref(true)
const name = ref('')
const avatarUrl = ref('')
const type = ref(props.message.type)

const currentChatInfo = computed(() => {
    if (!chatStore.currentChatInfo) return null
    return chatStore.currentChatInfo.recentChat
})

const friendInfo = computed(() => {
    return friendStore.findFriendByUserId(currentChatInfo.value.toUserId)
})

const friendUserInfo = computed(() => {
    return userInfoStore.getUserInfo(currentChatInfo.value.toUserId)
})

const position = computed(() => {
    return friendUserInfo.value.userId === userStore.userInfo.userId ? "right" : "left";
})

onBeforeMount(() => {
    if (currentChatInfo.value.type === 1) {
        getMemberInfo(currentChatInfo.value.groupId, props.message.senderId).then(res => {
            if (res.code === 200) {
                name.value = res.data.userNickName || res.data.remark || res.data.name
                avatarUrl.value = res.data.avatarUrl
                loading.value = false
            }
        })
    } else {
        if (friendInfo.value && friendUserInfo.value) {
            name.value = friendInfo.value?.remark || friendUserInfo.value?.name
            avatarUrl.value = friendUserInfo.value?.avatarUrl
            loading.value = false
        }
    }
})

</script>

<style lang="scss" scoped>
.history-item-container{
    width: 100%;
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid #c8c9cc;
    padding: 10px 0;

    .history-item-content {
        margin-left: 5px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        .history-item-title {
            .name {
                max-width: 50%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                margin-right: 10px;
            }
        }
        .history-item-text {
            border-radius: 5px;
            word-break: break-word;
        }
    }
}
</style>