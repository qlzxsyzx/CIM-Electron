<template>
    <div class="friend-info-container" v-if="currentFriendInfo">
        <div class="info-container">
            <div class="more">
                <el-dropdown trigger="click" placement="right-start" @command="handleCommand">
                    <div>
                        <ButtonBox class="more">
                            <SvgIcon iconName="more" style="width: 25px;"></SvgIcon>
                        </ButtonBox>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="1">加入黑名单</el-dropdown-item>
                            <el-dropdown-item command="2">删除好友</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
            <div class="info">
                <el-avatar :size="100" :src="userInfo.avatarUrl"></el-avatar>
                <div class="user-info">
                    <template v-if="currentFriendInfo.remark">
                        <span class="name"> {{ currentFriendInfo.remark }} </span>
                        <span class="more-info">昵称：{{ userInfo.name }}</span>
                    </template>
                    <template v-else>
                        <span class="name"> {{ userInfo.name }} </span>
                    </template>
                    <span class="more-info">账号：{{ userInfo.username }}</span>
                </div>
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
                        <el-input ref="remarkInput" v-model="modifyRemark" placeholder="请输入备注" show-word-limit
                            maxlength="20" autofocus @blur="isModifyRemark = false" @change="handleModifyRemark"></el-input>
                    </template>
                    <template v-else>
                        <template v-if="currentFriendInfo.remark">
                            <span class="remark" @click="handleClickModifyRemark(currentFriendInfo.remark)">{{ currentFriendInfo.remark }}</span>
                        </template>
                        <template v-else>
                            <span class="no-remark" @click="handleClickModifyRemark('')">点击修改备注</span>
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
                <el-switch v-model="currentFriendInfo.promptStatus" width="60" :active-value="0" :inactive-value="1"
                    @change="handleChangePromptStatus" />
            </div>
            <div class="operation-container">
                <ButtonBox class="friend-info-button" @click="handleClickMessage(currentFriendInfo)">
                    <SvgIcon iconName="messages" class="icon" />
                    <div class="title">发消息</div>
                </ButtonBox>
                <ButtonBox class="friend-info-button" @click="handleClickCall(currentFriendInfo.roomId)">
                    <SvgIcon iconName="call" class="icon" />
                    <div class="title">语音聊天</div>
                </ButtonBox>
                <ButtonBox class="friend-info-button" @click="handleClickVideo(currentFriendInfo.roomId)">
                    <SvgIcon iconName="video" class="icon" />
                    <div class="title">视频聊天</div>
                </ButtonBox>
            </div>
        </div>
    </div>
</template>

<script setup>
import ButtonBox from '../components/ButtonBox.vue';
import { useRoute, useRouter } from 'vue-router';
import { useChatStore } from '../store/chatStore';
import { useFriendStore } from '../store/friendStore';
import { useUserInfoStore } from '../store/userInfoStore';
import { ref, computed, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { validRemark } from '../assets/js/regex-validate'
import { updateRemark, updatePromptStatus } from '../api/friend'

const route = useRoute();
const router = useRouter();
const chatStore = useChatStore();
const friendStore = useFriendStore();
const userInfoStore = useUserInfoStore();

const currentFriendInfo = computed(() => {
    return friendStore.findFriendById(route.params.friendId)
})

const userInfo = computed(() => {
    return userInfoStore.getUserInfo(currentFriendInfo.value.friendId)
})

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
    if (modifyRemark.value === currentFriendInfo.value.remark) {
        return;
    }
    if (!validRemark(modifyRemark.value)) {
        ElMessage.error('备注不能包含空格等特殊字符且长度为0-20')
        return;
    } else {
        updateRemark(currentFriendInfo.value.id, modifyRemark.value).then(res => {
            if (res.code === 200) {
                ElMessage.success('修改成功')
                isModifyRemark.value = false;
                currentFriendInfo.value.remark = modifyRemark.value
            }
        }).catch(err => {
            ElMessage.error('修改失败')
        })
    }
}

const handleChangePromptStatus = (status) => {
    // 请求修改消息提示状态
    updatePromptStatus(currentFriendInfo.value.id, status).then(res => {
        if (res.code !== 200) {
            friendInfo.value.promptStatus = !friendInfo.value.promptStatus;
        }
    }).catch(err => {
        friendInfo.value.promptStatus = !friendInfo.value.promptStatus;
    })
}

const handleCommand = (command) => {
    if (command === '1') {
        block()
    } else {
        deleteFriend()
    }
}

const block = () => {
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

const deleteFriend = () => {
    ElMessageBox.confirm(
        '确定要删除该好友吗？',
        '警告',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        // 请求屏蔽
        friendStore.deleteFriend(currentFriendInfo.value.friendId).then(res => {
            if (res.code === 200) {
                ElMessage.success('删除成功');
            }
        }).catch(err => {
            console.log(err);
            ElMessage.error('删除失败');
        })
    }).catch((err) => {
        console.log(err);
    })
}

const handleClickMessage = (friend) => {
    console.log('handleClickMessage', friend.roomId)
    // 判断会话是否存在
    const chat = chatStore.findRecentChatByRoomId(friend.roomId);
    if (chat) {
        router.push('/chat/single/' + friend.roomId)
    } else {
        chatStore.createSingleChat(friend.friendId).then(res => {
            if (res.code == 200) { // 创建成功，跳转到聊天页面
                router.push('/chat/single/' + friend.roomId)
            }
        }).catch(err => {
            ElMessage.error(err.message)
        })
    }
}

const handleClickCall = (roomId) => {
    console.log('handleClickCall', roomId)
}

const handleClickVideo = (roomId) => {
    console.log('handleClickVideo', roomId)
}

</script>

<style lang="scss" scoped>
.friend-info-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

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

            .user-info {
                margin-left: 20px;
                display: flex;
                flex-direction: column;
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

        .modifiable-info {
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
                max-width: 50%;

                .remark {
                    font-size: 20px;
                    // 超出部分隐藏
                    overflow: hidden;
                    // 超出部分显示省略号
                    text-overflow: ellipsis;
                    // 超出部分隐藏，并用...表示
                    white-space: nowrap;
                }

                .no-remark {
                    font-size: 20px;
                    color: gray;
                    cursor: pointer;
                }
            }
        }

        .operation-container {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-gap: 10px;
            margin-top: 100px;
        }
    }
}
</style>