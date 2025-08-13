# Gemini CLI 核心：工具 API

Gemini CLI 核心 (`packages/core`) 具有一个强大的系统，用于定义、注册和执行工具。这些工具扩展了 Gemini 模型的功能，使其能够与本地环境交互、获取 Web 内容以及执行超出简单文本生成的各种操作。

## 核心概念

- **工具 (`tools.ts`)：** 一个接口和基类 (`BaseTool`)，定义了所有工具的契约。每个工具必须具有：
  - `name`：唯一的内部名称（在对 Gemini 的 API 调用中使用）。
  - `displayName`：用户友好的名称。
  - `description`：对工具功能的清晰解释，提供给 Gemini 模型。
  - `parameterSchema`：一个 JSON 模式，定义工具接受的参数。这对于 Gemini 模型正确理解如何调用工具至关重要。
  - `validateToolParams()`：验证传入参数的方法。
  - `getDescription()`：在执行之前，提供对工具将如何使用特定参数的人类可读描述的方法。
  - `shouldConfirmExecute()`：确定执行前是否需要用户确认的方法（例如，对于潜在的破坏性操作）。
  - `execute()`：执行工具操作并返回 `ToolResult` 的核心方法。

- **`ToolResult` (`tools.ts`)：** 一个接口，定义工具执行结果的结构：
  - `llmContent`：要包含在发送回 LLM 的历史记录中以获取上下文的事实内容。这可以是简单的字符串或 `PartListUnion`（`Part` 对象和字符串的数组）以获取富内容。
  - `returnDisplay`：用户友好的字符串（通常是 Markdown）或特殊对象（如 `FileDiff`）用于在 CLI 中显示。

- **返回富内容：** 工具不限于返回简单文本。`llmContent` 可以是 `PartListUnion`，它是一个可以包含 `Part` 对象（用于图像、音频等）和 `string` 混合的数组。这允许单个工具执行返回多个富内容片段。

- **工具注册表 (`tool-registry.ts`)：** 一个类 (`ToolRegistry`)，负责：
  - **注册工具：** 包含所有可用内置工具的集合（例如，`ReadFileTool`、`ShellTool`）。
  - **发现工具：** 它还可以动态发现工具：
    - **基于命令的发现：** 如果在设置中配置了 `toolDiscoveryCommand`，则执行此命令。它应该输出描述自定义工具的 JSON，然后这些工具将注册为 `DiscoveredTool` 实例。
    - **基于 MCP 的发现：** 如果配置了 `mcpServerCommand`，注册表可以连接到模型上下文协议 (MCP) 服务器以列出和注册工具 (`DiscoveredMCPTool`)。
  - **提供模式：** 向 Gemini 模型公开所有注册工具的 `FunctionDeclaration` 模式，以便它知道哪些工具可用以及如何使用它们。
  - **检索工具：** 允许核心按名称获取特定工具以进行执行。

## 内置工具

核心附带了一套预定义的工具，通常位于 `packages/core/src/tools/` 中。这些工具包括：

- **文件系统工具：**
  - `LSTool` (`ls.ts`)：列出目录内容。
  - `ReadFileTool` (`read-file.ts`)：读取单个文件的内容。它接受一个 `absolute_path` 参数，该参数必须是绝对路径。
  - `WriteFileTool` (`write-file.ts`)：将内容写入文件。
  - `GrepTool` (`grep.ts`)：在文件中搜索模式。
  - `GlobTool` (`glob.ts`)：查找匹配 glob 模式的文件。
  - `EditTool` (`edit.ts`)：对文件执行就地修改（通常需要确认）。
  - `ReadManyFilesTool` (`read-many-files.ts`)：读取并连接多个文件或 glob 模式的内容（由 CLI 中的 `@` 命令使用）。
- **执行工具：**
  - `ShellTool` (`shell.ts`)：执行任意 shell 命令（需要仔细的沙盒和用户确认）。
- **Web 工具：**
  - `WebFetchTool` (`web-fetch.ts`)：从 URL 获取内容。
  - `WebSearchTool` (`web-search.ts`)：执行 Web 搜索。
- **内存工具：**
  - `MemoryTool` (`memoryTool.ts`)：与 AI 的内存交互。

这些工具中的每一个都扩展了 `BaseTool` 并实现了其特定功能所需的必要方法。

## 工具执行流程

1.  **模型请求：** Gemini 模型，根据用户的提示和提供的工具模式，决定使用一个工具并在其响应中返回一个 `FunctionCall` 部分，指定工具名称和参数。
2.  **核心接收请求：** 核心解析此 `FunctionCall`。
3.  **工具检索：** 它在 `ToolRegistry` 中查找请求的工具。
4.  **参数验证：** 调用工具的 `validateToolParams()` 方法。
5.  **确认（如果需要）：**
    - 调用工具的 `shouldConfirmExecute()` 方法。
    - 如果它返回确认详情，核心会将其传回 CLI，CLI 会提示用户。
    - 用户的决定（例如，继续、取消）会发送回核心。
6.  **执行：** 如果验证并确认（或不需要确认），核心会使用提供的参数和 `AbortSignal`（用于潜在取消）调用工具的 `execute()` 方法。
7.  **结果处理：** 从 `execute()` 返回的 `ToolResult` 由核心接收。
8.  **响应模型：** `ToolResult` 中的 `llmContent` 被打包为 `FunctionResponse` 并发送回 Gemini 模型，以便它可以继续生成面向用户的响应。
9.  **显示给用户：** `ToolResult` 中的 `returnDisplay` 被发送到 CLI，以向用户显示工具执行了什么。

## 使用自定义工具进行扩展

虽然在为典型最终用户提供的文件中没有明确详细说明用户直接以编程方式注册新工具作为主要工作流程，但该架构通过以下方式支持扩展：

- **基于命令的发现：** 高级用户或项目管理员可以在 `settings.json` 中定义 `toolDiscoveryCommand`。当 Gemini CLI 核心运行此命令时，它应该输出一个 `FunctionDeclaration` 对象的 JSON 数组。然后，核心将这些作为 `DiscoveredTool` 实例提供。相应的 `toolCallCommand` 将负责实际执行这些自定义工具。
- **MCP 服务器：** 对于更复杂的场景，可以设置一个或多个 MCP 服务器并通过 `settings.json` 中的 `mcpServers` 设置进行配置。然后，Gemini CLI 核心可以发现和使用这些服务器公开的工具。如前所述，如果您有多个 MCP 服务器，工具名称将以您配置中的服务器名称为前缀（例如，`serverAlias__actualToolName`）。

此工具系统提供了一种灵活而强大的方式来增强 Gemini 模型的功能，使 Gemini CLI 成为适用于各种任务的多功能助手。
