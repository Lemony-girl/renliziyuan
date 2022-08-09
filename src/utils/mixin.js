import store from '@/store'

export const mixin = {
  // created() {
  //   console.log('混入对象的created')
  // },
  // mounted() {
  //   console.log('混入对象的mounted')
  // }
  methods: {
    checkPermission(key) {
      return !store.state.user.userInfo.roles.points.includes(key)
    }
  }
}
