<template>
    <div class="tool-container" @click="openSettingDialog">
        <SvgIcon iconName="bg-setting" class="tool-icon" />
        <div class="tool-name">设置</div>
    </div>

    <!-- 设置dialog -->
    <el-dialog v-model="settingDialogVisible" title="设置" width="50%" align-center @closed="closeSettingDialog" style="background-color: none;" >
        <div class="setting-container" v-if="settingDialogVisible">
            <div class="setting-menu">
                <div class="menu-item" :class="{'is-active': activeIndex === 1}" @click="handleMenuSelect(1)">个人信息</div>
                <div class="menu-item" :class="{'is-active': activeIndex === 2}" @click="handleMenuSelect(2)">修改密码</div>
            </div>
            <template v-if="activeIndex === 1">
                <PersonalInfo/>
            </template>
            <template v-else-if="activeIndex === 2">
                <UpdatePassword/>
            </template>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../store/userStore';
import PersonalInfo from './PersonalInfo.vue'
import UpdatePassword from './UpdatePassword.vue';

const userStore = useUserStore()

const settingDialogVisible = ref(false)

const openSettingDialog = () => {
    settingDialogVisible.value = true
}

const closeSettingDialog = () => {
    settingDialogVisible.value = false
    activeIndex.value = 1
}

const activeIndex = ref(1)

const handleMenuSelect = (index) => {
    activeIndex.value = index
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

.setting-container {
    display: flex;
    flex-direction: row;
    height: 500px;
    .setting-menu {
        width: 100px;
        display: flex;
        flex-direction: column;
        border-right: 1px solid #7a7a7a45;
        
        .menu-item {
            height: 50px;
            line-height: 50px;
            font-size: 16px;
            color: #7a7a7a;
            text-align: center;
            cursor: pointer;
            &.is-active {
                color: #409eff;
            }

            &:hover {
                color: #409eff;
            }
        }
    }
}
</style>