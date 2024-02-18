import { defineStore } from 'pinia'
import {
  recentChatList,
  createSingleChat,
  createGroupChat,
  sendMessage,
  getChatMessageList
} from '../api/chat'

export const useChatStore = defineStore('chatStore', {
  state: () => {
    return {
      recentChatList: [], // 最近聊天列表
      currentChatInfo: {}, // 当前聊天信息
      currentChatHistory: [] // 当前聊天记录
    }
  },
  actions: {
    async getRecentChatList() {
      const res = await recentChatList()
      if (res.code === 200) {
        // recentChat,sender,lastMessage
        this.recentChatList = res.data
      }
      return res
    },
    findRecentChatByToUserId(toUserId) {
      return this.recentChatList.find((item) => item.recentChat.toUserId === toUserId)
    },
    findRecentChatByGroupId(groupId) {
      return this.recentChatList.find((item) => item.recentChat.groupId === groupId)
    },
    findRecentChatByRoomId(roomId) {
      return this.recentChatList.find((item) => item.recentChat.roomId === roomId)
    },
    removeRecentChatByToUserId(toUserId) {
      this.recentChatList = this.recentChatList.filter(
        (item) => item.recentChat.toUserId !== toUserId
      )
      // 如果是当前会话
      if (this.currentChatInfo.recentChat.toUserId === toUserId) {
        this.currentChatInfo = {}
        this.currentChatHistory = []
      }
    },
    removeRecentChatByGroupId(groupId) {
      this.recentChatList = this.recentChatList.filter(
        (item) => item.recentChat.groupId !== groupId
      )
      // 如果是当前会话
      if (this.currentChatInfo.recentChat.groupId === groupId) {
        this.currentChatInfo = {}
        this.currentChatHistory = []
      }
    },
    recordCurrentChatInfo(recentChat) {
      this.currentChatInfo = recentChat
      this.currentChatInfo.recentChat.unreadCount = 0
    },
    // 获取分页聊天记录
    async getChatMessageList(roomId, pageSize) {
      const lastMessage = this.currentChatHistory[this.currentChatHistory.length - 1]
      const params = {
        roomId,
        lastMessageId: lastMessage
          ? lastMessage.roomId === roomId
            ? lastMessage.messageId
            : ''
          : '',
        pageSize: pageSize
      }
      const res = await getChatMessageList(params)
      if (res.code === 200) {
        this.currentChatHistory = res.data
        if (res.data.length > 0) {
          this.recentChatList.find((item) => item.recentChat.roomId === roomId).lastMessage =
            res.data[0]
        }
      }
      return res
    },
    async getMoreChatMessages(roomId, pageSize) {
      const params = {
        roomId,
        lastMessageId: this.currentChatHistory[this.currentChatHistory.length - 1]?.messageId,
        pageSize: pageSize
      }
      const res = await getChatMessageList(params)
      if (res.code === 200) {
        this.currentChatHistory = Array.prototype.concat.apply(this.currentChatHistory, res.data)
      }
      return res
    },
    async sendMessage(sendingMessage, data) {
      const message = this.currentChatHistory.find(
        (item) => item.messageId === sendingMessage.messageId
      )
      try {
        const res = await sendMessage(data)
        if (res.code === 200) {
          message.sendStatus = 1
          message.messageId = res.data.messageId
          message.createTime = res.data.createTime
          const chatItem = this.recentChatList.find((item) => item.recentChat.roomId == data.roomId)
          this.recentChatList = this.recentChatList.filter(
            (item) => item.recentChat.roomId != data.roomId
          )
          chatItem.lastMessage = res.data
          this.recentChatList.unshift(chatItem)
        } else {
          message.sendStatus = -1
        }
        return res
      } catch (err) {
        message.sendStatus = -1
        throw err
      }
    },
    // 向当前会话聊天记录添加消息
    addCurrentChatHistory(msg) {
      this.currentChatHistory.unshift(msg)
      this.currentChatInfo.lastMessage = msg
    },
    async addSingleChat(friendId){
      const res = await createSingleChat(friendId)
      if(res.code === 200){
        this.recentChatList.unshift(res.data)
      }
      return res
    },
    async addGroupChat(groupId){
      const res = await createGroupChat(groupId)
      if(res.code === 200){
        this.recentChatList.unshift(res.data)
      }
      return res
    },
    async createSingleChat(friendId) {
      const res = await createSingleChat(friendId)
      if (res.code === 200) {
        this.recentChatList.unshift(res.data)
        this.currentChatInfo = res.data
        this.currentChatHistory = []
      }
      return res
    },
    async createGroupChat(groupId) {
      const res = await createGroupChat(groupId)
      if (res.code === 200) {
        this.recentChatList.unshift(res.data)
        this.currentChatInfo = res.data
        this.currentChatHistory = []
      }
      return res
    }
  }
})
