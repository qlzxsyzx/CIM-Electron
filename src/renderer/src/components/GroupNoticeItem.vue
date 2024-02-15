<template>
    <div class="item-container" @mouseenter="isHover = true" @mouseleave="isHover = false">
        <div class="notice-title">
            <span class="name">{{ getMemberName(props.notice) }}</span>
            <span class="time">{{ formatLocalDateTimeToText(props.notice.updateTime) }}</span>
            <template v-if="props.groupSetting.role !== 1 && isHover">
                <el-icon class="icon" @click="handleEditNotice">
                    <EditPen />
                </el-icon>
                <el-icon class="icon" @click="handleRemoveNotice">
                    <Delete />
                </el-icon>
            </template>
        </div>
        <div class="notice-content">
            <div class="text" ref="text">
                <span ref="contentSpan">{{ props.notice.content }}</span>
            </div>
            <div class="image-container" v-if="props.notice.image">
                <img :src="props.notice.image" class="image">
            </div>
        </div>
        <template v-if="isNeedExpand">
            <div class="operation">
                <template v-if="!isExpand">
                    <div class="expand" @click="handleExpand">
                        展开
                        <el-icon>
                            <ArrowDown />
                        </el-icon>
                    </div>
                </template>
                <template v-else>
                    <div class="expand" @click="handleUpClose">
                        收起
                        <el-icon>
                            <ArrowUp />
                        </el-icon>
                    </div>
                </template>
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useGroupStore } from '../store/groupStore'
import { useFriendStore } from '../store/friendStore';
import { formatLocalDateTimeToText } from '../assets/js/format';
import { getMemberInfo } from '../api/group';


const groupStore = useGroupStore()
const friendStore = useFriendStore();
const props = defineProps(['notice', 'groupSetting'])
const emits = defineEmits(['edit', 'remove'])

const text = ref(null)
const contentSpan = ref(null)
const isHover = ref(false)
const isNeedExpand = ref(false)
const isExpand = ref(false)

onMounted(() => {
    // 检查contentSpan高度
    const height = contentSpan.value.offsetHeight
    if (height > 100) {
        isNeedExpand.value = true
    } else {
        isNeedExpand.value = false
    }
})

const handleExpand = () => {
    // 改变text的class
    isExpand.value = !isExpand.value
    text.value.classList.add('text-expand')
}

const handleUpClose = () => {
    isExpand.value = !isExpand.value
    text.value.classList.remove('text-expand')
}

// 修改公告
const handleEditNotice = () => {
    emits('edit', props.notice)
}

const handleRemoveNotice = () => {
    emits('remove', props.notice.id)
}

const getMemberName = (item) => {
    const friend = friendStore.findFriendByUserId(item.userId)
    const member = groupStore.getMemberByGroupIdAndUserId(item.groupId, item.userId)
    if (friend) {
        return friend.remark || member.userNickName || member.userInfo.name;
    } else {
        if (member) {
            return member.userNickName || member.userInfo.name;
        } else {
            getMemberInfo(item.groupId, item.userId).then(res => {
                if (res.code === 200) {
                    return res.data.userNickName || res.data.remark || res.data.name
                }
            })
            return ''
        }
    }
}
</script>

<style lang="scss" scoped>
.item-container {
    padding: 10px;
    display: flex;
    flex-direction: column;

    &:hover {
        background-color: #0000000d;
    }

    .notice-title {
        width: 100%;
        height: 30px;
        display: flex;
        flex-direction: row;
        align-items: center;
        font-size: 14px;
        color: var(--el-color-info);

        .name {
            max-width: 50%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .time {
            margin-left: 10px;
        }

        .icon {
            margin-left: 10px;
            cursor: pointer;

            &:hover {
                color: var(--el-color-primary);
            }
        }
    }

    .notice-content {
        display: flex;
        flex-direction: row;
        flex: 1;

        .text {
            flex: 1;
            line-height: 20px;
            overflow: hidden;
            text-overflow: ellipsis;
            word-wrap: break-word;
            display: -webkit-box;
            -webkit-line-clamp: 5;
            -webkit-box-orient: vertical;
            white-space: pre-line
        }

        .text-expand {
            -webkit-line-clamp: unset;
        }

        .image-container {
            margin-left: 10px;

            .image {
                max-height: 120px;
                width: 120px;
                object-fit: contain;
            }
        }
    }

    .operation {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;

        .expand {
            display: flex;
            flex-direction: row;
            align-items: center;
            color: #409eff;
            cursor: pointer;
        }
    }
}
</style>