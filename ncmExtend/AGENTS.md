# ncmExtend Agent Guide

本文件定义在 `ncmExtend` 子项目内进行自动化或半自动化改动时的最小协作规范。

## 1. 项目目标

- 这是一个基于 `vite-plugin-monkey` 构建的网易云音乐 userscript。
- 主入口为 `src/main.js`，构建产物为 `dist/ncmExtend.user.js`。
- `publish/ncmExtend.user.js` 用于发布分发，通常由构建产物同步得到。

## 2. 目录职责

- `src/`：业务源码。
- `src/home/`、`src/album/`、`src/playlist/`、`src/song/`、`src/artist/`：按页面/功能域拆分。
- `src/components/`：跨功能复用组件。
- `src/utils/`：通用工具与基础能力。
- `dist/`：构建产物目录（生成文件）。
- `publish/`：发布目录（分发脚本）。

## 3. 本地开发命令

在 `ncmExtend` 目录下执行：

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run lint
pnpm run lint:fix
pnpm run format
pnpm run format:write
```

## 4. 代码与格式规范

- 使用 ESM（`type: module`）。
- ESLint 必须通过，重点关注：
  - `no-unused-vars`（允许 `_` 前缀参数）
  - `no-undef`
  - `no-empty`
- Prettier 规则：
  - `singleQuote: true`
  - `semi: true`
  - `trailingComma: es5`
  - `printWidth: 120`

## 5. 改动边界

- 优先最小化改动，只修改与需求直接相关的文件。
- 不要无关重构或大规模重排。
- 除非需求明确要求，避免修改 `dist/` 与 `publish/` 的生成文件。
- 涉及脚本权限（`grant`/`connect`/`match`）变更时，必须在说明中明确变更原因与影响。

## 6. 验收清单

提交前至少完成：

1. `pnpm run lint`
2. `pnpm run format`
3. `pnpm run build`

如有行为变更，需补充：

- 影响页面（如歌单页、专辑页、云盘页）
- 手动验证步骤
- 预期结果

## 7. 提交说明建议

- 提交信息使用“动词 + 目标 + 目的”的简短结构，例如：
  - `fix: 修复云盘导入在空文件时的异常`
  - `feat: 为歌单页增加按评论数排序`
- PR/变更说明中包含：
  - 背景
  - 改动点
  - 验证结果
  - 风险与回滚方式（如有）
