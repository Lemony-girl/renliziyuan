<template>
  <div>
    <el-dialog :title="`${showTitle}部门`" :visible="isShowAddDept" @close="close">
      <el-form ref="form" :model="formData" :rules="rules">
        <el-form-item label="部门名称" label-width="100px" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="部门编码" label-width="100px" prop="code">
          <el-input v-model="formData.code" />
        </el-form-item><el-form-item label="部门负责人" label-width="100px" prop="manager">
          <!-- <el-input v-model="formData.manager" /> -->
          <el-select v-model="formData.manager" placeholder="请选择" @focus="getEmployeeSimple">
            <el-option
              v-for="item in options"
              :key="item.value"
              :value="item.username"
            />
          </el-select>
        </el-form-item><el-form-item label="部门介绍" label-width="100px" prop="introduce">
          <el-input v-model="formData.introduce" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="close">取 消</el-button>
          <el-button type="primary" size="small" @click="submit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { getDepartments, addDepartments, getDepartDetail, updateDepartments } from '@/api/departments'
import { getEmployeeSimple } from '@/api/employees'

export default {
  name: 'AddDept',
  props: {
    isShowAddDept: {
      type: Boolean,
      default: false
    },
    // 当前点击的部门数据
    currentNode: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const checkName = async(rule, value, callback) => {
      // 需求：当前输入的name值，是否跟同级的节点有重复的(pid===this.currentNode.id)
      // 获取所有部门数据
      const { depts } = await getDepartments()
      // 找出当前点击部门的子部门
      let currentChildren = null
      if (this.formData.id) {
        // 编辑 与同级节点比较，过滤掉自己
        currentChildren = depts.filter(item => {
          return item.pid === this.currentNode.pid && item.id !== this.currentNode.id
        })
      } else {
        // 新增 与子节点比较
        currentChildren = depts.filter(item => {
          return item.pid === this.currentNode.id
        })
      }

      // value是否和筛选出来的数据结果中的name有重复
      const isRepeat = currentChildren.some(item => item.name === value)
      // if (this.currentNode.children) {
      //   const isRepeat = this.currentNode.children.some(item => item.name === value)
      if (isRepeat) {
        return Promise.reject('部门名称重复了')
      }
      // }
    }
    const checkCode = async(rule, value) => {
      // 获取所有部门数据
      const { depts } = await getDepartments()
      // 检查编码是否有重复
      // const isRepeat = depts.some(item => item.code === value)
      let isRepeat
      if (this.formData.id) {
        // --> 新增的编辑判断逻辑：编辑的时候，需要把自己过滤掉再进行判断
        isRepeat = depts.some(item => item.code === value && item.id !== this.treeNode.id)
      } else {
        isRepeat = depts.some(item => (item.code === value))
      }
      if (isRepeat) {
        return Promise.reject('部门编码重复了')
      }
    }
    return {
      formData: {
        name: '', // 部门名称
        code: '', // 部门编码
        manager: '', // 部门管理者
        introduce: '' // 部门介绍
      },
      // 定义校验规则
      rules: {
        name: [{ required: true, message: '部门名称不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '部门名称要求1-50个字符', trigger: 'blur' },
          { validator: checkName, trigger: 'blur' }],
        code: [{ required: true, message: '部门编码不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '部门编码要求1-50个字符', trigger: 'blur' },
          { validator: checkCode, trigger: 'blur' }],
        manager: [{ required: true, message: '部门负责人不能为空', trigger: 'blur' }],
        introduce: [{ required: true, message: '部门介绍不能为空', trigger: 'blur' },
          { trigger: 'blur', min: 1, max: 300, message: '部门介绍要求1-50个字符' }]
      },
      options: []
    }
  },
  computed: {
    showTitle() {
      return this.formData.id ? '编辑' : '新增'
    }
  },
  methods: {
    // 获取员工简单列表数据
    async  getEmployeeSimple() {
      this.options = await getEmployeeSimple()
    },
    async getDetailById(id) {
      // id->需要获取详情数据的部门id
      this.formData = await getDepartDetail(id)
    },
    // 提交
    async submit() {
      await this.$refs.form.validate()
      // 根据场景判断 编辑还是新增
      if (this.formData.id) {
        // 编辑
        await updateDepartments(this.formData)
      } else {
        // 新增
        await addDepartments({
          ...this.formData, // 把表单的数据对象展开
          pid: this.currentNode.id
        })
      }
      this.$message.success(`${this.showTitle}成功`)
      // 重新拉取列表数据->通知父组件执行
      this.$emit('getDepartments')
      this.close()
    },
    close() {
      // 重置表单数据
      this.$refs.form.resetFields()
      this.formData = {
        name: '', // 部门名称
        code: '', // 部门编码
        manager: '', // 部门管理者
        introduce: '' // 部门介绍
      }
      // 通过.sync提供的自定义事件修改父组件属性
      this.$emit('update:isShowAddDept', false)
    }
  }
}
</script>
