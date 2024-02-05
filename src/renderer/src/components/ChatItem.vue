<template>
    <div v-if="chatInfo" class="chat-item-container" :class="{ 'click': isClick }">
        <div class="item-avatar-container">
            <template v-if="props.chatItem.recentChat.unreadCount > 0">
                <el-badge :value="props.chatItem.recentChat.unreadCount" :max="99" class="item-tip">
                    <el-avatar class="avatar" :src="avatarUrl" />
                </el-badge>
            </template>
            <template v-else>
                <el-avatar class="avatar" :src="avatarUrl" />
            </template>
        </div>
        <div class="item-data-container">
            <div class="item-data-name-time">
                <div class="item-name">
                    {{ name }}
                </div>
                <div class="item-time">
                    {{ lastMessageTime }}
                </div>
            </div>
            <div v-if="props.chatItem.lastMessage" class="item-data-recent-message">
                {{ filterLastMessageContent }}
            </div>
        </div>
    </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router';
import { formatLocalDateTimeToText } from '../assets/js/format'
import { useChatStore } from '../store/chatStore';
import { useUserInfoStore } from '../store/userInfoStore'
import { useFriendStore } from '../store/friendStore'

const route = useRoute()
const props = defineProps(["chatItem"])
const chatStore = useChatStore()
const userInfoStore = useUserInfoStore()
const friendStore = useFriendStore()

const chatInfo = computed(() => {
    if (props.chatItem.recentChat.type == 0) {
        // 私聊
        return userInfoStore.getUserInfo(props.chatItem.recentChat.toUserId)
    } else {
        // 群聊
        return chatStore.groupList.find(item => item.id == props.chatItem.recentChat.groupId)
    }
})

const avatarUrl = computed(() => {
    return chatInfo.value.avatarUrl
})

const name = computed(() => {
    if (props.chatItem.recentChat.type == 0) {
        // 私聊
        const friend = friendStore.findFriendByUserId(props.chatItem.recentChat.toUserId)
        return friend.remark || chatInfo.value.name
    } else {
        // 群聊
        const groupSetting = chatStore.myGroupSettingMap.get(props.chatItem.recentChat.groupId)
        if (groupSetting) {
            return groupSetting.groupNickName || chatInfo.value.name
        }
        return chatInfo.value.name
    }
})

const isClick = computed(() => {
    return route.params.roomId === props.chatItem.recentChat.roomId
})

const lastMessageContent = computed(() => {
    if (props.chatItem.recentChat.type == 0) {
        // 私聊
        return props.chatItem.lastMessage.content
    } else {
        // 群聊
        const sender = props.chatItem.sender
        if (sender === null) {
            return '我：' + props.chatItem.lastMessage.content
        } else {
            const friend = friendStore.findFriendByUserId(sender.userInfo.userId)
            if (friend === null) {
                // 不是好友
                return sender.member.userNickName || sender.userInfo.name + "：" + props.chatItem.lastMessage.content
            } else {
                // 是好友
                return friend.remark || sender.member.userNickName || sender.userInfo.name + "：" + props.chatItem.lastMessage.content
            }
        }
    }
})

const filterLastMessageContent = computed(() => {
    return lastMessageContent.value.replace(/\[图片 src=".*?"]/g, '[图片]')
})

const lastMessageTime = computed(() => {
    if (props.chatItem.lastMessage) {
        return formatLocalDateTimeToText(props.chatItem.lastMessage.createTime)
    } else {
        return formatLocalDateTimeToText(props.chatItem.recentChat.createTime)
    }
})
</script>
<style lang="scss" scoped>
.chat-item-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    height: 70px;

    @keyframes fill {
        0% {
            background-color: transparent;
        }

        100% {
            background-color: white;
        }
    }

    &.click {
        animation: fill 0.5s;
        background-color: white;

        &:hover {
            background-color: white;
        }
    }

    &:hover {
        background-color: #5f5f5f27;
    }

    .item-avatar-container {
        display: flex;
        margin-right: 20px;

        .avatar {
            width: 60px;
            height: 60px;
        }
    }

    .item-data-container {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;

        .item-data-name-time {
            width: 100%;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .item-name {
                width: 150px;
                white-space: nowrap;
                /* 防止文字换行 */
                overflow: hidden;
                /* 隐藏超出容器的内容 */
                text-overflow: ellipsis;
                /* 显示省略号 */
                color: black;
                font-weight: 500;
                font-size: 20px;
            }

            .item-time {
                display: flex;
                flex-direction: row-reverse;
                width: 50px;
                color: var(--el-color-info-light-3);
                font-size: 14px;
            }
        }

        .item-data-recent-message {
            width: 180px;
            height: 30px;
            color: var(--el-color-info-light-3);
            font-size: 14px;
            white-space: nowrap;
            /* 防止文字换行 */
            overflow: hidden;
            /* 隐藏超出容器的内容 */
            text-overflow: ellipsis;
            /* 显示省略号 */
        }
    }
}

:deep(.el-badge__content.is-fixed) {
    position: absolute;
    top: 0;
    transform: translateY(-50%) translateX(100%);
    z-index: var(--el-index-normal);
    right: calc(10px + var(--el-badge-size)/ 2);
}
</style>