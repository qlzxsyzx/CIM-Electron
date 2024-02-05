<template>
    <div class="more-options-container">
        <div class="single-options-container">
            <div class="switch-options">
                <span>消息置顶</span>
                <el-switch v-model="currentChatInfo.top" :active-value="1" :inactive-value="0"></el-switch>
            </div>
        </div>
        <div class="single-options-container">
            <div class="switch-options">
                <span>消息免打扰</span>
                <el-switch v-model="currentChatInfo.status" :active-value="1" :inactive-value="0"></el-switch>
            </div>
        </div>
        <div class="single-options-container">
            <div class="input-options">
                <el-input v-model="friendInfo.remark" placeholder="请填写备注"></el-input>
            </div>
        </div>
        <div class="single-options-container">
            <div class="button-options danger" @click="block">
                <a>拉黑</a>
            </div>
        </div>
        <div class="single-options-container">
            <div class="button-options danger" @click="deleteFriend">
                <a>删除好友</a>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref,computed } from 'vue';
import { useChatStore } from '../store/chatStore';

const chatStore = useChatStore();

const currentChatInfo = computed(() => {
    return chatStore.currentChatInfo;
})

const friendInfo = computed(() => {
    return chatStore.friendList.find(item => item.friendId === currentChatInfo.value.toUserId);
})

const block = () => {

}

const deleteFriend = () => {

}

</script>
<style lang="scss" scoped>
.more-options-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .single-options-container {
        display: flex;
        flex-direction: row;
        background-color: white;
        border-radius: 5px;
        height: 40px;
        align-items: center;
        padding: 0 10px;

        .input-options {
            height: 100%;
            display: flex;
            align-items: center;
            flex: 1;

            :deep(.el-input__wrapper) {
                box-shadow: none;
                border-radius: 0;
                border-bottom: 2px solid #ffffff;

                &:hover {
                    // 底部出现蓝色下划线
                    border-bottom: 2px solid #409EFF;
                }

                &:focus-within {
                    // 底部出现蓝色下划线
                    border-bottom: 2px solid #409EFF;
                }
            }
        }

        .button-options {
            height: 100%;
            flex: 1;
            display: flex;
            flex-direction: row;
            align-items: center;
            cursor: pointer;

            &:hover {
                background-color: #f5f7fa;
                cursor: pointer;
            }

            &.danger {
                color: #F56C6C;
                justify-content: center;
            }
        }

        .switch-options {
            height: 100%;
            flex: 1;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
        }
    }
}
</style>