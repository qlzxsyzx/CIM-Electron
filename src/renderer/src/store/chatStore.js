import { defineStore } from 'pinia'
import { getFriendList } from '../api/friend'
import {
  recentChatList,
  createSingleChat,
  createGroupChat,
  sendMessage,
  getChatMessageList
} from '../api/chat'
import { getGroupList, createGroup } from '../api/group'

export const useChatStore = defineStore('chatStore', {
  state: () => {
    return {
      friends: [], // 好友列表
      groupList: [], // 群组列表
      recentChatList: [], // 最近聊天列表
      userInfoList: [], // 用户信息列表
      groupMemberList: [], // 群成员列表
      currentChatInfo: {}, // 当前聊天信息
      currentChatHistory: [] // 当前聊天记录
    }
  },
  actions: {
    getFriends() {
      getFriendList().then((res) => {
        if (res.code === 200) {
          this.friends = res.data
        }
      })
    },
    getGroupList() {
      getGroupList().then((res) => {
        if (res.code === 200) {
          this.groupList = res.data
        }
      })
    },
    async getRecentChatList() {
      const res = await recentChatList()
      if (res.code === 200) {
        this.recentChatList = res.data
      }
      return res
    },
    // 创建群组
    async createGroup(createGroupData) {
      const res = await createGroup(createGroupData)
      if (res.code === 200) {
        this.groupList.push(res.data.groupVo)
        this.recentChatList.push(res.data)
      }
      return res
    },
    recordCurrentChatInfo(roomId){
      this.currentChatInfo = this.recentChatList.find(item => item.roomId == roomId)
    },
    // 获取分页聊天记录
    async getChatMessageList(roomId, pageNum, pageSize) {
      const res = await getChatMessageList(roomId, pageNum, pageSize)
      if (res.code === 200) {
        this.currentChatHistory = res.data.reverse()
      }
      return res
    },
    async sendMessage(data) {
      const res = await sendMessage(data)
      if (res.code === 200) {
        this.addCurrentChatHistory(res.data)
      }
      return res
    },
    // 向当前会话聊天记录添加消息
    addCurrentChatHistory(msg) {
      this.currentChatHistory.push(msg)
    },
    async createSingleChat(friendId) {
      const res = await createSingleChat(friendId)
      if (res.code === 200) {
        this.recentChatList.unshift(res.data)
      }
      return res
    },
    async createGroupChat(groupId){
      const res = await createGroupChat(groupId)
      if (res.code === 200) {
        this.recentChatList.unshift(res.data)
      }
      return res
    },
    // 更新会话最新消息和未读数
    updateRecentChat(msg) {
      const roomId = msg.roomId
      // 获取这个会话记录
      const recentChat = this.recentChatList.find((item) => item.roomId == roomId)
      // 去掉这个会话记录
      this.recentChatList = this.recentChatList.filter((item) => item.roomId != roomId)
      // 更新这个会话记录
      recentChat.lastMessage = msg
      recentChat.unreadCount++
      // 重新添加这个会话记录
      this.recentChatList.unshift(recentChat)
    }
  }
})
