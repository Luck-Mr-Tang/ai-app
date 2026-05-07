<template>
    <view class="region-select">
        <wd-drop-menu-item :title="selectedTitle" ref="dropMenu">
            <view class="region-box">
                <wd-row>
                    <wd-col :span="8" custom-class="province-box">
                        <view
                            class="province-row u-type-info-light-bg"
                            v-for="(item, index) in region"
                            :key="index"
                            @click="onProvince(item.code, index)"
                        >
                            <view
                                :class="[
                                    'area-level',
                                    item.checked ? 'active' : '',
                                    index == 0 || item.children.filter(el => el.checked).length == 0 ? 'w100' : 'w60'
                                ]"
                            >
                                <span>
                                    {{ item.value }}
                                </span>
                            </view>
                            <view
                                :class="['w40', 'area-count', item.checked ? 'active' : '']"
                                v-if="index > 0 && item.children.filter(el => el.checked).length > 0"
                            >
                                <span style="color: #e1251b">
                                    {{ `${item.children.filter(el => el.checked).length}` }}
                                </span>
                                /
                                <span style="color: #171825">
                                    {{ item.children.length }}
                                </span>
                            </view>
                        </view>
                    </wd-col>
                    <wd-col :span="16" custom-class="city-box">
                        <!-- 全国全选 -->
                        <view class="city-row" v-if="regionList.length == 0" @click="onAll(isRegionAll)">
                            <view class="w85 area-detail">全部</view>
                            <view class="w15">
                                <view v-if="isRegionAll" class="my-checked">
                                    <wd-icon name="check-bold" color="#fff"></wd-icon>
                                </view>
                                <view v-else class="my-check" />
                            </view>
                        </view>
                        <!-- 地级市全选 -->
                        <view class="city-row" v-if="regionList.length > 1" @click="onRegionAll">
                            <view class="w85 area-detail">全部</view>
                            <view class="w15">
                                <view
                                    v-if="regionList.filter(el => el.checked).length == regionList.length"
                                    class="my-checked"
                                >
                                    <wd-icon name="check-bold" color="#fff"></wd-icon>
                                </view>
                                <view v-else class="my-check" />
                            </view>
                        </view>
                        <!-- 直辖市、特区单选 -->
                        <view v-show="regionList.length == 1">
                            <view
                                class="city-row"
                                v-for="(item, index) in regionList"
                                :key="index"
                                @click="onRegionSingle(index)"
                            >
                                <view class="w85 area-detail">
                                    <span v-text="item.value"></span>
                                </view>
                                <view class="w15">
                                    <view v-if="item.checked" class="my-checked">
                                        <wd-icon name="check-bold" color="#fff"></wd-icon>
                                    </view>
                                    <view v-else class="my-check" />
                                </view>
                            </view>
                        </view>
                        <!-- 地级市单选 -->
                        <view v-show="regionList.length > 1">
                            <view
                                class="city-row"
                                v-for="(item, index) in regionList"
                                :key="index"
                                @click="onRegionSingle(index)"
                            >
                                <view class="w85 area-detail">
                                    <span v-text="item.value"></span>
                                </view>
                                <view class="w15" :span="4">
                                    <view v-if="item.checked" class="my-checked">
                                        <wd-icon name="check-bold" color="#fff"></wd-icon>
                                    </view>
                                    <view v-else class="my-check" />
                                </view>
                            </view>
                        </view>
                    </wd-col>
                </wd-row>
            </view>
            <view class="region-footer">
                <view class="left" @click="reset">重置</view>
                <view class="right" @click="submit">确定</view>
            </view>
        </wd-drop-menu-item>
    </view>
</template>
<script lang="ts">
export default {
    name: 'region-select',
    options: {
        virtualHost: true,
        styleIsolation: 'shared' // 解除样式隔离
    }
}
</script>
<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue'
import regionData from './region.json'
type RegionItem = {
    code: string
    value: string
    checked: boolean
    children: RegionItem[]
}
const dropMenu = ref()
const selectedTitle = ref('项目地区')
// 地区
const region = ref<RegionItem[]>([])
const finalRegion = ref([])
const preRegion = ref([])
const regionList = ref<RegionItem[]>([])
const isRegionAll = computed(() => {
    let tem = 0
    let tem2 = 0
    region.value.forEach(el => {
        tem += el.children.length
        tem2 += el.children.filter(el => el.checked).length
    })
    return tem2 == 0 ? true : tem == tem2
})
onMounted(() => {
    initRegion()
})
const onProvince = (code: string, index: number) => {
    //省份切换
    region.value.forEach(el => (el.checked = false))
    region.value[index].checked = true
    const item = region.value.find(el => el.code == code)
    if (item) {
        regionList.value = item.children
    }
    console.log(2, regionList.value.length)
}
// 全选地级市
const onAll = (falg: boolean) => {
    region.value.forEach((el, index) => {
        el.children.forEach(item => {
            item.checked = !falg
        })
    })
}
const initRegion = () => {
    const tem = regionData.map((el, index) => ({
        ...el,
        checked: index == 0 ? true : false,
        children:
            (el.children || []).length > 0
                ? el.children?.map(item => ({
                      ...item,
                      checked: index == 0 ? true : false
                  }))
                : []
    }))
    region.value = tem
    regionList.value = region.value[0].children
}
const onRegionAll = () => {
    const flag = regionList.value.filter(el => el.checked).length == regionList.value.length
    regionList.value.forEach(el => (el.checked = !flag))
}
const onRegionSingle = (index: number) => {
    if (regionList.value.filter(el => el.checked).length == regionList.value.length && regionList.value.length > 1) {
        regionList.value.forEach(el => (el.checked = false))
        regionList.value[index].checked = !regionList.value[index].checked
    } else {
        regionList.value[index].checked = !regionList.value[index].checked
    }
}

const reset = () => {
    // 重置
    initRegion()
    submit()
}
const emit = defineEmits(['submit'])
const submit = () => {
    console.log('region', region.value, 'regionList', regionList.value)
    let regionStr = ''
    if (!isRegionAll.value) {
        let selectedRegion: string[] = []
        region.value.forEach(el => {
            el.children.forEach(item => {
                if (item.checked) {
                    selectedRegion.push(item.value)
                }
            })
        })
        regionStr = selectedRegion.join(',')
    }
    emit('submit', regionStr)
    dropMenu.value.close()
    selectedTitle.value = regionStr || '项目地区'
}
</script>
<style lang="scss" scoped>
.region-select {
    :deep(.wd-popup) {
        border-radius: 0 0 20px 20px;
    }
    .selected {
        color: #e1251b;
    }
    .region-box {
        font-family: PingFang-SC-Medium;
        :deep(.province-box) {
            max-height: 600px;
            overflow-y: scroll;
            padding: 0;
            background-color: #f5f5f5;
        }
        :deep(.city-box) {
            max-height: 600px;
            overflow-y: scroll;
        }
        .province-row {
            display: flex;
            width: 100%;
            .w100 {
                width: 100%;
            }
            .w40 {
                width: 40%;
            }
            .w60 {
                width: 60%;
            }
        }
        .city-row {
            display: flex;
            width: 100%;
            .w85 {
                width: 85%;
                padding-left: 30px;
            }
            .w15 {
                width: 15%;
                display: flex;
                align-items: center;
            }
        }
        .area-level {
            padding-left: 24px;
            font-family: PingFang-SC-Medium;
            font-size: 30px;
            color: #303133;
            line-height: 90px;

            &.active {
                background-color: #ffffff;
            }
        }

        .area-count {
            font-size: 26px;
            font-family: PingFang SC;
            line-height: 90px;

            &.active {
                background-color: #ffffff;
            }
        }

        .area-detail {
            font-family: PingFang-SC-Medium;
            font-size: 30px;
            color: #303133;
            line-height: 90px;
        }
        .my-checked {
            width: 34px;
            height: 34px;
            line-height: 34px;
            background-image: linear-gradient(-30deg, #e1251b 0%, #fd441f 100%), linear-gradient(#e1251b, #e1251b);
            background-blend-mode: normal, normal;
            border-radius: 6px;
            // border: 2px solid #e1251b;
            text-align: center;
        }

        .my-check {
            width: 34px;
            height: 34px;
            border-radius: 6px;
            border: 2px solid #c8c9cc;
        }
    }
    .region-footer {
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
