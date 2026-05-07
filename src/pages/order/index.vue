<template>
    <div />
</template>
<script lang="ts" setup name="order">
import { onMounted, ref } from 'vue'
import { useRoute } from 'uni-mini-router'
import { findBaseInfoByToken, wechatJsPay } from '@/api/user/index'
import { useAuthStore } from '@/state/modules/user'
import { useCompanyStore } from '@/state/modules/company'

const { openId } = useAuthStore()
const { companyDetail } = useCompanyStore()
const route = useRoute()
console.log(111, route)
const authStore = useAuthStore()
const userInfo = ref<any>()
const findBaseInfo = async () => {
    const res = await findBaseInfoByToken()
    userInfo.value = res
}

onMounted(async () => {
    if (authStore.isLogin) {
        await findBaseInfo()
    }
    wechatJsPay({
        orderNo: route.query?.orderNo,
        isBid: route.query?.chargesType === '2' ? 1 : 0,
        appType: 'W06',
        appId: 'wx0cfb9b4663746bba',
        companyName: userInfo.value.companyName,
        companyId: userInfo.value.companyId,
        openId: openId,
        paymentChannel: 2,
        fromSource: 1,
        userId: userInfo.value?.userId,
        userName: userInfo.value?.userName
    }).then(res => {
        if (res.success) {
            var data = JSON.parse(res.data.rstStr)
            console.log('rstStr', data)
            const paymentData = {
                appId: data.appId || '',
                timeStamp: data.timeStamp || '',
                nonceStr: data.nonceStr || '',
                package: data.package || '',
                signType: data.signType || '',
                paySign: data.paySign || ''
            }
            console.log('paymentData', paymentData)

            uni.requestPayment({
                provider: 'wxpay',
                appId: data.appId || '',
                timeStamp: data.timeStamp || '',
                nonceStr: data.nonceStr || '',
                package: data.package || '',
                signType: data.signType || '',
                paySign: data.paySign || '',
                success() {
                    uni.showToast({
                        title: '支付成功',
                        icon: 'none'
                    })
                    setTimeout(() => {
                        uni.reLaunch({
                            url: '/pages/user/index'
                        })
                    }, 500)
                },
                fail(res) {
                    if (res.errMsg === 'requestPayment:fail cancel') {
                        uni.showToast({
                            title: '支付取消',
                            icon: 'none'
                        })
                        uni.navigateBack()
                    } else {
                        uni.showToast({
                            title: '支付失败',
                            icon: 'none'
                        })
                    }
                    console.log(res)
                }
            })
        }
    })
})
</script>
