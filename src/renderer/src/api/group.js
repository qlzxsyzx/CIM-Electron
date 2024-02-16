import request from '../assets/js/request'

export function getGroupList() {
  return request({
    url: '/im-web/group/getGroupList',
    method: 'get'
  })
}

export function createGroup(groudData) {
  return request({
    url: '/im-web/group/createGroup',
    method: 'post',
    data: groudData
  })
}

export function getGroupInfo(groupId) {
  return request({
    url: '/im-web/group/getGroupInfo/' + groupId,
    method: 'get'
  })
}

export function updateGroupRemark(settingId, remark) {
  return request({
    url: '/im-web/group/updateGroupRemark',
    method: 'post',
    data: {
      id: settingId,
      remark: remark
    }
  })
}

export function updateUserNickName(settingId, userNickName) {
  return request({
    url: '/im-web/group/updateUserNickName',
    method: 'post',
    data: {
      id: settingId,
      userNickName: userNickName
    }
  })
}

export function updateGroupPromptStatus(settingId, status) {
  return request({
    url: '/im-web/group/updateGroupPromptStatus/' + settingId + '/' + status,
    method: 'post'
  })
}

export function updateGroupDescription(groupId, description) {
  return request({
    url: '/im-web/group/updateGroupDescription',
    method: 'post',
    data: {
      groupId: groupId,
      description: description
    }
  })
}

export function updateGroupName(groupId, name) {
  return request({
    url: '/im-web/group/updateGroupName',
    method: 'post',
    data: {
      groupId: groupId,
      name: name
    }
  })
}

export function updateGroupAvatar(groupId, url) {
  return request({
    url: '/im-web/group/updateGroupAvatar',
    method: 'post',
    data: {
      groupId: groupId,
      avatarUrl: url
    }
  })
}

export function getGroupMemberList(groupId, pageNum, pageSize) {
  return request({
    url: '/im-web/group/getGroupMemberList/' + groupId + '/' + pageNum + '/' + pageSize,
    method: 'get'
  })
}

export function getNoticeListByGroupId(groupId, pageNum, pageSize) {
  return request({
    url: '/im-web/group/getNoticeListByGroupId/' + groupId + '/' + pageNum + '/' + pageSize,
    method: 'get'
  })
}

export function publishNewNotice(createData) {
  return request({
    url: '/im-web/group/publishNewNotice',
    method: 'post',
    data: createData
  })
}

export function removeNotice(id) {
  return request({
    url: '/im-web/group/removeNotice/' + id,
    method: 'post'
  })
}

export function updateGroupNoSpeakStatus(groupId, status) {
  return request({
    url: '/im-web/group/updateGroupNoSpeakStatus/' + groupId + '/' + status,
    method: 'post'
  })
}

export function getCandidateMemberList(groupId) {
  return request({
    url: '/im-web/group/getCandidateMemberList/' + groupId,
    method: 'get'
  })
}

export function transferGroup(groupId, memberId) {
  return request({
    url: '/im-web/group/transferGroup',
    method: 'post',
    data: { groupId: groupId, memberId: memberId }
  })
}

export function dismissGroup(groupId) {
  return request({
    url: '/im-web/group/dismissGroup/' + groupId,
    method: 'post'
  })
}

export function inviteFriendToJoinGroup(data) {
  return request({
    url: '/im-web/group/inviteFriendToJoinGroup',
    method: 'post',
    data: data
  })
}

export function removeGroupMember(data) {
  return request({
    url: '/im-web/group/removeGroupMember',
    method: 'post',
    data: data
  })
}

export function exitGroup(groupId) {
  return request({
    url: '/im-web/group/exitGroup/' + groupId,
    method: 'post'
  })
}

export function searchGroupById(groupId) {
  return request({
    url: '/im-web/group/searchGroupById/' + groupId,
    method: 'get'
  })
}

export function getGroupNotificationList(pageNum, pageSize) {
  return request({
    url: '/im-web/group/getGroupNotificationList/' + pageNum + '/' + pageSize,
    method: 'get'
  })
}

export function applyAddGroup(applyData) {
  return request({
    url: '/im-web/group/applyAddGroup',
    method: 'post',
    data: applyData
  })
}

export function agreeJoinGroupApply(groupNotificationId) {
  return request({
    url: '/im-web/group/agreeJoinGroupApply/' + groupNotificationId,
    method: 'post'
  })
}

export function refuseJoinGroupApply(groupNotificationId) {
  return request({
    url: '/im-web/group/refuseJoinGroupApply/' + groupNotificationId,
    method: 'post'
  })
}

export function agreeGroupInvite(groupNotificationId) {
  return request({
    url: '/im-web/group/agreeGroupInvite/' + groupNotificationId,
    method: 'post'
  })
}

export function refuseGroupInvite(groupNotificationId) {
  return request({
    url: '/im-web/group/refuseGroupInvite/' + groupNotificationId,
    method: 'post'
  })
}

export function deleteGroupNotification(groupNotificationId) {
  return request({
    url: '/im-web/group/deleteGroupNotification/' + groupNotificationId,
    method: 'post'
  })
}

export function getMemberInfo(groupId,userId) {
  return request({
    url: '/im-web/group/getMemberInfo/'+ groupId + '/' + userId,
    method: 'get'
  })
}