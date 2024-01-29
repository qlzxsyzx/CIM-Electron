<template>
    <div class="menu-bar-container">
        <div class="avatar-container">
            <ButtonBox>
                <el-avatar class="avatar" :src="userStore.userInfo.avatarUrl" />
            </ButtonBox>
        </div>
        <div class="menu-container">
            <ButtonBox title="主页" @click="clickMenu(0)" :class="clickNum === 0 ? 'click' : ''">
                <SvgIcon iconName="home" />
            </ButtonBox>
            <ButtonBox title="最近会话" @click="clickMenu(1)" :class="clickNum === 1 ? 'click' : ''">
                <SvgIcon iconName="messages" />
            </ButtonBox>
            <ButtonBox title="朋友" @click="clickMenu(2)" :class="clickNum === 2 ? 'click' : ''">
                <SvgIcon iconName="contacts" />
            </ButtonBox>
            <ButtonBox title="群组" @click="clickMenu(3)" :class="clickNum === 3 ? 'click' : ''">
                <SvgIcon iconName="group" />
            </ButtonBox>
        </div>
        <div class="footer">
            <ButtonBox class="close" title="登出" @click="clickMenu(4)">
                <SvgIcon iconName="logout" />
            </ButtonBox>
        </div>
    </div>
</template>

<script setup>
import { ref,computed } from 'vue'
import { useUserStore } from '../store/userStore';
import { useChatStore } from '../store/chatStore';
import { useRouter,useRoute } from 'vue-router';
import ButtonBox from './ButtonBox.vue'

const userStore = useUserStore()
const chatStore = useChatStore()
const router = useRouter()
const route = useRoute()

const clickNum = computed(() => {
    return route.path === '/home' ? 0 : route.path.startsWith('/chat') ? 1 : route.path.startsWith('/friend') ? 2 : 3
})

const clickMenu = (num) => {
    switch (num) {
        case 0:
            router.push('/home')
            break
        case 1:
            // 查询是否存在点击过的对话
            const currentChatInfo =  chatStore.currentChatInfo
            if(currentChatInfo){
                if(currentChatInfo.type === 0){
                    router.push('/chat/single/' + currentChatInfo.roomId)
                    return
                }else if(currentChatInfo.type === 1) {
                    router.push('/chat/group/' + currentChatInfo.roomId)
                    return
                }
            }
            router.push('/chat/home')
            break
        case 2:
            router.push('/friend/home')
            break
        case 3:
            router.push('/group/home')
            break
        case 4:
            userStore.logout()
            window.location.href = '/login';
            return
    }
}


</script>

<style lang="scss" scoped>
.menu-bar-container {
    min-width: 100px;
    height: 100%;
    background-color: black;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.avatar-container {
    margin: 40px auto;

    .avatar {
        width: 60px;
        height: 60px;
    }
}

.menu-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.footer {
    margin-top: auto;
    margin-bottom: 40px;
}
</style>