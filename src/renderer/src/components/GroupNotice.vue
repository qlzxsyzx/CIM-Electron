<template>
    <div class="group-notice-container">
        <div class="title-container">
            <el-button v-if="groupSetting.role !== 1" type="primary" @click="handlePublishNewNotice">发布新公告</el-button>
        </div>
        <div class="content-container">
            <template v-if="noticeList.length > 0">
                <ul v-infinite-scroll="load" :infinite-scroll-disabled="disabled" class="notice-list">
                    <li v-for="item in noticeList" :key="item.id" class="notice-item">
                        <GroupNoticeItem :notice="item" :groupSetting="groupSetting" @edit="handleEditNotice"
                            @remove="handleRemoveNotice" />
                    </li>
                </ul>
            </template>
            <template v-else>
                <el-empty description="暂无公告"></el-empty>
            </template>
        </div>
    </div>

    <el-dialog v-model="publishNewNoticeDialogVisible" title="发布新公告" width="400" @close="closePublishNewNoticeDialog">
        <div class="publish-new-notice-container">
            <div class="input-content">
                <el-input v-model="newNoticeContent" type="textarea" :rows="10" placeholder="请输入公告内容" show-word-limit
                    maxlength="500" autofocus resize="none"></el-input>
            </div>
            <div class="image-content">
                <template v-if="newNoticeImageUrl">
                    <div class="img-container">
                        <img class="img" :src="newNoticeImageData" alt="公告图片">
                        <span class="actions">
                            <span class="actions-item">
                                <el-icon @click="handleRemoveImage">
                                    <Delete />
                                </el-icon>
                            </span>
                        </span>
                    </div>
                </template>
                <template v-else>
                    <el-upload action="#" :http-request="() => { }" accept="image/*" :show-file-list="false"
                        :before-upload="beforeImageUpload">
                        <template #trigger>
                            <el-icon class="icon" :size="30">
                                <Picture />
                            </el-icon>
                        </template>
                    </el-upload>
                </template>
            </div>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="publishNewNoticeDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="publishNewNotice">发布</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import { useGroupStore } from '../store/groupStore'
import { ElMessage } from 'element-plus';
import { uploadImage, getByName } from "../api/image";
import GroupNoticeItem from './GroupNoticeItem.vue';

const route = useRoute()
const groupStore = useGroupStore()

const noticeList = ref([])
const pageNum = ref(1)
const pageSize = ref(5)
const disabled = ref(false)

const groupSetting = computed(() => {
    return groupStore.findMyGroupSettingByGroupId(route.params.groupId)
})

onBeforeMount(() => {
    // 对img元素进行点击事件监听，实现图片预览功能
    // document.addEventListener('dblclick', dbclickImage)
    groupStore.getNoticeListByGroupId(route.params.groupId, pageNum.value, pageSize.value).then((res) => {
        if (res.code === 200) {
            noticeList.value = res.data
            if (res.data.length < pageSize.value) {
                disabled.value = true
            } else {
                pageNum.value++
            }
        }
    }).catch((err) => {
        console.log(err);
        ElMessage.error('获取数据失败')
    })
})

const load = () => {
    groupStore.getNoticeListByGroupId(route.params.groupId, pageNum.value, pageSize.value).then((res) => {
        if (res.code === 200) {
            noticeList.value.push(res.data)
            if (res.data.length < pageSize.value) {
                disabled.value = true
            } else {
                pageNum.value++
            }
        }
    }).catch((err) => {
        ElMessage.error('获取数据失败')
    })
}

const publishNewNoticeDialogVisible = ref(false)
const newNoticeContent = ref('')
const newNoticeImageData = ref('')
const newNoticeImageUrl = ref('')

const handlePublishNewNotice = () => {
    publishNewNoticeDialogVisible.value = true
}

const closePublishNewNoticeDialog = () => {
    newNoticeContent.value = ''
    newNoticeImageData.value = ''
    newNoticeImageUrl.value = ''
}

const beforeImageUpload = (file) => {
    if (file.type.indexOf("image/") == -1) {
        ElMessage.error('请上传图片类型文件!')
        return false
    }
    if (file.size / 1024 / 1024 > 2) {
        ElMessage.error('文件大小不能超过2MB!')
        return false
    }
    let formData = new FormData();
    formData.append("file", file, "notice_" + Date.parse(new Date()) + ".png");
    uploadImage(formData).then((res) => {
        if (res.code == 200) {
            newNoticeImageUrl.value = getByName(res.data.fileName)
            ElMessage.success("上传成功！");
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                newNoticeImageData.value = reader.result;
            };
        } else {
            ElMessage.error(res.message || '上传失败！')
        }
    }).catch((err) => {
        console.log(err)
        ElMessage.error("上传失败！")
    })
}

const handleRemoveImage = () => {
    newNoticeImageUrl.value = ''
    newNoticeImageData.value = ''
}

const publishNewNotice = () => {
    if (!newNoticeContent.value) {
        ElMessage.error('请输入公告内容！')
        return
    }
    const createNoticeData = {
        noticeId: editNoticeId.value,
        groupId: route.params.groupId,
        content: newNoticeContent.value,
        imageUrl: newNoticeImageUrl.value
    }
    groupStore.publishNewNotice(createNoticeData).then((res) => {
        if (res.code == 200) {
            ElMessage.success('发布成功！')
            if (editNoticeId.value) {
                noticeList.value = noticeList.value.filter(notice => notice.id !== editNoticeId.value)
                editNoticeId.value = ''
            }
            noticeList.value.unshift(res.data)
            publishNewNoticeDialogVisible.value = false
        }
    }).catch((err) => {
        ElMessage.error('发布失败！')
    })
}

const editNoticeId = ref('')

const handleEditNotice = (notice) => {
    editNoticeId.value = notice.id
    // 弹出编辑公告对话框
    publishNewNoticeDialogVisible.value = true
    newNoticeContent.value = notice.content
    newNoticeImageUrl.value = notice.image
    newNoticeImageData.value = notice.image
}

const handleRemoveNotice = (noticeId) => {
    groupStore.removeNotice(noticeId).then((res) => {
        if (res.code == 200) {
            ElMessage.success('删除成功！')
            noticeList.value = noticeList.value.filter(notice => notice.id !== noticeId)
        }
    }).catch((err) => {
        ElMessage.error('删除失败！')
    })
}
</script>

<style lang="scss" scoped>
.group-notice-container {
    width: 100%;
    height: 500px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .title-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        justify-content: end;
    }

    .content-container {
        flex: 1;
        overflow-y: auto;

        .notice-list {
            padding: 0;
            margin-bottom: 20px;

            .notice-item {
                list-style: none;
                border-radius: 5px;
                background-color: #fff;
                margin-bottom: 10px;
            }
        }
    }
}

.publish-new-notice-container {
    width: 100%;
    height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .input-content {
        flex: 1;
    }

    .image-content {

        .icon {
            cursor: pointer;

            &:hover {
                color: #409eff;
            }
        }

        .img-container {
            overflow: hidden;
            background-color: var(--el-fill-color-blank);
            border: 1px solid var(--el-border-color);
            border-radius: 6px;
            box-sizing: border-box;
            width: 150px;
            height: 150px;
            display: inline-flex;
            position: relative;

            .img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }

            .actions {
                position: absolute;
                width: 100%;
                height: 100%;
                left: 0;
                top: 0;
                cursor: default;
                display: inline-flex;
                justify-content: center;
                align-items: center;
                color: #fff;
                opacity: 0;
                font-size: 20px;
                background-color: var(--el-overlay-color-lighter);
                transition: opacity var(--el-transition-duration);

                &:hover {
                    opacity: 1;
                }

                .actions-item {
                    cursor: pointer;
                }
            }
        }
    }
}
</style>