<template>
    <view v-if="showNavbar" id="navbar" class="navbar" :style="{ paddingTop: addUnit(statusBarHeight || 0) }">
        <wd-navbar
            fixed
            safe-area-inset-top
            :title="title || pageConf?.meta.title || ''"
            :left-arrow="showBack"
            :left-text="''"
            @click-left="back"
        ></wd-navbar>
    </view>
    <view v-else :style="{ height: addUnit(statusBarHeight || 0) }" />
</template>
<script lang="ts" setup>
import { findPageConfig } from '@/utils'
import { useRoute } from 'uni-mini-router'
import { onBeforeMount, ref } from 'vue'
import { addUnit } from 'wot-design-uni/components/common/util'
import { isWebinWeapp } from '@/utils'

const props = defineProps<{
    title: string
    backStep?: number
    backFun?: () => void
}>()

const { statusBarHeight } = uni.getSystemInfoSync()
const route = useRoute()

const showNavbar = ref(false)
const showBack = ref(false)
const pageConf = ref(undefined as PageJSON.Page | undefined)
onBeforeMount(() => {
    pageConf.value = findPageConfig(route.path)
    showNavbar.value = !isWebinWeapp() && pageConf.value?.style?.navigationStyle === 'custom'
    showBack.value = !!pageConf.value && !pageConf.value.meta?.isTab
})

const emit = defineEmits(['back'])
function back() {
    console.log(props.backFun)

    if (props.backFun && typeof props.backFun === 'function') {
        props.backFun()
    } else {
        uni.navigateBack({
            delta: props.backStep || 1
        })
    }
}
</script>
<style lang="scss" scoped>
.navbar {
    height: var(--wot-navbar-height, 88px);
    width: 100%;
    box-sizing: content-box;
}
</style>
