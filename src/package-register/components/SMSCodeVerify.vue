<template>
    <wd-input
        v-model="smsCode"
        label="手机验证码"
        error-message-align="right"
        input-align="right"
        :prop="prop"
        :rules="[{ required: true, message: '请输入手机验证码' }]"
        placeholder="请输入手机验证码"
    >
        <template #suffix>
            <wd-button v-if="timerShow" size="small" type="text" :disabled="true">{{ time }} s</wd-button>
            <wd-button v-else size="small" type="text" :disabled="ban" @click="getSmsCode">获取验证码</wd-button>
        </template>
    </wd-input>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

import { sendVerifyCode } from '@/api/loginApi'
import { Toast } from '@/utils'
const props = defineProps({
    phone: {
        type: String,
        default: ''
    },
    verifyType: {
        type: [String, Number],
        default: ''
    },
    modelValue: {
        type: String,
        default: ''
    },
    prop: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:modelValue'])
const smsCode = computed({
    get: () => {
        return props.modelValue || ''
    },
    set: val => {
        emit('update:modelValue', val)
    }
})

const timerShow = ref(false)
const time = ref(60)
const timerId = ref<any>(null)
const ban = ref(false)
const setTimer = () => {
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
        phoneNumber: props.phone,
        verifyType: props.verifyType
    }
    sendVerifyCode(apiInfo)
        .then(res => {
            if (res.code === '0' || res.success === false) {
                Toast(res.msg || '非常抱歉，您操作过于频繁，请您稍后再试')
            } else {
                setTimer()
                Toast('短信验证码已发送，可能会有延后，请耐心等待')
            }
        })
        .catch(err => {
            console.log(err)
        })
}
// 点击发送短信验证码，激活计时器
const getSmsCode = () => {
    if (ban.value) {
        return
    }

    if (!props.phone) {
        Toast('请填写手机号')
        return
    }
    sendCode()
}
</script>

<style scoped lang="scss">
.send-button {
    font-size: 28px;
    font-weight: normal;
    font-stretch: normal;
    line-height: 40px;
    letter-spacing: 0px;
    color: #2d8ff7;
}
.code-button {
    border: none;
    padding: 0 0.2rem;
    height: 0.48rem;
    vertical-align: top;
}
</style>
