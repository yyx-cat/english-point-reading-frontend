<script setup>
// 根组件 - 提供路由出口
</script>

<template>
  <!-- 路由视图容器 -->
  <router-view />
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* 全局按钮重置 */
button {
  font-family: inherit;
  border: none;
  outline: none;
  cursor: pointer;
}

/* 全局列表重置 */
ul,
ol {
  list-style: none;
}
</style>