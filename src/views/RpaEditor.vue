<template>
  <div class="rpa-editor-container">
    <el-card>
      <template #header>
        <span class="title">RPA编辑器</span>
      </template>
      
      <el-empty description="RPA可视化编辑器开发中..." />
      
      <div style="text-align: center; margin-top: 20px; color: #909399">
        <p>计划使用 vue-flow 实现拖拽式RPA流程编辑</p>
        <p>支持节点类型: 点击、输入、等待、条件判断、循环等</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// RPA编辑器待开发
</script>

<style scoped>
.rpa-editor-container {
  padding: 20px;
}

.title {
  font-size: 18px;
  font-weight: 600;
}
</style>
