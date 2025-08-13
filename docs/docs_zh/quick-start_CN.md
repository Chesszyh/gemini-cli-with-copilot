# Quick-start

## Setting Files

- Setting: ~/.gemini/settings.json

## Issues

1. 翻译：强调“完整准确”翻译后，仍然进行概括翻译，即翻译后的文档丢失内容，需要二次检查！

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