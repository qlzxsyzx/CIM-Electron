<template>
    <div class="group-item-container" :class="{'click' : isClick}" @click="openGroupInfo()">
        <div class="item-avatar-container">
            <el-avatar class="avatar" :src="props.group.avatarUrl"/>
        </div>
        <div class="item-data-container">
            <div class="item-name">
                {{ name}}
            </div>
        </div>
    </div>
</template>
<script setup>
import {ref,computed} from 'vue'
import { useRouter,useRoute } from 'vue-router';
import { useGroupStore } from '../store/groupStore'

const route = useRoute()
const router = useRouter()
const groupStore = useGroupStore()

const props = defineProps(["group"])

const isClick = computed(() =>{
    return route.params.groupId == props.group.id
})

const name = computed(() =>{
    const groupSetting = groupStore.findMyGroupSettingByGroupId(props.group.id)
    return groupSetting.groupNickName || props.group.name
})

const openGroupInfo =() => {
    router.push({path: '/group/info/'+ props.group.id})
}
</script>
<style lang="scss" scoped>
.group-item-container {
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