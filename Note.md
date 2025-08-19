# GEMINI CLI

## Structure

### cli

- `nonInteractiveCli.ts`: 所有非交互式命令（例如 gemini "我的问题"）的起点

#### config

- **settings.ts**: 优先级
  1. Command-line arguments
  2. Environment variables
  3. System settings
  4. Workspace settings
  5. User settings
  6. Built-in defaults
- **settingsSchema.ts**: 配置蓝图，定义所有可用设置的结构、类型和元数据
  - 从 `SETTINGS_SCHEMA` 自动生成 `Settings` 类型，修改前者会自动更新后者、
  - `SETTINGS_SCHEMA`
    - `SettingDefinition`
      - `type`: 设置项的数据类型（如 boolean, string, number, array, object）。
      - `label`: 设置项在界面上的显示名称。
      - `category`: 设置项所属的分类（如 UI, General）。
      - `requiresRestart`: 修改该设置后是否需要重启应用。
      - `default`: 设置项的默认值。
      - `description`: 设置项的描述信息。
      - `parentKey`/`childKey`/`key`: 用于嵌套结构的键名（可选）。
      - `properties`: 如果是对象类型，定义其子属性（可选）。
      - `showInDialog`: 是否在设置对话框中显示（可选）。
    - `category`: 设置项的具体分类。
      - UI
        - `theme`
        - `customThemes`
        - `hideWindowTitle`
        - `hideTips`
        - `hideBanner`
        - `showMemoryUsage`
        - (以下为添加特性)
        - `hideStatusSideBar`: 是否隐藏状态侧栏（AI Personality）
      - General
        - `usageStatisticsEnabled`
        - `autoConfigureMaxOldSpaceSize`
        - `preferredEditor`
        - `maxSessionTurns`
        - `memoryImportFormat`
        - `memoryDiscoveryMaxDirs`
        - `contextFileName`
        - `vimMode`
        - `ideMode`
        - `includeDirectories`
        - `loadMemoryFromIncludeDirectories`
        - `model`
        - `hasSeenIdeIntegrationNudge`
        - `folderTrustFeature`
        - `folderTrust`
        - `chatCompression`
        - `showLineNumbers`
      - Mode(TODO: Difference? Feature?)
        - `vimMode`
        - `ideMode`
      - Accessibility
        - `accessibility`
      - Checkpointing
        - `checkpointing`
      - File Filtering
        - `fileFiltering`
      - Updates
        - `disableAutoUpdate`
        - `disableUpdateNag`
      - Advanced
        - `selectedAuthType`
        - `useExternalAuth`
        - `sandbox`
        - `coreTools`
        - `excludeTools`
        - `toolDiscoveryCommand`
        - `toolCallCommand`
        - `mcpServerCommand`
        - `mcpServers`
        - `allowMCPServers`
        - `excludeMCPServers`
        - `telemetry`
        - `bugCommand`
        - `summarizeToolOutput`
        - `dnsResolutionOrder`
        - `excludedProjectEnvVars`
        - (以下为添加特性)
        - `autoComplete`:
          - 自动提供命令补全，使用tab接受，同时使用zsh的自动建议（优先级低）
          - 无补全建议提供时，按tab可以截获zsh下自动补全的脚本，或者自定义常用命令的tab下拉菜单补全，比如warp支持的`conda`
        - `highlighting`:
          - [zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting)
- **keyBindings.ts**: 快捷键定义
  - 运行时readonly,修改必须重启生效
  - TODO 可继续添加自定义快捷键

#### ui

- hooks
  - **atCommandProcessor.ts**：添加文件夹作为工作区
  - **useGeminiStream.ts**: 管理与 Google Gemini API的整个交互生命周期，包括发送用户查询、处理流式响应、调用工具（函数）、管理状态以及处理各种边缘情况（如取消、错误、命令等），**并且这些复杂逻辑与UI渲染完全分离**。
    - **状态机**：（空闲 -> 响应中 -> 等待工具确认 -> 响应中 -> 空闲）
    - `prepareQueryForGemini`:
      - 没有加载用户的`~/.zshrc`，无法识别我自定义的命令`sdi`等
      - 优先级：
        - `/`：根据`handleSlashCommand`返回结果：
          - `schedule_tool`：shouldProceed = false，直接执行客户端工具
          - `submit_prompt`：shouldProceed = true
          - `handled`
        - **Shell模式**：执行命令
          - **ADD**: 当前GEMINI CLI不支持**自动识别Command/Prompt**，以及语法高亮，但是warp和zsh都可以
            - 可以考虑正则表达式启发式规则+LLM意图分类
            - [zsh-highlight](https://github.com/zsh-users/zsh-syntax-highlighting)
        - `@`：添加文件，读取文件内容
        - 普通消息
    - `submitQuery`: 可中断的、支持多轮和续写的对话提交逻辑
- components
  - AsciiArt.ts: GEMINI logo
  - **text-buffer.ts**: 终端文本编辑引擎的后端逻辑
    - 逻辑太过复杂，用到再改
    - `!`
      - 进入`textBufferReducer`的'insert'情况，
  - **InputPrompt.tsx**: 输入React组件
    - NOTE 调试到这里之后，会进入一个js文件，循环多次才会逐渐渲染出cli窗口。窗口是一次flush out显示出来的。显示出来之后，就会进入`text-buffer.js`
    - 用户输入和应用逻辑之间的“控制器”。接收一个 `TextBuffer` 实例（参考`components/text-buffer.ts`）作为 prop，并监听用户的键盘事件，决定执行快捷键命令还是将按键输入传递给文本编辑组件
    - `handleInput`的返回值，是一个渲染好的Input React 组件，包括：
      - 前缀状态符号：`>`, `!`, or `(r:)`
      - 多行渲染、光标高亮及行尾特判
      - `SuggestionsDisplay` list: completion and reverseSearchActive
- context
  - **KeypressContext.tsx**: 快捷键输入
    - `parseKittySequence`: 对kitty协议终端的支持
    - `handleRawKeypress`: 对粘贴模式的识别和事件分发
    - `handleKeypress`
- utils
  - ConsolePatcher.ts: 在运行时拦截和处理控制台输出。常见场景包括日志收集、调试信息过滤、或将日志转发到自定义处理器。
  - kittyProtocolDetector.ts: 通过`detectAndEnableKittyProtocol`检测和启用Kitty协议支持。
    - [kitty](https://sw.kovidgoyal.net/kitty/keyboard-protocol/)
### core

#### core

- **turn.ts**:
  - Thought Processing and AI Reasoning: `202-222`
    - 识别Thought模式，创建总结，UI展示总结
- **client.ts**: 与 Google Gemini API 进行所有交互的**核心控制器**
  - **FIX**: `isThinkingSupported`:`if (model.startsWith('gemini-2.5')) return true;`修改来支持其他模型
  - TODO 看一下对话历史，学习
- **contentGenerator.ts**：

#### ide

- **ide-client.ts**

## Shell Mode

## Note

### Language

- `Buffer`: 处理二进制数据，`Buffer.alloc(0)`：分配一个空的二进制数据容器
  - 可用于命令行剪切板处理
- `??`: [Nullish Coalescing Operator](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)（空值合并运算符）。它的作用是：如果左侧的值是 null 或 undefined，就返回右侧的值，否则返回左侧的值。左结合。
- `Promise`: 异步操作，返回后要用 await 或 .then() 处理。表示未来可能完成或失败的操作及其结果。

### Design

- `packages/cli/src/config/config.ts` Line 346 `Hack`:

`loadHierarchicalGeminiMemory` 需要知道 `contextFileName`（配置项之一）, 但这个函数在 `createServerConfig`(配置被创建) 之前调用. 而正常情况下，配置应该先创建，然后传递给需要的函数。

所以，代码选择直接调用memory tool `setGeminiMdFilename`，设置全局状态。

## Debugging

- 输入框初始化结束后，需要取消InputPrompt.tsx 235:23断点，否则表现来看就是无限循环
- **ISSUE 调试点丢失**：如何调试/忽略React？

> 你有哪些可用工具？调用并返回结果，我现在正在逐行debug你的代码，也就是当前工作区下的代码，我想看你工具调用的过程。

