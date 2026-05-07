<template>
    <layout>
        <z-paging ref="paging" v-model="list" :fixed="false" @query="getList">
            <template #top>
                <view class="search"></view>
            </template>
            <template #refresher="{ refresherStatus }">
                <!-- 此处的custom-refresh为demo中自定义的组件，非z-paging的内置组件，请在实际项目中自行创建。这里插入什么view，下拉刷新就显示什么view -->
                <custom :status="refresherStatus" />
            </template>
            <!-- 自定义没有更多数据view -->
            <template #loadingMoreNoMore>
                <!-- 此处的custom-nomore为demo中自定义的组件，非z-paging的内置组件，请在实际项目中自行创建。这里插入什么view，没有更多数据就显示什么view -->
                <view></view>
            </template>
            <template #empty>
                <view class="tip"></view>
            </template>
            <view class="content"></view>
        </z-paging>
    </layout>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import layout from '@/components/layout/index.vue'
import custom from '@/components/custom-refresher/index.vue'
import { onShareAppMessage } from '@dcloudio/uni-app'

// 列表
const paging = ref<any>(null)

const list = ref([])
const getList = (pageNo: number, pageSize: number) => {
    try {
        search(pageNo, pageSize)
    } catch (error) {
        paging.value.complete(false)
    }
}
const search = async (pageNo: number, pageSize: number) => {}

onMounted(() => {})

onShareAppMessage(() => {
    return {
        title: 'app',
        path: '/pages/home/index'
    }
})
</script>
<style lang="scss" scoped>
.content {
    :deep(.u-type-primary) {
        color: #e1251b;
    }
    rich-text {
        display: inline-block;
    }
}
</style>
