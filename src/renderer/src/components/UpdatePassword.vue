<template>
    <div class="update-password-container">
        <el-form ref="form" :model="updateForm" :rules="updateRules" label-width="120px">
            <el-form-item label="旧密码" prop="oldPassword">
                <el-input v-model="updateForm.oldPassword" type="password" show-password
                    :suffix-icon="oldPasswordVisible ? 'el-icon-view' : 'el-icon-view-off'"></el-input>
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="updateForm.newPassword" type="password" show-password
                    :suffix-icon="newPasswordVisible ? 'el-icon-view' : 'el-icon-view-off'"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="updateForm.confirmPassword" type="password" show-password
                    :suffix-icon="confirmPasswordVisible ? 'el-icon-view' : 'el-icon-view-off'"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm">修改密码</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { validPassword } from '../assets/js/regex-validate';
import { useUserStore } from '../store/userStore';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();
const updateForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})
const form = ref(null);

const customPasswordRule = (rule, value, callback) => {
    if (!validPassword(value)) {
        callback(new Error('密码不能包含空格等特殊字符且长度为4-20'))
    } else {
        callback()
    }
};

const oldPasswordRule = (rule, value, callback) => {
    if (value === updateForm.newPassword) {
        callback(new Error('新密码不能与原密码相同'))
    } else {
        callback()
    }
}

const newPasswordRule = (rule, value, callback) => {
    if (value === updateForm.oldPassword) {
        callback(new Error('新密码不能与原密码相同'))
    } else if (updateForm.confirmPassword && value !== updateForm.confirmPassword) {
        callback(new Error('两次输入的密码不一致'))
    } else {
        callback()
    }
}

const confirmPasswordRule = (rule, value, callback) => {
    if (value !== updateForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
    } else {
        callback()
    }
}

const updateRules = reactive({
    oldPassword: [
        { required: true, message: '请输入旧密码', trigger: 'change' },
        { validator: customPasswordRule, trigger: 'change' },
        { validator: oldPasswordRule, trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'change' },
        { validator: customPasswordRule, trigger: 'change' },
        { validator: newPasswordRule, trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'change' },
        { validator: customPasswordRule, trigger: 'change' },
        { validator: confirmPasswordRule, trigger: 'blur' }
    ]
})

const oldPasswordVisible = ref(false)
const newPasswordVisible = ref(false)
const confirmPasswordVisible = ref(false)

const submitForm = () => {
    form.value.validate((valid) => {
        if (valid) {
            userStore.updateUserPassword(updateForm).then(res => {
                if (res.code === 200) {
                    // 修改成功
                    ElMessageBox.alert('密码修改成功，请重新登录', '提示', {
                        confirmButtonText: '确定',
                        type: 'success',
                        callback: () => {
                            // 清除用户信息
                            userStore.logout()
                            // 跳转到登录页面
                            router.push('/login')
                        }
                    })
                }
            }).catch(err => {
                ElMessage.error('修改失败')
            })
        } else {
            ElMessage.error('修改失败')
            return false
        }
    })
}
</script>

<style lang="scss" scoped>
.update-password-container {
    width: 400px;
    margin: 0 auto;
    padding: 20px;
}
</style>