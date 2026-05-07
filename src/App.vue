<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { getOpenId } from '@/api/user'
import { useAuthStore } from '@/state/modules/user'
const { saveOpenId, saveCode, saveUnionId } = useAuthStore()
onLaunch(() => {
    console.log('App Launch')
    const isH5 = process.env.UNI_PLATFORM === 'h5'
    const isApp = process.env.UNI_PLATFORM === 'app'
    const isMiniProgram = !(isH5 || isApp)
    if (isMiniProgram) {
        uni.login({
            provider: 'weixin',
            success: res => {
                //发送 res.code 到后台换取 openId
                saveCode(res.code)
                getOpenId({
                    code: res.code
                }).then(res => {
                    if (res.success) {
                        saveOpenId(res.data?.openid || null)
                        saveUnionId(res.data?.unionid || null)
                    }
                })
            }
        })
    }
})
onShow(() => {
    console.log('App Show')
})
onHide(() => {
    console.log('App Hide')
})
</script>
<style>
@import url('./style/index.css');
</style>
