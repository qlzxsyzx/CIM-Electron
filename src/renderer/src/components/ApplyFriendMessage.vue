<template>
    <div class="user-info-container">
        <el-avatar :size="60" :src="props.applyMessage.userVo.avatarUrl" />
        <div class="user-info">
            <span class="info-name"> {{ props.applyMessage.userVo.name }} </span>
            <template v-if="props.applyMessage.userVo.userId === props.applyMessage.toUserId">
                <span class="info-apply-reason">我：{{ props.applyMessage.applyReason }}</span>
            </template>
            <template v-else>
                <span class="info-apply-reason">{{ props.applyMessage.applyReason }}</span>
            </template>
        </div>
        <!-- 我的申请-->
        <template v-if="props.applyMessage.userVo.userId === props.applyMessage.toUserId">
            <template v-if="props.applyMessage.status === 0">
                <span class="apply-message-status">等待验证</span>
            </template>
        </template>
        <template v-else>
            <template v-if="props.applyMessage.status === 0">
                <div class="apply-message-operation">
                    <el-button type="primary" @click="openAgreeDialog">通过</el-button>
                    <el-button type="danger" @click="handleRefuseApply">拒绝</el-button>
                </div>
            </template>
        </template>
        <template v-if="props.applyMessage.status === 1">
            <span class="apply-message-status">已通过</span>
        </template>
        <template v-else-if="props.applyMessage.status === -1">
            <span class="apply-message-status">已拒绝</span>
        </template>
        <template v-else-if="props.applyMessage.status === 2">
            <span class="apply-message-status">已过期</span>
        </template>
    </div>
</template>

<script setup>
const props = defineProps(['applyMessage'])

const emits = defineEmits(['handleRefuseApply', 'handleAgreeApply'])

const openAgreeDialog = () => {
    emits('handleAgreeApply', props.applyMessage)
}

const handleRefuseApply = () => {
    emits('handleRefuseApply', props.applyMessage)
}
</script>

<style lang="scss" scoped>
.user-info-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-bottom: 1px solid var(--el-color-info-light-5);
    padding: 10px;
    border-radius: 5px;

    &:hover {
        background-color: #5f5f5f27;
    }

    .user-info {
        margin-left: 10px;
        display: flex;
        flex-direction: column;

        .info-name {
            font-size: 18px;
            font-weight: bold;
            color: #333333;
        }

        .info-apply-reason {
            font-size: 14px;
            color: #7a7a7a;
            margin-top: 5px;
        }
    }

    .apply-message-operation {
        margin-left: auto;
    }

    .apply-message-status {
        font-size: 14px;
        color: #7a7a7a;
        margin-left: auto;
        font-weight: bold;
        cursor: default;
    }
}
</style>