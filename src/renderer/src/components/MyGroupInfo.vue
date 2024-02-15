<template>
    <div class="info-container">
        <div class="more">
            <el-dropdown trigger="click" placement="right" @command="handleCommand">
                <div>
                    <ButtonBox class="more">
                        <SvgIcon iconName="more" style="width: 25px;"></SvgIcon>
                    </ButtonBox>
                </div>
                <template #dropdown>
                    <template v-if="groupSetting.role === 3">
                        <el-dropdown-item command="1">转让群聊</el-dropdown-item>
                        <el-dropdown-item command="2">解散群聊</el-dropdown-item>
                    </template>
                    <template v-else>
                        <el-dropdown-item command="3">退出群聊</el-dropdown-item>
                    </template>
                </template>
            </el-dropdown>
        </div>
        <div class="info">
            <template v-if="groupSetting.role === 3">
                <CropperAvatar class="update-group-avatar" :data-info="{ img: currentGroupInfo.avatarUrl }"
                    @upload-success="handleUpdateGroupAvatar" />
                <div class="group-info">
                    <template v-if="isModifyName">
                        <el-input ref="nameInput" v-model="modifyName" placeholder="请输入群名称" show-word-limit maxlength="20"
                            autofocus @blur="isModifyName = false" @change="handleModifyName"></el-input>
                    </template>
                    <template v-else>
                        <div class="modify-name" @mouseenter="isHover = true" @mouseleave="isHover = false">
                            <span class="name"> {{ currentGroupInfo.name }} </span>
                            <el-icon v-show="isHover" class="edit" @click="handleClickModifyName(currentGroupInfo.name)">
                                <Edit />
                            </el-icon>
                        </div>
                    </template>
                    <span class="more-info">群号：{{ currentGroupInfo.id }}</span>
                </div>
            </template>
            <template v-else>
                <el-avatar :size="100" :src="currentGroupInfo.avatarUrl"></el-avatar>
                <div class="group-info">
                    <span class="name"> {{ currentGroupInfo.name }} </span>
                    <span class="more-info">群号：{{ currentGroupInfo.id }}</span>
                </div>
            </template>
        </div>
        <div class="modifiable-info">
            <div class="label">
                <el-icon>
                    <Edit />
                </el-icon>
                <label>备注</label>
            </div>
            <div class="input">
                <template v-if="isModifyRemark">
                    <el-input ref="remarkInput" v-model="modifyRemark" placeholder="请输入备注" show-word-limit maxlength="20"
                        autofocus @blur="isModifyRemark = false" @change="handleModifyRemark"></el-input>
                </template>
                <template v-else>
                    <template v-if="groupSetting.groupNickName">
                        <span class="remark" @click="handleClickModifyRemark(groupSetting.groupNickName)">{{
                            groupSetting.groupNickName }}</span>
                    </template>
                    <template v-else>
                        <span class="no-remark" @click="handleClickModifyRemark('')">设置群聊备注</span>
                    </template>
                </template>
            </div>
        </div>
        <div class="modifiable-info">
            <div class="label">
                <el-icon>
                    <User />
                </el-icon>
                <label>我的本群昵称</label>
            </div>
            <div class="input">
                <template v-if="isModifyUserNickName">
                    <el-input ref="userNickNameInput" v-model="modifyUserNickName" placeholder="请输入群昵称" show-word-limit
                        maxlength="20" autofocus @blur="isModifyUserNickName = false"
                        @change="handleModifyUserNickName"></el-input>
                </template>
                <template v-else>
                    <template v-if="groupSetting.userNickName">
                        <span class="remark" @click="handleClickModifyUserNickName(groupSetting.userNickName)">{{
                            groupSetting.userNickName }}</span>
                    </template>
                    <template v-else>
                        <span class="no-remark" @click="handleClickModifyUserNickName('')">编辑群昵称</span>
                    </template>
                </template>
            </div>
        </div>
        <div class="modifiable-info">
            <div class="label">
                <el-icon>
                    <Bell />
                </el-icon>
                <label>消息免打扰</label>
            </div>
            <el-switch v-model="groupSetting.status" width="60" :active-value="0" :inactive-value="1"
                @change="handleChangePromptStatus" />
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
                <SvgIcon style="height: 1em;width: 1em;fill: black;" iconName="horn" />
                <label>群公告</label>
            </div>
            <div class="content" @click="handleClickNoticeDialog">
                <span>{{ notice }}</span>
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
            <ButtonBox class="friend-info-button" @click="handleClickMessage(currentGroupInfo)">
                <SvgIcon iconName="messages" class="icon" />
                <div class="title">发消息</div>
            </ButtonBox>
        </div>
    </div>
    <!-- 群介绍 -->
    <el-dialog v-model="descriptionDialogVisible" title="群介绍" width="30%" align-center destroy-on-close>
        <div class="description-container">
            <p>{{ description }}</p>
        </div>
    </el-dialog>
    <el-dialog v-model="noticeDialogVisible" title="群公告" width="400" destroy-on-close>
        <GroupNotice />
    </el-dialog>
</template>

<script setup>
import ButtonBox from '../components/ButtonBox.vue';
import { useRoute, useRouter } from 'vue-router';
import { useChatStore } from '../store/chatStore';
import { useGroupStore } from '../store/groupStore'
import { useUserInfoStore } from '../store/userInfoStore';
import { ref, computed, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { validRemark, validGroupName } from '../assets/js/regex-validate'
import { updateGroupRemark, updateUserNickName, updateGroupPromptStatus } from '../api/group'
import GroupNotice from '../components/GroupNotice.vue';
import CropperAvatar from './CropperAvatar.vue';

const props = defineProps(['groupInfo'])

const route = useRoute();
const router = useRouter();
const chatStore = useChatStore();
const groupStore = useGroupStore();
const userInfoStore = useUserInfoStore();
const isHover = ref(false);

const currentGroupInfo = computed(() => {
    return props.groupInfo
})

const groupSetting = computed(() => {
    return groupStore.findMyGroupSettingByGroupId(currentGroupInfo.value.id)
})

const description = computed(() => {
    return currentGroupInfo.value.description || '群主很懒，还没有群介绍哦～'
})

const notice = computed(() => {
    if (currentGroupInfo.value.latestNotice) {
        const latestNotice = currentGroupInfo.value.latestNotice
        if (latestNotice.image) {
            return '【图片】' + latestNotice.content
        } else {
            return latestNotice.content
        }
    } else {
        return '暂无群公告'
    }
})

const groupLeaderAvatar = computed(() => {
    return currentGroupInfo.value.memberAvatarUrl[0]
})

const groupMemberAvatar = computed(() => {
    return currentGroupInfo.value.memberAvatarUrl.slice(1)
})

const isModifyName = ref(false);
const modifyName = ref('');
const nameInput = ref(null);

const handleClickModifyName = async (oldValue) => {
    modifyName.value = oldValue;
    isModifyName.value = true;
    await nextTick()
    nameInput.value.focus();
}

const handleModifyName = () => {
    if (modifyName.value === currentGroupInfo.value.name) {
        return;
    }
    if (!validGroupName(modifyName.value)) {
        ElMessage.error('群名称不能包含空格等特殊字符且长度为1-20')
        return;
    } else {
        currentGroupInfo.value.name = modifyName.value
        groupStore.updateGroupName(currentGroupInfo.value.id, modifyName.value).then(res => {
            if (res.code === 200) {
                ElMessage.success('修改成功')
                isModifyName.value = false;
            }
        }).catch(err => {
            console.log(err);
            ElMessage.error('修改失败')
        })
    }
}

const isModifyRemark = ref(false);
const modifyRemark = ref('');
const remarkInput = ref(null);

const handleClickModifyRemark = async (oldValue) => {
    modifyRemark.value = oldValue;
    isModifyRemark.value = true;
    await nextTick()
    remarkInput.value.focus();
}

const handleModifyRemark = () => {
    if (modifyRemark.value === groupSetting.value.groupNickName) {
        return;
    }
    if (!validRemark(modifyRemark.value)) {
        ElMessage.error('备注不能包含空格等特殊字符且长度为0-20')
        return;
    } else {
        updateGroupRemark(groupSetting.value.id, modifyRemark.value).then(res => {
            if (res.code === 200) {
                ElMessage.success('修改成功')
                isModifyRemark.value = false;
                groupSetting.value.groupNickName = modifyRemark.value
            }
        }).catch(err => {
            console.log(err);
            ElMessage.error('修改失败')
        })
    }
}

const isModifyUserNickName = ref(false);
const modifyUserNickName = ref('');
const userNickNameInput = ref(null);

const handleClickModifyUserNickName = async (oldValue) => {
    modifyUserNickName.value = oldValue;
    isModifyUserNickName.value = true;
    await nextTick()
    userNickNameInput.value.focus();
}

const handleModifyUserNickName = () => {
    if (modifyUserNickName.value === groupSetting.value.userNickName) {
        return;
    }
    if (!validRemark(modifyUserNickName.value)) {
        ElMessage.error('群昵称不能包含空格等特殊字符且长度为0-20')
        return;
    } else {
        updateUserNickName(groupSetting.value.id, modifyUserNickName.value).then(res => {
            if (res.code === 200) {
                ElMessage.success('修改成功')
                isModifyUserNickName.value = false;
                groupSetting.value.userNickName = modifyUserNickName.value
            }
        }).catch(err => {
            console.log(err);
            ElMessage.error('修改失败')
        })
    }
}

const handleChangePromptStatus = (status) => {
    // 请求修改消息提示状态
    updateGroupPromptStatus(groupSetting.value.id, status).then(res => {
        if (res.code !== 200) {
            groupSetting.value.status = !groupSetting.value.status;
        }
    }).catch(err => {
        groupSetting.value.status = !groupSetting.value.status;
    })
}

const handleUpdateGroupAvatar = (url) => {
    groupStore.updateGroupAvatar(currentGroupInfo.value.id, url).then(res => {
        if (res.code === 200) {
            ElMessage.success('修改成功')
            currentGroupInfo.value.avatarUrl = url
        }
    }).catch(err => {
        console.log(err);
        ElMessage.error('修改失败')
    })
}

const handleCommand = (command) => {
    switch (command) {
        case '1':
            // 转让群聊
            if (groupSetting.role === 3) {
                transferGroup()
            }
            break;
        case '2':
            // 解散群聊
            if (groupSetting.role === 3) {
                dismissGroup()
            }
            break;
        case '3':
            // 退出群聊
            if (groupSetting.role === 3) {
                ElMessage.error('请先转让群聊')
            } else {
                exitGroup()
            }
            break;
        default:
            break;
    }
}

const transferGroup = () => {
    // messagebox 提示
    ElMessageBox.confirm(
        '确定要拉黑该好友吗？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        // 请求屏蔽
        friendStore.blockUser(currentFriendInfo.value.friendId).then(res => {
            if (res.code === 200) {
                ElMessage.success('拉黑成功');
            }
        }).catch(err => {
            ElMessage.error('拉黑失败');
        })
    }).catch((err) => {
        console.log(err);
    })
}

const dismissGroup = () => {
    // messagebox 提示
    ElMessageBox.confirm(
        '确定要拉黑该好友吗？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        // 请求屏蔽
        friendStore.blockUser(currentFriendInfo.value.friendId).then(res => {
            if (res.code === 200) {
                ElMessage.success('拉黑成功');
            }
        }).catch(err => {
            ElMessage.error('拉黑失败');
        })
    }).catch((err) => {
        console.log(err);
    })
}

const exitGroup = () => {
    // messagebox 提示
    ElMessageBox.confirm(
        '确定要拉黑该好友吗？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        // 请求屏蔽
        friendStore.blockUser(currentFriendInfo.value.friendId).then(res => {
            if (res.code === 200) {
                ElMessage.success('拉黑成功');
            }
        }).catch(err => {
            ElMessage.error('拉黑失败');
        })
    }).catch((err) => {
        console.log(err);
    })
}

const handleClickMessage = (group) => {
    // 判断会话是否存在
    const chat = chatStore.findRecentChatByRoomId(group.roomId);
    if (chat) {
        router.push('/chat/group/' + group.id)
        chatStore.recordCurrentChatInfo(chat)
    } else {
        chatStore.createGroupChat(group.id).then(res => {
            if (res.code == 200) { // 创建成功，跳转到聊天页面
                router.push('/chat/group/' + group.id)
            }
        }).catch(err => {
            ElMessage.error(err.message)
        })
    }
}

const descriptionDialogVisible = ref(false)

const handleOpenDescription = () => {
    descriptionDialogVisible.value = true
}

const noticeDialogVisible = ref(false)

const handleClickNoticeDialog = () => {
    noticeDialogVisible.value = true
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

    .more {
        margin-left: auto;
    }

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

            .modify-name {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 10px;
                cursor: default;

                .edit {
                    cursor: pointer;
                    color: gray;

                    &:hover {
                        color: #0056b3;
                    }
                }
            }

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

    .modifiable-info,
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

        .input {
            cursor: pointer;
            max-width: 50%;

            .remark {
                // 超出部分隐藏
                overflow: hidden;
                // 超出部分显示省略号
                text-overflow: ellipsis;
                // 超出部分隐藏，并用...表示
                white-space: nowrap;
            }

            .no-remark {
                color: gray;
                cursor: pointer;
            }
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

.description-container {
    word-wrap: break-word;
    max-height: 300px;
    overflow-y: auto;
}
</style>