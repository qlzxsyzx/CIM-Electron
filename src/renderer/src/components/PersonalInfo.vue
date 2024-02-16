<template>
    <div class="personal-info-container">
        <div class="update-user-avatar">
            <CropperAvatar :data-info="{ img: userInfo.avatarUrl }" @upload-success="handleUpdateMyAvatar" />
        </div>
        <div class="modify-container">
            <div class="modify-item" @mouseenter="isNameHover = true" @mouseleave="isNameHover = false">
                <span class="modify-item-label">用户名</span>
                <template v-if="isModifyName">
                    <div class="modify-item-value">
                        <el-input ref="nameInput" v-model="modifyName" placeholder="请输入用户名称" show-word-limit maxlength="20"
                            autofocus @blur="isModifyName = false" @change="handleModifyName"></el-input>
                        <el-icon class="icon" style="margin-left: 10px;" @click="closeModifyName">
                            <Close />
                        </el-icon>
                    </div>
                </template>
                <template v-else>
                    <span class="modify-item-value">{{ userInfo.name }}</span>
                    <el-icon v-show="isNameHover" class="icon" @click="handleClickModifyName()">
                        <Edit />
                    </el-icon>
                </template>
            </div>
            <div class="modify-item">
                <span class="modify-item-label">性别</span>
                <div class="modify-item-value">
                    <el-select v-model="modifyGender" placeholder="请选择性别" @change="handleUpdateMyGender">
                        <el-option label="男" :value="1"></el-option>
                        <el-option label="女" :value="0"></el-option>
                    </el-select>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onBeforeMount, computed, nextTick } from 'vue';
import { useUserStore } from '../store/userStore';
import CropperAvatar from './CropperAvatar.vue';
import { ElMessage } from 'element-plus';
import { validName } from '../assets/js/regex-validate';

const userStore = useUserStore();

const userInfo = computed(() => userStore.userInfo);

const handleUpdateMyAvatar = (url) => {
    if(url === userInfo.value.avatarUrl) return;
    if(url === '') return;
    const data = {
        avatarUrl: url
    }
    userStore.updateUserAvatar(data).then(res => {
        if (res.code === 200) {
            ElMessage.success('修改成功')
        }
    }).catch(err => {
        console.log(err);
        ElMessage.error('修改失败')
    })
}

const nameInput = ref(null);
const isNameHover = ref(false);
const isModifyName = ref(false);
const modifyName = ref('');

const handleClickModifyName = () => {
    isModifyName.value = !isModifyName.value;
    modifyName.value = userInfo.value.name;
    nextTick(() => {
        nameInput.value.focus();
    })
}

const closeModifyName = () => {
    isModifyName.value = false;
}

const handleModifyName = () => {
    if(modifyName.value === userInfo.value.name){
        return 
    }
    if(!validName(modifyName.value)){
        ElMessage.error('昵称不能包含空格等特殊字符且长度为2-20');
        return
    }
    const data = {
        name: modifyName.value,
    }
    userStore.updateUserName(data).then(res => {
        if (res.code === 200) {
            ElMessage.success('修改成功');
        }
    }).catch(err => {
        ElMessage.error('修改失败');
    })
}

const modifyGender = ref(userInfo.value.gender);

const handleUpdateMyGender = (gender) => {
    console.log(gender)
    if(gender === userInfo.value.gender){
        return 
    }
    userStore.updateUserGender(gender).then(res => {
        if (res.code === 200) {
            ElMessage.success('修改成功');
        }
    }).catch(err => {
        ElMessage.error('修改失败');
    })
}
</script>
<style lang="scss" scoped>
.personal-info-container {
    flex: 1;
    display: flex;
    flex-direction: column;

    .update-user-avatar {
        display: flex;
        justify-content: center;
    }

    .modify-container {
        flex: 1;
        width: 400px;
        display: flex;
        flex-direction: column;
        padding: 10px;
        margin: 0 auto;
        margin-top: 20px;

        .modify-item {
            height: 60px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;

            .modify-item-label {
                font-weight: bold;
                width: 50%;
            }

            .modify-item-value {
                flex: 1;
                max-width: 50%;
                text-align: right;
                color: #999;
                cursor: pointer;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
                align-items: center;
            }
        }
    }
}

.icon {
    cursor: pointer;
    color: gray;

    &:hover {
        color: #0056b3;
    }
}
</style>