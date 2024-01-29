<template>
    <div class="main-container">
        <div class="main-top-container">
            <div class="top-name">
                {{ chatBaseInfo.groupVo.groupNickName || chatBaseInfo.groupVo.name }} ({{ chatBaseInfo.groupVo.memberCount }})
            </div>
            <div class="top-more">
                <SvgIcon iconName="more" style="width: 25px;"></SvgIcon>
            </div>
        </div>
        <div class="main-view-container" id="main-view-container">
            <MessageItem/>
            <MessageItem :mine="true"/>
            <MessageItem/>
            <MessageItem :mine="true"/>

            <MessageItem type="file" :info="info"/>
            <MessageItem :mine="true" type="file" :info="info"/>
        </div>
        <div class="main-footer-container">
            <div class="tool-area">
                <div class="tool-area-left">
                    <!-- emoji图标 -->
                    <el-popover placement="top-end" trigger="click" width="450"  v-model:visible="emojiVisible">
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
                    <!-- <SvgIcon iconName="call" iconClass="tool"></SvgIcon>
                    <SvgIcon iconName="video" iconClass="tool"></SvgIcon> -->
                </div>
            </div>
            <div class="input-area">
                <div class="message-input" id="message-input" ref="messageInput" @paste="handlePaste" contenteditable="true" spellcheck="false" autofocus></div>
            </div>
            <div class="control-area">
                <el-button type="primary">发送</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import Emoji from '../components/Emoji.vue'
import MessageItem from '../components/MessageItem.vue';
import { handlePaste } from '../assets/js/utils';
import { ref,onActivated,computed } from 'vue'
import FileUpload from '../components/FileUpload.vue';
import { useRoute } from 'vue-router';
import { useChatStore } from '../store/chatStore';
import { useReconnect } from '../assets/js/reconnectMixin'

const route = useRoute()
const chatStore = useChatStore()

onActivated(() => {
    // 在这里获取当前聊天室的聊天记录
    console.log('获取聊天室聊天记录',route.params.roomId)
})

useReconnect(() => {
    // 在这里重新获取聊天记录
    console.log('重新获取聊天记录',route.params.roomId)
})

const chatBaseInfo = computed(()=> {
    console.log('chatBaseInfo',chatStore.recentChatList.find(item => item.roomId == route.params.roomId))
    return chatStore.recentChatList.find(item => item.roomId == route.params.roomId)
})

const info = {
    type:'file',
    fileInfo: {
        fileName: 'test.pdf',
        fileSize: '100KB',
        fileType: 'pdf',
        progress:  50,
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
  emojiVisible.value  = false
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