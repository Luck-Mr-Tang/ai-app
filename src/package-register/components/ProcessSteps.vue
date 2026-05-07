<template>
    <view class="process-step-box">
        <wd-config-provider :theme-vars="themeVars">
            <wd-steps :active="active" :space="space || '360rpx'" align-center>
                <wd-step v-for="(item, index) in stepList" :key="index">
                    <template #icon>
                        <image
                            class="step-icon"
                            :src="active >= index ? item.activeIconPath : item.inactiveIconPath"
                            mode="widthFix"
                        />
                    </template>
                    <template #title>
                        <text class="label">{{ item.label }}</text>
                    </template>
                </wd-step>
            </wd-steps>
        </wd-config-provider>
    </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
    stepList: {
        label: string
        activeIconPath: string
        inactiveIconPath: string
    }[]
    step: number
    space?: string
    activeColor?: string
}>()

const active = computed(() => {
    return props.step - 1 || 0
})

const themeVars = computed(() => {
    return props.activeColor
        ? {
              stepsLineColor: props.activeColor
          }
        : {}
})
</script>

<style lang="scss" scoped>
.process-step-box {
    height: 150rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    .step-icon {
        width: 46rpx;
        height: 46rpx;
    }
    .label {
        font-size: 26rpx;
        color: #171825;
    }
}
</style>
