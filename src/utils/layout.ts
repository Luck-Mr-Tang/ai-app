/**
 * @author zhouyankai
 * @description 这是公用的utils方法
 * @Date: 2022-07-31
 */

/**
 * 判断url是否是http或https
 * @param {string} path
 * @returns {Boolean}
 */
export function isHttp(url: string) {
    return url.indexOf('http://') !== -1 || url.indexOf('https://') !== -1
}

/**
 * 判断是否为空 空为true 不是空为false
 */
export function validatenull(val: null | undefined | string) {
    return (
        val === null ||
        val === undefined ||
        val === '' ||
        (Array.isArray(val) && val.length === 0) ||
        (typeof val === 'object' && Object.keys(val).length === 0)
    )
}

/**
 * 根据css写的rpx获取转换后渲染的px数值
 */
export function rpx2px_num(rpx: number) {
    const { windowWidth } = uni.getSystemInfoSync()
    const ratio = windowWidth / 375
    return (rpx / 2) * ratio
}
