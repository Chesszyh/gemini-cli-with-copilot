# brat-shell todo

> 预期：在[Gemini CLI](https://github.com/google-gemini/gemini-cli)基础上，结合专业终端AI Agent(`Claude code`, `Gemini CLI`)、与AI集成更紧密的终端模拟器(`Warp`)的特性，再增强一些个性。

## 理念

1. 处理流程全透明，包括任何工具调用、连接建立、思维链等。可选的输出粒度：参考python logging等
2. 多模态输入支持（以文本和语音为主）

## 功能

- [ ] 终端Markdown解析器，参考Gemini实现
- [ ] 终端对话branch拆分
- [ ] Input: Prompt / Slash command / **Shell command** 区分。目前Gemini不支持自动识别，也不支持Shell command
- [ ] 会话连接稳定性：GEMINI CLI多次锁屏重启、长时间无对话依然能保持连接，且不丢失内容
- [ ] Deepseek CLI! Qwen code就是直接继承了gemini的代码，并做了优化。

## Features

### 复现

Gemini:

- [ ] `/save`: Save the current conversation to a md file.
- [ ] `/ckpt`: Git support
    - `add`: Add a new checkpoint
    - `list`
    - `reload <ckpt-id>`
- [ ] `/clear`: clear the screen and conversation history
- [ ] `/compress`: Compresses the context by replacing it with a summary.
- [ ] `/copy`: Copy the last result or code snippet to clipboard
- [ ] `/extensions`: list active extensions
- [ ] `/tools`: Available System tools(addable with user tools)
- [ ] `/mcp`

Warp:

- [ ] Auto expand `alias`

## 增强

- [ ] 允许命令取消后，由用户补充信息或者执行命令，再由AI接管,而不是现在直接中断本次对话（AI经常生成不够理想的命令）
- [ ] `/branch`: 可以对对话历史进行分支，日后可以恢复到分支点再新开一条分支继续对话，比较适合项目功能探索
  - 可以先学习一下git branch相关使用
  - 这个功能好像没有产品在做，联想一下5d chess
- [ ] `/memory`: 学习ChatGPT的记忆功能管理，允许读取、建立本地个人知识库索引

# Copilot-RE

可提供无限GPT4.1, GPT-5-mini额度，但需要避免滥用。

## /models

参考`Modeldata`. 其中的`capabilities`字段：

```json
{ "family": "gpt-5", "limits": { "max_context_window_tokens": 128000, "max_output_tokens": 64000, "max_prompt_tokens": 128000, "vision": { "max_prompt_image_size": 3145728, "max_prompt_images": 1, "supported_media_types": [ "image/jpeg", "image/png", "image/webp", "image/gif" ] } }, "object": "model_capabilities", "supports": { "parallel_tool_calls": true, "streaming": true, "structured_outputs": true, "tool_calls": true, "vision": true }, "tokenizer": "o200k_base", "type": "chat" }
```


