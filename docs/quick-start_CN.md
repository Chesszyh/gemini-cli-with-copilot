# Quick-start

## Setting Files

- Setting: ~/.gemini/settings.json

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

## 