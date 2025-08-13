# Web Fetch 工具 (`web_fetch`)

本文档描述了 Gemini CLI 的 `web_fetch` 工具。

## 描述

使用 `web_fetch` 总结、比较或从网页中提取信息。`web_fetch` 工具处理提示中嵌入的一个或多个 URL（最多 20 个）的内容。`web_fetch` 接受自然语言提示并返回生成的响应。

### 参数

`web_fetch` 接受一个参数：

- `prompt` (字符串，必需)：一个全面的提示，包含要获取的 URL（最多 20 个）以及如何处理其内容的具体说明。例如：“总结 https://example.com/article 并从 https://another.com/data 中提取关键点”。提示必须包含至少一个以 `http://` 或 `https://` 开头的 URL。

## 如何在 Gemini CLI 中使用 `web_fetch`

要在 Gemini CLI 中使用 `web_fetch`，请提供包含 URL 的自然语言提示。该工具将在获取任何 URL 之前请求确认。确认后，该工具将通过 Gemini API 的 `urlContext` 处理 URL。

如果 Gemini API 无法访问该 URL，该工具将回退到直接从本地机器获取内容。该工具将格式化响应，包括来源归属和可能的引用。然后，该工具将向用户提供响应。

用法：

```
web_fetch(prompt="您的提示，包括一个 URL，例如 https://google.com。")
```

## `web_fetch` 示例

总结一篇文章：

```
web_fetch(prompt="您能总结一下 https://example.com/news/latest 的主要观点吗？")
```

比较两篇文章：

```
web_fetch(prompt="这两篇论文的结论有什么不同：https://arxiv.org/abs/2401.0001 和 https://arxiv.org/abs/2401.0002？")
```

## 重要注意事项

- **URL 处理：** `web_fetch` 依赖于 Gemini API 访问和处理给定 URL 的能力。
- **输出质量：** 输出质量将取决于提示中说明的清晰度。
