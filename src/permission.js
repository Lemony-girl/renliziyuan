import router from '@/router'
import store from '@/store'
import NProgress from 'nprogress' // 引入一份进度条插件
import 'nprogress/nprogress.css' // 引入进度条样式

const loginPath = '/login'
const notFoundPath = '/404'
const whiteList = [loginPath, notFoundPath]

// 路由前置守卫，监听路由的变化
router.beforeEach(async(to, from, next) => {
  NProgress.start() // 开启进度条
  // 1.是否有token
  const token = store.getters.token
  if (token) {
    // 如果没有用户信息，等拿到用户信息在跳转
    if (!store.getters.userId) {
      // 获取用户信息
      const res = await store.dispatch('user/getUserInfo')// 默认情况静态路由
      // 添加用户拥有的路由权限后，再去做跳转-》filterRoutes
      // routes筛选以后的结果-》用户拥有权限的动态路由列表
      const routes = await store.dispatch('permission/filterRoutes', res.roles.menus)
      // 进行动态路由的添加
      router.addRoutes([...routes,
        // 404 page must be placed at the end !!!
        { path: '*', redirect: '/404', hidden: true }
      ])
      // 重新进行跳转
      next(to.path)
      // console.log(res.roles.menus)
      // store.dispatch('permission/filterRoutes', res.roles.menus)
    }
    // 是否去登录界面
    if (to.path === loginPath) {
      next('/') // 跳转到首页
    } else {
      next() // 直接放行
    }
  } else {
    // 是否去白名单界面
    if (whiteList.includes(to.path)) {
      next() // 直接放行
    } else {
      next(loginPath) // 没有token，要去有权限的界面->跳转到登录界面
    }
  }
})
// 后置守卫
router.afterEach(function() {
  NProgress.done() // 关闭进度条
})
