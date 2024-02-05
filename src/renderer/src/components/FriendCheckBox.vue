<template>
    <div class="friend-check-box-container" @click="handleClick">
        <input class="friend-check-box" type="checkbox" :checked="props.checked" />
        <el-avatar class="friend-check-box-avatar" :size="50" :src="userInfo.avatarUrl" />
        <span class="friend-check-box-name">{{ name }}</span>
    </div>
</template>

<script setup>
import { useUserInfoStore } from '../store/userInfoStore'
import { computed } from 'vue'

const props = defineProps(['friend','checked'])
const userInfoStore = useUserInfoStore()

const emit = defineEmits(['check'])

const userInfo = computed(() => {
    return userInfoStore.getUserInfo(props.friend.friendId)
})

const name = computed(() => {
    if(props.friend.remark) {
        return props.friend.remark
    }else {
        return userInfo.value.name
    }
})

const handleClick = () => {
    emit('check', props.friend)
}
</script>

<style lang="scss" scoped>
.friend-check-box-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-radius: 5px;
    padding: 10px;
    cursor: default;
    margin-right: 10px;

    &:hover {
        background-color: #83808038;
    }

    /* 隐藏原始的复选框 */
    .friend-check-box {
        -webkit-appearance: none;
        /* 调整复选框的大小 */
        width: 20px;
        height: 20px;
        /* 设置边框 */
        border: 1px solid #ccc;
        /* 设置背景颜色 */
        background-color: #fff;
        /* 调整内边距 */
        padding: 5px;
        /* 调整边框radius */
        border-radius: 50%;
        position: relative;

    }

    /* 当复选框被选中时，改变自定义样式 */
    .friend-check-box:checked {
        /* 调整边框颜色 */
        border-color: #007bff;
        /* 调整背景颜色 */
        background-color: #007bff;

        /* 调整复选框的内部图标 */
        &::after {
            transform: rotate(45deg) scaleY(1);
            box-sizing: content-box;
            content: "";
            border: 2px solid #fff;
            border-left: 0;
            border-top: 0;
            height: 10px;
            left: 7px;
            position: absolute;
            top: 2px;
            width: 4px;
            transition: transform 0.15s ease-in 0.05s;
            transform-origin: center;
        }
    }

    .friend-check-box-avatar {
        margin-left: 10px;
    }

    .friend-check-box-name {
        margin-left: 10px;
        font-size: 20px;
        color: #333;
        font-weight: 500;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 200px;
    }
}
</style>