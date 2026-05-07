import { useAuthStore } from '@/state/modules/user'
import { getDomain } from '.'
import cryptoJs from 'crypto-js'

export const webApi = (data: any) => {
    const url = getDomain('bigdataapi') + ':38080/behaviorLog/recLogsOper/toProducer.do'
    for (const key in data) {
        if (!data[key] || data[key] === undefined || data[key] === 'null') {
            data[key] = ''
        }
    }

    const params = {
        append(key: string, value: any) {
            this[key] = value
        }
    }
    params.append('behaviorNumber', typeof data.behaviorNumber === 'undefined' ? '' : data.behaviorNumber)

    uni.request({
        url,
        method: 'POST',
        data: params,
        header: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    })
        .then(function (rsp) {
            console.log('producer success' + rsp + data.reserved1)
        })
        .catch(function (error) {
            console.log('producer send error' + error)
        })
}

export function encrypt(message, key = '5s4df5s3') {
    const keyHex = cryptoJs.enc.Utf8.parse(key)
    const iv = cryptoJs.enc.Utf8.parse(key)
    const option = { iv, mode: cryptoJs.mode.CBC, padding: cryptoJs.pad.Pkcs7 }
    const encrypted = cryptoJs.DES.encrypt(message, keyHex, option)
    return encrypted.ciphertext.toString() // 返回hex格式密文，如需返回base64格式：encrypted.toString()
}

export function behaviorLog(behaviorNumber: string, params: any) {
    if (!params) {
        throw new Error('params is required')
    }
    if (!behaviorNumber) {
        throw new Error('behaviorNumber is required')
    }
    const pages = getCurrentPages()
    const page = pages[pages.length - 1]
    let logData: any = {}
    logData.behaviorNumber = behaviorNumber
    logData.operateId = useAuthStore().userInfo?.userId?.toLowerCase()
    logData.operateName = useAuthStore().userInfo?.userName
    logData.comId = useAuthStore().userInfo?.companyId?.toLowerCase()
    logData.comName = useAuthStore().userInfo?.companyName
    logData.operateDate = new Date().getTime()
    logData.browserTitle = ''
    logData.visitUrl = page.route
    logData.actKey = '200'
    logData.ip = ''
    logData.plantform = 'MICRO'
    logData.statusCode = '200'
    // logData.userAgent = navigator.userAgent
    logData = Object.assign(logData, params)

    logData.operateId = encrypt(logData.operateId)
    logData.comId = encrypt(logData.comId)
    webApi(logData)
}
