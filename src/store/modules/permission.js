import { asyncRoutes, constantRoutes } from '@/router'

const state = {
  routes: constantRoutes
}
const mutations = {
  setRoutes(state, newRoutes) {
    state.routes = [...constantRoutes, ...newRoutes]
  }
}
const actions = {
  filterRoutes(context, menus) {
    const resRoutes = asyncRoutes.filter(item => {
      return menus.includes(item.name)
    })
    context.commit('setRoutes', resRoutes)
    return resRoutes
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
