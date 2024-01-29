<template>
    <div class="chat-item-container" :class="{ 'click': isClick }">
        <template v-if="props.chatItem.type === 0">
            <div class="item-avatar-container">
                <template v-if="props.chatItem.unreadCount > 0">
                    <el-badge :value="props.chatItem.unreadCount" :max="99" class="item-tip">
                        <el-avatar class="avatar" :src="props.chatItem.friendVo.userVo.avatarUrl" />
                    </el-badge>
                </template>
                <template v-else>
                    <el-avatar class="avatar" :src="props.chatItem.friendVo.userVo.avatarUrl" />
                </template>
            </div>
            <div class="item-data-container">
                <div class="item-data-name-time">
                    <div class="item-name">
                        {{ props.chatItem.friendVo.remark || props.chatItem.friendVo.userVo.name }}
                    </div>
                    <div class="item-time">
                        {{ lastMessageTime }}
                    </div>
                </div>
                <div v-if="props.chatItem.lastMessage" class="item-data-recent-message">
                    {{ props.chatItem.lastMessage.content }}
                </div>
            </div>
        </template>
        <template v-else-if="props.chatItem.type === 1">
            <div class="item-avatar-container">
                <template v-if="props.chatItem.unreadCount > 0">
                    <el-badge :value="props.chatItem.unreadCount" :max="99" class="item-tip">
                        <el-avatar class="avatar" :src="props.chatItem.groupVo.avatarUrl" />
                    </el-badge>
                </template>
                <template v-else>
                    <el-avatar class="avatar" :src="props.chatItem.groupVo.avatarUrl" />
                </template>
            </div>
            <div class="item-data-container">
                <div class="item-data-name-time">
                    <div class="item-name">
                        {{ props.chatItem.groupVo.groupNickName || props.chatItem.groupVo.name }}
                    </div>
                    <div class="item-time">
                        {{ lastMessageTime }}
                    </div>
                </div>
                <div v-if="props.chatItem.lastMessage" class="item-data-recent-message">
                    {{ props.chatItem.lastMessage.content }}
                </div>
            </div>
        </template>
    </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router';
import { formatLocalDateTimeToText } from '../assets/js/format'

const route = useRoute()
const props = defineProps(["chatItem"])

const isClick = computed(() => {
    return route.params.roomId == props.chatItem.roomId
})

const lastMessageTime = computed(() => {
    if (props.chatItem.lastMessage) {
        return formatLocalDateTimeToText(props.chatItem.lastMessage.createTime)
    } else {
        return formatLocalDateTimeToText(props.chatItem.createTime)
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