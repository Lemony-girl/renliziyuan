<template>
  <div class="dashboard-container">
    <div class="app-container">
      <el-card>
        <el-tabs>
          <!-- 放置页签 -->
          <el-tab-pane label="角色管理">
            <!-- 新增角色按钮 -->
            <el-row style="height: 60px">
              <el-button
                icon="el-icon-plus"
                size="small"
                type="primary"
                @click="showDialog = true"
              >新增角色</el-button>
            </el-row>
            <el-table border="" :data="list">
              <el-table-column align="center" type="index" label="序号" width="120" />
              <el-table-column align="center" prop="name" label="名称" width="240" />
              <el-table-column align="center" prop="description" label="描述" />
              <el-table-column align="center" label="操作">
                <template slot-scope="{ row }">
                  <el-button size="small" type="success" @click="assignPerm(row.id)">分配权限</el-button>
                  <el-button size="small" type="primary" @click="edit(row.id)">编辑</el-button>
                  <el-button size="small" type="danger" @click="del(row.id)">删除</el-button>
                </template>
              </el-table-column>

            </el-table>
            <!-- 放置分页组件 -->
            <el-row type="flex" justify="center" align="middle" style="height:60px">
              <el-pagination
                :current-page="page.page"
                :page-size="page.pagesize"
                :total="page.total"
                layout="prev, pager, next"
                @current-change="changeCurrent"
              />
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="公司信息">
            <el-alert
              title="对公司名称、公司地址、营业执照、公司地区的更新，将使得公司资料被重新审核，请谨慎修改"
              type="info"
              show-icon
              :closable="false"
            />
            <el-form label-width="120px" style="margin-top:50px">
              <el-form-item label="公司名称">
                <el-input v-model="formData.name" disabled style="width:400px" />
              </el-form-item>
              <el-form-item label="公司地址">
                <el-input v-model="formData.companyAddress" disabled style="width:400px" />
              </el-form-item>
              <el-form-item label="邮箱">
                <el-input v-model="formData.mailbox" disabled style="width:400px" />
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="formData.remarks" type="textarea" :rows="3" disabled style="width:400px" />
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
      <el-dialog :title="`${this.roleForm.id?'编辑':'新增'}弹层`" :visible="showDialog" @close="close">
        <el-form ref="roleForm" :model="roleForm" :rules="rules" label-width="120px">
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="roleForm.name" />
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="roleForm.description" />
          </el-form-item>
        </el-form>
        <!-- 底部 -->
        <el-row slot="footer" type="flex" justify="center">
          <el-col :span="6">
            <el-button size="small" @click="close">取消</el-button>
            <el-button size="small" type="primary" @click="btnOK">确定</el-button>
          </el-col>
        </el-row>
      </el-dialog>
      <!--    分配权限  -->
      <el-dialog title="分配权限" :visible="showPermDialog" @close="btnPermCancel">
        <!-- 权限是一颗树 -->
        <!-- 将数据绑定到组件上 -->
        <!-- check-strictly 如果为true 那表示父子勾选时  不互相关联 如果为false就互相关联 -->
        <!-- id作为唯一标识 -->
        <el-tree
          ref="treeRef"
          :data="permissionList"
          :props="props"
          :show-checkbox="true"
          :check-strictly="true"
          :default-expand-all="true"
          :default-checked-keys="checkedKeys"
          node-key="id"
        />
        <!-- 确定 取消 -->
        <el-row slot="footer" type="flex" justify="center">
          <el-col :span="6">
            <el-button type="primary" size="small" @click="btnOkPermission">确定</el-button>
            <el-button size="small" @click="btnPermCancel">取消</el-button>
          </el-col>
        </el-row>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { addRole, assignPerm, deleteRole, getCompanyInfo, getRoleDetail, getRoleList, updateRole } from '@/api/setting'
import { transListToTree } from '@/utils'
import { getPermissionList } from '@/api/permisson'

export default {
  data() {
    return {
      list: [], // 承接数组
      page: {
        // 放置页码及相关数据
        page: 1,
        pagesize: 4,
        total: 0 // 记录总数
      },
      formData: '',
      showDialog: false, // 编辑弹层
      // 专门接收新增或者编辑的编辑的表单数据
      roleForm: {
        name: '',
        description: ''
      },
      rules: {
        name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }]
      },
      showPermDialog: false, // 控制分配权限弹层的显示后者隐藏
      props: {
        label: 'name'
      },
      permissionList: [], // 专门用来接收权限数据 树形数据
      checkedKeys: [], // 定义一个数组来接收 已经选中的节点
      currentRoleId: null // 用来记录分配角色的id
    }
  },
  created() {
    this.getRoleList() // 获取角色列表
    this.getCompanyInfo()// 获取公司信息
  },
  methods: {
    async btnOkPermission() {
      const checkedKeys = this.$refs.treeRef.getCheckedKeys()
      await assignPerm({
        id: this.currentRoleId, // 当前点击的角色id
        permIds: checkedKeys// 修改以后的权限列表
      })
      this.$message.success('分配权限成功')
      this.btnPermCancel()
    },
    handleClick(tab, event) {
      console.log(tab, event)
    },
    async getRoleList() {
      const { total, rows } = await getRoleList(this.page)
      this.page.total = total
      this.list = rows
    },
    changeCurrent(newPage) {
      // newPage是当前点击的页码
      this.page.page = newPage // 将当前页码赋值给当前的最新页码
      this.getRoleList()
    },
    // 获取公司详情信息
    async getCompanyInfo() {
      this.formData = await getCompanyInfo(this.$store.getters.companyId)
    },
    async del(id) {
      // 点击删除提示
      await this.$confirm('确认删除?')
      // 获取当前页面删除之前的数据长度
      const len = this.list.length
      await deleteRole(id)
      if (len === 1 && this.page.page > 1) {
        this.page--
      }
      // 重新获取数据
      // 成功的提示
      this.$message.success('删除成功')
      // 重新获取数据
      this.getRoleList()
    },
    async edit(id) {
      this.showDialog = true
      this.roleForm = await getRoleDetail(id)
    },
    close() {
      this.showDialog = false
      // 清除表单
      this.$refs.roleForm.resetFields()
      this.roleForm = {
        name: '',
        description: ''
      }
    },
    async btnOK() {
      // 表单校验
      await this.$refs.roleForm.validate()
      // 提交 新增/编辑
      if (this.roleForm.id) {
        // 调用编辑的接口
        await updateRole(this.roleForm)
      } else {
        //
        await addRole(this.roleForm)
      }
      this.$message.success('成功')
      // 重新获取数据
      await this.getRoleList()
      this.close()
    },
    // 分配权限弹出层
    async assignPerm(id) {
      this.currentRoleId = id
      // 获取权限点数据 在点击的时候调用 获取权限点数据
      const res = transListToTree(await getPermissionList(), '0')
      this.permissionList = res
      const { permIds } = await getRoleDetail(id)// permIds是当前角色所拥有的权限点数据
      this.checkedKeys = permIds
      this.showPermDialog = true
    },
    btnPermCancel() {
      this.checkedKeys = []
      this.showPermDialog = false
    }
  }
}
</script>
