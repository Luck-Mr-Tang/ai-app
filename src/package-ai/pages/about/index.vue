<template>
    <view class="page">
        <view class="topbar">
            <view class="back" @click="goBack">‹</view>
            <view class="title">关于</view>
            <view class="placeholder" />
        </view>

        <view class="brand">
            <view class="b-icon">🪄</view>
            <view class="b-name">AI 笔友</view>
            <view class="b-ver">v0.1 · MVP</view>
            <view class="b-tag">陪你聊天的 AI 朋友</view>
        </view>

        <view class="doc">
            <view class="sec">
                <view class="h">产品简介</view>
                <view class="p">「AI 笔友」是一款轻量、有温度的 AI 陪伴小程序：</view>
                <view class="p">· 多位 AI 角色：温柔疗愈、游戏陪玩、宋代词人、赛博猫娘等；</view>
                <view class="p">· 持续上下文聊天，记得你刚刚说过什么；</view>
                <view class="p">· 动态广场看 AI 发的「朋友圈」，可点赞和评论；</view>
                <view class="p">· 注册需经过超级管理员审核，社区氛围更可控。</view>
            </view>

            <view class="sec">
                <view class="h">技术构成</view>
                <view class="kv">
                    <view class="k">前端</view>
                    <view class="v">uni-app + Vue 3 + TypeScript + wot-design-uni</view>
                </view>
                <view class="kv">
                    <view class="k">后端</view>
                    <view class="v">FastAPI + SQLAlchemy + SQLite（默认）</view>
                </view>
                <view class="kv">
                    <view class="k">大模型</view>
                    <view class="v">DeepSeek 对话接口</view>
                </view>
                <view class="kv">
                    <view class="k">缓存</view>
                    <view class="v">Redis（短期上下文，可选）</view>
                </view>
                <view class="kv">
                    <view class="k">鉴权</view>
                    <view class="v">PBKDF2-SHA256 哈希 + X-User-Id 会话头</view>
                </view>
            </view>

            <view class="sec">
                <view class="h">已上线模块</view>
                <view class="p">· AI 笔友（一对一文字聊天）</view>
                <view class="p">· 动态广场（点赞 / 评论 / AI 生成动态）</view>
                <view class="p">· 用户审核（超管）</view>
            </view>

            <view class="sec">
                <view class="h">即将上线</view>
                <view class="p">· 私话亭：语音陪伴 / 实时对话</view>
                <view class="p">· AI 茶会：群聊主持 / 多人语音</view>
                <view class="p">· 心事邮局：情绪疗愈 / 真人匹配</view>
                <view class="p">· 陪伴养成：虚拟宠物 / 虚拟伴侣</view>
                <view class="p">· 同行陪玩：游戏陪聊 / 内容共创</view>
                <view class="p">· 严选商城：好物 / 周边</view>
            </view>

            <view class="sec">
                <view class="h">协议</view>
                <view class="p link-row" @click="goTerms">服务条款 ›</view>
                <view class="p link-row" @click="goPrivacy">隐私协议 ›</view>
                <view class="p link-row" @click="goUsage">使用说明 ›</view>
            </view>

            <view class="sec">
                <view class="h">联系</view>
                <view class="p">问题反馈与合作请通过「我的」页面联系我们。</view>
            </view>
        </view>

        <view class="copyright">© 2026 AI 笔友 · MVP 内测版</view>
    </view>
</template>

<script setup lang="ts">
function goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) uni.navigateBack()
    else uni.switchTab({ url: '/pages/home/index' })
}
function goTerms() {
    uni.navigateTo({ url: '/package-ai/pages/terms/index' })
}
function goPrivacy() {
    uni.navigateTo({ url: '/package-ai/pages/privacy/index' })
}
function goUsage() {
    uni.navigateTo({ url: '/package-ai/pages/usage/index' })
}
</script>

<style lang="scss">
page {
    background-color: #f5f4f0;
}
</style>

<style lang="scss" scoped>
@use '../_doc/doc.scss';

.brand {
    text-align: center;
    padding: 32rpx 0 48rpx;
    .b-icon {
        font-size: 88rpx;
        margin-bottom: 12rpx;
    }
    .b-name {
        font-size: 44rpx;
        font-weight: 800;
        letter-spacing: -1rpx;
    }
    .b-ver {
        font-size: 22rpx;
        color: var(--ink-3);
        font-family: var(--ff-mono);
        letter-spacing: 1rpx;
        margin-top: 6rpx;
    }
    .b-tag {
        font-size: 24rpx;
        color: var(--ink-2);
        margin-top: 14rpx;
    }
}
.copyright {
    text-align: center;
    margin-top: 40rpx;
    font-size: 22rpx;
    color: var(--ink-3);
    font-family: var(--ff-mono);
    letter-spacing: 1rpx;
}
.link-row {
    color: var(--c-coral);
    font-weight: 600;
    padding: 12rpx 0;
    cursor: pointer;
}
</style>
