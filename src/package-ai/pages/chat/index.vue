<template>
    <view class="page">
        <view class="topbar">
            <view class="back" @click="goBack">‹</view>
            <view class="who">
                <view class="w-name">{{ characterName }}</view>
                <view class="w-status">
                    <view class="ws-dot" />
                    在线
                </view>
            </view>
            <view class="more">⋯</view>
        </view>

        <scroll-view
            class="scroll"
            scroll-y
            :scroll-top="scrollTop"
            :scroll-with-animation="true"
        >
            <view class="thread">
                <view v-if="messages.length === 0 && !sending" class="welcome">
                    <view class="w-emoji">👋</view>
                    <view class="w-title">和 {{ characterName }} 打个招呼吧</view>
                    <view class="w-sub">说什么都行，TA 会按自己的人设回你</view>
                </view>

                <view
                    v-for="m in messages"
                    :key="m.id"
                    class="msg"
                    :class="m.role"
                >
                    <view v-if="m.role === 'assistant'" class="m-avatar">
                        {{ characterName.slice(0, 1) }}
                    </view>
                    <view class="bubble">
                        <text>{{ m.content }}</text>
                    </view>
                </view>

                <view v-if="sending" class="msg assistant">
                    <view class="m-avatar">{{ characterName.slice(0, 1) }}</view>
                    <view class="bubble typing">
                        <view class="td" />
                        <view class="td" />
                        <view class="td" />
                    </view>
                </view>
            </view>
        </scroll-view>

        <view class="composer">
            <view class="comp-input">
                <wd-input v-model="input" placeholder="说点什么..." no-border />
            </view>
            <view
                class="send"
                :class="{ disabled: !canSend }"
                @click="onSend"
            >
                ↑
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { chatHistory, sendChat, type ChatMessage } from '@/api/ai'

const characterId = ref(0)
const characterName = ref('AI')
const messages = ref<ChatMessage[]>([])
const input = ref('')
const sending = ref(false)
const scrollTop = ref(0)

const canSend = computed(() => !!input.value.trim() && !sending.value)

onLoad((q: Record<string, string>) => {
    characterId.value = Number(q.id)
    characterName.value = decodeURIComponent(q.name || 'AI')
    if (characterId.value) loadHistory()
})

async function loadHistory() {
    messages.value = await chatHistory(characterId.value)
    scrollToBottom()
}

async function onSend() {
    if (!canSend.value) return
    const content = input.value.trim()
    input.value = ''
    sending.value = true
    try {
        const created = await sendChat(characterId.value, content)
        messages.value.push(...created)
        scrollToBottom()
    } finally {
        sending.value = false
    }
}

function scrollToBottom() {
    nextTick(() => {
        scrollTop.value = 999999 + Math.random()
    })
}

function goBack() {
    uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--bg);
    color: var(--ink);
    font-family: var(--ff-sans);
}

.topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 60rpx 32rpx 20rpx;
    background: var(--bg-2);
    box-shadow: 0 1px 0 var(--line);
    .back {
        width: 64rpx;
        height: 64rpx;
        border-radius: 50%;
        background: var(--bg);
        font-size: 36rpx;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .who {
        text-align: center;
        .w-name {
            font-size: 30rpx;
            font-weight: 800;
            letter-spacing: -0.5rpx;
        }
        .w-status {
            display: inline-flex;
            align-items: center;
            gap: 6rpx;
            font-size: 20rpx;
            color: var(--ink-3);
            margin-top: 4rpx;
            .ws-dot {
                width: 10rpx;
                height: 10rpx;
                border-radius: 50%;
                background: var(--c-mint);
            }
        }
    }
    .more {
        width: 64rpx;
        height: 64rpx;
        border-radius: 50%;
        background: var(--bg);
        font-size: 36rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--ink-2);
    }
}

.scroll {
    flex: 1;
}
.thread {
    padding: 32rpx 32rpx 16rpx;
}

.welcome {
    text-align: center;
    padding: 80rpx 32rpx;
    .w-emoji {
        font-size: 80rpx;
        margin-bottom: 16rpx;
    }
    .w-title {
        font-size: 32rpx;
        font-weight: 700;
    }
    .w-sub {
        font-size: 24rpx;
        color: var(--ink-3);
        margin-top: 8rpx;
    }
}

.msg {
    display: flex;
    align-items: flex-end;
    gap: 12rpx;
    margin-bottom: 24rpx;
    &.user {
        flex-direction: row-reverse;
        .bubble {
            background: var(--ink);
            color: #fff;
            border-radius: 28rpx 28rpx 8rpx 28rpx;
        }
    }
    &.assistant {
        .bubble {
            background: var(--bg-2);
            color: var(--ink);
            border-radius: 28rpx 28rpx 28rpx 8rpx;
            box-shadow: var(--shadow-sm);
        }
    }
    .m-avatar {
        width: 60rpx;
        height: 60rpx;
        border-radius: 18rpx;
        background: var(--c-coral);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        font-weight: 800;
        flex-shrink: 0;
        box-shadow: 0 6rpx 14rpx -4rpx var(--c-coral);
    }
    .bubble {
        max-width: 76%;
        padding: 18rpx 24rpx;
        font-size: 28rpx;
        line-height: 1.55;
        word-break: break-word;
    }
    .typing {
        display: flex;
        align-items: center;
        gap: 8rpx;
        padding: 22rpx 24rpx;
        .td {
            width: 12rpx;
            height: 12rpx;
            border-radius: 50%;
            background: var(--ink-3);
            animation: bounce 1.2s infinite ease-in-out;
            &:nth-child(2) { animation-delay: 0.15s; }
            &:nth-child(3) { animation-delay: 0.3s; }
        }
    }
}

@keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-8rpx); opacity: 1; }
}

.composer {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 16rpx 32rpx 36rpx;
    background: var(--bg-2);
    box-shadow: 0 -1px 0 var(--line);
    .comp-input {
        flex: 1;
        background: var(--bg);
        border-radius: 999rpx;
        padding: 0 24rpx;
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
    .send {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        background: var(--c-coral);
        color: #fff;
        font-size: 40rpx;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8rpx 20rpx -6rpx var(--c-coral);
        transition: transform 0.18s ease;
        &:active { transform: scale(0.92); }
        &.disabled {
            background: var(--ink-4);
            box-shadow: none;
        }
    }
}
</style>
