import request from '../assets/js/request'

export function uploadSmallFile(userId,formData) {
    return request({
        url: '/im-file/file/upload/' + userId,
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: formData
    })
}

export function initUploadBigFile(data) {
    return request({
        url: '/im-file/file/initUploadBigFile',
        method: 'post',
        data: data
    })
}

export function uploadBigFilePart(formData) {
    return request({
        url: '/im-file/file/uploadBigFilePart',
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: formData
    })
}

export function mergeBigFile(data) {
    return request({
        url: '/im-file/file/mergeBigFile',
        method: 'post',
        data: data
    })
}
