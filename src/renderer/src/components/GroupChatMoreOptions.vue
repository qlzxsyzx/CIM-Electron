<template>
    <div class="more-options-container">
        <div class="group-member-options-container">
            <div class="options-content">
                <span class="title">群聊成员</span>
                <div class="content">
                    <!-- 普通 -->
                    <template v-if="groupSetting.role === 1">
                        <template v-for="item in getSpliceMembers(3)">
                            <ButtonBox class="box">
                                <el-avatar :size="40" :src="item.userInfo.avatarUrl" />
                                <span class="name">{{ getMemberName(item) }}</span>
                            </ButtonBox>
                        </template>
                        <ButtonBox class="box" @click="handleInvite">
                            <el-icon>
                                <Plus />
                            </el-icon>
                            <span class="name">邀请</span>
                        </ButtonBox>
                    </template>
                    <template v-else>
                        <template v-for="item in getSpliceMembers(2)">
                            <ButtonBox class="box">
                                <el-avatar :size="40" :src="item.userInfo.avatarUrl" />
                                <span class="name">{{ getMemberName(item) }}</span>
                            </ButtonBox>
                        </template>
                        <ButtonBox class="box" @click="handleInvite">
                            <el-icon>
                                <Plus />
                            </el-icon>
                            <span class="name">邀请</span>
                        </ButtonBox>
                        <ButtonBox class="box" @click="handleRemoveMember">
                            <el-icon>
                                <Minus />
                            </el-icon>
                            <span class="name">移出</span>
                        </ButtonBox>
                    </template>
                </div>
            </div>
        </div>
        <template v-if="groupSetting.role === 3">
            <div class="input-option-container">
                <span class="title">群聊名称</span>
                <div class="single-options-container">
                    <div class="input-options">
                        <el-input v-model="groupName" placeholder="填写群名称" show-word-limit maxlength="20"
                            @change="handleModifyGroupName"></el-input>
                    </div>
                </div>
            </div>
        </template>
        <div class="input-option-container">
            <span class="title">我的本群昵称</span>
            <div class="single-options-container">
                <div class="input-options">
                    <el-input v-model="userNickName" placeholder="填写我的本群昵称" show-word-limit maxlength="20"
                        @change="handleModifyUserNickName"></el-input>
                </div>
            </div>
        </div>
        <div class="input-option-container">
            <span class="title">群聊备注</span>
            <div class="single-options-container">
                <div class="input-options">
                    <el-input v-model="remark" placeholder="填写备注" show-word-limit maxlength="20"
                        @change="handleModifyRemark"></el-input>
                </div>
            </div>
        </div>
        <div class="single-options-container">
            <div class="switch-options">
                <span>消息置顶</span>
                <el-switch v-model="currentChatInfo.top" :active-value="1" :inactive-value="0"
                    @change="handleTop"></el-switch>
            </div>
        </div>
        <div class="single-options-container">
            <div class="switch-options">
                <span>消息免打扰</span>
                <el-switch v-model="groupSetting.status" :active-value="0" :inactive-value="1"
                    @change="handleStatus"></el-switch>
            </div>
        </div>
        <template v-if="groupSetting.role !== 1">
            <div class="single-options-container">
                <div class="switch-options">
                    <span>全员禁言</span>
                    <el-switch v-model="group.noSpeak" :active-value="1" :inactive-value="0"
                        @change="handleNoSpeak"></el-switch>
                </div>
            </div>
        </template>
        <template v-if="groupSetting.role === 3">
            <div class="single-options-container">
                <div class="button-options" @click="transferGroup">
                    <a>转让群聊</a>
                </div>
            </div>
            <div class="single-options-container">
                <div class="button-options danger" @click="dismissGroup">
                    <a>解散群聊</a>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="single-options-container">
                <div class="button-options danger" @click="exitGroup">
                    <a>退出群聊</a>
                </div>
            </div>
        </template>
    </div>
    <!-- 转让群聊dialog -->
    <el-dialog v-model="transferDialogVisible" title="转让群聊" width="30%" append-to-body>
        <TransferGroup v-if="transferDialogVisible" :groupId="group.id" />
    </el-dialog>
    <!-- 邀请dialog -->
    <el-dialog v-model="inviteDialogVisible" title="邀请好友" width="50%" append-to-body>
        <GroupInvite v-if="inviteDialogVisible" :groupId="group.id" @close="handleCloseInvite"/>
    </el-dialog>
    <!-- 移除dialog -->
    <el-dialog v-model="kickDialogVisible" width="50%" append-to-body>
        <GroupKick v-if="kickDialogVisible" :groupId="group.id" @close="handleCloseKick"/>
    </el-dialog>
</template>
<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useChatStore } from '../store/chatStore';
import { useGroupStore } from '../store/groupStore';
import { useFriendStore } from '../store/friendStore';
import { topChat } from '../api/chat';
import { updateGroupRemark, updateUserNickName, updateGroupPromptStatus, updateGroupNoSpeakStatus } from '../api/group'
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { validRemark, validGroupName } from '../assets/js/regex-validate'
import ButtonBox from '../components/ButtonBox.vue';
import TransferGroup from '../components/TransferGroup.vue';
import GroupInvite from '../components/GroupInvite.vue';
import GroupKick from '../components/GroupKick.vue';

const router = useRouter();
const chatStore = useChatStore();
const groupStore = useGroupStore();
const friendStore = useFriendStore();
const props = defineProps(['groupMembers'])

const groupName = ref('');
const userNickName = ref('');
const remark = ref('');

onBeforeMount(() => {
    groupName.value = group.value.name;
    userNickName.value = groupSetting.value.userNickName;
    remark.value = groupSetting.value.groupNickName
})

const currentChatInfo = computed(() => {
    return chatStore.currentChatInfo.recentChat
})

const group = computed(() => {
    return groupStore.currnetGroupInfo
})

const groupSetting = computed(() => {
    return groupStore.findMyGroupSettingByGroupId(currentChatInfo.value.groupId)
})

const getSpliceMembers = (endIndex) => {
    const members = Array.from(props.groupMembers)
    return members.splice(0, endIndex)
}

const getMemberName = (item) => {
    const friend = friendStore.findFriendByUserId(item.userId)
    const userInfo = item.userInfo
    if (friend) {
        return friend.remark || item.userNickName || userInfo.name;
    } else {
        return item.userNickName || userInfo.name;
    }
}

const inviteDialogVisible = ref(false);

const handleInvite = () => {
    inviteDialogVisible.value = true;
}

const handleCloseInvite = () => {
    inviteDialogVisible.value = false;
}

const kickDialogVisible = ref(false);

const handleRemoveMember = () => {
    kickDialogVisible.value = true;
}

const handleCloseKick = () => {
    kickDialogVisible.value = false;
}

const handleModifyGroupName = () => {
    if (!groupName.value) {
        ElMessage.error('群名称不能为空');
        return;
    }
    if (groupName.value === group.value.name) {
        return;
    }
    if (!validGroupName(groupName.value)) {
        ElMessage.error('群名称不能包含空格等特殊字符且长度为1-20');
        return;
    }
    groupStore.updateGroupName(group.value.id, groupName.value).then(res => {
        if (res.code === 200) {
            ElMessage.success('修改成功');
        }
    }).catch(err => {
        ElMessage.error('修改失败');
    })
}

const handleModifyUserNickName = () => {
    if (userNickName.value === groupSetting.value.userNickName) {
        return;
    }
    if (!validRemark(userNickName.value)) {
        ElMessage.error('我的本群昵称不能包含空格等特殊字符且长度为0-20');
        return;
    }
    updateUserNickName(groupSetting.value.id, userNickName.value).then(res => {
        if (res.code === 200) {
            ElMessage.success('修改成功');
            groupSetting.value.userNickName = userNickName.value;
        }
    }).catch(err => {
        ElMessage.error('修改失败');
    })
}

const handleModifyRemark = () => {
    if (remark.value === groupSetting.value.groupNickName) {
        return;
    }
    if (!validRemark(remark.value)) {
        ElMessage.error('备注不能包含空格等特殊字符且长度为0-20')
        return;
    } else {
        updateGroupRemark(groupSetting.value.id, remark.value).then(res => {
            if (res.code === 200) {
                ElMessage.success('修改成功')
                groupSetting.value.groupNickName = remark.value
            }
        }).catch(err => {
            ElMessage.error('修改失败')
        })
    }
}

const handleTop = (num) => {
    // 请求置顶
    topChat(currentChatInfo.value.id, num).then(res => {
        if (res.code !== 200) {
            currentChatInfo.value.top = !currentChatInfo.value.top;
        }
    }).catch(err => {
        currentChatInfo.value.top = !currentChatInfo.value.top;
    })
}

const handleStatus = (num) => {
    // 请求修改消息提示状态
    updateGroupPromptStatus(groupSetting.value.id, num).then(res => {
        if (res.code !== 200) {
            groupSetting.value.status = !groupSetting.value.status;
        }
    }).catch(err => {
        groupSetting.value.status = !groupSetting.value.status;
    })
}

const handleNoSpeak = (num) => {
    updateGroupNoSpeakStatus(group.value.id, num).then(res => {
        if (res.code !== 200) {
            group.value.noSpeak = !group.value.noSpeak;
        }
    }).catch(err => {
        group.value.noSpeak = !group.value.noSpeak;
    })
}

const transferDialogVisible = ref(false)

const transferGroup = () => {
    transferDialogVisible.value = true
}

const dismissGroup = () => {
    ElMessageBox.confirm(
        '确定要解散该群聊吗？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        groupStore.dismissGroup(group.value.id).then(res => {
            if (res.code === 200) {
                ElMessage.success('解散成功');
                router.push('/chat/home');
            }
        }).catch(err => {
            console.log(err);
            ElMessage.error('解散失败');
        })
    }).catch((err) => {
        console.log(err);
    })
}

const exitGroup = () => {
    ElMessageBox.confirm(
        '确定要退出该群聊吗？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        groupStore.exitGroup(group.value.id).then(res => {
            if (res.code === 200) {
                ElMessage.success('退出成功');
                router.push('/chat/home');
            }
        }).catch(err => {
            console.log(err);
            ElMessage.error('退出失败');
        })
    }).catch((err) => {
        console.log(err);
    })
}

</script>
<style lang="scss" scoped>
.more-options-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .group-member-options-container {
        background-color: white;
        border-radius: 5px;
        height: 140px;

        .options-content {
            display: flex;
            flex-direction: column;
            padding: 10px;

            .title {
                margin: 10px;
            }

            .content {
                flex: 1;
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 5px;

                .box {
                    height: 70px;
                    padding: 0;

                    &:hover {
                        background-color: #dcdfe6;
                    }

                    .name {
                        max-width: 50px;
                        font-size: 14px;
                        color: #909399;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }
            }
        }
    }

    .input-option-container {
        display: flex;
        flex-direction: column;

        .title {
            font-size: 14px;
            color: #999;
            margin-left: 10px;
            padding: 5px;
        }

        .input-options {
            height: 100%;
            display: flex;
            align-items: center;
            flex: 1;
            padding: 0 10px;

            :deep(.el-input__wrapper) {
                box-shadow: none;
                border-radius: 0;
                border-bottom: 2px solid #ffffff;

                &:hover {
                    // 底部出现蓝色下划线
                    border-bottom: 2px solid #409EFF;
                }

                &:focus-within {
                    // 底部出现蓝色下划线
                    border-bottom: 2px solid #409EFF;
                }
            }
        }

    }

    .single-options-container {
        display: flex;
        flex-direction: row;
        background-color: white;
        border-radius: 5px;
        height: 40px;
        align-items: center;

        .button-options {
            height: 100%;
            flex: 1;
            display: flex;
            flex-direction: row;
            align-items: center;
            cursor: pointer;

            a {
                margin-left: 10px;
            }

            &:hover {
                background-color: #f5f7fa;
                cursor: pointer;
            }

            &.danger {
                color: #F56C6C;
                justify-content: center;

                a {
                    margin-left: 0;
                }
            }
        }

        .switch-options {
            margin: 0 10px;
            height: 100%;
            flex: 1;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
        }
    }
}
</style>