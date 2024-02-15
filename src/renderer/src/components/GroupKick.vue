<template>
    <div class="group-kick-container">
        <div class="container-left">
            <el-input class="search" v-model="searchValue" placeholder="搜索" prefix-icon="Search" />
            <div class="list-data">
                <div class="member-check-box-group">
                    <template v-for="item in filterMemberList" :key="item.id">
                        <div class="member-check-box-container" @click="handleClick(item)">
                            <input class="member-check-box" type="checkbox" :checked="isCheck(item)"/>
                            <el-avatar class="member-check-box-avatar" :size="50" :src="item.userInfo.avatarUrl" />
                            <span class="member-check-box-name">{{ getMemberName(item) }}</span>
                        </div>
                    </template>
                </div>
            </div>
        </div>
        <div class="container-right">
            <div class="right-content">
                <div class="content-title">
                    <span class="count">已选择{{ chooseMembers.length }}个成员</span>
                </div>
                <div class="content">
                    <div class="member-container">
                        <template v-for="member in chooseMembers" :key="member.id">
                            <div class="member-item">
                                <el-icon size="20px" class="mark" @click="handleRemoveMember(member)">
                                    <CircleCloseFilled />
                                </el-icon>
                                <el-avatar :size="60" :src="member.userInfo.avatarUrl"></el-avatar>
                                <span class="name">{{ getMemberName(member) }}</span>
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
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { pinyin } from 'pinyin-pro'

const props = defineProps(['groupId'])
const emit = defineEmits(['close'])

const groupStore = useGroupStore()
const friendStore = useFriendStore()

const searchValue = ref('')

const filterMemberList = computed(() => {
    let memberList = sortMemberList.value
    if (searchValue.value) {
        memberList = memberList.filter(item => {
            const friend = friendStore.findFriendByUserId(item.userId)
            const userInfo = item.userInfo
            if (friend) {
                return friend.remark.includes(searchValue.value) || item.userNickName.includes(searchValue.value) || userInfo.name.includes(searchValue.value)
            } else {
                return item.userNickName.includes(searchValue.value) || userInfo.name.includes(searchValue.value)
            }
        })
    }
    return memberList
})

const sortMemberList = computed(() => {
    let memberList = groupMembers.value
    return memberList.sort((a, b) => {
        const arole = a.role
        const brole = b.role
        if (arole === brole) {
            const aname = getMemberName(a)
            const bname = getMemberName(b)
            // 是否#，￥等特殊字符开头
            const aStartWithSpecialChar = isStartWithSpecialChar(aname)
            const bStartWithSpecialChar = isStartWithSpecialChar(bname)
            if (aStartWithSpecialChar && !bStartWithSpecialChar) {
                return 1
            } else if (!aStartWithSpecialChar && bStartWithSpecialChar) {
                return -1
            } else {
                return aname.localeCompare(bname, 'zh-CN', { sensitivity: 'accent' })
            }
        } else if (arole > brole) {
            return -1
        } else {
            return 1
        }
    })
})

const isStartWithSpecialChar = (str) => {
    const firstWord = str.charAt(0)
    const pinyinFirstWord = pinyin(firstWord, { pattern: 'first', toneType: 'none' })
    const english = /^[A-Za-z]$/
    if (english.test(pinyinFirstWord)) {
        return false
    } else {
        return true
    }
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

const groupMembers = computed(() => {
    const membersMap = groupStore.groupAndMembersMap.get(props.groupId)
    const members = membersMap ? Array.from(membersMap.values()) : []
    if (groupSetting.value) {
        if (groupSetting.value.role === 3) {
            return members.filter(item => item.role !== 3)
        }
        if (groupSetting.value.role === 2) {
            return members.filter(item => item.role === 1)
        }
    }
    return []
})

const groupSetting = computed(() => {
    return groupStore.findMyGroupSettingByGroupId(props.groupId)
})

const chooseMembers = ref([])
const isLoad = ref(false)
const isDisabled = computed(() => {
    if (chooseMembers.value.length > 0)
        return false
    else
        return true
})

const isCheck = (item) => {
    return chooseMembers.value.some(member => member.id === item.id)
}

const handleClick = (item) => {
    if (!chooseMembers.value.some(el => el.id === item.id)) {
        chooseMembers.value.push(item)
    } else {
        chooseMembers.value = chooseMembers.value.filter(el => el.id !== item.id)
    }
}

const handleRemoveMember = (member) => {
    chooseMembers.value = chooseMembers.value.filter(item => item.id !== member.id)
}

const handleClickCancel = () => {
    emit('close')
}


const handleClickInvite = () => {
    isLoad.value = true
    const kickMemberData = {
        groupId: props.groupId,
        memberIdList: chooseMembers.value.map(item => item.id)
    }
    groupStore.kickGroupMember(kickMemberData).then(res => {
        if (res.code === 200) {
            isLoad.value = false
            ElMessage.success('成功移出')
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
.group-kick-container {
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


            .member-check-box-group {
                margin-top: 10px;
                display: flex;
                flex: 1;
                flex-direction: column;
                gap: 10px;

                .member-check-box-container {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    border-radius: 5px;
                    padding: 10px;
                    cursor: default;
                    margin-right: 10px;

                    &:hover {
                        background-color: #83808038;
                    }

                    /* 隐藏原始的复选框 */
                    .member-check-box {
                        -webkit-appearance: none;
                        /* 调整复选框的大小 */
                        width: 20px;
                        height: 20px;
                        /* 设置边框 */
                        border: 1px solid #ccc;
                        /* 设置背景颜色 */
                        background-color: #fff;
                        /* 调整内边距 */
                        padding: 5px;
                        /* 调整边框radius */
                        border-radius: 50%;
                        position: relative;

                    }

                    /* 当复选框被选中时，改变自定义样式 */
                    .member-check-box:checked {
                        /* 调整边框颜色 */
                        border-color: #007bff;
                        /* 调整背景颜色 */
                        background-color: #007bff;

                        /* 调整复选框的内部图标 */
                        &::after {
                            transform: rotate(45deg) scaleY(1);
                            box-sizing: content-box;
                            content: "";
                            border: 2px solid #fff;
                            border-left: 0;
                            border-top: 0;
                            height: 10px;
                            left: 7px;
                            position: absolute;
                            top: 2px;
                            width: 4px;
                            transition: transform 0.15s ease-in 0.05s;
                            transform-origin: center;
                        }
                    }

                    .member-check-box:checked:disabled {
                        /* 调整边框颜色 */
                        border-color: #007bff;
                        /* 调整背景颜色 */
                        background-color: #007bff;
                        opacity: 0.5;
                    }

                    .member-check-box-avatar {
                        margin-left: 10px;
                    }

                    .member-check-box-name {
                        margin-left: 10px;
                        font-size: 20px;
                        color: #333;
                        font-weight: 500;
                        flex: 1;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        width: 200px;
                    }
                }
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
                justify-content: end;
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

                .member-container {
                    overflow-y: auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
                    gap: 10px;
                    padding: 10px;
                    align-items: center;
                    justify-items: center;
                    justify-content: space-between;

                    .member-item {
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