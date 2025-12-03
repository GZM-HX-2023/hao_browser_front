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
        <el-radio-button label="ip_based">基于 IP</el-radio-button>
        <el-radio-button label="custom">自定义</el-radio-button>
      </el-radio-group>
      
      <div v-if="modelValue.languageMode === 'custom'" class="language-custom-panel">
        <div class="language-list">
          <div v-for="(lang, index) in selectedLanguages" :key="index" class="language-item">
            <span>{{ getLanguageLabel(lang) }}</span>
            <el-button 
              type="danger" 
              link 
              :icon="Delete" 
              @click="removeLanguage(index)"
            />
          </div>
        </div>
        
        <div class="add-language-wrapper">
          <el-popover
            placement="bottom-start"
            :width="200"
            trigger="click"
          >
            <template #reference>
              <el-button type="primary" link :icon="Plus">添加语言</el-button>
            </template>
            <div class="language-options">
              <div 
                v-for="option in languageOptions" 
                :key="option.value"
                class="language-option-item"
                @click="addLanguage(option.value)"
              >
                {{ option.label }}
              </div>
            </div>
          </el-popover>
        </div>
      </div>
    </el-form-item>

    <!-- 界面语言 -->
    <el-form-item label="界面语言">
      <el-radio-group v-model="modelValue.uiLanguageMode">
        <el-radio-button label="based_on_language">基于语言</el-radio-button>
        <el-radio-button label="real">真实</el-radio-button>
        <el-radio-button label="custom">自定义</el-radio-button>
      </el-radio-group>
      <el-select
        v-if="modelValue.uiLanguageMode === 'custom'"
        v-model="modelValue.customUiLanguage"
        placeholder="请选择界面语言"
        style="margin-top: 10px; width: 100%"
        filterable
      >
        <el-option 
          v-for="option in languageOptions" 
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </el-form-item>

    <!-- 分辨率 -->
    <el-form-item label="分辨率">
      <el-radio-group v-model="modelValue.resolutionMode">
        <el-radio-button label="user_agent_based">预定义</el-radio-button>
        <el-radio-button label="custom">自定义</el-radio-button>
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
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Delete, Plus } from '@element-plus/icons-vue'
import type { BrowserProfile } from '@/types'
import { generateFingerprint } from '@/api/fingerprint'

const modelValue = defineModel<Partial<BrowserProfile>>({ required: true })
const generating = ref(false)

const languageOptions = [
  { label: '英语 (美国)', value: 'en-US' },
  { label: '英语 (英国)', value: 'en-GB' },
  { label: '英语', value: 'en' },
  { label: '中文 (简体)', value: 'zh-CN' },
  { label: '中文 (繁体)', value: 'zh-TW' },
  { label: '日语', value: 'ja-JP' },
  { label: '韩语', value: 'ko-KR' },
  { label: '法语', value: 'fr-FR' },
  { label: '德语', value: 'de-DE' },
  { label: '俄语', value: 'ru-RU' },
  { label: '西班牙语', value: 'es-ES' },
  { label: '葡萄牙语', value: 'pt-PT' },
  { label: '意大利语', value: 'it-IT' },
  { label: '越南语', value: 'vi-VN' },
  { label: '泰语', value: 'th-TH' },
  { label: '印尼语', value: 'id-ID' }
]

const selectedLanguages = computed({
  get: () => {
    if (!modelValue.value.customLanguage) return []
    return modelValue.value.customLanguage.split(',').map(s => s.trim()).filter(Boolean)
  },
  set: (val) => {
    modelValue.value.customLanguage = val.join(',')
  }
})

const getLanguageLabel = (code: string) => {
  const option = languageOptions.find(opt => opt.value === code)
  return option ? option.label : code
}

const addLanguage = (code: string) => {
  if (!selectedLanguages.value.includes(code)) {
    selectedLanguages.value = [...selectedLanguages.value, code]
  }
}

const removeLanguage = (index: number) => {
  const newList = [...selectedLanguages.value]
  newList.splice(index, 1)
  selectedLanguages.value = newList
}

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
    
    // 如果生成了语言，也同步更新 customLanguage
    if (fp.language) {
        modelValue.value.customLanguage = fp.language
    }

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

.language-custom-panel {
  margin-top: 10px;
  width: 100%;
}

.language-list {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 5px;
  margin-bottom: 10px;
}

.language-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
  color: #606266;
}

.language-item:last-child {
  border-bottom: none;
}

.language-item:hover {
  background-color: #fafafa;
}

.add-language-wrapper {
  padding-left: 5px;
}

.language-options {
  max-height: 300px;
  overflow-y: auto;
}

.language-option-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
}

.language-option-item:hover {
  background-color: #f5f7fa;
  color: var(--primary-color);
}
</style>
