<template>
    <div class="chat-msg-item">
        <div class="chat-msg-normal" :class="'chat-msg-' + position">
            <div class="head-image">
                <el-avatar :src="userInfo.avatarUrl" />
            </div>
            <div class="chat-msg-content">
                <div class="chat-msg-top">
                    <span>{{ name }}</span>
                    <span>{{ formatMessageDateTime(props.messageInfo.createTime) }}</span>
                </div>
                <div class="chat-msg-bottom">
                    <div class="msg-container">
                        <template v-if="type === 'text'">
                            <!-- 文字消息 -->
                            <div class="chat-msg-text" v-html="decodeMessageToHtml(props.messageInfo.content)">
                            </div>
                        </template>
                        <!-- 文件消息,实时显示上传下载进度，重试，取消，下载按钮，文件大小 -->
                        <template v-else-if="type === 'file'">
                            <template v-if="position === 'right'">
                                <FileUploadMessage :messageInfo="props.messageInfo" />
                            </template>
                            <template v-else>
                                <FileDownloadMessage :fileInfo="props.messageInfo.fileInfo" />
                            </template>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import FileUploadMessage from './FileUploadMessage.vue';
import FileDownloadMessage from './FileDownloadMessage.vue';
import { useUserStore } from '../store/userStore'
import { useChatStore } from '../store/chatStore';
import { useUserInfoStore } from '../store/userInfoStore';
import { useFriendStore } from '../store/friendStore';
import { useGroupStore } from '../store/groupStore';
import { formatMessageDateTime } from '../assets/js/format'
import { decodeMessageToHtml } from '../assets/js/utils';

const props = defineProps(["messageInfo"])
const userStore = useUserStore()
const chatStore = useChatStore()
const userInfoStore = useUserInfoStore()
const friendStore = useFriendStore()
const groupStore = useGroupStore()

const currentChatInfo = computed(() => {
    if (!chatStore.currentChatInfo) return null
    return chatStore.currentChatInfo.recentChat
})

const userInfo = computed(() => {
    if (props.messageInfo.senderId === userStore.userInfo.userId) {
        //自己
        return userStore.userInfo
    } else {
        return userInfoStore.getUserInfo(props.messageInfo.senderId)
    }
})

const name = computed(() => {
    if (currentChatInfo.value.type == 0) {
        // 私聊
        if (props.messageInfo.senderId === userStore.userInfo.userId) {
            //自己
            return userInfo.value.name
        } else {
            const friend = friendStore.findFriendByUserId(currentChatInfo.value.toUserId)
            return friend.remark || userInfo.value.name
        }
    } else {
        // 群聊
        const groupMember = groupStore.getMemberByGroupIdAndUserId(currentChatInfo.value.groupId,userInfo.value.userId)
        if (props.messageInfo.senderId === userStore.userInfo.userId) {
            //自己
            return groupMember.userNickName || userInfo.value.name
        } else {
            const friend = friendStore.findFriendByUserId(item => item.friendId == userInfo.value.userId)
            return friend.remark || groupMember.userNickName || userInfo.value.name
        }
    }
})

const position = computed(() => {
    return userInfo.value.userId === userStore.userInfo.userId ? "right" : "left";
})

const type = computed(() => {
    switch (props.messageInfo.type) {
        case 0:
            return "system";
        case 2:
            return "image";
        case 3:
            return "file";
        default:
            return "text";
    }
})


</script>

<style scoped lang="scss">
.chat-msg-item {
    margin: 0 5px;

    .chat-msg-normal {
        position: relative;
        font-size: 0;
        padding-left: 60px;
        min-height: 50px;
        margin-top: 10px;

        .head-image {
            position: absolute;
            width: 40px;
            height: 40px;
            top: 0;
            left: 10px;
        }

        .chat-msg-content {
            text-align: left;

            .send-fail {
                color: #e60c0c;
                font-size: 30px;
                cursor: pointer;
                margin: 0 20px;
            }

            .chat-msg-top {
                display: flex;
                flex-wrap: nowrap;
                color: #333;
                font-size: 14px;
                line-height: 20px;

                span {
                    margin-right: 12px;
                }
            }

            .chat-msg-bottom {
                display: inline-block;
                padding-right: 300px;

                .msg-container {
                    display: block;
                    position: relative;
                    min-height: 30px;
                    line-height: 30px;
                    margin-top: 3px;
                    padding: 7px 10px;
                    background-color: white;
                    border-radius: 10px;
                    color: black;
                    display: block;
                    font-size: 16px;
                    text-align: left;
                    word-break: break-all;

                    &:after {
                        content: "";
                        position: absolute;
                        left: -10px;
                        top: 13px;
                        width: 0;
                        height: 0;
                        border-style: solid dashed dashed;
                        border-color: white transparent transparent;
                        overflow: hidden;
                        border-width: 10px;
                    }
                }
            }
        }


        &.chat-msg-right {
            text-align: right;
            padding-left: 0;
            padding-right: 60px;

            .head-image {
                left: auto;
                right: 10px;
            }

            .chat-msg-content {
                text-align: right;

                .chat-msg-top {
                    justify-content: flex-end;

                    span {
                        margin-left: 12px;
                        margin-right: 0;
                    }
                }

                .chat-msg-bottom {
                    padding-left: 300px;
                    padding-right: 0;

                    .msg-container {
                        margin-left: 10px;
                        background-color: rgb(88, 127, 240);
                        color: #fff;
                        vertical-align: top;

                        &:after {
                            left: auto;
                            right: -10px;
                            border-top-color: rgb(88, 127, 240);
                        }
                    }
                }
            }
        }
    }
}
</style>