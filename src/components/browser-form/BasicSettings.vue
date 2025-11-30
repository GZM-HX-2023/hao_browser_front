<template>
  <div class="basic-settings">
    <el-form-item label="浏览器名称" required>
      <el-input 
        v-model="modelValue.name" 
        placeholder="请输入浏览器名称"
        maxlength="100"
        show-word-limit
      />
    </el-form-item>

    <el-form-item label="浏览器内核" required>
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
      <el-button 
        style="margin-left: 10px" 
        @click="handleGenerateUA"
        :disabled="!modelValue.kernelId"
      >
        生成User-Agent
      </el-button>
    </el-form-item>

    <el-form-item label="User-Agent">
      <el-input 
        v-model="modelValue.userAgent" 
        type="textarea"
        :rows="3"
        placeholder="将根据选择的内核自动生成"
      />
    </el-form-item>

    <el-form-item label="屏幕分辨率">
      <el-row :gutter="10">
        <el-col :span="11">
          <el-input-number 
            v-model="modelValue.screenWidth" 
            :min="800"
            :max="3840"
            placeholder="宽度"
            style="width: 100%"
          />
        </el-col>
        <el-col :span="2" style="text-align: center">×</el-col>
        <el-col :span="11">
          <el-input-number 
            v-model="modelValue.screenHeight" 
            :min="600"
            :max="2160"
            placeholder="高度"
            style="width: 100%"
          />
        </el-col>
      </el-row>
    </el-form-item>

    <el-form-item label="Cookie设置">
      <el-input 
        v-model="modelValue.remark" 
        type="textarea"
        :rows="3"
        placeholder="备注信息"
      />
    </el-form-item>

    <el-form-item label="无头模式">
      <el-switch v-model="modelValue.headless" />
      <span style="margin-left: 10px; color: #909399">启用后浏览器将在后台运行</span>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { BrowserProfile } from '@/types'
import { useKernelStore } from '@/stores/kernel'
import { generateUserAgent } from '@/api/kernel'

const modelValue = defineModel<Partial<BrowserProfile>>({ required: true })
const kernelStore = useKernelStore()

onMounted(async () => {
  if (kernelStore.kernels.length === 0) {
    await kernelStore.loadKernels()
  }
  if (!modelValue.value.kernelId && kernelStore.defaultKernel) {
    await kernelStore.loadDefaultKernel()
    if (kernelStore.defaultKernel) {
      modelValue.value.kernelId = kernelStore.defaultKernel.id
    }
  }
})

async function handleKernelChange() {
  // 切换内核时自动生成新的UA
  await handleGenerateUA()
}

async function handleGenerateUA() {
  if (!modelValue.value.kernelId) return
  
  try {
    const res = await generateUserAgent(modelValue.value.kernelId)
    modelValue.value.userAgent = res.data
    ElMessage.success('User-Agent已生成')
  } catch (error: any) {
    ElMessage.error('生成失败')
  }
}
</script>

<style scoped>
.basic-settings {
  padding: 20px 0;
}
</style>
