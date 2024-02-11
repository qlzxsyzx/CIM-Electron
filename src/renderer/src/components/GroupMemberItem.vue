<template>
    <div class="member-item">
        <div class="info">
            <el-avatar :size="30" :src="userInfo.avatarUrl"></el-avatar>
            <span class="name">{{ name }}</span>
            <template v-if="member.role === 3">
                <div class="role-tag">
                    <el-tag type="warning">群主</el-tag>
                </div>
            </template>
            <template v-if="member.role === 2">
                <div class="role-tag">
                    <el-tag type="primary">管理员</el-tag>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { useFriendStore } from '../store/friendStore';
import { computed } from 'vue';

const props = defineProps(["member"]);
const friendStore = useFriendStore();

const friend = computed(() => friendStore.findFriendByUserId(member.value.userId));

const member = computed(() => props.member);

const userInfo = computed(() => props.member.userInfo);

const name = computed(() => {
    if (friend.value) {
        return friend.value.remark || member.userNickName || userInfo.value.name;
    } else {
        return member.userNickName || userInfo.value.name;
    }
});
</script>

<style lang="scss" scoped>
.member-item {
    height: 30px;
    display: flex;
    flex-direction: row;
    align-items: center;
    border-radius: 5px;
    padding: 5px 5px;

    &:hover {
        background-color: #d3d3d3;
    }

    .info {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;

        .name {
            margin-left: 10px;
            font-size: 14px;
            color: #909399;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}
</style>