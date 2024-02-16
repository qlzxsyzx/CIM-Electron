<!-- 自定义文件上传组件 -->
<template>
    <input ref="fileInput" style="display: none;" type="file" :accept="LimitFileType" @change="handleFileChange"/>
        <!-- 按钮slot,绑定点击事件，点击就打开上传文件界面 -->
        <button class="none-button" @click="handleClick">
            <slot name="trigger"></slot>
        </button>
</template>

<script setup>
import { ref,computed } from 'vue'

const props = defineProps(['acceptFileType'])
const emits = defineEmits(['upload'])
const LimitFileType = computed(() => {
    if(props.acceptFileType === 'image'){
        return 'image/*'
    }else {
        return 'all'
    }
})

const fileInput = ref(null)

const handleClick = () => {
    fileInput.value.click()
}

const handleFileChange = (e) => {
    const file = e.target.files[0]
    emits('upload', file)
}
</script>

<style lang="scss" scoped>
// 没有样式的button
.none-button {
    display: flex;
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
}
</style>