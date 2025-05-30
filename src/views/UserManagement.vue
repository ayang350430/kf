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
        @input="debounceSearch"
      >
        <template #prefix>
          <i class="el-icon-search search-icon"></i>
        </template>
      </el-input>
      <el-button type="primary" class="add-button" @click="handleAdd">
        <i class="el-icon-plus"></i> 新增
      </el-button>
    </div>
    
    <div class="table-container">
      <el-table
        :data="filteredUsers"
        border
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
        stripe
        highlight-current-row
      >
        <el-table-column prop="id" label="用户ID" width="180" />
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="nickName" label="昵称" width="180" />
        <el-table-column prop="status" label="是否激活">
          <template #default="scope">
            <span :class="scope.row.enabled ? 'status-online' : 'status-offline'">
              {{ scope.row.enabled? '激活' : '未激活' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column prop="updateTime" label="修改时间" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button
                size="small"
                type="primary"
                @click="handleEdit(scope.row)"
                class="edit-button"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDelete(scope.row)"
                class="delete-button"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
         prev-text="上一页"
        next-text="下一页"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
      />
    </div>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增坐席' : '编辑坐席'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="userForm" label-width="100px" :rules="rules" ref="userFormRef">
        <el-form-item label="昵称/账号" prop="nickname">
          <el-input v-model="userForm.nickname" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" class="cancel-button">取消</el-button>
          <el-button type="primary" @click="submitForm" class="confirm-button">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// 引入api
import { addAgents, getShiftsList, updateAgents, deleteAgents } from '../api/staff'
// 导入rsa加密
import { encrypt } from '../utils/rsaEncypt.js'

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
let total = ref(0);

// 用户数据
const users = ref([])

// 过滤用户数据
const filteredUsers = computed(() => {
  return users.value
})

// 防抖搜索
let searchTimer = null
const debounceSearch = (val) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    getAgentsListApi(val)
  }, 300)
}


// 获取坐席列表
const getAgentsListApi = async (blurry) => {
  users.value = []
  total.value = 0
  const res = await getShiftsList({blurry: blurry});
  if (res.content.length > 0) {
    users.value = res.content;
    total.value = res.totalElements;
  }
}

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
const handleDelete = async (row) => {
    const res = await deleteAgents(row.id);
    if (res == 'OK') {
      ElMessage.success('删除成功')
      getAgentsListApi();
    }
}

// 提交表单 新增/编辑
const submitForm = () => {
  userFormRef.value.validate( async (valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 新增用户
        let newUser = {
            nickName: userForm.nickname,
            password: encrypt(userForm.password),
            username: userForm.username,
        }
        const res = await addAgents(newUser);
        console.log(res);
        if (res == 'OK') {
          ElMessage.success('添加成功')
          getAgentsListApi();
        }
      } else {
        // 编辑用户
        let newUser = {
            nickName: userForm.nickname,
            password: encrypt(userForm.password),
            username: userForm.username,
        }
        const res = await updateAgents(newUser);
        if (res == 'OK') {
          ElMessage.success('修改成功')
          getAgentsListApi();
        }
      }
      dialogVisible.value = false
    } else {
      return false
    }
  })
}

// 初始化
onMounted(() => {
  getAgentsListApi();
})
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
  box-sizing: border-box;
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
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
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
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 0 0 1px #b3d8ff inset;
    }
  }
  
  :deep(.el-input-group__append) {
    background-color: #4080ff;
    border-color: #4080ff;
    
    .el-button {
      color: white;
      border: none;
      transition: all 0.3s ease;
      
      &:hover {
        background-color: #3a75e6;
        transform: scale(1.05);
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
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.search-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  box-sizing: border-box;
  
  &:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
  }
}

.search-input {
  width: 300px;
  
  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #dcdfe6 inset;
    border-radius: 20px;
    padding-left: 5px;
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 0 0 1px #c0c4cc inset;
    }
    
    &.is-focus {
      box-shadow: 0 0 0 1px #4080ff inset;
    }
  }
  
  :deep(.el-input__prefix) {
    margin-right: 5px;
  }
  
  .search-icon {
    color: #909399;
  }
}

.add-button {
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 128, 255, 0.3);
  }
  
  i {
    margin-right: 5px;
  }
}

.table-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  box-sizing: border-box;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }
}

.el-table {
  border-radius: 8px;
  overflow: hidden;
  
  :deep(th.el-table__cell) {
    background-color: #f5f7fa;
    color: #606266;
    font-weight: 600;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: #edf2fc;
    }
  }
  
  :deep(tr.el-table__row) {
    transition: all 0.2s;
    
    &:hover {
      background-color: #f5f7fa;
    }
  }
  
  :deep(.el-button) {
    padding: 6px 12px;
    font-size: 12px;
    transition: all 0.3s ease;
  }
  
  :deep(.el-button--primary) {
    background-color: #4080ff;
    border-color: #4080ff;
    
    &:hover {
      background-color: #3a75e6;
      border-color: #3a75e6;
      transform: translateY(-2px);
    }
  }
  
  :deep(.el-button--danger) {
    &:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }
  }
}

.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.edit-button, .delete-button {
  min-width: 60px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  box-sizing: border-box;
  
  &:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
  }
  
  :deep(.el-pagination) {
    --el-pagination-bg-color: transparent;
    --el-pagination-hover-color: #4080ff;
    
    .el-pagination__sizes {
      margin-right: 15px;
    }
    
    .btn-prev, .btn-next {
      background-color: #f5f7fa;
      border-radius: 4px;
      margin: 0 5px;
      transition: all 0.3s ease;
      
      &:hover {
        background-color: #e6f1ff;
      }
    }
    
    .el-pager li {
      background-color: #f5f7fa;
      border-radius: 4px;
      margin: 0 3px;
      transition: all 0.3s ease;
      
      &.is-active {
        background-color: #4080ff;
      }
      
      &:hover:not(.is-active) {
        color: #4080ff;
        background-color: #e6f1ff;
      }
    }
  }
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
    animation: pulse 1.5s infinite;
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
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  
  .el-dialog__header {
    background-color: #f5f7fa;
    margin: 0;
    padding: 15px 20px;
    border-bottom: 1px solid #eaeaea;
    
    .el-dialog__title {
      font-weight: 600;
      color: #303133;
    }
  }
  
  .el-dialog__body {
    padding: 30px 20px;
  }
  
  .el-dialog__footer {
    border-top: 1px solid #eaeaea;
    padding: 15px 20px;
  }
  
  .el-form-item__label {
    font-weight: 500;
  }
  
  .el-input__wrapper {
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 0 0 1px #c0c4cc inset;
    }
    
    &.is-focus {
      box-shadow: 0 0 0 1px #4080ff inset;
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    
    .cancel-button, .confirm-button {
      min-width: 80px;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
      }
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(103, 194, 58, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(103, 194, 58, 0);
  }
}
</style>