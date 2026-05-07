<template>
    <view v-if="props.modelValue" class="dialog-mask" :style="{ zIndex: zIndex }">
        <view
            :style="{
                width: `${_width}rpx`,
                minHeight: `${_height}rpx`,
                backgroundColor: bgImg ? '' : '#ffffff'
            }"
            class="common-dialog"
        >
            <image
                v-if="bgImg"
                :src="bgImg"
                class="bg-img"
                :style="{ width: `${_width}rpx`, minHeight: `${_height}rpx` }"
            />
            <image v-if="!noClose" src="@/static/image/dialog-close.png" class="close-icon" @click="close" />
            <view class="common-dialog_body">
                <slot></slot>
            </view>
            <view v-if="isShowFoot" class="common-dialog_foot">
                <view v-if="confirmText" class="comfirm-btn" @click="$emit('confirm')">{{ confirmText }}</view>
            </view>
        </view>
    </view>
</template>

<script lang="ts">
export default {
    options: {
        virtualHost: true
    }
}
</script>
<script lang="ts" setup>
import { defineProps, defineEmits, computed } from 'vue'
const props = defineProps<{
    width?: string | number
    height?: string | number
    noClose?: boolean
    modelValue: boolean
    zIndex?: number
    confirmText?: string
    isShowFoot?: boolean
    bgImg?: string
    isDefaultColor?: boolean
}>()

const emits = defineEmits(['update:modelValue', 'confirm', 'close'])
const _width = computed(() => {
    return props.width || 600
})

const _height = computed(() => {
    return props.height || 660
})

const close = () => {
    emits('update:modelValue', false)
    emits('close')
}
</script>
<style lang="scss" scoped>
.dialog-mask {
    position: fixed;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    left: 0;
    top: 0;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    .common-dialog {
        position: relative;
        display: flex;
        flex-direction: column;
        border-radius: 20rpx;
        .bg-img {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            z-index: -1;
        }
        .close-icon {
            width: 67rpx;
            height: 67rpx;
            position: absolute;
            right: 50%;
            transform: translateX(50%);
            bottom: -112rpx;
            cursor: pointer;
        }
        &_body {
            flex: 1;
            padding: 24rpx;
            width: 100%;
            position: relative;
        }
        &_foot {
            margin: 60rpx 40rpx;
            .comfirm-btn {
                background-image: linear-gradient(-30deg, #e1251b 0%, #fd441f 100%), linear-gradient(#fa3130, #fa3130);
                color: #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32rpx;
                border-radius: 44rpx;
                padding: 27rpx;
            }
        }
    }
}
</style>
