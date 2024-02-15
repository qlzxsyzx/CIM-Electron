import request from '../assets/js/request'

export function getUserInfo(userId){
    return request({
        url:'/im-web/user/getUserInfo/' + userId,
        method:'get'
    })
}