<template>
    <view class="page">
        <top-toast />
        <view class="topbar">
            <view class="back" @click="goBack">‹</view>
        </view>

        <view class="hero">
            <view class="h-emoji">📝</view>
            <view class="h-title">创建账号</view>
            <view class="h-sub">提交注册后由超管审核，通过后即可登录使用</view>
        </view>

        <view class="form">
            <view class="field">
                <view class="lbl">用户名</view>
                <view class="ai-input">
                    <input
                        class="ipt"
                        v-model="username"
                        placeholder="2-32 个字符"
                        placeholder-class="ipt-ph"
                    />
                </view>
            </view>

            <view class="field">
                <view class="lbl">手机号</view>
                <view class="ai-input">
                    <input
                        class="ipt"
                        v-model="phone"
                        type="number"
                        maxlength="11"
                        placeholder="请输入 11 位手机号"
                        placeholder-class="ipt-ph"
                    />
                </view>
                <view class="hint" :class="{ err: phoneInvalid }">
                    {{
                        phoneInvalid
                            ? '手机号格式不正确，需以 1 开头的 11 位数字'
                            : '中国大陆手机号，11 位数字'
                    }}
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
                        maxlength="64"
                        placeholder="至少 6 位"
                        placeholder-class="ipt-ph"
                    />
                    <view class="eye" @click="showPwd = !showPwd">
                        {{ showPwd ? '🙈' : '👁' }}
                    </view>
                </view>
                <view class="strength">
                    <view class="bars">
                        <view
                            v-for="i in 4"
                            :key="i"
                            class="bar"
                            :class="[
                                pwdScore >= i ? 'on' : '',
                                pwdScore >= i ? 'lv' + pwdScore : ''
                            ]"
                        />
                    </view>
                    <text class="lbl-s" :class="'lv' + pwdScore">
                        {{ pwdLabel }}
                    </text>
                </view>
                <view class="hint">建议 8 位以上，字母 + 数字 + 符号组合更安全</view>
            </view>

            <view class="field">
                <view class="lbl">确认密码</view>
                <view class="ai-input pwd">
                    <input
                        class="ipt"
                        :type="showPwd2 ? 'text' : 'password'"
                        :password="!showPwd2"
                        v-model="password2"
                        placeholder="再输入一次"
                        placeholder-class="ipt-ph"
                    />
                    <view class="eye" @click="showPwd2 = !showPwd2">
                        {{ showPwd2 ? '🙈' : '👁' }}
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
                @click="onSubmit"
            >
                {{ submitting ? '提交中…' : '提交注册' }}
            </view>

            <view class="alt">
                已有账号？
                <text class="link" @click="goLogin">去登录</text>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { register } from '@/api/ai'
import TopToast from '@/components/top-toast/index.vue'

const username = ref('')
const phone = ref('')
const password = ref('')
const password2 = ref('')
const showPwd = ref(false)
const showPwd2 = ref(false)
const agreed = ref(false)
const submitting = ref(false)

const PHONE_RE = /^1[3-9]\d{9}$/

const phoneInvalid = computed(() => {
    const v = phone.value.trim()
    return v.length > 0 && !PHONE_RE.test(v)
})

const pwdScore = computed(() => {
    const p = password.value
    if (!p) return 0
    let s = 0
    if (p.length >= 6) s++
    if (p.length >= 10) s++
    if (/[A-Za-z]/.test(p) && /\d/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return Math.min(4, s)
})

const pwdLabel = computed(() => {
    if (!password.value) return '请输入'
    return ['太弱', '弱', '中', '强', '极强'][pwdScore.value] || '弱'
})

const canSubmit = computed(() => {
    return (
        username.value.trim().length >= 2 &&
        PHONE_RE.test(phone.value.trim()) &&
        password.value.length >= 6 &&
        password.value === password2.value &&
        agreed.value &&
        !submitting.value
    )
})

async function onSubmit() {
    const u = username.value.trim()
    const p = phone.value.trim()
    if (u.length < 2 || u.length > 32) {
        uni.showToast({ title: '用户名 2-32 个字符', icon: 'none' })
        return
    }
    if (!PHONE_RE.test(p)) {
        uni.showToast({ title: '手机号格式有误，需 11 位且以 1 开头', icon: 'none' })
        return
    }
    if (password.value.length < 6) {
        uni.showToast({ title: '密码至少 6 位', icon: 'none' })
        return
    }
    if (password.value !== password2.value) {
        uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
        return
    }
    if (!agreed.value) {
        uni.showToast({ title: '请先同意服务条款和隐私协议', icon: 'none' })
        return
    }
    submitting.value = true
    try {
        await register(u, p, password.value)
        uni.showModal({
            title: '注册成功',
            content: '账号已提交，等待超管审核。审核通过后即可登录。',
            showCancel: false,
            confirmText: '去登录',
            success: () => goLogin()
        })
    } catch (e) {
        console.warn('register failed', e)
    } finally {
        submitting.value = false
    }
}

function goLogin() {
    uni.redirectTo({ url: '/package-ai/pages/login/index' })
}
function goTerms() {
    uni.navigateTo({ url: '/package-ai/pages/terms/index' })
}
function goPrivacy() {
    uni.navigateTo({ url: '/package-ai/pages/privacy/index' })
}
function goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) uni.navigateBack()
    else goLogin()
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
    padding: 32rpx 32rpx 32rpx;
    color: var(--ink);
    font-family: var(--ff-sans);
    box-sizing: border-box;
}
.topbar {
    margin-bottom: 12rpx;
    .back {
        width: 56rpx;
        height: 56rpx;
        border-radius: 50%;
        background: var(--bg-2);
        font-size: 32rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-sm);
    }
}
.hero {
    margin-bottom: 22rpx;
    .h-emoji {
        font-size: 40rpx;
        line-height: 1;
        margin-bottom: 6rpx;
    }
    .h-title {
        font-size: 40rpx;
        font-weight: 800;
        letter-spacing: -1rpx;
        line-height: 1.15;
    }
    .h-sub {
        font-size: 22rpx;
        color: var(--ink-3);
        margin-top: 6rpx;
    }
}
.field {
    margin-bottom: 14rpx;
    .lbl {
        font-size: 22rpx;
        color: var(--ink-2);
        margin-bottom: 8rpx;
        font-weight: 600;
    }
    .hint {
        margin-top: 8rpx;
        font-size: 20rpx;
        color: var(--ink-3);
        line-height: 1.3;
        &.err {
            color: #c0382c;
        }
    }
    .strength {
        display: flex;
        align-items: center;
        gap: 12rpx;
        margin-top: 10rpx;
        .bars {
            flex: 1;
            display: flex;
            gap: 6rpx;
        }
        .bar {
            flex: 1;
            height: 6rpx;
            border-radius: 4rpx;
            background: var(--bg-3);
            transition: background 0.18s ease;
            &.on.lv1 { background: #e74c3c; }
            &.on.lv2 { background: #f1a430; }
            &.on.lv3 { background: #2ec27e; }
            &.on.lv4 { background: #1b9c5c; }
        }
        .lbl-s {
            font-size: 20rpx;
            font-weight: 700;
            min-width: 56rpx;
            text-align: right;
            color: var(--ink-3);
            &.lv1 { color: #e74c3c; }
            &.lv2 { color: #c07a00; }
            &.lv3 { color: #08754a; }
            &.lv4 { color: #08754a; }
        }
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
        height: 70rpx;
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
        width: 56rpx;
        height: 56rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
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
    margin: 18rpx 4rpx 22rpx;
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
    margin-top: 18rpx;
    font-size: 24rpx;
    color: var(--ink-2);
    .link {
        color: var(--c-coral);
        font-weight: 700;
        margin-left: 4rpx;
    }
}
</style>
