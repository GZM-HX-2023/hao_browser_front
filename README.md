# 指纹浏览器前端

基于Vue3 + TypeScript + Vite + Element Plus的指纹浏览器管理前端。

## 技术栈

- Vue 3.4
- TypeScript 5.3
- Vite 5
- Element Plus 2.5
- Vue Router 4
- Pinia 2
- Axios

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 `http://localhost:5173`

### 生产构建

```bash
npm run build
```

## 项目结构

```
frontend/
├── src/
│   ├── api/                  # API接口
│   │   ├── browser.ts
│   │   ├── kernel.ts
│   │   ├── proxy.ts
│   │   └── fingerprint.ts
│   ├── components/           # 组件
│   ├── views/                # 页面
│   │   ├── BrowserList.vue
│   │   ├── CreateBrowser.vue
│   │   ├── ProxyManagement.vue
│   │   └── RpaEditor.vue
│   ├── router/               # 路由
│   ├── stores/               # 状态管理
│   ├── types/                # 类型定义
│   ├── utils/                # 工具函数
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 功能模块

### 浏览器管理
- 创建/编辑/删除浏览器配置
- 启动/停止浏览器实例
- 浏览器列表查看

### 代理管理
- 添加/编辑/删除代理
- 代理连接测试
- 代理列表管理

### 指纹配置
- 选择浏览器内核
- 配置指纹参数
- 随机生成指纹

### RPA编辑器
- 可视化流程设计
- 流程调试执行

## API代理配置

开发环境下,Vite会将`/api`请求代理到`http://localhost:8080`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

## 后端配置

确保后端服务运行在 `http://localhost:8080`

## License

MIT
