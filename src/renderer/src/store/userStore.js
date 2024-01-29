import { defineStore } from "pinia";
import {login} from "../api/login"
import { getUserInfo } from "../api/user";

export const useUserStore = defineStore("user", {
    state: () => {
        return {
            isLogin: localStorage.getItem("cim.username") ? true : false,
            username: localStorage.getItem("cim.username"),
            tokenInfo: localStorage.getItem("cim.tokenInfo") ? JSON.parse(localStorage.getItem("cim.tokenInfo")) : null,
            userInfo: localStorage.getItem("cim.userInfo") ? JSON.parse(localStorage.getItem("cim.userInfo")) : null,
            reconnectSuccess: false,
            reqCount:0
        }
    },
    actions:{
        async loginUser(data) {
            const res = await login(data)
            if(res.code === 200){
                this.tokenInfo = res.data
                if(this.tokenInfo){
                    localStorage.setItem("cim.username", data.username)
                    localStorage.setItem("cim.tokenInfo", JSON.stringify(this.tokenInfo))
                    this.username = data.username
                    this.isLogin = true
                }
            }
            return res
        },
        async getUserInfo() {
            const res = await getUserInfo()
            if(res.code === 200){
                this.userInfo = res.data
                localStorage.setItem("cim.userInfo", JSON.stringify(res.data))
            }
            return res
        },
        logout() {
            localStorage.removeItem("cim.username")
            localStorage.removeItem("cim.userInfo")
            localStorage.removeItem("cim.tokenInfo")
            this.isLogin = false
        }
    }
})