# Gemini CLI UI 架构

本文档详细介绍了 Gemini CLI 用户界面的架构与实现方法。

## 核心技术

* **React**：UI 基于 React 库构建，利用其组件化架构和 Hooks 编程范式。
* **Ink**：Ink 是一个用于命令行应用的自定义 React 渲染器，它允许我们使用 React 组件构建丰富、交互式的终端界面。
* **TypeScript**：整个代码库使用 TypeScript 编写，保证了类型安全，并提升了代码质量与可维护性。

## 核心架构原则

* **组件驱动**：UI 由小型、可复用且相互独立的组件组成，每个组件负责界面的一部分功能。
* **集中状态管理**：全局与会话范围的状态通过 React 的 Context API 管理，这为跨组件共享数据提供了简洁高效的方式。
* **通过 Hooks 封装逻辑**：所有业务逻辑、副作用及有状态行为都封装在自定义 Hooks 中，以最大化复用性并实现关注点分离。
* **可扩展的命令系统**：斜杠命令（`/command`）采用模块化命令模式实现，便于在不影响核心逻辑的前提下添加、删除或修改命令。

## 目录结构解析

以下为 `src/ui` 文件夹中主要目录的说明。

### 📂 `components/`

存放组成界面视觉部分的所有可复用 React 组件。

* **`App.tsx`**：根组件，负责组装所有其他组件并初始化应用上下文。
* **`InputPrompt.tsx`**：核心组件，处理所有用户输入，包括文本输入、按键绑定和自动补全。
* **`HistoryItemDisplay.tsx`**：渲染聊天记录中的单条消息（来自用户或 Gemini）。
* **`DetailedMessagesDisplay.tsx`**：渲染完整聊天记录列表的容器组件。
* **对话框组件（`*Dialog.tsx`）**：如 `SettingsDialog.tsx` 和 `ShellConfirmationDialog.tsx`，用于特定交互的模态界面。

### 📂 `hooks/`

存放应用的核心逻辑。自定义 Hooks 用于管理状态与副作用。

* **`useGeminiStream.ts`**：管理与 Gemini API 的通信，包括发送提示、处理流式响应以及处理工具调用。
* **命令处理器（`*CommandProcessor.ts`）**：

  * `slashCommandProcessor.ts`：解析并执行 `/` 命令
  * `shellCommandProcessor.ts`：解析并执行 `!` Shell 命令
  * `atCommandProcessor.ts`：解析并执行 `@` 上下文命令
* **`useKeypress.ts`**：捕获并处理用户按键的底层 Hook，是交互式输入的基础。
* **自动补全 Hooks（`use*Completion.ts`）**：提供自动补全系统的逻辑。
* **`useHistoryManager.ts`**：管理用户聊天记录的状态与持久化。

### 📂 `contexts/`

存放全局状态管理的 React Context 提供者。

* **`SessionContext.tsx`**：管理当前聊天会话的状态，包括消息历史与会话状态，是主要的状态容器。
* **`SettingsContext.tsx`**：存储并提供用户可配置设置（如主题）。
* **`StreamingContext.tsx`**：管理 Gemini 模型流式响应的实时状态。

### 📂 `commands/`

定义所有可用的斜杠命令。

* 每个文件（如 `helpCommand.ts`、`themeCommand.ts`）代表一个独立的命令。
* 文件导出命令的逻辑、名称、描述和用法。
* 这种模块化结构便于扩展 CLI 的功能。

### 📂 `themes/`

存放所有可用的配色主题定义。

* 每个文件（如 `default.ts`、`dracula.ts`）导出一个主题对象，定义了颜色调色板。
* `semantic-colors.ts` 将这些颜色映射为有意义的名称（如 `primary`、`error`），供组件在样式中使用。

## 工作原理：一次典型的交互流程

1. 用户在 **`InputPrompt.tsx`** 组件中输入提示词（prompt）。
2. **`useKeypress.ts`** Hook 捕获输入。如果按下特殊键（如 `/` 或 `<tab>`），可能会触发自动补全 Hook（如 **`useSlashCompletion.ts`**）的动作。
3. 当用户按下 `Enter` 时，提示词被传递给 **`useGeminiStream.ts`** Hook。
4. 如果提示词是斜杠命令（如 `/help`），**`slashCommandProcessor.ts`** 会识别并执行 `commands/` 目录中的对应函数，结果会更新 **`SessionContext`**。
5. 如果是发给模型的提示词，**`useGeminiStream.ts`** 会将请求发送至 Gemini API。
6. 当响应以流式返回时，该 Hook 会实时更新 **`StreamingContext`** 和 **`SessionContext`**。
7. 上下文变化会触发 **`DetailedMessagesDisplay.tsx`** 和 **`HistoryItemDisplay.tsx`** 组件的重新渲染，将 Gemini 的响应逐步显示出来。