# Gemini CLI 中的 MCP 服务器

本文档提供了在 Gemini CLI 中配置和使用模型上下文协议 (MCP) 服务器的指南。

## 什么是 MCP 服务器？

MCP 服务器是一个应用程序，通过模型上下文协议向 Gemini CLI 公开工具和资源，允许它与外部系统和数据源交互。MCP 服务器充当 Gemini 模型与您的本地环境或其他服务（如 API）之间的桥梁。

MCP 服务器使 Gemini CLI 能够：

- **发现工具：** 通过标准化模式定义列出可用工具、其描述和参数。
- **执行工具：** 使用定义的参数调用特定工具并接收结构化响应。
- **访问资源：** 从特定资源读取数据（尽管 Gemini CLI 主要关注工具执行）。

通过 MCP 服务器，您可以扩展 Gemini CLI 的功能，以执行超出其内置功能的操作，例如与数据库、API、自定义脚本或专业工作流交互。

## 核心集成架构

Gemini CLI 通过内置于核心包 (`packages/core/src/tools/`) 中的复杂发现和执行系统与 MCP 服务器集成：

### 发现层 (`mcp-client.ts`)

发现过程由 `discoverMcpTools()` 协调，它：

1. **迭代配置的服务器** 从您的 `settings.json` `mcpServers` 配置中
2. **建立连接** 使用适当的传输机制（Stdio、SSE 或可流式 HTTP）
3. **从每个服务器获取工具定义** 使用 MCP 协议
4. **清理和验证** 工具模式以与 Gemini API 兼容
5. **在全局工具注册表中注册工具** 具有冲突解决功能

### 执行层 (`mcp-tool.ts`)

每个发现的 MCP 工具都包装在 `DiscoveredMCPTool` 实例中，该实例：

- **根据服务器信任设置和用户偏好处理确认逻辑**
- **通过使用适当的参数调用 MCP 服务器来管理工具执行**
- **处理 LLM 上下文和用户显示的响应**
- **维护连接状态** 并处理超时

### 传输机制

Gemini CLI 支持三种 MCP 传输类型：

- **Stdio 传输：** 启动子进程并通过 stdin/stdout 进行通信
- **SSE 传输：** 连接到服务器发送事件端点
- **可流式 HTTP 传输：** 使用 HTTP 流进行通信

## 如何设置您的 MCP 服务器

Gemini CLI 使用 `mcpServers` 配置在您的 `settings.json` 文件中定位和连接 MCP 服务器。此配置支持具有不同传输机制的多个服务器。

### 在 settings.json 中配置 MCP 服务器

您可以在 `~/.gemini/settings.json` 文件中或在项目根目录中全局配置 MCP 服务器，创建或打开 `.gemini/settings.json` 文件。在该文件中，添加 `mcpServers` 配置块。

### 配置结构

将 `mcpServers` 对象添加到您的 `settings.json` 文件中：

```json
{ ...文件包含其他配置对象
  "mcpServers": {
    "serverName": {
      "command": "path/to/server",
      "args": ["--arg1", "value1"],
      "env": {
        "API_KEY": "$MY_API_TOKEN"
      },
      "cwd": "./server-directory",
      "timeout": 30000,
      "trust": false
    }
  }
}
```

### 配置属性

每个服务器配置都支持以下属性：

#### 必需（以下之一）

- **`command`** (字符串)：Stdio 传输的可执行文件路径
- **`url`** (字符串)：SSE 端点 URL（例如，`"http://localhost:8080/sse"`）
- **`httpUrl`** (字符串)：HTTP 流端点 URL

#### 可选

- **`args`** (字符串[])：Stdio 传输的命令行参数
- **`headers`** (对象)：使用 `url` 或 `httpUrl` 时的自定义 HTTP 头
- **`env`** (对象)：服务器进程的环境变量。值可以使用 `$VAR_NAME` 或 `${VAR_NAME}` 语法引用环境变量
- **`cwd`** (字符串)：Stdio 传输的工作目录
- **`timeout`** (数字)：请求超时（毫秒）（默认：600,000 毫秒 = 10 分钟）
- **`trust`** (布尔值)：当 `true` 时，绕过此服务器的所有工具调用确认（默认：`false`）
- **`includeTools`** (字符串[])：要从此 MCP 服务器包含的工具名称列表。指定后，只有此处列出的工具可从此服务器获得（白名单行为）。如果未指定，则默认启用服务器中的所有工具。
- **`excludeTools`** (字符串[])：要从此 MCP 服务器排除的工具名称列表。此处列出的工具将不可用于模型，即使它们由服务器公开。**注意：** `excludeTools` 优先于 `includeTools` - 如果工具同时在两个列表中，它将被排除。

### 远程 MCP 服务器的 OAuth 支持

Gemini CLI 支持使用 SSE 或 HTTP 传输的远程 MCP 服务器的 OAuth 2.0 身份验证。这使得可以安全访问需要身份验证的 MCP 服务器。

#### 自动 OAuth 发现

对于支持 OAuth 发现的服务器，您可以省略 OAuth 配置，让 CLI 自动发现它：

```json
{
  "mcpServers": {
    "discoveredServer": {
      "url": "https://api.example.com/sse"
    }
  }
}
```

CLI 将自动：

- 检测服务器何时需要 OAuth 身份验证（401 响应）
- 从服务器元数据发现 OAuth 端点
- 如果支持，执行动态客户端注册
- 处理 OAuth 流程和令牌管理

#### 身份验证流程

连接到启用 OAuth 的服务器时：

1. **初始连接尝试** 失败并显示 401 未授权
2. **OAuth 发现** 找到授权和令牌端点
3. **浏览器打开** 进行用户身份验证（需要本地浏览器访问）
4. **授权码** 交换为访问令牌
5. **令牌安全存储** 以备将来使用
6. **连接重试** 成功并带有有效令牌

#### 浏览器重定向要求

**重要：** OAuth 身份验证要求您的本地机器可以：

- 打开 Web 浏览器进行身份验证
- 在 `http://localhost:7777/oauth/callback` 上接收重定向

此功能不适用于：

- 没有浏览器访问权限的无头环境
- 没有 X11 转发的远程 SSH 会话
- 没有浏览器支持的容器化环境

#### 管理 OAuth 身份验证

使用 `/mcp auth` 命令管理 OAuth 身份验证：

```bash
# 列出需要身份验证的服务器
/mcp auth

# 使用特定服务器进行身份验证
/mcp auth serverName

# 如果令牌过期，重新进行身份验证
/mcp auth serverName
```

#### OAuth 配置属性

- **`enabled`** (布尔值)：为此服务器启用 OAuth
- **`clientId`** (字符串)：OAuth 客户端标识符（动态注册时可选）
- **`clientSecret`** (字符串)：OAuth 客户端密钥（公共客户端可选）
- **`authorizationUrl`** (字符串)：OAuth 授权端点（如果省略则自动发现）
- **`tokenUrl`** (字符串)：OAuth 令牌端点（如果省略则自动发现）
- **`scopes`** (字符串[])：所需的 OAuth 范围
- **`redirectUri`** (字符串)：自定义重定向 URI（默认为 `http://localhost:7777/oauth/callback`）
- **`tokenParamName`** (字符串)：SSE URL 中令牌的查询参数名称
- **`audiences`** (字符串[])：令牌有效的受众

#### 令牌管理

OAuth 令牌会自动：

- **安全存储** 在 `~/.gemini/mcp-oauth-tokens.json` 中
- **过期时刷新**（如果刷新令牌可用）
- **在每次连接尝试前验证**
- **无效或过期时清理**

#### 身份验证提供程序类型

您可以使用 `authProviderType` 属性指定身份验证提供程序类型：

- **`authProviderType`** (字符串)：指定身份验证提供程序。可以是以下之一：
  - **`dynamic_discovery`** (默认)：CLI 将自动从服务器发现 OAuth 配置。
  - **`google_credentials`**：CLI 将使用 Google 应用程序默认凭据 (ADC) 向服务器进行身份验证。当使用此提供程序时，您必须指定所需的范围。

```json
{
  "mcpServers": {
    "googleCloudServer": {
      "httpUrl": "https://my-gcp-service.run.app/mcp",
      "authProviderType": "google_credentials",
      "oauth": {
        "scopes": ["https://www.googleapis.com/auth/userinfo.email"]
      }
    }
  }
}
```

### 示例配置

#### Python MCP 服务器 (Stdio)

```json
{
  "mcpServers": {
    "pythonTools": {
      "command": "python",
      "args": ["-m", "my_mcp_server", "--port", "8080"],
      "cwd": "./mcp-servers/python",
      "env": {
        "DATABASE_URL": "$DB_CONNECTION_STRING",
        "API_KEY": "${EXTERNAL_API_KEY}"
      },
      "timeout": 15000
    }
  }
}
```

#### Node.js MCP 服务器 (Stdio)

```json
{
  "mcpServers": {
    "nodeServer": {
      "command": "node",
      "args": ["dist/server.js", "--verbose"],
      "cwd": "./mcp-servers/node",
      "trust": true
    }
  }
}
```

#### 基于 Docker 的 MCP 服务器

```json
{
  "mcpServers": {
    "dockerizedServer": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "API_KEY",
        "-v",
        "${PWD}:/workspace",
        "my-mcp-server:latest"
      ],
      "env": {
        "API_KEY": "$EXTERNAL_SERVICE_TOKEN"
      }
    }
  }
}
```

#### 基于 HTTP 的 MCP 服务器

```json
{
  "mcpServers": {
    "httpServer": {
      "httpUrl": "http://localhost:3000/mcp",
      "timeout": 5000
    }
  }
}
```

#### 带有自定义头的基于 HTTP 的 MCP 服务器

```json
{
  "mcpServers": {
    "httpServerWithAuth": {
      "httpUrl": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer your-api-token",
        "X-Custom-Header": "custom-value",
        "Content-Type": "application/json"
      },
      "timeout": 5000
    }
  }
}
```

#### 带有工具过滤的 MCP 服务器

```json
{
  "mcpServers": {
    "filteredServer": {
      "command": "python",
      "args": ["-m", "my_mcp_server"],
      "includeTools": ["safe_tool", "file_reader", "data_processor"],
      // "excludeTools": ["dangerous_tool", "file_deleter"],
      "timeout": 30000
    }
  }
}
```

## 发现过程深入探讨

当 Gemini CLI 启动时，它通过以下详细过程执行 MCP 服务器发现：

### 1. 服务器迭代和连接

对于 `mcpServers` 中的每个配置服务器：

1. **状态跟踪开始：** 服务器状态设置为 `CONNECTING`
2. **传输选择：** 基于配置属性：
   - `httpUrl` → `StreamableHTTPClientTransport`
   - `url` → `SSEClientTransport`
   - `command` → `StdioClientTransport`
3. **建立连接：** MCP 客户端尝试使用配置的超时进行连接
4. **错误处理：** 连接失败将被记录，服务器状态设置为 `DISCONNECTED`

### 2. 工具发现

成功连接后：

1. **工具列表：** 客户端调用 MCP 服务器的工具列表端点
2. **模式验证：** 每个工具的函数声明都经过验证
3. **工具过滤：** 工具根据 `includeTools` 和 `excludeTools` 配置进行过滤
4. **名称清理：** 工具名称经过清理以满足 Gemini API 要求：
   - 无效字符（非字母数字、下划线、点、连字符）替换为下划线
   - 长度超过 63 个字符的名称通过中间替换 (`___`) 截断

### 3. 冲突解决

当多个服务器公开同名工具时：

1. **首次注册获胜：** 第一个注册工具名称的服务器获得无前缀名称
2. **自动添加前缀：** 后续服务器获得带前缀的名称：`serverName__toolName`
3. **注册表跟踪：** 工具注册表维护服务器名称与其工具之间的映射

### 4. 模式处理

工具参数模式经过清理以与 Gemini API 兼容：

- **`$schema` 属性** 被删除
- **`additionalProperties`** 被剥离
- **带有 `default` 的 `anyOf`** 删除了其默认值（Vertex AI 兼容性）
- **递归处理** 适用于嵌套模式

### 5. 连接管理

发现后：

- **持久连接：** 成功注册工具的服务器保持其连接
- **清理：** 不提供可用工具的服务器的连接会自动关闭
- **状态更新：** 最终服务器状态设置为 `CONNECTED` 或 `DISCONNECTED`

## 工具执行流程

当 Gemini 模型决定使用 MCP 工具时，会发生以下执行流程：

### 1. 工具调用

模型生成一个 `FunctionCall`，其中包含：

- **工具名称：** 注册名称（可能带有前缀）
- **参数：** 与工具参数模式匹配的 JSON 对象

### 2. 确认过程

每个 `DiscoveredMCPTool` 都实现复杂的确认逻辑：

#### 基于信任的绕过

```typescript
if (this.trust) {
  return false; // 无需确认
}
```

#### 动态允许列表

系统维护内部允许列表，用于：

- **服务器级别：** `serverName` → 此服务器的所有工具都受信任
- **工具级别：** `serverName.toolName` → 此特定工具受信任

#### 用户选择处理

当需要确认时，用户可以选择：

- **仅本次执行：** 仅本次执行
- **始终允许此工具：** 添加到工具级别允许列表
- **始终允许此服务器：** 添加到服务器级别允许列表
- **取消：** 中止执行

### 3. 执行

确认后（或信任绕过）：

1. **参数准备：** 参数根据工具的模式进行验证
2. **MCP 调用：** 底层 `CallableTool` 使用以下内容调用服务器：

   ```typescript
   const functionCalls = [
     {
       name: this.serverToolName, // 原始服务器工具名称
       args: params,
     },
   ];
   ```

3. **响应处理：** 结果格式化为 LLM 上下文和用户显示

### 4. 响应处理

执行结果包含：

- **`llmContent`：** 语言模型的原始响应部分
- **`returnDisplay`：** 用户显示的格式化输出（通常是 markdown 代码块中的 JSON）

## 如何与您的 MCP 服务器交互

### 使用 `/mcp` 命令

`/mcp` 命令提供有关您的 MCP 服务器设置的全面信息：

```bash
/mcp
```

这会显示：

- **服务器列表：** 所有配置的 MCP 服务器
- **连接状态：** `CONNECTED`、`CONNECTING` 或 `DISCONNECTED`
- **服务器详细信息：** 配置摘要（不包括敏感数据）
- **可用工具：** 每个服务器的工具列表及其描述
- **发现状态：** 整体发现过程状态

### 示例 `/mcp` 输出

```
MCP 服务器状态：

📡 pythonTools (已连接)
  命令：python -m my_mcp_server --port 8080
  工作目录：./mcp-servers/python
  超时：15000ms
  工具：calculate_sum, file_analyzer, data_processor

🔌 nodeServer (已断开连接)
  命令：node dist/server.js --verbose
  错误：连接被拒绝

🐳 dockerizedServer (已连接)
  命令：docker run -i --rm -e API_KEY my-mcp-server:latest
  工具：docker__deploy, docker__status

发现状态：已完成
```

### 工具使用

一旦发现，MCP 工具就像内置工具一样可供 Gemini 模型使用。模型将自动：

1. **根据您的请求选择适当的工具**
2. **显示确认对话框**（除非服务器受信任）
3. **使用适当的参数执行工具**
4. **以用户友好的格式显示结果**

## 状态监控和故障排除

### 连接状态

MCP 集成跟踪多种状态：

#### 服务器状态 (`MCPServerStatus`)

- **`DISCONNECTED`：** 服务器未连接或有错误
- **`CONNECTING`：** 连接尝试进行中
- **`CONNECTED`：** 服务器已连接并准备就绪

#### 发现状态 (`MCPDiscoveryState`)

- **`NOT_STARTED`：** 发现尚未开始
- **`IN_PROGRESS`：** 当前正在发现服务器
- **`COMPLETED`：** 发现完成（有或没有错误）

### 常见问题和解决方案

#### 服务器无法连接

**症状：** 服务器显示 `DISCONNECTED` 状态

**故障排除：**

1. **检查配置：** 验证 `command`、`args` 和 `cwd` 是否正确
2. **手动测试：** 直接运行服务器命令以确保其正常工作
3. **检查依赖项：** 确保所有必需的包都已安装
4. **查看日志：** 在 CLI 输出中查找错误消息
5. **验证权限：** 确保 CLI 可以执行服务器命令

#### 未发现工具

**症状：** 服务器连接但没有可用工具

**故障排除：**

1. **验证工具注册：** 确保您的服务器实际注册了工具
2. **检查 MCP 协议：** 确认您的服务器正确实现了 MCP 工具列表
3. **查看服务器日志：** 检查 stderr 输出以查找服务器端错误
4. **测试工具列表：** 手动测试您的服务器的工具发现端点

#### 工具未执行

**症状：** 工具已发现但在执行期间失败

**故障排除：**

1. **参数验证：** 确保您的工具接受预期的参数
2. **模式兼容性：** 验证您的输入模式是否为有效的 JSON 模式
3. **错误处理：** 检查您的工具是否抛出未处理的异常
4. **超时问题：** 考虑增加 `timeout` 设置

#### 沙盒兼容性

**症状：** 启用沙盒时 MCP 服务器失败

**解决方案：**

1. **基于 Docker 的服务器：** 使用包含所有依赖项的 Docker 容器
2. **路径可访问性：** 确保服务器可执行文件在沙盒中可用
3. **网络访问：** 配置沙盒以允许必要的网络连接
4. **环境变量：** 验证所需的环变量是否已传递

### 调试技巧

1. **启用调试模式：** 使用 `--debug` 运行 CLI 以获取详细输出
2. **检查 stderr：** MCP 服务器 stderr 被捕获并记录（INFO 消息已过滤）
3. **测试隔离：** 在集成之前独立测试您的 MCP 服务器
4. **增量设置：** 在添加复杂功能之前从简单工具开始
5. **经常使用 `/mcp`：** 在开发过程中监控服务器状态

## 重要注意事项

### 安全考虑

- **信任设置：** `trust` 选项绕过所有确认对话框。谨慎使用，仅适用于您完全控制的服务器
- **访问令牌：** 配置包含 API 密钥或令牌的环境变量时，请注意安全性
- **沙盒兼容性：** 使用沙盒时，确保 MCP 服务器在沙盒环境中可用
- **私有数据：** 使用范围广泛的个人访问令牌可能导致存储库之间信息泄露

### 性能和资源管理

- **连接持久性：** CLI 维护与成功注册工具的服务器的持久连接
- **自动清理：** 不提供工具的服务器的连接会自动关闭
- **超时管理：** 根据服务器的响应特性配置适当的超时
- **资源监控：** MCP 服务器作为单独的进程运行并消耗系统资源

### 模式兼容性

- **属性剥离：** 系统自动删除某些模式属性（`$schema`、`additionalProperties`）以与 Gemini API 兼容
- **名称清理：** 工具名称自动清理以满足 API 要求
- **冲突解决：** 服务器之间的工具名称冲突通过自动添加前缀解决

这种全面的集成使 MCP 服务器成为扩展 Gemini CLI 功能的强大方式，同时保持安全性、可靠性和易用性。

## 从工具返回富内容

MCP 工具不限于返回简单文本。您可以在单个工具响应中返回富多部分内容，包括文本、图像、音频和其他二进制数据。这使您能够构建强大的工具，可以在单个回合中向模型提供各种信息。

从工具返回的所有数据都经过处理并作为上下文发送到模型，以供其下一次生成，使其能够推理或总结所提供的信息。

### 工作原理

要返回富内容，您的工具的响应必须符合 [`CallToolResult`](https://modelcontextprotocol.io/specification/2025-06-18/server/tools#tool-result) 的 MCP 规范。结果的 `content` 字段应该是一个 `ContentBlock` 对象数组。Gemini CLI 将正确处理此数组，将文本与二进制数据分离并将其打包以供模型使用。

您可以在 `content` 数组中混合和匹配不同的内容块类型。支持的块类型包括：

- `text`
- `image`
- `audio`
- `resource`（嵌入内容）
- `resource_link`

### 示例：返回文本和图像

以下是一个有效的 JSON 响应示例，来自一个 MCP 工具，它同时返回文本描述和图像：

```json
{
  "content": [
    {
      "type": "text",
      "text": "这是您请求的徽标。"
    },
    {
      "type": "image",
      "data": "BASE64_ENCODED_IMAGE_DATA_HERE",
      "mimeType": "image/png"
    },
    {
      "type": "text",
      "text": "该徽标创建于 2025 年。"
    }
  ]
}
```

当 Gemini CLI 收到此响应时，它将：

1.  提取所有文本并将其组合成一个 `functionResponse` 部分以供模型使用。
2.  将图像数据作为单独的 `inlineData` 部分呈现。
3.  在 CLI 中提供简洁、用户友好的摘要，指示已收到文本和图像。

这使您能够构建复杂的工具，可以向 Gemini 模型提供丰富的多模态上下文。

## MCP 提示作为斜杠命令

除了工具之外，MCP 服务器还可以公开预定义的提示，这些提示可以在 Gemini CLI 中作为斜杠命令执行。这允许您为常见或复杂的查询创建快捷方式，这些查询可以轻松地通过名称调用。

### 在服务器上定义提示

以下是一个定义提示的 stdio MCP 服务器的小示例：

```ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'prompt-server',
  version: '1.0.0',
});

server.registerPrompt(
  'poem-writer',
  {
    title: '诗歌作者',
    description: '写一首优美的俳句',
    argsSchema: { title: z.string(), mood: z.string().optional() },
  },
  ({ title, mood }) => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `写一首名为 ${title} 的俳句${mood ? `，情绪为 ${mood}` : ''}。请注意，俳句是 5 个音节，然后是 7 个音节，然后是 5 个音节。`,
        },
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

这可以包含在 `settings.json` 的 `mcpServers` 下：

```json
"nodeServer": {
  "command": "node",
  "args": ["filename.ts"],
}
```

### 调用提示

一旦发现提示，您可以使用其名称作为斜杠命令调用它。CLI 将自动处理参数解析。

```bash
/poem-writer --title="Gemini CLI" --mood="reverent"
```

或者，使用位置参数：

```bash
/poem-writer "Gemini CLI" reverent
```

当您运行此命令时，Gemini CLI 会使用提供的参数在 MCP 服务器上执行 `prompts/get` 方法。服务器负责将参数替换到提示模板中并返回最终的提示文本。CLI 将此提示发送到模型以执行。这提供了一种方便的方式来自动化和共享常见工作流。

## 使用 `gemini mcp` 管理 MCP 服务器

虽然您始终可以通过手动编辑 `settings.json` 文件来配置 MCP 服务器，但 Gemini CLI 提供了一组方便的命令来以编程方式管理您的服务器配置。这些命令简化了添加、列出和删除 MCP 服务器的过程，而无需直接编辑 JSON 文件。

### 添加服务器 (`gemini mcp add`)

`add` 命令在您的 `settings.json` 中配置一个新的 MCP 服务器。根据范围 (`-s, --scope`)，它将被添加到用户配置 `~/.gemini/settings.json` 或项目配置 `.gemini/settings.json` 文件中。

**命令：**

```bash
gemini mcp add [选项] <名称> <命令或 URL> [参数...]
```

- `<名称>`：服务器的唯一名称。
- `<命令或 URL>`：要执行的命令（对于 `stdio`）或 URL（对于 `http`/`sse`）。
- `[参数...]`：`stdio` 命令的可选参数。

**选项（标志）：**

- `-s, --scope`：配置范围（用户或项目）。[默认值：“project”]
- `-t, --transport`：传输类型（stdio、sse、http）。[默认值：“stdio”]
- `-e, --env`：设置环境变量（例如 -e KEY=value）。
- `-H, --header`：为 SSE 和 HTTP 传输设置 HTTP 头（例如 -H "X-Api-Key: abc123" -H "Authorization: Bearer abc123"）。
- `--timeout`：设置连接超时（毫秒）。
- `--trust`：信任服务器（绕过所有工具调用确认提示）。
- `--description`：设置服务器的描述。
- `--include-tools`：要包含的工具的逗号分隔列表。
- `--exclude-tools`：要排除的工具的逗号分隔列表。

#### 添加 stdio 服务器

这是运行本地服务器的默认传输方式。

```bash
# 基本语法
gemini mcp add <名称> <命令> [参数...]

# 示例：添加本地服务器
gemini mcp add my-stdio-server -e API_KEY=123 /path/to/server arg1 arg2 arg3

# 示例：添加本地 python 服务器
gemini mcp add python-server python server.py --port 8080
```

#### 添加 HTTP 服务器

此传输适用于使用可流式 HTTP 传输的服务器。

```bash
# 基本语法
gemini mcp add --transport http <名称> <url>

# 示例：添加 HTTP 服务器
gemini mcp add --transport http http-server https://api.example.com/mcp/

# 示例：添加带有身份验证头的 HTTP 服务器
gemini mcp add --transport http secure-http https://api.example.com/mcp/ --header "Authorization: Bearer abc123"
```

#### 添加 SSE 服务器

此传输适用于使用服务器发送事件 (SSE) 的服务器。

```bash
# 基本语法
gemini mcp add --transport sse <名称> <url>

# 示例：添加 SSE 服务器
gemini mcp add --transport sse sse-server https://api.example.com/sse/

# 示例：添加带有身份验证头的 SSE 服务器
gemini mcp add --transport sse secure-sse https://api.example.com/sse/ --header "Authorization: Bearer abc123"
```

### 列出服务器 (`gemini mcp list`)

要查看当前配置的所有 MCP 服务器，请使用 `list` 命令。它显示每个服务器的名称、配置详细信息和连接状态。

**命令：**

```bash
gemini mcp list
```

**示例输出：**

```sh
✓ stdio-server: command: python3 server.py (stdio) - 已连接
✓ http-server: https://api.example.com/mcp (http) - 已连接
✗ sse-server: https://api.example.com/sse (sse) - 已断开连接
```

### 删除服务器 (`gemini mcp remove`)

要从配置中删除服务器，请使用 `remove` 命令和服务器的名称。

**命令：**

```bash
gemini mcp remove <名称>
```

**示例：**

```bash
gemini mcp remove my-server
```

这将根据范围 (`-s, --scope`) 在适当的 `settings.json` 文件中查找并删除 `mcpServers` 对象中的“my-server”条目。
