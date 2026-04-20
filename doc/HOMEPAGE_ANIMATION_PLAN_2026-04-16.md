# 首页动画落地方案

日期：2026-04-16

## 目标

为当前 B2B 首页增加一批轻量、稳定、可维护的动画效果，提升页面节奏感和交互反馈，同时避免对性能、信息传达和可信度造成负面影响。

## 动画原则

- 动画服务于信息传达，不喧宾夺主。
- 优先使用 `opacity`、`translateY`、`scale` 这类低风险属性。
- 页面滚动动画仅首次触发，不循环反复播放。
- 所有动画需兼容移动端。
- 需支持 `prefers-reduced-motion`，在用户关闭动画偏好时自动退化。

## 第一批动画范围

### 1. Hero 首屏进场

范围：

- `eyebrow`
- 主标题
- 副标题
- CTA 按钮

方案：

- 使用 CSS keyframes 做首屏 stagger reveal。
- 各元素按 80-120ms 的间隔依次出现。
- 只做淡入和轻微上移，不做大幅位移或复杂视差。

预期效果：

- 用户打开页面时首屏更有节奏感。
- 保持 B2B 首页应有的稳重感。

### 2. Stats 数字滚动

范围：

- `StatsBand` 中的指标数值

方案：

- 区块进入视口后触发 count-up。
- 仅对可解析为数值的前缀/后缀型文本做动画，例如：
  - `15+`
  - `20,000`
  - `98%`
- 无法解析的值保持原样展示。

预期效果：

- 强化数据可信度和视觉吸引力。

### 3. 列表区块滚动进入

范围：

- `ProductsSection`
- `ApplicationsSection`
- `CaseStudiesSection`
- `RfqSection` 的左右两列

方案：

- 使用 `IntersectionObserver` 监听带有 `data-reveal` 的元素。
- 元素首次进入视口后执行淡入上移。
- 卡片按索引带少量延迟，形成自然错峰。

预期效果：

- 页面在向下滚动时更有层次。
- 避免一屏信息同时砸给用户。

### 4. FAQ 展开过渡

范围：

- `RfqSection` 中的 FAQ `details`

方案：

- 保留原生 `details/summary` 语义结构。
- 内容区域增加包裹层，使用高度和透明度过渡。
- 展开时答案自然出现，关闭时平滑收起。

预期效果：

- 优化 FAQ 阅读体验。
- 减少原生折叠的生硬感。

### 5. 询盘表单提交状态反馈

范围：

- `RfqSection` 表单提交按钮
- 提交成功 / 失败提示

方案：

- 表单提交后按钮进入 `Sending...` 状态。
- Basin 成功或失败提示显示时自动解除提交中状态。
- 加一个超时兜底，避免按钮永久锁死。

预期效果：

- 用户明确知道请求已发出。
- 提升表单交互反馈质量。

## 技术方案

### CSS

用于：

- Hero 首屏 keyframes
- reveal 初始态 / 可见态
- FAQ 展开过渡
- 表单提交按钮状态

### 原生 JavaScript

用于：

- `IntersectionObserver` 驱动滚动进入动画
- stats count-up
- 表单提交中状态与 Basin 提示联动

### 不采用的方案

- 不引入 GSAP、Framer Motion 等重型动画库
- 不做复杂 3D 动画
- 不做持续运动背景
- 不做大幅滚动视差

## 组件影响范围

- `src/layouts/Layout.astro`
- `src/pages/index.astro`
- `src/components/home/HeroSection.astro`
- `src/components/home/StatsBand.astro`
- `src/components/home/ProductsSection.astro`
- `src/components/home/ApplicationsSection.astro`
- `src/components/home/CaseStudiesSection.astro`
- `src/components/home/RfqSection.astro`
- `src/styles/home.css`

## 验收标准

- 首屏打开时可见 Hero 分段进场。
- Stats 区块滚动到可视范围后数字滚动。
- 产品、应用、案例、询盘区块滚动进入时有轻微 reveal 效果。
- FAQ 展开和收起具有过渡效果。
- 表单提交时按钮进入 `Sending...` 状态，成功或失败后恢复。
- 在 `prefers-reduced-motion` 环境下页面仍可正常使用且不强制播放动画。

## 后续可扩展动画

- Header 滚动状态增强
- 产品卡 hover 图片轻微放大
- 案例卡指标延迟出现
- 页面分区 heading 更精细的节奏控制
- 表单成功状态的更强视觉反馈
