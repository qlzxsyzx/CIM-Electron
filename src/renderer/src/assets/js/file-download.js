import { ElMessage } from 'element-plus'
import { downloadSmallFile, initDownloadBigFile, downloadBigFilePart } from '../../api/file'

// 处理文件下载
const SMALL_FILE_SIZE = 1024 * 1024 * 10 // 10MB

const DEFAULT_CHUNK_SIZE = 1024 * 1024 * 5 // 5MB

export const fileDownlaodWithProgress = (
  recordId,
  fileName,
  fileSize,
  progressCallback,
  resultCallback
) => {
  if (!recordId) return
  if (fileSize > SMALL_FILE_SIZE) {
    // 如果是大文件，分片下载
    bigFileDownload(recordId, fileName, fileSize, progressCallback, resultCallback)
  } else {
    // 如果是小文件，直接下载
    smallFileDownload(recordId, fileName, fileSize, progressCallback, resultCallback)
  }
}

const smallFileDownload = (recordId, fileName, fileSize, progressCallback, resultCallback) => {
  // axios下载文件
  downloadSmallFile(recordId, (event) => {
    progressCallback(Math.round((event.loaded / fileSize) * 100))
  })
    .then((res) => {
      window.api
        .download(res, fileName)
        .then((res) => {
          if (res === 'success') {
            console.log('文件下载成功')
            resultCallback('success')
          }
        })
        .catch((err) => {
          throw err
        })
    })
    .catch((err) => {
      console.log('文件下载失败', err)
      resultCallback('fail')
    })
}

const bigFileDownload = async (recordId, fileName, fileSize, progressCallback, resultCallback) => {
  // 将大文件进行分片处理
  const chunkSize = DEFAULT_CHUNK_SIZE
  const chunkCount = Math.ceil(fileSize / chunkSize)
  // 初始化大文件下载，将文件下载信息返回给用户
  const parts = []
  const downLoadSize = []
  let hasDownload = 0
  initDownloadBigFile(recordId)
    .then((res) => {
      if (res.code === 200) {
        const recordName = res.data.realName
        // 分片并行下载
        for (let i = 0; i < chunkCount; i++) {
          const promise = async () => {
            const res2 = await downloadBigFilePart(recordId, i, chunkSize, (progressEvent) => {
              downLoadSize[i] = progressEvent.loaded
              hasDownload = downLoadSize.reduce((a, b) => a + b, 0)
              progressCallback(Math.round((hasDownload / fileSize) * 100))
            })
            const partName = recordName + '_' + i + '.part'
            return window.api.download(res2, partName)
          }
          parts.push(promise())
        }
        // 等待所有分片下载完成
        let total = 0
        const failParts = []
        Promise.all(parts).then((results) => {
          for (let i = 0; i < results.length; i++) {
            try {
              const res = results[i]
              if (res === 'success') {
                console.log('第' + (i + 1) + '个分片下载完成')
                total++
              }
            } catch (err) {
              console.log('第' + (i + 1) + '个分片下载失败', err)
              failParts.push(i)
            }
          }
          console.log('所有分片下载完成', total, parts.length)
          if (total === parts.length) {
            window.api
              .mergeFile(fileName, recordName, chunkCount)
              .then((res) => {
                if (res === 'success') {
                  console.log('文件下载完成')
                  resultCallback('success')
                }
              })
              .catch((err) => {
                console.log('文件合并失败', err)
                resultCallback('fail')
              })
          } else {
            // 分片没有下载完全
            resultCallback('fail')
          }
        }).catch((err) => {
          console.log('获取文件信息失败', err)
          resultCallback('fail')
        })
      } else {
        resultCallback('fail')
      }
    })
    .catch((err) => {
      console.log('获取文件信息失败', err)
      resultCallback('fail')
    })
}
