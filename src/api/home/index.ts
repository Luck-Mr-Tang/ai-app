import { default as request } from '@/utils/request-util'

/**
 * 获取订阅内容列表
 * @returns
 */
export function getSubscribeList() {
    return request.get<{}, MergeNoticeList[]>(
        '/subscription-api/subscribe/getCountCompanyRecommendNotices2',
        {},
        { noRedirect: true }
    )
}
export function getSubscribeRules(data) {
    return request.post<{}, SubscribeRules>('/subscription-api/subscribe/getSubscribeRules', data, { noRedirect: true })
}

// 手机验证码登录-获取用户列表
export function messageLogInVerify(data: Login) {
    return request.post<Login, UserList>('/login-api/logInVerify/messageLogInVerify', data)
}
