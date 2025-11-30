<template>
  <div class="sidebar">
    <!-- Logo区域 -->
    <div class="sidebar-header">
      <div class="logo-container">
        <el-icon class="logo-icon" :size="28">
          <ChromeFilled />
        </el-icon>
        <transition name="fade">
          <span v-show="!collapsed" class="brand-name">指纹浏览器</span>
        </transition>
      </div>
    </div>

    <!-- 新建浏览器按钮 -->
    <div class="create-button-container">
      <el-button
        type="primary"
        :icon="Plus"
        class="create-button"
        @click="handleCreateBrowser"
      >
        <span v-show="!collapsed">新建浏览器</span>
      </el-button>
    </div>

    <!-- 导航菜单 -->
    <el-scrollbar class="sidebar-menu-scrollbar">
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="collapsed"
        :collapse-transition="false"
        background-color="#001529"
        text-color="#ffffff"
        active-text-color="#1890ff"
        @select="handleMenuSelect"
      >
        <!-- 主功能区 -->
        <div class="menu-group-label" v-show="!collapsed">主功能</div>
        
        <el-menu-item index="/browser-list">
          <el-icon><Monitor /></el-icon>
          <template #title>环境管理</template>
        </el-menu-item>

        <el-menu-item index="/groups">
          <el-icon><FolderOpened /></el-icon>
          <template #title>分组配置</template>
        </el-menu-item>

        <el-menu-item index="/proxy">
          <el-icon><Connection /></el-icon>
          <template #title>代理管理</template>
        </el-menu-item>

        <el-menu-item index="/recycle-bin">
          <el-icon><Delete /></el-icon>
          <template #title>回收站</template>
        </el-menu-item>

        <!-- 云功能区 -->
        <div class="menu-group-label" v-show="!collapsed">云功能</div>

        <el-menu-item index="/rpa">
          <el-icon><Operation /></el-icon>
          <template #title>RPA</template>
        </el-menu-item>

        <el-menu-item index="/api">
          <el-icon><Setting /></el-icon>
          <template #title>API</template>
        </el-menu-item>

        <!-- 设置区 -->
        <div class="menu-group-label" v-show="!collapsed">系统</div>

        <el-menu-item index="/settings">
          <el-icon><Tools /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>

    <!-- 底部折叠按钮 -->
    <div class="sidebar-footer">
      <el-button
        text
        class="collapse-button"
        @click="handleToggle"
      >
        <el-icon>
          <DArrowLeft v-if="!collapsed" />
          <DArrowRight v-else />
        </el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ChromeFilled,
  Plus,
  Monitor,
  FolderOpened,
  Connection,
  Delete,
  Operation,
  Setting,
  Tools,
  DArrowLeft,
  DArrowRight
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const collapsed = ref(false)
const activeMenu = ref('/browser-list')

// 监听路由变化更新激活菜单
watch(() => route.path, (newPath) => {
  activeMenu.value = newPath
}, { immediate: true })

const emit = defineEmits(['toggle'])

const handleToggle = () => {
  collapsed.value = !collapsed.value
  emit('toggle', collapsed.value)
}

const handleCreateBrowser = () => {
  router.push('/browser/create')
}

const handleMenuSelect = (index: string) => {
  router.push(index)
}
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--sidebar-bg);
}

.sidebar-header {
  padding: var(--spacing-lg) var(--spacing-md);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-white);
}

.logo-icon {
  color: var(--primary-color);
}

.brand-name {
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

.create-button-container {
  padding: var(--spacing-md);
}

.create-button {
  width: 100%;
  font-weight: 500;
}

.sidebar-menu-scrollbar {
  flex: 1;
  overflow-x: hidden;
}

.sidebar-menu {
  border-right: none;
}

.menu-group-label {
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-sm);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: var(--spacing-md);
}

.sidebar-menu :deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  margin: 2px 8px;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.08) !important;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: var(--primary-color) !important;
  color: var(--text-white) !important;
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.collapse-button {
  width: 100%;
  color: rgba(255, 255, 255, 0.65);
  transition: color var(--transition-fast);
}

.collapse-button:hover {
  color: var(--text-white);
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
