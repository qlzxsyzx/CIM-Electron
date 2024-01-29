import request from '../assets/js/request'

export function searchByUsername(username){
    return request({
        url:'/im-web/friend/searchByUsername/' + username,
        method:'get'
    })
}

export function applyAddFriend(applyFriendDto){
    return request({
        url:'/im-web/friend/applyAddFriend',
        method:'post',
        data:applyFriendDto
    })
}

export function getFriendList(){
    return request({
        url:'/im-web/friend/getFriendList',
        method:'get'
    })
}

export function getApplyFriendMessageList(){
    return request({
        url:'/im-web/friend/getApplyFriendMessageList',
        method:'get'
    })
}

export function agreeAddFriend(agreeApplyFriendMessageDto){
    return request({
        url:'/im-web/friend/agreeAddFriend',
        method:'post',
        data:agreeApplyFriendMessageDto
    })
}

export function refuseAddFriend(applyFriendMessageId){
    return request({
        url:'/im-web/friend/refuseAddFriend/' + applyFriendMessageId,
        method:'post',
    })
}