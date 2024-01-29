<template>
    <div class="friend-item-container" :class="{'click' : isClick}" @click="openFriendInfo()">
        <div class="item-avatar-container">
            <el-avatar class="avatar" :src="props.friend.userVo.avatarUrl"/>
        </div>
        <div class="item-data-container">
            <div class="item-name">
                {{ props.friend.remark || props.friend.userVo.name}}
            </div>
        </div>
    </div>
</template>
<script setup>
import {ref,computed} from 'vue'
import { useRouter,useRoute } from 'vue-router';

const route = useRoute()
const router = useRouter()

const props = defineProps(["friend"])

const isClick = computed(() =>{
    return route.params.friendId == props.friend.id
})
const openFriendInfo =() => {
    router.push({path: '/friend/info/'+ props.friend.id})
}
</script>
<style lang="scss" scoped>
.friend-item-container {
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

    &:hover {background-color: #5f5f5f27;}

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
        justify-content: center;

        .item-name {
            width: 150px;
            white-space: nowrap; /* 防止文字换行 */
            overflow: hidden; /* 隐藏超出容器的内容 */
            text-overflow: ellipsis; /* 显示省略号 */
            color: black;
            font-weight: 500;
            font-size: 20px;
        }
    }
}
</style>