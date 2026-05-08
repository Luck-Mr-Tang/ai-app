<template>
    <view class="page">
        <top-toast />
        <view class="topbar">
            <view class="greet" @click="onAccountTap">
                <view class="g-line">{{ greetingLine }}</view>
                <view class="g-name">
                    {{ user ? user.username : '请先登录 ›' }}
                    <text v-if="user" class="g-caret">⌄</text>
                </view>
            </view>
            <view class="avatar" @click="onAccountTap">
                {{ user ? user.username.slice(0, 1).toUpperCase() : '+' }}
            </view>
        </view>

        <view
            class="status-pill"
            :class="health.ok ? 'ok' : health.checking ? 'pending' : 'fail'"
            @click="refreshHealth"
        >
            <view class="dot" />
            <text class="s-txt">
                {{
                    health.checking
                        ? '检测服务中…'
                        : health.ok
                          ? `服务已连接 · ${health.latency_ms}ms`
                          : `服务异常 · 点击重试`
                }}
            </text>
        </view>

        <view class="hero" @click="goCharacters">
            <view class="h-bg" />
            <view class="h-glow" />
            <view class="h-row">
                <view class="h-pill">FEATURED</view>
                <view class="h-arrow">→</view>
            </view>
            <view class="h-title">和 AI 笔友<br />聊到忘了时间</view>
            <view class="h-sub">4 位个性 AI · 文字聊天 · 朋友圈互动</view>
            <view class="h-stats">
                <view class="hs">
                    <view class="hs-num">{{ stats.characters || '--' }}</view>
                    <view class="hs-lbl">在线笔友</view>
                </view>
                <view class="hs-divider" />
                <view class="hs">
                    <view class="hs-num">{{ stats.moments || '--' }}</view>
                    <view class="hs-lbl">今日动态</view>
                </view>
                <view class="hs-divider" />
                <view class="hs">
                    <view class="hs-num">∞</view>
                    <view class="hs-lbl">免费畅聊</view>
                </view>
            </view>
        </view>

        <view v-if="quickChars.length" class="sec-title compact">
            <text class="st-zh">快速开聊</text>
            <text class="st-en">/ Pick one</text>
            <text class="st-more" @click="goCharacters">全部 →</text>
        </view>
        <scroll-view
            v-if="quickChars.length"
            class="char-row"
            scroll-x
            :show-scrollbar="false"
        >
            <view
                v-for="(c, i) in quickChars"
                :key="c.id"
                class="qc"
                :style="{ '--accent': accents[i % accents.length] }"
                @click="goChatWith(c)"
            >
                <view class="qc-avatar">{{ c.name.slice(0, 1) }}</view>
                <view class="qc-name">{{ c.name }}</view>
                <view class="qc-tag">{{ c.tagline || '——' }}</view>
            </view>
            <view class="qc add" @click="goCharacters">
                <view class="qc-avatar plus">＋</view>
                <view class="qc-name">查看全部</view>
                <view class="qc-tag">{{ stats.characters }} 位笔友</view>
            </view>
        </scroll-view>

        <view class="sec-title">
            <text class="st-zh">现已上线</text>
            <text class="st-en">/ Available</text>
        </view>
        <view class="grid-2">
            <view
                v-for="m in liveModules"
                :key="m.key"
                class="tile"
                :style="{ background: m.bg, color: m.fg }"
                @click="goModule(m)"
            >
                <view class="t-icon">{{ m.icon }}</view>
                <view class="t-title">{{ m.title }}</view>
                <view class="t-sub" :style="{ color: m.subFg }">{{ m.sub }}</view>
                <view class="t-cta">
                    <text>进入</text>
                    <text class="t-arrow">→</text>
                </view>
            </view>
        </view>

        <view class="sec-title">
            <text class="st-zh">即将上线</text>
            <text class="st-en">/ Coming Soon</text>
        </view>
        <view class="grid-2">
            <view
                v-for="m in upcomingModules"
                :key="m.key"
                class="tile soon"
                @click="onComingSoon(m)"
            >
                <view class="t-icon">{{ m.icon }}</view>
                <view class="t-title">{{ m.title }}</view>
                <view class="t-sub">{{ m.sub }}</view>
                <view class="t-flag" :style="{ background: m.flag }">
                    {{ m.flagText || '即将上线' }}
                </view>
            </view>
        </view>

        <view class="sec-title">
            <text class="st-zh">小工具</text>
            <text class="st-en">/ Tools</text>
        </view>
        <view class="tools">
            <view v-for="t in tools" :key="t.key" class="tool" @click="onTool(t)">
                <view class="tool-icon">{{ t.icon }}</view>
                <view class="tool-name">{{ t.name }}</view>
            </view>
        </view>

        <view class="footer">
            <text class="ft">v0.1 · MVP</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { onShow, onHide } from '@dcloudio/uni-app'
import TopToast from '@/components/top-toast/index.vue'
import {
    checkAIHealth,
    clearUser,
    getCachedUser,
    listCharacters,
    listMoments,
    type AICharacter,
    type AIUser
} from '@/api/ai'

interface ModuleItem {
    key: string
    title: string
    sub: string
    icon: string
    bg?: string
    fg?: string
    subFg?: string
    flag?: string
    flagText?: string
    path?: string
}

const liveModules: ModuleItem[] = [
    {
        key: 'characters',
        title: 'AI 笔友',
        sub: '挑一个搭子聊天',
        icon: '🪄',
        bg: '#FF5C4D',
        fg: '#FFFFFF',
        subFg: 'rgba(255,255,255,0.78)',
        path: '/package-ai/pages/characters/index'
    },
    {
        key: 'moments',
        title: '动态广场',
        sub: '看 AI 今天发了啥',
        icon: '✦',
        bg: '#1A1D29',
        fg: '#FFFFFF',
        subFg: 'rgba(255,255,255,0.65)',
        path: '/package-ai/pages/moments/index'
    }
]

const upcomingModules: ModuleItem[] = [
    {
        key: 'voice',
        title: '私话亭',
        sub: '语音陪伴 / 实时对话',
        icon: '🎙',
        flag: 'var(--c-purple-soft)',
        flagText: '内测中'
    },
    {
        key: 'salon',
        title: 'AI 茶会',
        sub: '群聊主持 / 多人语音',
        icon: '🫖',
        flag: 'var(--c-mint-soft)',
        flagText: '即将上线'
    },
    {
        key: 'postoffice',
        title: '心事邮局',
        sub: '情绪疗愈 / 真人匹配',
        icon: '💌',
        flag: 'var(--c-pink-soft)',
        flagText: '招募内测'
    },
    {
        key: 'pet',
        title: '陪伴养成',
        sub: '虚拟宠物 / 虚拟伴侣',
        icon: '🐾',
        flag: 'var(--c-amber-soft)',
        flagText: '即将上线'
    },
    {
        key: 'companion',
        title: '同行陪玩',
        sub: '游戏陪聊 / 内容共创',
        icon: '🎮',
        flag: 'var(--c-blue-soft)',
        flagText: '即将上线'
    },
    {
        key: 'shop',
        title: '严选商城',
        sub: '好物 / 周边',
        icon: '🛍',
        flag: 'var(--bg-3)',
        flagText: '规划中'
    }
]

const baseTools: { key: string; icon: string; name: string }[] = [
    { key: 'health', icon: '⚙️', name: 'AI 状态' },
    { key: 'docs', icon: '📚', name: '使用说明' },
    { key: 'feedback', icon: '💬', name: '建议反馈' },
    { key: 'about', icon: 'ℹ️', name: '关于' }
]

const user = ref<AIUser | null>(getCachedUser())

const tools = computed(() => {
    const list = [...baseTools]
    if (user.value?.role === 'super') {
        list.unshift({ key: 'admin', icon: '🛡', name: '用户审核' })
    }
    return list
})
const health = reactive({ ok: false, checking: true, latency_ms: 0, reason: '' })
const stats = reactive({ characters: 0, moments: 0 })
const quickChars = ref<AICharacter[]>([])
const accents = ['#FF5C4D', '#4060FF', '#8052FF', '#1ED88A', '#FFB12B', '#FF66B2']

const greetingLine = (() => {
    const h = new Date().getHours()
    if (h < 6) return '夜深了'
    if (h < 11) return '早上好'
    if (h < 14) return '中午好'
    if (h < 18) return '下午好'
    return '晚上好'
})()

async function refreshHealth() {
    health.checking = true
    try {
        const r = await checkAIHealth()
        health.ok = r.ok
        health.latency_ms = r.latency_ms || 0
        health.reason = r.reason || ''
    } catch (e: unknown) {
        health.ok = false
        health.reason = (e as Error)?.message || '请求失败'
    } finally {
        health.checking = false
    }
}

async function loadStats() {
    try {
        const chars = await listCharacters()
        stats.characters = chars.length
        quickChars.value = chars.slice(0, 6)
    } catch {
        /* public, but ignore network errors */
    }
    if (!user.value) return
    try {
        const moms = await listMoments(5)
        stats.moments = moms.length
    } catch {
        /* logged in but moments failed */
    }
}

function goChatWith(c: AICharacter) {
    ensureUser(() => {
        uni.navigateTo({
            url: `/package-ai/pages/chat/index?id=${c.id}&name=${encodeURIComponent(c.name)}`
        })
    })
}

function goLogin() {
    uni.navigateTo({ url: '/package-ai/pages/login/index' })
}

function onLogout() {
    clearUser()
    user.value = null
    quickChars.value = []
    stats.characters = 0
    stats.moments = 0
    startGuestTimer()
    uni.showToast({ title: '已退出', icon: 'none' })
}

function onAccountTap() {
    if (!user.value) {
        goLogin()
        return
    }
    uni.showActionSheet({
        itemList: ['切换账号', '退出登录'],
        success: r => {
            if (r.tapIndex === 0) goLogin()
            else if (r.tapIndex === 1) onLogout()
        }
    })
}

const GUEST_LIMIT_MS = 30_000
let guestTimer: ReturnType<typeof setTimeout> | null = null

function clearGuestTimer() {
    if (guestTimer) {
        clearTimeout(guestTimer)
        guestTimer = null
    }
}

function startGuestTimer() {
    clearGuestTimer()
    if (user.value) return
    guestTimer = setTimeout(() => {
        if (user.value) return
        uni.showModal({
            title: '请登录',
            content: '体验已超过 30 秒，登录后才能继续使用',
            confirmText: '去登录',
            cancelText: '再等等',
            success: r => {
                if (r.confirm) goLogin()
                else startGuestTimer()
            }
        })
    }, GUEST_LIMIT_MS)
}

function ensureUser(action: () => void) {
    if (!user.value) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        goLogin()
        return
    }
    action()
}

function goModule(m: ModuleItem) {
    ensureUser(() => {
        if (m.path) uni.navigateTo({ url: m.path })
    })
}

function goCharacters() {
    ensureUser(() => {
        uni.navigateTo({ url: '/package-ai/pages/characters/index' })
    })
}

function onComingSoon(m: ModuleItem) {
    uni.showToast({ title: `${m.title} · ${m.flagText || '即将上线'}`, icon: 'none' })
}

function onTool(t: { key: string }) {
    if (t.key === 'health') {
        refreshHealth()
        uni.showToast({
            title: health.ok ? `AI 服务正常 · ${health.latency_ms}ms` : '正在检测...',
            icon: 'none'
        })
        return
    }
    if (t.key === 'docs') {
        uni.navigateTo({ url: '/package-ai/pages/usage/index' })
        return
    }
    if (t.key === 'about') {
        uni.navigateTo({ url: '/package-ai/pages/about/index' })
        return
    }
    if (t.key === 'admin') {
        ensureUser(() => {
            uni.navigateTo({ url: '/package-ai/pages/admin/index' })
        })
        return
    }
    if (t.key === 'feedback') {
        uni.showModal({
            title: '建议反馈',
            content: '欢迎把使用中遇到的问题或建议反馈给我们，我们会尽快处理。\n\n反馈渠道：本应用还在 MVP 阶段，可在「关于」页查看联系方式。',
            showCancel: false,
            confirmText: '我知道了'
        })
        return
    }
    uni.showToast({ title: '即将上线', icon: 'none' })
}

onMounted(() => {
    refreshHealth()
    loadStats()
})
onShow(() => {
    user.value = getCachedUser()
    if (user.value) {
        clearGuestTimer()
        loadStats()
    } else {
        startGuestTimer()
    }
})
onHide(clearGuestTimer)
onUnmounted(clearGuestTimer)
</script>

<style lang="scss" scoped>
.page {
    min-height: 100vh;
    background: var(--bg);
    padding: 80rpx 32rpx 120rpx;
    color: var(--ink);
    font-family: var(--ff-sans);
}

.topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28rpx;
    .greet {
        .g-line {
            font-size: 26rpx;
            color: var(--ink-2);
        }
        .g-name {
            display: inline-flex;
            align-items: center;
            gap: 10rpx;
            font-size: 44rpx;
            font-weight: 800;
            margin-top: 6rpx;
            letter-spacing: -1rpx;
            .g-caret {
                font-size: 28rpx;
                color: var(--ink-3);
                font-weight: 600;
                margin-top: 6rpx;
            }
        }
    }
    .avatar {
        width: 84rpx;
        height: 84rpx;
        border-radius: 50%;
        background: var(--ink);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36rpx;
        font-weight: 700;
        box-shadow: var(--shadow-sm);
    }
}

.status-pill {
    display: inline-flex;
    align-items: center;
    gap: 12rpx;
    padding: 14rpx 24rpx;
    background: var(--bg-2);
    border-radius: 999rpx;
    box-shadow: var(--shadow-sm);
    margin-bottom: 36rpx;
    .dot {
        width: 14rpx;
        height: 14rpx;
        border-radius: 50%;
        background: var(--ink-3);
    }
    &.ok .dot {
        background: var(--c-mint);
        box-shadow: 0 0 0 4rpx rgba(30, 216, 138, 0.2);
    }
    &.pending .dot {
        background: var(--c-amber);
    }
    &.fail .dot {
        background: var(--c-coral);
    }
    .s-txt {
        font-size: 24rpx;
        color: var(--ink-2);
        font-feature-settings: "tnum";
    }
}

.hero {
    position: relative;
    padding: 40rpx 36rpx 36rpx;
    background: linear-gradient(135deg, #1a1d29 0%, #2a3055 100%);
    border-radius: var(--r-lg);
    color: #fff;
    overflow: hidden;
    box-shadow: var(--shadow-md);
    margin-bottom: 56rpx;
    transition: transform 0.2s ease;
    &:active {
        transform: scale(0.98);
    }
    .h-bg {
        position: absolute;
        top: -100rpx;
        right: -80rpx;
        width: 320rpx;
        height: 320rpx;
        border-radius: 50%;
        background: radial-gradient(
            circle,
            rgba(255, 92, 77, 0.6) 0%,
            rgba(255, 92, 77, 0) 70%
        );
        filter: blur(20rpx);
    }
    .h-glow {
        position: absolute;
        bottom: -60rpx;
        left: -40rpx;
        width: 240rpx;
        height: 240rpx;
        border-radius: 50%;
        background: radial-gradient(
            circle,
            rgba(64, 96, 255, 0.4) 0%,
            rgba(64, 96, 255, 0) 70%
        );
        filter: blur(20rpx);
    }
    .h-row {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 36rpx;
    }
    .h-pill {
        font-size: 20rpx;
        font-weight: 700;
        letter-spacing: 2rpx;
        padding: 8rpx 16rpx;
        background: rgba(255, 255, 255, 0.12);
        border-radius: 999rpx;
        color: rgba(255, 255, 255, 0.85);
    }
    .h-arrow {
        font-size: 36rpx;
        color: rgba(255, 255, 255, 0.7);
    }
    .h-title {
        position: relative;
        font-size: 56rpx;
        font-weight: 800;
        line-height: 1.25;
        letter-spacing: -1rpx;
    }
    .h-sub {
        position: relative;
        font-size: 26rpx;
        color: rgba(255, 255, 255, 0.7);
        margin-top: 16rpx;
    }
    .h-stats {
        position: relative;
        display: flex;
        align-items: center;
        margin-top: 36rpx;
        padding-top: 28rpx;
        border-top: 1px solid rgba(255, 255, 255, 0.12);
        .hs {
            flex: 1;
            text-align: center;
        }
        .hs-num {
            font-size: 44rpx;
            font-weight: 800;
            font-feature-settings: "tnum";
        }
        .hs-lbl {
            font-size: 22rpx;
            color: rgba(255, 255, 255, 0.6);
            margin-top: 4rpx;
        }
        .hs-divider {
            width: 1px;
            height: 56rpx;
            background: rgba(255, 255, 255, 0.12);
        }
    }
}

.sec-title {
    display: flex;
    align-items: baseline;
    gap: 12rpx;
    margin: 8rpx 0 24rpx;
    &.compact {
        margin-top: 0;
    }
    .st-zh {
        font-size: 32rpx;
        font-weight: 800;
        letter-spacing: -0.5rpx;
    }
    .st-en {
        font-size: 22rpx;
        color: var(--ink-3);
        font-family: var(--ff-mono);
    }
    .st-more {
        margin-left: auto;
        font-size: 24rpx;
        color: var(--c-coral);
        font-weight: 600;
    }
}

.char-row {
    margin-bottom: 48rpx;
    white-space: nowrap;
    .qc {
        --accent: #ff5c4d;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        width: 168rpx;
        margin-right: 16rpx;
        padding: 24rpx 16rpx 20rpx;
        background: var(--bg-2);
        border-radius: var(--r-md);
        box-shadow: var(--shadow-sm);
        transition: transform 0.18s ease;
        &:active { transform: scale(0.95); }
        &.add .qc-avatar.plus {
            background: var(--bg);
            color: var(--ink-3);
            font-weight: 300;
            box-shadow: none;
        }
        .qc-avatar {
            width: 88rpx;
            height: 88rpx;
            border-radius: 28rpx;
            background: var(--accent);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 38rpx;
            font-weight: 800;
            box-shadow: 0 8rpx 20rpx -6rpx var(--accent);
            margin-bottom: 14rpx;
        }
        .qc-name {
            font-size: 26rpx;
            font-weight: 700;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .qc-tag {
            font-size: 20rpx;
            color: var(--ink-3);
            margin-top: 4rpx;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}

.grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20rpx;
    margin-bottom: 56rpx;
}

.tile {
    position: relative;
    padding: 32rpx 28rpx;
    border-radius: var(--r-md);
    background: var(--bg-2);
    color: var(--ink);
    aspect-ratio: 1.05 / 1;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-sm);
    transition: transform 0.18s ease;
    overflow: hidden;
    &:active {
        transform: scale(0.97);
    }
    .t-icon {
        font-size: 56rpx;
        line-height: 1;
        margin-bottom: 18rpx;
    }
    .t-title {
        font-size: 32rpx;
        font-weight: 800;
        letter-spacing: -0.5rpx;
    }
    .t-sub {
        font-size: 22rpx;
        margin-top: 6rpx;
        color: var(--ink-3);
    }
    .t-cta {
        margin-top: auto;
        display: inline-flex;
        align-items: center;
        gap: 8rpx;
        padding: 8rpx 18rpx;
        background: rgba(255, 255, 255, 0.18);
        border-radius: 999rpx;
        font-size: 22rpx;
        font-weight: 700;
        align-self: flex-start;
        .t-arrow {
            font-weight: 400;
        }
    }
    .t-flag {
        margin-top: auto;
        align-self: flex-start;
        font-size: 20rpx;
        font-weight: 700;
        padding: 6rpx 16rpx;
        border-radius: 999rpx;
        background: var(--bg-3);
        color: var(--ink-2);
    }
    &.soon {
        background: var(--bg-2);
        color: var(--ink);
        .t-icon {
            opacity: 0.85;
        }
    }
}

.tools {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16rpx;
    margin-bottom: 60rpx;
}
.tool {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
    padding: 22rpx 0;
    background: var(--bg-2);
    border-radius: var(--r-sm);
    box-shadow: var(--shadow-sm);
    transition: transform 0.18s ease;
    &:active {
        transform: scale(0.95);
    }
    .tool-icon {
        font-size: 36rpx;
    }
    .tool-name {
        font-size: 22rpx;
        color: var(--ink-2);
    }
}

.footer {
    text-align: center;
    .ft {
        font-size: 20rpx;
        color: var(--ink-3);
        font-family: var(--ff-mono);
        letter-spacing: 2rpx;
    }
}
</style>
