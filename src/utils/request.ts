import Request from 'luch-request' //npm下载引入luch-request
import { getDomain } from '@/utils'
import { useAuthStore } from '@/state/modules/user'

const api = getDomain('portal')

// import qs from 'qs'
const http = new Request({
    baseURL: api, //设置请求的base url
    timeout: 30000, //超时时长30秒,
    header: {
        // 'Content-Type': 'multipart/form-data;application/json;charset=UTF-8;'
        'Content-Type': 'application/json'
    }
})

//请求拦截器
http.interceptors.request.use(
    config => {
        // 可使用async await 做异步操作
        const { token } = useAuthStore()
        if (token && !config.header?.noAuth) {
            if (!config.header) config.header = {}
            config.header['Authorization'] = token
        }

        if (config.method === 'POST') {
            config.data = JSON.stringify(config.data) as unknown as Record<string, any>
        }
        return config
    },
    error => {
        return Promise.resolve(error)
    }
)

// 响应拦截器
http.interceptors.response.use(
    response => {
        //未登录时清空缓存跳转
        console.log(response.config, '我才是response')
        if (response.data.code === '1002' || response.data.code === 401) {
            // uni.clearStorageSync()
            useAuthStore().logout()
            if (response.config.header?.noRedirect || response.config.header?.noAuth) {
                // console.log('不跳转登录页', response)
            } else {
                console.log('跳转了登录页', response)
                uni.redirectTo({
                    url: '/package-login/pages/login/index'
                })
            }
        }
        return response
    },
    error => {
        //未登录时清空缓存跳转
        if (error.statusCode == 401) {
            uni.clearStorageSync()
            uni.switchTab({
                url: '/pages/home/index.vue'
            })
        }

        const { errMsg } = error

        console.log(errMsg, '我才是error')

        uni.showToast({
            title: errMsg,
            duration: 2000
        })
        return Promise.resolve(error)
    }
)

export default http
