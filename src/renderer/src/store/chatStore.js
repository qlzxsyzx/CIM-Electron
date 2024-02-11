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
    findRecentChatByToUserId(toUserId){
      return this.recentChatList.find((item) => item.recentChat.toUserId == toUserId)
    },
    findRecentChatByGroupId(groupId) {
      return this.recentChatList.find((item) => item.recentChat.groupId == groupId)
    },
    findRecentChatByRoomId(roomId) {
      return this.recentChatList.find((item) => item.recentChat.roomId == roomId)
    },
    removeRecentChatByToUserId(toUserId) {
      this.recentChatList = this.recentChatList.filter(
        (item) => item.recentChat.toUserId !== toUserId
      )
      // 如果是当前会话
      if (this.currentChatInfo.toUserId === toUserId) {
        this.currentChatInfo = {}
        this.currentChatHistory = []
      }
    },
    recordCurrentChatInfo(recentChat) {
      this.currentChatInfo = recentChat
    },
    // 获取分页聊天记录
    async getChatMessageList(roomId) {
      const res = await getChatMessageList(roomId, 1, 10)
      if (res.code === 200) {
        this.currentChatHistory = res.data.reverse()
        if (res.data.length > 0) {
          this.recentChatList.find((item) => item.recentChat.roomId === roomId).lastMessage =
            res.data[res.data.length - 1]
        }
      }
      return res
    },
    async getMoreChatMessages(roomId, pageNum, pageSize) {
      const res = await getChatMessageList(roomId, pageNum, pageSize)
      if (res.code === 200) {
        Array.prototype.unshift.apply(this.currentChatHistory, res.data.reverse())
      }
      return res
    },
    async sendMessage(sendingMessage, data) {
      const res = await sendMessage(data)
      if (res.code === 200) {
        sendingMessage.messageId = res.data.messageId
        sendingMessage.createTime = res.data.createTime
        sendingMessage.sendStatus = 1
        const chatItem = this.recentChatList.find((item) => item.recentChat.roomId == data.roomId)
        this.recentChatList = this.recentChatList.filter(
          (item) => item.recentChat.roomId != data.roomId
        )
        chatItem.lastMessage = res.data
        this.recentChatList.unshift(chatItem)
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
        this.currentChatInfo = res.data.recentChat
      }
      return res
    },
    async createGroupChat(groupId) {
      const res = await createGroupChat(groupId)
      if (res.code === 200) {
        this.recentChatList.unshift(res.data)
        this.currentChatInfo = res.data.recentChat
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
