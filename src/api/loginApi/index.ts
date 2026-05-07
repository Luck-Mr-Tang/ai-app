import { default as request } from '@/utils/request-util'

export const generateCaptcha = () => {
    return request.get('/login-api/logInVerify/generateCaptcha')
}
export const verifyCaptcha = (data: { id: string; code: string }) => {
    return request.post('/login-api/logInVerify/verifyCaptcha', data)
}
