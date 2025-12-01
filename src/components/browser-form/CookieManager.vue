<template>
  <div class="cookie-manager">
    <el-form-item label="Cookie">
      <div class="cookie-display">
        <el-input 
          :model-value="cookiePreview" 
          type="textarea"
          :rows="3"
          placeholder="格式：Netscape、Name=Value"
          readonly
        />
        <div class="cookie-actions">
          <el-button type="primary" text @click="showMergeDialog">
            + 合并Cookie
          </el-button>
          <el-button type="primary" text @click="showAddDialog" v-if="modelValue.length > 0">
            + 添加Cookie
          </el-button>
        </div>
      </div>
    </el-form-item>

    <!-- Cookie列表表格 -->
    <div v-if="modelValue.length > 0" class="cookie-table-container">
      <el-table :data="modelValue" border size="small" max-height="300">
        <el-table-column prop="name" label="Name" min-width="120" />
        <el-table-column prop="value" label="Value" min-width="150" show-overflow-tooltip />
        <el-table-column prop="domain" label="Domain" min-width="150" />
        <el-table-column prop="path" label="Path" width="80" />
        <el-table-column label="Secure" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="row.secure ? 'success' : 'info'" size="small">
              {{ row.secure ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="HttpOnly" width="85" align="center">
          <template #default="{ row }">
            <el-tag :type="row.httpOnly ? 'success' : 'info'" size="small">
              {{ row.httpOnly ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ $index }">
            <el-button type="primary" link size="small" @click="editCookie($index)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="deleteCookie($index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 合并Cookie对话框 -->
    <el-dialog 
      v-model="mergeDialogVisible" 
      title="合并Cookie" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-input
        v-model="mergeText"
        type="textarea"
        :rows="10"
        placeholder="其他Cookie"
      />
      <template #footer>
        <el-button @click="mergeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleMerge">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑Cookie对话框 -->
    <el-dialog 
      v-model="editDialogVisible" 
      :title="editIndex === -1 ? '添加Cookie' : '编辑Cookie'" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="Name" required>
          <el-input v-model="editForm.name" placeholder="Cookie名称" />
        </el-form-item>
        <el-form-item label="Value" required>
          <el-input v-model="editForm.value" placeholder="Cookie值" />
        </el-form-item>
        <el-form-item label="Domain" required>
          <el-input v-model="editForm.domain" placeholder=".example.com" />
        </el-form-item>
        <el-form-item label="Path">
          <el-input v-model="editForm.path" placeholder="/" />
        </el-form-item>
        <el-form-item label="Secure">
          <el-switch v-model="editForm.secure" />
        </el-form-item>
        <el-form-item label="HttpOnly">
          <el-switch v-model="editForm.httpOnly" />
        </el-form-item>
        <el-form-item label="SameSite">
          <el-select v-model="editForm.sameSite" placeholder="选择SameSite">
            <el-option label="Unspecified" value="unspecified" />
            <el-option label="Strict" value="strict" />
            <el-option label="Lax" value="lax" />
            <el-option label="No Restriction" value="no_restriction" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { Cookie } from '@/types'
import { parseCookies, mergeCookies, validateCookie } from '@/utils/cookieParser'

const modelValue = defineModel<Cookie[]>({ required: true, default: [] })

// 对话框状态
const mergeDialogVisible = ref(false)
const editDialogVisible = ref(false)
const mergeText = ref('')
const editIndex = ref(-1)

// 编辑表单
const editForm = ref<Partial<Cookie>>({
  name: '',
  value: '',
  domain: '',
  path: '/',
  secure: false,
  httpOnly: false,
  session: true,
  sameSite: 'unspecified'
})

// Cookie预览文本
const cookiePreview = computed(() => {
  const count = modelValue.value.length
  if (count === 0) return ''
  return `已有 ${count} 个Cookie`
})

// 显示合并对话框
function showMergeDialog() {
  mergeText.value = ''
  mergeDialogVisible.value = true
}

// 显示添加对话框
function showAddDialog() {
  editIndex.value = -1
  editForm.value = {
    name: '',
    value: '',
    domain: '',
    path: '/',
    secure: false,
    httpOnly: false,
    session: true,
    sameSite: 'unspecified'
  }
  editDialogVisible.value = true
}

// 处理合并
function handleMerge() {
  if (!mergeText.value.trim()) {
    ElMessage.warning('请输入Cookie内容')
    return
  }

  const newCookies = parseCookies(mergeText.value)
  
  if (newCookies.length === 0) {
    ElMessage.error('Cookie格式不正确，解析失败')
    return
  }

  // 验证所有cookie
  const invalidCookies = newCookies.filter(cookie => {
    const { valid } = validateCookie(cookie)
    return !valid
  })

  if (invalidCookies.length > 0) {
    ElMessage.error(`有 ${invalidCookies.length} 个Cookie格式不正确，请检查`)
    return
  }

  modelValue.value = mergeCookies(modelValue.value, newCookies)
  mergeDialogVisible.value = false
  ElMessage.success(`成功合并 ${newCookies.length} 个Cookie`)
}

// 编辑Cookie
function editCookie(index: number) {
  editIndex.value = index
  editForm.value = { ...modelValue.value[index] }
  editDialogVisible.value = true
}

// 删除Cookie
function deleteCookie(index: number) {
  modelValue.value.splice(index, 1)
  ElMessage.success('Cookie已删除')
}

// 保存编辑
function handleSaveEdit() {
  const { valid, errors } = validateCookie(editForm.value)
  
  if (!valid) {
    ElMessage.error(errors.join(', '))
    return
  }

  if (editIndex.value === -1) {
    // 添加新cookie
    modelValue.value.push(editForm.value as Cookie)
    ElMessage.success('Cookie已添加')
  } else {
    // 更新现有cookie
    modelValue.value[editIndex.value] = editForm.value as Cookie
    ElMessage.success('Cookie已更新')
  }

  editDialogVisible.value = false
}
</script>

<style scoped>
.cookie-manager {
  width: 100%;
}

.cookie-display {
  width: 100%;
}

.cookie-actions {
  margin-top: 8px;
  display: flex;
  gap: 10px;
}

.cookie-table-container {
  margin-top: 10px;
}

:deep(.el-table) {
  font-size: 12px;
}

:deep(.el-table td),
:deep(.el-table th) {
  padding: 8px 0;
}
</style>
