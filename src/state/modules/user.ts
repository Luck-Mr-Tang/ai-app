import { defineStore } from 'pinia'
import { getUserInfo } from '@/api/user'

interface AuthState {
    token?: string
    user: Record<string, any>
    userInfo: Record<string, any>
    openId?: string | null
    unionId?: string | null
    code?: string
}

export const useAuthStore = defineStore({
    id: 'auth',
    state: (): AuthState => ({
        token: undefined,
        user: {},
        userInfo: {},
        openId: '',
        unionId: '',
        code: ''
    }),
    getters: {
        isLogin(): boolean {
            return this.token !== undefined
        }
    },
    actions: {
        // 登录
        login(res) {
            this.token = res.loginCookieDto.authorization
            // this.token = res.token
            getUserInfo().then(res => (this.userInfo = res))
        },
        saveOpenId(data) {
            this.openId = data
        },
        saveCode(data) {
            this.code = data
        },
        saveUnionId(data) {
            this.unionId = data
        },
        logout() {
            this.token = undefined
            this.user = {}
            this.userInfo = {}
        }
    },
    // 本地持久化存储（带容错：遇到坏值自动清除，避免 JSON.parse 报错）
    persist: {
        storage: {
            getItem(key: string): string {
                try {
                    const v = uni.getStorageSync(key)
                    if (typeof v !== 'string' || !v || v === 'undefined' || v === 'null') {
                        return ''
                    }
                    JSON.parse(v) // 校验是合法 JSON
                    return v
                } catch {
                    try {
                        uni.removeStorageSync(key)
                    } catch {
                        /* noop */
                    }
                    return ''
                }
            },
            setItem(key: string, value: string) {
                if (value === undefined || value === null) return
                uni.setStorageSync(key, value)
            }
        }
    }
})
