<template>
    <view v-if="visible" class="top-toast" :class="{ show: visible }">
        <text class="t-msg">{{ msg }}</text>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const msg = ref('')
const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

function onToast(text: unknown) {
    if (typeof text !== 'string' || !text) return
    msg.value = text
    visible.value = true
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
        visible.value = false
    }, 2000)
}

onMounted(() => {
    uni.$on('top-toast', onToast)
})
onUnmounted(() => {
    uni.$off('top-toast', onToast)
    if (timer) clearTimeout(timer)
})
</script>

<style lang="scss" scoped>
.top-toast {
    position: fixed;
    top: calc(60rpx + env(safe-area-inset-top));
    left: 50%;
    transform: translateX(-50%);
    max-width: 80vw;
    padding: 18rpx 32rpx;
    background: rgba(20, 20, 20, 0.92);
    color: #fff;
    border-radius: 999rpx;
    font-size: 26rpx;
    line-height: 1.4;
    z-index: 9999;
    box-shadow: 0 12rpx 24rpx -8rpx rgba(0, 0, 0, 0.4);
    pointer-events: none;
    animation: tt-in 0.18s ease;
    .t-msg {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: inline-block;
        max-width: 70vw;
    }
}
@keyframes tt-in {
    from {
        opacity: 0;
        transform: translate(-50%, -10rpx);
    }
    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}
</style>
