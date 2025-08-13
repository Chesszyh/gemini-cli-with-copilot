# 内存工具 (`save_memory`)

本文档描述了 Gemini CLI 的 `save_memory` 工具。

## 描述

使用 `save_memory` 在您的 Gemini CLI 会话中保存和调用信息。通过 `save_memory`，您可以指示 CLI 记住跨会话的关键细节，提供个性化和有针对性的帮助。

### 参数

`save_memory` 接受一个参数：

- `fact` (字符串，必需)：要记住的特定事实或信息。这应该是一个清晰、自包含的自然语言语句。

## 如何在 Gemini CLI 中使用 `save_memory`

该工具将提供的 `fact` 附加到位于用户主目录 (`~/.gemini/GEMINI.md`) 中的特殊 `GEMINI.md` 文件。此文件可以配置为具有不同的名称。

添加后，事实将存储在 `## Gemini Added Memories` 部分下。此文件在后续会话中作为上下文加载，允许 CLI 调用保存的信息。

用法：

```
save_memory(fact="您的事实在此。")
```

### `save_memory` 示例

记住用户偏好：

```
save_memory(fact="我首选的编程语言是 Python。")
```

存储项目特定详细信息：

```
save_memory(fact="我目前正在处理的项目名为 'gemini-cli'。")
```

## 重要注意事项

- **一般用法：** 此工具应用于简洁、重要的事实。它不适用于存储大量数据或对话历史记录。
- **内存文件：** 内存文件是纯文本 Markdown 文件，因此您可以根据需要手动查看和编辑它。
