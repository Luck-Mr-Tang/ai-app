<template>
    <commonDialog v-model="show" :width="580" :height="820" :bgImg="bgImg">
        <view class="guide-popup">
            <view class="title">尊敬的用户，您好！</view>
            <view class="tip">
                <span>您当前可查看近一年的项目公告， 如需查看往期公告，请</span>
                <span class="update">升级为投标通会员。</span>
            </view>
            <view class="power">
                <view class="normal">
                    <view class="top">普通用户</view>
                    <view class="bottom">
                        <span class="time">近一年</span>
                        <span>项目公告</span>
                    </view>
                </view>
                <view class="vip">
                    <view class="top">投标通会员</view>
                    <view class="bottom">
                        <span class="time">往期全部</span>
                        <span>项目公告</span>
                    </view>
                </view>
            </view>
            <view class="open" @click="openBid">立即开通</view>
            <view class="call">
                <img class="phone-icon" src="@/package-program/static/phone.png" alt="" />
                <span>咨询热线：</span>
                <span class="phone" @click="call">{{ phoneNumber }}</span>
            </view>
        </view>
    </commonDialog>
</template>
<script lang="ts" setup>
import commonDialog from '@/components/commonDialog/index.vue'
import bgImg from '@/package-program/static/guide.png'
import { computed, ref } from 'vue'
import { getDomain } from '@/utils'
const props = defineProps({
    info: {
        type: Object,
        default: () => {
            return {}
        }
    }
})
const show = ref(false)
const open = () => {
    show.value = true
}
defineExpose({ open })
const phoneNumber = computed(() => {
    if (props.info.subjectType !== '8') {
        return props.info.saleTel
    }
    return '400-0099-555'
})
const emits = defineEmits(['close'])
const cancel = () => {
    show.value = false
    emits('close')
}
const openBid = () => {
    // 立即开通
    uni.navigateTo({
        url: '/package-webview/pages/webview/index?url=' + getDomain('m') + '/suborder/SelectMember0406'
    })
}
const call = () => {
    // 拉起电话
    uni.makePhoneCall({
        phoneNumber: phoneNumber.value
    })
}
</script>
<style lang="scss" scoped>
.guide-popup {
    padding: 221px 16px 0;
    .title {
        font-family: PingFang-SC-Heavy;
        font-size: 36px;
        font-weight: bold;
        color: #171825;
    }
    .tip {
        margin-top: 12px;
        font-family: PingFang-SC-Medium;
        font-size: 32px;
        color: #666666;
        .update {
            font-weight: bold;
            color: #333333;
        }
    }
    .power {
        margin-top: 12px;
        display: flex;
        text-align: center;
        .normal {
            padding: 54px 8px 0;
            .top {
                font-family: PingFang-SC-Medium;
                font-size: 24px;
                color: #666666;
            }
            .bottom {
                margin-top: 6px;
                font-size: 28px;
                color: #666666;
                .time {
                    font-family: PingFang-SC-Heavy;
                }
            }
        }
        .vip {
            padding: 30px 0 0 30px;
            .top {
                font-family: PingFang-SC-Heavy;
                font-size: 28px;
                font-weight: bold;
                color: #333333;
            }
            .bottom {
                margin-top: 6px;
                font-family: PingFang-SC-Heavy;
                font-size: 30px;
                font-weight: bold;
                color: #171825;
                .time {
                    color: #e1251b;
                }
            }
        }
    }
    .open {
        margin: 65px auto 38px;
        width: 500px;
        height: 88px;
        line-height: 88px;
        text-align: center;
        background-image: linear-gradient(90deg, #ffd69e 0%, #e5a149 100%), linear-gradient(#ed3736, #ed3736);
        background-blend-mode: normal, normal;
        border-radius: 44px;
        font-family: PingFang-SC-Medium;
        font-size: 36px;
        color: #713100;
    }
    .call {
        display: flex;
        align-items: center;
        padding-left: 100px;
        font-size: 24px;
        font-weight: bold;
        color: #333333;
        line-height: 1;
        .phone-icon {
            width: 33px;
            height: 27px;
            margin-right: 6px;
        }
        .phone {
            font-size: 30px;
            font-weight: bold;
            color: #de9c45;
        }
    }
}
</style>
