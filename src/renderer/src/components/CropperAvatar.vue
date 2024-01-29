<template>
  <div class="avatar-container" @click.self="selectImage">
    <el-upload ref="selectImage" action="#" :http-request="() => { }" :before-upload="beforeUpload"
      :show-file-list="false">
      <el-button class="hidden-button" size="small" type="primary">点击上传</el-button>
    </el-upload>
    <img :src="options.img" title="点击上传" class="img-box" />
  </div>

  <el-dialog title="裁剪图片" v-model="dialogVisible" width="800px" append-to-body @opened="openDialog" @close="closeDialog">
    <el-row>
      <el-col :span="12" style="height: 300px;">
        <vue-cropper ref="cropper" :img="options.img" :info="true" :autoCrop="options.autoCrop"
          :autoCropWidth="options.autoCropWidth" :autoCropHeight="options.autoCropHeight" :fixedBox="options.fixedBox"
          :outputType="options.outputType" @realTime="realTime" v-if="showCropper" />
      </el-col>
      <el-col :span="12" style="height: 300px;">
        <div class="preview-box">
          <img :src="previews.url" :style="previews.img" />
        </div>
      </el-col>
    </el-row>
    <el-row style="margin-top: 12px;">
      <el-col :span="12">
        <el-row>
          <el-col :span="8">
            <el-upload action="#" :http-request="() => { }" :before-upload="beforeUpload" :show-file-list="false">
              <el-button>选择</el-button>
            </el-upload>
          </el-col>
          <el-col :span="4">
            <el-button :icon="Plus" @click="changeScale(1)"></el-button>
          </el-col>
          <el-col :span="4">
            <el-button :icon="Minus" @click="changeScale(-1)"></el-button>
          </el-col>
          <el-col :span="4">
            <el-button :icon="RefreshLeft" @click="rotateLeft()"></el-button>
          </el-col>
          <el-col :span="4">
            <el-button :icon="RefreshRight" @click="rotateRight()"></el-button>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="4" :offset="8">
        <el-button type="primary" @click="uploadImg()">提 交</el-button>
      </el-col>
    </el-row>
  </el-dialog>
</template>
   
<script setup>
import { Plus, Minus, RefreshLeft, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { uploadImage, getByName } from "../api/image";
import "vue-cropper/dist/index.css";
import { VueCropper } from "vue-cropper";
import { getCurrentInstance, ref, reactive, watch } from 'vue';

const { proxy } = getCurrentInstance();
const props = defineProps({
  dataInfo: {
    type: Object,
    default: {}
  }
})
const dialogVisible = ref(false);
const showCropper = ref(false);
// cropper配置  更多配置可参考 https://www.npmjs.com/package/vue-cropper
const options = reactive({
  img: props.dataInfo.img, // 裁剪图片的地址
  autoCropWidth: 200, // 默认生成截图框宽度 默认容器的 80%
  autoCropHeight: 200, // 默认生成截图框高度 默认容器的 80%
  outputType: "png", // 裁剪生成图片的格式 jpeg, png, webp
  autoCrop: true, // 是否默认生成截图框
  fixedBox: false, // 固定截图框大小
});
const previews = ref({
  url: ''
})

watch(
  () => props.dataInfo,
  () => {
    options.img = props.dataInfo.img;
  },
  { deep: true, immediate: true }
)

// 编辑图片
const selectImage = () => {
  console.log('selectImage');
  proxy.$refs.selectImage.$el.querySelector('.hidden-button').click();
}

// 打开裁剪弹窗
const openDialog = () => {
  showCropper.value = true;
}
// 修改图片大小 正数为变大 负数变小
const changeScale = (num) => {
  num = num || 1;
  proxy.$refs.cropper.changeScale(num);
}
// 向左边旋转90度
const rotateLeft = () => {
  proxy.$refs.cropper.rotateLeft();
}
// 向右边旋转90度
const rotateRight = () => {
  proxy.$refs.cropper.rotateRight();
}
// 上传图片处理
const beforeUpload = (rawFile) => {
  if (rawFile.type.indexOf("image/") == -1) {
    ElMessage.error('请上传图片类型文件!')
    return false
  }
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('文件大小不能超过2MB!')
    return false
  }
  const reader = new FileReader();
  reader.readAsDataURL(rawFile);
  reader.onload = () => {
    options.img = reader.result;
  };
  dialogVisible.value = true;
}
// 上传图片
const uploadImg = () => {
  proxy.$refs.cropper.getCropBlob((data) => {
    let formData = new FormData();
    formData.append("file", data, "avatar_" + Date.parse(new Date()) + ".png");
    uploadImage(formData).then((res) => {
      if (res.code == 200) {
        options.img = getByName(res.data.fileName);
        props.dataInfo.img = options.img;
        showCropper.value = false;
        dialogVisible.value = false;
        ElMessage.success("上传成功！");
      } else {
        ElMessage.error(res.message || '上传失败！')
      }
    }).catch((err) => {
      console.log(err)
      ElMessage.error("上传失败！")
    })
  });
}
// 实时预览事件
const realTime = (data) => {
  previews.value = data;
}
// 关闭弹窗
const closeDialog = () => {
  options.img = props.dataInfo.img;
  console.log('closeDialog')
  proxy.$refs.selectImage.clearFiles()
}
</script>
   
<style lang='scss' scoped>
.avatar-container {
  position: relative;
  display: flex;
  justify-content: center;
  height: 100px;
  width: 100px;
  margin: auto;

  .hidden-button {
    display: none;
  }

  &:hover {
    &::after {
      content: "+";
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 30px;
      font-weight: bold;
      color: #fff;
      background: rgba(0, 0, 0, 0.5);
      cursor: pointer;
    }
  }

  .img-box {
    border-radius: 50%;
    border: 1px solid #ccc;
  }
}

.preview-box {
  position: absolute;
  top: 50%;
  transform: translate(50%, -50%);
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 1px solid #ccc;
  overflow: hidden;
}
</style>