<template>
    <layout>
        <view class="flex">
            <div :class="isWindow ? 'login-window-container' : 'login-container'">
                <wd-icon
                    name="close"
                    @click="close"
                    v-if="isWindow"
                    size="15px"
                    custom-style="position: absolute;right: 14px;top: 14px;z-index: 9;"
                />
                <loginBox @success="loginSuccess" :registerUrl="registerUrl"></loginBox>
            </div>
            <CopyrightFooter
                :custom-style="'height: 82rpx;background-color: #f9f9f9;'"
                v-if="!isWindow"
            ></CopyrightFooter>
        </view>
    </layout>
</template>

<script setup lang="ts">
import Messenger from '@/package-login/utils/message'

import CopyrightFooter from '../../components/CopyrightFooter.vue'
import loginBox from '@/components/login/index.vue'
import { getDomain, is_weixn, isWeb, isWebinWeapp } from '@/utils'
import { jumpWxOpenId } from './common'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import layout from '@/components/layout/index.vue'
import { useRouter } from 'uni-mini-router'
import { onShareAppMessage } from '@dcloudio/uni-app'

const isWindow = ref(false)
const ReturnUrl = ref('' as string)
const registerUrl = ref('' as string)
onLoad((options: any) => {
    isWindow.value = options.isWindow
    ReturnUrl.value = options.ReturnUrl
    registerUrl.value = options.registerUrl
    console.log(options.ReturnUrl)
})
jumpWxOpenId()
const sendMessage = function (name: string, msg: string) {
    // iframe跨域传数据
    //子页面使用
    if (!isWindow.value) return
    var messenger = new Messenger('iframe')
    messenger.addTarget(window.parent, 'parent')
    messenger.targets[name].send(msg)
}
const close = function () {
    sendMessage('parent', 'close')
    // window.parent.loginClose();
}
function isExternal(path) {
    return /^(https?:|mailto:|tel:)/.test(path)
}
const loginSuccess = function () {
    if (isWindow.value) {
        sendMessage('parent', 'reload')
        return
    }
    if (!isWeb()) {
        // 小程序内，h5页面通过webview打开
        const url = isExternal(decodeURIComponent(ReturnUrl.value))
            ? '/package-webview/pages/webview/index?url=' + decodeURIComponent(ReturnUrl.value)
            : ReturnUrl.value
        console.log(ReturnUrl.value, url)

        uni.redirectTo({
            url: url || '/pages/user/index', // 目标小程序的页面路径
            success: function () {
                console.log('跳转成功')
            },
            fail: function (error) {
                console.log('跳转失败：', error)
            }
        })
        return
    }
    if (isWebinWeapp()) {
        const url = ReturnUrl.value.startsWith('/') ? getDomain('m') + ReturnUrl.value : ReturnUrl.value
        window.open(url)
        return
    }
    if (is_weixn()) {
        window.location.href = ReturnUrl.value ? ReturnUrl.value : getDomain('m') + '/MyCenter/Index'
    } else {
        window.location.href = ReturnUrl.value ? ReturnUrl.value : getDomain('member')
    }
}

onShareAppMessage(() => {
    return {
        title: 'app',
        path: '/pages/home/index'
    }
})
</script>

<style scoped lang="scss">
.flex {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.login-container {
    background-color: #fff;
    flex: 1;
    min-height: 1100px !important;
    padding-top: 88px;
}
.login-window-container {
    background-color: #fff;
    height: 100vh;
    position: relative;
    min-height: 1100px !important;
}
</style>
