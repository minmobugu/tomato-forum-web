# 仓库协作指南

## 项目概述
该仓库是 `小番茄` 游戏社区产品的前端项目，技术栈为 Vue 3 + TypeScript + Vite。

当前应用基于本地 mock 数据驱动：`src/services/` 提供异步 API，但这些 API 实际上读取的是 `src/mock/` 中的本地种子数据，而不是调用后端服务。

现有的 `README.md` 仍然是默认的 Vite 模板内容，不能作为项目级规范的依据。请以代码仓库本身和本文件作为事实来源。

## 技术栈
- Vue `3.5`
- TypeScript `~6.0`
- Vite `8`
- Vue Router `4`
- Pinia `3`
- Sass
- ESLint Flat Config
- Prettier
- Vitest + `@vue/test-utils`
- 已安装 Axios，但当前尚未用于真实后端请求

## 常用命令
所有命令均需在仓库根目录执行，并使用 Node `>=20`。

- `npm install`：安装依赖
- `npm run dev`：启动 Vite 开发服务器
- `npm run build`：执行 `vue-tsc -b` 并构建生产包
- `npm run preview`：预览生产构建结果
- `npm run lint`：对 `.ts` 和 `.vue` 文件执行 ESLint
- `npm test`：执行一次 Vitest 测试
- `npx vitest run src/test/community.spec.ts`：单独运行当前测试文件

## 提交规范
- Git commit message 必须统一采用 Conventional Commits 规范，并使用全英文编写
- 统一格式：`<type>(<scope>): <subject>`
- 采用该规范的目的包括：提高 Commit 可读性、区分功能开发和 Bug 修复等类型、支持自动生成 Changelog、支持版本发布自动化、提高多人协作效率

## 项目结构
大部分应用代码位于 `src/` 目录下。

- `src/main.ts`：应用启动入口，注册 Pinia 和 Router，并加载全局 SCSS
- `src/App.vue`：精简的根组件
- `src/layouts/`：持久化布局层，尤其是 `MainLayout.vue`
- `src/router/`：路由定义和全局鉴权守卫
- `src/views/`：按功能划分的页面级视图
- `src/components/`：可复用组件，按业务域分组，如 `home/`、`layout/`、`post/`、`auth/`
- `src/stores/`：Pinia Store 以及共享状态管理
- `src/services/`：基于本地 mock 数据的异步服务层
- `src/mock/`：认证和社区相关的种子数据
- `src/types/`：共享领域类型定义
- `src/assets/styles/main.scss`：全局设计令牌和共享样式
- `src/test/`：Vitest 测试用例
- `public/`：静态图标和 favicon

## 架构说明
代码库采用清晰的前端分层结构：

1. `src/types/` 定义领域模型。
2. `src/mock/` 存放种子数据。
3. `src/services/` 对这些数据暴露基于 Promise 的 API。
4. `src/stores/` 负责状态、计算属性、变更逻辑和跨模块编排。
5. `src/views/` 与 `src/components/` 负责渲染界面并触发 Store 行为。

应尽量将数据整形逻辑和跨视图行为保留在 Store 中，不要下沉到组件内部。

### 路由与应用壳层
- 路由在 `src/router/index.ts` 中按需懒加载
- 受保护路由包括 `messages`、`publish` 和 `profile`
- 路由保护通过 `meta.requiresAuth` 配合全局 `beforeEach` 守卫实现
- 当导航被拦截时，守卫会打开认证弹窗，并记录用户原本想访问的目标地址，而不是跳转到独立登录页
- `src/layouts/MainLayout.vue` 是实际的应用壳层，负责顶部导航、全局搜索面板、认证弹窗联动、路由标题以及视口事件处理

### 状态管理
- `src/stores/community.ts` 是核心内容 Store，负责首页数据初始化、信息流筛选、消息已读状态、点赞/收藏交互状态、帖子详情加载以及内存态发帖
- `src/stores/auth.ts` 负责认证弹窗状态、登录模式、加载状态、错误消息、当前会话以及登录后的受保护路由恢复
- `src/stores/pinia.ts` 导出单例 Pinia 实例，便于在组件 `setup` 之外使用 Store，例如路由守卫

### 服务与数据
- `src/services/community.ts` 和 `src/services/auth.ts` 基于本地 mock 数据返回 `Promise.resolve(...)` 或 rejected promise
- 当前没有真实后端集成
- 如果新增字段或行为，必须同时更新 `types`、`mock`、`services` 和 `stores`，保持各层一致

## 当前功能区域
- `src/views/home/HomeView.vue`：首页，包含 Hero 内容、活动横幅、频道、精选游戏、排行榜和可筛选帖子流
- `src/views/post/PostDetailView.vue`：帖子详情阅读页和评论区
- `src/views/publish/PublishView.vue`：发帖流程，写入社区 Store 的内存数据
- `src/views/messages/MessagesView.vue`：消息中心，数据来源于顶部消息模块
- `src/views/profile/ProfileView.vue`：用户个人主页及相关内容
- `src/views/games/GamesView.vue`：游戏发现页

## 样式约定
- 全局样式位于 `src/assets/styles/main.scss`
- 项目使用基于 CSS 自定义属性的深色主题设计体系，例如 `--bg`、`--brand`、`--line` 以及间距、圆角等令牌
- 新增页面样式前，优先复用已有的语义化工具类和布局模式，避免随意引入一次性样式
- Vue 单文件组件和常规代码统一使用 2 空格缩进

## 编码约定
- 优先使用带 `<script setup lang="ts">` 的 Vue SFC
- Vue 组件文件名使用 PascalCase，例如 `PostCard.vue`
- Store 和 Service 导出使用 camelCase，例如 `communityService`、`useCommunityStore`
- 导入路径可使用相对路径，也可使用 `@` 别名；`vite.config.ts` 已将 `@` 映射到 `src/`
- Prettier 配置为 `semi: false`、`singleQuote: true`
- `tsconfig.app.json` 中启用了 `noUnusedLocals` 和 `noUnusedParameters`，不要留下未使用代码

## 测试说明
- Vitest 在 `vite.config.ts` 中配置为 `environment: 'jsdom'` 且启用了 `globals: true`
- 当前自动化测试覆盖较少，主要集中在 `src/test/community.spec.ts` 的服务层逻辑
- 如果改动了行为逻辑，优先补充 Store、认证流程和路由相关测试，而不是只验证静态渲染

## Agent 协作要求
- 需求文档统一存放在工作区根目录的 `../docs/tasks`
- 接口文档按微服务存放在 `../docs/contracts/<微服务名>/openapi.yaml`，当前已存在认证服务文档 `../docs/contracts/tomato-auth/openapi.yaml`
- 开发任何需求前，必须先阅读并遵循对应的需求文档，不得脱离需求文档自行扩展或偏离实现
- 进行较大改动前，必须一并检查相关的 Store、Service、Type 和 View 文件，很多行为是跨层协同设计的
- 将该应用视为 mock-first 项目，除非需求明确要求，否则不要假设存在真实后端
- 保留现有认证流程设计：受保护导航应拉起认证弹窗，并在登录后恢复原目标路由
- 除非只是纯展示层行为，否则不要用组件内的临时状态替代 Store 逻辑
- 对于在多个页面、多个业务区块，或同一页面内重复出现且具备稳定结构的 UI/交互片段，必须优先抽离为可复用组件，避免将可公用内容长期以内联模板形式分散实现
- 如果改动影响种子数据结构，必须同步更新 `src/mock/`、`src/types/` 以及依赖这些结构的 UI
- 在 `README.md` 被重写之前，不要将其视为权威文档
