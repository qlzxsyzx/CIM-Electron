import { uploadSmallFile,initUploadBigFile,uploadBigFilePart,mergeBigFile } from '../../api/file'
import { ElMessage } from 'element-plus';

// 处理文件上传
const SMALL_FILE_SIZE = 1024 * 1024; // 1MB

const DEFAULT_CHUNK_SIZE = 1024 * 1024 * 5; // 5MB

export const fileUpload = (file,userId) => {
    // 先判断是否是大文件
    const fileSize = file.size;
    if (fileSize > SMALL_FILE_SIZE) {
        // 如果是大文件，可以考虑分片上传或使用第三方
        bigFileUpload(file,userId)
    } else{
        // 如果是小文件，可以直接使用FormData进行上传
        smallFileUpload(file,userId)
    }
}

const smallFileUpload = (file,userId) => {
    const formData = new FormData();
    formData.append('file', file);
    // axios发送文件
    uploadSmallFile(userId,formData).then(res => {
        if (res.code === 200) {
            // 在这里将文件上传的信息发送给用户显示
            return res
        }else {
            ElMessage.error('文件上传失败');
        }
    }).catch(err =>{
        ElMessage.error('文件上传失败');
    })
}

const bigFileUpload = (file,userId) => {
    // 将大文件进行分片处理
    const chunkSize = DEFAULT_CHUNK_SIZE;
    const chunkCount = Math.ceil(file.size / chunkSize);
    const initBigFileInfo = {
        userId: userId,
        fileName: file.name,
        fileSize: file.size,
        segmentCount: chunkCount,
        segmentSize: chunkSize
    }
    // 初始化大文件上传，将文件上传信息返回给用户
    const parts = []
    initUploadBigFile(initBigFileInfo).then(async res => {
        if(res.code === 200){
            // 分片并行上传
            for (let i = 0; i < chunkCount; i++) {
                const start = i * chunkSize;
                const end = Math.min(start + chunkSize, file.size);
                const chunk = file.slice(start, end);
                const formData = new FormData();
                formData.append('file', chunk);
                formData.append('recordId', res.data.recordId);
                formData.append('segmentId', res.data.segmentIds[i]);
                formData.append('fileName', res.data.fileName);
                // 发送分片文件
                try{
                    const res2 = uploadBigFilePart(formData)
                    parts.push(res2)
                }catch(err){
                    parts.push({code: 500, message: '上传失败',index: i})
                }
            }
            // 等待所有分片上传完成
            let total = 0;
            const failParts = [];
            for (let i = 0; i < parts.length; i++) {
                try{
                    const res = await parts[i];
                    if(res.code === 200){
                        total++;
                        console.log('第' + (i + 1) + '个分片上传成功');
                    }else {
                        console.log('第' + (i + 1) + '个分片上传失败');
                        failParts.push(i);
                    }
                }catch(err){
                    console.log('第' + (i + 1) + '个分片上传失败');
                    failParts.push(i);
                }
            }
            if(total === parts.length){
                // 发出合并文件请求
                mergeBigFile({recordId:res.data.recordId}).then(res =>{
                    if(res.code === 200){
                        ElMessage.success('文件上传成功');
                    }else {
                        ElMessage.error('文件上传失败');
                    }
                }).catch(err => {
                    ElMessage.error('文件上传失败');
                })
            }
        }else {
            ElMessage.error('文件请求上传失败');
        }
    }).catch(err =>{
        ElMessage.error('文件请求上传失败');
    })
}