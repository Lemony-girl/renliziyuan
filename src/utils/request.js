import axios from 'axios'
import router from '@/router'
import {
  Message
} from 'element-ui'
import store from '@/store'
import { getTime } from './auth'

const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_API // 设置axios请求的基础的基础地址
})

// token过期的时间
const timeOut = 600000000
// 如果没有过期返回true,如果过期返回false
function isCheckTime() {
  return Date.now() - getTime() < timeOut
}
// 请求拦截器
request.interceptors.request.use(config => {
  // 如果token存在，请求的时候把token携带到请求头
  const token = store.getters.token
  if (token) {
    // 如果token没有过期，则发送请求
    if (isCheckTime()) {
      // token携带到请求头
      config.headers.Authorization = `Bearer ${token}`
    } else {
      Message.error('登录过期，请重新登录')
      store.dispatch('user/logOut')
      router.push('/')
      return Promise.reject('')
    }
  }
  return config
}, error => Promise.reject(error))

// 响应拦截器
request.interceptors.response.use(response => {
  console.log(response)
  const {
    data: {
      data,
      success,
      message
    }
  } = response
  // 判断success是否为true
  // true时->请求成功，data可用
  console.log(message)
  if (success) {
    return data
  }
  // 如果代码走到这里，证明success不存在->接口请求有问题
  Message.error(message || '系统错误')
  // 失败的promise->接口请求的地方报错
  return Promise.reject(message || '系统错误')
}, error => {
  // 添加错误处理方式
  // 401->退出登录->跳转登录界面
  if (error.response?.status === 401) {
    // 退出登录
    store.dispatch('/user/logOut')
    router.push('/login')
  }
  Message.error(error?.response?.data?.message || '系统错误')
  return Promise.reject(error)
})

// 默认导出request请求
export default request
