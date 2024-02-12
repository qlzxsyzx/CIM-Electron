<template>
    <div class="group-invite-container">
        <div class="container-left">
            <el-input class="search" v-model="searchKey" placeholder="搜索好友" prefix-icon="Search" />
            <div class="list-data">
                <FriendCheckBoxGroup :is-search="searchKey !== ''" :friends="canSelectFriends" v-model="chooseFriends" />
            </div>
        </div>
        <div class="container-right">
            <div class="right-content">
                <div class="content-title">
                    <span class="title">选择好友</span>
                    <span class="count">已选择{{ chooseFriends.length }}个好友</span>
                </div>
                <div class="content">
                    <div class="friend-container">
                        <template v-for="friend in chooseFriends" :key="friend.id">
                            <div class="friend-item">
                                <el-icon size="20px" class="mark" @click="handleRemoveFriend(friend)">
                                    <CircleCloseFilled />
                                </el-icon>
                                <el-avatar :size="60" :src="getUserInfo(friend.friendId).avatarUrl"></el-avatar>
                                <span class="name">{{ getFriendName(friend) }}</span>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
            <div class="right-footer">
                <el-button type="primary" :loading="isLoad" :disabled="isDisabled" @click="handleClickInvite">确定</el-button>
                <el-button @click="handleClickCancel">取消</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { CircleCloseFilled } from '@element-plus/icons-vue'
import { useGroupStore } from '../store/groupStore'
import { useFriendStore } from '../store/friendStore'
import { useUserInfoStore } from '../store/userInfoStore'
import FriendCheckBoxGroup from '../components/FriendCheckBoxGroup.vue'
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps(['groupId'])
const emit = defineEmits(['close'])

const groupStore = useGroupStore()
const friendStore = useFriendStore()
const userInfoStore = useUserInfoStore()

const searchKey = ref('')

const friends = computed(() => {
    if (searchKey.value) {
        return friendStore.friendList.filter(item => item.remark.includes(searchKey.value) || getUserInfo(item.friendId).name.includes(searchKey.value))
    } else {
        return friendStore.friendList
    }
})

const canSelectFriends = computed(() => {
    const searchFriends = JSON.parse(JSON.stringify(friends.value))
    return searchFriends.map(item => {
        if (getMember(item)) {
            item.disabled = true
        }
        return item
    })
})

const getMember = (item) => {
    return groupStore.getMemberByGroupIdAndUserId(props.groupId, item.friendId)
}

const getUserInfo = (userId) => {
    return userInfoStore.getUserInfo(userId)
}

const getFriendName = (item) => {
    if (item.remark) {
        return item.remark
    } else {
        return getUserInfo(item.friendId).name
    }
}

const chooseFriends = ref([])
const isLoad = ref(false)
const isDisabled = computed(() => {
    if (chooseFriends.value.length > 0)
        return false
    else
        return true
})


const handleRemoveFriend = (friend) => {
    chooseFriends.value = chooseFriends.value.filter(item => item.id !== friend.id)
}

const handleClickCancel = () => {
    emit('close')
}


const handleClickInvite = () => {
    isLoad.value = true
    const inviteFriendJoinGroupData = {
        groupId: props.groupId,
        friendIdList: chooseFriends.value.map(item => item.id)
    }
    groupStore.inviteFriendToJoinGroup(inviteFriendJoinGroupData).then(res => {
        if (res.code === 200) {
            isLoad.value = false
            emit('close')
        } else {
            isLoad.value = false
        }
    }).catch(err => {
        isLoad.value = false
        ElMessage.error(err.message)
    })
}

</script>

<style lang="scss" scoped>
.group-invite-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: 400px;
    width: 100%;

    .container-left {
        width: 300px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        border-right: 1px solid #ccc;

        .search {
            display: flex;
            flex-direction: row;
            align-items: center;

            :deep(.el-input__wrapper) {
                margin: 0 10px;
            }
        }

        .list-data {
            display: flex;
            flex: 1;
            flex-direction: column;
            gap: 10px;
            overflow-y: auto;

            .list-item {
                margin: 0 10px;
            }

            .title {
                background-color: rgba(0, 0, 0, 0.055);
                font-weight: 600;
                font-size: 16px;
                color: #606266;
                padding: 5px 10px;
            }
        }
    }

    .container-right {
        height: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;


        .right-content {
            height: 100%;
            display: flex;
            flex-direction: column;

            .content-title {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 10px;
                height: 20px;

                .title {
                    font-weight: 600;
                    font-size: 18px;
                    color: black;
                }

                .count {
                    font-weight: 600;
                    font-size: 16px;
                    color: #606266;
                }
            }

            .content {
                overflow-y: auto;
                flex: 1;
                margin-bottom: 10px;

                .friend-container {
                    overflow-y: auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
                    gap: 10px;
                    padding: 10px;
                    align-items: center;
                    justify-items: center;
                    justify-content: space-between;

                    .friend-item {
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        align-items: center;
                        padding: 10px;
                        position: relative;

                        .mark {
                            position: absolute;
                            top: 0;
                            right: 0;
                            color: #606266;

                            &:hover {
                                color: #409eff;
                                cursor: pointer;
                            }
                        }

                        .name {
                            font-weight: 600;
                            font-size: 16px;
                            color: black;
                            width: 60px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                    }
                }
            }
        }

        .right-footer {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 10px;
            height: 50px;

            .el-button {
                width: 100%;
            }
        }
    }
}
</style>