<template>
    <div class="loginView">
        <div class="login-box">
            <div class="loginLeft">
                <img src="../assets/img/logo.png" alt="">
            </div>
            <div class="loginRight">
                <div class="loginForm">
                    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules">
                        <el-form-item prop="username">
                            <el-input :prefix-icon="User" placeholder="帐号" v-model="loginForm.username"></el-input>
                        </el-form-item>
                        <el-form-item prop="password">
                            <el-input type="password" :prefix-icon="Lock" placeholder="密码" v-model="loginForm.password"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button class="login-button" type="primary" @click="loginCheck">登录</el-button>
                        </el-form-item>
                    </el-form>
                    <router-link to="/register" class="register-a">没有账号，前去注册</router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {User,Lock} from '@element-plus/icons-vue'
import { ref,reactive } from 'vue';
import { ElMessage } from 'element-plus';
import {useRouter} from 'vue-router'
import { useUserStore } from '../store/userStore'
import {getPlatform} from '../assets/js/platform'
import {validUsername,validPassword} from '../assets/js/regex-validate'

const loginForm = reactive({
    username: '',
    password: ''
})

const validateUsername = (rule, value, callback) => {
    // 账号只能由数字字母构成且长度为4-10，用正则进行校验
    if (value === '') {
        callback(new Error('请输入帐号'))
    } else if (value.length < 4 || value.length > 10){
        callback(new Error('帐号长度为4-10'))
    }else if(validUsername(value) === false){
        callback(new Error('帐号只能由数字字母构成'))
    }else {
        callback()
    }
}

const validatePassword = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请输入密码'))
    } else if (value.length < 4 || value.length > 20){
        callback(new Error('密码长度为4-20'))
    } else if(validPassword(value) === false){
        callback(new Error('密码不能包含空格等特殊字符'))
    } else {
        callback()
    }
}

const loginRules = reactive({
    username:[{validator: validateUsername, trigger: 'blur'}],
    password:[{validator: validatePassword, trigger: 'blur'}]
})

const router = useRouter()
const loginFormRef = ref(null)

const loginCheck =  () => {
    if(!loginFormRef.value) return
    // 显示加载中，再去验证跳转
    loginFormRef.value.validate((valid) =>{
        if(valid){
            login()
        }else {
            console.log('error submit!!')
            return false
        }
    })
}

const userStore = useUserStore()

const login = () => {
    const platform = getPlatform()
    // 使用pinia
    userStore.loginUser({
        ...loginForm,
        loginPlatform: platform
    })
        .then((res) => {
            if(res.code === 200){
                loginSuccess()
            }
        })
        .catch((error) => {
            userStore.logout()
            ElMessage.error('登录失败')
        })
}

const loginSuccess = () => {
    // 加载主窗口数据，耗时
    console.log('获取用户数据，耗时')
    userStore.getUserInfo().then(()=> {
        ElMessage({
            message:'登录成功',
            type:'success'
        })
        // 关闭窗口，跳转路由    
        router.push({path:'/chat'})
    })
}

</script>

<style scoped>
.loginView {
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

/* 居中的一个容器 */
.login-box {
    width: 500px;
    height: 300px;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 10px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    box-shadow: 0 0 10px #000000;
    backdrop-filter: blur(10px);
    /* 动画效果 */
    animation: login-box 1s ease-in-out;
}

.loginLeft {
    width: 50%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
}

.loginRight{
    width: 50%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
}

@keyframes login-box {
    0% {
        transform: scale(0.5);
    }
}
.loginForm {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 20px;
    box-sizing: border-box;
}

.login-button {
    width: 100%;
    height: 40px;
    border: none;
    border-radius: 5px;
    background-color: #4CAF50;
    color: white;
    font-size: 16px;
    cursor: pointer;
}

.login-button:hover {
    background-color: #45a049;
}

.login-button:disabled {
    background-color: #c0c0c0;
    cursor: not-allowed;
}

.login-button:focus {
    outline: none;
}

.login-button:active {
    transform: scale(0.98);
}

.register-a {
    color: #000000;
    cursor: pointer;
    font-size: 14px;
    margin-left: auto;
}

.register-a:hover {
    text-decoration: underline;
}

img {
    width: 100%;
    height: auto;
    object-fit: cover;
}
</style>