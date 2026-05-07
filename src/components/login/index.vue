<template>
    <div class="login-box" @click="closeOutside">
        <div class="header">
            <image src="https://cdn.youzhicai.com/yzc-mini/static/images/logo.png" alt="" class="logo" />
        </div>
        <div class="form">
            <template v-if="type === 1">
                <wd-form ref="formOneRef" :model="formOne">
                    <div class="form-item">
                        <wd-input
                            v-model="formOne.account"
                            prop="account"
                            placeholder="请输入用户名/手机号"
                            required
                            :rules="[{ required: true, message: '请输入用户名/手机号' }]"
                        />
                    </div>
                    <div class="form-item">
                        <wd-input
                            v-model="formOne.password"
                            :show-password="passwordType === 'password'"
                            required
                            prop="password"
                            :rules="[{ required: true, message: '请输入登录密码' }]"
                            placeholder="请输入登录密码"
                        ></wd-input>
                    </div>
                </wd-form>
                <div class="find-password" @click="jumpFindPwd">忘记密码</div>
            </template>
            <template v-if="type === 3">
                <wd-form ref="formTwoRef" :model="formTwo">
                    <div class="form-item">
                        <wd-input
                            v-model="formTwo.phoneNumber"
                            prop="phoneNumber"
                            placeholder="请输入手机号"
                            required
                            :rules="[
                                { required: true, message: '请输入手机号' },
                                { required: true, pattern: phoneNumber, message: '请输入十一位手机号码' }
                            ]"
                        />
                    </div>
                    <div class="form-item">
                        <wd-input
                            id="verficationCode"
                            v-model="formTwo.password"
                            prop="password"
                            :rules="[{ required: true, message: '请输入短信验证码' }]"
                            placeholder="请输入短信验证码"
                            style="padding-right: 0"
                        >
                            <template #suffix>
                                <wd-button
                                    class="code-button"
                                    style="width: 1.82rem"
                                    v-if="timerShow"
                                    type="text"
                                    :disabled="true"
                                >
                                    {{ time }} s
                                </wd-button>
                                <wd-popover v-model="showPopover" class="px-login-drag-popover" use-content-slot v-else>
                                    <template #content>
                                        <DragVerfication
                                            @success="
                                                () => {
                                                    getSmsCode()
                                                    showPopover = false
                                                }
                                            "
                                        ></DragVerfication>
                                    </template>
                                    <wd-button custom-class="code-button" type="text" :disabled="ban">
                                        获取验证码
                                    </wd-button>
                                </wd-popover>
                            </template>
                        </wd-input>
                    </div>
                </wd-form>
            </template>

            <div class="button-box" v-if="(type === 1 && !formOne.account) || (type === 3 && !formTwo.phoneNumber)">
                <wd-button size="large" block @click="validateForm" :disabled="true">登录</wd-button>
            </div>
            <wd-popover v-model="showLoginPopover" use-content-slot placement="top" v-else>
                <template #content>
                    <DragVerfication
                        id="login"
                        :business-verfy="true"
                        @verfy="login"
                        v-if="showLoginPopover"
                    ></DragVerfication>
                </template>
                <div class="button-box">
                    <wd-button
                        size="large"
                        block
                        @click="validateForm"
                        :disabled="
                            (type === 1 && !formOne.account) || (type === 3 && !formTwo.phoneNumber) || showLoginPopover
                        "
                    >
                        登录
                    </wd-button>
                </div>
            </wd-popover>
            <div class="register-box" @click="jumpRegister">注册账号</div>
        </div>
        <div class="footer">
            <div class="other-way">
                <div class="line van-hairline--top"></div>
                <span class="text">其他登录方式</span>
                <div class="line van-hairline--top"></div>
            </div>
            <div class="way-list">
                <!-- <div class="way-item">
        <image src="@/static/image/weixin.png" alt="" srcset="" />
        <div class="way-name">微信授权登录</div>
      </div> -->
                <div class="way-item" v-if="type === 1" @click="type = 3">
                    <image src="@/static/image/phoneCode.png" class="img" alt="" srcset="" />
                    <div class="way-name">手机验证码登录</div>
                </div>
                <div class="way-item" v-if="type === 3" @click="type = 1">
                    <image src="@/static/image/password.png" class="img" alt="" srcset="" />
                    <div class="way-name">账号密码登录</div>
                </div>
            </div>
        </div>
        <wd-action-sheet v-model="visible" title="请选择登录账号">
            <div class="company-list">
                <div
                    v-for="(item, index) in companyList"
                    :key="index"
                    class="company-item"
                    @click="selectCompany(item)"
                >
                    <image src="@/static/image/company-icon.png" class="company-icon" alt="" />
                    <div class="company-name">
                        <i style="color: #fa3130" v-if="Number(item.status) === 1">（禁用）</i>
                        {{ item.name + '(' + item.subName + ')' }}
                    </div>
                    <wd-checkbox v-model="item.checked" style="float: right"></wd-checkbox>
                </div>
            </div>
            <div style="text-align: center">
                <wd-button @click="confirmLogin" block custom-class="custom-radius">确认登录</wd-button>
            </div>
        </wd-action-sheet>
    </div>
</template>
<script lang="ts">
export default {
    options: { styleIsolation: 'shared', virtualHost: true }
}
</script>
<script setup lang="ts">
import { ref } from 'vue'
import DragVerfication from '@/components/dragVerfication.vue'
import { phoneNumber, password } from '@/utils/pattern'
import { useQueue } from 'wot-design-uni'
import { useAuthStore } from '@/state/modules/user'
import { isWebinWeapp } from '@/utils'
import { authrizePush } from '@/utils/subscribeMessage'

const { closeOutside } = useQueue()
const Toast = (title: string) => {
    uni.showToast({
        title,
        icon: 'none'
    })
}
const props = defineProps<{
    registerUrl?: string
}>()
const emit = defineEmits(['success'])
const type = ref(1)
const showLoginPopover = ref(false)
const verfyData = ref({})
// 账号密码登录
const formOne = ref({
    account: '',
    password: ''
})
const formOneRef = ref()
const passwordType = ref('password')
const jumpFindPwd = () => {
    uni.navigateTo({
        url: '/package-login/pages/findPwd/index'
    })
}
const jumpRegister = () => {
    uni.showLoading()
    authrizePush(() => {
        uni.hideLoading()
        uni.navigateTo({
            url: props.registerUrl || '/package-register/pages/register/index'
        })
    })
}
const login = async function (data?: object) {
    showLoginPopover.value = false
    if (data) {
        verfyData.value = data
    }
    switch (type.value) {
        case 1:
            formOneRef.value?.validate().then(() => {})

            break

        case 3:
            formTwoRef.value?.validate().then(() => {})
            break

        default:
            break
    }
}
const companyList = ref([])
const selectCompanyRecord = ref()
const visible = ref(false)
const user = useAuthStore()
const companyLogin = (userList: any) => {
    if (userList.length === 1) {
        let form = type.value === 1 ? formOne.value : formTwo.value
        uni.showLoading()
    } else if (userList.length > 1) {
        visible.value = true
        companyList.value = userList.map((i: any) => ({ ...i, checked: false }))
    }
}
const selectCompany = (record: any) => {
    selectCompanyRecord.value = record
    companyList.value.forEach((i: any) => {
        if (record.id !== i.id) {
            i.checked = false
        } else {
            i.checked = true
        }
    })
}
const confirmLogin = () => {
    if (selectCompanyRecord.value) {
        companyLogin([selectCompanyRecord.value])
    } else {
        Toast('请选择登录账号')
    }
}
// 手机验证码登录
const formTwo = ref({
    phoneNumber: '',
    password: ''
})
const showPopover = ref(false)
const formTwoRef = ref()
let ban = ref(false)
let timerShow = ref(false)
let time = ref(60)
let timerId = ref()
const setTimer = function () {
    timerShow.value = true
    timerId.value = setInterval(function () {
        time.value = time.value - 1
        if (time.value < 1) {
            clearInterval(timerId.value)
            time.value = 60
            timerShow.value = false
        }
    }, 1000)
}
const sendCode = function () {
    const apiInfo = {
        phoneNumber: formTwo.value.phoneNumber,
        verifyType: 7
    }
}
// 点击发送短信验证码，激活计时器
const getSmsCode = function () {
    if (ban.value) {
        return
    }
    sendCode()
}

const validateForm = async () => {
    const formRef = type.value == 1 ? formOneRef : formTwoRef
    const res = await formRef.value?.validate()
    if (!res.valid || type.value === 3) {
        setTimeout(() => {
            showLoginPopover.value = false
            // 验证码登录不滑块
            if (type.value === 3) {
                login()
            }
        }, 0)
    }
}
</script>

<style scoped lang="scss">
.login-box {
    position: relative;
    height: 100%;
    .header {
        width: 264px;
        height: 120px;
        overflow: hidden;
        padding: 80px 0;
        margin: 0 auto;
        box-sizing: content-box;
        .logo {
            width: 100%;
            height: 100%;
        }
    }
    .form {
        .form-item {
            border-radius: 8px;
            margin: 0 55px;
            border: solid 1px #d8d8d8;
            margin-top: 30px;
            border-radius: 8px;
            padding-left: 32px;
            padding-right: 12px;
            &:first-child {
                margin-top: 0;
            }
            :deep(.wd-input) {
                &::after {
                    content: '';
                    height: 0;
                }
            }
            :deep(.wd-input__placeholder) {
                color: #999;
            }
            :deep(.wd-input__inner) {
                height: var(--wot-input-inner-height, 88rpx);
            }
            :deep(.wd-popover__pos) {
                // 输入框的一半110
                left: calc(-45px - 50%) !important;
            }
        }
        :deep(.code-button) {
            border: none;
            padding: 0 20px;
            height: 48px;
            border-left: 1px solid #dcdfe6 !important;
            vertical-align: top;
            color: rgb(45, 143, 247);
        }
        :deep(.wd-popover) {
            width: 100%;
        }
    }
    .find-password {
        margin-top: 30px;
        height: 28px;
        font-size: 28px;
        color: #a6a6a6;
        padding-right: 55px;
        text-align: right;
    }
    .button-box {
        margin: 44px 55px 40px;
    }
    .register-box {
        height: 26px;
        font-size: 28px;
        text-align: center;
        color: #fa3130;
    }

    .company-list {
        width: 100%;
        max-height: 7.65rem;
        overflow-y: auto;
        line-height: 0;
        border: solid 1px #f3f3f3;
        box-sizing: border-box;
        background-color: #fff;
        .company-item {
            cursor: pointer;
            margin-left: 30px;
            height: 100px;
            padding: 30px 10px;
            box-sizing: border-box;
            border-bottom: 1px solid #f3f3f3;
            .company-name {
                display: inline-block;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                color: #333333;
                vertical-align: top;
                height: 40px;
                line-height: 40px;
                margin-left: 17px;
                font-size: 30px;
                width: 600px;
            }
            .company-icon {
                width: 33px;
                height: 40px;
                vertical-align: top;
            }
            &:last-child {
                border-bottom: none;
            }
            :deep(.wd-checkbox) {
                display: inline;
            }
        }
    }
    :deep(.custom-radius) {
        border-radius: 0;
    }
    .footer {
        position: absolute;
        bottom: 0;
        width: 100%;
        .other-way {
            text-align: center;
            font-size: 26px;
            color: #8b8b8b;
            .text {
                margin: 0 6px;
            }
            .line {
                vertical-align: middle;
                display: inline-block;
                width: 72px;
                height: 0;
            }
        }
        .way-list {
            margin: 0 auto;
            text-align: center;
            .way-item {
                display: inline-block;
                margin: 40px;
                .img {
                    width: 70px;
                    height: 70px;
                }
                .way-name {
                    font-size: 24px;
                    color: #8b8b8b;
                }
            }
        }
    }
}
</style>
