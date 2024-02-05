import { defineStore } from 'pinia'

export const useUserInfoStore = defineStore('userInfoStore', {
  state: () => {
    return {
        userInfoMap: new Map(), // 用户信息列表 key:userId
    }
  },
  actions: {
    setUserInfo(userId, userInfo){
      this.userInfoMap.set(userId, userInfo)
    },
    getUserInfo(userId){
      return this.userInfoMap.get(userId)
    }
  }
})
