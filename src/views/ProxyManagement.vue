<template>
  <div class="proxy-management-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">代理管理</span>
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            添加代理
          </el-button>
        </div>
      </template>

      <el-table :data="proxyStore.proxies" v-loading="proxyStore.loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="代理信息" min-width="300">
          <template #default="{ row }">
            <div>{{ row.proxyType }}://{{ row.host }}:{{ row.port }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="country" label="国家" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status || '未测试' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleTest(row.id!)">测试</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id!)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加代理对话框 -->
    <el-dialog v-model="showAddDialog" title="添加代理" width="500px">
      <el-form :model="proxyForm" label-width="100px">
        <el-form-item label="代理类型">
          <el-radio-group v-model="proxyForm.proxyType">
            <el-radio label="http">HTTP</el-radio>
            <el-radio label="https">HTTPS</el-radio>
            <el-radio label="socks5">SOCKS5</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="主机">
          <el-input v-model="proxyForm.host" placeholder="代理服务器地址" />
        </el-form-item>
        <el-form-item label="端口">
          <el-input-number v-model="proxyForm.port" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="proxyForm.username" placeholder="可选" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="proxyForm.password" type="password" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useProxyStore } from '@/stores/proxy'
import { addProxy, deleteProxy } from '@/api/proxy'
import type { ProxyConfig } from '@/types'

const proxyStore = useProxyStore()
const showAddDialog = ref(false)

const proxyForm = reactive<Partial<ProxyConfig>>({
  proxyType: 'http',
  host: '',
  port: 8080,
  username: '',
  password: ''
})

onMounted(async () => {
  await proxyStore.loadProxies()
})

async function handleAdd() {
  try {
    await addProxy(proxyForm)
    ElMessage.success('添加成功')
    showAddDialog.value = false
    await proxyStore.loadProxies()
  } catch (error: any) {
    ElMessage.error('添加失败')
  }
}

async function handleTest(id: number) {
  try {
    await proxyStore.test(id)
    ElMessage.success('代理可用')
  } catch (error: any) {
    ElMessage.error('代理不可用')
  }
}

async function handleDelete(id: number) {
  try {
    await deleteProxy(id)
    ElMessage.success('删除成功')
    await proxyStore.loadProxies()
  } catch (error: any) {
    ElMessage.error('删除失败')
  }
}
</script>

<style scoped>
.proxy-management-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
}
</style>
