import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// === 应用启动前的两道防线 ===
// 1. 全局 patch JSON.parse：遇到字面量 "undefined" 不抛错，返回 undefined
//    （处理 pinia-plugin-persistedstate 等三方库内部的 JSON.parse 调用）
const _origParse = JSON.parse
JSON.parse = function (text: string, reviver?: (this: any, key: string, value: any) => any): any {
    if (text === undefined || text === null) return text
    if (typeof text === 'string' && (text === 'undefined' || text === '')) {
        return undefined
    }
    try {
        return _origParse.call(JSON, text, reviver as any)
    } catch (err) {
        console.warn('[JSON.parse] failed, value:', text, err)
        return undefined
    }
} as typeof JSON.parse

// 2. 清理 localStorage 里的字面量坏值
try {
    const info = uni.getStorageInfoSync()
    ;(info?.keys || []).forEach(key => {
        try {
            const v = uni.getStorageSync(key)
            if (v === 'undefined' || v === 'null') {
                uni.removeStorageSync(key)
            }
        } catch {
            /* noop */
        }
    })
} catch {
    /* noop */
}

const store = createPinia()
store.use(piniaPluginPersistedstate)
export default store
