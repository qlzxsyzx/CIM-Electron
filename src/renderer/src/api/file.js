import request from '../assets/js/request'

export function uploadSmallFile(formData, uploadProgress) {
  return request({
    url: '/im-file/file/upload',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData,
    onUploadProgress: (progressEvent) => {
      uploadProgress(progressEvent)
    }
  })
}

export function initUploadBigFile(data) {
  return request({
    url: '/im-file/file/initUploadBigFile',
    method: 'post',
    data: data
  })
}

export function uploadBigFilePart(formData, uploadProgress) {
  return request({
    url: '/im-file/file/uploadBigFilePart',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData,
    onUploadProgress: (progressEvent) => {
      uploadProgress(progressEvent)
    }
  })
}

export function mergeBigFile(data) {
  return request({
    url: '/im-file/file/mergeBigFile',
    method: 'post',
    data: data
  })
}

export function downloadSmallFile(recordId, downloadProgress) {
  return request({
    url: '/im-file/file/downloadSmallFile/' + recordId,
    method: 'get',
    responseType: 'arraybuffer',
    onDownloadProgress: (progressEvent) => {
      downloadProgress(progressEvent)
    }
  })
}

export function initDownloadBigFile(recordId) {
  return request({
    url: '/im-file/file/initDownloadBigFile/' + recordId,
    method: 'post'
  })
}

export function downloadBigFilePart(recordId, partNum, partSize, downloadProgress) {
  return request({
    url: '/im-file/file/downloadBigFilePart/' + recordId + '/' + partNum + '/' + partSize,
    method: 'get',
    responseType: 'arraybuffer',
    onDownloadProgress: (progressEvent) => {
      downloadProgress(progressEvent)
    }
  })
}
