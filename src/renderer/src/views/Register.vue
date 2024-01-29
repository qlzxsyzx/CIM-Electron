<template>
    <div class="register-view-container" v-loading="isLoad">
        <div class="register-box">
            <div class="register-title">注册</div>
            <div class="register-form">
                <div class="avatar-selector">
                    <div class="avatar-container">
                        <!-- 鼠标移到头像上就会pop一个el-popover去选择头像 -->
                        <el-popover placement="right" width="400" trigger="hover">
                            <template #reference>
                                <el-avatar class="avatar" :size="100" :src="registerForm.avatarUrl">
                                </el-avatar>
                            </template>
                            <div class="popover">
                                <div class="popover-title">
                                    选择初始头像
                                </div>
                                <div class="popover-content">
                                    <template v-for="(avatar, index) in defaultAvatarList" :key="index">
                                        <el-avatar class="default-avatar" :size="100" :src="avatar"
                                            @click="registerForm.avatarUrl = avatar">
                                        </el-avatar>
                                    </template>
                                </div>
                            </div>
                        </el-popover>
                    </div>
                </div>
                <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules">
                    <el-form-item label="账号" prop="username">
                        <el-input v-model="registerForm.username"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="registerForm.password" type="password"></el-input>
                    </el-form-item>
                    <el-form-item label="昵称" prop="name">
                        <el-input v-model="registerForm.name"></el-input>
                    </el-form-item>
                    <el-form-item label="性别">
                        <el-radio-group v-model="registerForm.gender">
                            <el-radio :label="1">男
                            </el-radio>
                            <el-radio :label="0">女
                            </el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="registerCheck">确认注册
                        </el-button>
                    </el-form-item>
                </el-form>
                <router-link to="/login" class="login-a">已有账号，前去登录</router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
// 从../assets/avatar 下将图片资源引入，可以放在el-avatar中
import avatar_1 from '../assets/avatar/avatar_1.png'
import avatar_2 from '../assets/avatar/avatar_2.png'
import avatar_3 from '../assets/avatar/avatar_3.png'
import { useRouter } from 'vue-router'
import { register } from '../api/login';
import { ElMessage } from 'element-plus'
import { validUsername, validPassword, validName } from '../assets/js/regex-validate'

const registerForm = reactive({
    username: '',
    password: '',
    name: '',
    gender: 1,
    avatarUrl: avatar_1
});

const defaultAvatarList = [
    avatar_1,
    avatar_2,
    avatar_3
]

const validateUsername = (rule, value, callback) => {
    // 账号只能由数字字母构成且长度为4-10，用正则进行校验
    if (value === '') {
        callback(new Error('请输入帐号'))
    } else if (value.length < 4 || value.length > 10) {
        callback(new Error('帐号长度为4-10'))
    } else if (validUsername(value) === false) {
        callback(new Error('帐号只能由数字字母构成'))
    } else {
        callback()
    }
}

const validatePassword = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请输入密码'))
    } else if (value.length < 4 || value.length > 20) {
        callback(new Error('密码长度为4-20'))
    } else if (validPassword(value) === false) {
        callback(new Error('密码不能包含空格等特殊字符'))
    } else {
        callback()
    }
}

const validateName = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请输入昵称'))
    } else if (value.length < 2 || value.length > 20) {
        callback(new Error('昵称长度为2-20'))
    } else if (validName(value) === false) {
        // 昵称不能包含空格等特殊字符且长度为2-20
        callback(new Error('昵称不能包含空格等特殊字符'))
    } else {
        callback()
    }
}

const registerRules = reactive({
    useranme: [{ validator: validateUsername, trigger: 'blur' }],
    password: [{ validator: validatePassword, trigger: 'blur' }],
    name: [{ validator: validateName, trigger: 'blur' }],
})

const isLoad = ref(false)
const router = useRouter()
const registerFormRef = ref(null)

const registerCheck = () => {
    if (!registerFormRef.value) return
    registerFormRef.value.validate((valid) => {
        if (valid) {
            isLoad.value = true
            console.log(registerForm)
            register(registerForm).then((res) => {
                if (res.data.code === 200) {
                    ElMessage({
                        message: '注册成功',
                        type: 'success',
                    })
                    isLoad.value = false
                    router.push('/login')
                }
            }).catch((err) => {
                isLoad.value = false
            })
        } else {
            console.log('error submit!!')
            isLoad.value = false
            return false
        }
    })
}




</script>

<style lang="scss" scoped>
.register-view-container {
    height: 100%;
    background-image: url("../assets/img/background_home.jpg");
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 10px;
    box-sizing: border-box;
    /* 背景模糊 */
    backdrop-filter: blur(10px);
}

@keyframes login-box {
    0% {
        transform: scale(0.5);
    }
}

/* 居中的一个容器 */
.register-box {
    width: 100%;
    max-width: 400px;
    background-color: rgba(255, 255, 255, 0.8);
    padding: 20px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    box-shadow: 0 0 10px #000000;
    backdrop-filter: blur(10px);
    /* 动画效果 */
    animation: login-box 1s ease-in-out;

    .register-title {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 20px;
    }

    .register-form {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 300px;

        .avatar-selector {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            .avatar-container {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                overflow: hidden;
                margin-bottom: 20px;
                position: relative;
                cursor: pointer;
                outline: 2px solid transparent;
                transition: outline 0.3s;
            }

            .avatar-container:hover {
                outline: 2px solid #007bff;
                opacity: 0.8;
            }
        }

        .el-form-item {
            margin-bottom: 20px;
        }

        .el-button {
            width: 100%;
            margin-top: 20px;
        }
    }
}

.popover {
    display: flex;
    flex-direction: column;

    .popover-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;
    }

    .popover-content {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 5px;

        .default-avatar {
            cursor: pointer;
        }

        .default-avatar:hover {
            opacity: 0.8;
        }
    }
}

.login-a {
    color: #000000;
    cursor: pointer;
    font-size: 14px;
    margin-left: auto;
}

.login-a:hover {
    text-decoration: underline;
}
</style>