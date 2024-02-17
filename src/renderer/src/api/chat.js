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

export function getChatMessageList(data){
    return request({
        url:'/im-web/chat/getChatMessageList',
        method:'post',
        data
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

export function getSingleChatMessageHistory(data){
    return request({
        url:'/im-web/chat/getSingleChatMessageHistory',
        method:'post',
        data
    })
}


export function getGroupChatMessageHistory(data){
    return request({
        url:'/im-web/chat/getSingleChatMessageHistory',
        method:'post',
        data
    })
}
