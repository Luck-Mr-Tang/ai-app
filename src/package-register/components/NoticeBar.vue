<template>
    <view
        v-if="!isPreview"
        class="notice-bar"
        :style="{
            background: noticeBarStyle.background,
            paddingTop: addUnit(statusBarHeight || 0)
        }"
    >
        <wd-icon
            name="info-circle-filled"
            :color="noticeBarStyle.color"
            size="30rpx"
            customStyle="margin-right: 12rpx"
        ></wd-icon>
        <view class="notice-content">
            <slot></slot>
        </view>
    </view>
    <view v-if="!isPreview" class="top-block"></view>
    <view v-else class="preview-info">
        <image :src="infoBg" class="bg"></image>
        <view class="preview-title">
            <image class="preview-icon" :src="infoIcon"></image>
            <text class="preview-text">资料预览</text>
        </view>
        <view class="preview-desc">
            <text>温馨提示：提交资料后，平台需进行资料真实性核实，审核时间</text>
            <text style="color: #f23332">预计在1个工作日，该时间段内您将无法参与项目</text>
            <text>。</text>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { computed, defineProps } from 'vue'
import infoBg from '@/package-enterprise/static/enterprise/preview-bg.png'
import infoIcon from '@/package-enterprise/static/enterprise/preview-icon.png'
import { addUnit } from 'wot-design-uni/components/common/util'

interface NoticeBarStyle {
    color: string
    background: string
}

const props = defineProps<{
    isPreview?: boolean
    noticeBarStyle?: NoticeBarStyle
}>()

// 设置默认值
const { statusBarHeight } = uni.getSystemInfoSync()
const defaultNoticeBarStyle: NoticeBarStyle = {
    color: '#f23332',
    background: 'rgb(255, 245, 245)'
}

const noticeBarStyle = computed(() => ({
    ...defaultNoticeBarStyle,
    ...props.noticeBarStyle
}))
</script>

<style lang="scss" scoped>
.notice-bar {
    width: 100vw;
    // height: 78rpx;
    padding: 0 22rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    position: fixed;
    // top: 0;
    top: var(--wot-navbar-height, 88px);
    z-index: 9;
    .notice-content {
        width: calc(100vw - 86rpx);
        white-space: nowrap;
        overflow: hidden;
        height: 100%;
        line-height: 78rpx;
        font-size: 26rpx;
        color: #333;
    }
}
.top-block {
    height: 78rpx;
    background: #fff;
}
.preview-info {
    padding: 48rpx 30rpx;
    margin-top: 20rpx;
    position: relative;
    box-sizing: border-box;
    overflow: hidden;
    .bg {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 1;
    }
    .preview-title {
        display: flex;
        align-items: center;
        height: 38rpx;
        line-height: 38rpx;
        font-size: 34rpx;
        color: #171825;
        font-weight: bold;
        position: relative;
        z-index: 2;
        .preview-icon {
            width: 52rpx;
            height: 38rpx;
            margin-right: 12rpx;
        }
    }
    .preview-desc {
        margin-top: 22rpx;
        font-size: 26rpx;
        line-height: 40rpx;
        color: #171825;
        position: relative;
        z-index: 2;
    }
}
</style>
