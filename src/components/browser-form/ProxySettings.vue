<template>
  <div class="proxy-settings">
    <el-form-item>
      <el-tabs v-model="activeTab" class="proxy-tabs">
        <!-- 自定义代理 -->
        <el-tab-pane label="自定义" name="custom">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="代理类型">
                <el-select 
                  v-model="customProxy.proxyType" 
                  placeholder="请选择代理类型"
                  style="width: 100%"
                >
                  <el-option label="No Proxy (本地直连)" value="none" />
                  <el-option label="SSH" value="ssh" />
                  <el-option label="HTTPS" value="https" />
                  <el-option label="HTTP" value="http" />
                  <el-option label="Socks5" value="socks5" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="IP查询渠道">
                <div style="display: flex; gap: 10px; width: 100%">
                  <el-input 
                    value="IP2Location" 
                    readonly
                    disabled
                    style="flex: 1"
                  />
                  <el-button type="primary" @click="handleCheckNetwork" :loading="checkingNetwork">
                    检查网络
                  </el-button>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 检查网络结果 -->
          <el-form-item v-if="networkInfo && networkInfo.success" label=" " class="network-result-item">
            <span style="color: #67c23a">
              <i class="fa fa-check-circle" /> 
              IP: {{ networkInfo.ip }} | 
              国家/地区: {{ networkInfo.location || networkInfo.country || '未知' }}
            </span>
          </el-form-item>

          <template v-if="customProxy.proxyType !== 'none'">
            <el-form-item label="主机：端口">
              <div style="display: flex; align-items: center; gap: 12px; width: 100%">
                <el-input 
                  v-model="customProxy.host" 
                  placeholder="gate.kookeey.info"
                  style="flex: 1"
                  @paste="handlePaste"
                />
                <span style="color: #606266; font-weight: bold">:</span>
                <el-input 
                  v-model="customProxy.port" 
                  placeholder="1000"
                  style="width: 120px"
                />
                <el-button 
                  :icon="DocumentCopy" 
                  @click="copyHostPort"
                />
              </div>
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="代理账号">
                  <el-input 
                    v-model="customProxy.username" 
                    placeholder="7669685-a4de4d64"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="代理密码">
                  <el-input 
                    v-model="customProxy.password" 
                    type="password"
                    placeholder="4f59d2dd-global-92311816-5h"
                    show-password
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="刷新URL">
              <el-input 
                v-model="customProxy.refreshUrl" 
                placeholder="请填写刷新URL（选填）"
              >
                <template #append>
                  <el-button :icon="Refresh" />
                  <el-tooltip content="帮助信息" placement="top">
                    <el-button :icon="QuestionFilled" />
                  </el-tooltip>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <el-button 
                type="primary" 
                @click="handleTestProxy"
                :loading="testingProxy"
              >
                检查代理
              </el-button>
              <span v-if="testResult && testResult.success" style="margin-left: 15px; color: #67c23a">
                <i class="fa fa-check-circle" /> 
                IP: {{ testResult.ip }} | 
                国家/地区: {{ testResult.location || '未知' }}
                <span v-if="testResult.latency"> | 延迟: {{ testResult.latency }}ms</span>
              </span>
              <span v-else-if="testResult && !testResult.success" style="margin-left: 15px; color: #f56c6c">
                <i class="fa fa-times-circle" /> 
                {{ testResult.error || '代理不可用' }}
              </span>
            </el-form-item>
          </template>
        </el-tab-pane>

        <!-- 已添加的代理 -->
        <el-tab-pane label="已添加的代理" name="saved">
          <el-form-item label="选择代理">
            <el-row :gutter="10">
              <el-col :span="12">
                <el-select 
                  v-model="selectedProxyTag"
                  placeholder="标签"
                  style="width: 100%"
                  clearable
                >
                  <el-option label="标签" value="tag">
                    <i class="fa fa-tag" style="color: #1890ff" /> 标签
                  </el-option>
                </el-select>
              </el-col>
              <el-col :span="12">
                <el-select 
                  v-model="modelValue.proxyId" 
                  placeholder="请选择"
                  style="width: 100%"
                  filterable
                  clearable
                  @change="handleProxyChange"
                >
                  <el-option
                    v-for="proxy in proxyStore.proxies"
                    :key="proxy.id"
                    :label="getProxyLabel(proxy)"
                    :value="proxy.id"
                  >
                    <div style="display: flex; justify-content: space-between">
                      <span>{{ getProxyLabel(proxy) }}</span>
                      <el-tag 
                        :type="proxy.status === 'active' ? 'success' : 'info'" 
                        size="small"
                      >
                        {{ proxy.status }}
                      </el-tag>
                    </div>
                  </el-option>
                </el-select>
              </el-col>
            </el-row>
          </el-form-item>
        </el-tab-pane>

        <!-- 集成代理 -->
        <el-tab-pane label="集成代理" name="integrated">
          <el-empty description="集成代理功能开发中..." />
        </el-tab-pane>
      </el-tabs>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy, Refresh, QuestionFilled } from '@element-plus/icons-vue'
import type { BrowserProfile, ProxyConfig, ProxyTestResult } from '@/types'
import { useProxyStore } from '@/stores/proxy'
import { testProxyDetails } from '@/api/proxy'

const modelValue = defineModel<Partial<BrowserProfile>>({ required: true })
const proxyStore = useProxyStore()

// 标签页
const activeTab = ref('custom')

// 自定义代理
const customProxy = reactive<Partial<ProxyConfig> & { refreshUrl?: string }>({
  proxyType: 'none',
  host: '',
  port: 1080,
  username: '',
  password: '',
  refreshUrl: ''
})

// 已选择的代理
const selectedProxyTag = ref('')

// 测试状态
const testingProxy = ref(false)
const checkingNetwork = ref(false)
const testResult = ref<ProxyTestResult | null>(null)
const networkInfo = ref<ProxyTestResult | null>(null)

onMounted(async () => {
  // 加载代理列表
  if (proxyStore.proxies.length === 0) {
    await proxyStore.loadProxies()
  }
  
  // 初始化代理设置
  if (modelValue.value.proxyId) {
    activeTab.value = 'saved'
  } else if (modelValue.value.proxyConfig) {
    activeTab.value = 'custom'
    Object.assign(customProxy, modelValue.value.proxyConfig)
  }
})

// 监听标签页切换
watch(activeTab, (newTab) => {
  testResult.value = null
  networkInfo.value = null
  
  if (newTab === 'custom') {
    modelValue.value.proxyId = undefined
    modelValue.value.proxyConfig = customProxy as ProxyConfig
  } else if (newTab === 'saved') {
    modelValue.value.proxyConfig = undefined
  }
})

// 监听自定义代理变化
watch(customProxy, (newProxy) => {
  if (activeTab.value === 'custom') {
    modelValue.value.proxyConfig = newProxy as ProxyConfig
  }
}, { deep: true })

// 获取代理标签
function getProxyLabel(proxy: ProxyConfig) {
  return `${proxy.name || proxy.host}:${proxy.port} [${proxy.proxyType}]`
}

// 处理代理选择变化
function handleProxyChange(proxyId: number | undefined) {
  if (proxyId) {
    const proxy = proxyStore.proxies.find(p => p.id === proxyId)
    if (proxy) {
      modelValue.value.proxyConfig = undefined
    }
  }
}

// 复制主机:端口
async function copyHostPort() {
  if (!customProxy.host || !customProxy.port) {
    ElMessage.warning('请先填写主机和端口')
    return
  }
  
  const text = `${customProxy.host}:${customProxy.port}`
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制: ' + text)
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 检查网络
async function handleCheckNetwork() {
  checkingNetwork.value = true
  networkInfo.value = null
  
  try {
    const res = await testProxyDetails({ proxyType: 'none' })
    if (res.data.success) {
      networkInfo.value = res.data
      ElMessage.success('网络检查成功')
    } else {
      ElMessage.error(res.data.error || '网络检查失败')
    }
  } catch (error: any) {
    ElMessage.error('网络检查失败: ' + (error.message || '未知错误'))
  } finally {
    checkingNetwork.value = false
  }
}

// 处理粘贴事件
function handlePaste(event: ClipboardEvent) {
  const text = event.clipboardData?.getData('text')
  if (!text) return

  const trimmed = text.trim()
  let match: { host: string, port: string, user: string, pass: string } | null = null

  // 1. user:pass@host:port
  // 2. host:port@user:pass
  if (trimmed.includes('@')) {
    const parts = trimmed.split('@')
    if (parts.length === 2) {
      const [part1, part2] = parts
      const p1Split = part1.split(':')
      const p2Split = part2.split(':')

      if (p1Split.length === 2 && p2Split.length === 2) {
         // Check for port in part 1 (host:port@user:pass)
         if (/^\d+$/.test(p1Split[1])) {
            match = { host: p1Split[0], port: p1Split[1], user: p2Split[0], pass: p2Split[1] }
         } 
         // Check for port in part 2 (user:pass@host:port)
         else if (/^\d+$/.test(p2Split[1])) {
            match = { user: p1Split[0], pass: p1Split[1], host: p2Split[0], port: p2Split[1] }
         }
      }
    }
  }
  // 5. host:port##user##pass
  else if (trimmed.includes('##')) {
     const parts = trimmed.split('##')
     if (parts.length === 3) {
        // host:port##user##pass
        const hp = parts[0].split(':')
        if (hp.length === 2) {
           match = { host: hp[0], port: hp[1], user: parts[1], pass: parts[2] }
        }
     }
  }
  // Colon separated
  else {
     const parts = trimmed.split(':')
     if (parts.length === 4) {
        // Check if part 2 is port (host:port:user:pass)
        if (/^\d+$/.test(parts[1])) {
           match = { host: parts[0], port: parts[1], user: parts[2], pass: parts[3] }
        }
        // Check if part 4 is port (user:pass:host:port)
        else if (/^\d+$/.test(parts[3])) {
           match = { user: parts[0], pass: parts[1], host: parts[2], port: parts[3] }
        }
     }
  }

  if (match) {
    event.preventDefault()
    customProxy.host = match.host
    customProxy.port = parseInt(match.port)
    customProxy.username = match.user
    customProxy.password = match.pass
    ElMessage.success('已自动解析代理信息')
  }
}

// 测试代理
async function handleTestProxy() {
  if (!customProxy.host || !customProxy.port) {
    ElMessage.warning('请填写代理主机和端口')
    return
  }
  
  testingProxy.value = true
  testResult.value = null
  
  try {
    const res = await testProxyDetails(customProxy)
    testResult.value = res.data
    
    if (res.data.success) {
      ElMessage.success('代理测试成功')
    } else {
      ElMessage.error('代理测试失败: ' + (res.data.error || '未知错误'))
    }
  } catch (error: any) {
    ElMessage.error('代理测试失败: ' + (error.message || '未知错误'))
    testResult.value = {
      success: false,
      error: error.message || '未知错误'
    }
  } finally {
    testingProxy.value = false
  }
}
</script>

<style scoped>
.proxy-settings {
  width: 100%;
}

.proxy-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-input-group__append) {
  padding: 0;
}

:deep(.el-input-group__append .el-button) {
  margin: 0;
}

.network-result {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-left: 10px;
}

.result-text {
  color: #67c23a;
  font-weight: bold;
  font-size: 14px;
  white-space: nowrap;
}

/* 增加表单项间距 */
.proxy-settings :deep(.el-form-item) {
  margin-bottom: 24px;
}

.network-result-item {
  margin-bottom: 10px !important; /* 结果与下方元素的间距可以稍微小一点 */
}
</style>
