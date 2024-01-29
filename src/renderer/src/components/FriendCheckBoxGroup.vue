<template>
    <div class="friend-check-box-group">
        <template v-for="[key, value] of friendMap" :key="value">
            <div v-if="!isSearch" :id="'index-' + (key === '#' ? 'unknown' : key)" class="title"> {{ key }} </div>
            <template v-for="item in value" :key="item.id">
                <FriendCheckBox :friend="item" :checked="isChecked(item)" @check="handleClick"/>
            </template>
        </template>
    </div>
</template>

<script setup>
import { ref,computed,watch } from 'vue';
import FriendCheckBox from './FriendCheckBox.vue'
import sortListToMap from '../assets/js/sort-first-word'

const props = defineProps(['isSearch','friends', 'modelValue'])

const friendMap = computed(() => {
    if (props.friends) {
        return sortListToMap(props.friends, item => item.userVo.name, item => item.remark)
    } else {
        return []
    }
})

const emit = defineEmits(['update:modelValue'])

const chooseList = ref([])

const handleClick = (item) => {
    chooseList.value = props.modelValue
    if (!chooseList.value.some(el => el.id === item.id)) {
        chooseList.value.push(item)
    } else {
        chooseList.value = chooseList.value.filter(el => el.id !== item.id)
    }
    emit('update:modelValue', chooseList.value)
}

const isChecked = (item) => {
    return props.modelValue.some(el => el.id === item.id)
}


</script>

<style lang="scss" scoped>
.friend-check-box-group {
    margin-top: 10px;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;

    .check-box {
        margin: 0 10px;
    }

    .title {
        font-weight: 600;
        font-size: 16px;
        color: #606266;
        padding: 5px 10px;
    }
}
</style>