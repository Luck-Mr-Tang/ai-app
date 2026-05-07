<template>
    <div :id="id" class="px-slider" ref="el" @touchmove="clearPreventDefault">
        <div class="px-bottom">
            <div class="px-slider-move-title">完成拼图验证</div>

            <div id="slider-refresh-btn" class="px-slider-refresh-btn" @click="refreshCaptcha">
                <div class="refresh-btn"></div>
                换一个
            </div>
        </div>
        <div class="content">
            <div class="bg-img-div">
                <image id="bg-img" class="bg-img" :src="bgImgSrc" />
            </div>
            <div class="px-slider-img-div" id="slider-img-div">
                <image
                    id="slider-img"
                    class="slider-img"
                    :src="sliderImgSrc"
                    :style="{
                        transform: sliderMoveBtnTransform
                    }"
                />
            </div>
        </div>
        <div class="px-slider-move">
            <div class="px-slider-move-track">向右滑动滑块填充拼图</div>
            <div
                class="px-slider-move-btn"
                id="slider-move-btn"
                @mousedown.stop="down"
                @mousemove.stop="move"
                @mouseout.stop="up"
                @touchstart.stop="down"
                @touchmove.stop="move"
                @touchend.stop="up"
                :style="{
                    transform: sliderMoveBtnTransform,
                    backgroundPosition: backgroundPosition
                }"
                ref="sliderMoveBtn"
            ></div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { generateCaptcha, verifyCaptcha } from '@/api/loginApi'
import { parseTime } from '@/utils'
const sliderMoveBtn = ref()
const props = defineProps({
    id: {
        type: String,
        default: 'px-slider'
    },
    // 外部校验
    businessVerfy: {
        type: Boolean,
        default: false
    }
})
const initOption = {
    ...{
        success() {
            emit('success')
        },
        error() {
            emit('error')
            uni.showToast({
                title: '校验失败',
                icon: 'none'
            })
        },
        verifyMethod: props.businessVerfy ? (data: object) => emit('verfy', data) : null
    }
}
const el = ref()
let currentCaptchaId: any = null
const init = function () {
    refreshCaptcha()
}
init()

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
        verifyCaptcha(data).then(({ data }: { data: any }) => {
            if (data.pass == '1') {
                typeof initOption.success === 'function' ? initOption.success() : console.log('验证成功')
            } else {
                typeof initOption.error === 'function' ? initOption.error() : console.log('验证失败')
            }
            refreshCaptcha()
        })
    }
}
const bgImgSrc = ref('')
const sliderImgSrc = ref('')
function refreshCaptcha() {
    generateCaptcha().then(({ data }: { data: any }) => {
        console.log(data, '67')
        reset()
        currentCaptchaId = data.id
        bgImgSrc.value = data.moveBlockResDTO.backgroundImage
        sliderImgSrc.value = data.moveBlockResDTO.templateImage
        console.log(sliderImgSrc.value, '71')
    })
}
const backgroundPosition = ref('')
function doDown() {
    backgroundPosition.value = '-5px 31.0092%'
}
const sliderMoveBtnTransform = ref('translate(0px, 0px)')
function doMove(currentCaptchaConfig: any) {
    const moveX = currentCaptchaConfig.moveX
    sliderMoveBtnTransform.value = 'translate(' + moveX + 'px, 0px)'
}
function reset() {
    backgroundPosition.value = '-5px 11.79625%'
    sliderMoveBtnTransform.value = 'translate(0px, 0px)'
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

// function clearAllPreventDefault($div) {
//     $div.each(function (index, el) {
//         el.addEventListener('touchmove', clearPreventDefault, false)
//     })
// }

// function reductionAllPreventDefault($div) {
//     $div.each(function (index, el) {
//         el.removeEventListener('touchmove', clearPreventDefault)
//     })
// }

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
    initConfig(260, 159, 43, 159, 206)

    const targetTouches = event.originalEvent ? event.originalEvent.targetTouches : event.touches
    let startX = event.pageX
    let startY = event.pageY
    console.log(event)

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
    doDown()
}

function move(event) {
    const targetTouches = event.originalEvent ? event.originalEvent.targetTouches : event.touches
    let pageX = event.pageX
    let pageY = event.pageY
    console.log(event)

    if (pageX === undefined) {
        pageX = Math.round(targetTouches[0].pageX)
        pageY = Math.round(targetTouches[0].pageY)
    }

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
    // const targetTouches = event.originalEvent ? event.originalEvent.targetTouches : event.touches
    // let pageX = event.pageX
    // let pageY = event.pageY
    // console.log(event)

    // if (pageX === undefined) {
    //     pageX = Math.round(targetTouches[0].pageX)
    //     pageY = Math.round(targetTouches[0].pageY)
    // }
    currentCaptchaConfig.stopTime = new Date()
    // const startX = currentCaptchaConfig.startX
    // const startY = currentCaptchaConfig.startY
    // const startTime = currentCaptchaConfig.startTime
    // const trackArr = currentCaptchaConfig.trackArr

    // const track = {
    //     x: pageX - startX,
    //     y: pageY - startY,
    //     type: 'up',
    //     t: new Date().getTime() - startTime.getTime()
    // }

    // trackArr.push(track)
    // printLog('up', track)
    valid(currentCaptchaConfig)
}

const emit = defineEmits(['success', 'error', 'verfy'])
</script>
<style scoped>
.px-slider {
    margin: auto;
    background-color: #fff;
    width: 284px;
    padding: 12px;
    z-index: 999;
    box-sizing: border-box;
    border-radius: 6px;
}

.px-slider .content {
    width: 260px;
    height: 159px;
    position: relative;
}

.bg-img-div {
    width: 100%;
    height: 100%;
    position: absolute;
    transform: translate(0px, 0px);
}

.px-slider-img-div {
    height: 100%;
    width: 53px;
    position: absolute;
    transform: translate(0px, 0px);
}

.bg-img-div .bg-img {
    width: 100%;
    height: 100%;
}

.px-slider-img-div .slider-img {
    height: 100%;
    width: 53px;
}

.px-slider .px-slider-move {
    height: 42px;
    width: 100%;
    margin: 11px 0 0;
    position: relative;
}
.px-slider-refresh-btn {
    color: #2d8ff7;
    float: right;
    cursor: pointer;
    font-size: 14px;
}
.px-slider-move-title {
    color: #88949d;
    font-size: 14px;
    display: inline-block;
    line-height: 22px;
    padding-bottom: 4px;
    vertical-align: bottom;
}
.px-slider .px-bottom {
    width: 100%;
    width: 260px;
    line-height: 26px;
}

.refresh-btn,
.close-btn,
.px-slider-move-track,
.px-slider-move-btn {
    background: url('https://cdn.youzhicai.com/yzc-mini/static/images/sprite-dragV.png') no-repeat;
}

.refresh-btn,
.close-btn {
    display: inline-block;
}

.px-slider-move .px-slider-move-track {
    line-height: 38px;
    font-size: 14px;
    text-align: center;
    white-space: nowrap;
    color: #88949d;
    -moz-user-select: none;
    -webkit-user-select: none;
    user-select: none;
}

.px-slider {
    user-select: none;
}

.px-slider-move .px-slider-move-btn {
    transform: translate(0px, 0px);
    background-position: -5px 11.79625%;
    position: absolute;
    top: -12px;
    left: 0;
    width: 66px;
    height: 66px;
}

.px-slider-move-btn:hover,
.close-btn:hover,
.refresh-btn:hover {
    cursor: pointer;
}

.px-bottom .close-btn {
    width: 20px;
    height: 20px;
    background-position: 0 44.86874%;
}

.px-bottom .refresh-btn {
    width: 20px;
    height: 20px;
    background-position: -34px -366px;
    vertical-align: sub;
}
</style>
