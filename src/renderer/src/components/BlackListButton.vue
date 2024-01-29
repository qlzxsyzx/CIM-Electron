<template>
    <div class="tool-container" @click="handleOpenSearchFirend">
        <SvgIcon iconName="bg-black-list" class="tool-icon" />
        <div class="tool-name">黑名单</div>
    </div>

    <!-- 添加好友dialog -->
    <el-dialog v-model="searchFriendDialog.visible" title="添加好友" width="30%" align-center @closed="closeSearchFriendDialog">
        <!-- 搜索好友框 -->
        <el-input v-model="searchFriendDialog.username" placeholder="输入账号搜索..." size="large" @keyup.enter="handleSearchUser">
            <template #append>
                <el-button :icon="Search" class="append-button" @click="handleSearchUser" />
            </template>
        </el-input>
        <!-- 用户展示 -->
        <div class="search-result-container">
            <template v-if="searchFriendDialog.result">
                <div class="search-result">
                    <el-avatar :size="60" :src="searchFriendDialog.result.avatarUrl" />
                    <div class="search-result-info">
                        <span class="info-name"> {{ searchFriendDialog.result.name }} </span>
                        <span class="info-username">账号： {{ searchFriendDialog.result.username }}</span>
                    </div>
                    <!-- todo:可以从store查询是否已是好友，而提示 -->
                    <div class="search-result-operation">
                        <el-button type="primary" @click="handleOpenAddFirend">添加</el-button>
                    </div>
                </div>
            </template>
            <template v-else-if="!searchFriendDialog.isFirstSearch">
                <p>未找到用户</p>
            </template>
        </div>
        <!-- 添加好友对话框 -->
        <el-dialog v-model="searchFriendDialog.addFriendDialogVisible" title="添加好友" width="20%" append-to-body align-center>
            <div class="user-info-container">
                <el-avatar :size="60" :src="searchFriendDialog.result.avatarUrl" />
                <div class="user-info">
                    <span class="info-name"> {{ searchFriendDialog.result.name }} </span>
                    <span class="info-username">账号： {{ searchFriendDialog.result.username }}</span>
                </div>
            </div>
            <p>备注：</p>
            <el-input v-model="searchFriendDialog.addFriendForm.remark" placeholder="请输入备注..." />
            <p>请输入添加理由：</p>
            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" maxlength="30" show-word-limit  v-model="searchFriendDialog.addFriendForm.reason" placeholder="请输入添加理由..." />
            <template #footer>
                <el-button @click="searchFriendDialog.addFriendDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleAddFriend">确定</el-button>
            </template>
        </el-dialog>
    </el-dialog>
</template>

<script setup>
import { Search } from '@element-plus/icons-vue';
import { ref, reactive } from 'vue';
import { searchByUsername } from '../api/friend'
import { ElMessage } from 'element-plus';
import { validUsername } from '../assets/js/regex-validate';
import { useUserStore } from '../store/userStore';

const userStore = useUserStore()

const searchFriendDialog = reactive({
    visible: false,
    username: '',
    result: {
        avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        username: '123456',
        name: '张三'
    },
    isFirstSearch: true,
    addFriendDialogVisible: false,
    addFriendForm: {
        remark: '', 
        reason: ''
    }
})

const handleOpenSearchFirend = () => {
    searchFriendDialog.visible = true;
}

const handleSearchUser = () => {
    // 校验username
    if (!validUsername(searchFriendDialog.username)) {
        ElMessage.error('账号只能由数字字母构成且长度为4-10');
        return;
    }
    searchFriendDialog.isFirstSearch = false;
    // 发送搜索请求
    searchByUsername(searchFriendDialog.username).then(res => {
        if (res.code === 200) {
            searchFriendDialog.result = res.data;
        } else {
            searchFriendDialog.result = null;
        }
    }).catch(err => {
        searchFriendDialog.result = null;
    })
}

const closeSearchFriendDialog = () => {
    searchFriendDialog.username = '';
    searchFriendDialog.result = null;
    searchFriendDialog.isFirstSearch = true;
}

const handleOpenAddFirend = () => {
    // 打开申请面板
    searchFriendDialog.addFriendDialogVisible = true;
}

const handleAddFriend = () => {
    const addFirendVo = {
        userId: userStore.userInfo.userId,
        toUserId: searchFriendDialog.result.userId,
        reason: searchFriendDialog.addFriendForm.reason
    }
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

.search-result-container {
    margin-top: 10px;

    .search-result {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #ccc;
        cursor: pointer;

        &:hover {
            background-color: #dedfe0;
        }

        .search-result-info {
            margin-left: 10px;
            display: flex;
            flex-direction: column;

            .info-name {
                font-size: 18px;
                font-weight: bold;
                color: #333333;
            }

            .info-username {
                font-size: 14px;
                color: #7a7a7a;
                margin-top: 5px;
            }
        }

        .search-result-operation {
            margin-left: auto;
        }
    }
}

.user-info-container {
    display: flex;
    flex-direction: row;
    align-items: center;

    .user-info {
        margin-left: 10px;
        display: flex;
        flex-direction: column;

        .info-name {
            font-size: 18px;
            font-weight: bold;
            color: #333333;
        }

        .info-username {
            font-size: 14px;
            color: #7a7a7a;
            margin-top: 5px;
        }
    }
}
</style>