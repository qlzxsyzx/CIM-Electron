import { defineStore } from 'pinia'
import { getFriendList, blockUser, removeFriend } from '../api/friend'
import { useUserInfoStore } from './userInfoStore'
import { useChatStore } from './chatStore'

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
      return this.friendList.find((item) => item.friendId == userId)
    },
    findFriendById(id) {
      return this.friendList.find((item) => item.id == id)
    },
    async blockUser(friendId) {
      const res = await blockUser(friendId)
      if (res.code === 200) {
        const index = this.friendList.find((item) => item.friendId === friendId)
        if (index !== -1) {
          this.friendList.splice(index, 1)
          const chatStore = useChatStore()
          chatStore.removeRecentChatByToUserId(friendId)
        }
      }
      return res
    },
    async deleteFriend(friendId) {
      const res = await removeFriend(friendId)
      if (res.code === 200) {
        const index = this.friendList.findIndex((item) => item.friendId === friendId)
        if (index !== -1) {
          this.friendList.splice(index, 1)
          const chatStore = useChatStore()
          chatStore.removeRecentChatByToUserId(friendId)
        }
      }
      return res
    }
  }
})
