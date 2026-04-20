# 询盘系统邮件方案整理

日期：2026-04-14

## 背景

当前项目有两个部分：

- `web`：前台站点，包含询盘表单
- `worker/solara`：Cloudflare Worker，可作为询盘接口后端

目标是实现这样一条链路：

1. 用户在网站填写询盘表单
2. 后端接收并校验数据
3. 销售团队收到邮件通知

## 今天讨论过的方案

### 方案 1：Cloudflare Worker + Cloudflare Email Routing

做法：

- 前端把询盘提交到 `POST /api/inquiries`
- Worker 校验字段、处理 CORS、拦截明显垃圾数据
- Worker 通过 Cloudflare `send_email` binding 直接发邮件给销售

当前项目已经实现过这一版思路。

相关配置：

- `SALES_EMAIL_FROM`
- `SALES_EMAIL_TO`
- `send_email` binding，例如 `SALES_EMAIL`

优点：

- 架构比较干净，整体都在 Cloudflare 内
- 不需要额外接第三方邮件 API
- 适合已经使用 Cloudflare 域名和 Email Routing 的项目

限制：

- 发件与收件规则受 Cloudflare Email Routing 约束
- 收件地址需要在 Cloudflare 中验证
- 发件地址通常要求使用你自己的域名地址

适合场景：

- 你希望继续把能力尽量收敛在 Cloudflare
- 询盘量不大到中等
- 目前主要诉求是“有人提交就发邮件通知销售”

### 方案 2：Cloudflare Worker + Resend

做法：

- 前端仍然提交到 Worker
- Worker 负责表单校验、反垃圾、隐藏密钥
- Worker 再调用 Resend API 发邮件给销售

说明：

- 即使用 Resend，通常也仍然需要 Worker 或其他服务端入口
- 不建议让前端直接调用 Resend，因为 API Key 不能暴露给浏览器

优点：

- 比 Cloudflare Email Routing 更灵活
- 邮件服务专业度更高，模板和后续扩展空间更好
- 依然保留 Worker 的校验、限流、日志、后续写库能力

限制：

- 需要额外维护第三方邮件服务账号和 API Key
- 链路上多一个外部服务

适合场景：

- 想保留 Worker 作为后端
- 想获得更灵活的邮件投递能力
- 后续可能接模板邮件、抄送、标签、自动化工作流

### 方案 3：Cloudflare Worker + Webhook

做法：

- Worker 接收询盘后，不直接发邮件
- Worker 将数据转发到一个 webhook 地址
- webhook 后面的系统负责发邮件或继续处理

可接的目标：

- `n8n`
- `Make`
- `Zapier`
- 自有后端
- 临时测试服务，例如 `webhook.site`

优点：

- 接口清晰，方便和其他系统集成
- 适合先跑通流程、后续再替换具体邮件服务

限制：

- 实际发信能力依赖 webhook 后面的系统
- 链路更长，排查问题时要看多处状态

适合场景：

- 你已经有自动化平台或 CRM 流程
- 希望一个询盘同时触发多种动作，而不只是发邮件

### 方案 4：Worker + D1/数据库 + 异步发信

做法：

- Worker 先把询盘写入数据库，例如 D1
- 后续由异步任务、队列、定时任务或后台服务发邮件

说明：

- D1 是 Cloudflare 的托管型 Serverless SQL 数据库，本质上是 Cloudflare 管理的 SQLite

优点：

- 不容易丢单，邮件服务短暂失败时也能补发
- 可以做后台管理、状态跟踪、筛选、导出
- 更适合正式业务系统

限制：

- 实现复杂度更高
- 不是“最快上线”的路径

适合场景：

- 询盘对业务很重要，不能只依赖一次发信成功
- 后续要做跟进状态、分配销售、统计报表

### 方案 5：Basin / Formspree 这类托管表单后端

做法：

- 前端表单直接提交到它们提供的 endpoint
- 它们负责表单存储、通知邮件、反垃圾和部分自动化

#### Basin

定位：

- 偏“表单后端服务”
- 强调无代码接入、通知邮件、自动回复、反垃圾

特点：

- 可以直接处理 HTML 表单提交
- 支持通知邮件、自动回复、webhook、文件上传、API
- 支持多种反垃圾手段

适合：

- 想尽快上线，不想维护自己的后端发信逻辑
- 询盘流程比较标准

#### Formspree

定位：

- 通用托管表单 SaaS
- 提供表单接收、邮件通知、垃圾过滤、webhook、集成能力

特点：

- 接入方式成熟
- 插件和工作流能力较丰富
- 适合快速接 Slack、Google Sheets、CRM 等外部系统

适合：

- 想快速上线
- 希望减少自研后端工作
- 需要较多现成集成

优点：

- 上线快
- 不用自己维护发信逻辑
- 对非技术运营更友好

限制：

- 可控性低于自有 Worker 后端
- 数据流和业务逻辑更依赖第三方平台
- 定制复杂流程时可能受限于平台能力和套餐

## 几种方案的核心区别

### 是否需要自己维护后端

- `Basin / Formspree`：基本不需要
- `Worker + Resend`：需要
- `Worker + Cloudflare Email Routing`：需要
- `Worker + D1 + 异步发信`：需要，而且复杂度最高

### 是否保留自己的接口控制权

- `Basin / Formspree`：较弱
- `Worker` 相关方案：较强

### 是否适合快速上线

- 最快：`Basin / Formspree`
- 次快：`Worker + Resend`
- 再次：`Worker + Cloudflare Email Routing`
- 最重：`Worker + D1 + 异步发信`

### 是否适合后续做正式询盘系统

- 最适合长期扩展：`Worker + D1 + Resend`
- 也比较适合：`Worker + Resend`
- 只做通知也可：`Worker + Cloudflare Email Routing`
- 更适合快速验证：`Basin / Formspree`

## 对当前项目的建议

如果目标是尽快让网站询盘能稳定通知销售，建议按下面优先级考虑：

### 方案 A：Worker + Resend

这是当前最平衡的方案。

原因：

- 仍然保留你自己的 `/api/inquiries`
- 前端不需要暴露密钥
- 后续加限流、反垃圾、写库都方便
- 邮件能力通常比 Cloudflare Email Routing 更灵活

适合当前阶段：

- 想自己掌控接口
- 仍希望实现成本不要太重

### 方案 B：Basin / Formspree

这是当前最快上线的方案。

原因：

- 几乎不需要自己维护邮件后端
- 很适合先把询盘跑起来，再决定是否回归自建接口

适合当前阶段：

- 首要目标是速度
- 业务仍在验证阶段

### 方案 C：Worker + D1 + Resend

这是更正式的长期方案。

原因：

- 不只发邮件，也能真正保存询盘
- 后续做销售跟进、状态管理、报表会更顺

适合当前阶段：

- 询盘已经是核心业务
- 不能接受只发邮件、不存记录

## 当前配置变量的语义

在 Cloudflare Email Routing 方案中：

- `SALES_EMAIL_FROM`：发件地址，通常写 `no-reply@你的域名`
- `SALES_EMAIL_TO`：销售真正收件的地址，必须是已验证可接收的地址

如果改为 Resend 方案，通常会变成：

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `SALES_EMAIL_TO`

## 推荐决策

如果现在要做决策，可以直接按下面方式定：

- 想最快上线：选 `Basin` 或 `Formspree`
- 想保留自己的后端控制权：选 `Worker + Resend`
- 想一步到位做正式询盘系统：选 `Worker + D1 + Resend`

## 后续可执行动作

1. 保持现有 Worker 架构，改成 Resend 发信
2. 直接把前端表单从 `mailto:` 改成调用 `/api/inquiries`
3. 如果要保留正式记录，再补 D1 存储

