<template>
  <div v-loading="loading" class="dashboard-container">
    <div class="app-container">
      <el-card class="tree-card">
        <!-- 用了一个行列布局 -->
        <tree-tool :is-root="true" :tree-date="company" @handleAddDept="handleAddDept" />
      </el-card>
      <el-tree :data="departs" :props="defaultProps" default-expand-all>
        <template v-slot="{ data }">
          <tree-tool
            :is-root="false"
            :tree-date="data"
            @handleAddDept="handleAddDept"
            @getDepartments="getDepartments"
            @handleEditDept="handleEditDept"
          />
        </template>
      </el-tree>
      <add-dept ref="addDept" :is-show-add-dept.sync="isShowAddDept" :current-node="currentNode" @getDepartments="getDepartments" />
    </div>
  </div>
</template>

<script>
import treeTool from './components/tree-tool.vue'
import { getDepartments } from '@/api/departments'
import { transListToTree } from '@/utils'
import AddDept from './components/add-dept.vue'

export default {
  components: { treeTool, AddDept },
  data() {
    return {
      currentNode: {},
      isShowAddDept: false,
      defaultProps: {
        label: 'name'
      },
      departs: [{ name: '总裁办', manager: '曹操', children: [{ name: '董事会', manager: '关羽' }] },
        { name: '行政部', manager: '刘备' },
        { name: '人事部', manager: '张飞' }],
      company: {
        name: '江苏传智播客教育科技股份有限公司', manager: '负责人', id: ''
      },
      loading: false

    }
  },
  created() {
    this.getDepartments()
  },
  methods: {
    handleAddDept(node) {
      // 弹层展示出来
      this.isShowAddDept = true
      // 把当前点击的节点数据通过currentNode记录下来
      this.currentNode = node
    },
    handleEditDept(node) {
      // 弹层展示出来
      this.isShowAddDept = true
      // 把当前点击的节点数据通过currentNode记录下来
      this.currentNode = node
      // 调用获取详情的方法
      this.$refs.addDept.getDetailById(node.id)
    },
    // 获取数据，渲染页面
    async getDepartments() {
      this.loading = true
      try {
        const res = await getDepartments()
        this.company = { name: res.companyName, manager: res.companyManage || '负责人', id: '' }
        this.departs = transListToTree(res.depts, '') // 需要将其转化成树形结构
        console.log(res)
      } catch (e) {
        console.log(e)
      }
      this.loading = false
    }
  }
}
</script>

<style scoped lang="scss">
.app-container {
  margin: 30px auto;
  width: 850px;
  .tree-card {
    font-size: 14px;
  }
}
</style>
