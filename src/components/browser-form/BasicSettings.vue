<template>
  <div class="basic-settings">
    <el-form-item label="名称" required>
      <el-input 
        v-model="modelValue.name" 
        placeholder="选择环境名称"
        maxlength="100"
        show-word-limit
      />
    </el-form-item>

    <el-form-item label="浏览器" required>
      <el-select 
        v-model="modelValue.kernelId" 
        placeholder="请选择浏览器内核"
        style="width: 100%"
        @change="handleKernelChange"
      >
        <el-option
          v-for="kernel in kernelStore.kernels"
          :key="kernel.id"
          :label="kernel.displayName"
          :value="kernel.id"
        />
      </el-select>
      <div style="margin-top: 5px; color: #409EFF; font-size: 12px">
        使用 Chrome {{ currentChromeVersion }} 内核
      </div>
    </el-form-item>

    <el-form-item label="操作系统">
      <el-radio-group v-model="selectedOS" @change="handleOSChange">
        <el-radio-button label="Windows">
          <i class="fa fa-windows" /> Windows
        </el-radio-button>
        <el-radio-button label="Mac">
          <i class="fa fa-apple" /> Mac
        </el-radio-button>
        <el-radio-button label="Linux">
          <i class="fa fa-linux" /> Linux
        </el-radio-button>
        <el-radio-button label="Android">
          <i class="fa fa-android" /> Android
        </el-radio-button>
        <el-radio-button label="iOS">
          <i class="fa fa-apple" /> iOS
        </el-radio-button>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="User-Agent">
      <div style="display: flex; gap: 10px; margin-bottom: 10px">
        <el-select 
          v-model="selectedUAVersion"
          placeholder="使用当前内核版本"
          style="flex: 1; min-width: 200px"
          @change="handleUAVersionChange"
        >
          <el-option label="使用当前内核版本" :value="null" />
          <el-option label="UA 142" :value="142" />
          <el-option label="UA 141" :value="141" />
          <el-option label="UA 140" :value="140" />
          <el-option label="UA 139" :value="139" />
          <el-option label="UA 138" :value="138" />
          <el-option label="UA 137" :value="137" />
          <el-option label="UA 136" :value="136" />
          <el-option label="UA 135" :value="135" />
        </el-select>
        <el-button 
          type="primary"
          @click="handleRandomGenerate"
          :disabled="!modelValue.kernelId"
          style="width: 100px; flex-shrink: 0"
        >
          <i class="fa fa-random" /> 生成
        </el-button>
      </div>
      <el-input 
        v-model="modelValue.userAgent" 
        type="textarea"
        :rows="3"
        placeholder="将根据选择的内核自动生成"
        readonly
      />
    </el-form-item>

    <el-form-item label="分组">
      <el-input 
        v-model="modelValue.groupName" 
        placeholder="选择分组"
      />
    </el-form-item>

    <!-- Cookie管理组件 -->
    <CookieManager v-model="modelValue.cookies" />

    <el-form-item label="备注">
      <el-input 
        v-model="modelValue.remark" 
        type="textarea"
        :rows="3"
        placeholder="备注信息"
        maxlength="1500"
        show-word-limit
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { BrowserProfile } from '@/types'
import { useKernelStore } from '@/stores/kernel'
import { generateUserAgent } from '@/api/kernel'
import CookieManager from './CookieManager.vue'

const modelValue = defineModel<Partial<BrowserProfile>>({ required: true })
const kernelStore = useKernelStore()

// 状态变量
const selectedOS = ref('Windows')
const selectedUAVersion = ref<number | null>(null)

// 计算当前Chrome版本
const currentChromeVersion = computed(() => {
  if (!modelValue.value.kernelId) return '--'
  const kernel = kernelStore.kernels.find(k => k.id === modelValue.value.kernelId)
  return kernel?.chromeVersion || '--'
})

onMounted(async () => {
  // 初始化cookies数组
  if (!modelValue.value.cookies) {
    modelValue.value.cookies = []
  }
  
  if (kernelStore.kernels.length === 0) {
    await kernelStore.loadKernels()
  }
  if (!modelValue.value.kernelId && kernelStore.defaultKernel) {
    await kernelStore.loadDefaultKernel()
    if (kernelStore.defaultKernel) {
      modelValue.value.kernelId = kernelStore.defaultKernel.id
      await handleGenerateUA(false)
    }
  }
})

async function handleKernelChange() {
  // 切换内核时自动生成新的UA
  selectedUAVersion.value = null // 重置UA版本选择
  await handleGenerateUA(false)
}

async function handleOSChange() {
  // 切换操作系统时重新生成UA
  await handleGenerateUA(false)
}

async function handleUAVersionChange() {
  // 切换UA版本时重新生成
  await handleGenerateUA(false)
}

async function handleRandomGenerate() {
  // 随机生成UA
  await handleGenerateUA(true)
}

async function handleGenerateUA(random: boolean) {
  if (!modelValue.value.kernelId) return
  
  try {
    // 使用kernelId, 但如果选择了特定的Chrome版本，则传递该版本号
    const chromeVersion = selectedUAVersion.value || undefined
    const res = await generateUserAgent(
      modelValue.value.kernelId, 
      selectedOS.value, 
      random,
      chromeVersion
    )
    modelValue.value.userAgent = res.data
    if (random) {
      ElMessage.success('已随机生成User-Agent')
    }
  } catch (error: any) {
    ElMessage.error('生成失败: ' + (error.message || '未知错误'))
  }
}
</script>

<style scoped>
.basic-settings {
  padding: 20px 0;
}

.el-radio-button :deep(.el-radio-button__inner) {
  padding: 8px 15px;
}

.fa {
  margin-right: 5px;
}
</style>
