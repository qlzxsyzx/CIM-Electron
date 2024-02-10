<template>
    <div class="group-info-container" v-loading="isLoading">
        <template v-if="currentGroup.roomId">
            <MyGroupInfo :groupInfo="currentGroup"/>
        </template>
        <template v-else>
            <div class="no-group-info">暂无群组信息</div>
        </template>
    </div>
</template>

<script setup>
import { useRoute, onBeforeRouteUpdate } from 'vue-router';
import { useGroupStore } from '../store/groupStore'
import { ref, onBeforeMount } from 'vue';
import { ElMessage } from 'element-plus';
import MyGroupInfo from '../components/MyGroupInfo.vue';

const route = useRoute();
const groupStore = useGroupStore();
const isLoading = ref(true);
const currentGroup = ref({});

onBeforeMount(() => {
    groupStore.getGroupInfo(route.params.groupId).then(res => {
        if (res.code === 200) {
            currentGroup.value = res.data;
            isLoading.value = false
        }
    }).catch(err => {
        ElMessage.error('获取数据失败');
    })
})

onBeforeRouteUpdate((to, from, next) => {
    isLoading.value = true;
    groupStore.getGroupInfo(to.params.groupId).then(res => {
        if (res.code === 200) {
            currentGroup.value = res.data;
            isLoading.value = false
        }
    }).catch(err => {
        ElMessage.error('获取数据失败');
    })
    next();
})

</script>

<style lang="scss" scoped>
.group-info-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>