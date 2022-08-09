<template>
  <div class="dashboard-container">
    <div class="dashboard-text">name: {{ name }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { mixin } from '@/utils/mixin'

export default {
  name: 'Dashboard',
  mixins: [mixin],
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  created() {
    console.log('自己的created')
  },
  mounted() {
    console.log('自己的mounted')
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
