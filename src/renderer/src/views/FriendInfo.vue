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
                    <label class="label">备注</label>
                    <template v-if="isModifyRemark">
                        <el-input ref="remarkInput" v-model="modifyRemark" placeholder="请输入备注" show-word-limit
                            maxlength="20" autofocus @blur="isModifyRemark = false" @change="handleModifyRemark"></el-input>
                    </template>
                    <template v-else>
                        <template v-if="currentFriendInfo.remark">
                            <span class="remark">{{ currentFriendInfo.remark }}</span>
                            <el-icon class="edit" @click="handleClickModifyRemark(currentFriendInfo.remark)">
                                <Edit />
                            </el-icon>
                        </template>
                        <template v-else>
                            <span class="no-remark" @click="handleClickModifyRemark('')">点击修改备注</span>
                        </template>
                    </template>
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
import { ref, computed, nextTick } from 'vue';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const chatStore = useChatStore();

const currentFriendInfo = computed(() => {
    return chatStore.friendList.find(friend => friend.id == route.params.friendId)
})

const userInfo = computed(() => {
    return chatStore.userInfoMap.get(currentFriendInfo.value.friendId)
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
    console.log(modifyRemark.value)
}

const handleClickMessage = (friend) => {
    console.log('handleClickMessage', friend.roomId)
    // 判断会话是否存在
    const chat = chatStore.recentChatList.find(chat => chat.roomId == friend.roomId);
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

const handleCommand = (command) => {
    console.log('handleCommand', command)
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
        width: 50%;
        height: 50%;
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
                    font-size: 20px;
                    color: gray;
                }
            }
        }

        .modifiable-info {
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            margin: 10px 0;
            padding-bottom: 10px;
            border-bottom: 1px solid #ccc;

            .label {
                width: 30%;
                font-size: 20px;
                color: gray;
            }

            .remark {
                width: 70%;
                font-size: 20px;
                // 超出部分隐藏
                overflow: hidden;
                // 超出部分显示省略号
                text-overflow: ellipsis;
                // 超出部分隐藏，并用...表示
                white-space: nowrap;
            }

            .edit {
                color: gray;
                cursor: pointer;

                &:hover {
                    color: #000;
                }
            }

            .no-remark {
                width: 70%;
                font-size: 20px;
                color: gray;
                cursor: pointer;
            }
        }

        .operation-container {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-gap: 10px;
            margin-top: 10px;
        }
    }
}
</style>