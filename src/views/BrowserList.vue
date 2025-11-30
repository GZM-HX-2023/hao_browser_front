<template>
  <div class="browser-list-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">环境管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        新建浏览器
      </el-button>
    </div>

    <!-- 工具栏 -->
    <el-card class="toolbar-card">
      <div class="toolbar">
        <!-- 左侧：分组和搜索 -->
        <div class="toolbar-left">
          <el-select 
            v-model="selectedGroup" 
            placeholder="全部分组" 
            style="width: 150px"
            @change="handleGroupChange"
          >
            <el-option label="全部分组" value="all" />
            <el-option label="未分组" value="ungrouped" />
          </el-select>

          <el-input
            v-model="searchKeyword"
            placeholder="搜索浏览器环境名称"
            :prefix-icon="Search"
            style="width: 300px"
            clearable
            @input="handleSearch"
          />
        </div>

        <!-- 右侧：批量操作 -->
        <div class="toolbar-right">
          <el-button 
            :icon="VideoPlay" 
            :disabled="selectedRows.length === 0"
            @click="handleBatchStart"
          >
            批量打开
          </el-button>
          <el-button 
            :icon="Delete" 
            :disabled="selectedRows.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
          <el-button :icon="Refresh" @click="loadData">刷新</el-button>
        </div>
      </div>
    </el-card>

    <!-- 浏览器列表 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="filteredBrowsers"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <!-- 复选框 -->
        <el-table-column type="selection" width="55" />

        <!-- 名称 -->
        <el-table-column prop="name" label="名称" min-width="200">
          <template #default="{ row }">
            <div class="browser-name">
              <el-icon class="browser-icon"><Monitor /></el-icon>
              <div class="name-content">
                <div class="name-text">{{ row.name }}</div>
                <div class="name-remark" v-if="row.remark">{{ row.remark }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 分组 -->
        <el-table-column prop="groupName" label="分组" width="120">
          <template #default="{ row }">
            <el-tag size="small" v-if="row.groupName">{{ row.groupName }}</el-tag>
            <span v-else class="text-secondary">未分组</span>
          </template>
        </el-table-column>

        <!-- 内核 -->
        <el-table-column label="浏览器" width="180">
          <template #default="{ row }">
            <span v-if="row.browserKernel">
              {{ row.browserKernel.displayName }}
            </span>
            <span v-else class="text-secondary">未知</span>
          </template>
        </el-table-column>

        <!-- 代理 -->
        <el-table-column label="代理IP" width="150">
          <template #default="{ row }">
            <span v-if="row.proxyConfig">{{ row.proxyConfig.host }}</span>
            <span v-else class="text-secondary">无代理</span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'running' ? 'success' : 'info'" size="small">
              {{ row.status === 'running' ? '运行中' : '空闲' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 最近打开 -->
        <el-table-column label="最近打开" width="180">
          <template #default="{ row }">
            <span class="text-secondary">
              {{ row.lastOpenedAt ? formatDate(row.lastOpenedAt) : '未打开' }}
            </span>
          </template>
        </el-table-column>

        <!-- 创建时间 -->
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            <span class="text-secondary">{{ formatDate(row.createdAt) }}</span>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                v-if="row.status !== 'running'"
                type="primary"
                size="small"
                :icon="VideoPlay"
                @click="handleStart(row)"
                :loading="row.starting"
              >
                打开
              </el-button>
              <el-button
                v-else
                type="danger"
                size="small"
                :icon="VideoPause"
                @click="handleStop(row)"
                :loading="row.stopping"
              >
                关闭
              </el-button>
              
              <el-dropdown @command="(cmd) => handleAction(cmd, row)">
                <el-button size="small" :icon="MoreFilled" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit" :icon="Edit">
                      编辑
                    </el-dropdown-item>
                    <el-dropdown-item command="duplicate" :icon="CopyDocument">
                      复制
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" :icon="Delete" divided>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Plus, Search, VideoPlay, VideoPause, Delete, Refresh, 
  Monitor, Edit, CopyDocument, MoreFilled 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { BrowserProfile } from '@/types'
import { useBrowserStore } from '@/stores/browser'
import { startBrowser, stopBrowser, deleteBrowser } from '@/api/browser'

const router = useRouter()
const browserStore = useBrowserStore()

const loading = ref(false)
const selectedGroup = ref('all')
const searchKeyword = ref('')
const selectedRows = ref<BrowserProfile[]>([])
const currentPage = ref(1)
const pageSize = ref(20)

// 计算属性
const filteredBrowsers = computed(() => {
  let browsers = browserStore.browsers

  // 按分组过滤
  if (selectedGroup.value !== 'all') {
    if (selectedGroup.value === 'ungrouped') {
      browsers = browsers.filter(b => !b.groupName)
    } else {
      browsers = browsers.filter(b => b.groupName === selectedGroup.value)
    }
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    browsers = browsers.filter(b => 
      b.name.toLowerCase().includes(keyword) ||
      (b.remark && b.remark.toLowerCase().includes(keyword))
    )
  }

  return browsers
})

const totalCount = computed(() => filteredBrowsers.value.length)

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    await browserStore.loadBrowsers()
  } finally {
    loading.value = false
  }
}

// 新建浏览器
const handleCreate = () => {
  router.push('/browser/create')
}

// 分组切换
const handleGroupChange = () => {
  currentPage.value = 1
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 选择行
const handleSelectionChange = (rows: BrowserProfile[]) => {
  selectedRows.value = rows
}

// 启动浏览器
const handleStart = async (row: BrowserProfile) => {
  row.starting = true
  try {
    await browserStore.start(row.id!)
    ElMessage.success('浏览器启动成功')
  } catch (error: any) {
    ElMessage.error('启动失败: ' + (error.message || '未知错误'))
  } finally {
    row.starting = false
  }
}

// 停止浏览器
const handleStop = async (row: BrowserProfile) => {
  row.stopping = true
  try {
    await browserStore.stop(row.id!)
    ElMessage.success('浏览器已关闭')
  } catch (error: any) {
    ElMessage.error('关闭失败: ' + (error.message || '未知错误'))
  } finally {
    row.stopping = false
  }
}

// 批量启动
const handleBatchStart = async () => {
  if (selectedRows.value.length === 0) return
  
  const confirmed = await ElMessageBox.confirm(
    `确定要打开选中的 ${selectedRows.value.length} 个浏览器吗？`,
    '批量打开',
    { type: 'warning' }
  ).catch(() => false)
  
  if (!confirmed) return
  
  for (const row of selectedRows.value) {
    if (row.status !== 'running') {
      await handleStart(row)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return
  
  const confirmed = await ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 个浏览器吗？此操作不可恢复！`,
    '批量删除',
    { type: 'error' }
  ).catch(() => false)
  
  if (!confirmed) return
  
  for (const row of selectedRows.value) {
    await browserStore.remove(row.id!)
  }
  
  ElMessage.success('批量删除成功')
}

// 操作菜单
const handleAction = async (command: string, row: BrowserProfile) => {
  switch (command) {
    case 'edit':
      router.push(`/browser/create?id=${row.id}`)
      break
    case 'duplicate':
      // TODO: 实现复制功能
      ElMessage.info('复制功能开发中')
      break
    case 'delete':
      const confirmed = await ElMessageBox.confirm(
        `确定要删除浏览器"${row.name}"吗？此操作不可恢复！`,
        '删除确认',
        { type: 'error' }
      ).catch(() => false)
      
      if (confirmed) {
        await browserStore.remove(row.id!)
        ElMessage.success('删除成功')
      }
      break
  }
}

// 分页
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.browser-list-page {
  padding: 0;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
  padding: 0 var(--spacing-lg);
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.toolbar-card {
  margin-bottom: var(--spacing-md);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.table-card {
  overflow: hidden;
}

.browser-name {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.browser-icon {
  color: var(--primary-color);
  font-size: 18px;
  flex-shrink: 0;
}

.name-content {
  flex: 1;
  min-width: 0;
}

.name-text {
  font-weight: 500;
  color: var(--text-primary);
}

.name-remark {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-secondary {
  color: var(--text-secondary);
  font-size: 13px;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-xs);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}
</style>
