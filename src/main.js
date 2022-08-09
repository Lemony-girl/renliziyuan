import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import Components from '@/components/index'
import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control
// 打印功能
import Print from 'vue-print-nb'
Vue.use(Print)
// 一次性注册所有指令
import * as directives from '@/directives/index'
console.log(directives)
for (const key in directives) {
  // 注册指令
  Vue.directive(key, directives[key])
}
// 引入过滤器
import * as filters from '@/filters/index'
// 所有的过滤器，进行全局注册
for (const key in filters) {
  Vue.filter(key, filters[key])
}
// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI)
// use:传入
// 对象：提供install方法，自动调用对象的install方法，然后把Vue传入
// 函数：直接调用函数，然后把Vue传入
Vue.use(Components)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
