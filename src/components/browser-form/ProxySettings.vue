<template>
  <div class="proxy-settings">
    <el-form-item label="代理类型">
      <el-radio-group v-model="proxyType">
        <el-radio label="none">不使用代理</el-radio>
        <el-radio label="existing">使用已添加代理</el-radio>
        <el-radio label="custom">自定义代理</el-radio>
      </el-radio-group>
    </el-form-item>

    <template v-if="proxyType === 'existing'">
      <el-form-item label="选择代理">
        <el-select 
          v-model="modelValue.proxyId" 
          placeholder="请选择代理"
          style="width: 100%"
          filterable
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
      </el-form-item>
    </template>

    <template v-if="proxyType === 'custom'">
      <el-form-item label="代理协议">
        <el-radio-group v-model="customProxy.proxyType">
          <el-radio label="http">HTTP</el-radio>
          <el-radio label="https">HTTPS</el-radio>
          <el-radio label="socks5">SOCKS5</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="代理地址">
        <el-row :gutter="10">
          <el-col :span="16">
            <el-input 
              v-model="customProxy.host" 
              placeholder="代理服务器地址"
            />
          </el-col>
          <el-col :span="8">
            <el-input-number 
              v-model="customProxy.port" 
              placeholder="端口"
              :min="1"
              :max="65535"
              style="width: 100%"
            />
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="认证信息">
        <el-row :gutter="10">
          <el-col :span="12">
            <el-input 
              v-model="customProxy.username" 
              placeholder="用户名(可选)"
            />
          </el-col>
          <el-col :span="12">
            <el-input 
              v-model="customProxy.password" 
              type="password"
              placeholder="密码(可选)"
              show-password
            />
          </el-col>
        </el-row>
      </el-form-item>
    </template>

    <el-form-item label="IP查询渠道">
      <el-input 
        value="https://api.ipify.org?format=json" 
        readonly
        disabled
      />
    </el-form-item>

    <el-form-item>
      <el-button @click="handleCheckNetwork" :loading="checkingNetwork">
        检查网络
      </el-button>
      <span v-if="networkInfo" style="margin-left: 10px; color: #67c23a">
        当前IP: {{ networkInfo }}
      </span>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import type { BrowserProfile, ProxyConfig } from '@/types'
import { useProxyStore } from '@/stores/proxy'
import { ElMessage } from 'element-plus'

const modelValue = defineModel<Partial<BrowserProfile>>({ required: true })
const proxyStore = useProxyStore()

const proxyType = ref<'none' | 'existing' | 'custom'>('none')
const customProxy = reactive<Partial<ProxyConfig>>({
  proxyType: 'http',
  host: '',
  port: 8080,
  username: '',
  password: ''
})

const checkingNetwork = ref(false)
const networkInfo = ref('')

onMounted(async () => {
  if (proxyStore.proxies.length === 0) {
    await proxyStore.loadProxies()
  }
  
  // 初始化代理类型
  if (modelValue.value.proxyId) {
    proxyType.value = 'existing'
  } else if (modelValue.value.proxyConfig) {
    proxyType.value = 'custom'
    Object.assign(customProxy, modelValue.value.proxyConfig)
  }
})

watch(proxyType, (newType) => {
  if (newType === 'none') {
    modelValue.value.proxyId = undefined
    modelValue.value.proxyConfig = undefined
  } else if (newType === 'existing') {
    modelValue.value.proxyConfig = undefined
  } else if (newType === 'custom') {
    modelValue.value.proxyId = undefined
    modelValue.value.proxyConfig = customProxy as ProxyConfig
  }
})

function getProxyLabel(proxy: ProxyConfig) {
  return `${proxy.name || proxy.host}:${proxy.port} [${proxy.proxyType}]`
}

async function handleCheckNetwork() {
  checkingNetwork.value = true
  try {
    // TODO: 实际调用检查网络API
    await new Promise(resolve => setTimeout(resolve, 1000))
    networkInfo.value = '127.0.0.1'
    ElMessage.success('网络连接正常')
  } catch (error) {
    ElMessage.error('网络检查失败')
  } finally {
    checkingNetwork.value = false
  }
}
</script>

<style scoped>
.proxy-settings {
  padding: 20px 0;
}
</style>
