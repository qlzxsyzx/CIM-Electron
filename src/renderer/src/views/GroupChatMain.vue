<template>
    <div class="main-container" v-loading="isLoading">
        <template v-if="group">
            <div class="main-top-container">
                <div class="top-name">
                    {{ name }}
                </div>
                <div class="top-more" @click="moreOptionsVisible = !moreOptionsVisible">
                    <SvgIcon iconName="more" style="width: 25px;"></SvgIcon>
                </div>
            </div>
            <div class="main-group-container">
                <!-- 群聊更多选项 -->
                <el-drawer v-model="moreOptionsVisible" :with-header="false" size="300" style="background-color: #f0f2f5;">
                    <GroupChatMoreOptions v-if="moreOptionsVisible" :groupMembers="sortMemberList" />
                </el-drawer>
                <div class="main-chat-container">
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
                                <SvgIcon iconName="history" iconClass="tool" @click="openChatHistoryDialog"></SvgIcon>
                            </div>
                        </div>
                        <div class="input-area" id="input-area" ref="inputArea">
                            <div class="message-input" :class="{ 'disabled': noSpeak && isEmpty }" id="message-input"
                                ref="messageInput" @input="handleInput" @paste="handleInputPaste" contenteditable="true"
                                spellcheck="false" @keyup="saveSelection" @mouseup="saveSelection"
                                @keydown.enter.exact="handleEnter" @keyup.ctrl.enter="handleCtrlEnter" autofocus></div>
                        </div>
                        <div class="control-area">
                            <el-button type="primary" @click="handleSendMesage" :disabled="noSpeak">发送</el-button>
                        </div>
                    </div>
                </div>
                <div class="main-chat-container-right">
                    <div class="group-notice-container" @click="handleClickNoticeDialog">
                        <div class="notice-title">
                            <span>群公告</span>
                            <el-icon>
                                <ArrowRight />
                            </el-icon>
                        </div>
                        <span class="notice-content">
                            {{ noticeContent }}
                        </span>
                    </div>
                    <div class="group-member-container">
                        <div class="member-title">
                            <template v-if="isSearch">
                                <el-input ref="searchInput" v-model="searchValue" placeholder="搜索" prefix-icon="Search" />
                                <el-icon class="icon" style="margin-left: 10px;" @click="closeSearch">
                                    <Close />
                                </el-icon>
                            </template>
                            <template v-else>
                                <span>群成员 {{ group.memberCount }}</span>
                                <el-icon class="icon" @click="handleSearchMember">
                                    <Search />
                                </el-icon>
                            </template>
                        </div>
                        <RecycleScroller class="member-list" :items="filterMemberList" :itemSize="40" keyField="id"
                            v-slot="{ item }">
                            <GroupMemberItem :member="item" />
                        </RecycleScroller>
                    </div>
                </div>
            </div>
        </template>
    </div>
    <div class="el-overlay" v-show="moreOptionsVisible" style="opacity: 0;" @click="moreOptionsVisible = false"></div>
    <el-dialog v-model="noticeDialogVisible" title="群公告" width="400">
        <GroupNotice v-if="noticeDialogVisible" />
    </el-dialog>
    <el-dialog title="聊天记录" v-model="chatHistoryDialogVisible" width="40%">
        <ChatHistory v-if="chatHistoryDialogVisible" :lastMessageId="lastMessageId" />
    </el-dialog>
</template>

<script setup>
import Emoji from '../components/Emoji.vue'
import MessageItem from '../components/MessageItem.vue';
import { handlePaste, encodeHtmlToMessage, decodeMessageToHtml } from '../assets/js/utils';
import { ref, computed, nextTick, watchPostEffect, onActivated, onMounted, onBeforeMount, watch } from 'vue'
import FileUpload from '../components/FileUpload.vue';
import { useRoute, onBeforeRouteUpdate } from 'vue-router';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import { useGroupStore } from '../store/groupStore';
import { useFriendStore } from '../store/friendStore';
import { useUserInfoStore } from '../store/userInfoStore';
import { ElMessage } from 'element-plus';
import { useReconnect } from '../assets/js/reconnectMixin';
import { uploadImage, getByName } from '../api/image';
import GroupChatMoreOptions from '../components/GroupChatMoreOptions.vue';
import GroupMemberItem from '../components/GroupMemberItem.vue';
import { pinyin } from 'pinyin-pro'
import GroupNotice from '../components/GroupNotice.vue';
import ChatHistory from '../components/ChatHistory.vue';

const route = useRoute()
const chatStore = useChatStore()
const userStore = useUserStore()
const groupStore = useGroupStore()
const userInfoStore = useUserInfoStore()
const friendStore = useFriendStore();
const isLoading = ref(true)
const isLoadingMore = ref(false)
const isBottom = ref(false)
const isNeedScrollToBottom = ref(true)
const pageSize = ref(10)
const isHasMore = ref(true)
const moreOptionsVisible = ref(false)
const lastMessageId = ref('')

onBeforeMount(() => {
    // 获取群组信息
    groupStore.getGroupInfo(route.params.groupId).then(res => {
        if (res.code === 200 || res.data.roomId) {
            // 获取群组成员
            groupStore.getGroupMemberList(res.data.id, 1, 200)
            // 获取聊天记录
            chatStore.getChatMessageList(res.data.roomId, pageSize.value).then(res => {
                if (res.code === 200) {
                    if (res.data.length < pageSize.value) {
                        isHasMore.value = false
                    }
                    firstOpenScroll()
                }
            })
        }
    }).catch(err => {
        ElMessage.error('获取数据失败')
    })
})

onBeforeRouteUpdate((to, from, next) => {
    console.log('onBeforeRouteUpdate')
    isLoading.value = true
    isNeedScrollToBottom.value = true
    isBottom.value = false
    isHasMore.value = true
    // 获取群组信息
    groupStore.getGroupInfo(to.params.groupId).then(res => {
        if (res.code === 200 || res.data.roomId) {
            // 获取群组成员
            groupStore.getGroupMemberList(res.data.id, 1, 200)
            // 获取聊天记录
            chatStore.getChatMessageList(res.data.roomId, pageSize.value).then(res => {
                if (res.code === 200) {
                    if (res.data.length < pageSize.value) {
                        isHasMore.value = false
                    }
                    if (isNeedScrollToBottom.value) {
                        firstOpenScroll()
                    }
                }
            })
        }
    }).catch(err => {
        ElMessage.error('获取数据失败')
    })
    next()
})

useReconnect(() => {
    isLoading.value = true
    // 获取聊天记录
    groupStore.getGroupInfo(route.params.groupId).then(res => {
        if (res.code === 200 || res.data.roomId) {
            // 获取群组成员
            groupStore.getGroupMemberList(res.data.id, 1, 200)
            // 获取聊天记录
            chatStore.getChatMessageList(res.data.roomId, pageSize.value).then(res => {
                if (res.code === 200) {
                    if (res.data.length < pageSize.value) {
                        isHasMore.value = false
                    }
                    if (isNeedScrollToBottom.value) {
                        firstOpenScroll()
                    }
                }
            })
        }
    }).catch(err => {
        ElMessage.error('获取数据失败')
    })
})

const group = computed(() => {
    return groupStore.currnetGroupInfo
})

const groupMembers = computed(() => {
    const membersMap = groupStore.groupAndMembersMap.get(route.params.groupId)
    return membersMap ? Array.from(membersMap.values()) : []
})

const currentChatInfo = computed(() => {
    if (!chatStore.currentChatInfo) return null
    return chatStore.currentChatInfo.recentChat
})

const groupSetting = computed(() => {
    if (!currentChatInfo.value) return null
    return groupStore.findMyGroupSettingByGroupId(currentChatInfo.value.groupId)
})

const name = computed(() => {
    if (!groupSetting.value) return null
    const remark = groupSetting.value.groupNickName
    if (remark) {
        return remark + '(' + group.value.memberCount + ')'
    } else {
        return group.value.name + '(' + group.value.memberCount + ')'
    }
})

const noticeContent = computed(() => {
    const notice = group.value.latestNotice
    if (notice) {
        if (notice.image) {
            return '【图片】' + notice.content
        } else {
            return notice.content
        }
    } else {
        return '暂无群公告'
    }
})

const noSpeak = computed(() => {
    if (!groupSetting.value) return false
    if (groupSetting.value.role === 1) {
        return group.value.noSpeak === 1
    } else {
        return false
    }
})

const noticeDialogVisible = ref(false)

const handleClickNoticeDialog = () => {
    noticeDialogVisible.value = true
}

const filterMemberList = computed(() => {
    let memberList = sortMemberList.value
    if (searchValue.value) {
        memberList = memberList.filter(item => {
            const friend = friendStore.findFriendByUserId(item.userId)
            const userInfo = item.userInfo
            if (friend) {
                return friend.remark.includes(searchValue.value) || item.userNickName.includes(searchValue.value) || userInfo.name.includes(searchValue.value)
            } else {
                return item.userNickName.includes(searchValue.value) || userInfo.name.includes(searchValue.value)
            }
        })
    }
    return memberList
})

const sortMemberList = computed(() => {
    let memberList = groupMembers.value
    return memberList.sort((a, b) => {
        const arole = a.role
        const brole = b.role
        if (arole === brole) {
            const aname = getMemberName(a)
            const bname = getMemberName(b)
            // 是否#，￥等特殊字符开头
            const aStartWithSpecialChar = isStartWithSpecialChar(aname)
            const bStartWithSpecialChar = isStartWithSpecialChar(bname)
            if (aStartWithSpecialChar && !bStartWithSpecialChar) {
                return 1
            } else if (!aStartWithSpecialChar && bStartWithSpecialChar) {
                return -1
            } else {
                return aname.localeCompare(bname, 'zh-CN', { sensitivity: 'accent' })
            }
        } else if (arole > brole) {
            return -1
        } else {
            return 1
        }
    })
})

const isStartWithSpecialChar = (str) => {
    const firstWord = str.charAt(0)
    const pinyinFirstWord = pinyin(firstWord, { pattern: 'first', toneType: 'none' })
    const english = /^[A-Za-z]$/
    if (english.test(pinyinFirstWord)) {
        return false
    } else {
        return true
    }
}

const getMemberName = (item) => {
    const friend = friendStore.findFriendByUserId(item.userId)
    const userInfo = item.userInfo
    if (friend) {
        return friend.remark || item.userNickName || userInfo.name;
    } else {
        return item.userNickName || userInfo.name;
    }
}

const isSearch = ref(false)
const searchValue = ref('')
const searchInput = ref(null)

const handleSearchMember = () => {
    isSearch.value = true
    nextTick(() => {
        searchInput.value.focus()
    })
}

const closeSearch = (e) => {
    isSearch.value = false
    searchValue.value = ''
}

const chatMessageList = computed(() => {
    if (chatStore.currentChatHistory.length > 0) {
        return chatStore.currentChatHistory
    } else {
        return []
    }
})

const getMoreMessage = async () => {
    if (!isHasMore.value || isLoadingMore.value) return
    isLoadingMore.value = true
    chatStore.getMoreChatMessages(currentChatInfo.value.roomId, pageSize.value).then(res => {
        if (res.code === 200) {
            if (res.data.length < pageSize.value) {
                isHasMore.value = false
            }
            isLoadingMore.value = false
        }
    })
}

const firstOpenScroll = () => {
    nextTick(() => {
        const el = document.getElementById('main-view-container')
        if (!el) return
        setTimeout(() => {
            el.scrollTop = el.scrollHeight
            isLoading.value = false
        }, 100)
    })
}

watchPostEffect(() => {
    if(chatMessageList.value.length > 0){
        const latestMessage = chatMessageList.value[0]
        if(!latestMessage.receiverType && isNeedScrollToBottom.value){
            scrollToBottom()
        }
    }
})

const handleScroll = () => {
    // 获取滚动容器的滚动高度
    const el = document.getElementById('main-view-container')
    const scrollHeight = el.scrollHeight;
    const scrollTop = el.scrollTop;
    const clientHeight = el.clientHeight;
    // 判断是否滚动到底部
    if (scrollTop + clientHeight >= scrollHeight - 30) {
        isBottom.value = true
        isNeedScrollToBottom.value = true
    } else {
        isBottom.value = false
        isNeedScrollToBottom.value = false
    }
    // 判断是否滚动到顶部,滚到就获取更多消息
    const topMessage = chatMessageList.value[chatMessageList.value.length - 1]
    if(!topMessage){
        return
    }
    const index = topMessage.messageId
    // 点击后scroll到index id位置
    const child = document.getElementById(`message-${index}`)
    const rect = child.getBoundingClientRect()
    if (rect.top >= 0 && rect.bottom <= el.clientHeight) {
        getMoreMessage()
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
const isEmpty = ref(true)

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

const chatHistoryDialogVisible = ref(false)

const openChatHistoryDialog = () => {
    const lastMessage = chatMessageList.value.find(item => !item.sendStatus)
    const id = lastMessage?.messageId || ''
    lastMessageId.value = id
    chatHistoryDialogVisible.value = true
}

const fileUploadCallback = (file) => {
    // 粘贴的是文件，创建文件发送消息
    const sendingMessage = {
        messageId: new Date().getTime(),
        roomId: group.value.roomId,
        senderId: userStore.userInfo.userId,
        receiverId: group.value.id,
        receiverType: 1,
        type: 3,
        sendStatus: 0,
        content: file.name,
        contentText: file.name,
        createTime: new Date(),
        file: file
    }
    chatStore.addCurrentChatHistory(sendingMessage)
    nextTick(() => {
        scrollToBottom()
    })
    messageInput.value.focus()
}

const handleInput = (e) => {
    const value = messageInput.value.innerHTML
    isEmpty.value = value === ''
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
    if (group.value.noSpeak === 1) {
        return ElMessage.warning('该群组禁止发言')
    }
    const message = messageInput.value.innerHTML
    if (!message) return
    const encodeMessage = encodeHtmlToMessage(message)
    // 发送消息，发送中
    const sendingMessage = {
        messageId: new Date().getTime(),
        roomId: group.value.roomId,
        senderId: userStore.userInfo.userId,
        receiverId: group.value.id,
        receiverType: 1,
        type: 1,
        sendStatus: 0,
        content: encodeMessage,
        contentText: messageInput.value.innerText,
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
            roomId: group.value.roomId,
            senderId: userStore.userInfo.userId,
            receiverId: group.value.id,
            receiverType: 1,
            type: 1,
            content: saveMessage,
            contentText: messageInput.value.innerText,
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

    .main-group-container {
        display: flex;
        flex-direction: row;
        flex: 1;
        height: calc(100% - 101px);
        position: relative;


        :deep(.el-overlay) {
            position: absolute;
            background-color: rgba(0, 0, 0, 0);
        }

        .main-chat-container {
            display: flex;
            flex: 1;
            flex-direction: column;

            .main-view-container {
                height: 60%;
                max-height: 60%;
                width: 100%;
                overflow-y: auto;
                margin-bottom: 10px;
                min-width: 700px;
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

                        &.disabled::before {
                            // placeholder样式
                            color: var(--el-text-color-placeholder);
                            content: '全员禁言中';
                        }
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

    .main-chat-container-right {
        width: 200px;
        height: 100%;
        border-left: 1px solid var(--el-color-info-light-5);
        display: flex;
        flex-direction: column;

        .group-notice-container {
            height: 200px;
            display: flex;
            flex-direction: column;
            padding: 20px 10px;
            border-bottom: 1px solid var(--el-color-info-light-5);
            cursor: default;

            .notice-title {
                margin-bottom: 10px;
                height: 30px;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;
            }

            .notice-content {
                flex: 1;
                max-height: 150px;
                max-width: 180px;
                color: var(--el-color-info);
                font-size: 14px;
                line-height: 25px;
                overflow: hidden;
                word-wrap: break-word;
                display: -webkit-box;
                -webkit-line-clamp: 6;
                -webkit-box-orient: vertical;
            }
        }

        .group-member-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 20px 10px;
            height: calc(100% - 240px);

            .member-title {
                margin-bottom: 10px;
                height: 30px;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;

                .icon {
                    cursor: pointer;

                    &:hover {
                        color: var(--el-color-primary);
                    }
                }
            }

            .member-list {
                display: flex;
                flex-direction: column;
                overflow-y: auto;
                height: calc(100% - 40px);
            }
        }
    }
}
</style>