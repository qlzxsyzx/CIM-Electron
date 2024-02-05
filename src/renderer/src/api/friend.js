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

export function blockFriend(friendId){
    return request({
        url:'/im-web/friend/blockFriend/' + friendId,
        method:'post',
    })
}

export function removeFriend(friendId){
    return request({
        url:'/im-web/friend/removeFriend/' + friendId,
        method:'post',
    })
}

export function updatePromptStatus(id,status){
    return request({
        url:'/im-web/friend/updatePromptStatus/' + id + "/" + status,
        method:'post',
    })
}

export function getBlackList(){
    return request({
        url:'/im-web/friend/getBlackList',
        method:'get'
    })
}

export function removeBlackList(friendId){
    return request({
        url:'/im-web/friend/removeBlackList/' + friendId,
        method:'post'
    })
}