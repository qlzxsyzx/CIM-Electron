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