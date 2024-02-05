import request from '../assets/js/request'

export function recentChatList(){
    return request({
        url:'/im-web/chat/recentChatList',
        method:'get'
    })
}

export function createSingleChat(friendId){
    return request({
        url:'/im-web/chat/createSingleChat/' + friendId,
        method:'post'
    })
}

export function createGroupChat(groupId){
    return request({
        url:'/im-web/chat/createGroupChat/' + groupId,
        method:'post'
    })
}

export function getChatMessageList(roomId,pageNum,pageSize){
    return request({
        url:'/im-web/chat/getChatMessageList/' + roomId + '/' + pageNum + '/' + pageSize,
        method:'get'
    })
}

export function sendMessage(createMessageDto){
    return request({
        url:'/im-web/chat/sendMessage',
        method:'post',
        data:createMessageDto
    })
}

export function topChat(id,status){
    return request({
        url:'/im-web/chat/topChat/' + id + "/" + status,
        method:'post'
    })
}