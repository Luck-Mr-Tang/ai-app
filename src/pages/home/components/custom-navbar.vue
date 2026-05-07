<template>
    <view class="navbar" :style="{ height: addUnit(height), paddingTop: addUnit(statusBarHeight || 0) }">
        <image class="bg" src="" />
        <view :class="`wd-navbar ${fixed ? 'is-fixed' : ''}`" :style="rootStyle">
            <view class="wd-navbar__content">
                <view class="wd-navbar__capsule" v-if="$slots.capsule">
                    <slot name="capsule" />
                </view>
                <view :class="`wd-navbar__left`" @click="handleClickLeft" v-else-if="!$slots.left">
                    <image class="logo-icon" src="" />
                </view>
                <view v-else :class="`wd-navbar__left`" @click="handleClickLeft">
                    <slot name="left" />
                </view>
                <view class="wd-navbar__title">
                    <slot name="title" />
                    <block v-if="!$slots.title && pageConf.meta.title">{{ pageConf.meta.title }}</block>
                </view>
            </view>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { findPageConfig } from '@/utils'
import { type CSSProperties, computed, getCurrentInstance, nextTick, onMounted, ref, watch } from 'vue'
import { addUnit, getRect, isDef, objToStyle } from 'wot-design-uni/components/common/util'
import { useRoute } from 'uni-mini-router'

import 'wot-design-uni/components/wd-navbar/index.scss'

const route = useRoute()
const props = defineProps({
    fixed: {
        default: true
    },
    placeholder: {
        default: false
    },
    zIndex: {
        default: 500
    },
    safeAreaInsetTop: {
        default: true
    },
    leftArrow: {
        default: true
    }
})

const pageConf = ref({
    meta: {
        title: ''
    }
})
const emit = defineEmits(['click-left', 'click-right'])

const height = ref<number | ''>('') // 占位高度

const { statusBarHeight } = uni.getSystemInfoSync()

watch(
    [() => props.fixed, () => props.placeholder],
    () => {
        setPlaceholderHeight()
    },
    { deep: true, immediate: false }
)

const rootStyle = computed(() => {
    const style: CSSProperties = {}
    if (props.fixed && isDef(props.zIndex)) {
        style['z-index'] = props.zIndex
    }
    if (props.safeAreaInsetTop) {
        style['padding-top'] = addUnit(statusBarHeight || 0)
    }
    return `${objToStyle(style)}`
})

onMounted(() => {
    if (props.fixed && props.placeholder) {
        nextTick(() => {
            setPlaceholderHeight()
        })
    }
    pageConf.value = findPageConfig(route.path)
    console.log(pageConf.value)
})

const { proxy } = getCurrentInstance() as any

function setPlaceholderHeight() {
    if (!props.fixed || !props.placeholder) {
        return
    }

    getRect('.wd-navbar', false, proxy).then(res => {
        height.value = res.height as number
    })
}

const handleClickLeft = () => {}
</script>

<style lang="scss">
.navbar {
    height: var(--wot-navbar-height, 88px);
    width: 100%;
    box-sizing: content-box;
    position: relative;
}
.bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 500;
}
.h5 .navbar {
    padding-top: 0;
}
:deep(.wd-navbar) {
    background-color: #ffffff00 !important;
}
.logo-icon {
    width: 176px;
    height: 75px;
}
</style>
