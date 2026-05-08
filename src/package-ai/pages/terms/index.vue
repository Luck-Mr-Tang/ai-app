<template>
    <view class="page">
        <view class="topbar">
            <view class="back" @click="goBack">‹</view>
            <view class="title">服务条款</view>
            <view class="placeholder" />
        </view>

        <view class="doc">
            <view class="doc-meta">最近更新：2026-05-08 · v0.1</view>

            <view class="sec">
                <view class="h">一、欢迎使用</view>
                <view class="p">本应用（以下简称「本服务」）是一款 AI 笔友陪伴产品，提供与多位 AI 角色的文字聊天、动态广场浏览/互动等功能。在使用本服务之前，请您仔细阅读并同意本《服务条款》。</view>
            </view>

            <view class="sec">
                <view class="h">二、账号注册与审核</view>
                <view class="p">1. 注册需提供用户名、手机号与密码；</view>
                <view class="p">2. 注册成功后账号默认处于「待审核」状态，需由超级管理员审核通过后方可登录；</view>
                <view class="p">3. 您应妥善保管账号与密码，因疏忽导致的损失由您自行承担；</view>
                <view class="p">4. 不得使用他人手机号注册或冒用他人身份。</view>
            </view>

            <view class="sec">
                <view class="h">三、使用规范</view>
                <view class="p">使用本服务时，您应承诺不发布以下内容：</view>
                <view class="p">· 违反法律法规、危害国家安全或社会公序良俗的内容；</view>
                <view class="p">· 涉及色情、暴力、赌博、毒品等违法内容；</view>
                <view class="p">· 侵犯他人知识产权、隐私权或其他合法权益的内容；</view>
                <view class="p">· 通过自动化脚本、爬虫等手段批量调用 AI 接口、刷量或恶意攻击。</view>
            </view>

            <view class="sec">
                <view class="h">四、AI 生成内容声明</view>
                <view class="p">1. 本服务中的「AI 角色」由大语言模型驱动，所生成内容仅供娱乐与陪伴使用，不构成任何专业意见（包括但不限于医疗、法律、金融）；</view>
                <view class="p">2. AI 输出可能存在错误、偏差或不准确，请您自行甄别；</view>
                <view class="p">3. 因依赖 AI 输出做出决定而产生的后果，本服务不承担责任。</view>
            </view>

            <view class="sec">
                <view class="h">五、内容审核与处置</view>
                <view class="p">超级管理员（super 角色）有权对注册账号、用户行为进行审核。对于违反本条款的账号，我们有权采取包括但不限于警告、限制功能、停用、删除账号在内的处置措施。</view>
            </view>

            <view class="sec">
                <view class="h">六、服务变更与终止</view>
                <view class="p">本服务目前处于 MVP 阶段，功能与界面可能持续变化。我们保留在合理范围内变更、暂停或终止部分/全部服务的权利。</view>
            </view>

            <view class="sec">
                <view class="h">七、免责声明</view>
                <view class="p">由于网络中断、第三方 AI 接口不可用、缓存服务异常等不可抗力或第三方原因导致服务中断，您理解并同意本服务可不承担直接或间接责任。</view>
            </view>

            <view class="sec">
                <view class="h">八、联系方式</view>
                <view class="p">如对本条款有任何疑问，可在「我的 / 建议反馈」中向我们反馈。</view>
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
