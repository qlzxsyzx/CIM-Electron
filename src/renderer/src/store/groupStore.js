import { defineStore } from 'pinia'
import {
  getGroupList,
  createGroup,
  getGroupInfo,
  updateGroupName,
  updateGroupAvatar,
  getGroupMemberList,
  getNoticeListByGroupId,
  publishNewNotice,
  removeNotice,
  dismissGroup,
  exitGroup,
  inviteFriendToJoinGroup,
  removeGroupMember
} from '../api/group'
import { useChatStore } from './chatStore'

export const useGroupStore = defineStore('groupStore', {
  state: () => {
    return {
      groupList: [], // 群组列表
      myGroupSettingMap: new Map(), // 我的群组设置 key:groupId
      groupAndMembersMap: new Map(), // 群成员列表 key:groupId
      currnetGroupInfo: null // 当前群组信息
    }
  },
  actions: {
    async getGroupList() {
      const res = await getGroupList()
      if (res.code === 200) {
        // group,groupSetting
        const groupItemList = res.data
        this.groupList = groupItemList.map((item) => item.group)
        // 向myGroupSettingMap添加
        groupItemList.forEach((element) => {
          this.myGroupSettingMap.set(element.groupSetting.groupId, element.groupSetting)
        })
      }
      return res
    },
    // 创建群组
    async createGroup(createGroupData) {
      const res = await createGroup(createGroupData)
      if (res.code === 200) {
        this.getGroupList()
        const chatStore = useChatStore()
        chatStore.recentChatList.push(res.data)
        chatStore.recordCurrentChatInfo(res.data)
      }
      return res
    },
    // 获取群成员
    getMemberByGroupIdAndUserId(groupId, userId) {
      const memberMap = this.groupAndMembersMap.get(groupId)
      if (!memberMap) {
        return null
      } else {
        return memberMap.get(userId)
      }
    },
    findGroupByGroupId(groupId) {
      return this.groupList.find((item) => item.id === groupId)
    },
    findMyGroupSettingByGroupId(groupId) {
      return this.myGroupSettingMap.get(groupId)
    },
    async getGroupInfo(groupId) {
      const res = await getGroupInfo(groupId)
      if (res.code === 200) {
        // 更新group信息
        this.groupList = this.groupList.filter((item) => item.id !== groupId)
        const group = res.data
        this.groupList.push(group)
        this.currnetGroupInfo = group
        if (res.data.groupSetting) {
          this.myGroupSettingMap.set(groupId, res.data.groupSetting)
        }
      }
      return res
    },
    async updateGroupAvatar(groupId, avatarUrl) {
      const res = await updateGroupAvatar(groupId, avatarUrl)
      if (res.code === 200) {
        // 更新group信息
        const group = this.currnetGroupInfo
        if (group) {
          group.avatarUrl = avatarUrl
        }
      }
      return res
    },
    async updateGroupName(groupId, name) {
      const res = await updateGroupName(groupId, name)
      if (res.code === 200) {
        // 更新group信息
        const group = this.currnetGroupInfo
        if (group) {
          group.name = name
        }
      }
      return res
    },
    async getGroupMemberList(groupId, pageNum, pageSize) {
      const res = await getGroupMemberList(groupId, pageNum, pageSize)
      if (res.code === 200) {
        // 更新group信息
        const memberMap = new Map()
        res.data.forEach((item) => {
          memberMap.set(item.userId, item)
        })
        this.groupAndMembersMap.set(groupId, memberMap)
      }
      return res
    },
    async getNoticeListByGroupId(groupId, pageNum, pageSize) {
      const res = await getNoticeListByGroupId(groupId, pageNum, pageSize)
      if (res.code === 200) {
        if (res.data && res.data.length > 0 && pageNum === 1 && this.currnetGroupInfo) {
          this.currnetGroupInfo.latestNotice = res.data[0]
        }
      }
      return res
    },
    async publishNewNotice(data) {
      const res = await publishNewNotice(data)
      if (res.code === 200) {
        if (this.currnetGroupInfo) {
          this.currnetGroupInfo.latestNotice = res.data
        }
      }
      return res
    },
    async removeNotice(id) {
      const res = await removeNotice(id)
      if (res.code === 200) {
        if (
          this.currnetGroupInfo &&
          this.currnetGroupInfo.latestNotice &&
          this.currnetGroupInfo.latestNotice.id === id
        ) {
          this.currnetGroupInfo.latestNotice = null
        }
      }
      return res
    },
    async dismissGroup(id) {
      const res = await dismissGroup(id)
      if (res.code === 200) {
        if (this.currnetGroupInfo && this.currnetGroupInfo.id === id) {
          this.currnetGroupInfo = null
        }
        this.groupList = this.groupList.filter((item) => item.id !== id)
        this.myGroupSettingMap.delete(id)
        this.groupAndMembersMap.delete(id)
        const chatStore = useChatStore()
        chatStore.removeRecentChatByGroupId(id)
      }
      return res
    },
    async exitGroup(id) {
      const res = await exitGroup(id)
      if (res.code === 200) {
        if (this.currnetGroupInfo && this.currnetGroupInfo.id === id) {
          this.currnetGroupInfo = null
        }
        this.groupList = this.groupList.filter((item) => item.id !== id)
        this.myGroupSettingMap.delete(id)
        this.groupAndMembersMap.delete(id)
        const chatStore = useChatStore()
        chatStore.removeRecentChatByGroupId(id)
      }
      return res
    },
    async inviteFriendToJoinGroup(inviteData) {
      const res = await inviteFriendToJoinGroup(inviteData)
      if (res.code === 200) {
        // 刷新成员信息
        this.getGroupMemberList(inviteData.groupId, 1, 200)
      }
      return res
    },
    async kickGroupMember(kickData) {
      const res = await removeGroupMember(kickData)
      if (res.code === 200) {
        // 刷新成员信息
        this.getGroupMemberList(kickData.groupId, 1, 200)
      }
      return res
    }
  }
})
