/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
    return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
    const valid_map = ['admin', 'editor']
    return valid_map.indexOf(str.trim()) >= 0
}
export const phoneNumber = /^1\d{10}$/

// 特殊字符/企业名称
export const specialStr = /^([\u4e00-\u9fff]|[A-Za-z0-9]|[.·,()（）& # \- / 、@ 《》]){2,50}$/
export const natureName = /^([\u4e00-\u9fff]|[A-Za-z0-9]|[.·\s,()（）& # \- / 、@ 《》]){2,25}$/
// 身份证号码 15或18位数字 最后一位可以是数字或者x
export const idNumber = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
// 密码
export const password = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@#$%^&+=_\-!?.()]{6,20}$/
// 统一社会信用代码
export const bussId = /^[0-9a-zA-Z]+$/
// 用户名
export const userName = /^([가-힣\s]|[\u4e00-\u9fa5]|[A-Za-z]|[.·\s,()（）& # \- / 、@ 《》]){2,30}$/
export const natureUserName = /^([\u4e00-\u9fa5]|[A-Za-z]|[.·\s,()（）& # \- / 、@ 《》]){2,30}$/
export const money = /(^([1-9][0-9]*)+(\.[0-9]*)?$)|(^0\.[0-9]*$)/
// 邮箱
export const email = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/
export const notOnlyNumber = /^(?!\d+$).*$/

// 字符串长度校验
export const lengthCheck = (value: string, min: number, max: number) => {
    const len = value.length
    if (len >= min && len <= max) {
        return Promise.resolve()
    } else {
        return Promise.reject(`长度在 ${min} 到 ${max} 个字符`)
    }
}
