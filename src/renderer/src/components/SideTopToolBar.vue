<template>
    <el-button :icon="Plus" color="#e6e8eb" dark class="tool-plus" @click="handleCreateGroupChatButton" title="创建会话"></el-button>
    <el-dialog destroy-on-close v-model="createGroupChatDialogVisible" title="创建会话" width="800">
        <CreateGroupChat v-model="createGroupChatDialogVisible"/>
    </el-dialog>
</template>

<script setup>
import {Plus} from '@element-plus/icons-vue'
import CreateGroupChat from './CreateGroupChat.vue';
import { ref } from 'vue';

const createGroupChatDialogVisible = ref(false)

const handleCreateGroupChatButton = () => {
    console.log("创建群会话")
    createGroupChatDialogVisible.value = true
}

</script>

<style lang="scss" scoped>
.tool-plus {
    width: 100%;
}
</style>