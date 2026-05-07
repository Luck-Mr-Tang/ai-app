import { generateCaptcha, verifyCaptcha } from '@/api/loginApi'
import { parseTime } from '@/utils'
export default function (id: string, option: object) {
    const initOption = {
        ...{
            success: function () {},
            verifyMethod: null
        },
        ...option
    }
    const selector = '#' + id
    const el = document.querySelector(selector)
    let currentCaptchaId: any = null
    const init = function () {
        clearAllPreventDefault(el)
        refreshCaptcha()
    }
    setTimeout(() => {
        init()
    }, 0)
    el?.querySelector('#slider-move-btn')?.addEventListener('mousedown', down)
    el?.querySelector('#slider-move-btn')?.addEventListener('touchstart', down)

    el?.querySelector('#slider-close-btn')?.addEventListener('click', () => {})

    el?.querySelector('#slider-refresh-btn')?.addEventListener('click', () => {
        refreshCaptcha()
    })

    function valid(captchaConfig: any) {
        const data: any = {
            id: currentCaptchaId,
            captchaType: 2,
            imageCaptchaTrack: {
                bgImageWidth: captchaConfig.bgImageWidth,
                bgImageHeight: captchaConfig.bgImageHeight,
                sliderImageWidth: captchaConfig.sliderImageWidth,
                sliderImageHeight: captchaConfig.sliderImageHeight,
                startSlidingTime: parseTime(currentCaptchaConfig.startTime),
                endSlidingTime: parseTime(currentCaptchaConfig.stopTime),
                trackList: captchaConfig.trackArr
            }
        }

        if (typeof initOption.verifyMethod === 'function') {
            initOption.verifyMethod(data)
        } else {
            verifyCaptcha(data).then((data: object) => {
                if (data.pass == '1') {
                    typeof initOption.success === 'function' ? initOption.success() : console.log('验证成功')
                } else {
                    typeof initOption.error === 'function' ? initOption.error() : console.log('验证失败')
                }
                refreshCaptcha()
            })
        }
    }

    function refreshCaptcha() {
        generateCaptcha().then((data: any) => {
            reset()
            currentCaptchaId = data.id
            const bgImg = el.find('#bg-img')
            const sliderImg = el.find('#slider-img')
            bgImg.attr('src', data.moveBlockResDTO.backgroundImage)
            sliderImg.attr('src', data.moveBlockResDTO.templateImage)
            console.log(sliderImg, '71')
        })
    }

    function doDown() {
        if (el && el.querySelector('#slider-move-btn')) {
            el.querySelector('#slider-move-btn').style.backgroundPosition = '-5px 31.0092%'
        }
    }

    function doMove(currentCaptchaConfig: any) {
        const moveX = currentCaptchaConfig.moveX
        el.find('#slider-move-btn').css('transform', 'translate(' + moveX + 'px, 0px)')
        el.find('#slider-img-div').css('transform', 'translate(' + moveX + 'px, 0px)')
    }
    function reset() {
        el.find('#slider-move-btn').css('background-position', '-5px 11.79625%')
        el.find('#slider-move-btn').css('transform', 'translate(0px, 0px)')
        el.find('#slider-img-div').css('transform', 'translate(0px, 0px)')
        currentCaptchaId = null
    }

    let currentCaptchaConfig: any
    /** 是否打印日志 */
    const isPrintLog = false

    function clearPreventDefault(event) {
        if (event.preventDefault) {
            event.preventDefault()
        }
    }

    function clearAllPreventDefault($div) {
        $div.each(function (index, el) {
            el.addEventListener('touchmove', clearPreventDefault, false)
        })
    }

    function reductionAllPreventDefault($div) {
        $div.each(function (index, el) {
            el.removeEventListener('touchmove', clearPreventDefault)
        })
    }

    function printLog(...params) {
        if (isPrintLog) {
            console.log(JSON.stringify(params))
        }
    }

    function initConfig(bgImageWidth, bgImageHeight, sliderImageWidth, sliderImageHeight, end) {
        currentCaptchaConfig = {
            startTime: new Date(),
            trackArr: [],
            movePercent: 0,
            bgImageWidth,
            bgImageHeight,
            sliderImageWidth,
            sliderImageHeight,
            end
        }
        printLog('init', currentCaptchaConfig)
        return currentCaptchaConfig
    }

    function down(event) {
        initConfig(260, 159, 53, 159, 206)

        const targetTouches = event.originalEvent ? event.originalEvent.targetTouches : event.targetTouches
        let startX = event.pageX
        let startY = event.pageY
        if (startX === undefined) {
            startX = Math.round(targetTouches[0].pageX)
            startY = Math.round(targetTouches[0].pageY)
        }
        currentCaptchaConfig.startX = startX
        currentCaptchaConfig.startY = startY

        const pageX = currentCaptchaConfig.startX
        const pageY = currentCaptchaConfig.startY
        const startTime = currentCaptchaConfig.startTime
        const trackArr = currentCaptchaConfig.trackArr
        trackArr.push({
            x: pageX - startX,
            y: pageY - startY,
            type: 'down',
            t: new Date().getTime() - startTime.getTime()
        })
        printLog('start', startX, startY)
        // pc
        window.addEventListener('mousemove', move)
        window.addEventListener('mouseup', up)
        // 手机端
        window.addEventListener('touchmove', move, false)
        window.addEventListener('touchend', up, false)
        doDown(currentCaptchaConfig)
    }

    function move(event) {
        if (window.TouchEvent && event instanceof TouchEvent) {
            event = event.touches[0]
        }
        const pageX = Math.round(event.pageX)
        const pageY = Math.round(event.pageY)
        const startX = currentCaptchaConfig.startX
        const startY = currentCaptchaConfig.startY
        const startTime = currentCaptchaConfig.startTime
        const end = currentCaptchaConfig.end
        const bgImageWidth = currentCaptchaConfig.bgImageWidth
        const trackArr = currentCaptchaConfig.trackArr
        let moveX = pageX - startX
        const track = {
            x: pageX - startX,
            y: pageY - startY,
            type: 'move',
            t: new Date().getTime() - startTime.getTime()
        }
        trackArr.push(track)
        if (moveX < 0) {
            moveX = 0
        } else if (moveX > end) {
            moveX = end
        }
        currentCaptchaConfig.moveX = moveX
        currentCaptchaConfig.movePercent = moveX / bgImageWidth
        doMove(currentCaptchaConfig)
        printLog('move', track)
    }

    function up(event) {
        window.removeEventListener('mousemove', move)
        window.removeEventListener('mouseup', up)
        window.removeEventListener('touchmove', move)
        window.removeEventListener('touchend', up)
        if (window.TouchEvent && event instanceof TouchEvent) {
            event = event.changedTouches[0]
        }
        currentCaptchaConfig.stopTime = new Date()
        const pageX = Math.round(event.pageX)
        const pageY = Math.round(event.pageY)
        const startX = currentCaptchaConfig.startX
        const startY = currentCaptchaConfig.startY
        const startTime = currentCaptchaConfig.startTime
        const trackArr = currentCaptchaConfig.trackArr

        const track = {
            x: pageX - startX,
            y: pageY - startY,
            type: 'up',
            t: new Date().getTime() - startTime.getTime()
        }

        trackArr.push(track)
        printLog('up', track)
        valid(currentCaptchaConfig)
    }
}
