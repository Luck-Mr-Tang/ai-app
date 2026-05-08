<template>
    <view class="page">
        <top-toast />
        <view class="hero">
            <view class="h-emoji">👋</view>
            <view class="h-title">欢迎回来</view>
            <view class="h-sub">使用已审核通过的账号登录</view>
        </view>

        <view class="form">
            <view class="field">
                <view class="lbl">用户名</view>
                <view class="ai-input">
                    <input
                        class="ipt"
                        v-model="username"
                        placeholder="请输入用户名"
                        placeholder-class="ipt-ph"
                        confirm-type="next"
                    />
                </view>
            </view>

            <view class="field">
                <view class="lbl">密码</view>
                <view class="ai-input pwd">
                    <input
                        class="ipt"
                        :type="showPwd ? 'text' : 'password'"
                        :password="!showPwd"
                        v-model="password"
                        placeholder="请输入密码"
                        placeholder-class="ipt-ph"
                        confirm-type="done"
                    />
                    <view class="eye" @click="showPwd = !showPwd">
                        {{ showPwd ? '🙈' : '👁' }}
                    </view>
                </view>
            </view>

            <view class="agree" @click="agreed = !agreed">
                <view class="cb" :class="{ on: agreed }">
                    <text v-if="agreed">✓</text>
                </view>
                <view class="agree-txt">
                    我已阅读并同意
                    <text class="link" @click.stop="goTerms">《服务条款》</text>
                    与
                    <text class="link" @click.stop="goPrivacy">《隐私协议》</text>
                </view>
            </view>

            <view
                class="primary-btn"
                :class="{ disabled: !canSubmit }"
                @click="onLogin"
            >
                {{ submitting ? '登录中…' : '登录' }}
            </view>

            <view class="alt">
                还没有账号？
                <text class="link" @click="goRegister">去注册</text>
            </view>
        </view>

        <view class="footer">
            <text class="ft" @click="goAbout">关于 · v0.1 MVP</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { login } from '@/api/ai'
import TopToast from '@/components/top-toast/index.vue'

const username = ref('')
const password = ref('')
const showPwd = ref(false)
const agreed = ref(false)
const submitting = ref(false)

const canSubmit = computed(
    () => !!username.value.trim() && !!password.value && agreed.value && !submitting.value
)

async function onLogin() {
    if (!username.value.trim() || !password.value) {
        uni.showToast({ title: '请输入用户名和密码', icon: 'none' })
        return
    }
    if (!agreed.value) {
        uni.showToast({ title: '请先同意服务条款和隐私协议', icon: 'none' })
        return
    }
    if (submitting.value) return
    submitting.value = true
    try {
        const u = await login(username.value.trim(), password.value)
        uni.showToast({ title: `欢迎，${u.username}`, icon: 'none' })
        setTimeout(() => {
            uni.reLaunch({ url: '/pages/home/index' })
        }, 300)
    } catch (e) {
        console.warn('login failed', e)
    } finally {
        submitting.value = false
    }
}

function goRegister() {
    uni.navigateTo({ url: '/package-ai/pages/register/index' })
}
function goTerms() {
    uni.navigateTo({ url: '/package-ai/pages/terms/index' })
}
function goPrivacy() {
    uni.navigateTo({ url: '/package-ai/pages/privacy/index' })
}
function goAbout() {
    uni.navigateTo({ url: '/package-ai/pages/about/index' })
}
</script>

<style lang="scss">
page {
    background-color: #f5f4f0;
}
</style>

<style lang="scss" scoped>
.page {
    min-height: 100vh;
    background: var(--bg);
    padding: 64rpx 32rpx 32rpx;
    color: var(--ink);
    font-family: var(--ff-sans);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
.hero {
    margin-bottom: 36rpx;
    .h-emoji {
        font-size: 52rpx;
        line-height: 1;
        margin-bottom: 10rpx;
    }
    .h-title {
        font-size: 48rpx;
        font-weight: 800;
        letter-spacing: -1rpx;
        line-height: 1.15;
    }
    .h-sub {
        font-size: 24rpx;
        color: var(--ink-3);
        margin-top: 8rpx;
    }
}
.form {
    flex: 1;
}
.field {
    margin-bottom: 22rpx;
    .lbl {
        font-size: 24rpx;
        color: var(--ink-2);
        margin-bottom: 10rpx;
        font-weight: 600;
    }
}
.ai-input {
    display: flex;
    align-items: center;
    background: var(--bg-2);
    border-radius: var(--r-md);
    padding: 0 24rpx;
    box-shadow: var(--shadow-sm);
    .ipt {
        flex: 1;
        height: 80rpx;
        font-size: 28rpx;
        font-family: var(--ff-sans);
        color: var(--ink);
        background: transparent;
        border: 0;
        padding: 0;
    }
    .ipt-ph {
        color: var(--ink-3);
        font-family: var(--ff-sans);
    }
    &.pwd {
        padding-right: 12rpx;
    }
    .eye {
        width: 64rpx;
        height: 64rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
        color: var(--ink-2);
        flex-shrink: 0;
        opacity: 0.85;
        &:active { opacity: 0.55; }
    }
}
.agree {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin: 22rpx 4rpx 28rpx;
    .cb {
        width: 30rpx;
        height: 30rpx;
        border-radius: 8rpx;
        border: 2rpx solid var(--ink-3);
        background: var(--bg-2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22rpx;
        line-height: 1;
        color: transparent;
        flex-shrink: 0;
        &.on {
            background: var(--ink);
            border-color: var(--ink);
            color: #fff;
        }
    }
    .agree-txt {
        flex: 1;
        font-size: 22rpx;
        color: var(--ink-2);
        line-height: 1.4;
    }
    .link {
        color: var(--c-coral);
        font-weight: 600;
    }
}
.primary-btn {
    text-align: center;
    padding: 24rpx 0;
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
.alt {
    text-align: center;
    margin-top: 22rpx;
    font-size: 24rpx;
    color: var(--ink-2);
    .link {
        color: var(--c-coral);
        font-weight: 700;
        margin-left: 4rpx;
    }
}
.footer {
    text-align: center;
    margin-top: 24rpx;
    .ft {
        font-size: 20rpx;
        color: var(--ink-3);
        font-family: var(--ff-mono);
        letter-spacing: 1rpx;
    }
}
</style>
