# Solara B2B Catalog

Solara B2B Catalog 是一个基于 Astro 的 B2B 商品目录站点，用于展示首页内容、产品分类、精选产品、应用场景、客户案例、询价入口和 FAQ。

页面内容主要从 Sanity 获取，首页数据查询与类型定义集中在 `src/lib/homeData.ts`。

## Tech Stack

- Astro 6
- TypeScript
- React 19
- Tailwind CSS 4
- Sanity
- pnpm

## Requirements

- Node.js `>=22.12.0`
- pnpm

## Getting Started

安装依赖：

```bash
pnpm install
```

启动本地开发服务：

```bash
pnpm dev
```

构建生产版本：

```bash
pnpm build
```

预览生产构建：

```bash
pnpm preview
```

## Available Scripts

- `pnpm dev`：启动 Astro 开发服务
- `pnpm build`：构建生产版本
- `pnpm preview`：本地预览生产构建
- `pnpm astro`：运行 Astro CLI

## Project Structure

```text
.
├── astro.config.mjs
├── doc/
├── public/
├── src/
│   ├── components/
│   │   └── home/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   └── styles/
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

主要目录说明：

- `src/pages/`：Astro 页面入口
- `src/components/home/`：首页分区组件
- `src/layouts/`：页面布局
- `src/lib/`：数据查询、类型定义和共享工具
- `src/styles/`：页面样式
- `public/`：静态资源
- `doc/`：项目文档、工作日志和协作说明

## Data Flow

首页入口位于 `src/pages/index.astro`，通过 `fetchHomeData()` 从 Sanity 获取数据，并传递给首页各个组件。

Sanity 查询、首页数据类型和图片辅助函数位于：

```text
src/lib/homeData.ts
```

当前首页使用的数据包括：

- site settings
- product categories
- featured products
- applications
- case studies
- FAQs

Sanity 集成配置位于 `astro.config.mjs`。

## Development Notes

- 修改数据查询时，需要同步检查 `src/lib/homeData.ts` 中的 TypeScript 类型。
- 修改首页数据结构时，需要检查 `src/pages/index.astro` 和 `src/components/home/` 下的消费方。
- 修改样式时，优先沿用 `src/styles/home.css` 中已有的布局、间距和组件样式。
- 项目当前未定义 `lint` 或 `test` 脚本，提交前可优先运行 `pnpm build` 做基础验证。
- 协作规则和默认修改边界见 `doc/AGENTS.md`。

## Documentation

- `doc/AGENTS.md`：Codex 协作说明、代码规范和修改边界
- `doc/WORK_LOG_YYYY-MM-DD.md`：每日工作日志
