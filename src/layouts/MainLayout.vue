<template>
  <el-container class="main-layout">
    <!-- 侧边栏 -->
    <el-aside :width="sidebarWidth" class="sidebar-container">
      <Sidebar @toggle="handleSidebarToggle" />
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container class="content-container">
      <!-- 顶部栏（可选） -->
      <el-header v-if="showHeader" height="60px" class="top-header">
        <div class="header-left">
          <el-icon class="toggle-icon" @click="handleSidebarToggle">
            <Fold v-if="!collapsed" />
            <Expand v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <el-icon class="notification-icon">
            <Bell />
          </el-icon>
          <el-dropdown>
            <div class="user-info">
              <el-avatar :size="32">User</el-avatar>
              <span class="username">管理员</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 主内容 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Sidebar from '@/components/sidebar/Sidebar.vue'
import { Fold, Expand, Bell } from '@element-plus/icons-vue'

const collapsed = ref(false)
const showHeader = ref(true) // 可配置是否显示顶部栏

const sidebarWidth = computed(() => {
  return collapsed.value ? '64px' : '200px'
})

const handleSidebarToggle = () => {
  collapsed.value = !collapsed.value
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  overflow: hidden;
}

.sidebar-container {
  background-color: var(--sidebar-bg);
  transition: width var(--transition-normal);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.content-container {
  background-color: var(--bg-color);
}

.top-header {
  background-color: var(--content-bg);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.toggle-icon {
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

.toggle-icon:hover {
  color: var(--primary-color);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.notification-icon {
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

.notification-icon:hover {
  color: var(--primary-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.username {
  font-size: 14px;
  color: var(--text-primary);
}

.main-content {
  padding: var(--spacing-lg);
  overflow: hidden; /* 交由子页面管理滚动 */
  display: flex;
  flex-direction: column;
  flex: 1; /* 关键：填满剩余空间 */
  min-height: 0; /* 关键：防止被内容撑开 */
}

/* 页面切换动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all var(--transition-normal);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
