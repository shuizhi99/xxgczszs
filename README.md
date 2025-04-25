# 信息工程招生助手

这是一个基于 React 和 Coze API 开发的智能招生助手应用。

## 功能特点

- 智能问答：基于 Coze API 的智能对话系统
- 实时响应：使用流式响应实现打字机效果
- 美观界面：现代化的 UI 设计
- 响应式布局：适配各种设备屏幕

## 技术栈

- React
- TypeScript
- Coze API

## 开始使用

1. 克隆项目
```bash
git clone https://gitlab.nianhuaci.cn/fhy/xxgczszs.git
cd xxgczszs
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm start
```

4. 构建生产版本
```bash
npm run build
```

## 配置说明

在 `src/App.tsx` 中配置以下参数：

```typescript
const CONFIG: AppConfig = {
  API_URL: 'https://api.coze.cn/v3/chat',   // API 地址
  API_KEY: 'your-api-key',                  // 替换为你的 API 密钥
  BOT_ID: 'your-bot-id',                    // 替换为你的机器人 ID
  USER_ID: 'your-user-id'                   // 自定义用户标识
};
```

## 部署说明

1. 构建项目
```bash
npm run build
```

2. 将 `build` 目录下的文件部署到您的服务器

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

MIT License
