<template>
    <div class="container" :style="customStyle">
        <span class="text">
            Copyright©2025 app版权所有
            <br />
            app备案号
        </span>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    customStyle: {
        type: String
    }
})
</script>

<style lang="scss" scoped>
.container {
    width: 100%;
    text-align: center;
    display: table;
    .text {
        display: table-cell;
        font-size: 18px;
        color: #999;
        vertical-align: middle;
    }
}
</style>
