<template>
    <div class="info-container">
        <div class="info">
            <el-avatar :size="100" :src="currentGroupInfo.avatarUrl"></el-avatar>
            <div class="group-info">
                <span class="name"> {{ currentGroupInfo.name }} </span>
                <span class="more-info">群号：{{ currentGroupInfo.id }}</span>
            </div>
        </div>
        <div class="look-info">
            <div class="label">
                <el-icon>
                    <Document />
                </el-icon>
                <label>群介绍</label>
            </div>
            <div class="content" @click="handleOpenDescription">
                <span>{{ description }}</span>
                <el-icon class="icon">
                    <ArrowRight />
                </el-icon>
            </div>
        </div>
        <div class="look-info">
            <div class="label">
                <SvgIcon style="height: 1em;width: 1em;fill: black;" iconName="contacts" />
                <label>群成员（{{ currentGroupInfo.memberCount }}人）</label>
            </div>
        </div>
        <div class="avatar-list-container">
            <el-avatar :size="40" :src="groupLeaderAvatar" />
            <el-divider style="height: 100%;" direction="vertical" />
            <el-avatar v-for="(avatar, index) in groupMemberAvatar" :key="index" :size="40" :src="avatar" />
        </div>
        <div class="operation-container">
            <ButtonBox class="friend-info-button" @click="applyAddGroupDialogVisible = true">
                <SvgIcon iconName="plus" class="icon" />
                <div class="title">申请加入</div>
            </ButtonBox>
        </div>
    </div>
    <!-- 申请群对话框 -->
    <el-dialog v-model="applyAddGroupDialogVisible" title="申请加群" width="20%" append-to-body align-center
        @closed="closeApplyAddGroupDialog">
        <div class="group-info-container">
            <el-avatar :size="60" :src="currentGroupInfo.avatarUrl" />
            <div class="group-info">
                <span class="info-name"> {{ currentGroupInfo.name }} </span>
                <span class="info-id">{{ currentGroupInfo.id }}</span>
            </div>
        </div>
        <p>填写验证信息：</p>
        <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 4 }" maxlength="30" show-word-limit v-model="reason"
            placeholder="请输入添加理由..." />
        <template #footer>
            <el-button @click="applyAddGroupDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleApplyAddGroup">发送</el-button>
        </template>
    </el-dialog>
    <!-- 群介绍 -->
    <el-dialog v-model="descriptionDialogVisible" title="群介绍" width="30%" align-center destroy-on-close>
        <div class="description-container">
            <p>{{ description }}</p>
        </div>
    </el-dialog>
</template>

<script setup>
import ButtonBox from '../components/ButtonBox.vue';
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { applyAddGroup } from '../api/group';

const props = defineProps(['groupInfo'])

const currentGroupInfo = computed(() => {
    return props.groupInfo
})

const description = computed(() => {
    return currentGroupInfo.value.description || '群主很懒，还没有群介绍哦～'
})

const groupLeaderAvatar = computed(() => {
    return currentGroupInfo.value.memberAvatarUrl[0]
})

const groupMemberAvatar = computed(() => {
    return currentGroupInfo.value.memberAvatarUrl.slice(1)
})

const descriptionDialogVisible = ref(false)

const handleOpenDescription = () => {
    descriptionDialogVisible.value = true
}

const applyAddGroupDialogVisible = ref(false)
const reason = ref('')

const closeApplyAddGroupDialog = () => {
    reason.value = ''
}

const handleApplyAddGroup = () => {
    const applyData = {
        groupId: currentGroupInfo.value.id,
        reason: reason.value
    }
    applyAddGroup(applyData).then((res) => {
        if (res.code === 200) {
            ElMessage.success('申请已发送')
            applyAddGroupDialogVisible.value = false
        }
    }).catch((err) => {
        console.log(err)
        ElMessage.error('申请发送失败')
    })
}
</script>

<style lang="scss" scoped>
.info-container {
    width: 80%;
    height: 80%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;

    .info {
        width: 100%;
        display: flex;
        flex-direction: row;
        padding-bottom: 10px;
        border-bottom: 1px solid #ccc;

        .group-info {
            margin-left: 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 5px;

            .name {
                font-size: 25px;
                font-weight: bold;
            }

            .more-info {
                font-size: 16px;
                color: gray;
            }
        }
    }

    .avatar-list-container {
        width: 100%;
        height: 40px;
        display: flex;
        flex-direction: row;
        gap: 10px;
    }

    .look-info {
        width: 100%;
        height: 50px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        font-size: 16px;

        .label {
            width: 50%;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
        }

        .content {
            cursor: pointer;
            max-width: 50%;
            display: flex;
            flex-direction: row;
            align-items: center;

            span {
                // 超出部分隐藏
                overflow: hidden;
                // 超出部分显示省略号
                text-overflow: ellipsis;
                // 超出部分隐藏，并用...表示
                white-space: nowrap;
            }
        }
    }

    .operation-container {
        width: 100%;
        display: grid;
        grid-gap: 10px;
        margin-top: 10px;
        justify-items: center;
    }
}

.group-info-container {
    display: flex;
    flex-direction: row;
    align-items: center;

    .group-info {
        margin-left: 10px;
        display: flex;
        flex-direction: column;

        .info-name {
            font-size: 18px;
            font-weight: bold;
            color: #333333;
        }

        .info-id {
            font-size: 14px;
            color: #7a7a7a;
            margin-top: 5px;
        }
    }
}

.description-container {
    word-wrap: break-word;
    max-height: 300px;
    overflow-y: auto;
}
</style>