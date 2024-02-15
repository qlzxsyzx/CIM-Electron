<template>
    <!-- 包含一个搜索栏 ，和一个包含多个小工具的网格栏 -->
    <div class="home-container">
        <div class="home-logo">
            <img src="../assets/img/home_logo.png" style="width: 100%;"/>
        </div>
        <div class="home-tools">
            <!-- 暂未开发 -->
            <!-- <div class="search-bar">
                <el-input v-model="searchText" placeholder="搜索..." :prefix-icon="Search" size="large" class="w-200 m-2"></el-input>
            </div> -->
            <div class="tools-title">
                选项
            </div>
            <div class="tool-grid">
                <NewFriendButton/>
                <GroupNotificationButton/>
                <AddFriendButton/>
                <CreateOrAddGroupButton/>
                <BlackListButton/>
                <SettingButton/>
            </div>
        </div>
        <!-- ... -->
    </div>
</template>

<script setup>
import NewFriendButton from '../components/NewFriendButton.vue'
import AddFriendButton from '../components/AddFriendButton.vue'
import BlackListButton from '../components/BlackListButton.vue';
import CreateOrAddGroupButton from '../components/CreateOrAddGroupButton.vue'
import SettingButton from '../components/SettingButton.vue'
import GroupNotificationButton from '../components/GroupNotificationButton.vue';

</script>

<style lang="scss" scoped>
.home-container {
    background-color: #f0f2f5;
    width: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    // ...
    .home-tools {
        width: 80%;
        display: flex;
        flex-direction: column;

        .search-bar {
            width: 100%;
            margin-bottom: 20px;
        }

        .tools-title {
            font-size: 20px;
            font-weight: bold;
            color: #7a7a7a;
            margin-bottom: 10px;
            border-bottom: 1px solid #ccc;
        }

        .tool-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); // 自动填充网格，最小宽度为200px
            grid-auto-rows: minmax(100px, auto); // 自动调整网格项的高度
            grid-gap: 20px; // 网格项之间的间距
        }
    }
}
</style>