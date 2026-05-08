<template>
    <view class="page">
        <top-toast />
        <view class="topbar">
            <view class="back" @click="goBack">‹</view>
            <view class="title">用户审核</view>
            <view class="placeholder" />
        </view>

        <view class="tabs">
            <view
                v-for="t in tabs"
                :key="t.key"
                class="tab"
                :class="{ on: tab === t.key }"
                @click="setTab(t.key)"
            >
                <text>{{ t.label }}</text>
                <text v-if="counts[t.key]" class="badge">{{ counts[t.key] }}</text>
            </view>
        </view>

        <view v-if="loading" class="empty">加载中…</view>
        <view v-else-if="filtered.length === 0" class="empty">暂无用户</view>

        <view v-else class="list">
            <view v-for="u in filtered" :key="u.id" class="card">
                <view class="top">
                    <view class="avatar">{{ u.username.slice(0, 1).toUpperCase() }}</view>
                    <view class="info">
                        <view class="name-row">
                            <text class="name">{{ u.username }}</text>
                            <text v-if="u.role === 'super'" class="tag super">超管</text>
                            <text v-if="u.is_protected" class="tag locked">受保护</text>
                            <text class="tag" :class="u.status">{{ statusLabel(u.status) }}</text>
                        </view>
                        <view class="meta">
                            手机：{{ u.phone || '—' }}
                        </view>
                        <view class="meta">
                            注册：{{ formatTime(u.created_at) }}
                        </view>
                    </view>
                </view>

                <view class="actions">
                    <view
                        v-if="u.status === 'pending'"
                        class="btn primary"
                        @click="onApprove(u)"
                    >通过</view>
                    <view
                        v-if="u.status === 'pending' && !u.is_protected"
                        class="btn danger"
                        @click="onReject(u)"
                    >拒绝</view>
                    <view
                        v-if="u.status === 'rejected'"
                        class="btn primary"
                        @click="onApprove(u)"
                    >恢复审核</view>
                    <view
                        v-if="!u.is_protected && u.id !== meId"
                        class="btn ghost"
                        @click="onDelete(u)"
                    >删除</view>
                    <view v-if="u.is_protected" class="btn disabled">不可删除</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
    adminListUsers,
    adminApproveUser,
    adminRejectUser,
    adminDeleteUser,
    getCachedUser,
    type AdminUser
} from '@/api/ai'
import TopToast from '@/components/top-toast/index.vue'

type TabKey = 'pending' | 'approved' | 'rejected'

const tabs: { key: TabKey; label: string }[] = [
    { key: 'pending', label: '待审核' },
    { key: 'approved', label: '已通过' },
    { key: 'rejected', label: '已拒绝' }
]

const tab = ref<TabKey>('pending')
const all = ref<AdminUser[]>([])
const loading = ref(false)
const meId = getCachedUser()?.id || 0

const filtered = computed(() => all.value.filter(u => u.status === tab.value))
const counts = computed(() => {
    const c: Record<string, number> = { pending: 0, approved: 0, rejected: 0 }
    for (const u of all.value) {
        if (c[u.status] !== undefined) c[u.status]++
    }
    return c
})

async function load() {
    loading.value = true
    try {
        all.value = await adminListUsers()
    } catch (e) {
        console.warn('list users failed', e)
    } finally {
        loading.value = false
    }
}

function setTab(k: TabKey) {
    tab.value = k
}

function statusLabel(s: string) {
    return { pending: '待审核', approved: '已通过', rejected: '已拒绝', disabled: '已停用' }[s] || s
}

function formatTime(s: string) {
    const d = new Date(s)
    if (Number.isNaN(d.getTime())) return s
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function onApprove(u: AdminUser) {
    try {
        await adminApproveUser(u.id)
        uni.showToast({ title: '已通过', icon: 'none' })
        load()
    } catch (e) {
        console.warn(e)
    }
}

async function onReject(u: AdminUser) {
    uni.showModal({
        title: '确认拒绝？',
        content: `用户「${u.username}」将无法登录`,
        success: async r => {
            if (!r.confirm) return
            try {
                await adminRejectUser(u.id)
                uni.showToast({ title: '已拒绝', icon: 'none' })
                load()
            } catch (e) {
                console.warn(e)
            }
        }
    })
}

async function onDelete(u: AdminUser) {
    uni.showModal({
        title: '确认删除？',
        content: `用户「${u.username}」将被永久删除，相关聊天记录也会被移除`,
        confirmColor: '#FF5C4D',
        success: async r => {
            if (!r.confirm) return
            try {
                await adminDeleteUser(u.id)
                uni.showToast({ title: '已删除', icon: 'none' })
                load()
            } catch (e) {
                console.warn(e)
            }
        }
    })
}

function goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) uni.navigateBack()
    else uni.switchTab({ url: '/pages/home/index' })
}

onMounted(() => {
    const me = getCachedUser()
    if (!me || me.role !== 'super') {
        uni.showToast({ title: '需要超管权限', icon: 'none' })
        setTimeout(goBack, 600)
        return
    }
    load()
})
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
    padding: 60rpx 32rpx 80rpx;
    color: var(--ink);
    font-family: var(--ff-sans);
}
.topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28rpx;
    .back, .placeholder {
        width: 64rpx;
        height: 64rpx;
    }
    .back {
        border-radius: 50%;
        background: var(--bg-2);
        font-size: 36rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: var(--shadow-sm);
    }
    .title {
        font-size: 36rpx;
        font-weight: 800;
        letter-spacing: -0.5rpx;
    }
}
.tabs {
    display: flex;
    gap: 16rpx;
    margin-bottom: 28rpx;
    .tab {
        flex: 1;
        text-align: center;
        padding: 18rpx 0;
        background: var(--bg-2);
        border-radius: var(--r-sm);
        font-size: 26rpx;
        font-weight: 600;
        color: var(--ink-2);
        box-shadow: var(--shadow-sm);
        transition: all 0.18s ease;
        .badge {
            display: inline-block;
            margin-left: 8rpx;
            min-width: 28rpx;
            padding: 0 10rpx;
            background: var(--c-coral);
            color: #fff;
            border-radius: 999rpx;
            font-size: 20rpx;
            line-height: 28rpx;
            font-weight: 700;
        }
        &.on {
            background: var(--ink);
            color: #fff;
        }
    }
}
.empty {
    text-align: center;
    padding: 80rpx 0;
    font-size: 26rpx;
    color: var(--ink-3);
}
.list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}
.card {
    padding: 24rpx;
    background: var(--bg-2);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
    .top {
        display: flex;
        gap: 20rpx;
    }
    .avatar {
        width: 84rpx;
        height: 84rpx;
        border-radius: 22rpx;
        background: var(--c-coral);
        color: #fff;
        font-size: 36rpx;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 6rpx 14rpx -4rpx var(--c-coral);
    }
    .info {
        flex: 1;
        min-width: 0;
        .name-row {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 10rpx;
        }
        .name {
            font-size: 32rpx;
            font-weight: 800;
        }
        .tag {
            font-size: 20rpx;
            font-weight: 700;
            padding: 4rpx 12rpx;
            border-radius: 999rpx;
            background: var(--bg-3);
            color: var(--ink-2);
            &.pending { background: rgba(255, 177, 43, 0.16); color: #b07300; }
            &.approved { background: rgba(30, 216, 138, 0.16); color: #08754a; }
            &.rejected { background: rgba(255, 92, 77, 0.16); color: #c0382c; }
            &.disabled { background: var(--bg-3); color: var(--ink-3); }
            &.super { background: rgba(64, 96, 255, 0.16); color: #2540c0; }
            &.locked { background: rgba(0, 0, 0, 0.06); color: var(--ink-2); }
        }
        .meta {
            font-size: 22rpx;
            color: var(--ink-3);
            margin-top: 6rpx;
        }
    }
    .actions {
        display: flex;
        gap: 16rpx;
        flex-wrap: wrap;
        margin-top: 22rpx;
    }
    .btn {
        padding: 14rpx 28rpx;
        border-radius: 999rpx;
        font-size: 24rpx;
        font-weight: 700;
        background: var(--bg-3);
        color: var(--ink-2);
        &.primary {
            background: var(--ink);
            color: #fff;
        }
        &.danger {
            background: rgba(255, 92, 77, 0.14);
            color: #c0382c;
        }
        &.ghost {
            background: transparent;
            border: 2rpx solid var(--ink-4);
            color: var(--ink-2);
        }
        &.disabled {
            opacity: 0.55;
        }
    }
}
</style>
