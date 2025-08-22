# GEMINI CLI

## Wiki

- [Debug](https://deepwiki.com/search/-typescript_7a15f446-4e75-4ef4-85eb-ac53effeccdb)
- [Auto-complete](https://deepwiki.com/search/_6012deae-b0f5-49df-bb2e-30fa9bf8ce96)

## Structure

### cli

- `nonInteractiveCli.ts`: 所有非交互式命令（例如 gemini "我的问题"）的起点

#### config

- **config.ts**: 可以考虑精简CliArgs入口，因为`warp-terminal`也没有提供任何命令行参数功能
  - 但是目前是直接在gemini cli基础上改，并且也要及时合并上游快速开发分支的更改，所以还是保留现有结构和参数！
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
- themes
  - **配色**：颜色叠加，不是简单的设置绝对颜色，而是叠加代码内hard-code color(比如`/help`的`AccentPurple`)+theme color(比如theme-github light)，得到一个最终颜色。
  - color-utils.ts：颜色格式检查，css颜色解析；TODO 亮度调整
  - no-color.ts：无色主题，排除颜色干扰
  - cute.ts：自定义主题
  - semantic-tokens.ts
  - theme-manager.ts：管理所有主题，根据用户配置加载并返回特定的主题对象
  - theme.ts：核心文件，定义了所有主题都必须遵守的 TypeScript 接口
    - type: 'light' | 'dark' | 'ansi' | 'custom' - 主题的类型，决定了其底色（亮色、暗色或终端原生）。
    - Background: CLI界面的主要背景色。
    - Foreground: 默认的前景色，也就是最主要的文本颜色。
    - LightBlue: 用于代码中的属性（attribute）等。
    - AccentBlue: 关键元素的强调色，如代码中的关键字、链接、选中的UI边框等。
    - AccentPurple: 另一种强调色，通常用于代码中的变量。
    - AccentCyan: 用于代码中的类型（type）、内置函数等。
    - AccentGreen: 用于表示“成功”状态，以及代码中的数字、类名。
    - AccentYellow: 用于表示“警告”状态，以及代码中的字符串。
    - AccentRed: 用于表示“错误”状态，以及代码中的正则表达式。
    - DiffAdded: 在比较文件差异（diff）时，新增行的背景色。
    - DiffRemoved: 在比较文件差异时，删除行的背景色。
    - Comment: 代码注释的颜色。
    - Gray: 次要信息的颜色，例如辅助文本、元数据等。
    - GradientColors: 一个颜色数组，用于创建渐变效果(可能是`GEMINI` Logo)。

### core

#### core

- **turn.ts**:
  - Thought Processing and AI Reasoning: `202-222`
    - 识别Thought模式，创建总结，UI展示总结
- **client.ts**: 与 Google Gemini API 进行所有交互的**核心控制器**
  - **FIX**: `isThinkingSupported`:`if (model.startsWith('gemini-2.5')) return true;`修改来支持其他模型
  - TODO 看一下对话历史，学习
- **contentGenerator.ts**：
- **coreToolScheduler.ts**: 

#### ide

- **ide-client.ts**

#### telemetry

- clearcut-logger.ts: 

<details>
  <summary>遥测数据 (Telemetry Data)</summary>

这个 TypeScript 文件定义了 `ClearcutLogger` 类，它是一个复杂的单例（singleton）模块，负责从一个命令行应用中收集和传输遥测及使用数据。其主要目的是批量处理各种应用事件——例如会话启动、用户提示、API 调用和错误——并周期性地将它们发送到 `CLEARCUT_URL` 指定的远程日志服务。整个日志机制是条件性的；它仅在用户启用了使用情况统计时才激活（通过 `config.getUsageStatisticsEnabled()` 检查），从而确保用户隐私得到尊重。

该日志记录器的核心设计围绕着高效的事件处理。它不为每个事件都发送一个网络请求，而是使用一个 `FixedDeque`（一个具有固定容量的双端队列）在内存中缓冲事件。这个队列的容量上限为 `MAX_EVENTS`，以防止内存无限制增长；如果队列已满，最旧的事件将被丢弃以便为新事件腾出空间。事件在两种主要情况下会被“刷送”（flush）到服务器：一是周期性地，当 `flushIfNeeded` 方法确定自上次成功传输以来已经过了一个设定的时间间隔（`FLUSH_INTERVAL_MS`）；二是在处理关键的生命周期事件时，如会话的开始和结束，会立即刷送。

该类健壮地处理了异步操作和潜在的失败。`flushToClearcut` 方法管理网络请求，并使用 `flushing` 和 `pendingFlush` 这两个布尔标志来防止并发的刷送操作，确保同一时间只有一个网络请求处于活动状态。如果刷送因网络错误或不成功的 HTTP 响应而失败，`requeueFailedEvents` 方法会被调用。此函数会智能地将有限数量的、最近失败的事件重新排入队列的前部，使它们在下一次重试中获得优先处理。这使得日志记录器能够应对暂时的网络问题，而不会因大量失败事件的积压而陷入困境。

每个日志事件都是一个富含宝贵元数据的结构化对象。该类为不同类型的事件提供了特定的方法，如 `logNewPromptEvent` 和 `logToolCallEvent`。这些方法最终使用 `createLogEvent` 和 `addDefaultFields` 来构建最终的载荷（payload）。`addDefaultFields` 这个辅助函数尤其重要，因为它会自动为每个事件附加一致的上下文信息，包括会话 ID、应用版本、Git 提交哈希以及“surface”（使用场景）。“surface”由 `determineSurface` 函数确定，该函数通过检查环境变量来识别 CLI 的运行环境（例如，在 VSCode 中、GitHub Action 中，还是在标准终端中），从而提供关于用户环境的宝贵洞察。
</details>

#### utils

- **nextSpeakerChecker.ts**: 检查下一个发言者

<details>
  <summary>`checkNextSpeaker`</summary>

`checkNextSpeaker` 函数的执行逻辑可以分为两个主要阶段：**快捷规则检查（Heuristics）** 和 **LLM 调用检查（LLM-based Check）**。

1.  **快捷规则检查 (Heuristics / Shortcuts)**

    在进行昂贵的 LLM API 调用之前，代码首先会检查一些明确的、可以快速判断的情况。这是一种优化策略。

    *   **检查函数响应 (`isFunctionResponse`)**: 如果对话历史中的最后一条消息是 `user` 角色的，并且其内容**完全**由工具（函数）的返回结果构成，那么模型**必须**是下一个发言者。因为模型需要处理这个工具的输出并决定下一步做什么。这是一个硬性规则。
    *   **检查空模型响应**: 如果模型上一轮的回答是空的（`parts.length === 0`），这通常意味着它只是一个占位的、无实质内容的回复。用户对此无从反应，所以理应由模型继续发言。
    *   **检查历史记录**: 如果没有历史记录，或者最后一条消息不是来自模型，那么就无法判断，直接返回 `null`。

2.  **LLM 调用检查 (LLM-based Check)**

    如果上述快捷规则都不适用，那么就需要借助另一个 LLM 的“智慧”来做判断。

    *   **构建提示 (`CHECK_PROMPT`)**: 这是最核心的部分。代码将当前的对话历史和一段特殊的指令（`CHECK_PROMPT`）拼接在一起。这个指令要求一个新的、轻量级的 LLM（`gemini-flash`）扮演一个“裁判”的角色，**仅仅**分析它自己（模型）的上一轮回答，并根据一套严格的决策规则来判断谁该接话。
    *   **决策规则**:
        1.  **模型继续**: 如果模型明确表示它马上要做某事（比如调用工具），或者它的回答明显没说完（被截断了）。
        2.  **用户接话 (因提问)**: 如果模型以一个直接向用户提出的问题结束。
        3.  **用户接话 (默认情况)**: 如果模型完成了它的陈述或任务，并且不符合前两条规则，那么它就在等待用户的输入。
    *   **强制 JSON 输出**: 通过向 `generateJson` API 提供一个 `RESPONSE_SCHEMA`，强制 LLM 返回一个特定格式的 JSON 对象：`{ reasoning: "...", next_speaker: "user" | "model" }`。这极大地提高了输出的可靠性和可解析性。
    *   **返回结果**: 解析 LLM 返回的 JSON，并将其作为最终的判断结果。

</details>

- **environmentContext.ts**：环境上下文管理，初始化和运行时均需要



