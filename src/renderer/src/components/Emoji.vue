<template>
    <div class="emoji-container">
        <!-- 所有表情列表 -->
        <div class="emoji-title">全部表情</div>
        <div class="all-emoji">
            <div class="emoji-item" @click="appendEmoji(item)" v-for="(item, index) in images" :key="index">    
                <img :src="item.url" :alt="item.name" :title="item.name" class="cim-emoji">
            </div>
        </div>
    </div>
</template>
 
<script setup>
import { ref } from 'vue'
import emojis from '../assets/js/emoji'
const images = emojis
// const req1 = import.meta.glob('../assets/qq/*.*', {eager: true})
// // 循环所有图片，将图片名设置成键，值为导入该图片的地址
// for (const key in req1) {
//     // let name = key.replace(/(\.\/images\/|\..*)/g, '')
//     let name =key.split('/').slice(-1)[0].split('.')[0]

//     // 抛出图片大对象后，文件页面直接引入后将图片的具体名称作为属性就能导入该图片
//     let img = {name : name , url : req1[key].default}
//     images.value.push(img)
// }
// console.log(images)


const emit = defineEmits(['selectEmoji'])
// 点击emoji, 输入框插入emoji回调
const appendEmoji = (i) => {
    emit('selectEmoji', i)
}
</script>
 
<style lang="scss" scoped>
.emoji-container {
    width: 100%;
    height: 350px;
    padding: 5px 10px 15px;
    box-sizing: border-box;
    overflow: auto;
 
    &::-webkit-scrollbar {
        display: none;
    }
}
 
.emoji-title {
    font-size: 12px;
    margin: 10px 0 5px;
}
 
.all-emoji {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
 
    .emoji-item {
        width: 30px;
        height: 30px;
        margin: 5px 10px;
        cursor: pointer;
 
        img {
            width: 100%;
            height: 100%;
        }
    }
}
</style>