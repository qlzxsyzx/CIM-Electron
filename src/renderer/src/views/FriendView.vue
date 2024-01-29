<template>
    <div class="chat-view-container">
        <div class="chat-side-container">
            <div class="side-tool-container">
                <SideTopToolBar />
            </div>
            <div class="side-list-container">
                <template v-if="chatStore.friends.length > 0">
                    <div class="side-list-data">
                        <template v-for="[key, value] of friendMap" :key="value">
                            <div :id="'index-' + (key === '#' ? 'unknown' : key)" class="sort-title"> {{ key }} </div>
                            <template v-for="item in value" :key="item.id">
                                <FriendItem class="side-list-item" :friend="item" />
                            </template>
                        </template>
                    </div>
                    <el-affix target=".side-list-container" :offset="100">
                        <ul class="side-list-index">
                            <li v-for="item in english" :key="item"><a @click="handleClickIndex(item)">{{ item }}</a></li>
                        </ul>
                    </el-affix>
                </template>
                <template v-else>
                    <el-empty class="side-list-data" description="暂无好友" />
                </template>
            </div>
        </div>
        <div class="chat-main-container">
            <router-view></router-view>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onBeforeMount } from "vue"
import { Plus } from '@element-plus/icons-vue'
import FriendItem from '../components/FriendItem.vue'
import { useChatStore } from '../store/chatStore'
import sortListToMap from '../assets/js/sort-first-word'
import SideTopToolBar from '../components/SideTopToolBar.vue'
import { useReconnect } from '../assets/js/reconnectMixin'

const chatStore = useChatStore()

const english = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#']

onBeforeMount(() => {
    chatStore.getFriends()
})

useReconnect(() => {
    chatStore.getFriends()
})

const friendMap = computed(() => {
    if (!chatStore.friends) return []
    const result = sortListToMap(chatStore.friends, item => item.userVo.name, item => item.remark)
    return result
})

const handleClickIndex = (index) => {
    if (index === '#') {
        index = 'unknown'
    }
    // 点击后scroll到index id位置
    const el = document.querySelector(`#index-${index}`)
    if (!el) return
    // scroll 到 el的位置
    el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
}
</script>

<style lang="scss" scoped>
.chat-view-container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;

    .chat-side-container {
        min-width: 350px;
        border-right: 1px solid var(--el-color-info-light-5);
        display: flex;
        flex-direction: column;
        background-color: #f0f2f5;

        .side-tool-container {
            padding: 0 10px;
            min-height: 100px;
            background-color: white;
            border-bottom: 1px solid var(--el-color-info-light-5);
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
        }

        .side-list-container {
            display: flex;
            position: relative;
            overflow-y: auto;
            height: 100%;

            .side-list-index {
                position: absolute;
                top: 0;
                right: 0;
                width: 30px;
                height: 100%;
                gap: 5px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                list-style-type: none;
                /* 移除原点 */
                padding: 0;
                /* 可选：移除列表的内边距 */
                margin: 0;

                /* 可选：移除列表的外边距 */
                a {
                    color: var(--el-text-color-secondary);
                    text-decoration: none;
                    cursor: pointer;

                    &:hover {
                        color: var(--el-color-primary);
                    }
                }
            }

            .side-list-data {
                display: flex;
                flex: 1;
                flex-direction: column;
                gap: 10px;

                .side-list-item {
                    margin: 0 10px;
                }

                .sort-title {
                    background-color: rgba(0, 0, 0, 0.055);
                    font-weight: 600;
                    font-size: 16px;
                    color: #606266;
                    padding: 5px 10px;
                }
            }
        }

    }

    .chat-main-container {
        width: 100%;
        height: 100%;
        background-color: #f0f2f5;
        display: flex;
    }
}
</style>