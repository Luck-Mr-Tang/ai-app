<template>
    <view class="type-select">
        <wd-drop-menu-item :title="selectedTitle" ref="dropMenu" @opened="handleOpened">
            <view class="type-box">
                <view class="type-title">招标类型</view>
                <view class="type-group">
                    <view
                        v-for="i in tenderTypeList"
                        :key="i.name"
                        :class="['item', i.checked ? 'checked' : '']"
                        @click="handleTenderType(i)"
                    >
                        <span>{{ i.name }}</span>
                        <image v-show="i.checked" class="icon" src="@/static/search/selected.png" alt="" />
                    </view>
                    <view class="item df" @click="handleWholeClick">
                        <span>全网商机</span>
                        <img class="hot" src="@/static/search/hot.png" alt="" />
                    </view>
                </view>
                <view class="type-title">公告类型</view>
                <view class="type-group">
                    <view
                        v-for="i in noticeTypeList"
                        :key="i.name"
                        v-show="i.isShow"
                        :class="['item', i.checked ? 'checked' : '']"
                        @click="handleNoticeType(i)"
                    >
                        <span>{{ i.name }}</span>
                        <image v-show="i.checked" class="icon" src="@/static/search/selected.png" alt="" />
                    </view>
                </view>
            </view>
            <view class="type-footer">
                <view class="left" @click="reset">重置</view>
                <view class="right" @click="submit">确定</view>
            </view>
        </wd-drop-menu-item>
    </view>
</template>
<script lang="ts">
export default {
    name: 'type-select',
    options: {
        virtualHost: true,
        styleIsolation: 'shared' // 解除样式隔离
    }
}
</script>
<script lang="ts" setup>
import { ref, watch, computed, inject } from 'vue'
const isLogin = inject('isLogin')
const dropMenu = ref()
const selectedTitle = ref('招标类型')
const tenderType = ref(0)
const tenderTypeList = ref([
    {
        name: '全部',
        value: 0,
        checked: true
    },
    {
        name: '招标',
        value: 1,
        checked: false
    },
    {
        name: '询比',
        value: 2,
        checked: false
    },
    {
        name: '招募',
        value: 3,
        checked: false
    },
    {
        name: '竞价',
        value: 4,
        checked: false
    },
    {
        name: '单一来源',
        value: 5,
        checked: false
    },
    {
        name: '政府采购需求调查',
        value: 7,
        checked: false
    }
])
const noticeType = ref(0)
const noticeTypeName = computed(() => {
    let type = ''
    switch (tenderType.value) {
        case 0:
            type = '招标公告'
            break
        case 1:
            type = '招标公告'
            break
        case 2:
            type = '采购公告'
            break
        case 4:
            type = '招标公告'
            break
        case 5:
            type = '单一来源公告'
            break
        case 7:
            type = '招标公告'
    }
    return type
})
const checkIsShow = (t: number) => {
    let flag = false
    switch (t) {
        case 0:
            flag = true
            break
        case 1:
            flag = noticeTypeName.value != ''
            break
        case 2:
            flag = tenderType.value !== 3
            break
        case 5:
            flag = tenderType.value == 1 || tenderType.value == 4
            break
        case 7:
            flag = tenderType.value == 1
            break
        case 9:
            flag = tenderType.value !== 0 && tenderType.value !== 3 && tenderType.value !== 7
    }
    return flag
}
const noticeTypeList = ref([
    {
        name: '全部',
        value: 0,
        checked: true,
        isShow: true
    },
    {
        name: noticeTypeName.value,
        value: 1,
        checked: false,
        isShow: true
    },
    {
        name: '结果公示',
        value: 2,
        checked: false,
        isShow: true
    },
    {
        name: '澄清/变更公告',
        value: 5,
        checked: false,
        isShow: false
    },
    {
        name: '招标项目计划',
        value: 7,
        checked: false,
        isShow: false
    },
    {
        name: '交易见证书',
        value: 9,
        checked: false,
        isShow: false
    }
])
const handleTenderType = (item: any) => {
    tenderTypeList.value.forEach((i: any) => {
        i.checked = false
    })
    item.checked = true
    tenderType.value = item.value
    handleNoticeType(noticeTypeList.value[0])
    console.log(tenderTypeList.value, tenderType.value)
}
const handleNoticeType = (item: any) => {
    noticeTypeList.value.forEach((i: any) => {
        if (i.value == 1) {
            i.name = noticeTypeName.value
        }
        i.checked = false
        i.isShow = checkIsShow(i.value)
    })
    item.checked = true
    noticeType.value = item.value
    console.log(noticeTypeList.value, noticeType.value)
}
const reset = () => {
    // 重置
    handleTenderType(tenderTypeList.value[0])
    submit()
    selectedTitle.value = '招标类型'
}
const emit = defineEmits(['submit', 'judge'])
const submit = () => {
    emit('submit', [tenderType.value, noticeType.value])
    dropMenu.value.close()
    if (!tenderType.value && !noticeType.value) return
    let str1 = ''
    let str2 = ''
    tenderTypeList.value.forEach((i: any) => {
        if (i.checked) {
            str1 = i.name
        }
    })
    noticeTypeList.value.forEach((i: any) => {
        if (i.checked) {
            str2 = i.name
        }
    })
    selectedTitle.value = str1 + ',' + str2
}
const handleWholeClick = () => {
    // 未登录点击跳转至登录页，已登录点击判断当前微信是否关注app公众号，已关注则打开h5的全网商机首页，未关注则弹出公众号引导弹窗。
    if (!isLogin) {
        return uni.navigateTo({
            url: '/package-login/pages/login/index'
        })
    }
    dropMenu.value.close()
    emit('judge')
}
function handleOpened() {}
</script>
<style lang="scss" scoped>
.type-select {
    :deep(.wd-popup) {
        border-radius: 0 0 20px 20px;
    }
    .selected {
        color: #e1251b;
    }
    .type-box {
        font-family: PingFang-SC-Medium;
        padding: 40px;
        .type-title {
            font-size: 25px;
            color: #9a9a9a;
        }
        .type-group {
            padding: 25px 0;
            display: flex;
            flex-wrap: wrap;
            .item {
                position: relative;
                margin: 0 20px 20px 0;
                padding: 0 45px;
                height: 54px;
                line-height: 54px;
                background-color: #f6f6f6;
                color: #606266;
                border-radius: 6px;
                .hot {
                    width: 22px;
                    height: 24px;
                    margin-left: 6px;
                }
            }

            .df {
                display: flex;
                align-items: center;
            }
            .checked {
                background-color: #ffeff1;
                color: #e1251b;
                .icon {
                    position: absolute;
                    right: 0;
                    bottom: 0;
                    width: 28px;
                    height: 27px;
                }
            }
        }
    }
    .type-footer {
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
