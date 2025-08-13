# Gemini CLI 可观测性指南

遥测提供有关 Gemini CLI 性能、健康状况和使用情况的数据。通过启用它，您可以通过跟踪、指标和结构化日志来监控操作、调试问题和优化工具使用。

Gemini CLI 的遥测系统基于 **[OpenTelemetry] (OTEL)** 标准构建，允许您将数据发送到任何兼容的后端。

[OpenTelemetry]: https://opentelemetry.io/

## 启用遥测

您可以通过多种方式启用遥测。配置主要通过 [`.gemini/settings.json` 文件](./cli/configuration.md) 和环境变量进行管理，但 CLI 标志可以覆盖这些设置以用于特定会话。

### 优先级顺序

以下列出了应用遥测设置的优先级，列表中靠前的项具有更高的优先级：

1.  **CLI 标志（用于 `gemini` 命令）：**
    - `--telemetry` / `--no-telemetry`：覆盖 `telemetry.enabled`。
    - `--telemetry-target <local|gcp>`：覆盖 `telemetry.target`。
    - `--telemetry-otlp-endpoint <URL>`：覆盖 `telemetry.otlpEndpoint`。
    - `--telemetry-log-prompts` / `--no-telemetry-log-prompts`：覆盖 `telemetry.logPrompts`。
    - `--telemetry-outfile <path>`：将遥测输出重定向到文件。请参阅 [导出到文件](#exporting-to-a-file)。

1.  **环境变量：**
    - `OTEL_EXPORTER_OTLP_ENDPOINT`：覆盖 `telemetry.otlpEndpoint`。

1.  **工作区设置文件 (`.gemini/settings.json`)：** 此项目特定文件中 `telemetry` 对象的值。

1.  **用户设置文件 (`~/.gemini/settings.json`)：** 此全局用户文件中 `telemetry` 对象的值。

1.  **默认值：** 如果未由上述任何项设置，则应用。
    - `telemetry.enabled`：`false`
    - `telemetry.target`：`local`
    - `telemetry.otlpEndpoint`：`http://localhost:4317`
    - `telemetry.logPrompts`：`true`

**对于 `npm run telemetry -- --target=<gcp|local>` 脚本：**
此脚本的 `--target` 参数*仅*在脚本的持续时间和目的（即选择要启动的收集器）内覆盖 `telemetry.target`。它不会永久更改您的 `settings.json`。脚本将首先在 `settings.json` 中查找 `telemetry.target` 作为其默认值。

### 示例设置

以下代码可以添加到您的工作区 (`.gemini/settings.json`) 或用户 (`~/.gemini/settings.json`) 设置中，以启用遥测并将输出发送到 Google Cloud：

```json
{
  "telemetry": {
    "enabled": true,
    "target": "gcp"
  },
  "sandbox": false
}
```

### 导出到文件

您可以将所有遥测数据导出到文件以进行本地检查。

要启用文件导出，请使用 `--telemetry-outfile` 标志和所需输出文件的路径。这必须使用 `--telemetry-target=local` 运行。

```bash
# 设置您所需的输出文件路径
TELEMETRY_FILE=".gemini/telemetry.log"

# 使用本地遥测运行 Gemini CLI
# 注意：需要 --telemetry-otlp-endpoint="" 来覆盖默认的
# OTLP 导出器并确保遥测写入本地文件。
gemini --telemetry \
  --telemetry-target=local \
  --telemetry-otlp-endpoint="" \
  --telemetry-outfile="$TELEMETRY_FILE" \
  --prompt "什么是 OpenTelemetry?"
```

## 运行 OTEL 收集器

OTEL 收集器是一种接收、处理和导出遥测数据的服务。
CLI 使用 OTLP/gRPC 协议发送数据。

在 [文档][otel-config-docs] 中了解有关 OTEL 导出器标准配置的更多信息。

[otel-config-docs]: https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/

### 本地

使用 `npm run telemetry -- --target=local` 命令自动化设置本地遥测管道的过程，包括在您的 `.gemini/settings.json` 文件中配置必要的设置。底层脚本安装 `otelcol-contrib` (OpenTelemetry Collector) 和 `jaeger` (用于查看跟踪的 Jaeger UI)。要使用它：

1.  **运行命令**：
    从存储库的根目录执行命令：

    ```bash
    npm run telemetry -- --target=local
    ```

    脚本将：
    - 如果需要，下载 Jaeger 和 OTEL。
    - 启动本地 Jaeger 实例。
    - 启动配置为从 Gemini CLI 接收数据的 OTEL 收集器。
    - 自动在您的工作区设置中启用遥测。
    - 退出时，禁用遥测。

1.  **查看跟踪**：
    打开您的 Web 浏览器并导航到 **http://localhost:16686** 以访问 Jaeger UI。在这里您可以检查 Gemini CLI 操作的详细跟踪。

1.  **检查日志和指标**：
    脚本将 OTEL 收集器输出（包括日志和指标）重定向到 `~/.gemini/tmp/<projectHash>/otel/collector.log`。脚本将提供链接以查看和命令以跟踪您的本地遥测数据（跟踪、指标、日志）。

1.  **停止服务**：
    在运行脚本的终端中按 `Ctrl+C` 以停止 OTEL 收集器和 Jaeger 服务。

### Google Cloud

使用 `npm run telemetry -- --target=gcp` 命令自动化设置本地 OpenTelemetry 收集器，该收集器将数据转发到您的 Google Cloud 项目，包括在您的 `.gemini/settings.json` 文件中配置必要的设置。底层脚本安装 `otelcol-contrib`。要使用它：

1.  **先决条件**：
    - 拥有 Google Cloud 项目 ID。
    - 导出 `GOOGLE_CLOUD_PROJECT` 环境变量，使其可用于 OTEL 收集器。
      ```bash
      export OTLP_GOOGLE_CLOUD_PROJECT="您的项目 ID"
      ```
    - 使用 Google Cloud 进行身份验证（例如，运行 `gcloud auth application-default login` 或确保设置了 `GOOGLE_APPLICATION_CREDENTIALS`）。
    - 确保您的 Google Cloud 帐户/服务帐户具有必要的 IAM 角色：“Cloud Trace Agent”、“Monitoring Metric Writer”和“Logs Writer”。

1.  **运行命令**：
    从存储库的根目录执行命令：

    ```bash
    npm run telemetry -- --target=gcp
    ```

    脚本将：
    - 如果需要，下载 `otelcol-contrib` 二进制文件。
    - 启动配置为从 Gemini CLI 接收数据并将其导出到您指定的 Google Cloud 项目的 OTEL 收集器。
    - 自动在您的工作区设置 (`.gemini/settings.json`) 中启用遥测并禁用沙盒模式。
    - 提供直接链接以在 Google Cloud Console 中查看跟踪、指标和日志。
    - 退出时 (Ctrl+C)，它将尝试恢复您的原始遥测和沙盒设置。

1.  **运行 Gemini CLI：**
    在单独的终端中，运行您的 Gemini CLI 命令。这将生成收集器捕获的遥测数据。

1.  **在 Google Cloud 中查看遥测**：
    使用脚本提供的链接导航到 Google Cloud Console 并查看您的跟踪、指标和日志。

1.  **检查本地收集器日志**：
    脚本将本地 OTEL 收集器输出重定向到 `~/.gemini/tmp/<projectHash>/otel/collector-gcp.log`。脚本提供链接以查看和命令以跟踪您的本地收集器日志。

1.  **停止服务**：
    在运行脚本的终端中按 `Ctrl+C` 以停止 OTEL 收集器。

## 日志和指标参考

以下部分描述了为 Gemini CLI 生成的日志和指标的结构。

- `sessionId` 作为所有日志和指标的通用属性包含在内。

### 日志

日志是特定事件的时间戳记录。Gemini CLI 记录以下事件：

- `gemini_cli.config`：此事件在启动时发生一次，包含 CLI 的配置。
  - **属性**：
    - `model` (字符串)
    - `embedding_model` (字符串)
    - `sandbox_enabled` (布尔值)
    - `core_tools_enabled` (字符串)
    - `approval_mode` (字符串)
    - `api_key_enabled` (布尔值)
    - `vertex_ai_enabled` (布尔值)
    - `code_assist_enabled` (布尔值)
    - `log_prompts_enabled` (布尔值)
    - `file_filtering_respect_git_ignore` (布尔值)
    - `debug_mode` (布尔值)
    - `mcp_servers` (字符串)

- `gemini_cli.user_prompt`：此事件在用户提交提示时发生。
  - **属性**：
    - `prompt_length`
    - `prompt` (如果 `log_prompts_enabled` 配置为 `false`，则此属性被排除)
    - `auth_type`

- `gemini_cli.tool_call`：此事件在每次函数调用时发生。
  - **属性**：
    - `function_name`
    - `function_args`
    - `duration_ms`
    - `success` (布尔值)
    - `decision` (字符串：“accept”、“reject”、“auto_accept”或“modify”，如果适用)
    - `error` (如果适用)
    - `error_type` (如果适用)
    - `metadata` (如果适用，字符串 -> 任意类型的字典)

- `gemini_cli.api_request`：此事件在向 Gemini API 发出请求时发生。
  - **属性**：
    - `model`
    - `request_text` (如果适用)

- `gemini_cli.api_error`：如果 API 请求失败，则发生此事件。
  - **属性**：
    - `model`
    - `error`
    - `error_type`
    - `status_code`
    - `duration_ms`
    - `auth_type`

- `gemini_cli.api_response`：此事件在收到 Gemini API 的响应时发生。
  - **属性**：
    - `model`
    - `status_code`
    - `duration_ms`
    - `error` (可选)
    - `input_token_count`
    - `output_token_count`
    - `cached_content_token_count`
    - `thoughts_token_count`
    - `tool_token_count`
    - `response_text` (如果适用)
    - `auth_type`

- `gemini_cli.flash_fallback`：此事件在 Gemini CLI 切换到 flash 作为回退时发生。
  - **属性**：
    - `auth_type`

- `gemini_cli.slash_command`：此事件在用户执行斜杠命令时发生。
  - **属性**：
    - `command` (字符串)
    - `subcommand` (字符串，如果适用)

### 指标

指标是行为随时间变化的数值测量。Gemini CLI 收集以下指标：

- `gemini_cli.session.count` (计数器，整数)：每次 CLI 启动时递增一次。

- `gemini_cli.tool.call.count` (计数器，整数)：计算工具调用次数。
  - **属性**：
    - `function_name`
    - `success` (布尔值)
    - `decision` (字符串：“accept”、“reject”或“modify”，如果适用)

- `gemini_cli.tool.call.latency` (直方图，毫秒)：测量工具调用延迟。
  - **属性**：
    - `function_name`
    - `decision` (字符串：“accept”、“reject”或“modify”，如果适用)

- `gemini_cli.api.request.count` (计数器，整数)：计算所有 API 请求。
  - **属性**：
    - `model`
    - `status_code`
    - `error_type` (如果适用)

- `gemini_cli.api.request.latency` (直方图，毫秒)：测量 API 请求延迟。
  - **属性**：
    - `model`

- `gemini_cli.token.usage` (计数器，整数)：计算使用的令牌数量。
  - **属性**：
    - `model`
    - `type` (字符串：“input”、“output”、“thought”、“cache”或“tool”)

- `gemini_cli.file.operation.count` (计数器，整数)：计算文件操作次数。
  - **属性**：
    - `operation` (字符串：“create”、“read”、“update”)：文件操作的类型。
    - `lines` (整数，如果适用)：文件中的行数。
    - `mimetype` (字符串，如果适用)：文件的 Mimetype。
    - `extension` (字符串，如果适用)：文件的文件扩展名。
    - `ai_added_lines` (整数，如果适用)：AI 添加/更改的行数。
    - `ai_removed_lines` (整数，如果适用)：AI 删除/更改的行数。
    - `user_added_lines` (整数，如果适用)：用户在 AI 提议的更改中添加/更改的行数。
    - `user_removed_lines` (整数，如果适用)：用户在 AI 提议的更改中删除/更改的行数。
