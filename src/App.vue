<template>
  <router-view />
</template>

<script setup lang="ts">
// App.vue现在只负责渲染路由
// 所有布局逻辑都在MainLayout.vue中
</script>

<style>
@import './styles/variables.css';
#app {
  width: 100%;
  height: 100vh;
}
</style>
