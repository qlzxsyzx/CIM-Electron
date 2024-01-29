<template>
    <div class="main-container" v-loading="isLoading">
        <template v-if="chatBaseInfo">
            <div class="main-top-container">
                <div class="top-name">
                    {{ chatBaseInfo.friendVo.remark || chatBaseInfo.friendVo.userVo.name }}
                </div>
                <div class="top-more">
                    <SvgIcon iconName="more" style="width: 25px;"></SvgIcon>
                </div>
            </div>
            <div class="main-view-container" id="main-view-container" @scroll="handleScroll">
                <template v-for="item in chatMessageList" :key="item.messageId">
                    <MessageItem :id="'message-' + item.messageId" :userInfo="chatBaseInfo.friendVo" :messageInfo="item" />
                </template>
            </div>
            <div class="main-footer-container">
                <div class="tool-area">
                    <div class="tool-area-left">
                        <!-- emoji图标 -->
                        <el-popover placement="top-end" trigger="click" width="450" v-model:visible="emojiVisible">
                            <template #reference>
                                <SvgIcon iconName="expression" iconClass="tool" style="outline: 0 !important;"></SvgIcon>
                            </template>
                            <Emoji @selectEmoji="selectEmoji" />
                        </el-popover>
                        <!-- 文件上传 -->
                        <FileUpload accept-file-type="file">
                            <template #trigger>
                                <SvgIcon iconName="file" iconClass="tool"></SvgIcon>
                            </template>
                        </FileUpload>
                        <SvgIcon iconName="picture" iconClass="tool"></SvgIcon>
                        <SvgIcon iconName="scissor" iconClass="tool"></SvgIcon>
                        <SvgIcon iconName="history" iconClass="tool"></SvgIcon>
                    </div>
                    <div class="tool-area-right">
                        <SvgIcon iconName="call" iconClass="tool"></SvgIcon>
                        <SvgIcon iconName="video" iconClass="tool"></SvgIcon>
                    </div>
                </div>
                <div class="input-area">
                    <div class="message-input" id="message-input" ref="messageInput" @paste="handlePaste"
                        contenteditable="true" spellcheck="false" autofocus></div>
                </div>
                <div class="control-area">
                    <el-button type="primary" @click="handleSendMesage">发送</el-button>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import Emoji from '../components/Emoji.vue'
import MessageItem from '../components/MessageItem.vue';
import { handlePaste } from '../assets/js/utils';
import { ref, computed, nextTick, watchPostEffect, onActivated } from 'vue'
import FileUpload from '../components/FileUpload.vue';
import { useRoute, onBeforeRouteUpdate } from 'vue-router';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import { ElMessage } from 'element-plus';
import { useReconnect } from '../assets/js/reconnectMixin';

const route = useRoute()
const chatStore = useChatStore()
const userStore = useUserStore()
const isLoading = ref(true)
const isBottom = ref(false)
const isNeedScrollToBottom = ref(true)

onActivated(() => {
    isLoading.value = true
    // 获取聊天记录
    chatStore.getChatMessageList(route.params.roomId, 1, 5).then(res => {
        if (res.code === 200) {
            isLoading.value = false
        }
    })
})

onBeforeRouteUpdate((to, from, next) => {
    isLoading.value = true
    isNeedScrollToBottom.value = true
    // 在这里重新获取聊天记录
    console.log('获取聊天室聊天记录', to.params.roomId)
    chatStore.recordCurrentChatInfo(to.params.roomId)
    // 获取聊天记录
    chatStore.getChatMessageList(to.params.roomId, 1, 5).then(res => {
        if (res.code === 200) {
            isLoading.value = false
        }
    })
    next()
})

useReconnect(() => {
    isLoading.value = true
    // 获取聊天记录
    chatStore.getChatMessageList(route.params.roomId, 1, 5).then(res => {
        if (res.code === 200) {
            nextTick(() => {
                isLoading.value = false
            })
        }
    })
})

const chatBaseInfo = computed(() => {
    if (chatStore.currentChatInfo.roomId) {
        return chatStore.currentChatInfo
    } else {
        return null
    }
})

const chatMessageList = computed(() => {
    if (chatStore.currentChatHistory.length > 0) {
        return chatStore.currentChatHistory
    } else {
        return null
    }
})

watchPostEffect(() => {
    if (chatBaseInfo.value !== null && !isLoading.value && isNeedScrollToBottom.value) {
        firstOpenScroll()
    }
})

const firstOpenScroll = async () => {
    await nextTick()
    const el = document.getElementById('main-view-container')
    el.scrollTop = el.scrollHeight
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
};

const scrollToBottom = async () => {
    await nextTick()
    const index = chatMessageList.value[chatMessageList.value.length - 1].messageId
    // 点击后scroll到index id位置
    const el = document.querySelector(`#message-${index}`)
    if (!el) return
    // scroll 到 el的位置
    el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
}

const info = {
    type: 'file',
    fileInfo: {
        fileName: 'test.pdf',
        fileSize: '100KB',
        fileType: 'pdf',
        progress: 50,
        status: 2
    }
}

const messageInput = ref()
const emojiVisible = ref(false)

const selectEmoji = (item) => {
    // 没有焦点就获取输入框焦点
    if (document.activeElement != messageInput.value) {
        messageInput.value.focus()
    }
    let emojiImg = `<img src="${item.url}" width="25" height="25" style="vertical-align: middle;">`
    document.execCommand('insertHTML', false, emojiImg)
    emojiVisible.value = false
}

const handleSendMesage = () => {
    let message = messageInput.value.innerHTML
    console.log('发送消息', message)
    if (!message) return
    // 发送消息, 先请求后端添加数据库，失败报错！
    // 成功后端返回消息vo，前端保存，用于撤回
    const createMessageDto = {
        roomId: route.params.roomId,
        receiverId: chatBaseInfo.value.friendVo.userVo.userId,
        receiverType: 1,
        type: 1,
        content: message,
        recordId: null
    }
    chatStore.sendMessage(createMessageDto).then(res => {
        if (res.code == 200) {
            console.log('发送成功')
        } else {
            console.log(res.msg)
        }
    }
    ).catch(err => ElMessage.error(err))
    // 清空输入框
    messageInput.value.innerHTML = ''
}

</script>

<style scoped>
.main-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.main-top-container {
    padding: 0 30px;
    height: 100px;
    border-bottom: 1px solid var(--el-color-info-light-5);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.main-view-container {
    flex: 1;
    width: 100%;
    overflow-y: auto;
    margin-bottom: 10px;
}

.main-footer-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 200px;
    border-top: 1px solid var(--el-color-info-light-5);
}

.top-name {
    font-size: 20px;
    font-weight: 500;
    color: black;
}

.top-more {
    cursor: pointer;
}

.tool-area {
    height: 26px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 5px 0;
}

.input-area {
    width: 100%;
    flex: 1;
}

.message-input {
    margin: 0 10px;
    outline: 0 !important;
    height: 100px;
    overflow: auto;
    word-wrap: break-word;
    word-break: break-all;
}

.control-area {
    height: 40px;
    padding: 10px;
    text-align: right;
}

.tool-area-left {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
}
</style>