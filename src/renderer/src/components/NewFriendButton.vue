<template>
    <div class="tool-container" @click="openApplyFriendMessageDialog">
        <SvgIcon iconName="bg-new-friend" class="tool-icon" />
        <div class="tool-name">新的朋友</div>
    </div>

    <!-- 新的朋友dialog -->
    <el-dialog v-model="applyFriendMessageDialog.visible" title="好友申请" width="30%" align-center>
        <!-- 申请信息展示 -->
        <div class="apply-info-container">
            <template v-for="item in applyFriendMessageDialog.result" :key="item.id">
                <ApplyFriendMessage :apply-message="item" @handleAgreeApply="handleAgreeApply" @handleRefuseApply="handleRefuseApply" />
            </template>
        </div>
        <!-- 同意好友申请dialog -->
        <el-dialog v-model="applyFriendMessageDialog.agreeApplyDialogVisible" title="同意申请" width="20%" @closed="handleAgreeApplyDialogClose" align-center>
            <div class="user-info-container">
                <el-avatar :size="60" :src="applyFriendMessageDialog.agreeApplyDialogInfo.userVo.avatarUrl" />
                <div class="user-info">
                    <span class="info-name"> {{ applyFriendMessageDialog.agreeApplyDialogInfo.userVo.name }} </span>
                    <span class="info-username">账号： {{ applyFriendMessageDialog.agreeApplyDialogInfo.userVo.username }}</span>
                </div>
            </div>
            <p>备注：</p>
            <el-input v-model="applyFriendMessageDialog.agreeApplyForm.remark" placeholder="请输入备注..." />
            <template #footer>
                <el-button @click="applyFriendMessageDialog.agreeApplyDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleAddFriend">确定</el-button>
            </template>
        </el-dialog>
    </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../store/userStore';
import ApplyFriendMessage from './ApplyFriendMessage.vue';
import { getApplyFriendMessageList,agreeAddFriend,refuseAddFriend } from '../api/friend';

const userStore = useUserStore()

const applyFriendMessageDialog = reactive({
    visible: false,
    result: [],
    nullMessage: '暂无好友申请',
    agreeApplyDialogVisible: false,
    agreeApplyForm: {
        remark: ''
    },
    agreeApplyDialogInfo: null
})

const openApplyFriendMessageDialog = () => {
    applyFriendMessageDialog.visible = true
    getApplyFriendMessageList().then(res => {
        applyFriendMessageDialog.result = res.data
    }).catch(err => {
        ElMessage.error(err.message)
    })
}

const handleAgreeApply = (row) => {
    applyFriendMessageDialog.agreeApplyDialogInfo = row
    applyFriendMessageDialog.agreeApplyDialogVisible = true
}

const handleAgreeApplyDialogClose = () => {
    applyFriendMessageDialog.agreeApplyForm.remark = ''
}

const handleAddFriend = () => {
    console.log('同意申请')
    const agreeApplyFriendMessageDto = {
        applyFriendMessageId: applyFriendMessageDialog.agreeApplyDialogInfo.id,
        remark: applyFriendMessageDialog.agreeApplyForm.remark
    }
    agreeAddFriend(agreeApplyFriendMessageDto).then(res => {
        if (res.code === 200) {
            ElMessage.success('添加成功')
            applyFriendMessageDialog.agreeApplyDialogInfo.status = 1
            applyFriendMessageDialog.agreeApplyDialogVisible = false
            applyFriendMessageDialog.agreeApplyForm.remark = ''
        }
    }).catch(err => {
        ElMessage.error(err.message)
    })
}

const handleRefuseApply = (row) => {
    console.log('拒绝申请', row)
    refuseAddFriend(row.id).then(res => {
        if (res.code === 200) {
            ElMessage.success('拒绝成功')
            row.status = -1
        }
    }).catch(err => {
        ElMessage.error(err.message)
    })
}


</script>

<style lang="scss" scoped>
.tool-container {
    padding: 20px;
    border-radius: 5px;
    text-align: center;
    cursor: pointer;

    &:hover {
        background-color: #e9e9e9;
    }

    .tool-icon {
        width: 50px;
        height: 50px;
        margin-bottom: 10px;
    }

    .tool-name {
        font-size: 18px;
        font-weight: bold;
        color: #7a7a7a;
    }
}

.apply-info-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 300px;
    overflow-y: auto;
}

.user-info-container {
    display: flex;
    flex-direction: row;
    align-items: center;

    .user-info {
        margin-left: 10px;
        display: flex;
        flex-direction: column;

        .info-name {
            font-size: 18px;
            font-weight: bold;
            color: #333333;
        }

        .info-username {
            font-size: 14px;
            color: #7a7a7a;
            margin-top: 5px;
        }
    }
}
</style>