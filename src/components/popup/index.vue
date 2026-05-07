<template>
    <view
        v-if="maskVisiable"
        class="popup-mask"
        :style="{
            zIndex: zIndex ? String(zIndex) : '101'
        }"
    >
        <view
            :class="{ 'popup-wrap': true, 'popup-wrap-show': popupVisiable }"
            :style="{
                maxHeight: maxHeight || '80vh'
            }"
        >
            <view class="popup-header">
                <text class="popup-header-text">{{ title }}</text>
            </view>
            <view class="popup-body">
                <slot name="body" />
            </view>
            <view
                class="popup-bottom"
                :style="{
                    height: bottomBlockHeight
                }"
            ></view>
            <view v-if="!hideClose" class="popup-close" @click="emits('update:visiable', false)">
                <image src="../../static/image/popup-close.png" class="close-icon"></image>
            </view>
        </view>
    </view>
</template>
<script lang="ts">
export default {
    options: { styleIsolation: 'shared', virtualHost: true }
}
</script>

<script lang="ts" setup>
import { nextTick, ref, watch } from 'vue'

const props = defineProps<{
    title: string
    visiable: boolean
    zIndex?: number | string
    maxHeight?: string
    bottomBlockHeight?: string
    hideClose?: boolean
}>()
const emits = defineEmits(['update:visiable'])

const maskVisiable = ref(false)
const popupVisiable = ref(false)
watch(
    () => props.visiable,
    val => {
        if (val) {
            maskVisiable.value = true
            nextTick(() => {
                popupVisiable.value = true
            })
        } else {
            popupVisiable.value = false
            setTimeout(() => {
                maskVisiable.value = false
            }, 200)
        }
    }
)
</script>

<style lang="scss" scoped>
.popup-mask {
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    .popup-wrap-show {
        transition: all 0.3s ease;
        transform: translateY(0%) !important;
    }
    .popup-wrap {
        transition: all 0.3s ease;
        transform: translateY(100%);

        width: 100%;
        border-radius: 24rpx 24rpx 0px 0px;
        background: #fff;
        // background-image: linear-gradient(
        //         0deg,
        //         #ffffff 0%,
        //         rgba(255, 255, 255, 0.52) 80%,
        //         rgba(255, 199, 200, 0.4) 100%
        //     ),
        //     linear-gradient(#ffffff, #ffffff);
        // background-blend-mode: normal, normal;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        position: absolute;
        bottom: 0;
        .popup-header {
            height: 68rpx;
            padding-top: 24rpx;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
            .popup-header-text {
                font-style: 32rpx;
                height: 44rpx;
                line-height: 44rpx;
                color: #333;
                font-weight: bold;
            }
        }
        .popup-body {
            flex: 1;
            overflow-y: scroll;
            &::-webkit-scrollbar {
                display: none;
            }
        }
        .popup-bottom {
            flex-shrink: 0;
        }
        .popup-close {
            width: 54rpx;
            height: 54rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            right: 21rpx;
            top: 18rpx;
            .close-icon {
                width: 24rpx;
                height: 24rpx;
            }
        }
    }
}
</style>
