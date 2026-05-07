<template>
    <view class="drop-select">
        <view @click="closeOutside">
            <wd-drop-menu :custom-class="customClass">
                <type-select @submit="handleTypeSubmit" @judge="goJudge" />
                <region-select @submit="handleRegionSubmit" />
                <time-select @submit="handleTimeSubmit" @change="goGuide" />
                <wd-drop-menu-item
                    v-model="ageValue"
                    custom-class="age-box"
                    custom-title="age-title"
                    custom-icon="age-icon"
                    :title="ageTitle"
                    :options="option"
                    @change="handleAgeChange"
                />
            </wd-drop-menu>
        </view>
    </view>
</template>
<script lang="ts">
export default {
    name: 'drop-select',
    options: {
        virtualHost: true,
        styleIsolation: 'shared' // 解除样式隔离
    }
}
</script>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useQueue } from 'wot-design-uni'
import typeSelect from './type-select.vue'
import regionSelect from './region-select.vue'
import timeSelect from './time-select.vue'
const { closeOutside } = useQueue()
// 招标类型
const tenderType = ref(0)
const noticeType = ref(0)
// 项目地区
const region = ref('')
// 发布时间
const publishDateStart = ref()
const publishDateEnd = ref()
// 公告时效
const ageValue = ref()
const ageTitle = computed(() => {
    let title = '公告时效'
    switch (ageValue.value) {
        case 0:
            title = '全部'
            break
        case 1:
            title = '公告未截止或中(终)止'
            break
        case 2:
            title = '公告已截止'
            break
    }
    return title
})
// endDateEnd == 此刻时间 已过期
// endDateStart == 此刻时间 未过期
const endDateEnd = ref()
const endDateStart = ref()
const typeTitleRed = computed(() => {
    return tenderType.value != 0 || noticeType.value != 0
})
const regionTitleRed = computed(() => {
    return region.value != ''
})
const timeTitleRed = computed(() => {
    return !!publishDateStart.value && !!publishDateEnd.value
})
const ageTitleRed = computed(() => {
    return ageTitle.value != '公告时效'
})
const customClass = computed(() => {
    // 设置菜单标题颜色
    const str1 = typeTitleRed.value ? 'type-title-red' : ''
    const str2 = regionTitleRed.value ? 'region-title-red' : ''
    const str3 = timeTitleRed.value ? 'time-title-red' : ''
    const str4 = ageTitleRed.value ? 'age-title-red' : ''
    return `${str1} ${str2} ${str3} ${str4}`
})
const option = ref([
    { label: '全部', value: 0 },
    { label: '公告未截止或中(终)止', value: 1 },
    { label: '公告已截止', value: 2 }
])
const emits = defineEmits(['submit', 'change', 'judge'])
const handleTypeSubmit = (types: number[]) => {
    console.log('types', types)
    tenderType.value = types[0]
    noticeType.value = types[1]
    emits('submit', 1, [tenderType.value, noticeType.value])
}
const handleRegionSubmit = (regionStr: string) => {
    console.log('region', regionStr)
    region.value = regionStr
    emits('submit', 2, region.value)
}
const handleTimeSubmit = (time: string[]) => {
    console.log('time', time)
    if (time[0] != '' && time[1] != '') {
        publishDateStart.value = new Date(time[0]).getTime()
        publishDateEnd.value = new Date(time[1]).getTime()
    } else {
        publishDateStart.value = ''
        publishDateEnd.value = ''
    }
    emits('submit', 3, [publishDateStart.value, publishDateEnd.value])
}
const handleAgeChange = ({ value }) => {
    console.log(value)
    switch (value) {
        case 0:
            // 全部
            endDateStart.value = ''
            endDateEnd.value = ''
            break
        case 1:
            // 未截止
            endDateStart.value = new Date().getTime()
            endDateEnd.value = ''
            break
        case 2:
            // 已截止
            endDateStart.value = ''
            endDateEnd.value = new Date().getTime()
            break
    }
    emits('submit', 4, [endDateStart.value, endDateEnd.value])
}
const goGuide = () => {
    // 打开购买引导弹窗
    emits('change')
}
const goJudge = () => {
    // 判断是否关注公众号
    emits('judge')
}
</script>
<style lang="scss" scoped>
.drop-select {
    font-size: 12px;
    :deep(.wd-popup) {
        border-radius: 0 0 20px 20px;
    }
}
</style>
<style lang="scss">
.drop-select {
    // :deep(.wd-drop-menu) {
    //     box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
    // }
    :deep(.wd-drop-menu__item-title:after) {
        display: none;
    }
}
.type-title-red {
    :deep(.wd-drop-menu__item:first-child) {
        .wd-drop-menu__item-title-text {
            color: #e1251b;
        }
    }
}
.region-title-red {
    :deep(.wd-drop-menu__item:nth-child(2)) {
        .wd-drop-menu__item-title-text {
            color: #e1251b;
        }
    }
}
.time-title-red {
    :deep(.wd-drop-menu__item:nth-child(3)) {
        .wd-drop-menu__item-title-text {
            color: #e1251b;
        }
    }
}
.age-title-red {
    :deep(.wd-drop-menu__item:nth-child(4)) {
        .wd-drop-menu__item-title-text {
            color: #e1251b;
        }
    }
}
.age-box {
    :deep(.is-active) {
        .wd-drop-item__title {
            font-family: PingFang-SC-Heavy;
            color: #e1251b;
        }
        .wd-icon-check {
            color: #e1251b;
        }
    }
    .age-title {
        color: #2a2b37;
    }
}
</style>
