<template>
  <div class="dashboard-container">
    <div class="app-container">
      <el-card>
        <el-tabs>
          <el-tab-pane label="登录账户设置">
            <!-- 放置表单 -->
            <el-form
              ref="formRef"
              :model="formData"
              :rules="rules"
              label-width="120px"
              style="margin-left: 120px; margin-top:30px"
            >
              <el-form-item label="姓名:" prop="username">
                <el-input v-model="formData.username" style="width:300px" />
              </el-form-item>
              <el-form-item label="密码:" prop="password2">
                <el-input v-model="formData.password2" style="width:300px" type="password" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary">更新</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="个人详情">
            <UserInfo />
          </el-tab-pane>
          <el-tab-pane label="岗位信息">
            <JobInfo />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script>
import { getUserDetailById } from '@/api/user'
import { saveUserDetailById } from '@/api/employees'
import UserInfo from '@/views/employees/components/user-info'
import JobInfo from '@/views/employees/components/job-info'

export default {
  components: {
    UserInfo,
    JobInfo
  },
  data() {
    return {
      formData: {
        username: '',
        password2: ''
      },
      rules: {
        username: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        password2: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, max: 16, message: '密码长度6到16位' }]
      }
    }
  },
  created() {
    // 获取用户信息
    this.getUserInfo()
    this.updateUserInfo()
  },
  methods: {
    async getUserInfo() {
      this.formData = await getUserDetailById(this.$route.params.id)
    },
    async updateUserInfo() {
      await this.$refs.formRef.validate()
      try {
        await saveUserDetailById({
          ...this.formData,
          passowrd: this.formData.password2
        })
        this.$message.success('更新成功')
      } catch (e) {
        this.$message.error(e.message || '更新失败')
      }
    }
  }
}
</script>

<style>

</style>
