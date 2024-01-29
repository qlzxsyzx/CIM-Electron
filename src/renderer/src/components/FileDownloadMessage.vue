<template>
    <div class="chat-msg-file-container">
        <div class="file-top">
            <div class="file-icon">
                <SvgIcon :iconName="icon" class="icon" />
            </div>
            <div class="file-status">
                <div class="file-info">
                    <div class="file-name">
                        {{ props.fileInfo.fileName }}
                    </div>
                    <div class="file-size">
                        {{ props.fileInfo.fileSize }}
                    </div>
                </div>
                <div class="file-tip">
                    <template v-if="props.fileInfo.status === 0">
                        <el-progress style="width: 100%;margin-bottom: 10px;" :percentage="props.fileInfo.progress" striped striped-flow :show-text="false"></el-progress>
                    </template>
                    <template v-else-if="props.fileInfo.status === 1">
                        <el-icon color="#95d475" size="20px" class="file-mark">
                            <CircleCheckFilled />
                        </el-icon>
                        下载成功
                    </template>
                    <template v-else-if="props.fileInfo.status === 2">
                        <el-icon color="#F56C6C" size="20px" class="file-mark">
                            <CircleCloseFilled />
                        </el-icon>
                        下载失败
                    </template>
                    <template v-else-if="props.fileInfo.status === -1">
                        待接收
                    </template>
                </div>
            </div>
        </div>
        <div class="file-bottom">
            <div class="file-operation">
                <template v-if="props.fileInfo.status === 0">
                    <a class="file-operation-item ">取消</a>
                </template>
                <template v-else-if="props.fileInfo.status === 1">
                    <a class="file-operation-item ">打开</a>
                    <a class="file-operation-item ">打开文件夹</a>
                    <a class="file-operation-item ">重新下载</a>
                </template>
                <template v-else-if="props.fileInfo.status === 2 | -1">
                    <a class="file-operation-item ">下载</a>
                    <a class="file-operation-item ">另存为</a>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps(['fileInfo'])

const icon = computed(() => {
    const fileType = props.fileInfo.fileType.toLowerCase();
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
    min-width: 300px;
    min-height: 100px;
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
        .file-icon{
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
            .file-info {
                display: flex;
                flex-direction: row;
                // 字多显示省略号
                .file-name {
                    width: 180px;
                    font-size: 16px;
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
        .file-operation{
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