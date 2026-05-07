// import { getOpenId } from '@/api/enterprise'
import { pages, subPackages } from '@/pages.json'
const platform = process.env.UNI_PLATFORM as string
const env = process.env.NODE_ENV as string
export function findPageConfig(path?: string): PageJSON.Page | undefined {
    if (!path) return undefined
    const rous = [...pages] as PageJSON.Page[]
    subPackages.forEach(pkg => {
        pkg.pages.forEach(it => {
            const item = it as PageJSON.Page
            rous.push({ ...item, path: `${pkg.root}/${it.path}` })
        })
    })
    const page = rous.find(it => path?.includes(it.path))
    return page
}

/**
 * 获取域
 */
export function getDomain(pre?: string, isProd = false) {
    let domain = 'uzhicai.com'
    console.log('env', env)

    if (platform === 'mp-weixin') {
        if (env === 'development') {
            domain = 'uzhicai.com'
        } else {
            domain = 'youzhicai.com'
        }
    }
    if (platform === 'web' || platform === 'h5') {
        const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:[^:\\/\n]+\.)?((?:[a-z0-9-]+\.)+[a-z]{2,})/
        const match = location.href.match(regex)
        domain = match?.[1] || 'uzhicai.com'
    }
    if (pre) return `https://${pre}.${domain}`
    return domain
}
export const getImage = (path: string) => {
    return `${getDomain('portal')}/mobile` + path
}

const systemInfo = uni.getSystemInfoSync()
// 是否是web
export function isWeb() {
    return platform === 'web' || platform === 'h5'
}
// 微信浏览器
export function is_weixn() {
    if (isWeb()) {
        const ua = navigator.userAgent.toLowerCase()
        if ((ua.match(/MicroMessenger/i) as any) === 'micromessenger') {
            return true
        }
    }
    return false
}
export function getCookie(name: string) {
    const strcookie = document.cookie //获取cookie字符串
    const arrcookie = strcookie.split('; ') //分割 //遍历匹配
    for (let i = 0; i < arrcookie.length; i++) {
        const arr = arrcookie[i].split('=')
        if (arr[0] == name) {
            return arr[1]
        }
    }
    return ''
}
// 微信小程序
export function isWeapp() {
    if (platform === 'mp-weixin') {
        return true
    } else {
        return false
    }
}

declare global {
    interface Window {
        __wxjs_environment?: string
    }
}
// 嵌入在微信小程序的web
export function isWebinWeapp() {
    if (isWeb()) {
        const ua = navigator.userAgent.toLowerCase()
        if (window.__wxjs_environment && window.__wxjs_environment === 'miniprogram') {
            return true
        }
    }
    return false
}

// 微信公众号环境
export function isWechatOfficialAccount() {
    return typeof window !== 'undefined' && window.__wxjs_environment === 'miniprogram'
}

export function Toast(title: string, icon: 'success' | 'loading' | 'error' | 'none' | 'fail' | 'exception' = 'none') {
    uni.showToast({
        title,
        icon
    })
}

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time: any, cFormat?: string) {
    if (arguments.length === 0 || !time) {
        return null
    }
    const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
    let date
    if (typeof time === 'object') {
        date = time
    } else {
        if (typeof time === 'string') {
            if (/^[0-9]+$/.test(time)) {
                // support "1548221490638"
                time = parseInt(time)
            } else {
                // support safari
                // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
                time = time.replace(new RegExp(/-/gm), '/')
            }
        }

        if (typeof time === 'number' && time.toString().length === 10) {
            time = time * 1000
        }
        date = new Date(time)
    }
    const formatObj: any = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
    }
    const time_str = format.replace(/{([ymdhisa])+}/g, (result, key: any) => {
        const value = formatObj[key]

        // Note: getDay() returns 0 on Sunday
        if (key === 'a') {
            return ['日', '一', '二', '三', '四', '五', '六'][value]
        }
        return value.toString().padStart(2, '0')
    })
    return time_str
}
/* 隐藏中间某几位数*/
export function getTel(tel: string, startIndex = 3, endeIndex = 7) {
    if (!tel) {
        return tel
    }
    if (tel === '待完善') {
        return '待完善'
    }
    return tel.substring(0, startIndex) + '****' + tel.substring(endeIndex)
}
