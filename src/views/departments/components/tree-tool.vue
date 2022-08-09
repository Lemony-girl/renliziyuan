<template>
  <el-row type="flex" justify="space-between" align="middle" style="width: 100%;">
    <el-col>
      <span>{{ treeDate.name }}</span>
    </el-col>
    <el-col :span="6">
      <el-row type="flex" justify="end">
        <!-- 两个内容 -->
        <el-col>{{ treeDate.manager }}</el-col>
        <el-col>
          <!-- 下拉菜单 element -->
          <el-dropdown @command="clickItem">
            <span>
              操作<i class="el-icon-arrow-down" />
            </span>
            <!-- 下拉菜单 -->
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="add">添加部门</el-dropdown-item>
              <el-dropdown-item v-if="!isRoot" command="edit">编辑部门</el-dropdown-item>
              <el-dropdown-item v-if="!isRoot" command="del">删除部门</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import { delDepartments } from '@/api/departments'
export default {
  props: {
    treeDate: {
      type: Object,
      default: () => ({})
    },
    isRoot: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {

    }
  },
  methods: {
    async clickItem(type) {
      if (type === 'add') {
        // 添加部门
        this.$emit('handleAddDept', this.treeDate)
        console.log('add')
      } else if (type === 'edit') {
        // 编辑部门
        this.$emit('handleEditDept', this.treeDate)
      } else {
        // 删除部门
        console.log('del')
        await this.$confirm('确认删除？')
        console.log('确定')
        await delDepartments(this.treeDate.id)
        // 删除成功
        this.$message.success('删除成功')
        this.$emit('getDepartments')
      }
    }
  }
}
</script>

<style>

</style>
