<template>
  <div class="advanced-settings">
    <el-form-item label="Do Not Track">
      <el-radio-group v-model="modelValue.doNotTrack">
        <el-radio-button label="default">默认</el-radio-button>
        <el-radio-button label="enabled">开启</el-radio-button>
        <el-radio-button label="disabled">关闭</el-radio-button>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="端口扫描保护">
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%">
        <el-radio-group v-model="modelValue.portScanProtection">
          <el-radio-button label="enabled">启用</el-radio-button>
          <el-radio-button label="disabled">关闭</el-radio-button>
        </el-radio-group>
        <el-input 
          v-if="modelValue.portScanProtection === 'enabled'"
          v-model="modelValue.portScanProtectionPorts"
          placeholder="选填，允许被扫描的端口"
        />
      </div>
    </el-form-item>

    <el-form-item label="硬件加速">
      <el-radio-group v-model="modelValue.hardwareAcceleration">
        <el-radio-button label="default">默认</el-radio-button>
        <el-radio-button label="enabled">开启</el-radio-button>
        <el-radio-button label="disabled">关闭</el-radio-button>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="禁用TLS特性">
      <el-radio-group v-model="modelValue.disableTlsFeatures">
        <el-radio-button label="enabled">开启</el-radio-button>
        <el-radio-button label="disabled">关闭</el-radio-button>
      </el-radio-group>
    </el-form-item>

    <el-divider>启动参数</el-divider>

    <el-form-item label="用户数据目录">
      <el-input 
        v-model="modelValue.userDataDir"
        placeholder="留空则自动生成"
        readonly
        disabled
      />
      <div style="margin-top: 5px; color: #909399; font-size: 12px">
        浏览器配置和Cookie存储位置,系统自动管理
      </div>
    </el-form-item>

    <el-form-item label="自定义启动参数">
      <el-input 
        v-model="modelValue.launchArgs"
        type="textarea"
        :rows="4"
        placeholder="每行一个参数,如: --disable-web-security"
      />
      <div style="margin-top: 5px; color: #909399; font-size: 12px">
        高级用户使用,不正确的参数可能导致浏览器无法启动
      </div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import type { BrowserProfile } from '@/types'

const modelValue = defineModel<Partial<BrowserProfile>>({ required: true })
</script>

<style scoped>
.advanced-settings {
  padding: 20px 0;
}
</style>
