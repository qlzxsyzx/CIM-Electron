import { createApp } from 'vue'
import App from './App.vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router/router'

import './assets/css/custom-variables.scss'

import 'virtual:svg-icons-register'
import SvgIcon from './components/SvgIcon.vue'

import { createPinia } from 'pinia'

import './assets/js/platform'

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { RecycleScroller } from 'vue-virtual-scroller'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.component('RecycleScroller', RecycleScroller)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.component('SvgIcon',SvgIcon)
app.mount('#app')