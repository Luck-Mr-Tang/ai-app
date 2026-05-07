<template>
    <layout :backFun="backFun">
        <view class="audit-process">
            <ProcessSteps v-if="showStep" :step="step" space="200rpx" :step-list="stepList" :active-color="'#f24645'" />
        </view>
    </layout>
</template>
<script lang="ts">
export default {
    options: {
        addGlobalClass: true,
        styleIsolation: 'shared'
    }
}
</script>
<script lang="ts" setup>
import layout from '@/components/layout/index.vue'
import { computed, onMounted, ref } from 'vue'
import activeCircle from '@/package-register/static/active-circle.png'
import circle from '@/package-register/static/circle.png'
import ProcessSteps from '@/package-register/components/ProcessSteps.vue'
import { onLoad, onShow } from '@dcloudio/uni-app'

const showStep = ref(true)
const stepList = ref([
    {
        label: '提交成功',
        activeIconPath: activeCircle,
        inactiveIconPath: activeCircle
    },
    {
        label: '正在审核',
        activeIconPath: activeCircle,
        inactiveIconPath: circle
    },
    {
        label: '审核结果',
        activeIconPath: activeCircle,
        inactiveIconPath: circle
    }
])

const backFun = ref()
onLoad((options: any) => {
    let fromPage = options.fromPage
    if (fromPage === 'register') {
        backFun.value = goBack
    }
})
onShow(() => {})

onMounted(() => {})

const step = computed(() => {
    return 1
})

const goBack = () => {
    uni.navigateTo({
        url: `/pages/home/index`
    })
}
</script>

<style lang="scss" scoped>
.audit-process {
    background: #ffffff;
    min-height: 100vh;

    :deep(.process-step-box) {
        height: 210rpx;

        .wd-step__icon.is-icon {
            height: 26rpx !important;
            width: 26rpx !important;

            .step-icon {
                height: 26rpx !important;
                width: 26rpx !important;
            }
        }
    }

    .process-box {
        &-step {
            display: flex;
            flex-direction: column;
            align-items: center;

            .audit-img {
                height: 193rpx;
                width: 207rpx;
                margin-bottom: 35rpx;
                margin-top: 30rpx;
            }

            .audit-title {
                font-size: 40rpx;
                color: #000000;
                font-weight: bold;
            }

            .audit-desc {
                font-size: 30rpx;
                color: #666666;
                max-width: 523rpx;
                text-align: center;
                margin-top: 30rpx;

                .red {
                    color: #fd0000;
                }
            }

            .button-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 640rpx;
                height: 88rpx;
                background-color: #f24645;
                border-radius: 10rpx;
                font-size: 36rpx;
                color: #ffffff;
                margin-top: 110rpx;
            }

            .nopass-list {
                margin-top: 48rpx;
                width: 640rpx;
                padding: 36rpx 30rpx;
                background-color: #f6f6f6;
                font-size: 30rpx;
                border-radius: 10rpx;
                .title {
                    display: flex;
                    align-items: center;
                    color: #000000;
                    margin-bottom: 14rpx;
                    .red-img {
                        height: 36rpx;
                        width: 36rpx;
                        margin-right: 10rpx;
                    }
                }
                .nopass-item {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 36rpx;
                    .label {
                        color: #666666;
                    }
                    .nopass-string {
                        color: #ff0000;
                    }

                    .no-pass {
                        flex: 1;
                        text-align: right;
                        font-size: 30px;
                        word-wrap: break-word;
                        overflow: hidden;
                        margin-left: 8rpx;
                    }

                    :deep(.wd-tag) {
                        vertical-align: bottom;
                    }

                    :deep(.wd-tag__text) {
                        font-size: 30rpx;
                    }
                }
            }
        }
    }
    .mt40 {
        margin-top: 40rpx;
    }
}
</style>
