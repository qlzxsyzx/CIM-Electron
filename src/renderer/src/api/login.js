import request from '../assets/js/request'

export function login(data) {
    return request({
        url: '/im-user/auth/login',
        method: 'post',
        data
    })
}

export function register(data) {
    return request({
        url: '/im-user/auth/register',
        method: 'post',
        data
    })
}