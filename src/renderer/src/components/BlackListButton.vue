<template>
    <div class="tool-container" @click="openBlackListDialog">
        <SvgIcon iconName="bg-black-list" class="tool-icon" />
        <div class="tool-name">黑名单</div>
    </div>

    <!-- 黑名单dialog -->
    <el-dialog v-model="blackListDialog.visible" title="黑名单" width="40%" align-center destroy-on-close @close="handleCloseDialog">
        <!-- 搜索框 -->
        <el-input v-model="blackListDialog.keyword" placeholder="输入账号搜索..." size="large" @keyup.enter="handleSearchUser">
            <template #append>
                <el-button :icon="Search" class="append-button" @click="handleSearchUser" />
            </template>
        </el-input>
        <!-- 用户展示 -->
        <div class="black-list-container">
            <template v-if="blackListDialog.result.length > 0">
                <el-table :data="blackListDialog.result" style="width: 100%" show-overflow-tooltip>
                    <el-table-column label="昵称" width="150">
                        <template #default="{ row }">
                            <div class="avatar-name">
                                <el-avatar :size="40" :src="row.userInfo.avatarUrl" />
                                <span class="name">{{ row.userInfo.name }}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="备注" prop="remark" />
                    <el-table-column label="拉黑时间">
                        <template #default="{ row }">{{ formatDate(row.createTime) }}</template>
                    </el-table-column>
                    <el-table-column label="操作" width="80">
                        <template #default="{ row }">
                            <el-button type="danger" size="small" @click="handleRemoveBlackList(row)">移除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
            <template v-else>
                <el-empty description="未找到相关用户" />
            </template>
        </div>
    </el-dialog>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue';
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { getBlackList, removeBlackList } from '../api/friend'
import { formatDate } from '../assets/js/format'

const wholeResult = ref([])

const blackListDialog = reactive({
    visible: false,
    keyword: '',
    result: []
})

const openBlackListDialog = () => {
    blackListDialog.visible = true
    // 获取黑名单列表
    getBlackList().then(res => {
        if (res.code === 200) {
            blackListDialog.result = res.data
            wholeResult.value = res.data
        }
    }).catch(err => {
        ElMessage.error('获取失败')
    })
}

const handleSearchUser = () => {
    if (blackListDialog.keyword.trim() === '') {
        blackListDialog.result = wholeResult.value
        return
    }
    // 搜索用户
    blackListDialog.result = wholeResult.value.filter(item => item.remark.includes(blackListDialog.keyword) || item.userInfo.name.includes(blackListDialog.keyword))
}

const handleRemoveBlackList = (row) => {
    // 移除黑名单
    removeBlackList(row.userInfo.userId).then(res => {
        if (res.code === 200) {
            ElMessage.success('移除成功')
            wholeResult.value = wholeResult.value.filter(item => item.userInfo.userId !== row.userInfo.userId)
            blackListDialog.result = wholeResult.value
        }
    }).catch(err => {
        ElMessage.error('移除失败')
    })
}

const handleCloseDialog = () => {
    blackListDialog.keyword = ''
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

.black-list-container {
    border-radius: 5px;
    margin-top: 20px;
    height: 500px;

    .avatar-name {
        display: flex;
        flex-direction: row;
        align-items: center;

        .avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-right: 10px;
        }

        .name {
            max-width: 70px;
            margin-left: 10px;
            flex: 1;
            font-size: 18px;
            font-weight: bold;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    }
}
</style>