<template>
    <el-skeleton :loading="isLoading" animated>
        <template #template>
            <div class="notificaiton-item-container">
                <el-skeleton-item variant="circle" style="width: 40px; height: 40px" />
                <div style="width: 100%;" class="info">
                    <el-skeleton-item variant="text" style="width: 50%" />
                    <el-skeleton-item variant="text" style="width: 50%" />
                </div>
            </div>
        </template>
        <template #default>
            <div class="notificaiton-item-container">
                <template v-if="notification.type === 0">
                    <!-- 群申请 -->
                    <el-avatar :size="40" :src="avatar" />
                    <div class="info">
                        <div class="info-name-time">
                            <span class="info-name">{{ name }}</span>
                            <span class="info-time">{{ formatLocalDateTimeToText(notification.updateTime) }}</span>
                        </div>
                        <div class="info-content">
                            <span>申请加入 {{ groupName }}</span>
                            <span>验证信息：{{ notification.reason }}</span>
                        </div>
                    </div>
                    <div class="status-container">
                        <template v-if="notification.status === 0">
                            <!-- 下拉菜单 -->
                            <el-dropdown trigger="click" split-button type="default" size="small"
                                @click="handleClickApply(1)" @command="handleClickApply">
                                同意
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item :command="2">拒绝</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template v-else>
                            <span class="status">{{ translateStatus }}</span>
                        </template>
                    </div>
                </template>
                <template v-else-if="notification.type === 1">
                    <!-- 群解散通知 -->
                    <el-avatar :size="40" :src="groupAvatar" />
                    <div class="info">
                        <div class="info-name-time">
                            <span class="info-name">{{ groupName }}</span>
                            <span class="info-time">{{ formatLocalDateTimeToText(notification.updateTime) }}</span>
                        </div>
                        <div class="info-content">
                            <span>已被群主解散</span>
                        </div>
                    </div>
                </template>
                <template v-else-if="notification.type === 2">
                    <!-- 退群通知 -->
                    <el-avatar :size="40" :src="avatar" />
                    <div class="info">
                        <div class="info-name-time">
                            <span class="info-name">{{ name }}</span>
                            <span class="info-time">{{ formatLocalDateTimeToText(notification.updateTime) }}</span>
                        </div>
                        <div class="info-content">
                            <span>退出 {{ groupName }}</span>
                        </div>
                    </div>
                </template>
                <template v-else-if="notification.type === 3">
                    <!-- 任命管理员 -->
                    <el-avatar :size="40" :src="groupAvatar" />
                    <div class="info">
                        <div class="info-name-time">
                            <span class="info-name">{{ groupName }}</span>
                            <span class="info-time">{{ formatLocalDateTimeToText(notification.updateTime) }}</span>
                        </div>
                        <div class="info-content">
                            <span>将你设置为管理员</span>
                        </div>
                    </div>
                </template>
                <template v-else-if="notification.type === 4">
                    <!-- 撤销管理员 -->
                    <el-avatar :size="40" :src="groupAvatar" />
                    <div class="info">
                        <div class="info-name-time">
                            <span class="info-name">{{ groupName }}</span>
                            <span class="info-time">{{ formatLocalDateTimeToText(notification.updateTime) }}</span>
                        </div>
                        <div class="info-content">
                            <span>已取消你的管理员身份</span>
                        </div>
                    </div>
                </template>
                <template v-else-if="notification.type === 5">
                    <!-- 转让群主 -->
                    <el-avatar :size="40" :src="groupAvatar" />
                    <div class="info">
                        <div class="info-name-time">
                            <span class="info-name">{{ groupName }}</span>
                            <span class="info-time">{{ formatLocalDateTimeToText(notification.updateTime) }}</span>
                        </div>
                        <div class="info-content">
                            <span>已将群主转让给你</span>
                        </div>
                    </div>
                </template>
                <template v-else-if="notification.type === 6">
                    <!-- 邀请入群通知 -->
                    <el-avatar :size="40" :src="avatar" />
                    <div class="info">
                        <div class="info-name-time">
                            <span class="info-name">{{ name }}</span>
                            <span class="info-time">{{ formatLocalDateTimeToText(notification.updateTime) }}</span>
                        </div>
                        <div class="info-content">
                            <span>邀请你加入群聊 {{ groupName }}</span>
                        </div>
                    </div>
                    <div class="status-container">
                        <template v-if="notification.status === 0">
                            <!-- 下拉菜单 -->
                            <el-dropdown trigger="click" split-button type="default" size="small"
                                @click="handleClickInvite(1)" @command="handleClickInvite">
                                同意
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item :command="2">拒绝</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template v-else>
                            <span class="status">{{ translateStatus }}</span>
                        </template>
                    </div>
                </template>
                <template v-else-if="notification.type === 7">
                    <!-- 踢出群通知 -->
                    <el-avatar :size="40" :src="groupAvatar" />
                    <div class="info">
                        <div class="info-name-time">
                            <span class="info-name">{{ groupName }}</span>
                            <span class="info-time">{{ formatLocalDateTimeToText(notification.updateTime) }}</span>
                        </div>
                        <div class="info-content">
                            <span>已将你移出群</span>
                            <span>处理人：{{ name }}</span>
                        </div>
                    </div>
                </template>
                <template v-else-if="notification.type === 8">
                    <!-- 申请入群成功通知 -->
                    <el-avatar :size="40" :src="groupAvatar" />
                    <div class="info">
                        <div class="info-name-time">
                            <span class="info-name">{{ groupName }}</span>
                            <span class="info-time">{{ formatLocalDateTimeToText(notification.updateTime) }}</span>
                        </div>
                        <div class="info-content">
                            <span>成功加入群聊</span>
                        </div>
                    </div>
                </template>
                <template v-else-if="notification.type === 9">
                    <!-- 申请入群被拒绝通知 -->
                    <el-avatar :size="40" :src="groupAvatar" />
                    <div class="info">
                        <div class="info-name-time">
                            <span class="info-name">{{ groupName }}</span>
                            <span class="info-time">{{ formatLocalDateTimeToText(notification.updateTime) }}</span>
                        </div>
                        <div class="info-content">
                            <span>拒绝让你加群</span>
                        </div>
                    </div>
                </template>
            </div>
        </template>
    </el-skeleton>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue'
import { formatLocalDateTimeToText } from '../assets/js/format'
import { getGroupInfo, agreeJoinGroupApply, refuseJoinGroupApply, agreeGroupInvite, refuseGroupInvite, deleteGroupNotification } from '../api/group'
import { getUserInfo } from '../api/user'
import { ElMessage } from 'element-plus'

const props = defineProps(['notification'])
const emits = defineEmits(['remove'])
const notification = ref(props.notification)
const avatar = ref('')
const name = ref('')
const groupAvatar = ref('')
const groupName = ref('')
const isLoading = ref(true)


onBeforeMount(() => {
    const promises = []
    switch (notification.value.type) {
        case 0:
        case 2:
        case 6:
        case 7:
            promises.push(getGroupAvatarName())
            promises.push(getUserAvatarName())
            break
        case 1:
        case 3:
        case 4:
        case 5:
        case 8:
        case 9:
            promises.push(getGroupAvatarName())
            break
        default:
            return
    }
    Promise.all(promises).then(() => {
        isLoading.value = false
    })
})

// 获取群信息
const getGroupAvatarName = async () => {
    getGroupInfo(notification.value.groupId).then(res => {
        if (res.code === 200) {
            groupAvatar.value = res.data.avatarUrl
            groupName.value = res.data.name
        }
    })
}

// 获取用户信息
const getUserAvatarName = async () => {
    getUserInfo(notification.value.userId).then(res => {
        if (res.code === 200) {
            avatar.value = res.data.avatarUrl
            name.value = res.data.name
        }
    })
}

const translateStatus = computed(() => {
    switch (notification.value.status) {
        case 0:
            return '未处理'
        case 1:
            return '已同意'
        case 2:
            return '已拒绝'
        case 3:
            return '已加入'
        default:
            return '未知'
    }
})


// 处理申请
const handleClickApply = (command) => {
    if (command === 1) {
        agreeJoinGroupApply(notification.value.id).then(res => {
            if (res.code === 200) {
                notification.value.status = 1
                notification.value.updateTime = new Date()
                emits('update:value', notification.value)
                ElMessage.success('处理成功')
            } else {
                // 删除记录
                deleteGroupNotification(notification.value.id).then(res2 => {
                    emits('remove', notification.value.id)
                }).catch(err => {
                    emits('remove', notification.value.id)
                })
            }
        }).catch(err => {
            ElMessage.error('处理失败')
        })
    }
    if (command === 2) {
        refuseJoinGroupApply(notification.value.id).then(res => {
            if (res.code === 200) {
                notification.value.status = 2
                notification.value.updateTime = new Date()
                emits('update:value', notification.value)
                ElMessage.success('处理成功')
            } else {
                // 删除记录
                deleteGroupNotification(notification.value.id).then(res2 => {
                    emits('remove', notification.value.id)
                }).catch(err => {
                    emits('remove', notification.value.id)
                })
            }
        }).catch(err => {
            ElMessage.error('处理失败')
        })
    }
}

// 处理邀请
const handleClickInvite = (command) => {
    if (command === 1) {
        agreeGroupInvite(notification.value.id).then(res => {
            if (res.code === 200) {
                notification.value.status = 1
                notification.value.updateTime = new Date()
                emits('update:value', notification.value)
                ElMessage.success('处理成功')
            } else {
                // 删除记录
                deleteGroupNotification(notification.value.id).then(res2 => {
                    emits('remove', notification.value.id)
                }).catch(err => {
                    emits('remove', notification.value.id)
                })
            }
        }).catch(err => {
            ElMessage.error('处理失败')
        })
    }
    if (command === 2) {
        refuseGroupInvite(notification.value.id).then(res => {
            if (res.code === 200) {
                notification.value.status = 2
                notification.value.updateTime = new Date()
                emits('update:value', notification.value)
                ElMessage.success('处理成功')
            } else {
                // 删除记录
                deleteGroupNotification(notification.value.id).then(res2 => {
                    emits('remove', notification.value.id)
                }).catch(err => {
                    emits('remove', notification.value.id)
                })
            }
        }).catch(err => {
            ElMessage.error('处理失败')
        })
    }
}

</script>

<style lang="scss" scoped>
.notificaiton-item-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px;
    cursor: default;

    .info {
        flex: 1;
        margin-left: 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .info-name-time {
            display: flex;
            flex-direction: row;
            align-items: center;
            width: 300px;

            .info-name {
                font-size: 16px;
                font-weight: 600;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .info-time {
                margin-left: 10px;
                font-size: 14px;
                color: #909399;
            }
        }

        .info-content {
            margin-top: 5px;
            font-size: 14px;
            color: #606266;
            display: flex;
            flex-direction: column;

            span {
                color: #303133;
                width: 300px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }

    .status-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: end;

        .status {
            width: 60px;
            text-align: center;
            font-size: 14px;
            color: #909399;
        }
    }
}
</style>