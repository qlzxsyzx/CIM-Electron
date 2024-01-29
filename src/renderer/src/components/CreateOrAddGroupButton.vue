<template>
    <div class="tool-container">
        <SvgIcon iconName="bg-add-group" class="tool-icon" />
        <div class="tool-name">创建/加入群组</div>
    </div>

    <!-- 添加好友dialog -->
    <el-dialog v-model="addFriendDialog.visible" title="添加好友" width="30%" align-center @closed="closeAddFriendDialog">
        <!-- 搜索好友框 -->
        <el-input v-model="addFriendDialog.username" placeholder="输入账号搜索..." size="large" @keyup.enter="handleSearchUser">
            <template #append>
                <el-button :icon="Search" class="append-button" @click="handleSearchUser" />
            </template>
        </el-input>
        <!-- 用户展示 -->
        <div class="search-result-container">
            <template v-if="addFriendDialog.result">
                <div class="search-result">
                    <el-avatar :size="60" :src="addFriendDialog.result.avatarUrl" />
                    <div class="search-result-info">
                        <span class="info-name"> {{ addFriendDialog.result.name }} </span>
                        <span class="info-username">账号： {{ addFriendDialog.result.username }}</span>
                    </div>
                    <!-- todo:可以从store查询是否已是好友，而提示 -->
                    <div class="search-result-operation">
                        <el-button type="primary" @click="handleAddFirend">添加</el-button>
                    </div>
                </div>
            </template>
            <template v-else-if="!addFriendDialog.isFirstSearch">
                <p>未找到用户</p>
            </template>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { searchByUsername } from '../api/friend'
import { ElMessage } from 'element-plus';
import { validUsername } from '../assets/js/regex-validate';
import { useUserStore } from '../store/userStore';

const userStore = useUserStore()

const addFriendDialog = reactive({
    visible: false,
    username: '',
    result: {
        avatarUrl: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        username: '123456',
        name: '张三'
    },
    isFirstSearch: true,
})

const handleOpenAddFirend = () => {
    addFriendDialog.visible = true;
}

const handleSearchUser = () => {
    // 校验username
    if (!validUsername(addFriendDialog.username)) {
        ElMessage.error('账号只能由数字字母构成且长度为4-10');
        return;
    }
    addFriendDialog.isFirstSearch = false;
    // 发送搜索请求
    searchByUsername(addFriendDialog.username).then(res => {
        if (res.code === 200) {
            addFriendDialog.result = res.data;
        } else {
            addFriendDialog.result = null;
        }
    }).catch(err => {
        addFriendDialog.result = null;
    })
}

const closeAddFriendDialog = () => {
    addFriendDialog.username = '';
    addFriendDialog.result = null;
    addFriendDialog.isFirstSearch = true;
}

const handleAddFirend = () => {
    // 发送添加好友请求
    const addFirendVo = {
        userId: userStore.userInfo.userId,
        addFriendUserId: addFriendDialog.result.userId
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
</style>