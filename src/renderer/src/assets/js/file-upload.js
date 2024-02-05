import { uploadSmallFile, initUploadBigFile, uploadBigFilePart, mergeBigFile } from '../../api/file'
import { ElMessage } from 'element-plus'

// 处理文件上传
const SMALL_FILE_SIZE = 1024 * 1024 * 10 // 10MB

const DEFAULT_CHUNK_SIZE = 1024 * 1024 * 5 // 5MB

export const fileUpload = (file, userId) => {
  if (!file) return
  // 先判断是否是大文件
  let fileState = {
    value: 0
  }
  const fileSize = file.size
  if (fileSize > SMALL_FILE_SIZE) {
    // 如果是大文件，可以考虑分片上传或使用第三方
    bigFileUpload(file, userId, fileState)
  } else {
    // 如果是小文件，可以直接使用FormData进行上传
    smallFileUpload(file, fileState)
  }
}

export const fileUplaodWithProgress = (file, userId, fileState) => {
  if (!file) return
  // 先判断是否是大文件
  const fileSize = file.size
  if (fileSize > SMALL_FILE_SIZE) {
    // 如果是大文件，可以考虑分片上传或使用第三方
    bigFileUpload(file, userId, fileState)
  } else {
    // 如果是小文件，可以直接使用FormData进行上传
    smallFileUpload(file, fileState)
  }
}

const smallFileUpload = (file, fileState) => {
  const formData = new FormData()
  formData.append('file', file)
  // axios发送文件
  uploadSmallFile(formData, (event) => {
    fileState.progress = Math.round((event.loaded / event.total) * 100)
  })
    .then((res) => {
      if (res.code === 200) {
        ElMessage.success('文件上传成功')
        fileState.status = 1
        fileState.recordId = res.data.recordId
      } else {
        ElMessage.error('文件上传失败')
      }
    })
    .catch((err) => {
      ElMessage.error('文件上传失败')
    })
}

const bigFileUpload = async (file, userId, fileState) => {
  // 将大文件进行分片处理
  const chunkSize = DEFAULT_CHUNK_SIZE
  const chunkCount = Math.ceil(file.size / chunkSize)
  const initBigFileInfo = {
    userId: userId,
    fileName: file.name,
    fileSize: file.size,
    segmentCount: chunkCount,
    segmentSize: chunkSize
  }
  // 初始化大文件上传，将文件上传信息返回给用户
  const parts = []
  const uploadSize = []
  let hasUpload = 0
  initUploadBigFile(initBigFileInfo)
    .then((res) => {
      if (res.code === 200) {
        const data = res.data
        fileState.recordId = data.recordId
        // 分片并行上传
        for (let i = 0; i < chunkCount; i++) {
          const start = i * chunkSize
          const end = Math.min(start + chunkSize, file.size)
          const chunk = file.slice(start, end)
          const formData = new FormData()
          formData.append('file', chunk)
          formData.append('recordId', data.recordId)
          formData.append('segmentId', data.segmentIds[i])
          formData.append('fileName', data.fileName)
          // 发送分片文件
          const res2 = uploadBigFilePart(formData, (progressEvent) => {
            uploadSize[i] = progressEvent.loaded
            hasUpload = uploadSize.reduce((a, b) => a + b, 0)
            // 更新上传进度
            fileState.progress = Math.round((hasUpload / file.size) * 100)
          })
          parts.push(res2)
        }
        // 等待所有分片上传完成
        let total = 0
        const failParts = []
        Promise.all(parts).then((results) => {
          for (let i = 0; i < results.length; i++) {
            try {
              const res = results[i]
              if (res.code === 200) {
                total++
                console.log('第' + (i + 1) + '个分片上传成功')
              } else {
                console.log('第' + (i + 1) + '个分片上传失败')
                failParts.push(i)
              }
            } catch (err) {
              console.log('第' + (i + 1) + '个分片上传失败')
              failParts.push(i)
            }
          }
          if (total === parts.length) {
            // 发出合并文件请求
            mergeBigFile({ recordId: res.data.recordId })
              .then((res) => {
                if (res.code === 200) {
                  ElMessage.success('文件上传成功')
                  fileState.status = 1
                } else {
                  ElMessage.error('文件上传失败')
                }
              })
              .catch((err) => {
                ElMessage.error('文件上传失败')
              })
          }
        })
      } else {
        ElMessage.error('文件请求上传失败')
      }
    })
    .catch((err) => {
      ElMessage.error('文件请求上传失败')
    })
}
