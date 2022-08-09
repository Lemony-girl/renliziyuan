<template>
  <div class="dashboard-container">
    <div class="app-container">
      <ToolBar>
        <template #before>
          <span>共五十条记录</span>
        </template>
        <template #after>
          <el-button type="primary" size="mini" @click="$router.push('/import')">导入</el-button>
          <el-button type="danger" size="mini" @click="exportToExcel">导出</el-button>
          <el-button type="warning" size="mini" @click="isShowAddEmpDialog=true">新增员工</el-button>
        </template>
      </ToolBar>
      <el-card v-loading="loading">
        <el-table border :data="list">
          <el-table-column label="序号" sortable="" type="index" />
          <el-table-column label="姓名" sortable="" prop="username" />
          <el-table-column>
            <template v-slot="{row}">
              <el-avatar
                style="width:80px;height:80px"
                :src="row.staffPhoto"
                @click.native="showQrCode(row.staffPhoto)"
              >
                <img src="https://inews.gtimg.com/newsapp_bt/0/13014854736/1000" alt="">
              </el-avatar>
            </template>
          </el-table-column>
          <el-table-column label="工号" sortable="" prop="workNumber" />
          <el-table-column :formatter="formatter" label="聘用形式" sortable="" prop="formOfEmployment" />
          <el-table-column label="部门" sortable="" prop="departmentName" />
          <el-table-column label="入职时间" sortable="" prop="timeOfEntry">
            <template v-slot="{row}">
              {{ row.timeOfEntry|formatDate }}
            </template>
          </el-table-column>
          <el-table-column label="账户状态" sortable="" prop="enableState" />
          <el-table-column label="操作" sortable="" fixed="right" width="280">
            <template v-slot="{row}">
              <el-button type="text" size="small" @click="$router.push(`/employees/detail/${row.id}`)">查看</el-button>
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调岗</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button type="text" size="small" @click="editRole(row.id)">角色</el-button>
              <el-button type="text" :disabled="checkPermission('DELETE_USER')" size="small" @click="del(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <el-row type="flex" justify="center" align="middle" style="height: 60px">
          <el-pagination
            layout="prev, pager, next"
            :page-size="page.size"
            :current-page.sync="page.page"
            :total="total"
            @current-change="changePage"
          />
        </el-row>
        <AddEmployee :is-show-add-emp-dialog.sync="isShowAddEmpDialog" />
      </el-card>
    </div>
    <el-dialog :visible.sync="showAvatar" title="二维码预览">
      <el-row type="flex" justify="center">
        <canvas ref="cancas" />
      </el-row>
    </el-dialog>
    <!--  分配角色对话框  -->
    <AssignRole ref="roleRef" :show-dialog.sync="showDialog" :current-id="currentId" />
  </div>
</template>

<script>
import ToolBar from '@/components/ToolBar'
import { deleteRole, getEmployeeList } from '@/api/employees'
import EmployeeEnum from '@/api/constant/employees'
import AddEmployee from '@/views/employees/components/add-employee.vue'
import AssignRole from '@/views/employees/components/assign-role'
import { formatDate } from '@/filters'
import QrCode from 'qrcode'
import { mixin } from '@/utils/mixin'

export default {
  components: {
    ToolBar,
    AddEmployee,
    AssignRole
  },
  mixins: [mixin],
  data() {
    return {
      showDialog: false,
      value2: false,
      loading: false,
      list: [], // 接数据的
      currentId: null,
      page: {
        page: 1, // 当前页码
        size: 10

      },
      total: 0, // 总数
      isShowAddEmpDialog: false,
      showAvatar: false
    }
  },
  created() {
    this.getEmployeeList()
  },
  methods: {
    showQrCode(url) {
      this.showAvatar = true
      this.$nextTick(() => {
        QrCode.toCanvas(this.$refs.cancas, url)
      })
    },
    changePage(newPage) {
      this.page.page = newPage
      this.getEmployeeList()
    },
    async getEmployeeList() {
      this.loading = true
      const { rows, total } = await getEmployeeList(this.page)
      this.total = total
      this.list = rows
      this.loading = false
    },
    formatter(row, column, cellvalue) {
      console.log(cellvalue)
      const currentData = EmployeeEnum.hireType.find(item => item.id === cellvalue)?.value
      return currentData || '未知'
    },
    // 删除
    async del(id) {
      try {
        await this.$confirm('是否删除？')
        await deleteRole(id)
        this.$message.success('删除成功')
        await this.getEmployeeList()
      } catch (e) {
        console.log(e)
      }
    },
    // 导出
    async exportToExcel() {
      // 表头对应关系
      const headers = {
        '姓名': 'username',
        '手机号': 'mobile',
        '入职日期': 'timeOfEntry',
        '聘用形式': 'formOfEmployment',
        '转正日期': 'correctionTime',
        '工号': 'workNumber',
        '部门': 'departmentName'
      }
      // 获取所有的员工数据
      const { rows } = await getEmployeeList({
        page: 1, size: this.total
      })
      // 调用方法处理员工数据->返回的值是所有的员工数据->传入方法进行数据的处理
      const resData = this.formatterData(rows, headers)
      // 使用import语法的文件会单独打包出一个文件
      // 魔法注释->自定义文件名
      const { export_json_to_excel } = await import(
        /* webpackChunkName:'export2Excel' */
        '@/utils/Export2Excel')
      export_json_to_excel({
        header: Object.keys(headers), // 表头 必填
        data: resData, // 具体数据 必填
        filename: 'excel-list', // 非必填
        autoWidth: true, // 非必填
        bookType: 'xlsx' // 非必填
      })
    },
    formatterData(rows, headers) {
      const res = rows.map(item => {
        // item里面的值按照headers的顺序排列->数组
        return Object.keys(headers).map(key => {
          // 如果是事件->格式化
          // 如果是聘用形式-》转化-》正式，非正式，未知
          if (['timeOfEntry', 'correctionTime'].includes(headers[key])) {
            return formatDate(item[headers[key]])
          }
          if (headers[key] === 'formOfEmployment') {
            return EmployeeEnum.hireType.find(child => {
              return +child.id === +item[headers[key]]
            })?.value || '未知'
          }
          // 中文的key->英文的key->拿到值
          return item[headers[key]]
        })
      })
      return res
    },
    // 点击角色的编辑按钮
    async editRole(id) {
      this.currentId = id
      await this.$refs.roleRef.getUserDetailById(id)
      this.showDialog = true
    }
  }

}
</script>

<style>

</style>
