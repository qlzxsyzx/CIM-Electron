<template>
    <div class="tool-container" @click="openCreateOrAddGroupDialog">
        <SvgIcon iconName="bg-add-group" class="tool-icon" />
        <div class="tool-name">创建/加入群组</div>
    </div>

    <!-- 创建/加入群组dialog -->
    <el-dialog v-model="rootDialogVisible" title="创建/加入群组" width="50%" align-center>
        <el-tabs v-model="activeTab" class="tabs">
            <el-tab-pane label="创建群组" name="createGroup">
                <CreateGroupChat v-if="rootDialogVisible" @close="rootDialogVisible = false" />
            </el-tab-pane>
            <el-tab-pane label="加入群组" name="joinGroup">
                <!-- 搜索框 -->
                <el-input v-model="searchValue" placeholder="输入群号搜索..." size="large" @keyup.enter="handleSearchGroup">
                    <template #append>
                        <el-button :icon="Search" class="append-button" @click="handleSearchGroup" />
                    </template>
                </el-input>
                <div class="search-result-container">
                    <template v-if="result">
                        <template v-if="result.roomId">
                            <MyGroupInfo :groupInfo="result"/>
                        </template>
                        <template v-else>
                            <NotMemberGroupInfo :groupInfo="result"/>
                        </template>
                    </template>
                    <template v-else-if="!isFirstSearch">
                        <el-empty description="未找到相关群组" />
                    </template>
                </div>
            </el-tab-pane>
        </el-tabs>
    </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useGroupStore } from '../store/groupStore'
import { ElMessage } from 'element-plus';
import { validId } from '../assets/js/regex-validate';
import { useUserStore } from '../store/userStore';
import CreateGroupChat from './CreateGroupChat.vue';
import NotMemberGroupInfo from './NotMemberGroupInfo.vue';
import MyGroupInfo from './MyGroupInfo.vue';
import { Search } from '@element-plus/icons-vue';

const userStore = useUserStore()
const groupStore = useGroupStore();

const rootDialogVisible = ref(false)
const activeTab = ref('createGroup')

const openCreateOrAddGroupDialog = () => {
    rootDialogVisible.value = true
}

const searchValue = ref('')
const isFirstSearch = ref(true)
const result = ref(null)

const handleSearchGroup = () => {
    if (!validId(searchValue.value)) {
        ElMessage.error('群号为数字且长度为16-20');
        return;
    }
    isFirstSearch.value = false;
    // 发送搜索请求
    groupStore.getGroupInfo(searchValue.value).then(res => {
        if (res.code === 200) {
            result.value = res.data;
        }
    }).catch(err => {
        ElMessage.error('获取数据失败');
    })
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

    .tabs {
        width: 100%;
        height: 600px;
    }
}

.search-result-container {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>