<template>
  <div class="account-settings">
    <el-form-item label="账号平台">
      <el-select 
        v-model="modelValue.platform" 
        placeholder="请选择账号平台"
        style="width: 100%"
        filterable
        allow-create
      >
        <el-option label="Facebook" value="facebook" />
        <el-option label="Twitter" value="twitter" />
        <el-option label="Instagram" value="instagram" />
        <el-option label="TikTok" value="tiktok" />
        <el-option label="Amazon" value="amazon" />
        <el-option label="eBay" value="ebay" />
        <el-option label="Google" value="google" />
        <el-option label="其他" value="other" />
      </el-select>
    </el-form-item>

    <el-form-item label="账号标签">
      <el-input 
        v-model="modelValue.accountTags" 
        placeholder="输入标签,用逗号分隔"
      />
    </el-form-item>

    <el-form-item label="书签/标签页">
      <el-input 
        v-model="modelValue.bookmarks" 
        type="textarea"
        :rows="8"
        placeholder="每行一个URL,启动时自动打开"
      />
      <div style="margin-top: 10px">
        <el-button size="small" @click="handleAddCommonSite('google')">
          添加Google
        </el-button>
        <el-button size="small" @click="handleAddCommonSite('facebook')">
          添加Facebook
        </el-button>
        <el-button size="small" @click="handleAddCommonSite('twitter')">
          添加Twitter
        </el-button>
        <el-button size="small" @click="handleClearBookmarks">
          清空
        </el-button>
      </div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import type { BrowserProfile } from '@/types'

const modelValue = defineModel<Partial<BrowserProfile>>({ required: true })

const commonSites: Record<string, string> = {
  google: 'https://www.google.com',
  facebook: 'https://www.facebook.com',
  twitter: 'https://twitter.com',
  instagram: 'https://www.instagram.com',
  amazon: 'https://www.amazon.com'
}

function handleAddCommonSite(site: string) {
  const url = commonSites[site]
  if (!url) return
  
  const current = modelValue.value.bookmarks || ''
  const urls = current.split('\n').filter(u => u.trim())
  
  if (!urls.includes(url)) {
    urls.push(url)
    modelValue.value.bookmarks = urls.join('\n')
  }
}

function handleClearBookmarks() {
  modelValue.value.bookmarks = ''
}
</script>

<style scoped>
.account-settings {
  padding: 20px 0;
}
</style>
