# Codex Project Instructions

本文档用于提前告知 Codex 当前项目背景、代码规范和默认修改边界。后续任务中如果没有额外说明，优先按本文档执行；如果用户在当前任务里给出更具体的要求，以当前任务为准。

## Project Context

- 项目名称：`solara-b2b-catalog`
- 项目类型：B2B 商品目录站点
- 技术栈：Astro、TypeScript、React、Tailwind CSS、Sanity
- 主要业务：展示首页内容、产品分类、精选产品、应用场景、案例、询价入口和 FAQ
- 内容来源：页面数据主要通过 Sanity 查询获取，相关逻辑位于 `src/lib/homeData.ts`

## Repository Structure

- `src/pages/`：Astro 页面入口
- `src/components/`：页面组件，首页组件集中在 `src/components/home/`
- `src/layouts/`：页面布局
- `src/lib/`：数据查询、类型定义和共享工具
- `src/styles/`：页面样式
- `public/`：静态资源
- `doc/`：项目文档、工作日志和协作说明
- `astro.config.mjs`：Astro、Tailwind、Sanity 集成配置

## Default Workflow

1. 修改前先阅读与任务直接相关的文件，理解现有结构和写法。
2. 优先沿用现有组件、类型、样式命名和数据流。
3. 保持修改范围尽量小，不做与任务无关的重构。
4. 修改完成后运行最相关的验证命令。
5. 最终回复说明改了什么、验证了什么、是否还有风险或未完成项

## Coding Rules

- 使用 TypeScript 时保持类型清晰，避免不必要的 `any`。
- Astro 组件、TypeScript 数据类型、CSS class 命名应与现有文件风格一致。
- 数据结构变更必须检查引用方，避免破坏页面渲染。
- 面向用户的英文文案应保持 B2B、清晰、克制的表达风格。
- 不新增依赖，除非当前任务明确要求或先获得用户确认。
- 不做大规模格式化，不改动无关文件。
- 注释只在逻辑不直观时添加，避免重复描述代码本身。

## Edit Boundaries

默认可以修改：

- `src/**`
- `doc/**`
- `public/**`

需要谨慎并在必要时先确认：

- `package.json`
- `pnpm-lock.yaml`
- `astro.config.mjs`
- `tsconfig.json`
- Sanity 项目配置、dataset、API version

默认不要修改：

- 环境变量文件
- 部署配置
- 与当前任务无关的依赖版本
- 用户未要求删除的业务数据、图片或文档

## Data And Sanity Notes

- 首页数据查询集中在 `src/lib/homeData.ts`。
- 修改 Sanity 查询时，需要同步检查对应的 TypeScript 类型。
- 对可选字段保持防御式处理，避免 Sanity 缺字段导致页面报错。
- 涉及图片字段时，应保留合理的 fallback 和 `alt` 文案来源。
- 修改首页数据结构后，需要检查 `src/pages/index.astro` 和 `src/components/home/` 下的消费方。

## Styling Rules

- 首页全局样式集中在 `src/styles/home.css`。
- 优先复用现有布局、间距、色彩和按钮样式。
- 保持响应式表现稳定，移动端文字不能溢出容器。
- 不引入新的视觉体系，除非任务明确要求重新设计。
- 不把主要页面体验包进无意义的装饰性卡片。

## Verification

项目使用 `pnpm-lock.yaml`，优先使用 `pnpm`。

常用命令：

```bash
pnpm build
pnpm dev
pnpm preview
```

当前 `package.json` 未定义 `lint` 或 `test` 脚本。若任务需要验证，默认优先运行：

```bash
pnpm build
```

如果验证命令无法运行，需要在最终回复里说明原因和影响。

## Work Log

- 用户要求生成或更新工作日志、日报、复盘时，使用 `daily-work-log` skill。
- 工作日志放在 `doc/` 目录下，文件名建议使用 `WORK_LOG_YYYY-MM-DD.md`。
- 工作日志内容应记录已完成工作、遇到的问题、处理方式、后续事项和涉及模块。

## Communication

- 如果任务边界清晰，直接执行。
- 如果需求会影响依赖、配置、部署、数据模型或大量文件，先说明风险并确认。
- 如果发现工作区已有用户修改，不要回滚；应基于现状继续处理。
- 最终回复保持简洁，包含关键文件、验证结果和必要提醒。
