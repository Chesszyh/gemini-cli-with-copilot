# Shell 工具 (`run_shell_command`)

本文档描述了 Gemini CLI 的 `run_shell_command` 工具。

## 描述

使用 `run_shell_command` 与底层系统交互、运行脚本或执行命令行操作。`run_shell_command` 执行给定的 shell 命令。在 Windows 上，该命令将使用 `cmd.exe /c` 执行。在其他平台上，该命令将使用 `bash -c` 执行。

### 参数

`run_shell_command` 接受以下参数：

- `command` (字符串，必需)：要执行的确切 shell 命令。
- `description` (字符串，可选)：命令用途的简要描述，将显示给用户。
- `directory` (字符串，可选)：执行命令的目录（相对于项目根目录）。如果未提供，则命令在项目根目录中运行。

## 如何在 Gemini CLI 中使用 `run_shell_command`

使用 `run_shell_command` 时，该命令作为子进程执行。`run_shell_command` 可以使用 `&` 启动后台进程。该工具返回有关执行的详细信息，包括：

- `Command`：已执行的命令。
- `Directory`：运行命令的目录。
- `Stdout`：标准输出流的输出。
- `Stderr`：标准错误流的输出。
- `Error`：子进程报告的任何错误消息。
- `Exit Code`：命令的退出代码。
- `Signal`：如果命令被信号终止，则为信号编号。
- `Background PIDs`：已启动的任何后台进程的 PID 列表。

用法：

```
run_shell_command(command="您的命令。", description="您对命令的描述。", directory="您的执行目录。")
```

## `run_shell_command` 示例

列出当前目录中的文件：

```
run_shell_command(command="ls -la")
```

在特定目录中运行脚本：

```
run_shell_command(command="./my_script.sh", directory="scripts", description="运行我的自定义脚本")
```

启动后台服务器：

```
run_shell_command(command="npm run dev &", description="在后台启动开发服务器")
```

## 重要注意事项

- **安全性：** 执行命令时要小心，特别是那些由用户输入构建的命令，以防止安全漏洞。
- **交互式命令：** 避免需要交互式用户输入的命令，因为这可能导致工具挂起。如果可用，请使用非交互式标志（例如，`npm init -y`）。
- **错误处理：** 检查 `Stderr`、`Error` 和 `Exit Code` 字段以确定命令是否成功执行。
- **后台进程：** 当命令在后台使用 `&` 运行时，工具将立即返回，进程将继续在后台运行。`Background PIDs` 字段将包含后台进程的进程 ID。

## 环境变量

当 `run_shell_command` 执行命令时，它会在子进程的环境中设置 `GEMINI_CLI=1` 环境变量。这允许脚本或工具检测它们是否正在从 Gemini CLI 内部运行。

## 命令限制

您可以使用配置文件中的 `coreTools` 和 `excludeTools` 设置来限制 `run_shell_command` 工具可以执行的命令。

- `coreTools`：要将 `run_shell_command` 限制为一组特定的命令，请以 `run_shell_command(<command>)` 格式将条目添加到 `coreTools` 列表。例如，`"coreTools": ["run_shell_command(git)"]` 将只允许 `git` 命令。包含通用 `run_shell_command` 充当通配符，允许任何未明确阻止的命令。
- `excludeTools`：要阻止特定命令，请以 `run_shell_command(<command>)` 格式将条目添加到 `excludeTools` 列表。例如，`"excludeTools": ["run_shell_command(rm)"]` 将阻止 `rm` 命令。

验证逻辑设计为安全且灵活：

1.  **禁用命令链**：该工具会自动拆分使用 `&&`、`||` 或 `;` 链接的命令，并分别验证每个部分。如果链的任何部分不允许，则整个命令将被阻止。
2.  **前缀匹配**：该工具使用前缀匹配。例如，如果您允许 `git`，则可以运行 `git status` 或 `git log`。
3.  **黑名单优先**：`excludeTools` 列表始终首先检查。如果命令匹配被阻止的前缀，即使它也匹配 `coreTools` 中的允许前缀，它也将被拒绝。

### 命令限制示例

**仅允许特定命令前缀**

要仅允许 `git` 和 `npm` 命令，并阻止所有其他命令：

```json
{
  "coreTools": ["run_shell_command(git)", "run_shell_command(npm)"]
}
```

- `git status`：允许
- `npm install`：允许
- `ls -l`：阻止

**阻止特定命令前缀**

要阻止 `rm` 并允许所有其他命令：

```json
{
  "coreTools": ["run_shell_command"],
  "excludeTools": ["run_shell_command(rm)"]
}
```

- `rm -rf /`：阻止
- `git status`：允许
- `npm install`：允许

**黑名单优先**

如果命令前缀同时在 `coreTools` 和 `excludeTools` 中，它将被阻止。

```json
{
  "coreTools": ["run_shell_command(git)"],
  "excludeTools": ["run_shell_command(git push)"]
}
```

- `git push origin main`：阻止
- `git status`：允许

**阻止所有 shell 命令**

要阻止所有 shell 命令，请将 `run_shell_command` 通配符添加到 `excludeTools`：

```json
{
  "excludeTools": ["run_shell_command"]
}
```

- `ls -l`：阻止
- `任何其他命令`：阻止

## `excludeTools` 的安全说明

`excludeTools` 中 `run_shell_command` 的命令特定限制基于简单的字符串匹配，并且可以轻松绕过。此功能**不是安全机制**，不应依赖它来安全地执行不受信任的代码。建议使用 `coreTools` 明确选择可以执行的命令。
