<template>
    <view class="time-select">
        <wd-drop-menu-item :title="selectedTitle" ref="dropMenu" @opened="handleOpened">
            <view class="time-box">
                <view class="main-box">
                    <wd-radio-group :model-value="timeTab" shape="button" cell @change="tabChange">
                        <wd-radio :value="1">全部</wd-radio>
                        <wd-radio :value="2">近七天</wd-radio>
                        <wd-radio :value="3">近一个月</wd-radio>
                        <wd-radio :value="4">近一年</wd-radio>
                        <wd-radio :value="5">往年</wd-radio>
                        <wd-radio :value="6">自定义</wd-radio>
                    </wd-radio-group>
                </view>
                <view v-if="timeTab === 6 || timeTab == 5" class="sub-box">
                    <wd-datetime-picker
                        v-if="timeTab === 6"
                        type="date"
                        v-model="timeArray"
                        :min-date="minDate"
                        :max-date="maxDate"
                        @confirm="handleConfirm"
                    />
                    <view v-if="timeTab === 5" class="past-year">
                        <wd-radio-group v-model="pastYear" shape="button" cell @change="pastChange">
                            <wd-radio v-for="i in pastYears" :key="i.value" :value="i.value">{{ i.label }}</wd-radio>
                        </wd-radio-group>
                    </view>
                </view>
            </view>
            <view class="time-footer">
                <view class="left" @click="reset">重置</view>
                <view class="right" @click="submit">确定</view>
            </view>
            <wd-toast />
        </wd-drop-menu-item>
    </view>
</template>
<script lang="ts">
export default {
    name: 'time-select',
    options: {
        virtualHost: true,
        styleIsolation: 'shared' // 解除样式隔离
    }
}
</script>
<script lang="ts" setup>
import { ref, watch, computed, inject } from 'vue'
import moment from 'moment'
import { useToast } from 'wot-design-uni'

type pastYearItem = {
    value: number
    label: string
}
const isLogin = inject('isLogin')
const memberLevel: any = inject('memberLevel')
const toast = useToast()
const dropMenu = ref()
const selectedTitle = ref('发布时间')
const timeTab = ref(1)
const timeArray = ref([])
const minDate = computed(() => {
    if (!isLogin || !memberLevel.value) {
        return new Date().getTime() - 31536000000
    }
    return new Date('2016-01-01').getTime()
})
const maxDate = ref(new Date().getTime())
// 获取当前年份
const currentYear = new Date().getFullYear()
const pastYears = computed(() => {
    // 往年
    const years: pastYearItem[] = []
    for (let year = currentYear - 1; year >= 2016; year--) {
        years.push({
            value: year,
            label: year + '年'
        })
    }
    return years
})
const pastYear = ref(pastYears.value[0].value)

const beginDateStart = ref('')
const beginDateEnd = ref('')
const handleTimeChange = () => {
    beginDateEnd.value = moment().format('YYYY-MM-DD')
    switch (timeTab.value) {
        case 1:
            beginDateEnd.value = ''
            beginDateStart.value = '' // 全部
            selectedTitle.value = '发布时间'
            break
        case 2:
            beginDateStart.value = moment().subtract(7, 'd').format('YYYY-MM-DD') // 7天前
            selectedTitle.value = '近七天'
            break
        case 3:
            beginDateStart.value = moment().subtract(1, 'months').format('YYYY-MM-DD') // 1月前
            selectedTitle.value = '近一个月'
            break
        case 4:
            beginDateStart.value = moment().subtract(1, 'years').format('YYYY-MM-DD') // 1年前
            selectedTitle.value = '近一年'
            break
        case 5:
            beginDateStart.value = pastYear.value + '-01-01'
            beginDateEnd.value = pastYear.value + '-12-31'
            selectedTitle.value = beginDateStart.value + '-' + beginDateEnd.value
            break
        case 6:
            beginDateStart.value = moment(timeArray.value[0]).format('YYYY-MM-DD')
            beginDateEnd.value = moment(timeArray.value[1]).format('YYYY-MM-DD')
            selectedTitle.value = beginDateStart.value + '-' + beginDateEnd.value
            break
    }
}
const handleConfirm = (e: any) => {
    console.log(e)
}
const tabChange = (e: any) => {
    if (e.value === 5) {
        if (!isLogin) {
            return uni.navigateTo({
                url: '/package-login/pages/login/index'
            })
        }
        if (!memberLevel.value) {
            dropMenu.value.close()
            return emit('change')
        }
    }
    console.log(e)
    timeTab.value = e.value
    timeArray.value = []
    pastYear.value = pastYears.value[0].value
}
const pastChange = (e: any) => {
    // console.log(e)
}
const reset = () => {
    // 重置
    timeTab.value = 1
    timeArray.value = []
    handleTimeChange()
    submit()
}
const emit = defineEmits(['submit', 'change'])
const submit = () => {
    if (timeTab.value == 6 && !timeArray.value[0]) {
        return toast.show('请选择日期')
    }
    handleTimeChange()
    console.log('beginDateStart', beginDateStart.value, 'beginDateEnd', beginDateEnd.value)
    emit('submit', [beginDateStart.value, beginDateEnd.value])
    dropMenu.value.close()
}
function handleOpened() {}
</script>
<style lang="scss" scoped>
.time-select {
    :deep(.wd-popup) {
        border-radius: 0 0 20px 20px;
        .wd-radio.is-button.is-checked .wd-radio__label {
            background-color: #ffeff1;
            border-color: #ffeff1;
            color: #e1251b;
        }
    }
    .time-box {
        font-family: PingFang-SC-Medium;
        .sub-box {
            padding: 12px 0;
            border-top: 1px solid #f0f0f0;
            :deep(.wd-picker__body) {
                text-align: center;
                padding: 10px;
                background: #f6f6f6;
            }
        }
    }
    .time-footer {
        display: flex;
        height: 88px;
        line-height: 88px;
        background-color: #ffffff;
        box-shadow: 0px -2px 8px 0px rgba(0, 0, 0, 0.1);
        text-align: center;
        font-size: 34px;

        .left {
            width: 20%;
            color: #696969;
        }
        .right {
            width: 80%;
            color: #ffffff;
            background-color: #e1251b;
        }
    }
}
</style>
