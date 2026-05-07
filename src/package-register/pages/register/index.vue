<template>
    <layout>
        <view class="register-container">
            <view class="register-container-header">
                <image class="register-container-header-image" :src="getImage('/image/header.png')" />
                <view class="register-container-header-text">欢迎加入app</view>
                <view class="register-container-header-tip">
                    <image class="tip-image" :src="getImage('/image/red-tip.png')" />
                    <text>注册信息请务必认真填写，避免因信息错误影响项目参与</text>
                </view>
            </view>
            <view class="register-container-type">请选择注册的账号类型:</view>
            <view class="register-container-card">
                <view v-for="(item, index) in registerTypeList" :key="index" class="register-container-card-item">
                    <view class="register-type" @click="selectRegisterType(item)">
                        <image :src="item.image" />
                        <view class="register-type-content">
                            <view class="register-type-title">{{ item.title }}</view>
                            <view class="register-type-sub-title">{{ item.subTitle }}</view>
                        </view>
                        <view class="right-icon">></view>
                    </view>
                </view>
            </view>
            <view class="register-container-footer-text">
                <view class="text">Copyright©2025 app版权所有</view>
                <view class="text">app备案号</view>
            </view>
            <image class="register-container-footer-bj" :src="getImage('/image/bj-bottom.png')" />
        </view>
        <wd-message-box />
    </layout>
</template>
<script setup lang="ts">
import layout from '@/components/layout/index.vue'
import CompanyImg from '../../static/icon-qy.png'
import PersonalImg from '../../static/icon-zr.png'
import { useMessage } from 'wot-design-uni'
import { useRouter } from 'uni-mini-router'
import { getImage } from '@/utils'
const message = useMessage()
interface RegisterType {
    image: string
    title: string
    subTitle: string
    type: string
}
const registerTypeList: RegisterType[] = [
    {
        image: getImage('/image/icon-qy.png'),
        title: '企业账号',
        subTitle: '以公司身份参与项目',
        type: 'company'
    },
    {
        image: PersonalImg,
        title: '自然人账号',
        subTitle: '以个人身份参与项目',
        type: 'personal'
    }
]

const router = useRouter()

const selectRegisterType = (item: RegisterType) => {
    if (item.type == 'company') {
        // 跳转企业注册
        router.push({
            path: '/package-enterprise/pages/register/index?type=purchaser'
        })
    } else {
        message
            .confirm({
                msg: '如果项目公告中未明确规定允许自然人身份参与，请您以企业身份注册，否则可能导致您无法参与项目或被否认投标，支付成功的标书款，平台服务费等费用不予退还！',
                title: '温馨提示',
                confirmButtonText: '确定注册自然人',
                cancelButtonText: '取消'
            })
            .then(() => {
                // 跳转自然人注册
                router.push({
                    path: '/package-enterprise/pages/register/index?type=natural'
                })
            })
            .catch(() => {
                // 点击取消
            })
    }
}
</script>

<style scoped lang="scss">
.register-container {
    height: 100%;
    position: relative;
    &-header {
        position: relative;
        color: #666666;
        font-size: 21rpx;
        width: 100%;
        height: 188rpx;
        padding: 49rpx 0 0 47rpx;
        box-sizing: border-box;
        &-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 99;
        }
        &-text {
            position: absolute;
            top: 49rpx;
            left: 47rpx;
            font-size: 34rpx;
            font-weight: 550;
            color: #171825;
            margin-bottom: 22rpx;
            z-index: 100;
        }

        &-tip {
            position: absolute;
            top: 115rpx;
            left: 47rpx;
            display: flex;
            align-items: center;
            color: #666666;
            z-index: 100;
        }

        .tip-image {
            height: 24rpx;
            width: 24rpx;
            margin-right: 8rpx;
        }
    }

    &-type {
        font-size: 28rpx;
        color: #171825;
        margin: 32rpx 0 36rpx 40rpx;
    }

    &-card {
        display: flex;
        flex-direction: column;
        padding: 0 30rpx 0 40rpx;
        gap: 36rpx;

        &-item {
            border: solid 1rpx #f23332;
            border-radius: 20rpx;

            image {
                height: 97rpx;
                width: 97rpx;
            }

            .register-type {
                display: flex;
                align-items: center;
                padding: 40rpx 27rpx 41rpx 37rpx;

                &-title {
                    font-size: 30rpx;
                    color: #171825;
                    margin-bottom: 12rpx;
                    font-weight: 550;
                }

                &-sub-title {
                    font-size: 26rpx;
                    color: #606266;
                }
            }

            .right-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 35rpx;
                width: 35rpx;
                font-size: 24rpx;
                border-radius: 50%;
                margin-left: auto;
                color: #fff;
                background-image: linear-gradient(-30deg, #e1251b 0%, #fd441f 100%), linear-gradient(#f24645, #f24645);
            }
        }
    }

    &-footer-text {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 72rpx;
        padding: 16rpx 0;
        font-size: 18rpx;
        color: #7d7d7d;
        z-index: 1;
        margin-bottom: env(safe-area-inset-bottom);

        .text {
            display: flex;
            justify-content: center;
        }
    }

    &-footer-bj {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 461rpx;
        z-index: -1;
    }
}
</style>
