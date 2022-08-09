<template>
  <div>
    <el-upload
      action="#"
      list-type="picture-card"
      :on-preview="handlePictureCardPreview"
      :on-remove="handleRemove"
      :file-list="fileList"
      :limit="1"
      :class="{completed:isCompleted}"
      :on-change="changeFile"
      :before-upload="beforeUpload"
      :http-request="upload"
    >
      <i class="el-icon-plus" />
    </el-upload>
    <!--  进度条  -->
    <el-progress v-if="showPercent" style="width: 180px" :percentage="percentage" />
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
import COS from 'cos-js-sdk-v5'

const cos = new COS({
  SecretId: 'AKIDe4GBqGPIzlNuEI77wVosiLWR6XkhRwDF',
  SecretKey: 'tbAjDar141sb8RWO1PYhldLsJYabYSOA'
})
export default {
  name: 'ImageUpload',
  data() {
    return {
      showPercent: false,
      percentage: 0,
      dialogImageUrl: '',
      dialogVisible: false,
      // 默认头像
      fileList: [{
        url: 'https://inews.gtimg.com/newsapp_bt/0/13014854736/1000'
      }]
    }
  },
  computed: {
    // 判断是否有图片
    isCompleted() {
      return this.fileList.length >= 1
    }
  },
  methods: {
    changeFile(file, fileList) {
      // fileList最终的文件列表
      this.fileList = fileList
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
      // 如果uid一致，则需要被删除
      // this.fileList = this.fileList.filter(item => item.uid !== file.uid)//1
      this.fileList = fileList // 2
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    // 验证上传的文件格式和大小
    beforeUpload(file) {
      const types = ['image/jpeg', 'image/gif', 'image/bmp', 'image/png']
      if (!types.includes(file.type)) {
        //  如果不包括
        this.$message.error('文件类型不匹配')
        return false
      }
      //  判断文件大小
      const maxSize = 5 * 1024 * 1024 // 1M=1024KB 1KB = 1024B
      if (file.size > maxSize) {
        this.$message.error('文件太大了')
        return false
      }
      // 验证通过，准备上传时打开进度条
      this.showPercent = true
      return true
    },
    // 上传新的图片调用
    upload(params) {
      const { file } = params
      if (!file) return
      cos.putObject({
        Bucket: 'mycos-1313213576', // 存储桶
        Region: 'ap-nanjing', // 地域
        Key: file.name, // 文件名
        Body: file, // 要上传的文件对象
        StorageClass: 'STANDARD', // 上传的模式类型 直接默认 标准模式即可
        onProgress: ({ percent }) => {
          this.percentage = percent * 100
        }
      }, (err, data) => {
        if (err) {
          return this.$message.error(err?.message || '上传出错')
        }
        this.fileList.forEach(item => {
          if (item.uid === file.uid) {
            item.url = `http://${data.Location}`
            // 只有成功获取到了服务器端图片链接的时候，加一个标识
            // 目的：提交更新的时候，进行判断，如果当前文件对象里面没有upload属性，不进行提交
            item.upload = true
          }
        })
        //  上传成功-》进度条关闭-》看到动画效果
        setTimeout(() => {
          this.showPercent = false
          //  进度条清零
          this.percentage = 0
        }, 2000)
      })
    }
  }
}
</script>

<style scoped lang="scss">
.completed {
  ::v-deep .el-upload--picture-card {
    display: none;
  }
}
</style>
