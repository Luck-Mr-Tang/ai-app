// AI 后端 API 客户端
// 后端运行在 http://localhost:8000，详见 server/README.md
// 鉴权用 X-User-Id（MVP 简化）。登录信息存 storage。

const BASE =
    (import.meta as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ||
    'http://localhost:8000'
const USER_KEY = 'ai_user'
const LOGIN_PAGE = '/package-ai/pages/login/index'

export interface AIUser {
    id: number
    username: string
    avatar: string
    role: 'super' | 'user'
    status: 'pending' | 'approved' | 'rejected' | 'disabled'
}

export interface AdminUser {
    id: number
    username: string
    phone: string
    avatar: string
    role: 'super' | 'user'
    status: 'pending' | 'approved' | 'rejected' | 'disabled'
    is_protected: number
    created_at: string
}

export interface AICharacter {
    id: number
    name: string
    avatar: string
    tagline: string
    persona: string
    is_builtin: number
}

export interface ChatMessage {
    id: number
    role: 'user' | 'assistant'
    content: string
    created_at: string
}

export interface MomentItem {
    id: number
    content: string
    image_url: string
    created_at: string
    character: AICharacter
    like_count: number
    comment_count: number
    liked_by_me: boolean
}

export interface CommentItem {
    id: number
    content: string
    created_at: string
    user: { id: number; username: string; avatar: string }
}

export function getCachedUser(): AIUser | null {
    try {
        const raw = uni.getStorageSync(USER_KEY)
        if (!raw || raw === 'undefined' || raw === 'null' || typeof raw !== 'string') {
            return null
        }
        const parsed = JSON.parse(raw)
        if (!parsed || typeof parsed !== 'object' || !parsed.id) {
            uni.removeStorageSync(USER_KEY)
            return null
        }
        // 旧版本缓存缺少 role/status 字段 → 视为失效
        if (!parsed.role || !parsed.status) {
            uni.removeStorageSync(USER_KEY)
            return null
        }
        return parsed as AIUser
    } catch {
        uni.removeStorageSync(USER_KEY)
        return null
    }
}

function setCachedUser(u: AIUser) {
    if (!u || !u.id) return
    uni.setStorageSync(USER_KEY, JSON.stringify(u))
}

export function clearUser() {
    uni.removeStorageSync(USER_KEY)
}

interface Envelope<T> {
    code: number
    success: boolean
    data: T | null
    msg: string
}

export const NOT_LOGGED_IN = 'NOT_LOGGED_IN'

const DEFAULT_ERR_MSG = '请求失败，请稍后重试'
const MAX_TOAST_MSG = 20

function pickErrMsg(msg: string | undefined | null): string {
    if (!msg) return DEFAULT_ERR_MSG
    return msg.length <= MAX_TOAST_MSG ? msg : DEFAULT_ERR_MSG
}

function showTopToast(title: string) {
    uni.$emit('top-toast', title)
}

const PUBLIC_PATTERNS: Array<(method: string, path: string) => boolean> = [
    (_, p) => p.startsWith('/api/health'),
    (m, p) => m === 'POST' && p === '/api/auth/login',
    (m, p) => m === 'POST' && p === '/api/auth/register'
]

function isPublic(method: string, path: string): boolean {
    return PUBLIC_PATTERNS.some(fn => fn(method, path))
}

let redirectingToLogin = false

function redirectToLogin() {
    if (redirectingToLogin) return
    const pages = (typeof getCurrentPages === 'function' ? getCurrentPages() : []) as Array<{ route?: string }>
    const top = pages[pages.length - 1]
    if (top?.route && LOGIN_PAGE.includes(top.route)) return
    redirectingToLogin = true
    clearUser()
    uni.reLaunch({
        url: LOGIN_PAGE,
        complete: () => {
            redirectingToLogin = false
        }
    })
}

function call<T = unknown>(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    data?: Record<string, unknown>,
    opts?: { silent?: boolean }
): Promise<T> {
    if (!isPublic(method, path) && !getCachedUser()) {
        redirectToLogin()
        return Promise.reject(new Error(NOT_LOGGED_IN))
    }

    return new Promise((resolve, reject) => {
        const user = getCachedUser()
        const header: Record<string, string> = { 'Content-Type': 'application/json' }
        if (user) header['X-User-Id'] = String(user.id)
        uni.request({
            url: `${BASE}${path}`,
            method,
            data,
            header,
            success: res => {
                const env = res.data as Envelope<T>
                if (env && typeof env === 'object' && 'success' in env) {
                    if (env.success) {
                        resolve(env.data as T)
                    } else {
                        const rawMsg = env.msg || ''
                        if (!opts?.silent) {
                            showTopToast(pickErrMsg(rawMsg))
                        }
                        if (env.code === 401) redirectToLogin()
                        reject(new Error(rawMsg || `HTTP ${env.code}`))
                    }
                    return
                }
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.data as T)
                } else {
                    if (!opts?.silent) {
                        showTopToast(DEFAULT_ERR_MSG)
                    }
                    if (res.statusCode === 401) redirectToLogin()
                    reject(new Error(`HTTP ${res.statusCode}`))
                }
            },
            fail: err => {
                if (!opts?.silent) {
                    showTopToast(DEFAULT_ERR_MSG)
                }
                reject(err)
            }
        })
    })
}

export interface AIHealth {
    ok: boolean
    model?: string
    latency_ms?: number
    sample?: string
    reason?: string
}

export const checkAIHealth = () => call<AIHealth>('GET', '/api/health/ai')

export async function login(username: string, password: string): Promise<AIUser> {
    const u = await call<AIUser>('POST', '/api/auth/login', { username, password })
    setCachedUser(u)
    return u
}

export const register = (username: string, phone: string, password: string) =>
    call<AIUser>('POST', '/api/auth/register', { username, phone, password })

export const me = () => call<AIUser>('GET', '/api/auth/me')

export const listCharacters = () => call<AICharacter[]>('GET', '/api/characters')
export const getCharacter = (id: number) => call<AICharacter>('GET', `/api/characters/${id}`)
export const createCharacter = (data: Omit<AICharacter, 'id' | 'is_builtin'>) =>
    call<AICharacter>('POST', '/api/characters', data)

export const chatHistory = (cid: number) =>
    call<ChatMessage[]>('GET', `/api/chat/${cid}/history`)
export const sendChat = (cid: number, content: string) =>
    call<ChatMessage[]>('POST', `/api/chat/${cid}`, { content })

export const listMoments = (limit = 20) =>
    call<MomentItem[]>('GET', `/api/moments?limit=${limit}`)
export const generateMoment = (character_id: number, topic = '') =>
    call<MomentItem>('POST', '/api/moments/generate', { character_id, topic })
export const toggleLike = (moment_id: number) =>
    call<{ liked: boolean }>('POST', `/api/moments/${moment_id}/like`)
export const listComments = (moment_id: number) =>
    call<CommentItem[]>('GET', `/api/moments/${moment_id}/comments`)
export const addComment = (moment_id: number, content: string) =>
    call<CommentItem>('POST', `/api/moments/${moment_id}/comments`, { content })

// 超管接口
export const adminListUsers = (status?: string) =>
    call<AdminUser[]>('GET', `/api/admin/users${status ? `?status_filter=${status}` : ''}`)
export const adminApproveUser = (uid: number) =>
    call<AdminUser>('POST', `/api/admin/users/${uid}/approve`)
export const adminRejectUser = (uid: number) =>
    call<AdminUser>('POST', `/api/admin/users/${uid}/reject`)
export const adminDeleteUser = (uid: number) =>
    call<{ deleted: number }>('DELETE', `/api/admin/users/${uid}`)
