<template>
    <view>
        <web-view :src="src" @message="handleMessage"></web-view>
    </view>
</template>

<script lang="ts" setup>
import { useAuthStore } from '@/state/modules/user'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
const src = ref('')
const { isLogin } = useAuthStore()
onLoad(async (options: any) => {
    if (isLogin) {
        console.log('')
    } else if (options.needLogin) {
        uni.redirectTo({
            url: '/package-login/pages/login/index?ReturnUrl=' + options.url
        })
    } else {
        src.value = options.url
    }
    // src.value = options.src || 'http://localhost:9000/homeweb-mobile/login'
})
const { login } = useAuthStore()
const handleMessage = (e: {
    detail: {
        data: {
            action: string
            data: LoginResult
        }[]
    }
}) => {
    const data = e.detail.data
    console.log(data, 'change')
    const loginInfo = data.find(i => i.action === 'login')?.data

    if (loginInfo) login(loginInfo)
}
</script>
