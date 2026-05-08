<template>
    <layout>
        <view class="me">
            <view class="hero">
                <view class="avatar">
                    {{ user ? user.username.slice(0, 1).toUpperCase() : '?' }}
                </view>
                <view class="info">
                    <view class="name-row">
                        <text class="name">{{ user ? user.username : '未登录' }}</text>
                        <text v-if="user?.role === 'super'" class="tag super">超管</text>
                    </view>
                    <view class="meta">
                        {{
                            user
                                ? statusLabel(user.status)
                                : '请登录账号开始使用'
                        }}
                    </view>
                </view>
            </view>

            <view v-if="user?.role === 'super'" class="card group">
                <view class="row" @click="goAdmin">
                    <view class="row-icon">🛡</view>
                    <view class="row-text">
                        <view class="t">用户审核</view>
                        <view class="s">审核新注册账号</view>
                    </view>
                    <view class="arrow">›</view>
                </view>
            </view>

            <view class="card group">
                <view class="row" @click="goUsage">
                    <view class="row-icon">📚</view>
                    <view class="row-text">
                        <view class="t">使用说明</view>
                        <view class="s">了解功能与玩法</view>
                    </view>
                    <view class="arrow">›</view>
                </view>
                <view class="row" @click="goAbout">
                    <view class="row-icon">ℹ️</view>
                    <view class="row-text">
                        <view class="t">关于</view>
                        <view class="s">v0.1 · MVP</view>
                    </view>
                    <view class="arrow">›</view>
                </view>
            </view>

            <view class="card group">
                <view class="row" @click="goTerms">
                    <view class="row-icon">📄</view>
                    <view class="row-text">
                        <view class="t">服务条款</view>
                    </view>
                    <view class="arrow">›</view>
                </view>
                <view class="row" @click="goPrivacy">
                    <view class="row-icon">🔒</view>
                    <view class="row-text">
                        <view class="t">隐私协议</view>
                    </view>
                    <view class="arrow">›</view>
                </view>
            </view>

            <view v-if="user" class="logout" @click="onLogout">退出登录</view>
            <view v-else class="logout primary" @click="goLogin">去登录</view>
        </view>

        <wd-message-box />
    </layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShareAppMessage, onShow } from '@dcloudio/uni-app'
import layout from '@/components/layout/index.vue'
import { clearUser, getCachedUser, type AIUser } from '@/api/ai'

const user = ref<AIUser | null>(getCachedUser())

onShow(() => {
    user.value = getCachedUser()
})

function statusLabel(s: string) {
    return { pending: '待审核', approved: '已激活', rejected: '已拒绝', disabled: '已停用' }[s] || s
}

function goAdmin() {
    uni.navigateTo({ url: '/package-ai/pages/admin/index' })
}
function goUsage() {
    uni.navigateTo({ url: '/package-ai/pages/usage/index' })
}
function goAbout() {
    uni.navigateTo({ url: '/package-ai/pages/about/index' })
}
function goTerms() {
    uni.navigateTo({ url: '/package-ai/pages/terms/index' })
}
function goPrivacy() {
    uni.navigateTo({ url: '/package-ai/pages/privacy/index' })
}
function goLogin() {
    uni.reLaunch({ url: '/package-ai/pages/login/index' })
}
function onLogout() {
    uni.showModal({
        title: '退出登录？',
        success: r => {
            if (!r.confirm) return
            clearUser()
            user.value = null
            goLogin()
        }
    })
}

onShareAppMessage(() => ({
    title: '',
    path: '/pages/home/index'
}))
</script>

<style lang="scss">
page {
    background-color: #f5f4f0;
}
</style>

<style lang="scss" scoped>
.me {
    padding: 32rpx 32rpx 60rpx;
    color: var(--ink);
    font-family: var(--ff-sans);
    background: var(--bg);
    min-height: 100%;
}
.hero {
    display: flex;
    align-items: center;
    gap: 24rpx;
    padding: 32rpx;
    background: var(--bg-2);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
    margin-bottom: 28rpx;
    .avatar {
        width: 112rpx;
        height: 112rpx;
        border-radius: 32rpx;
        background: var(--c-coral);
        color: #fff;
        font-size: 48rpx;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8rpx 20rpx -6rpx var(--c-coral);
    }
    .info {
        flex: 1;
        min-width: 0;
        .name-row {
            display: flex;
            align-items: center;
            gap: 12rpx;
        }
        .name {
            font-size: 38rpx;
            font-weight: 800;
            letter-spacing: -0.5rpx;
        }
        .tag {
            font-size: 20rpx;
            font-weight: 700;
            padding: 4rpx 12rpx;
            border-radius: 999rpx;
            &.super {
                background: rgba(64, 96, 255, 0.16);
                color: #2540c0;
            }
        }
        .meta {
            font-size: 24rpx;
            color: var(--ink-3);
            margin-top: 8rpx;
        }
    }
}
.card.group {
    background: var(--bg-2);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
    margin-bottom: 24rpx;
    overflow: hidden;
}
.row {
    display: flex;
    align-items: center;
    gap: 18rpx;
    padding: 28rpx 28rpx;
    border-top: 1rpx solid var(--bg-3);
    transition: background 0.18s ease;
    &:first-child {
        border-top: 0;
    }
    &:active {
        background: var(--bg-3);
    }
    .row-icon {
        font-size: 36rpx;
        width: 56rpx;
        text-align: center;
    }
    .row-text {
        flex: 1;
        min-width: 0;
        .t {
            font-size: 28rpx;
            font-weight: 700;
        }
        .s {
            font-size: 22rpx;
            color: var(--ink-3);
            margin-top: 4rpx;
        }
    }
    .arrow {
        color: var(--ink-3);
        font-size: 36rpx;
        font-weight: 300;
    }
}
.logout {
    text-align: center;
    margin-top: 32rpx;
    padding: 28rpx 0;
    background: var(--bg-2);
    border-radius: var(--r-md);
    font-size: 28rpx;
    font-weight: 700;
    color: #c0382c;
    box-shadow: var(--shadow-sm);
    transition: transform 0.18s ease;
    &:active {
        transform: scale(0.97);
    }
    &.primary {
        background: var(--ink);
        color: #fff;
    }
}
</style>
