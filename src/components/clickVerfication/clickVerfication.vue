<template>
    <span>
        <Verify
            @success="success"
            :mode="'pop'"
            captchaType="clickWord"
            :imgSize="{ width: '330px', height: '155px' }"
            ref="verify"
            v-if="show"
        ></Verify>
        <span @click="useVerify">
            <slot></slot>
        </span>
    </span>
</template>

<script setup lang="ts">
//引入组件
import Verify from '@/components/Verify/Verify.vue'
import { usePermissStore } from '@/state/modules/permission'
import { ref, nextTick } from 'vue'
const { hasReleationId, updateReleationIds } = usePermissStore()
const props = defineProps({
    // 联系Id
    releationId: {
        type: String
    },
    isVer: {
        type: Boolean,
        default: false
    }
})
const show = ref(false)
const emit = defineEmits(['success'])
const success = (params: object) => {
    if (props.releationId) {
        updateReleationIds(props.releationId)
    }
    emit('success', params)
    // params 返回的二次验证参数, 和登录参数一起回传给登录接口，方便后台进行二次验证
}
const verify = ref()
const useVerify = () => {
    if (!props.isVer) {
        success({})
    } else if (props.releationId && hasReleationId(props.releationId)) {
        success({})
    } else {
        show.value = true
        setTimeout(() => {
            verify.value?.show()
        }, 100)
    }
}
</script>
