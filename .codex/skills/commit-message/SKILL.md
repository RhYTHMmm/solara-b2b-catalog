---
name: commit-message
description: Generate concise, accurate commit messages from git changes. Use when the user asks for a commit message, 提交信息, commit msg, Conventional Commit, or wants help summarizing staged or unstaged project changes for a git commit.
---

# Commit Message

## Overview

使用此技能基于当前 git 变更生成提交信息。默认输出中文说明和英文 commit message；如果用户指定语言或格式，优先使用用户要求。

## Workflow

1. 收集上下文：读取 `git status --short`，判断是否有 staged 变更。
2. 选择 diff：
   - 如果存在 staged 变更，优先使用 `git diff --cached --stat` 和 `git diff --cached`。
   - 如果没有 staged 变更，使用 `git diff --stat` 和 `git diff`。
   - 如果有新增未跟踪文件，读取相关文件摘要或内容，避免漏掉新文件。
3. 检查历史风格：必要时读取 `git log -5 --oneline`，沿用项目已有提交风格。
4. 归纳变更：识别主要意图、影响范围和是否存在多个不相关改动。
5. 生成提交信息：优先使用 Conventional Commits 格式。
6. 不执行 `git commit`，除非用户明确要求提交。

## Format

默认生成一条推荐提交信息：

```text
type(scope): concise summary
```

需要正文时使用：

```text
type(scope): concise summary

- Explain important behavior or data changes
- Mention validation or migration notes when relevant
```

常用 `type`：

- `feat`：新增用户可见功能
- `fix`：修复缺陷
- `docs`：文档变更
- `style`：仅格式、样式或不影响逻辑的展示调整
- `refactor`：重构，不改变外部行为
- `test`：测试相关
- `chore`：维护性工作
- `build`：构建、依赖或包管理变更
- `ci`：CI/CD 配置变更
- `perf`：性能优化

`scope` 使用小写短词，优先来自目录或模块，例如 `home`、`docs`、`sanity`、`styles`。无法明确时省略 scope。

## Output Rules

- 优先给出一条最推荐的 commit message。
- 如果变更明显分属多个独立主题，给出拆分提交建议，每条对应一个 message。
- 摘要使用祈使句或名词化短语，保持简洁，不超过约 72 个字符。
- 不夸大变更，不写未验证的测试结果。
- 如果 diff 不足以判断意图，明确说明不确定点，并给出保守版本。
- 用户只要求“生成 commit message”时，不要额外生成长篇解释。

## Evidence Hints

可参考这些命令和文件：

```bash
git status --short
git diff --cached --stat
git diff --cached
git diff --stat
git diff
git log -5 --oneline
```

如果项目有协作规范，先阅读：

- `doc/AGENTS.md`
- `README.md`
