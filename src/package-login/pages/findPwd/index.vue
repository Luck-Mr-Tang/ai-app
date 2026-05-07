<template>
    <layout>
        <div class="find-pwd-container">
            <div class="step-container">
                <wd-cell-group v-if="activeStep === 1">
                    <wd-form ref="paramsOneRef" :model="paramsOne">
                        <wd-cell-group>
                            <wd-input
                                v-model="paramsOne.account"
                                prop="account"
                                label="用户名"
                                placeholder="请输入用户名"
                                input-align="right"
                                required
                                error-message-align="right"
                                :rules="[{ required: true, message: '请填写用户名' }]"
                            />
                        </wd-cell-group>
                    </wd-form>

                    <DragVerfication id="findPwd" @success="stepOneSubmit"></DragVerfication>
                </wd-cell-group>
                <wd-cell-group v-if="activeStep === 2">
                    <wd-form ref="paramsTwoRef" :model="paramsTwo">
                        <wd-cell-group>
                            <wd-picker
                                :columns="columns"
                                v-model="paramsTwo.phoneNumber"
                                prop="phoneNumber"
                                :label="typeLabel"
                                error-message-align="right"
                                placeholder="请选择验证方式"
                                input-align="right"
                                @click="showPicker = true"
                                :rules="[
                                    { required: true, message: '请选择验证方式' },
                                    { required: true, pattern: phoneNumber, message: '请输入十一位手机号码' }
                                ]"
                            />
                            <wd-input
                                v-model="paramsTwo.password"
                                label="短信验证码"
                                error-message-align="right"
                                input-align="right"
                                name="password"
                                :rules="[{ required: true, message: '请输入短信验证码' }]"
                                placeholder="请输入短信验证码"
                            >
                                <template #suffix>
                                    <wd-button size="small" style="width: 1.56rem" v-if="timerShow" :disabled="true">
                                        {{ time }} s
                                    </wd-button>
                                    <wd-button v-else size="small" plain :disabled="ban" @click="getSmsCode">
                                        发送验证码
                                    </wd-button>
                                </template>
                            </wd-input>
                        </wd-cell-group>
                    </wd-form>
                    <div style="margin: 1.8rem 0.6rem">
                        <wd-button block @click="stepTwoSubmit">下一步</wd-button>
                    </div>
                </wd-cell-group>
                <wd-cell-group v-if="activeStep === 3">
                    <wd-form ref="paramsThreeRef" :model="paramsThree">
                        <wd-cell-group>
                            <wd-input
                                v-model="paramsThree.password"
                                show-password
                                label-width="150px"
                                label="新的登录密码"
                                :rules="[
                                    { required: true, message: '请输入密码' },
                                    {
                                        required: true,
                                        pattern: password,
                                        message: '请设置登录密码（长度6-20位，包含大小写字母和数字）'
                                    }
                                ]"
                                placeholder="请输入密码"
                                input-align="right"
                                required
                                error-message-align="right"
                            ></wd-input>
                            <wd-input
                                v-model="paramsThree.rePassword"
                                show-password
                                label="确认新的登录密码"
                                label-width="150px"
                                input-align="right"
                                required
                                error-message-align="right"
                                :rules="[
                                    { required: true, message: '请再次输入密码' },
                                    {
                                        validator: checkPassword,
                                        trigger: 'onBlur',
                                        message: '密码不一致!',
                                        required: true
                                    }
                                ]"
                                placeholder="请再次输入密码"
                            >
                                <template #right-icon>
                                    <wd-icon
                                        name="closed-eye"
                                        color="#c8c9cc"
                                        v-if="rePasswordType === 'password'"
                                        @click="rePasswordType = 'text'"
                                    />
                                    <wd-icon v-else name="eye-o" color="#ee0a24" @click="rePasswordType = 'password'" />
                                </template>
                            </wd-input>
                        </wd-cell-group>
                    </wd-form>

                    <div style="margin: 1.8rem 0.6rem">
                        <wd-button round block @click="stepThreeSubmit">完成</wd-button>
                    </div>
                </wd-cell-group>
                <wd-cell-group v-if="activeStep === 4">
                    <div class="success">
                        <wd-icon name="check-circle-filled" color="#07c160" size="42px" />
                        <div style="margin-top: 0.26rem">新的密码设置成功，请牢记您设置的密码!</div>
                    </div>

                    <div style="margin: 1.5rem 0.6rem">
                        <wd-button block @click="jumpLogin">去登录</wd-button>
                    </div>
                </wd-cell-group>
            </div>

            <CopyrightFooter custom-style="height: 70rpx; background-color: #f9f9f9"></CopyrightFooter>
            <wd-action-sheet v-model="visible" title="请选择登录账号">
                <div class="company-list">
                    <div
                        v-for="(item, index) in companyList"
                        :key="index"
                        class="company-item"
                        @click="selectCompany(item)"
                    >
                        <image src="@/static/image/company-icon.png" class="company-icon" alt="" />
                        <div class="company-name">{{ item.name }}</div>
                        <wd-checkbox v-model="item.checked" style="float: right"></wd-checkbox>
                    </div>
                </div>
                <div style="text-align: center">
                    <wd-button @click="confirmLogin" custom-class="custom-radius" block>下一步</wd-button>
                </div>
            </wd-action-sheet>
        </div>
    </layout>
</template>
<script lang="ts">
export default {
    options: { styleIsolation: 'shared' }
}
</script>
<script setup lang="ts">
import CopyrightFooter from '../../components/CopyrightFooter.vue'
import DragVerfication from '@/components/dragVerfication.vue'
import type { FormInstance } from 'wot-design-uni/components/wd-form/types'
import layout from '@/components/layout/index.vue'
import { ref, computed } from 'vue'
import { phoneNumber, password } from '@/utils/pattern'
import { Toast } from '@/utils'
const activeStep = ref<number>(1)

const jumpLogin = function () {
    uni.navigateTo({
        url: '/package-login/pages/login/index'
    })
}
const paramsOne = ref({
    account: ''
})
const companyList = ref([])
const selectCompanyRecord = ref()
const visible = ref(false)

const companyLogin = userList => {
    if (userList.length === 1) {
        selectCompanyRecord.value = userList[0]
    } else if (userList.length > 1) {
        visible.value = true
        companyList.value = userList.map((i: any) => ({ ...i, checked: false }))
    }
}
const selectCompany = (record: any) => {
    selectCompanyRecord.value = record
    companyList.value.forEach((i: any) => {
        if (record.name !== i.name) {
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
const stepOneSubmit = async () => {}

const paramsTwo = ref({
    phoneNumber: '',
    password: '',
    type: ''
})
const phoneList = ref<Array<any>>([])

/* 隐藏手机中间四位数*/
function getTel(tel: string) {
    return tel.substring(0, 3) + '****' + tel.substr(7)
}
const columns = computed(() => {
    const _phoneList = phoneList.value.map(i => ({
        label: `${getTel(i.phoneNumber)}[${i.isMain ? '公司联系人' : '用户账户'}]`,
        value: i.phoneNumber,
        type: '手机号'
    }))
    return _phoneList
})
const showPicker = ref(false)
const typeLabel = ref('验证方式')
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
        phoneNumber: paramsTwo.value.phoneNumber,
        verifyType: 8
    }
}
// 点击发送短信验证码，激活计时器
const getSmsCode = function () {
    if (ban.value) {
        return
    }
    sendCode()
}
const stepTwoSubmit = async () => {
    try {
        const valid = await paramsTwoRef.value?.validate()
        if (!valid?.valid) return
    } catch (error) {
        console.log(error)
    }
}

const paramsThree = ref({
    id: '',
    password: '',
    rePassword: ''
})
const rePasswordType = ref<string>('password')
const checkPassword = (value: string) => {
    if (value === '') {
        return true
    } else if (value !== paramsThree.value.password) {
        return false
    } else {
        return true
    }
}
const stepThreeSubmit = async () => {
    try {
        const valid = await paramsThreeRef.value?.validate()
        if (!valid?.valid) return
    } catch (error) {
        console.log(error)
    }
}
const paramsOneRef = ref<FormInstance>()
const paramsTwoRef = ref<FormInstance>()
const paramsThreeRef = ref<FormInstance>()
</script>

<style lang="scss" scoped>
.find-pwd-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}
.step-container {
    flex: 1;
    margin-top: 10px;
    background-color: #fff;
    :deep(.px-slider) {
        border: 1px solid #ebedf0;
        margin-top: 36px;
    }
    :deep(.wd-picker__body) {
        text-align: right;
    }
    :deep(.wd-input__body) {
        text-align: right;
    }

    :deep(.wd-input.is-cell) {
        &::before {
            position: absolute;
            display: block;
            content: '';
            width: 100%;
            height: 0.0625rem;
            left: 0;
            bottom: 0;
            transform: scaleY(0.5);
            background: var(--wot-color-border-light, #e8e8e8);
        }
    }
}
.success {
    padding-top: 1.1rem;
    font-size: 32px;
    color: #333333;
    text-align: center;
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
.find-pwd-container {
    :deep(.custom-radius) {
        border-radius: 0;
    }
}
</style>
