# Quick-start

## Setting Files

- Setting: ~/.gemini/settings.json

### GEMINI.md

## Issues

1. 翻译：强调“完整准确”翻译后，仍然进行概括翻译，即翻译后的文档丢失内容。
   1. 建议：
      1. 翻译任务需要二次检查比对
      2. 减少上下文，直接切换到docs/目录再启动gemini
      3. 在prompt首尾均强调完整性

## Other Issues in current IDE/CLI Agent

### Gemini

1. 一旦取消命令后，本次对话即会中断。**预期**：能够临时**暂停**对话，允许用户进行TOKEN配置/密码输入/命令执行/工作区结构调整等（并可选地监控用户命令行操作，不监控密码输入等，以便后续上下文衔接），用户调整结束后Agent检测命令行和工作区修改，恢复对话。
2. 切换模型后，本次对话也会中断，必须重新发送一条prompt.不一定能恢复到上次对话的上下文。
3.

## CLI

## Core

### File: `gemini-cli/packages/core/src/tools/shell.ts`

该文件主要处理Agent执行命令行命令的逻辑，包括工具分析（根据描述）、合法性检查、权限控制、执行、状态返回、输出总结等。

```typescript
// line78
directory: {
type: Type.STRING,
description:
    '(OPTIONAL) Directory to run the command in, if not the project root directory. Must be relative to the project root directory and must already exist.',
},
```

NOTE 这里是否存在目录遍历攻击的可能？比如`../../`遍历到当前工作区以外的目录？

可以在docker里运行gemini,尝试进行docker逃逸.

但前提可能还是要先Jailbreak Gemini Model.

```ts
// line 127
if (path.isAbsolute(params.directory)) {
  return 'Directory cannot be absolute. Please refer to workspace directories by their name.';
}
```

注意到代码对绝对路径做了检查（不允许使用）。

## Tools

一次工具执行，至少要两次API请求：

1. 发送请求，API决定是否调用工具
2. 本地调用工具结果返回给API, API再将最终结果返回给用户

## Checkpoint

`/restore`功能，通过在`~/.gemini/history/<project_hash>`下创建独立的git仓库，记录工具调用时的仓库状态，与工作目录仓库不冲突。

默认不启用，可通过`gemini --checkpoint`启用，或者编辑配置文件`~/.gemini/settings.json`，加入：

```json
{
  "checkpointing": {
    "enabled": true
  }
}
```

以默认启用。

