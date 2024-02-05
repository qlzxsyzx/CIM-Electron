import { defineStore } from 'pinia'
import { getFriendList } from '../api/friend'
import { useUserInfoStore } from './userInfoStore'

export const useFriendStore = defineStore('friendStore', {
  state: () => {
    return {
      friendList: [] // 好友列表
    }
  },
  actions: {
    getFriendList() {
      getFriendList().then((res) => {
        if (res.code === 200) {
          const friendItemList = res.data
          this.friendList = friendItemList.map((item) => item.friend)
          // 向userInfoMap添加
          const userInfoStore = useUserInfoStore()
          friendItemList.forEach((element) => {
            userInfoStore.setUserInfo(element.userInfo.userId, element.userInfo)
          })
        }
      })
    },
    findFriendByUserId(userId) {
        return this.friendList.find(item => item.friendId == userId)
    },
    findFriendById(id){
      return this.friendList.find(item => item.id == id)
    }
  }
})
