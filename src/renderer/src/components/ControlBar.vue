<template>
    <el-button text :icon="Minus" @click="minusWin" ref="minBtn" class="control-bar"></el-button>
        <!-- <el-button text :icon="FullScreen"></el-button> -->
    <el-button class="close control-bar" :icon="Close" @click="closeWin"></el-button>
</template>

<script setup>
import {Minus,FullScreen,Close} from '@element-plus/icons-vue'
import {ref} from 'vue'

const minBtn = ref()

const minusWin = () => {
    console.log('minus',minBtn.value.ref)
    window.electron.ipcRenderer.send('window-min')
    minBtn.value.ref.blur()
}

const closeWin = () => {
    window.electron.ipcRenderer.send('window-close')
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