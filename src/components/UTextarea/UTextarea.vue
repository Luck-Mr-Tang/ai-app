<template>
    <div v-if="disabled">
        <div :style="bodyStyle" class="disabled-container">
            <div ref="textareaDom" class="disabled-value">
                {{ value || '待完善' }}
            </div>
        </div>
        <div v-if="moreShow" class="show-more">
            <div @click="isAll = !isAll">
                {{ isAll ? '收起' : '展开全部' }}
                <wd-icon :name="isAll ? 'arrow-up' : 'arrow-down'" />
            </div>
        </div>
    </div>
    <UCell is-link @click="showModal" @tap="showModal" v-else>
        <template #value>
            <wd-textarea
                v-model="result"
                readonly
                v-bind="attrs"
                auto-height
                :placeholder="placeholder"
                no-border
            ></wd-textarea>
        </template>
    </UCell>

    <wd-popup v-model="show" position="bottom" round v-if="!disabled">
        <div class="popup-title">
            <wd-icon
                name="close"
                custom-style="position: absolute;right: 0;top: 0;padding:0 30px;"
                color="#333"
                size="14px"
                @click="close"
            />
            {{ title }}
        </div>
        <view class="popup-textarea">
            <wd-textarea
                v-model="inputResult"
                type="textarea"
                no-border
                fixed
                auto-height
                label=""
                :placeholder="placeholder"
                :maxlength="textareaMaxLength"
                custom-textarea-class="popup-textarea-inner"
            />
        </view>

        <wd-button block custom-style="border-radius: 0" @click="finish" type="primary">完成</wd-button>
    </wd-popup>
</template>
<script lang="ts">
export default {
    options: { styleIsolation: 'shared', virtualHost: true }
}
</script>
<script lang="ts" setup>
import { useAttrs, useSlots, ref, watch, getCurrentInstance, onMounted, computed } from 'vue'
import UCell from '../uCell/uCell.vue'
const slots = useSlots()
const attrs = useAttrs()
const props = defineProps({
    // 标题独占一行
    disabled: {
        type: Boolean,
        default: false
    },
    placeholder: {
        type: String,
        default: '请输入'
    },
    title: {
        type: String,
        default: '请输入'
    },
    value: {
        type: String
    },
    textareaMaxHeight: {
        type: Number,
        default: 300
    },
    textareaMaxLength: {
        type: Number,
        default: 500
    }
})

// 是否全部显示
const isAll = ref(false)

let bodyStyle = computed(() => {
    if (isAll.value) {
        return {}
    } else {
        return { maxHeight: miniHeight + 'px', overflow: 'hidden' }
    }
})
// 控制展开按钮显示隐藏
const miniHeight = 148
const moreShow = ref(false)
const textareaDom = ref()

const setMoreShow = async () => {
    // await new Promise<void>(resolve => {
    //     setTimeout(() => {
    //         resolve()
    //     }, 1000)
    // })
    if (!props.disabled) return
    const instance = getCurrentInstance()
    const query = uni.createSelectorQuery().in(instance?.proxy)
    console.log(instance?.proxy)
    try {
        const data: any = await new Promise(reslove => {
            query.select('.disabled-value').boundingClientRect(reslove).exec()
        })
        let h = data.height || 0
        if (h > miniHeight) {
            moreShow.value = true
        }
    } catch (error) {
        console.log(error)
    }
}
onMounted(setMoreShow)

const emit = defineEmits<{
    (e: 'update:value', value: string): void
}>()
const result = ref<string>('')
const inputResult = ref<string>('')

watch(
    () => props.value,
    () => {
        setMoreShow()
        if (!props.value) return
        result.value = props.value
        inputResult.value = props.value
        console.log(result.value, inputResult.value)
    },
    {
        immediate: true
    }
)
const show = ref(false)
const showModal = () => {
    console.log('showModal')

    if (props.disabled) return
    show.value = true
}
// 组件内部，给组件的success赋值（this.suceess,this.fail,this.complete）,再调用boundingClientRect，回调函数不会执行。
const finish = () => {
    emit('update:value', inputResult.value)
    show.value = false
}
const close = () => {
    show.value = false
    if (!props.value) return
    result.value = props.value
    inputResult.value = props.value
}
</script>

<style lang="scss" scoped>
.popup-title {
    height: 90px;
    line-height: 90px;
    padding-left: 30px;
    border-bottom: 1px solid #e6e6e6;
    font-size: 32px;
    font-stretch: normal;
    letter-spacing: 0px;
    color: #171825;
    position: relative;
    .close {
        position: absolute;
        right: 0;
        top: 0;
        padding: 0 30px;
    }
}
.popup-textarea {
    width: calc(100% - 60px);
    background-color: #f7f8fa;
    border-radius: 6px;
    margin: 30px;
    padding: 10px 32px;
    :deep(.wd-textarea) {
        background-color: #f7f8fa;
    }
    :deep(.popup-textarea-inner) {
        max-height: 400px;
        min-height: 100px;
        background-color: #f7f8fa;
    }
}

.disabled-container {
    .disabled-value {
        width: 100%;
        line-height: 48px;
        font-size: 30px;
    }
}
.show-more {
    text-align: center;
    color: #2d8ff7;
    font-size: 30px;
    margin-top: 30px;
    line-height: 30px;
}
</style>
