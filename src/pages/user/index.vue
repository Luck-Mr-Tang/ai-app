<template>
    <layout>
        <wd-message-box />
    </layout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { onShareAppMessage } from '@dcloudio/uni-app'
import { onShow } from '@dcloudio/uni-app'
import layout from '@/components/layout/index.vue'

onShow(() => {})

onMounted(() => {})

onShareAppMessage(() => {
    return {
        title: '',
        path: '/pages/home/index'
    }
})
</script>

<style lang="scss" scoped>
@use './index.scss';
</style>
