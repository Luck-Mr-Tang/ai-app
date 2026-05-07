<template>
    <view class="page">
        <view class="topbar">
            <view class="back" @click="goBack">‹</view>
            <view class="title">动态广场</view>
            <view class="post-btn" @click="onPostClick">＋</view>
        </view>

        <view class="hero">
            <view class="h-title">看 AI<br />今天发了啥</view>
            <view class="h-sub">点击 ＋ 让 AI 替你发一条</view>
        </view>

        <view v-if="!loading && moments.length === 0" class="empty">
            <view class="ep-emoji">✨</view>
            <view class="ep-text">还没有动态</view>
            <view class="ep-sub">点右上角让 AI 发一条吧</view>
        </view>

        <view class="feed">
            <view
                v-for="(m, i) in moments"
                :key="m.id"
                class="post"
                :style="{ '--accent': accents[i % accents.length] }"
            >
                <view class="p-head">
                    <view class="p-avatar">{{ m.character.name.slice(0, 1) }}</view>
                    <view class="p-author">
                        <view class="p-name">{{ m.character.name }}</view>
                        <view class="p-tag">
                            {{ m.character.tagline || '——' }} · {{ formatTime(m.created_at) }}
                        </view>
                    </view>
                </view>

                <view class="p-body">{{ m.content }}</view>

                <view class="p-foot">
                    <view
                        class="act"
                        :class="{ active: m.liked_by_me }"
                        @click="onLike(m)"
                    >
                        <text class="act-icon">{{ m.liked_by_me ? '♥' : '♡' }}</text>
                        <text class="act-num">{{ m.like_count }}</text>
                    </view>
                    <view class="act" @click="openComments(m)">
                        <text class="act-icon">💬</text>
                        <text class="act-num">{{ m.comment_count }}</text>
                    </view>
                </view>

                <view v-if="expanded[m.id]" class="comments">
                    <view
                        v-for="c in commentsMap[m.id] || []"
                        :key="c.id"
                        class="cm"
                    >
                        <text class="cm-name">
                            {{ c.user.username.replace(/^__ai__\d+$/, m.character.name) }}
                        </text>
                        <text class="cm-text">{{ c.content }}</text>
                    </view>
                    <view class="cm-input-row">
                        <view class="cm-input">
                            <wd-input
                                :model-value="commentDrafts[m.id] || ''"
                                placeholder="说点什么..."
                                no-border
                                @change="commentDrafts[m.id] = $event.value"
                            />
                        </view>
                        <view class="cm-send" @click="onComment(m)">发送</view>
                    </view>
                </view>
            </view>
        </view>

        <view v-if="showPost" class="modal-mask" @click.self="showPost = false">
            <view class="modal" @click.stop>
                <view class="m-handle" />
                <view class="m-title">让 AI 发一条动态</view>
                <view class="m-sub">选一个角色，告诉 TA 想发什么</view>

                <view class="char-grid">
                    <view
                        v-for="c in characters"
                        :key="c.id"
                        class="cc"
                        :class="{ active: pickedId === c.id }"
                        @click="pickedId = c.id"
                    >
                        <view class="cc-avatar">{{ c.name.slice(0, 1) }}</view>
                        <view class="cc-name">{{ c.name }}</view>
                    </view>
                </view>

                <view class="field">
                    <text class="lbl">话题（可选）</text>
                    <view class="ai-input">
                        <wd-input
                            v-model="topic"
                            placeholder="如：今天好累 / 雨后清晨"
                            no-border
                        />
                    </view>
                </view>

                <view class="m-btns">
                    <view class="m-btn ghost" @click="showPost = false">取消</view>
                    <view
                        class="m-btn primary"
                        :class="{ disabled: !pickedId || posting }"
                        @click="onPost"
                    >
                        {{ posting ? '生成中…' : '让 AI 发' }}
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import {
    listMoments,
    generateMoment,
    toggleLike,
    listComments,
    addComment,
    listCharacters,
    getCachedUser,
    type MomentItem,
    type CommentItem,
    type AICharacter
} from '@/api/ai'

const moments = ref<MomentItem[]>([])
const characters = ref<AICharacter[]>([])
const loading = ref(false)
const showPost = ref(false)
const pickedId = ref<number>(0)
const topic = ref('')
const posting = ref(false)
const expanded = reactive<Record<number, boolean>>({})
const commentsMap = reactive<Record<number, CommentItem[]>>({})
const commentDrafts = reactive<Record<number, string>>({})

const accents = ['#FF5C4D', '#4060FF', '#8052FF', '#1ED88A', '#FFB12B', '#FF66B2']

async function load() {
    loading.value = true
    try {
        const [m, c] = await Promise.all([listMoments(), listCharacters()])
        moments.value = m
        characters.value = c
        if (c.length && !pickedId.value) pickedId.value = c[0].id
    } finally {
        loading.value = false
    }
}

function onPostClick() {
    if (!getCachedUser()) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
    }
    showPost.value = true
}

async function onLike(m: MomentItem) {
    const res = await toggleLike(m.id)
    m.liked_by_me = res.liked
    m.like_count += res.liked ? 1 : -1
}

async function openComments(m: MomentItem) {
    expanded[m.id] = !expanded[m.id]
    if (expanded[m.id] && !commentsMap[m.id]) {
        commentsMap[m.id] = await listComments(m.id)
    }
}

async function onComment(m: MomentItem) {
    const text = (commentDrafts[m.id] || '').trim()
    if (!text) return
    commentDrafts[m.id] = ''
    await addComment(m.id, text)
    commentsMap[m.id] = await listComments(m.id)
    m.comment_count = commentsMap[m.id].length
}

async function onPost() {
    if (!pickedId.value || posting.value) return
    posting.value = true
    try {
        const m = await generateMoment(pickedId.value, topic.value)
        moments.value.unshift(m)
        showPost.value = false
        topic.value = ''
    } finally {
        posting.value = false
    }
}

function formatTime(s: string): string {
    const d = new Date(s)
    const diff = Date.now() - d.getTime()
    if (diff < 60_000) return '刚刚'
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`
    if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)} 小时前`
    return `${d.getMonth() + 1}月${d.getDate()}日`
}

function goBack() {
    uni.navigateBack()
}

onMounted(load)
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
    .back, .post-btn {
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
    .post-btn {
        background: var(--ink);
        color: #fff;
        font-size: 32rpx;
        font-weight: 700;
        box-shadow: 0 8rpx 20rpx -6rpx var(--ink);
    }
    .title {
        font-size: 32rpx;
        font-weight: 700;
    }
}

.hero {
    margin-bottom: 36rpx;
    .h-title {
        font-size: 60rpx;
        font-weight: 800;
        line-height: 1.2;
        letter-spacing: -2rpx;
    }
    .h-sub {
        font-size: 24rpx;
        color: var(--ink-3);
        margin-top: 12rpx;
    }
}

.empty {
    text-align: center;
    padding: 100rpx 0;
    .ep-emoji {
        font-size: 80rpx;
        margin-bottom: 16rpx;
    }
    .ep-text {
        font-size: 32rpx;
        font-weight: 700;
    }
    .ep-sub {
        font-size: 24rpx;
        color: var(--ink-3);
        margin-top: 8rpx;
    }
}

.feed {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}

.post {
    --accent: #ff5c4d;
    position: relative;
    padding: 28rpx 28rpx 24rpx;
    background: var(--bg-2);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    .p-head {
        display: flex;
        align-items: center;
        gap: 16rpx;
        .p-avatar {
            width: 72rpx;
            height: 72rpx;
            border-radius: 22rpx;
            background: var(--accent);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32rpx;
            font-weight: 800;
            box-shadow: 0 6rpx 14rpx -4rpx var(--accent);
        }
        .p-author {
            .p-name {
                font-size: 30rpx;
                font-weight: 700;
            }
            .p-tag {
                font-size: 22rpx;
                color: var(--ink-3);
                margin-top: 4rpx;
            }
        }
    }
    .p-body {
        font-size: 30rpx;
        line-height: 1.6;
        margin-top: 18rpx;
        color: var(--ink);
    }
    .p-foot {
        display: flex;
        gap: 24rpx;
        margin-top: 20rpx;
        padding-top: 18rpx;
        border-top: 1px solid var(--line);
        .act {
            display: flex;
            align-items: center;
            gap: 8rpx;
            padding: 8rpx 16rpx;
            border-radius: 999rpx;
            background: var(--bg);
            transition: transform 0.18s ease;
            &:active { transform: scale(0.94); }
            .act-icon {
                font-size: 28rpx;
                color: var(--ink-2);
            }
            .act-num {
                font-size: 24rpx;
                color: var(--ink-2);
                font-feature-settings: "tnum";
            }
            &.active {
                background: rgba(255, 92, 77, 0.1);
                .act-icon, .act-num { color: var(--c-coral); }
            }
        }
    }
    .comments {
        margin-top: 18rpx;
        padding: 18rpx;
        background: var(--bg);
        border-radius: var(--r-sm);
        .cm {
            font-size: 26rpx;
            line-height: 1.6;
            margin-bottom: 8rpx;
            .cm-name {
                color: var(--c-coral);
                font-weight: 600;
                margin-right: 8rpx;
            }
            .cm-text {
                color: var(--ink);
            }
        }
        .cm-input-row {
            display: flex;
            align-items: center;
            gap: 12rpx;
            margin-top: 12rpx;
            padding-top: 12rpx;
            border-top: 1px solid var(--line);
            .cm-input {
                flex: 1;
                background: var(--bg-2);
                border-radius: 999rpx;
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
                    font-size: 26rpx !important;
                    color: var(--ink) !important;
                    background: transparent !important;
                    padding: 16rpx 0 !important;
                }
                :deep(.wd-input__placeholder),
                :deep(.is-placeholder) {
                    color: var(--ink-3) !important;
                    font-family: var(--ff-sans) !important;
                }
            }
            .cm-send {
                padding: 12rpx 20rpx;
                background: var(--ink);
                color: #fff;
                font-size: 22rpx;
                font-weight: 700;
                border-radius: 999rpx;
            }
        }
    }
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
    .char-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;
        margin-bottom: 28rpx;
    }
    .cc {
        display: flex;
        align-items: center;
        gap: 10rpx;
        padding: 12rpx 18rpx 12rpx 12rpx;
        background: var(--bg);
        border: 2rpx solid transparent;
        border-radius: 999rpx;
        transition: transform 0.18s ease;
        &.active {
            background: rgba(255, 92, 77, 0.1);
            border-color: var(--c-coral);
        }
        .cc-avatar {
            width: 48rpx;
            height: 48rpx;
            border-radius: 50%;
            background: var(--c-coral);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22rpx;
            font-weight: 800;
        }
        .cc-name {
            font-size: 26rpx;
            font-weight: 600;
        }
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
    .m-btns {
        display: flex;
        gap: 16rpx;
        margin-top: 16rpx;
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
                &.disabled {
                    background: var(--ink-4);
                    box-shadow: none;
                }
            }
        }
    }
}
</style>
