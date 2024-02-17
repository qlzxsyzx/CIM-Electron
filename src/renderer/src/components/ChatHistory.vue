<template>
    <div class="chat-history-container">
        <div class="top">
            <el-input v-model="searchContent" placeholder="搜索" prefix-icon="Search" size="small" @keyup.enter="handleSearch"
                clearable @clear="handleClearBack" />
        </div>
        <div class="tab">
            <el-tabs v-model="activeName">
                <el-tab-pane label="全部" name="all"></el-tab-pane>
            </el-tabs>
        </div>
        <div class="history-list" ref="list">
            <template v-if="props.lastMessageId">
                <!-- 聊天列表 -->
                <ul v-infinite-scroll="load" style="list-style: none; padding: 0;">
                    <!-- 时间affix -->
                    <li v-for="[key, value] of splitByDateMessageMap" :key="key">
                        <div class="date-list" :id="key">
                            <div class="affix" style="padding: 10px 0; border-bottom: 1px solid #c8c9cc;">
                                {{ key }}
                            </div>
                            <template v-for="item in value" :key="item.id">
                                <HistoryItem :message="item" />
                            </template>
                        </div>
                    </li>
                </ul>
            </template>
            <template v-else>
                <el-empty description="暂无聊天记录" />
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onBeforeMount, nextTick } from 'vue';
import { formatDate } from '../assets/js/format';
import { useChatStore } from '../store/chatStore';
import HistoryItem from './HistoryItem.vue';
import { getSingleChatMessageHistory, getGroupChatMessageHistory } from '../api/chat';
import { ElMessage } from 'element-plus';

const chatStore = useChatStore()
const props = defineProps(['lastMessageId'])
const activeName = ref('all');
const searchContent = ref('');
const pageNum = ref(1);
const pageSize = ref(30);
const historyMessageList = ref([])
const backHistoryMessageList = ref([])
const backPageNum = ref(1)
const list = ref(null)
const isHasMore = ref(true)
const backHasMore = ref(true)
const isSearch = ref(false)

const getHistoryMessageList = () => {
    if (!props.lastMessageId) return
    if (!isHasMore.value) return
    if (currentChatInfo.value.type === 0) {
        const params = {
            toUserId: currentChatInfo.value.toUserId,
            lastMessageId: props.lastMessageId,
            searchContent: searchContent.value.trim(),
            pageNum: pageNum.value,
            pageSize: pageSize.value
        }
        getSingleChatMessageHistory(params).then(res => {
            if (res.code === 200) {
                if (res.data.length < pageSize.value) isHasMore.value = false
                historyMessageList.value = Array.prototype.concat.apply(historyMessageList.value, res.data)
                pageNum.value++
            }
        }).catch(err => {
            ElMessage.error('获取数据失败')
        })
    } else {
        const params = {
            groupId: currentChatInfo.value.groupId,
            lastMessageId: props.lastMessageId,
            searchContent: searchContent.value.trim(),
            pageNum: pageNum.value,
            pageSize: pageSize.value
        }
        getGroupChatMessageHistory(params).then(res => {
            if (res.code === 200) {
                if (res.data.length < pageSize.value) isHasMore.value = false
                historyMessageList.value = Array.prototype.concat.apply(historyMessageList.value, res.data)
                pageNum.value++
            }
        }).catch(err => {
            ElMessage.error('获取数据失败')
        })
    }
}

const currentChatInfo = computed(() => {
    if (!chatStore.currentChatInfo) return null;
    return chatStore.currentChatInfo.recentChat
})

const splitByDateMessageMap = computed(() => {
    const result = new Map();
    historyMessageList.value.forEach(message => {
        const date = formatDate(message.createTime);
        if (!result.has(date)) {
            result.set(date, []);
        }
        result.get(date).push(message);
    });
    return result;
});

const load = () => {
    getHistoryMessageList()
}

const handleSearch = () => {
    if (searchContent.value === '') {
        if (!isSearch.value) {
            return
        } else {
            historyMessageList.value = backHistoryMessageList.value
            pageNum.value = backPageNum.value
            isSearch.value = false
            nextTick(() => { list.value.scrollTop = 0 })
        }
    }
    if (!searchContent.value.trim()) {
        return
    }
    if (!isSearch.value) {
        backHistoryMessageList.value = historyMessageList.value
        backPageNum.value = pageNum.value
        backHasMore.value = isHasMore.value
    }
    historyMessageList.value = []
    pageNum.value = 1
    isSearch.value = true
    isHasMore.value = true
    getHistoryMessageList()
}

const handleClearBack = () => {
    historyMessageList.value = backHistoryMessageList.value
    pageNum.value = backPageNum.value
    backHistoryMessageList.value = []
    backPageNum.value = 1
    isSearch.value = false
    isHasMore.value = backHasMore.value
    nextTick(() => { list.value.scrollTop = 0 })
}
</script>

<style lang="scss" scoped>
.chat-history-container {
    height: 500px;

    .history-list {
        height: calc(100% - 100px);
        overflow-y: auto;

        .affix {
            position: sticky;
            top: 0;
            background-color: #f0f2f5;
        }
    }
}
</style>