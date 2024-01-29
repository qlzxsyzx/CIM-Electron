import request from '../assets/js/request'

export function getGroupList(){
    return request({
        url:'/im-web/group/getGroupList',
        method:'get'
    })
}

export function createGroup(groudData){
    return request({
        url:'/im-web/group/createGroup',
        method:'post',
        data:groudData
    })
}