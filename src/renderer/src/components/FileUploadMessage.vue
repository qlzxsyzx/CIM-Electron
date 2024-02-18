<template>
    <div class="chat-msg-file-container" v-if="fileInfo">
        <div class="file-top">
            <div class="file-icon">
                <SvgIcon :iconName="icon" class="icon" />
            </div>
            <div class="file-status">
                <div class="file-info">
                    <span class="file-name">
                        {{ fileInfo.fileName }}
                    </span>
                    <span class="file-size">
                        {{ formatFileSize(fileInfo.fileSize) }}
                    </span>
                </div>
                <div class="file-tip">
                    <template v-if="fileInfo.status === 0">
                        <el-progress style="width: 100%;margin-bottom: 10px;" :percentage="fileInfo.progress" striped
                            striped-flow></el-progress>
                    </template>
                    <template v-else-if="fileInfo.status === 1">
                        <el-icon color="#95d475" size="20px" class="file-mark">
                            <CircleCheckFilled />
                        </el-icon>
                        发送成功
                    </template>
                    <template v-else-if="fileInfo.status === 2">
                        <el-icon color="#F56C6C" size="20px" class="file-mark">
                            <CircleCloseFilled />
                        </el-icon>
                        发送失败
                    </template>
                </div>
            </div>
        </div>
        <div class="file-bottom">
            <div class="file-operation">
                <template v-if="fileInfo.status === 0">
                    <a class="file-operation-item ">取消</a>
                </template>
                <template v-else-if="fileInfo.status === 1">
                    <!-- <a class="file-operation-item ">打开</a>
                    <a class="file-operation-item ">打开文件夹</a> -->
                    <a class="file-operation-item " @click="handleDownload">下载</a>
                </template>
                <template v-else-if="fileInfo.status === 2">
                    <a class="file-operation-item ">重新发送</a>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted, watch, reactive } from 'vue';
import { fileUplaodWithProgress } from '../assets/js/file-upload'
import { useUserStore } from '../store/userStore';
import { formatFileSize } from '../assets/js/format';
import { useChatStore } from '../store/chatStore';
import { ElMessage } from 'element-plus';

const props = defineProps(['messageInfo'])
const userStore = useUserStore()
const chatStore = useChatStore()
const fileState = reactive({
    progress: 0,
    status: 0,
    recordId: null
})

const fileInfo = computed(() => {
    const messageInfo = props.messageInfo
    if (messageInfo.file) {
        const fileInfo = {
            fileName: messageInfo.file.name,
            fileSize: messageInfo.file.size,
            fileType: messageInfo.file.type.split('/')[1],
            status: fileState.status,
            progress: fileState.progress
        }
        return fileInfo
    }
    if (messageInfo.fileInfo) {
        return {
            fileName: messageInfo.fileInfo.realName,
            fileSize: messageInfo.fileInfo.fileSize,
            fileType: messageInfo.fileInfo.ext,
            status: 1
        }
    }
    return null
})

const userInfo = computed(() => {
    return userStore.userInfo
})

watch(() => fileState.status, (newValue, oldValue) => {
    if (oldValue === 0 && newValue === 1 && props.messageInfo.sendStatus === 0) {
        // 发送文件消息
        handleSendFileMessage()
    }
})

onMounted(() => {
    initUpload()
})

const initUpload = () => {
    if (props.messageInfo.file && fileState.status === 0 && props.messageInfo.sendStatus === 0) {
        setTimeout(() => {
            fileUplaodWithProgress(props.messageInfo.file, userInfo.userId, fileState)
        }, 2000);
    }
    if (props.messageInfo.sendStatus === 1){
        fileState.status = 1
    }
}

const handleSendFileMessage = () => {
    // 发送文件消息
    const createMessageDto = {
        roomId: props.messageInfo.roomId,
        senderId: props.messageInfo.senderId,
        receiverId: props.messageInfo.receiverId,
        receiverType: props.messageInfo.receiverType,
        type: props.messageInfo.type,
        content: props.messageInfo.content,
        contentText: props.messageInfo.contentText,
        recordId: fileState.recordId
    }
    chatStore.sendMessage(props.messageInfo, createMessageDto).then(res => {
        if (res.code == 200) {
            ElMessage.success('发送成功')
        }
    }
    ).catch(err => {
        console.log(err)
        ElMessage.error("发送失败")
    })
}

const handleDownload = () => {
    // 调用下载接口
}

const icon = computed(() => {
    const fileType = fileInfo.value.fileType.toLowerCase();
    switch (fileType) {
        case 'doc':
        case 'docx':
            return 'file_word'
        case 'xls':
        case 'xlsx':
            return 'file_excel'
        case 'ppt':
        case 'pptx':
        case 'pptm':
            return 'file_ppt'
        case 'pdf':
            return 'file_pdf'
        case 'txt':
            return 'file_txt'
        case 'zip':
        case '7z':
        case 'rar':
        case 'tar':
        case 'gz':
        case 'bz2':
        case 'jar':
        case 'war':
        case 'ear':
        case 'tar.gz':
        case 'tar.bz2':
        case 'tar.xz':
        case 'tar.zst':
        case 'zipx':
        case 'rarx':
        case '7zx':
            return 'file_zip'
        case 'mp3':
            return 'file_music'
        case 'mp4':
        case 'avi':
        case 'mkv':
            return 'file_video'
        case 'iso':
            return 'file_iso'
        case 'psd':
            return 'file_psd'
        case 'bt':
        case 'torrent':
            return 'file_bt'
        case 'exe':
        case 'msi':
        case 'bat':
        case 'cmd':
            return 'file_exe'
        case 'html':
            return 'file_html'
        case 'cad':
            return 'file_cad'
        case 'js':
        case 'css':
        case 'json':
        case 'java':
        case 'class':
        case 'cpp':
            return 'file_code'
        default:
            return 'file_blank'
    }
})
</script>

<style lang="scss" scoped>
// 文件消息样式
.chat-msg-file-container {
    width: 300px;
    height: 100px;
    border-radius: 10px;
    display: flex;
    background-color: #fff;
    padding: 10px;
    flex-direction: column;
    color: #000;

    .file-top {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        border-bottom: 1px solid #ccc;
        padding-bottom: 10px;

        .file-icon {
            width: 60px;
            height: 60px;
            margin-right: 10px;

            .icon {
                width: 100%;
                height: 100%;
            }
        }

        .file-status {
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            justify-content: space-between;
            cursor: default;

            .file-info {
                display: flex;
                flex-direction: row;

                // 字多显示省略号
                .file-name {
                    width: 160px;
                    font-size: 14px;
                    font-weight: 600;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    word-wrap: break-word;
                }

                .file-size {
                    font-size: 14px;
                    color: #999;
                }
            }

            .file-tip {
                width: 100%;
                display: flex;
                flex-direction: row;
                align-items: center;
                font-size: 14px;
                color: #999;
            }
        }
    }

    .file-bottom {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;

        .file-operation {
            display: flex;
            flex-direction: row;

            .file-operation-item {
                margin-right: 10px;
                color: #66b1ff;
                cursor: pointer;

                &:hover {
                    color: #4090EF;
                }
            }
        }
    }
}
</style>