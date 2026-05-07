<template>
    <view class="u-cell" @click="onClick">
        <wd-cell v-bind="attrs" border :vertical="labelBlock">
            <slot name="value">{{ value }}</slot>
            <!-- <template v-for="key in Object.keys(slots)" v-slot:[key]>
                <slot :name="key"></slot>
            </template> -->
        </wd-cell>
    </view>
</template>
<script lang="ts">
export default {
    options: { styleIsolation: 'shared', virtualHost: true }
}
</script>
<script lang="ts" setup>
import { useAttrs, useSlots } from 'vue'
const slots = useSlots()
const attrs = useAttrs()
const props = defineProps({
    // 标题独占一行
    labelBlock: {
        type: Boolean,
        default: false
    },
    value: {
        type: String,
        default: ''
    }
})
const onClick = () => {
    console.log('onClick')
}
</script>

<style lang="scss" scoped>
.u-cell {
    :deep(.wd-cell) {
        padding: 0;
        .wd-cell__wrapper {
            padding: 26px;
        }
        .wd-cell__left {
            color: #666;
            line-height: 48px;
        }
        .wd-tag {
            font-size: 30px !important;
            line-height: 48px !important;
            height: 48px !important;
            vertical-align: top !important;
            .wd-tag__text {
                vertical-align: baseline;
            }
        }
        .wd-textarea {
            padding: 0 !important;
        }
        .wd-cell__left {
            flex-shrink: 0;
            flex: unset;
            margin-right: 94px;
        }

        .wd-cell__right {
            line-height: 48px;
        }
    }
}
</style>
