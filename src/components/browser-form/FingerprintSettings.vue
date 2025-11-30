<template>
  <div class="fingerprint-settings">
    <el-alert 
      title="指纹配置说明" 
      type="info" 
      :closable="false"
      style="margin-bottom: 20px"
    >
      指纹配置用于模拟不同的浏览器环境,避免被网站识别为自动化工具
    </el-alert>

    <el-form-item>
      <el-button type="primary" @click="handleGenerateFingerprint" :loading="generating">
        <el-icon><Refresh /></el-icon>
        生成新指纹
      </el-button>
    </el-form-item>

    <!-- WebRTC -->
    <el-form-item label="WebRTC">
      <el-radio-group v-model="modelValue.webrtcMode">
        <el-radio label="disabled">禁用</el-radio>
        <el-radio label="real">真实</el-radio>
        <el-radio label="fake">伪装</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 时区 -->
    <el-form-item label="时区">
      <el-radio-group v-model="modelValue.timezoneMode">
        <el-radio label="ip_based">基于IP</el-radio>
        <el-radio label="real">真实</el-radio>
        <el-radio label="custom">自定义</el-radio>
      </el-radio-group>
      <el-select 
        v-if="modelValue.timezoneMode === 'custom'"
        v-model="modelValue.customTimezone"
        style="margin-top: 10px; width: 100%"
        filterable
      >
        <el-option label="Asia/Shanghai (中国标准时间)" value="Asia/Shanghai" />
        <el-option label="Asia/Tokyo (日本标准时间)" value="Asia/Tokyo" />
        <el-option label="America/New_York (美国东部时间)" value="America/New_York" />
        <el-option label="Europe/London (英国时间)" value="Europe/London" />
        <el-option label="America/Los_Angeles (美国西部时间)" value="America/Los_Angeles" />
      </el-select>
    </el-form-item>

    <!-- 地理位置 -->
    <el-form-item label="地理位置">
      <el-radio-group v-model="modelValue.geolocationMode">
        <el-radio label="ask">询问</el-radio>
        <el-radio label="allow">基于IP</el-radio>
        <el-radio label="block">阻止</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 语言 -->
    <el-form-item label="语言">
      <el-radio-group v-model="modelValue.languageMode">
        <el-radio label="ip_based">基于IP</el-radio>
        <el-radio label="custom">自定义</el-radio>
      </el-radio-group>
      <el-input 
        v-if="modelValue.languageMode === 'custom'"
        v-model="modelValue.customLanguage"
        placeholder="如: zh-CN, en-US"
        style="margin-top: 10px"
      />
    </el-form-item>

    <!-- 界面语言 -->
    <el-form-item label="界面语言">
      <el-radio-group v-model="modelValue.uiLanguageMode">
        <el-radio label="based_on_language">基于语言</el-radio>
        <el-radio label="custom">自定义</el-radio>
      </el-radio-group>
      <el-input 
        v-if="modelValue.uiLanguageMode === 'custom'"
        v-model="modelValue.customUiLanguage"
        placeholder="如: zh-CN"
        style="margin-top: 10px"
      />
    </el-form-item>

    <!-- 分辨率 -->
    <el-form-item label="分辨率">
      <el-radio-group v-model="modelValue.resolutionMode">
        <el-radio label="user_agent_based">基于User-Agent</el-radio>
        <el-radio label="random">随机</el-radio>
        <el-radio label="custom">自定义</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- Canvas -->
    <el-form-item label="Canvas">
      <el-radio-group v-model="modelValue.canvasMode">
        <el-radio label="noise">噪点</el-radio>
        <el-radio label="block">阻止</el-radio>
        <el-radio label="off">关闭</el-radio>
      </el-radio-group>
      <el-input 
        v-if="modelValue.canvasMode === 'noise' && modelValue.canvasNoise"
        v-model="modelValue.canvasNoise"
        readonly
        style="margin-top: 10px"
      >
        <template #prepend>噪点值</template>
      </el-input>
    </el-form-item>

    <!-- WebGL -->
    <el-form-item label="WebGL">
      <el-radio-group v-model="modelValue.webglMode">
        <el-radio label="noise">噪点</el-radio>
        <el-radio label="off">关闭</el-radio>
      </el-radio-group>
      <div v-if="modelValue.webglMode === 'noise'" style="margin-top: 10px">
        <el-input 
          v-model="modelValue.webglVendor"
          placeholder="如: Google Inc. (NVIDIA)"
          style="margin-bottom: 10px"
        >
          <template #prepend>Vendor</template>
        </el-input>
        <el-input 
          v-model="modelValue.webglRenderer"
          placeholder="如: ANGLE (NVIDIA, NVIDIA GeForce GTX 1660...)"
        >
          <template #prepend>Renderer</template>
        </el-input>
      </div>
    </el-form-item>

    <!-- AudioContext -->
    <el-form-item label="AudioContext">
      <el-radio-group v-model="modelValue.audioMode">
        <el-radio label="noise">噪点</el-radio>
        <el-radio label="off">关闭</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- ClientRects -->
    <el-form-item label="ClientRects">
      <el-radio-group v-model="modelValue.clientRectsMode">
        <el-radio label="noise">噪点</el-radio>
        <el-radio label="off">关闭</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- SpeechVoices -->
    <el-form-item label="SpeechVoices">
      <el-radio-group v-model="modelValue.speechVoicesMode">
        <el-radio label="noise">噪点</el-radio>
        <el-radio label="off">关闭</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- WebGPU -->
    <el-form-item label="WebGPU">
      <el-radio-group v-model="modelValue.webGpuMode">
        <el-radio label="webgl_based">基于WebGL</el-radio>
        <el-radio label="custom">自定义</el-radio>
        <el-radio label="off">关闭</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 媒体设备 -->
    <el-form-item label="媒体设备">
      <el-radio-group v-model="modelValue.mediaDevicesMode">
        <el-radio label="noise">噪点</el-radio>
        <el-radio label="off">关闭</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 硬件信息 -->
    <el-divider>硬件信息</el-divider>

    <el-form-item label="CPU核心数">
      <el-select v-model="modelValue.cpuCores" style="width: 200px">
        <el-option :value="4" label="4核" />
        <el-option :value="6" label="6核" />
        <el-option :value="8" label="8核" />
        <el-option :value="12" label="12核" />
        <el-option :value="16" label="16核" />
      </el-select>
    </el-form-item>

    <el-form-item label="内存大小">
      <el-select v-model="modelValue.memoryGb" style="width: 200px">
        <el-option :value="8" label="8GB" />
        <el-option :value="16" label="16GB" />
        <el-option :value="32" label="32GB" />
      </el-select>
    </el-form-item>

    <el-form-item label="设备名称">
      <el-input 
        v-model="modelValue.deviceName"
        placeholder="如: LAPTOP-A3B75B6"
      />
    </el-form-item>

    <el-form-item label="MAC地址">
      <el-input 
        v-model="modelValue.macAddress"
        placeholder="如: 00-50-FC-20-96-21"
      />
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import type { BrowserProfile } from '@/types'
import { generateFingerprint } from '@/api/fingerprint'

const modelValue = defineModel<Partial<BrowserProfile>>({ required: true })
const generating = ref(false)

async function handleGenerateFingerprint() {
  generating.value = true
  try {
    const res = await generateFingerprint()
    const fp = res.data
    
    // 应用生成的指纹数据
    modelValue.value.userAgent = fp.userAgent
    modelValue.value.screenWidth = fp.screenWidth
    modelValue.value.screenHeight = fp.screenHeight
    modelValue.value.timezone = fp.timezone
    modelValue.value.language = fp.language
    modelValue.value.webglVendor = fp.webglVendor
    modelValue.value.webglRenderer = fp.webglRenderer
    modelValue.value.canvasNoise = fp.canvasNoise
    modelValue.value.audioNoise = fp.audioNoise
    modelValue.value.cpuCores = fp.cpuCores
    modelValue.value.memoryGb = fp.memoryGb
    modelValue.value.deviceName = fp.deviceName
    modelValue.value.macAddress = fp.macAddress
    
    ElMessage.success('指纹已生成')
  } catch (error: any) {
    ElMessage.error('生成失败')
  } finally {
    generating.value = false
  }
}
</script>

<style scoped>
.fingerprint-settings {
  padding: 20px 0;
}
</style>
