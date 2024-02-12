<template>
    <div class="transfer-group-container">
        <template v-if="candidateMemberList.length > 0">
        
        </template>
        <template v-else>
            <el-empty description="暂无候选成员"></el-empty>
        </template>
    </div>
</template>

<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { getCandidateMemberList } from '../api/group';
import { ElMessage } from 'element-plus';

const props = defineProps(['groupId'])

const candidateMemberList = ref([])

onBeforeMount(() => {
    // 获取候选成员列表
    getCandidateMemberList(props.groupId).then(res => {
        if(res.code === 200){
            candidateMemberList.value = res.data
        }
    }).catch(err => {
        ElMessage.error('获取数据失败')
    })
})
</script>

<style lang="scss" scoped>

</style>