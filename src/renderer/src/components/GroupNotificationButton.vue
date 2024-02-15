<template>
    <div class="tool-container" @click="openGroupNotificationDialog">
        <SvgIcon iconName="group_notification" class="tool-icon" />
        <div class="tool-name">群通知</div>
    </div>

    <!-- 群通知dialog -->
    <el-dialog v-model="rootDialogVisible" title="群通知" width="40%" align-center>
        <div class="group-notification-container">
            <template v-if="groupNotificationList.length > 0">
                <ul v-infinite-scroll="load" :infinite-scroll-disabled="disabled" class="notice-list">
                    <li v-for="item in groupNotificationList" :key="item.id" class="notice-item">
                        <GroupNotificationItem :notification="item" @remove="handleRemoveNotification"/>
                    </li>
                </ul>
            </template>
            <template v-else>
                <el-empty description="暂无群通知" />
            </template>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getGroupNotificationList } from '../api/group';
import GroupNotificationItem from './GroupNotificationItem.vue';

const pageNum = ref(1)
const pageSize = ref(50)
const disabled = ref(false)

const rootDialogVisible = ref(false)
const groupNotificationList = ref([])

const openGroupNotificationDialog = () => {
    rootDialogVisible.value = true
    getGroupNotificationList(pageNum.value, pageSize.value).then(res => {
        if (res.code === 200) {
            groupNotificationList.value = res.data
            if (res.data.length < pageSize.value) {
                disabled.value = true
            } else {
                pageNum.value++
            }
        }
    }).catch(err => {
        ElMessage.error('获取数据失败')
    })
}

const load = () => {
    getGroupNotificationList(pageNum.value, pageSize.value).then((res) => {
        if (res.code === 200) {
            groupNotificationList.value.push(res.data)
            if (res.data.length < pageSize.value) {
                disabled.value = true
            } else {
                pageNum.value++
            }
        }
    }).catch((err) => {
        ElMessage.error('获取数据失败')
    })
}

const handleRemoveNotification = (notificationId) => {
    groupNotificationList.value = groupNotificationList.value.filter(item => item.notificationId !== notificationId)
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
        fill: #7a7a7a;
    }

    .tool-name {
        font-size: 18px;
        font-weight: bold;
        color: #7a7a7a;
    }

    .tabs {
        width: 100%;
        height: 600px;
    }
}

.group-notification-container {
    height: 500px;
    max-height: 500px;
    overflow-y: auto;

    .notice-list {
        padding: 0;
        margin-bottom: 20px;

        .notice-item {
            list-style: none;
            border-radius: 5px;
            background-color: #fff;
            margin-bottom: 10px;
        }
    }
}
</style>