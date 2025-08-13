# 故障排除指南

本指南提供了常见问题的解决方案和调试技巧，包括以下主题：

- 身份验证或登录错误
- 常见问题 (FAQs)
- 调试技巧
- 类似您的问题的现有 GitHub 问题或创建新问题

## 身份验证或登录错误

- **错误：`Failed to login. Message: Request contains an invalid argument`**
  - 拥有 Google Workspace 帐户或与其 Gmail 帐户关联的 Google Cloud 帐户的用户可能无法激活 Google Code Assist 计划的免费层级。
  - 对于 Google Cloud 帐户，您可以通过将 `GOOGLE_CLOUD_PROJECT` 设置为您的项目 ID 来解决此问题。
  - 或者，您可以从 [Google AI Studio](http://aistudio.google.com/app/apikey) 获取 Gemini API 密钥，其中也包含一个单独的免费层级。

## 常见问题 (FAQs)

- **问：如何将 Gemini CLI 更新到最新版本？**
  - 答：如果您通过 `npm` 全局安装，请使用命令 `npm install -g @google/gemini-cli@latest` 进行更新。如果您从源代码编译，请从存储库中拉取最新更改，然后使用命令 `npm run build` 重新构建。

- **问：Gemini CLI 配置或设置文件存储在哪里？**
  - 答：Gemini CLI 配置存储在两个 `settings.json` 文件中：
    1. 在您的主目录中：`~/.gemini/settings.json`。
    2. 在您的项目根目录中：`./.gemini/settings.json`。

    有关更多详细信息，请参阅 [Gemini CLI 配置](./cli/configuration.md)。

- **问：为什么我的统计信息输出中没有显示缓存的令牌计数？**
  - 答：缓存的令牌信息仅在使用缓存令牌时显示。此功能适用于 API 密钥用户（Gemini API 密钥或 Google Cloud Vertex AI），但不适用于 OAuth 用户（例如 Google 个人/企业帐户，如 Google Gmail 或 Google Workspace）。这是因为 Gemini Code Assist API 不支持缓存内容创建。您仍然可以使用 Gemini CLI 中的 `/stats` 命令查看您的总令牌使用情况。

## 常见错误消息和解决方案

- **错误：启动 MCP 服务器时出现 `EADDRINUSE`（地址已在使用中）。**
  - **原因：** 另一个进程已在使用 MCP 服务器尝试绑定的端口。
  - **解决方案：**
    停止正在使用该端口的另一个进程，或将 MCP 服务器配置为使用不同的端口。

- **错误：找不到命令（尝试使用 `gemini` 运行 Gemini CLI 时）。**
  - **原因：** Gemini CLI 未正确安装或不在您的系统 `PATH` 中。
  - **解决方案：**
    更新取决于您安装 Gemini CLI 的方式：
    - 如果您全局安装了 `gemini`，请检查您的 `npm` 全局二进制目录是否在您的 `PATH` 中。您可以使用命令 `npm install -g @google/gemini-cli@latest` 更新 Gemini CLI。
    - 如果您从源代码运行 `gemini`，请确保您使用正确的命令来调用它（例如，`node packages/cli/dist/index.js ...`）。要更新 Gemini CLI，请从存储库中拉取最新更改，然后使用命令 `npm run build` 重新构建。

- **错误：`MODULE_NOT_FOUND` 或导入错误。**
  - **原因：** 依赖项未正确安装，或项目尚未构建。
  - **解决方案：**
    1.  运行 `npm install` 以确保所有依赖项都存在。
    2.  运行 `npm run build` 以编译项目。
    3.  使用 `npm run start` 验证构建是否成功完成。

- **错误：“操作不允许”、“权限被拒绝”或类似错误。**
  - **原因：** 启用沙盒时，Gemini CLI 可能会尝试执行受沙盒配置限制的操作，例如在项目目录或系统临时目录之外写入。
  - **解决方案：** 有关更多信息，包括如何自定义沙盒配置，请参阅 [配置：沙盒](./cli/configuration.md#sandboxing) 文档。

- **Gemini CLI 在“CI”环境中未以交互模式运行**
  - **问题：** 如果设置了以 `CI_` 开头的环境变量（例如，`CI_TOKEN`），Gemini CLI 不会进入交互模式（不显示提示）。这是因为底层 UI 框架使用的 `is-in-ci` 包检测到这些变量并假定为非交互式 CI 环境。
  - **原因：** `is-in-ci` 包检查 `CI`、`CONTINUOUS_INTEGRATION` 或任何带有 `CI_` 前缀的环境变量是否存在。当发现其中任何一个时，它会发出信号表明环境是非交互式的，这会阻止 Gemini CLI 以其交互模式启动。
  - **解决方案：** 如果 CLI 不需要 `CI_` 前缀变量才能运行，您可以暂时取消设置该变量以用于命令。例如，`env -u CI_TOKEN gemini`

- **DEBUG 模式无法从项目 .env 文件中工作**
  - **问题：** 在项目的 `.env` 文件中设置 `DEBUG=true` 不会为 gemini-cli 启用调试模式。
  - **原因：** `DEBUG` 和 `DEBUG_MODE` 变量会自动从项目 `.env` 文件中排除，以防止干扰 gemini-cli 行为。
  - **解决方案：** 改用 `.gemini/.env` 文件，或在 `settings.json` 中配置 `excludedProjectEnvVars` 设置以排除更少的变量。

## 调试技巧

- **CLI 调试：**
  - 对 CLI 命令使用 `--verbose` 标志（如果可用）以获取更详细的输出。
  - 检查 CLI 日志，通常在用户特定的配置或缓存目录中找到。

- **核心调试：**
  - 检查服务器控制台输出中的错误消息或堆栈跟踪。
  - 如果可配置，则增加日志详细程度。
  - 如果需要逐步执行服务器端代码，请使用 Node.js 调试工具（例如，`node --inspect`）。

- **工具问题：**
  - 如果特定工具失败，请尝试通过运行工具执行的最简单版本命令或操作来隔离问题。
  - 对于 `run_shell_command`，请首先检查该命令是否直接在您的 shell 中工作。
  - 对于 _文件系统工具_，请验证路径是否正确并检查权限。

- **预检检查：**
  - 在提交代码之前，始终运行 `npm run preflight`。这可以捕获许多与格式、linting 和类型错误相关的常见问题。

## 类似您的问题的现有 GitHub 问题或创建新问题

如果您遇到本《故障排除指南》中未涵盖的问题，请考虑搜索 Gemini CLI [GitHub 上的问题跟踪器](https://github.com/google-gemini/gemini-cli/issues)。如果您找不到类似您的问题，请考虑创建一个包含详细描述的新 GitHub 问题。也欢迎拉取请求！
