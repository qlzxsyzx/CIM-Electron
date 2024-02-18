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
                    <div class="status-container" v-if="props.messageInfo.type === 1">
                        <MessageItemLoader v-show="sendStatus === 0" />
                        <el-dropdown trigger="click" @command="handleErrorCommand" placement="top" v-show="sendStatus === -1">
                            <div>
                                <SvgIcon iconName="error" iconClass="error__icon" />
                            </div>
                            <template #dropdown>
                                <el-dropdown-item :command="1">重发</el-dropdown-item>
                            </template>
                        </el-dropdown>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watchPostEffect, nextTick, onBeforeMount } from 'vue'
import FileUploadMessage from './FileUploadMessage.vue';
import FileDownloadMessage from './FileDownloadMessage.vue';
import { useUserStore } from '../store/userStore'
import { useChatStore } from '../store/chatStore';
import { useUserInfoStore } from '../store/userInfoStore';
import { useFriendStore } from '../store/friendStore';
import { useGroupStore } from '../store/groupStore';
import { formatMessageDateTime } from '../assets/js/format'
import { decodeMessageToHtml } from '../assets/js/utils';
import MessageItemLoader from './MessageItemLoader.vue';
import { ElMessage } from 'element-plus';

const props = defineProps(["messageInfo"])
const userStore = useUserStore()
const chatStore = useChatStore()
const userInfoStore = useUserInfoStore()
const friendStore = useFriendStore()
const groupStore = useGroupStore()
const sendStatus = computed(() => {
    return props.messageInfo.sendStatus
})

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
    if (!currentChatInfo.value) return null
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
        const groupMember = groupStore.getMemberByGroupIdAndUserId(currentChatInfo.value.groupId, userInfo.value.userId)
        if (props.messageInfo.senderId === userStore.userInfo.userId) {
            if (groupMember) {
                //自己
                return groupMember.userNickName || userInfo.value.name
            } else {
                return userInfo.value.name
            }
        } else {
            const friend = friendStore.findFriendByUserId(item => item.friendId == userInfo.value.userId)
            if (friend && friend.remark) {
                return friend.remark
            }
            if (groupMember) {
                return groupMember.userNickName || userInfo.value.name
            } else {
                return userInfo.value.name
            }
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

const handleErrorCommand = (command) => {
    if(command === 1){
        const message = chatStore.currentChatHistory.find((item) => item.messageId === props.messageInfo.messageId)
        chatStore.currentChatHistory = chatStore.currentChatHistory.filter((item) => item.messageId !== message.messageId)
        message.sendStatus = 0
        chatStore.currentChatHistory.unshift(message)
        const createMessageDto = {
            roomId: message.roomId,
            senderId: message.senderId,
            receiverId: message.receiverId,
            receiverType: message.receiverType,
            type: message.type,
            content: message.content,
            contentText: message.contentText,
            recordId: null
        }
        chatStore.sendMessage(message, createMessageDto).then(res => {
            if (res.code == 200) {
                ElMessage.success('发送成功')
            } 
        }
        ).catch(err => {
           ElMessage.error("发送失败")
        })
    }
}
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
                display: flex;

                .msg-container {
                    max-width: 50%;
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
                    display: flex;
                    flex-direction: row-reverse;

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

                    .status-container {
                        position: relative;
                        width: 20px;
                        height: 20px;
                        margin-top: auto;

                        .error__icon {
                            width: 20px;
                            height: 20px;
                            transform: translateY(-2px);
                            cursor: pointer;

                            path {
                                fill: #EF665B;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>