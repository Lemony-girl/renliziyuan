// 该文件负责所有的公共的组件的全局注册   Vue.use
import ToolBar from '@/components/ToolBar'
import UploadExcel from '@/components/UploadExcel'
import ImageUpload from '@/components/ImageUpload'

export default {
  install(Vue) {
    //  注册全局的通用栏组件对象
    Vue.component(ToolBar.name)
    Vue.component(UploadExcel.name, UploadExcel)
    Vue.component(ImageUpload.name, ImageUpload)
  }
}
