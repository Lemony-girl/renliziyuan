import { getUserDetailById, getUserInfo, login } from '@/api/user'
import { getToken, removeToken, setToken } from '@/utils/auth'
import { resetRouter } from '@/router'

// 状态
const state = {
  token: getToken(),
  userInfo: {}
}
// 修改状态
const mutations = {
  // 修改状态
  setUserInfo(state, userInfo) {
    state.userInfo = userInfo
  },
  // 修改token的方法
  setToken(state, token) {
    state.token = token // 修改vuex的状态
    // token->cookie
    setToken(token) // 本地存储的token
  },
  // 清除token
  removeToken(state) {
    state.token = null
    removeToken()
  },
  // 清除userInfo
  removeUserInfo(state) {
    state.userInfo = {}
  }
}
// 执行异步
const actions = {
  // 登录请求->commit->mutations
  async login(context, data) {
    console.log(context)
    const res = await login(data)
    console.log(res)
    context.commit('setToken', res)
  },
  // 获取用户资料的action
  async getUserInfo(context) {
    const res = await getUserInfo() // 获取返回值
    const baseInfo = await getUserDetailById(res.userId) // 为了获取头像
    context.commit('setUserInfo', { ...res, ...baseInfo }) // 将整个的个人信息设置到用户的vuex数据中
    return {
      ...baseInfo, ...res
    }
  },
  // 退出登录
  logOut(context) {
    // 调用清除token和userInfo的方法
    context.commit('removeToken')
    context.commit('removeUserInfo')
    // 重置路由匹配信息
    resetRouter()
    // context是根节点的上下文
    // vuex里面的路由表置空
    context.commit('permission/setRoutes', [], { root: true })
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
