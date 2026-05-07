<template>
    <view v-if="tabbar" class="tabbar">
        <wd-tabbar :modelValue="tabbar" fixed bordered safe-area-inset-bottom @change="handleChange" :z-indxe="10">
            <wd-tabbar-item
                v-for="(item, index) in data"
                :key="index"
                :value="0"
                :title="item.meta?.title"
                :name="item.name"
                :icon="item.name"
            />
        </wd-tabbar>
    </view>
    <view v-else-if="!customSafeArea" class="safe-area-inset-bottom"></view>
</template>
<script lang="ts">
export default {
    options: {
        styleIsolation: 'shared'
    }
}
</script>
<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'uni-mini-router'
import { pages } from '@/pages.json'
import { findPageConfig, getDomain } from '@/utils'
const route = useRoute()
const router = useRouter()

const data = pages.filter(it => it.meta?.isTab)
const tabbar = ref('')
const customSafeArea = ref(false)
onBeforeMount(() => {
    const pageConf = findPageConfig(route.path)
    customSafeArea.value = !!pageConf?.meta?.customSafeArea
    if (pageConf?.meta.isTab) {
        tabbar.value = route.path?.match(/^\/pages\/([a-z]*)\//)?.[1] || ''
    } else {
        tabbar.value = ''
    }
})

const handleChange = (val: { value: string }) => {
    router.replace({ name: val.value })
}
</script>

<style lang="scss" scoped>
.layout .tabbar {
    margin-bottom: env(safe-area-inset-bottom);
    height: calc(var(--wot-tabbar-height, 100px));
    box-shadow: 0px 3px 13px 0px rgba(0, 0, 0, 0.1);
    :deep(.wd-tabbar) {
        z-index: 10 !important;
        box-sizing: content-box;
        .wd-badge__content {
            border: none !important;
            padding: 0;
            width: 32px;
            height: 32px;
        }
    }
}
.safe-area-inset-bottom {
    height: env(safe-area-inset-bottom);
    background-color: #f9f9f9;
}
</style>
