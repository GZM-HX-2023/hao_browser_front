<template>
  <div class="create-browser-page">
    <!-- 返回按钮 -->
    <div class="page-header">
      <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
      <h2 class="page-title">新建浏览器环境</h2>
    </div>

    <div class="content-wrapper">
      <!-- 左侧表单区 -->
      <div class="form-section">
        <div class="layout-card">
          <!-- 顶部导航栏 -->
          <div class="anchor-nav">
            <div 
              v-for="item in navItems" 
              :key="item.id"
              class="nav-item"
              :class="{ active: activeSection === item.id }"
              @click="scrollToSection(item.id)"
            >
              {{ item.label }}
            </div>
          </div>

          <!-- 表单内容滚动区 -->
          <div class="form-content" ref="formContentRef" @scroll="handleScroll">
            <!-- 基础设置 -->
            <div id="basic" class="form-block">
              <div class="block-title">基础设置</div>
              <BasicSettings v-model="formData" @update="handleFormUpdate" />
            </div>

            <!-- 代理信息 -->
            <div id="proxy" class="form-block">
              <div class="block-title">代理信息</div>
              <ProxySettings v-model="formData" @update="handleFormUpdate" />
            </div>

            <!-- 账号平台 -->
            <div id="account" class="form-block">
              <div class="block-title">账号平台</div>
              <AccountSettings v-model="formData" @update="handleFormUpdate" />
            </div>

            <!-- 指纹配置 -->
            <div id="fingerprint" class="form-block">
              <div class="block-title">指纹配置</div>
              <FingerprintSettings v-model="formData" @update="handleFormUpdate" />
            </div>

            <!-- 高级设置 -->
            <div id="advanced" class="form-block">
              <div class="block-title">高级设置</div>
              <AdvancedSettings v-model="formData" @update="handleFormUpdate" />
            </div>
            
            <!-- 底部占位 -->
            <div style="height: 300px;"></div>
          </div>

          <!-- 底部按钮 -->
          <div class="form-actions">
            <el-button @click="goBack">取消</el-button>  
            <el-button type="primary" @click="handleSave" :loading="saving">
              保存并启动
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧概要面板 -->
      <div class="summary-section">
        <div class="layout-card summary-layout">
          <div class="summary-header">
            <span>概要</span>
            <el-button 
              type="primary" 
              :icon="Refresh" 
              size="small"
              @click="generateRandomFingerprint"
              :loading="generating"
            >
              生成随机指纹
            </el-button>
          </div>

          <div class="summary-content">
            <!-- 浏览器信息 -->
            <div class="summary-item">
              <span class="label">浏览器</span>
              <span class="value">{{ kernelName }}</span>
            </div>

            <!-- User-Agent -->
            <div class="summary-item">
              <span class="label">User-Agent</span>
              <span class="value text-small">{{ formData.userAgent || '未设置' }}</span>
            </div>

            <!-- WebRTC -->
            <div class="summary-item">
              <span class="label">WebRTC</span>
              <span class="value">{{ webrtcModeText }}</span>
            </div>

            <!-- 时区 -->
            <div class="summary-item">
              <span class="label">时区</span>
              <span class="value">{{ timezoneModeText }}</span>
            </div>

            <!-- 地理位置 -->
            <div class="summary-item">
              <span class="label">地理位置</span>
              <span class="value">{{ geolocationModeText }}</span>
            </div>

            <!-- 语言 -->
            <div class="summary-item">
              <span class="label">语言</span>
              <span class="value">{{ languageModeText }}</span>
            </div>

            <!-- 分辨率 -->
            <div class="summary-item">
              <span class="label">分辨率</span>
              <span class="value">{{ formData.screenResolution || '未设置' }}</span>
            </div>

            <!-- 字体 -->
            <div class="summary-item">
              <span class="label">字体</span>
              <span class="value">{{ fontModeText }}</span>
            </div>

            <!-- Canvas -->
            <div class="summary-item">
              <span class="label">Canvas</span>
              <span class="value">{{ canvasModeText }}</span>
            </div>

            <!-- WebGL图像 -->
            <div class="summary-item">
              <span class="label">WebGL图像</span>
              <span class="value">{{ webglModeText }}</span>
            </div>

            <!-- AudioContext -->
            <div class="summary-item">
              <span class="label">AudioContext</span>
              <span class="value">{{ audioModeText }}</span>
            </div>

            <!-- WebGL元数据 -->
            <div class="summary-item">
              <span class="label">WebGL元数据</span>
              <span class="value text-small">
                {{ formData.webglVendor }}<br/>
                <span class="text-secondary">{{ formData.webglRenderer }}</span>
              </span>
            </div>

            <!-- CPU -->
            <div class="summary-item">
              <span class="label">CPU</span>
              <span class="value">{{ formData.cpuCores || 4 }} 核</span>
            </div>

            <!-- RAM -->
            <div class="summary-item">
              <span class="label">RAM</span>
              <span class="value">{{ formData.memory || 8 }} GB</span>
            </div>

            <!-- 设备 ID -->
            <div class="summary-item" v-if="formData.deviceName">
              <span class="label">设备 ID</span>
              <span class="value text-small">{{ formData.deviceName }}</span>
            </div>
          </div>

          <!-- 底部提示 -->
          <div class="summary-footer">
            <el-alert 
              type="info" 
              :closable="false"
              show-icon
            >
              <template #title>
                点击"生成随机指纹"自动配置。
              </template>
            </el-alert>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { BrowserProfile } from '@/types'
import { createBrowser } from '@/api/browser'
import { generateFingerprint } from '@/api/fingerprint'
import { useKernelStore } from '@/stores/kernel'
import BasicSettings from '@/components/browser-form/BasicSettings.vue'
import ProxySettings from '@/components/browser-form/ProxySettings.vue'
import AccountSettings from '@/components/browser-form/AccountSettings.vue'
import FingerprintSettings from '@/components/browser-form/FingerprintSettings.vue'
import AdvancedSettings from '@/components/browser-form/AdvancedSettings.vue'

const router = useRouter()
const kernelStore = useKernelStore()

const activeSection = ref('basic')
const saving = ref(false)
const generating = ref(false)
const formContentRef = ref<HTMLElement | null>(null)
const isScrolling = ref(false)

const navItems = [
  { id: 'basic', label: '基础设置' },
  { id: 'proxy', label: '代理信息' },
  { id: 'account', label: '账号平台' },
  { id: 'fingerprint', label: '指纹配置' },
  { id: 'advanced', label: '高级设置' }
]

const formData = ref<Partial<BrowserProfile>>({
  name: '',
  kernelId: undefined,
  userAgent: '',
  screenResolution: '',
  webrtcMode: 'disabled',
  timezoneMode: 'ip_based',
  geolocationMode: 'ask',
  languageMode: 'auto',
  canvasMode: 'noise',
  webglMode: 'noise',
  audioMode: 'noise',
  clientRectsMode: 'noise',
  speechVoicesMode: 'noise',
  fontMode: 'default',
  webglVendor: '',
  webglRenderer: '',
  cpuCores: 4,
  memory: 8,
  deviceName: '',
  macAddress: ''
})

// 滚动到指定区域
const scrollToSection = (id: string) => {
  activeSection.value = id
  isScrolling.value = true
  
  const element = document.getElementById(id)
  const container = formContentRef.value
  
  if (element && container) {
    // 目标元素相对于视口的位置
    const elementRect = element.getBoundingClientRect()
    // 容器相对于视口的位置
    const containerRect = container.getBoundingClientRect()
    
    // 计算目标元素相对于容器顶部的距离
    // 这里的 offset 是为了留出一点顶部空间，避免贴顶太紧
    const offset = 20
    
    // 目标滚动位置 = 当前滚动位置 + (元素相对视口Top - 容器相对视口Top) - 偏移
    const targetScrollTop = container.scrollTop + (elementRect.top - containerRect.top) - offset
    
    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    })
    
    setTimeout(() => {
      isScrolling.value = false
    }, 800)
  }
}

// 监听滚动更新激活项
const handleScroll = () => {
  if (isScrolling.value || !formContentRef.value) return
  
  const container = formContentRef.value
  const containerRect = container.getBoundingClientRect()
  const offset = 100 // 判定区域
  
  let currentId = ''
  
  for (const item of navItems) {
    const element = document.getElementById(item.id)
    if (element) {
      const elementRect = element.getBoundingClientRect()
      const relativeTop = elementRect.top - containerRect.top
      
      // 如果元素顶部在容器可视区域上方或接近顶部
      if (relativeTop <= offset) {
        currentId = item.id
      } else {
        break
      }
    }
  }
  
  if (currentId) {
    activeSection.value = currentId
  }
}

// 计算属性 - 内核名称
const kernelName = computed(() => {
  if (!formData.value.kernelId) return '未选择'
  const kernel = kernelStore.getKernelById(formData.value.kernelId)
  return kernel?.displayName || '未知'
})

// 计算属性 - 各项配置的显示文本
const webrtcModeText = computed(() => {
  const modes: Record<string, string> = {
    'disabled': '禁用',
    'alter': '替代',
    'real': '真实 IP'
  }
  return modes[formData.value.webrtcMode || 'disabled'] || '未设置'
})

const timezoneModeText = computed(() => {
  const modes: Record<string, string> = {
    'ip_based': '基于 IP',
    'custom': '自定义',
    'real': '真实'
  }
  return modes[formData.value.timezoneMode || 'ip_based'] || '未设置'
})

const geolocationModeText = computed(() => {
  const modes: Record<string, string> = {
    'ask': '询问',
    'allow': '允许',
    'block': '阻止'
  }
  return modes[formData.value.geolocationMode || 'ask'] || '未设置'
})

const languageModeText = computed(() => {
  const modes: Record<string, string> = {
    'auto': '基于 User-Agent',
    'custom': '自定义'
  }
  return modes[formData.value.languageMode || 'auto'] || '未设置'
})

const fontModeText = computed(() => {
  const modes: Record<string, string> = {
    'default': '默认',
    'custom': '自定义'
  }
  return modes[formData.value.fontMode || 'default'] || '未设置'
})

const canvasModeText = computed(() => {
  const modes: Record<string, string> = {
    'off': '关闭',
    'noise': '噪点 {' + (formData.value.canvasNoise || 'C70E8A8D') + '}'
  }
  return modes[formData.value.canvasMode || 'noise'] || '未设置'
})

const webglModeText = computed(() => {
  const modes: Record<string, string> = {
    'off': '关闭',
    'noise': '噪点 {' + (formData.value.webglNoise || 'DEE90E18') + '}'
  }
  return modes[formData.value.webglMode || 'noise'] || '未设置'
})

const audioModeText = computed(() => {
  const modes: Record<string, string> = {
    'off': '关闭',
    'noise': '噪点 {' + (formData.value.audioNoise || '60F8D6D2') + '}'
  }
  return modes[formData.value.audioMode || 'noise'] || '未设置'
})

// 表单更新处理
const handleFormUpdate = () => {
  // 表单数据更新时，概要会自动更新（响应式）
}

// 生成随机指纹
const generateRandomFingerprint = async () => {
  generating.value = true
  try {
    const res = await generateFingerprint()
    if (res.code === 200 && res.data) {
      // 填充指纹数据到表单
      Object.assign(formData.value, {
        userAgent: res.data.userAgent,
        screenResolution: res.data.screenResolution,
        canvasNoise: res.data.canvasNoise,
        webglNoise: res.data.webglNoise,
        audioNoise: res.data.audioNoise,
        webglVendor: res.data.webglVendor,
        webglRenderer: res.data.webglRenderer,
        cpuCores: res.data.cpuCores,
        memory: res.data.memory,
        deviceName: res.data.deviceName,
        macAddress: res.data.macAddress,
        timezone: res.data.timezone,
        languages: res.data.languages
      })
      
      ElMessage.success('随机指纹生成成功')
    }
  } catch (error: any) {
    ElMessage.error('生成指纹失败: ' + (error.message || '未知错误'))
  } finally {
    generating.value = false
  }
}

// 保存浏览器
const handleSave = async () => {
  // 验证必填项
  if (!formData.value.name) {
    ElMessage.warning('请输入浏览器名称')
    scrollToSection('basic')
    return
  }

  if (!formData.value.kernelId) {
    ElMessage.warning('请选择浏览器内核')
    scrollToSection('basic')
    return
  }

  saving.value = true
  try {
    const res = await createBrowser(formData.value as BrowserProfile)
    if (res.code === 200) {
      ElMessage.success('浏览器创建成功')
      router.push('/browser-list')
    } else {
      ElMessage.error(res.message || '创建失败')
    }
  } catch (error: any) {
    ElMessage.error('创建失败: ' + (error.message || '未知错误'))
  } finally {
    saving.value = false
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 初始化
onMounted(async () => {
  await kernelStore.loadKernels()
  await kernelStore.loadDefaultKernel()
  
  // 设置默认内核
  if (kernelStore.defaultKernel) {
    formData.value.kernelId = kernelStore.defaultKernel.id
  }
})
</script>

<style scoped>
.create-browser-page {
  /* 填满父容器 (.main-content) */
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

.page-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  flex-shrink: 0;
  height: 40px; /* 固定高度 */
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 350px;
  grid-template-rows: minmax(0, 1fr); /* 关键：限制行高，确保子元素能滚动 */
  gap: var(--spacing-lg);
  /* align-items: start;  <-- 移除此行，让子元素默认 stretch */
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.form-section {
  height: 100%;
  min-width: 0;
  min-height: 0; /* 关键：允许收缩 */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 关键：防止溢出 */
}

.summary-section {
  height: 100%;
  min-width: 0;
  min-height: 0; /* 关键：允许收缩 */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 关键：防止溢出 */
}

/* 自定义布局卡片 */
.layout-card {
  background: #fff;
  border-radius: 4px;
  box-shadow: var(--shadow-sm);
  height: 100%;
  min-height: 0; /* 关键：允许收缩 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative; /* 建立定位上下文 */
}

.anchor-nav {
  display: flex;
  border-bottom: 1px solid var(--border-light);
  padding: 0 var(--spacing-lg);
  background: #fff;
  z-index: 10;
  flex-shrink: 0;
  height: 50px;
  align-items: center;
}

.nav-item {
  padding: 0 var(--spacing-lg);
  height: 50px;
  line-height: 50px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary);
  position: relative;
  transition: all 0.3s;
}

.nav-item:hover {
  color: var(--primary-color);
}

.nav-item.active {
  color: var(--primary-color);
  font-weight: 600;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
}

.form-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  scroll-behavior: smooth;
  position: relative;
}

.form-block {
  margin-bottom: var(--spacing-xl);
}

.block-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  padding-left: 10px;
  border-left: 4px solid var(--primary-color);
  line-height: 1;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-light);
  background: #fff;
  flex-shrink: 0;
  z-index: 10;
}

/* 概要面板样式 */
.summary-layout {
  display: flex;
  flex-direction: column;
}

.summary-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  flex-shrink: 0;
}

.summary-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-light);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item .label {
  color: var(--text-secondary);
  font-size: 13px;
  flex-shrink: 0;
  width: 100px;
}

.summary-item .value {
  color: var(--text-primary);
  font-size: 13px;
  text-align: right;
  flex: 1;
  word-break: break-all;
}

.summary-item .value.text-small {
  font-size: 12px;
  line-height: 1.4;
}

.summary-item .text-secondary {
  color: var(--text-secondary);
  font-size: 11px;
}

.summary-footer {
  padding: var(--spacing-lg);
  flex-shrink: 0;
}

/* 显式滚动条样式 */
.form-content::-webkit-scrollbar,
.summary-content::-webkit-scrollbar {
  width: 8px; /* 稍微加宽一点，确保可见 */
  height: 8px;
}

.form-content::-webkit-scrollbar-thumb,
.summary-content::-webkit-scrollbar-thumb {
  background-color: #c0c4cc; /* 更深的颜色 */
  border-radius: 4px;
}

.form-content::-webkit-scrollbar-thumb:hover,
.summary-content::-webkit-scrollbar-thumb:hover {
  background-color: #909399;
}

.form-content::-webkit-scrollbar-track,
.summary-content::-webkit-scrollbar-track {
  background-color: #f5f7fa;
}

@media (max-width: 1200px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
  
  .summary-section {
    display: none; 
  }
}
</style>
