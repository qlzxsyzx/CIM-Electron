import { defineStore } from 'pinia'
import { getGroupList, createGroup } from '../api/group'
import { useChatStore } from './chatStore'

export const useGroupStore = defineStore('groupStore', {
  state: () => {
    return {
      groupList: [], // 群组列表
      myGroupSettingMap: new Map(), // 我的群组设置 key:groupId
      groupAndMembersMap: new Map() // 群成员列表 key:groupId
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
        this.groupList.push(res.data.groupVo)
        const chatStore = useChatStore()
        chatStore.recentChatList.push(res.data)
      }
      return res
    },
    // 获取群成员
    getMemberByGroupIdAndUserId(groupId, userId){
      return this.groupAndMembersMap.get(groupId).find(item=>item.userId === userId)
    },
    findGroupByGroupId(groupId){
      return this.groupList.find(item=>item.groupId === groupId)
    },
    findMyGroupSettingByGroupId(groupId){
      return this.myGroupSettingMap.get(groupId)
    }
  }
})
