<template>
    <wd-config-provider :custom-class="'h-full flex flex-col layout ' + platform" :theme-vars="themeVars">
        <top-toast />
        <slot name="navbar">
            <navbar :title="title || ''" v-bind="$attrs" />
        </slot>
        <view class="layout-content flex-1">
            <slot />
        </view>
        <tabbar />
    </wd-config-provider>
</template>
<script lang="ts" setup>
import navbar from '@/components/navbar/index.vue'
import tabbar from '@/components/tabbar/index.vue'
import TopToast from '@/components/top-toast/index.vue'
import { getThemeVars } from './themeVars'

const props = defineProps<{
    title?: string
}>()

const platform = process.env.UNI_PLATFORM as string
console.log(platform)

const themeVars = getThemeVars()
</script>
<style lang="scss" scoped>
.layout {
    &-content {
        position: relative;
        z-index: 19;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
    }
}
</style>
