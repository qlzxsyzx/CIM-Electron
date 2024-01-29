<template>
    <!-- 包裹头像或者svgIcon的容器，button作用 -->
    <div class="button-box">
        <slot></slot>
    </div>
</template>

<script setup>

</script>

<style lang="scss">
.button-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 50px;
    min-height: 50px;
    border-radius: 5px;
    padding: 5px;
    cursor: pointer;

    // 点击时，动画从左到右填充背景色
    @keyframes fill {
        0% {
            background-color: transparent;
        }
        100% {
            background-color: #409eff;
        }
    }


    // 点击时保持hover状态
    &.click {
        animation: 0.5s fill;
        background-color: #409eff;
        .svg-icon {
            fill: #fff;
        }
        &:hover {
            background-color: #409eff;
            .svg-icon {
                fill: #fff;
            }
        }
    }
    // hover时改变背景色
    &:hover {
        background-color: #5f5f5f;
        .svg-icon {
            fill: #409eff;
        }
        .icon-svg {
            fill: #409eff;
        }
        .icon-svg-dark {
            fill: #fff;
        }
        .icon-svg-light {
            fill: #000;
        }
        .icon-svg-disabled {
            fill: #c0c4cc;
        }
    }

    &.close:hover {
        background-color: #ff4949;
        .svg-icon {
            fill: #fff;
        }
    }

    &.more:hover {
        background-color: #7172721f;
        .svg-icon {
            fill: #fff;
        }
    }

    &.friend-info-button:hover {
        background-color: #7172721f;
        .svg-icon {
            fill: #409eff;
        }
        .title {
            color: #409eff;
        }
    }

    &.friend-info-button {
        .svg-icon {
            fill: #40a0ffbd;
        }
        .title {
            color: #40a0ffbd;
        }
    }
    

    .icon-svg {
        fill: #c0c4cc;
    }
    .icon-svg-dark {
        fill: #fff;
    }
    .icon-svg-light {
        fill: #000;
    }
    .icon-svg-disabled {
        fill: #c0c4cc;
    }
    .el-icon {
        width: 1em;
        height: 1em;
        vertical-align: -0.15em;
        fill: currentColor;
        overflow: hidden;
    }
    .el-icon-check {
        color: #67c23a;
    }
    .el-icon-close { 
        color: #f56c6c;
    }
    .el-icon-loading { 
        color: #409eff;
    }
    .el-icon-loading:after {
        content: '';
        display: block;
        width: 1em;
        height: 1em;
        border-radius: 50%;
        border: 2px solid #fff;
        border-bottom-color: transparent;
        border-left-color: transparent;
        animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg);
        }
    }
}
</style>