import { createRouter,createWebHashHistory } from "vue-router";
import Layout from '../views/Layout.vue'
import { useUserStore } from "../store/userStore";

const routes = [
    {path: '/login', name: '登录', component: () => import('../views/Login.vue')},
    {path: '/register', name: '注册', component: () => import('../views/Register.vue')},
    {path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/NotFound.vue')},
    {
        path: '/',
        component: Layout,
        redirect:'chat',
        children: [
            {path: 'home', name: '首页', component: () => import('../views/Home.vue')},
            {
                path: 'chat', 
                name: '聊天', 
                meta: {name:'聊天'},
                component: () => import('../views/ChatView.vue'),
                redirect: 'chat/home',
                children: [
                    {path: 'home', component: () => import('../views/Home.vue')},
                    {path: 'group/:groupId', name: '群会话', component: () => import('../views/GroupChatMain.vue')},
                    {path: 'single/:userId', name: '个人聊天', component: () => import('../views/ChatMain.vue')}
                ]
            },
            {
                path: 'friend', 
                name: '好友', 
                meta: {name:'好友'},
                component: () => import('../views/FriendView.vue'),
                redirect: 'firend/home',
                children: [
                    {path: 'home', component: () => import('../views/Home.vue')},
                    {path: 'info/:friendId', name: '好友信息', component: () => import('../views/FriendInfo.vue')}
                ]
            },
            {
                path: 'group', 
                name: '群组', 
                meta: {name:'群组'},
                component: () => import('../views/GroupView.vue'),
                redirect: 'group/home',
                children: [
                    {path: 'home', component: () => import('../views/Home.vue')},
                    {path: 'info/:groupId', name: '群组信息', component: () => import('../views/GroupInfo.vue')}
                ]
            }
        ]
    }
]

const router = createRouter({
    routes,
    history:createWebHashHistory()
})

router.beforeEach((to,from) => {
    const userStore = useUserStore()
    const isLogin = userStore.isLogin
    // isLogin为true时，无法进入登录注册页面,为false,只能进入登录注册页面
    if(to.path == '/login' || to.path == '/register'){
        if(isLogin){
            return false
        }
    }else{
        if(!isLogin){
            return '/login'
        }
    }
    return true
})

export default router;