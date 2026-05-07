import { getOpenId } from '@/api/user'
import { getCookie, is_weixn, isWeapp } from '@/utils'

export async function getWxOpenId() {
    let openId = ''
    // 微信公众号
    if (is_weixn() && !isWeapp()) {
        const res = await getOpenId({ code: '' })
        if (res.success && res.data) {
            // 登录 获取到了 openId
            openId = res.data
            return openId
        } else if (res.success && !res.data) {
            // 登录了 没有获取到openId，打开授权页面
            location.href = '/Base/Index?url=' + encodeURIComponent(location.href)
        } else {
            // 未登录情况暂不处理，进页面前应该已经判断了登录
            return openId
        }
    } else if (isWeapp()) {
        // 小程序 支付能获取到openid 不需要业务获取
        return openId
    } else {
        // 其他情况暂不处理
        return openId
    }
}

// 判断有没有微信授权并进行授权
export async function jumpWxOpenId(url?: string) {
    let openId = ''
    // 微信公众号

    if (is_weixn() && !isWeapp()) {
        console.log(getCookie('_OpenId'))
        const res = await getOpenId({ code: '' })
        if (res.data) {
            // 获取到了 openId
            openId = res.data
            return openId
        } else if (!res.data) {
            // 没有获取到openId，打开授权页面
            uni.showToast({
                icon: 'none',
                message: '未获取到微信授权，即将跳转授权',
                complete: () => {
                    // 后端微信授权接口链接，授权后再进行登录，要在顶层window跳转，iframe里跳转会跨域
                    // base/index 授权成功后默认会重定向到登录页，添加REDIRECT:协议，则重定向到指定的url传参页面
                    ;(top || window).location.href =
                        '/Base/Index?url=' + encodeURIComponent('REDIRECT:' + (top?.location.href || location.href))
                },
                duration: 1000
            })
        }
    } else if (isWeapp()) {
        // 小程序 支付能获取到openid 不需要业务获取
        return openId
    } else {
        // 其他情况暂不处理
        return openId
    }
}
