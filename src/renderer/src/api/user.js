import request from '../assets/js/request'

export function getUserInfo(userId){
    return request({
        url:'/im-web/user/getUserInfo/' + userId,
        method:'get'
    })
}

export function updateUserName(data) {
    return request({
        url: '/im-user/userInfo/updateUserName',
        method: 'post',
        data
    })
}

export function updateUserAvatar(data) {
    return request({
        url: '/im-user/userInfo/updateUserAvatar',
        method: 'post',
        data
    })
}

export function updateUserGender(gender) {
    return request({
        url: '/im-user/userInfo/updateUserGender/' + gender,
        method: 'post'
    })
}

export function updateUserPassword(data) {
    return request({
        url: '/im-user/userInfo/updateUserPassword',
        method: 'post',
        data
    })
}
