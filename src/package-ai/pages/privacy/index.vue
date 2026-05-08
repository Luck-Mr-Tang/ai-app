<template>
    <view class="page">
        <view class="topbar">
            <view class="back" @click="goBack">‹</view>
            <view class="title">隐私协议</view>
            <view class="placeholder" />
        </view>

        <view class="doc">
            <view class="doc-meta">最近更新：2026-05-08 · v0.1</view>

            <view class="sec">
                <view class="h">引言</view>
                <view class="p">我们重视您的个人信息安全。本协议说明本应用在您使用过程中收集、使用、存储与共享个人信息的方式。请您仔细阅读，使用本服务即视为您已同意本协议。</view>
            </view>

            <view class="sec">
                <view class="h">一、我们收集的信息</view>
                <view class="kv">
                    <view class="k">注册信息</view>
                    <view class="v">用户名、手机号、密码（密码以 PBKDF2 哈希形式存储，原文不会被保存）</view>
                </view>
                <view class="kv">
                    <view class="k">使用记录</view>
                    <view class="v">您与 AI 角色的聊天记录、对动态的点赞与评论</view>
                </view>
                <view class="kv">
                    <view class="k">设备信息</view>
                    <view class="v">运行平台（H5 / 小程序 / App）及网络状态等基础信息</view>
                </view>
                <view class="kv">
                    <view class="k">微信小程序</view>
                    <view class="v">仅在小程序环境下获取 openId / unionId 用于会话标识</view>
                </view>
            </view>

            <view class="sec">
                <view class="h">二、信息的使用</view>
                <view class="p">· 完成账号注册、登录与审核；</view>
                <view class="p">· 在 AI 聊天功能中，将最近若干轮对话作为上下文调用第三方大模型接口（DeepSeek）以生成回复；</view>
                <view class="p">· 维护动态广场的点赞、评论计数；</view>
                <view class="p">· 服务异常排查与统计分析。</view>
            </view>

            <view class="sec">
                <view class="h">三、信息的存储</view>
                <view class="p">· 账号、聊天与动态数据存储在我们的后端数据库（默认 SQLite，可部署为其它关系型数据库）；</view>
                <view class="p">· 短期对话上下文缓存在 Redis（如开启），仅保留最近 10 轮，最长保留 6 小时；</view>
                <view class="p">· 我们不会主动收集与本服务无关的个人信息。</view>
            </view>

            <view class="sec">
                <view class="h">四、信息的共享</view>
                <view class="p">为提供 AI 回复，您发送的聊天内容及最近上下文会被传输至第三方大模型服务商（DeepSeek）以获取应答。除此之外，未经您明确同意，我们不会将您的个人信息共享给第三方。</view>
            </view>

            <view class="sec">
                <view class="h">五、您的权利</view>
                <view class="p">· 查看与修改：您可在「我的」页面查看账号信息；</view>
                <view class="p">· 注销账号：可联系超级管理员申请删除账号（受保护的内置账号除外）；</view>
                <view class="p">· 撤回同意：您可随时退出登录，停止使用相关功能。</view>
            </view>

            <view class="sec">
                <view class="h">六、安全保障</view>
                <view class="p">· 密码使用 PBKDF2-HMAC-SHA256（200,000 次迭代 + 随机 16 字节盐）哈希存储；</view>
                <view class="p">· 接口访问通过 X-User-Id 鉴权，会话凭证存储在本地缓存；</view>
                <view class="p">· 我们会持续完善安全措施，但互联网环境下无法保证绝对安全。</view>
            </view>

            <view class="sec">
                <view class="h">七、未成年人</view>
                <view class="p">本服务不面向未满 14 周岁的未成年人。如您是监护人并发现未成年人在未经同意的情况下注册了账号，请联系我们删除。</view>
            </view>

            <view class="sec">
                <view class="h">八、协议更新</view>
                <view class="p">我们可能根据法律法规或服务变化更新本协议。重大变更将在应用内提示，请留意。</view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
function goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) uni.navigateBack()
    else uni.reLaunch({ url: '/package-ai/pages/login/index' })
}
</script>

<style lang="scss">
page {
    background-color: #f5f4f0;
}
</style>

<style lang="scss" scoped>
@use '../_doc/doc.scss';
</style>
