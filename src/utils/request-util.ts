import request from '@/utils/request'
import { getDomain } from '.'
export default class RequestUtil {
    // 用于区分路径分组
    static baseUrl: string = getDomain('portal')
    /**
     * get请求
     */
    static async get<P, R = null>(url: string, params?: P, config?: any) {
        if (params === undefined) {
            params = <P>{}
        }
        const _config = config || {}
        console.log('_config', _config)
        // url拼接查询参数
        const result = await request.get<ResponseData<R>>(url, {
            baseURL: this.baseUrl,
            params: params as Record<string, any>,
            header: {
                ..._config
            }
        })
        return result.data
    }

    /**
     * get请求并获取数据
     */
    static async getAndLoadData<P, R = null>(url: string, params?: P) {
        const result = await this.get<P | undefined, R>(url, params)
        return result.data
    }

    /**
     * post请求
     */
    static async post<D, R = null>(url: string, params: D, config?: any) {
        if (params === undefined) {
            params = <D>{}
        }
        const _config = config || {}
        console.log('_config', _config)

        const result = await request.post<ResponseData<R>>(url, params as Record<string, any>, {
            baseURL: this.baseUrl,
            header: {
                ..._config
            }
        })
        return result.data
    }

    /**
     * post请求并获取数据
     */
    static async postAndLoadData<D, R = null>(url: string, params: D) {
        const result = await this.post<D, R>(url, params)
        return result.data
    }
}

export class WWWRequest extends RequestUtil {
    static baseUrl: string = getDomain('www')
}
export class mobilecaRequest extends RequestUtil {
    static getBaseUrl = () => {
        const platform = process.env.UNI_PLATFORM as string
        let domain = 'https://mobileca.youzhicai.com'
        if (platform === 'mp-weixin') {
            const accountInfo = wx.getAccountInfoSync
            if (accountInfo.envVersion === 'release') {
                domain = 'https://mobileca.youzhicai.com'
            } else {
                domain = 'https://mobileca.uzhicai.com'
            }
        }
        if (platform === 'web' || platform === 'h5') {
            const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:[^:\\/\n]+\.)?((?:[a-z0-9-]+\.)+[a-z]{2,})/
            const match = location.href.match(regex)
            domain = 'https://mobileca.' + match?.[1] || 'ukzhicai.com'
        }
        return domain
    }

    static baseUrl: string = this.getBaseUrl()
}

export class MRequest extends RequestUtil {
    static baseUrl: string = getDomain('m')
}
