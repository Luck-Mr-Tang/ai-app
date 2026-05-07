// AI 后端 API 客户端
// 后端运行在 http://localhost:8000，详见 server/README.md
// 鉴权用 X-User-Id（MVP 简化）。登录信息存 storage。

// 优先用 Vite 注入的环境变量，本地开发回落到 localhost
const BASE =
    (import.meta as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ||
    'http://localhost:8000'
const USER_KEY = 'ai_user'

export interface AIUser {
    id: number
    username: string
    avatar: string
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

// 白名单：未登录也能访问的接口
const PUBLIC_PATTERNS: Array<(method: string, path: string) => boolean> = [
    (_, p) => p.startsWith('/api/health'),
    (_, p) => p === '/api/auth/users',
    (m, p) => m === 'POST' && p === '/api/auth/register-or-login',
    (m, p) => m === 'GET' && p === '/api/characters',
    (m, p) => m === 'GET' && /^\/api\/characters\/\d+$/.test(p)
]

function isPublic(method: string, path: string): boolean {
    return PUBLIC_PATTERNS.some(fn => fn(method, path))
}

function call<T = unknown>(
    method: 'GET' | 'POST',
    path: string,
    data?: Record<string, unknown>,
    opts?: { silent?: boolean }
): Promise<T> {
    // 拦截器：未登录拒绝调用需鉴权的接口
    if (!isPublic(method, path) && !getCachedUser()) {
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
                        if (!opts?.silent) uni.showToast({ title: env.msg || `HTTP ${env.code}`, icon: 'none' })
                        reject(new Error(env.msg || `HTTP ${env.code}`))
                    }
                    return
                }
                // 兼容老格式（万一）
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.data as T)
                } else {
                    const msg = `HTTP ${res.statusCode}`
                    if (!opts?.silent) uni.showToast({ title: msg, icon: 'none' })
                    reject(new Error(msg))
                }
            },
            fail: err => {
                if (!opts?.silent) uni.showToast({ title: '网络错误：' + (err.errMsg || ''), icon: 'none' })
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

export const listUsers = () => call<AIUser[]>('GET', '/api/auth/users', undefined, { silent: true })

export async function login(username: string): Promise<AIUser> {
    const u = await call<AIUser>('POST', '/api/auth/register-or-login', { username })
    setCachedUser(u)
    return u
}

export function loginAs(u: AIUser): AIUser {
    if (!u || !u.id) throw new Error('invalid user')
    uni.setStorageSync(USER_KEY, JSON.stringify(u))
    return u
}

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
