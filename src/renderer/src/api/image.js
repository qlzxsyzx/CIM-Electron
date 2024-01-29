import request from '../assets/js/request'

export function uploadImage(formData) {
    return request({
        url: '/im-file/image/uploadImage',
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: formData
    })
}

export function getByName(name) {
    return import.meta.env.RENDERER_VITE_BASE_URL + '/im-file/image/getByName/' + name
}