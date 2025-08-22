# Note

## Language

- `Buffer`: 处理二进制数据，`Buffer.alloc(0)`：分配一个空的二进制数据容器
  - 可用于命令行剪切板处理
- `??`: [Nullish Coalescing Operator](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)（空值合并运算符）。它的作用是：如果左侧的值是 null 或 undefined，就返回右侧的值，否则返回左侧的值。左结合。
- `Promise`: 异步操作，返回后要用 await 或 .then() 处理。表示未来可能完成或失败的操作及其结果。

## Design

### `packages/cli/src/config/config.ts` Line 346 `Hack`

`loadHierarchicalGeminiMemory` 需要知道 `contextFileName`（配置项之一）, 但这个函数在 `createServerConfig`(配置被创建) 之前调用. 而正常情况下，配置应该先创建，然后传递给需要的函数。

所以，代码选择直接调用memory tool `setGeminiMdFilename`，设置全局状态。

### System Prompt

- 原始设计：`packages/core/src/core/prompts.ts`

不考虑改动`basePrompt`，以防止后续merge时候麻烦，或者影响gemini cli agent的性能。直接在下面添加情况。

#### `getCoreSystemPrompt`的接口改动

软件工程原则：**依赖明确化 (Explicit Dependencies)**。

- 方案一：在定义文件导入全局配置（不推荐）。
  - 隐藏依赖问题：任何调用`getCoreSystemPrompt`的地方，都无法从函数签名`getCoreSystemPrompt(userMemory)`中看出它的输出结果还会受到全局配置的影响。
  - 可测试性差：函数被死死地绑定在全局状态上，单元测试时必须模拟（mock）整个全局配置模块，容易出错。
- 方案二：添加 `mode` 作为 API 接口参数（推荐）
  - 显式依赖：通过将 `mode` 作为参数传递，调用者可以清楚地看到状态对函数输出的影响。
  - 可测试性好：函数不再依赖于全局状态，单元测试时可以更容易地控制和验证不同的输入场景。

## Debugging

- 输入框初始化结束后，需要取消InputPrompt.tsx 235:23断点，否则表现来看就是无限循环
- **ISSUE 调试点丢失**：如何调试/忽略React？

> 你有哪些可用工具？调用并返回结果，我现在正在逐行debug你的代码，也就是当前工作区下的代码，我想看你工具调用的过程。