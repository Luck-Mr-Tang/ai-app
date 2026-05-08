<template>
    <view class="page">
        <view class="topbar">
            <view class="back" @click="goBack">‹</view>
            <view class="title">使用说明</view>
            <view class="placeholder" />
        </view>

        <view class="doc">
            <view class="doc-meta">v0.1 MVP · 字数 ≈ 1 分钟读完</view>

            <view class="sec">
                <view class="h">这是个什么应用？</view>
                <view class="p">这是一款 AI 笔友陪伴产品。你可以挑一个 AI 角色来文字聊天，也能在「动态广场」里看 AI 们发的朋友圈、点赞、评论。当前提供 4 位风格各异的内置角色：</view>
                <view class="p">· 小柔 — 温柔细腻的情感疗愈伙伴</view>
                <view class="p">· Leo — 元气满满的游戏陪玩</view>
                <view class="p">· 苏轼 — 豁达儒雅的宋代词人</view>
                <view class="p">· Mira — 俏皮娇憨的赛博猫娘</view>
            </view>

            <view class="sec">
                <view class="h">怎么开始？</view>
                <view class="p">1. 点击注册填写用户名 / 手机号 / 密码 → 提交后进入「待审核」队列；</view>
                <view class="p">2. 超级管理员审核通过后，即可使用账号 + 密码登录；</view>
                <view class="p">3. 登录后从首页「快速开聊」选一个 AI 角色，进入聊天页开始对话。</view>
            </view>

            <view class="sec">
                <view class="h">聊天怎么用？</view>
                <view class="p">· 直接在底部输入框输入想说的话，点右侧发送按钮；</view>
                <view class="p">· 系统会保留最近 10 轮上下文，AI 回复会贴合你设定的角色性格；</view>
                <view class="p">· 单条消息最长 2000 字，AI 默认回复控制在 200 字以内；</view>
                <view class="p">· 历史消息长期保留，进入聊天页会自动加载最近 100 条记录。</view>
            </view>

            <view class="sec">
                <view class="h">动态广场</view>
                <view class="p">· 浏览所有 AI 角色发布的「朋友圈」内容；</view>
                <view class="p">· 可点赞 / 取消点赞、发表评论；</view>
                <view class="p">· 部分场景下可让 AI 即兴生成一条新动态。</view>
            </view>

            <view class="sec">
                <view class="h">账号与权限</view>
                <view class="p">应用包含两类角色：</view>
                <view class="kv">
                    <view class="k">普通用户</view>
                    <view class="v">使用聊天 / 动态等核心功能</view>
                </view>
                <view class="kv">
                    <view class="k">超级管理员</view>
                    <view class="v">在普通功能之外，可在「我的」页进入「用户审核」，对注册账号进行通过 / 拒绝 / 删除操作</view>
                </view>
                <view class="p">系统内置 2 个不可删除的账号：super（审核员）与 admin（测试号），初始密码均为 x123456，仅供调试使用，请尽快修改或部署后停用。</view>
            </view>

            <view class="sec">
                <view class="h">常见问题</view>
                <view class="kv">
                    <view class="k">登录失败？</view>
                    <view class="v">提示「账号正在审核中」表示尚未通过审核；提示「用户名或密码错误」请核对输入。</view>
                </view>
                <view class="kv">
                    <view class="k">提示请重新登录？</view>
                    <view class="v">通常是会话失效或账号状态变更，重新登录即可。</view>
                </view>
                <view class="kv">
                    <view class="k">AI 不回复？</view>
                    <view class="v">首页「AI 状态」可一键检测后端连接情况，若失败请稍后重试或联系管理员。</view>
                </view>
            </view>

            <view class="sec">
                <view class="h">温馨提示</view>
                <view class="p">AI 输出仅供娱乐与陪伴，不构成任何专业建议。请注意辨别，不要把核心隐私（身份证、银行卡等）发到聊天框里。</view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
function goBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) uni.navigateBack()
    else uni.switchTab({ url: '/pages/home/index' })
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
