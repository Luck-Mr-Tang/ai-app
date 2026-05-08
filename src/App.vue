<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { getOpenId } from '@/api/user'
import { useAuthStore } from '@/state/modules/user'
import { getCachedUser } from '@/api/ai'

const { saveOpenId, saveCode, saveUnionId } = useAuthStore()

const AI_LOGIN_PAGE = '/package-ai/pages/login/index'

function gateAILogin() {
    if (getCachedUser()) return
    // 尚未登录 → 强制进入登录页
    uni.reLaunch({ url: AI_LOGIN_PAGE })
}

onLaunch(() => {
    console.log('App Launch')
    const isH5 = process.env.UNI_PLATFORM === 'h5'
    const isApp = process.env.UNI_PLATFORM === 'app'
    const isMiniProgram = !(isH5 || isApp)
    if (isMiniProgram) {
        uni.login({
            provider: 'weixin',
            success: res => {
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
    gateAILogin()
})
onShow(() => {
    console.log('App Show')
    gateAILogin()
})
onHide(() => {
    console.log('App Hide')
})
</script>
<style>
@import url('./style/index.css');
</style>
