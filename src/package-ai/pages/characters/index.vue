<template>
    <view class="page">
        <view class="topbar">
            <view class="back" @click="goBack">‹</view>
            <view class="title">AI 笔友</view>
            <view class="action" @click="goMoments">动态 →</view>
        </view>

        <view class="hero">
            <view class="h-title">挑一个搭子<br />开始聊吧</view>
            <view
                class="h-status"
                :class="health.ok ? 'ok' : health.checking ? 'pending' : 'fail'"
                @click="refreshHealth"
            >
                <view class="dot" />
                <text class="s-txt">
                    {{
                        health.checking
                            ? '检测中…'
                            : health.ok
                              ? `${health.latency_ms}ms`
                              : '离线'
                    }}
                </text>
            </view>
        </view>

        <view class="char-grid">
            <view
                v-for="(c, i) in characters"
                :key="c.id"
                class="card"
                :style="{ '--accent': accents[i % accents.length] }"
                @click="goChat(c)"
            >
                <view class="card-head">
                    <view class="avatar">{{ c.name.slice(0, 1) }}</view>
                    <view v-if="c.is_builtin" class="badge">官方</view>
                </view>
                <view class="card-name">{{ c.name }}</view>
                <view class="card-tag">{{ c.tagline || '——' }}</view>
                <view class="card-persona">{{ excerpt(c.persona) }}</view>
                <view class="card-cta">
                    <text>开聊</text>
                    <text class="arrow">→</text>
                </view>
            </view>

            <view class="add-card" @click="onAddClick">
                <view class="ad-plus">＋</view>
                <view class="ad-text">创建一个新角色</view>
            </view>
        </view>

        <view v-if="!loading && characters.length === 0" class="empty">
            还没有角色，点上面的卡片创建一个
        </view>

        <view v-if="showCreate" class="modal-mask" @click.self="showCreate = false">
            <view class="modal" @click.stop>
                <view class="m-handle" />
                <view class="m-title">创建一个 AI 角色</view>
                <view class="m-sub">写好人设，AI 会按这个性格回复你</view>

                <view class="field">
                    <text class="lbl">名字</text>
                    <view class="ai-input">
                        <wd-input v-model="form.name" placeholder="如：阿喵" no-border />
                    </view>
                </view>
                <view class="field">
                    <text class="lbl">一句话简介</text>
                    <view class="ai-input">
                        <wd-input v-model="form.tagline" placeholder="可不填" no-border />
                    </view>
                </view>
                <view class="field">
                    <text class="lbl">人设描述</text>
                    <view class="ai-area">
                        <wd-textarea
                            v-model="form.persona"
                            placeholder="性格、说话风格、背景，越具体越好"
                            :auto-height="false"
                            :show-word-limit="false"
                            no-border
                        />
                    </view>
                </view>

                <view class="m-btns">
                    <view class="m-btn ghost" @click="showCreate = false">取消</view>
                    <view class="m-btn primary" @click="onCreate">创建</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import {
    listCharacters,
    createCharacter,
    getCachedUser,
    checkAIHealth,
    type AICharacter,
    type AIUser
} from '@/api/ai'
import { onShow } from '@dcloudio/uni-app'

const characters = ref<AICharacter[]>([])
const loading = ref(false)
const user = ref<AIUser | null>(getCachedUser())
const showCreate = ref(false)
const form = ref({ name: '', tagline: '', persona: '', avatar: '' })

const accents = ['#FF5C4D', '#4060FF', '#8052FF', '#1ED88A', '#FFB12B', '#FF66B2']

const health = reactive<{ ok: boolean; checking: boolean; latency_ms: number; reason: string }>({
    ok: false,
    checking: true,
    latency_ms: 0,
    reason: ''
})

function excerpt(s: string) {
    if (!s) return '——'
    return s.length > 36 ? s.slice(0, 36) + '…' : s
}

async function load() {
    loading.value = true
    try {
        characters.value = await listCharacters()
    } finally {
        loading.value = false
    }
}

async function refreshHealth() {
    health.checking = true
    try {
        const r = await checkAIHealth()
        health.ok = r.ok
        health.latency_ms = r.latency_ms || 0
        health.reason = r.reason || (r.ok ? '' : r.sample || '')
    } catch (e: unknown) {
        health.ok = false
        health.reason = (e as Error)?.message || '失败'
    } finally {
        health.checking = false
    }
}

function goLogin() {
    uni.navigateTo({ url: '/package-ai/pages/login/index' })
}

function ensureUser(action: () => void) {
    if (!user.value) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        goLogin()
        return
    }
    action()
}

function goChat(c: AICharacter) {
    ensureUser(() => {
        uni.navigateTo({
            url: `/package-ai/pages/chat/index?id=${c.id}&name=${encodeURIComponent(c.name)}`
        })
    })
}

function goMoments() {
    ensureUser(() => uni.navigateTo({ url: '/package-ai/pages/moments/index' }))
}

function onAddClick() {
    ensureUser(() => (showCreate.value = true))
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

async function onCreate() {
    if (!user.value) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
    }
    if (!form.value.name || !form.value.persona) {
        uni.showToast({ title: '名字和人设必填', icon: 'none' })
        return
    }
    await createCharacter(form.value)
    showCreate.value = false
    form.value = { name: '', tagline: '', persona: '', avatar: '' }
    await load()
}

onMounted(() => {
    load()
    refreshHealth()
})
onShow(() => {
    user.value = getCachedUser()
})
</script>

<style lang="scss" scoped>
.page {
    min-height: 100vh;
    background: var(--bg);
    padding: 64rpx 32rpx 120rpx;
    color: var(--ink);
    font-family: var(--ff-sans);
}

.topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32rpx;
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
    .title {
        font-size: 32rpx;
        font-weight: 700;
    }
    .action {
        font-size: 26rpx;
        color: var(--c-coral);
        font-weight: 600;
    }
}

.hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 36rpx;
    .h-title {
        font-size: 60rpx;
        font-weight: 800;
        line-height: 1.2;
        letter-spacing: -2rpx;
    }
    .h-status {
        display: flex;
        align-items: center;
        gap: 8rpx;
        padding: 10rpx 18rpx;
        border-radius: 999rpx;
        background: var(--bg-2);
        box-shadow: var(--shadow-sm);
        .dot {
            width: 12rpx;
            height: 12rpx;
            border-radius: 50%;
            background: var(--ink-3);
        }
        &.ok .dot {
            background: var(--c-mint);
            box-shadow: 0 0 0 3rpx rgba(30, 216, 138, 0.2);
        }
        &.pending .dot { background: var(--c-amber); }
        &.fail .dot { background: var(--c-coral); }
        .s-txt {
            font-size: 22rpx;
            color: var(--ink-2);
            font-feature-settings: "tnum";
        }
    }
}

.char-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20rpx;
}

.card {
    --accent: #ff5c4d;
    position: relative;
    padding: 28rpx 28rpx 24rpx;
    background: var(--bg-2);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    transition: transform 0.18s ease;
    overflow: hidden;
    &::before {
        content: '';
        position: absolute;
        top: -40rpx;
        right: -40rpx;
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        background: var(--accent);
        opacity: 0.15;
        filter: blur(10rpx);
    }
    &:active {
        transform: scale(0.97);
    }
    .card-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 18rpx;
        .avatar {
            width: 80rpx;
            height: 80rpx;
            border-radius: 24rpx;
            background: var(--accent);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 38rpx;
            font-weight: 800;
            box-shadow: 0 8rpx 20rpx -6rpx var(--accent);
        }
        .badge {
            position: relative;
            font-size: 18rpx;
            padding: 4rpx 12rpx;
            background: var(--bg-3);
            color: var(--ink-2);
            border-radius: 999rpx;
            font-weight: 600;
        }
    }
    .card-name {
        font-size: 36rpx;
        font-weight: 800;
        letter-spacing: -1rpx;
    }
    .card-tag {
        font-size: 22rpx;
        color: var(--ink-2);
        margin-top: 4rpx;
    }
    .card-persona {
        font-size: 22rpx;
        color: var(--ink-3);
        line-height: 1.55;
        margin-top: 14rpx;
        min-height: 70rpx;
    }
    .card-cta {
        display: inline-flex;
        align-items: center;
        gap: 6rpx;
        margin-top: 18rpx;
        padding: 10rpx 18rpx;
        background: var(--accent);
        color: #fff;
        font-size: 22rpx;
        font-weight: 700;
        border-radius: 999rpx;
        align-self: flex-start;
        box-shadow: 0 6rpx 14rpx -4rpx var(--accent);
        .arrow {
            font-weight: 400;
        }
    }
}

.add-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    padding: 40rpx;
    background: var(--bg-2);
    border-radius: var(--r-md);
    border: 2rpx dashed var(--line-2);
    aspect-ratio: 1 / 1.05;
    transition: transform 0.18s ease;
    &:active {
        transform: scale(0.97);
        border-color: var(--c-coral);
    }
    .ad-plus {
        font-size: 64rpx;
        color: var(--ink-3);
        font-weight: 300;
        line-height: 1;
    }
    .ad-text {
        font-size: 24rpx;
        color: var(--ink-2);
        font-weight: 600;
    }
}

.empty {
    text-align: center;
    padding: 80rpx 0;
    font-size: 26rpx;
    color: var(--ink-3);
}

.modal-mask {
    position: fixed;
    inset: 0;
    background: rgba(15, 15, 18, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 100;
}
.modal {
    width: 100%;
    background: var(--bg-2);
    border-radius: var(--r-lg) var(--r-lg) 0 0;
    padding: 24rpx 32rpx 56rpx;
    box-shadow: 0 -16rpx 48rpx rgba(15, 15, 18, 0.18);
    .m-handle {
        width: 64rpx;
        height: 6rpx;
        background: var(--ink-4);
        border-radius: 3rpx;
        margin: 0 auto 32rpx;
    }
    .m-title {
        font-size: 40rpx;
        font-weight: 800;
        letter-spacing: -1rpx;
    }
    .m-sub {
        font-size: 24rpx;
        color: var(--ink-3);
        margin-top: 8rpx;
        margin-bottom: 32rpx;
    }
    .field {
        margin-bottom: 24rpx;
        .lbl {
            display: block;
            font-size: 24rpx;
            color: var(--ink-2);
            font-weight: 600;
            margin-bottom: 12rpx;
        }
    }
    .ai-input {
        background: var(--bg);
        border-radius: var(--r-sm);
        padding: 0 20rpx;
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
            padding: 22rpx 0 !important;
        }
        :deep(.wd-input__placeholder),
        :deep(.is-placeholder) {
            color: var(--ink-3) !important;
            font-family: var(--ff-sans) !important;
        }
    }
    .ai-area {
        background: var(--bg);
        border-radius: var(--r-sm);
        padding: 4rpx 20rpx;
        :deep(.wd-textarea),
        :deep(.wd-textarea__inner) {
            background: transparent !important;
            padding: 0 !important;
            border: 0 !important;
        }
        :deep(.wd-textarea__value),
        :deep(textarea) {
            font-family: var(--ff-sans) !important;
            font-size: 28rpx !important;
            color: var(--ink) !important;
            line-height: 1.6 !important;
            background: transparent !important;
            padding: 18rpx 0 !important;
            min-height: 200rpx !important;
        }
        :deep(.wd-textarea__placeholder),
        :deep(.is-placeholder) {
            color: var(--ink-3) !important;
            font-family: var(--ff-sans) !important;
        }
    }
    .m-btns {
        display: flex;
        gap: 16rpx;
        margin-top: 32rpx;
        .m-btn {
            flex: 1;
            text-align: center;
            padding: 28rpx 0;
            border-radius: var(--r-md);
            font-size: 30rpx;
            font-weight: 700;
            &.ghost {
                background: var(--bg);
                color: var(--ink-2);
            }
            &.primary {
                background: var(--ink);
                color: #fff;
                box-shadow: 0 8rpx 20rpx -6rpx var(--ink);
            }
        }
    }
}
</style>
