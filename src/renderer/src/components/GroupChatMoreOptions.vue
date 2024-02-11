<template>
    <div class="more-options-container">
        <!-- 普通 -->
        <template v-if="groupSetting.role === 1">
            
        </template>
        <template v-else>

        </template>
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
        <div class="single-options-container">
            <div class="input-options">
                <el-input v-model="remark" placeholder="请填写备注" show-word-limit maxlength="20"
                    @change="handleModifyRemark"></el-input>
            </div>
        </div>
        <div class="single-options-container">
            <div class="button-options danger" @click="block">
                <a>拉黑</a>
            </div>
        </div>
        <div class="single-options-container">
            <div class="button-options danger" @click="deleteFriend">
                <a>删除好友</a>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useChatStore } from '../store/chatStore';
import { useGroupStore } from '../store/groupStore';
import { topChat } from '../api/chat';
import { updatePromptStatus, updateRemark } from '../api/friend';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { validRemark } from '../assets/js/regex-validate'

const router = useRouter();
const chatStore = useChatStore();
const groupStore = useGroupStore()
const remark = ref('');

onBeforeMount(() => {
    remark.value = groupSetting.value.groupNickName
})

const currentChatInfo = computed(() => {
    return chatStore.currentChatInfo;
})

const group = computed(() => {
    return groupStore.findGroupByGroupId(currentChatInfo.value.groupId);
})

const groupSetting = computed(() => {
    return groupStore.findMyGroupSettingByGroupId(currentChatInfo.value.groupId)
})

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
    updatePromptStatus(friendInfo.value.id, num).then(res => {
        if (res.code !== 200) {
            friendInfo.value.promptStatus = !friendInfo.value.promptStatus;
        }
    }).catch(err => {
        friendInfo.value.promptStatus = !friendInfo.value.promptStatus;
    })
}

const handleModifyRemark = () => {
    if (remark.value === friendInfo.value.remark) {
        return;
    }
    if (!validRemark(remark.value)) {
        ElMessage.error('备注不能包含空格等特殊字符且长度为1-20')
        return;
    } else {
        updateRemark(friendInfo.value.id, remark.value).then(res => {
            if (res.code === 200) {
                ElMessage.success('修改成功')
                friendInfo.value.remark = remark.value
            }
        }).catch(err => {
            ElMessage.error('修改失败')
        })
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
        friendStore.blockUser(friendInfo.value.friendId).then(res => {
            if (res.code === 200) {
                ElMessage.success('拉黑成功');
                router.push('/chat/home');
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
        friendStore.deleteFriend(friendInfo.value.friendId).then(res => {
            if (res.code === 200) {
                ElMessage.success('删除成功');
                router.push('/chat/home');
            }
        }).catch(err => {
            console.log(err);
            ElMessage.error('删除失败');
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

    .single-options-container {
        display: flex;
        flex-direction: row;
        background-color: white;
        border-radius: 5px;
        height: 40px;
        align-items: center;

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

        .button-options {
            height: 100%;
            flex: 1;
            display: flex;
            flex-direction: row;
            align-items: center;
            cursor: pointer;

            &:hover {
                background-color: #f5f7fa;
                cursor: pointer;
            }

            &.danger {
                color: #F56C6C;
                justify-content: center;
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