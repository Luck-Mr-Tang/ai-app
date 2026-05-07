<template>
    <view class="page">
        <view class="topbar">
            <view class="back" @click="goBack">‹</view>
        </view>

        <view class="hero">
            <view class="h-emoji">👋</view>
            <view class="h-title">选个账号<br />开始聊天</view>
            <view class="h-sub">挑一个老账号继续，或新建一个</view>
        </view>

        <view class="sec">
            <view class="sec-h">
                <text class="sec-t">已有账号</text>
                <text class="sec-cnt">{{ users.length }}</text>
            </view>

            <view v-if="loading" class="loading">读取中…</view>

            <view v-else-if="users.length === 0" class="empty">
                还没有账号 · 在下方新建一个吧
            </view>

            <view v-else class="user-grid">
                <view
                    v-for="(u, i) in users"
                    :key="u.id"
                    class="ucell"
                    :style="{ '--accent': accents[i % accents.length] }"
                    @click="onPick(u)"
                >
                    <view class="ucell-avatar">{{ u.username.slice(0, 1).toUpperCase() }}</view>
                    <view class="ucell-name">{{ u.username }}</view>
                    <view class="ucell-id">#{{ u.id }}</view>
                </view>
            </view>
        </view>

        <view class="sec">
            <view class="sec-h">
                <text class="sec-t">新建账号</text>
            </view>
            <view class="ai-input">
                <wd-input
                    v-model="newName"
                    placeholder="输入一个昵称（2-32 字符）"
                    no-border
                />
            </view>
            <view
                class="primary-btn"
                :class="{ disabled: !newName.trim() || creating }"
                @click="onCreate"
            >
                {{ creating ? '创建中…' : '创建并登录' }}
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { listUsers, login, loginAs, type AIUser } from '@/api/ai'

const users = ref<AIUser[]>([])
const loading = ref(false)
const newName = ref('')
const creating = ref(false)
const accents = ['#FF5C4D', '#4060FF', '#8052FF', '#1ED88A', '#FFB12B', '#FF66B2']

async function load() {
    loading.value = true
    try {
        const list = await listUsers()
        users.value = Array.isArray(list) ? list : []
    } catch (e) {
        console.warn('listUsers failed', e)
        users.value = []
    } finally {
        loading.value = false
    }
}

function onPick(u: AIUser) {
    if (!u || !u.id) {
        uni.showToast({ title: '账号无效', icon: 'none' })
        return
    }
    try {
        loginAs(u)
        uni.showToast({ title: `Hi, ${u.username}`, icon: 'none' })
        setTimeout(() => goBack(), 300)
    } catch (e) {
        console.warn('loginAs failed', e)
        uni.showToast({ title: '登录失败', icon: 'none' })
    }
}

async function onCreate() {
    const name = newName.value.trim()
    if (!name || creating.value) return
    creating.value = true
    try {
        const u = await login(name)
        if (!u || !u.id) {
            uni.showToast({ title: '创建失败', icon: 'none' })
            return
        }
        uni.showToast({ title: `欢迎 ${u.username}`, icon: 'none' })
        setTimeout(() => goBack(), 300)
    } catch (e) {
        console.warn('login failed', e)
    } finally {
        creating.value = false
    }
}

function goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
        uni.navigateBack()
    } else {
        uni.switchTab({
            url: '/pages/home/index',
            fail: () => uni.reLaunch({ url: '/pages/home/index' })
        })
    }
}

onMounted(load)
</script>

<style lang="scss" scoped>
.page {
    min-height: 100vh;
    background: var(--bg);
    padding: 60rpx 32rpx 120rpx;
    color: var(--ink);
    font-family: var(--ff-sans);
}
.topbar {
    margin-bottom: 28rpx;
    .back {
        width: 64rpx;
        height: 64rpx;
        border-radius: 50%;
        background: var(--bg-2);
        font-size: 36rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-sm);
    }
}
.hero {
    margin-bottom: 56rpx;
    .h-emoji {
        font-size: 64rpx;
        margin-bottom: 16rpx;
    }
    .h-title {
        font-size: 60rpx;
        font-weight: 800;
        line-height: 1.15;
        letter-spacing: -2rpx;
    }
    .h-sub {
        font-size: 26rpx;
        color: var(--ink-3);
        margin-top: 14rpx;
    }
}
.sec {
    margin-bottom: 56rpx;
    .sec-h {
        display: flex;
        align-items: baseline;
        gap: 12rpx;
        margin-bottom: 24rpx;
        .sec-t {
            font-size: 30rpx;
            font-weight: 800;
            letter-spacing: -0.5rpx;
        }
        .sec-cnt {
            font-size: 22rpx;
            color: var(--ink-3);
            font-feature-settings: "tnum";
        }
    }
}
.loading,
.empty {
    text-align: center;
    padding: 60rpx 0;
    font-size: 26rpx;
    color: var(--ink-3);
}
.user-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16rpx;
}
.ucell {
    --accent: #ff5c4d;
    padding: 24rpx 16rpx;
    background: var(--bg-2);
    border-radius: var(--r-md);
    text-align: center;
    box-shadow: var(--shadow-sm);
    transition: transform 0.18s ease;
    &:active { transform: scale(0.95); }
    .ucell-avatar {
        width: 88rpx;
        height: 88rpx;
        margin: 0 auto 12rpx;
        border-radius: 28rpx;
        background: var(--accent);
        color: #fff;
        font-size: 40rpx;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8rpx 20rpx -6rpx var(--accent);
    }
    .ucell-name {
        font-size: 26rpx;
        font-weight: 700;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .ucell-id {
        font-size: 20rpx;
        color: var(--ink-3);
        margin-top: 4rpx;
        font-family: var(--ff-mono);
    }
}
.ai-input {
    background: var(--bg-2);
    border-radius: var(--r-md);
    padding: 0 24rpx;
    margin-bottom: 20rpx;
    box-shadow: var(--shadow-sm);
    :deep(.wd-input),
    :deep(.wd-input__inner),
    :deep(.wd-input__bd) {
        background: transparent !important;
        padding: 0 !important;
        border: 0 !important;
    }
    :deep(.wd-input__value),
    :deep(.wd-input__inner input) {
        font-family: var(--ff-sans) !important;
        font-size: 28rpx !important;
        color: var(--ink) !important;
        background: transparent !important;
        padding: 28rpx 0 !important;
    }
    :deep(.wd-input__placeholder),
    :deep(.is-placeholder) {
        color: var(--ink-3) !important;
        font-family: var(--ff-sans) !important;
    }
}
.primary-btn {
    text-align: center;
    padding: 32rpx 0;
    background: var(--ink);
    color: #fff;
    font-size: 30rpx;
    font-weight: 800;
    border-radius: var(--r-md);
    box-shadow: 0 12rpx 24rpx -8rpx var(--ink);
    transition: transform 0.18s ease;
    &:active { transform: scale(0.97); }
    &.disabled {
        background: var(--ink-4);
        box-shadow: none;
    }
}
</style>
