<template>
    <el-button :icon="Minus" @click="minusWin" ref="minBtn" class="control-bar"  color="#f0f2f5" dark></el-button>
    <el-button :icon="FullScreen" @click="maxWin" ref="maxBtn" class="control-bar"  color="#f0f2f5" dark></el-button>
    <el-button class="close control-bar" :icon="Close" @click="closeWin" color="#f0f2f5"></el-button>
</template>

<script setup>
import {Minus,FullScreen,Close} from '@element-plus/icons-vue'
import {ref} from 'vue'

const minBtn = ref()
const maxBtn = ref()
 
const minusWin = () => {
    console.log('minus',minBtn.value.ref)
    window.electron.ipcRenderer.send('main-min')
    minBtn.value.ref.blur()
}

const maxWin = () => {
    console.log('max',maxBtn.value.ref)
    window.electron.ipcRenderer.send('window-max')
    maxBtn.value.ref.blur()
}

const closeWin = () => {
    window.electron.ipcRenderer.send('main-close')
}
</script>

<style scoped>

.close {
    border: hidden;
}
.close:hover{
    color: white;
    background: red;
}

.control-bar {
    -webkit-app-region: no-drag;
}
</style>