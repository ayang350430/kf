<template>
  <div class="user-management-container">
    <div class="page-header">
      <h2>坐席管理</h2>
      <div class="link-section">
        <div class="link-info">
          <span>专属链接</span>
          <el-input 
            v-model="specialLink" 
            readonly 
            class="link-input"
          >
            <template #append>
              <el-button @click="copyLink">复制</el-button>
            </template>
          </el-input>
        </div>
        <div class="link-description">
          <span>使用说明: 专属链接后面带入 userCode</span>
          <span>例如:https://chat.zj.com/uffff?userCode=zhangsan</span>
        </div>
      </div>
    </div>

    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索"
        class="search-input"
        clearable
      />
      <el-button type="primary" @click="handleAdd">新增</el-button>
    </div>

    <el-table
      :data="filteredUsers"
      border
      style="width: 100%"
      :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
    >
      <el-table-column prop="nickname" label="昵称" width="180" />
      <el-table-column prop="username" label="用户名" width="180" />
      <el-table-column prop="status" label="是否在线">
        <template #default="scope">
          <span :class="scope.row.status === '在线' ? 'status-online' : 'status-offline'">
            {{ scope.row.status }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginTime" label="最后登录时间" />
      <el-table-column prop="registerTime" label="注册时间" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredUsers.length"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="500px"
    >
      <el-form :model="userForm" label-width="100px" :rules="rules" ref="userFormRef">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 专属链接
const specialLink = ref('https://chat.zj.com/uffff')

// 复制链接
const copyLink = () => {
  navigator.clipboard.writeText(specialLink.value)
    .then(() => {
      ElMessage.success('链接已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
}

// 搜索和分页
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// 用户数据
const users = reactive([
  {
    id: 'A000001',
    nickname: 'A000001',
    username: 'A00001',
    status: '在线',
    lastLoginTime: '2025/12/12 12:12:12',
    registerTime: '2025/12/12 12:12:12'
  },
  {
    id: 'A00002',
    nickname: 'A00002',
    username: 'A000002',
    status: '离线',
    lastLoginTime: '2025/12/12 12:12:12',
    registerTime: '2025/12/12 12:12:11'
  }
])

// 过滤用户数据
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users
  
  return users.filter(user => 
    user.nickname.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const userForm = reactive({
  id: '',
  nickname: '',
  username: '',
  password: '',
  status: '离线',
  lastLoginTime: '',
  registerTime: ''
})
const userFormRef = ref(null)

// 表单验证规则
const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

// 新增用户
const handleAdd = () => {
  dialogType.value = 'add'
  userForm.id = ''
  userForm.nickname = ''
  userForm.username = ''
  userForm.password = ''
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row) => {
  dialogType.value = 'edit'
  userForm.id = row.id
  userForm.nickname = row.nickname
  userForm.username = row.username
  dialogVisible.value = true
}

// 删除用户
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除用户 ${row.nickname} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      const index = users.findIndex(user => user.id === row.id)
      if (index !== -1) {
        users.splice(index, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 提交表单
const submitForm = () => {
  userFormRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 新增用户
        const newUser = {
          id: `A${(users.length + 1).toString().padStart(6, '0')}`,
          nickname: userForm.nickname,
          username: userForm.username,
          status: '离线',
          lastLoginTime: '-',
          registerTime: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }).replace(/\//g, '-')
        }
        users.push(newUser)
        ElMessage.success('添加成功')
      } else {
        // 编辑用户
        const index = users.findIndex(user => user.id === userForm.id)
        if (index !== -1) {
          users[index].nickname = userForm.nickname
          users[index].username = userForm.username
          ElMessage.success('更新成功')
        }
      }
      dialogVisible.value = false
    } else {
      return false
    }
  })
}
</script>

<style scoped lang="scss">
.user-management-container {
  padding: 30px;
  background-color: #f9f9f9;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 20px;
  border-bottom: 1px solid #eaeaea;
}

.page-header h2 {
  font-size: 24px;
  color: #333;
  margin: 0;
  position: relative;
  padding-left: 12px;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    background-color: #4080ff;
    border-radius: 2px;
  }
}

.link-section {
  display: flex;
  gap: 30px;
  align-items: center;
  background-color: #f0f7ff;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e0f0ff;
}

.link-info {
  display: flex;
  align-items: center;
  gap: 10px;
  
  span {
    font-weight: 500;
    color: #333;
  }
}

.link-input {
  width: 350px;
  
  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #dcdfe6 inset;
  }
  
  :deep(.el-input-group__append) {
    background-color: #4080ff;
    border-color: #4080ff;
    
    .el-button {
      color: white;
      border: none;
      
      &:hover {
        background-color: #3a75e6;
      }
    }
  }
}

.link-description {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: #666;
  background-color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  border-left: 3px solid #4080ff;
}

.search-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.search-input {
  width: 300px;
  
  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #dcdfe6 inset;
    
    &:hover {
      box-shadow: 0 0 0 1px #c0c4cc inset;
    }
    
    &.is-focus {
      box-shadow: 0 0 0 1px #4080ff inset;
    }
  }
}

.el-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  
  :deep(th.el-table__cell) {
    background-color: #f5f7fa;
    color: #606266;
    font-weight: 600;
  }
  
  :deep(.el-button) {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  :deep(.el-button--primary) {
    background-color: #4080ff;
    border-color: #4080ff;
    
    &:hover {
      background-color: #3a75e6;
      border-color: #3a75e6;
    }
  }
  
  :deep(.el-button--danger) {
    &:hover {
      opacity: 0.9;
    }
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.status-online {
  color: #67c23a;
  font-weight: 500;
  position: relative;
  padding-left: 15px;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    background-color: #67c23a;
    border-radius: 50%;
  }
}

.status-offline {
  color: #909399;
  font-weight: 500;
  position: relative;
  padding-left: 15px;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    background-color: #909399;
    border-radius: 50%;
  }
}

:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
  
  .el-dialog__header {
    background-color: #f5f7fa;
    margin: 0;
    padding: 15px 20px;
    border-bottom: 1px solid #eaeaea;
  }
  
  .el-dialog__body {
    padding: 20px;
  }
  
  .el-dialog__footer {
    border-top: 1px solid #eaeaea;
    padding: 15px 20px;
  }
  
  .el-form-item__label {
    font-weight: 500;
  }
}
</style>