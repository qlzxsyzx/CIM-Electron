import request from '../assets/js/request'

export function getUserInfo(){
    return request({
        url:'/im-web/user/getUserInfo',
        method:'get'
    })
}