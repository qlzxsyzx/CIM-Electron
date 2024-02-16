<template>
    <div class="main-container" v-loading="isLoading">
        <template v-if="friend">
            <div class="main-top-container">
                <div class="top-name">
                    {{ friend.remark || friendUserInfo.name }}
                </div>
                <div class="top-more" @click="moreOptionsVisible = !moreOptionsVisible">
                    <SvgIcon iconName="more" style="width: 25px;"></SvgIcon>
                </div>
            </div>
            <div class="main-chat-container">
                <!-- 单聊更多选项 -->
                <el-drawer v-model="moreOptionsVisible" :with-header="false" size="300" style="background-color: #f0f2f5;">
                    <SingleChatMoreOptions v-if="moreOptionsVisible" />
                </el-drawer>
                <div class="main-view-container" id="main-view-container" @scroll="handleScroll">
                    <div style="display: flex;flex-direction: column-reverse;">
                        <template v-for="item in chatMessageList" :key="item.messageId">
                            <MessageItem :id="'message-' + item.messageId" :messageInfo="item" />
                        </template>
                    </div>
                </div>
                <div class="main-footer-container">
                    <div class="tool-area">
                        <div class="tool-area-left">
                            <!-- emoji图标 -->
                            <el-popover placement="top-end" trigger="click" width="450" v-model:visible="emojiVisible">
                                <template #reference>
                                    <SvgIcon iconName="expression" iconClass="tool" style="outline: 0 !important;">
                                    </SvgIcon>
                                </template>
                                <Emoji @selectEmoji="selectEmoji" />
                            </el-popover>
                            <!-- 文件上传 -->
                            <FileUpload accept-file-type="file" @upload="fileUpload">
                                <template #trigger>
                                    <SvgIcon iconName="file" iconClass="tool"></SvgIcon>
                                </template>
                            </FileUpload>
                            <FileUpload accept-file-type="image" @upload="fileUpload">
                                <template #trigger>
                                    <SvgIcon iconName="picture" iconClass="tool"></SvgIcon>
                                </template>
                            </FileUpload>
                            <SvgIcon iconName="scissor" iconClass="tool"></SvgIcon>
                            <SvgIcon iconName="history" iconClass="tool"></SvgIcon>
                        </div>
                        <div class="tool-area-right">
                            <SvgIcon iconName="call" iconClass="tool"></SvgIcon>
                            <SvgIcon iconName="video" iconClass="tool"></SvgIcon>
                        </div>
                    </div>
                    <div class="input-area" id="input-area" ref="inputArea">
                        <div class="message-input" id="message-input" ref="messageInput" @paste="handleInputPaste"
                            contenteditable="true" spellcheck="false" @keyup="saveSelection" @mouseup="saveSelection"
                            @keydown.enter.exact="handleEnter" @keyup.ctrl.enter="handleCtrlEnter" autofocus></div>
                    </div>
                    <div class="control-area">
                        <el-button type="primary" @click="handleSendMesage">发送</el-button>
                    </div>
                </div>
            </div>
        </template>
    </div>
    <div class="el-overlay" v-show="moreOptionsVisible" style="opacity: 0;" @click="moreOptionsVisible = false"></div>
</template>

<script setup>
import Emoji from '../components/Emoji.vue'
import MessageItem from '../components/MessageItem.vue';
import { handlePaste, encodeHtmlToMessage } from '../assets/js/utils';
import { ref, computed, nextTick, watchPostEffect } from 'vue'
import FileUpload from '../components/FileUpload.vue';
import { onBeforeRouteUpdate } from 'vue-router';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import { useFriendStore } from '../store/friendStore';
import { useUserInfoStore } from '../store/userInfoStore';
import { ElMessage } from 'element-plus';
import { useReconnect } from '../assets/js/reconnectMixin';
import { uploadImage, getByName } from '../api/image';
import SingleChatMoreOptions from '../components/SingleChatMoreOptions.vue';

const chatStore = useChatStore()
const userStore = useUserStore()
const friendStore = useFriendStore()
const userInfoStore = useUserInfoStore()
const isLoading = ref(true)
const isTop = ref(false)
const isBottom = ref(false)
const isNeedScrollToBottom = ref(true)
const pageNum = ref(2)
const pageSize = ref(10)
const isHasMore = ref(true)
const moreOptionsVisible = ref(false)

onBeforeRouteUpdate((to, from, next) => {
    isLoading.value = true
    isNeedScrollToBottom.value = true
    next()
})

useReconnect(() => {
    isLoading.value = true
    // 获取聊天记录
    chatStore.getChatMessageList(currentChatInfo.value.roomId).then(res => {
        if (res.code === 200) {
            isLoading.value = false
            if (isNeedScrollToBottom.value) {
                firstOpenScroll()
            }
        }
    })
})

const friend = computed(() => {
    if (!currentChatInfo.value) return null
    return friendStore.findFriendByUserId(currentChatInfo.value.toUserId)
})

const friendUserInfo = computed(() => {
    if (!currentChatInfo.value) return null
    return userInfoStore.getUserInfo(currentChatInfo.value.toUserId)
})

const currentChatInfo = computed(() => {
    if (!chatStore.currentChatInfo) return null
    return chatStore.currentChatInfo.recentChat
})

const chatMessageList = computed(() => {
    if (chatStore.currentChatHistory.length > 0) {
        return chatStore.currentChatHistory
    } else {
        return []
    }
})

watchPostEffect(() => {
    if (currentChatInfo.value) {
        // 获取聊天记录
        chatStore.getChatMessageList(currentChatInfo.value.roomId).then(res => {
            if (res.code === 200) {
                if (isNeedScrollToBottom.value) {
                    firstOpenScroll()
                }
            }
        })
    }
})

watchPostEffect(() => {
    if (isTop.value && isHasMore.value) {
        chatStore.getMoreChatMessages(currentChatInfo.value.roomId, pageNum.value, pageSize.value).then(res => {
            if (res.code === 200) {
                if (res.data.length < 10) {
                    isHasMore.value = false
                }
                pageNum.value++
                isTop.value = false
            }
        })
    }
})

const firstOpenScroll = () => {
    nextTick(() => {
        const el = document.getElementById('main-view-container')
        if (!el) return
        setTimeout(() => {
            el.scrollTop = el.scrollHeight
            isLoading.value = false
        },100)
    })
}

const handleScroll = () => {
    // 获取滚动容器的滚动高度
    const el = document.getElementById('main-view-container')
    const scrollHeight = el.scrollHeight;
    const scrollTop = el.scrollTop;
    const clientHeight = el.clientHeight;
    // 判断是否滚动到底部
    if (scrollTop + clientHeight >= scrollHeight - 30) {
        isBottom.value = true
    } else {
        isBottom.value = false
        isNeedScrollToBottom.value = false
    }
    // 判断是否滚动到顶部-50,滚到就获取更多消息
    if (scrollTop <= 50 && chatMessageList.value.length >= 10) {
        isTop.value = true
    } else {
        isTop.value = false
    }
};

const scrollToBottom = async () => {
    await nextTick()
    const index = chatMessageList.value[0].messageId
    // 点击后scroll到index id位置
    const el = document.getElementById(`message-${index}`)
    if (!el) return
    // scroll 到 el的位置
    el.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
}

const inputArea = ref()
const messageInput = ref()
const emojiVisible = ref(false)

// fileUpload组件上传图片
const fileUpload = (file) => {
    messageInput.value.focus()
    if (!file) return
    if (file.type.indexOf('image') === -1) {
        // 是文件
        fileUploadCallback(file)
    } else {
        // 是图片
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = function (e) {
            const base64 = e.target.result
            const img = `<img src="${base64}" style="max-width: 300px; max-height: 300px;" />`
            document.execCommand('insertHtml', false, img)
        }
    }
}

const fileUploadCallback = (file) => {
    // 粘贴的是文件，创建文件发送消息
    const sendingMessage = {
        messageId: new Date().getTime(),
        roomId: currentChatInfo.value.roomId,
        senderId: userStore.userInfo.userId,
        receiverId: friendUserInfo.value.userId,
        receiverType: 1,
        type: 3,
        sendStatus: 0,
        content: file.name,
        createTime: new Date(),
        file: file
    }
    chatStore.addCurrentChatHistory(sendingMessage)
    nextTick(() => {
        scrollToBottom()
    })
    messageInput.value.focus()
}

const handleInputPaste = (e) => {
    e.preventDefault()
    handlePaste(e, fileUploadCallback)
    nextTick(() => {
        // 更新div的滚动位置，保持光标可见
        const div = inputArea.value
        div.scrollTop = div.scrollHeight
    })
}

const selectEmoji = (item) => {
    // 插入表情，且可以撤销
    if (document.activeElement != messageInput.value) {
        messageInput.value.focus()
    }
    restoreSelection()
    document.execCommand('insertHTML', false, `<img src="${item.url}" title="${item.name}" class="cim-emoji" width="25" height="25" style="vertical-align: middle;">`)
    saveSelection()
    emojiVisible.value = false
    nextTick(() => {
        messageInput.value.focus()
        const div = inputArea.value
        div.scrollTop = div.scrollHeight
    })
}

const handleEnter = (e) => {
    e.preventDefault()
    if (emojiVisible.value) {
        emojiVisible.value = false
        return
    }
    handleSendMesage()
}

const handleCtrlEnter = (e) => {
    e.preventDefault()
    if (emojiVisible.value) {
        emojiVisible.value = false
        return
    }
    if (document.activeElement != messageInput.value) {
        messageInput.value.focus()
    }
    // 在光标处添加换行
    restoreSelection()
    document.execCommand('insertLineBreak')
    saveSelection()
    messageInput.value.focus()
    nextTick(() => {
        // 更新div的滚动位置，保持光标可见
        const div = inputArea.value
        div.scrollTop = div.scrollHeight
    })
}

const imageRegex = /\[图片 src="(.*?)"]/g

const imgSrctoFile = (src, filename) => {
    // 将图片的src转换为file对象
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', src, true)
        xhr.responseType = 'blob'
        xhr.onload = function () {
            if (xhr.status === 200) {
                const blob = xhr.response
                const file = new File([blob], filename, { type: blob.type }) // 创建File对象
                resolve(file)
            } else {
                reject(new Error('图片加载失败'))
            }
        }
        xhr.send()
    })
}

const handleSendMesage = async () => {
    const message = messageInput.value.innerHTML
    if (!message) return
    const encodeMessage = encodeHtmlToMessage(message)
    // 发送消息，发送中
    const sendingMessage = {
        messageId: new Date().getTime(),
        roomId: currentChatInfo.value.roomId,
        senderId: userStore.userInfo.userId,
        receiverId: friendUserInfo.value.userId,
        receiverType: 1,
        type: 1,
        sendStatus: 0,
        content: encodeMessage,
        recordId: null,
        createTime: new Date()
    }
    chatStore.addCurrentChatHistory(sendingMessage)
    // 对其中 [图片 src="data"]进行解析
    let uploadImagePromises = []
    let saveMessage = encodeMessage
    let matches
    while ((matches = imageRegex.exec(encodeMessage)) != null) {
        const imageSrc = matches[1]
        let promise = new Promise((resolve, reject) => {
            if (imageSrc.startsWith(import.meta.env.RENDERER_VITE_BASE_URL)) {
                // 服务器资源,不用上传
                resolve('资源已存在')
            }
            imgSrctoFile(imageSrc, 'chat_' + Date.parse(new Date()) + '.png').then((file) => {
                // 调用上传图片接口
                const formData = new FormData()
                formData.append('file', file)
                uploadImage(formData).then((res) => {
                    if (res.code === 200) {
                        // 替换图片链接
                        saveMessage = saveMessage.replace(imageSrc, getByName(res.data.fileName))
                        console.log('图片上传成功', saveMessage)
                        resolve('图片上传成功')
                    } else {
                        console.error('图片上传失败')
                        sendingMessage.sendStatus = -1
                        reject('图片上传失败')
                    }
                })
            }).catch((error) => {
                console.error('图片上传失败', error)
                sendingMessage.sendStatus = -1
                reject('图片上传失败')
            })
        })
        uploadImagePromises.push(promise)
    }
    await Promise.all(uploadImagePromises)
    console.log('图片上传完成')
    if (sendingMessage.sendStatus === -1) {
        ElMessage.error('发送失败')
        return
    } else {
        const createMessageDto = {
            roomId: currentChatInfo.value.roomId,
            senderId: userStore.userInfo.userId,
            receiverId: friendUserInfo.value.userId,
            receiverType: 1,
            type: 1,
            content: saveMessage,
            recordId: null
        }
        chatStore.sendMessage(sendingMessage, createMessageDto).then(res => {
            if (res.code == 200) {
                ElMessage.success('发送成功')
            }
        }
        ).catch(err => ElMessage.error("发送失败"))
    }
    scrollToBottom()
    // 清空输入框
    messageInput.value.innerHTML = ''
    messageInput.value.focus()
}

// copy
let _parentElem = null
let currentRange = null
function getCurrentRange() {
    var selection,
        range,
        txt = messageInput.value;
    if (document.createRange) {
        selection = document.getSelection();
        if (selection.getRangeAt && selection.rangeCount) {
            range = document.getSelection().getRangeAt(0);
            _parentElem = range.commonAncestorContainer;
        }
    } else {
        range = document.selection.createRange();
        _parentElem = range.parentElement();
    }
    return range;
}
function saveSelection() {
    currentRange = getCurrentRange();
}
function restoreSelection() {
    if (!currentRange) {
        return;
    }
    var selection,
        range;
    if (document.createRange) {
        selection = document.getSelection();
        selection.removeAllRanges();
        selection.addRange(currentRange);
    } else {
        range = document.selection.createRange();
        range.setEndPoint('EndToEnd', currentRange);
        if (currentRange.text.length === 0) {
            range.collapse(false);
        } else {
            range.setEndPoint('StartToStart', currentRange);
        }
        range.select();
    }
}
</script>

<style scoped lang="scss">
.main-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .main-top-container {
        padding: 0 30px;
        min-height: 100px;
        border-bottom: 1px solid var(--el-color-info-light-5);
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        .top-name {
            font-size: 20px;
            font-weight: 500;
            color: black;
        }

        .top-more {
            cursor: pointer;
        }
    }

    .main-chat-container {
        display: flex;
        height: calc(100% - 101px);
        flex-direction: column;
        position: relative;

        :deep(.el-overlay) {
            position: absolute;
            background-color: rgba(0, 0, 0, 0);
        }

        .main-view-container {
            height: 60%;
            max-height: 60%;
            width: 100%;
            overflow-y: auto;
            margin-bottom: 10px;
        }

        .main-footer-container {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 40%;
            border-top: 1px solid var(--el-color-info-light-5);

            .tool-area {
                height: 26px;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                margin: 5px 0;


                .tool-area-left {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                }
            }

            .input-area {
                width: 100%;
                flex: 1;
                overflow: auto;
                cursor: text;

                .message-input {
                    margin: 0 10px;
                    outline: 0 !important;
                    word-wrap: break-word;
                    word-break: break-all;
                    line-height: 25px;
                    height: 100%;
                }
            }

            .control-area {
                height: 40px;
                padding: 10px;
                text-align: right;
            }
        }
    }
}
</style>