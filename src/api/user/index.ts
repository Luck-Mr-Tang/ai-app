import { default as request } from '@/utils/request-util'

export const getOpenId = (data: { code: string }) => {
    return request.post('/login-api/logInVerify/messageLogInVerify', data)
}
export const getUserInfo = () => {
    return request.get('/login-api/logInVerify/getUserInfo')
}
