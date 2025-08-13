# 主题

Gemini CLI 支持各种主题，以自定义其配色方案和外观。您可以通过 `/theme` 命令或 `"theme":` 配置设置更改主题以适应您的偏好。

## 可用主题

Gemini CLI 附带了一系列预定义主题，您可以使用 Gemini CLI 中的 `/theme` 命令列出它们：

- **深色主题：**
  - `ANSI`
  - `Atom One`
  - `Ayu`
  - `Default`
  - `Dracula`
  - `GitHub`
- **浅色主题：**
  - `ANSI Light`
  - `Ayu Light`
  - `Default Light`
  - `GitHub Light`
  - `Google Code`
  - `Xcode`

### 更改主题

1.  在 Gemini CLI 中输入 `/theme`。
2.  出现一个对话框或选择提示，列出可用主题。
3.  使用箭头键选择一个主题。某些界面可能会在您选择时提供实时预览或突出显示。
4.  确认您的选择以应用主题。

### 主题持久性

选定的主题保存在 Gemini CLI 的 [配置](./configuration.md) 中，以便您的偏好在会话之间记住。

---

## 自定义颜色主题

Gemini CLI 允许您通过在 `settings.json` 文件中指定自定义颜色主题来创建自己的主题。这使您可以完全控制 CLI 中使用的调色板。

### 如何定义自定义主题

将 `customThemes` 块添加到您的用户、项目或系统 `settings.json` 文件中。每个自定义主题都定义为一个对象，具有唯一的名称和一组颜色键。例如：

```json
{
  "customThemes": {
    "MyCustomTheme": {
      "name": "MyCustomTheme",
      "type": "custom",
      "Background": "#181818",
      "Foreground": "#F8F8F2",
      "LightBlue": "#82AAFF",
      "AccentBlue": "#61AFEF",
      "AccentPurple": "#C678DD",
      "AccentCyan": "#56B6C2",
      "AccentGreen": "#98C379",
      "AccentYellow": "#E5C07B",
      "AccentRed": "#E06C75",
      "Comment": "#5C6370",
      "Gray": "#ABB2BF",
      "DiffAdded": "#A6E3A1",
      "DiffRemoved": "#F38BA8",
      "DiffModified": "#89B4FA",
      "GradientColors": ["#4796E4", "#847ACE", "#C3677F"]
    }
  }
}
```

**颜色键：**

- `Background`
- `Foreground`
- `LightBlue`
- `AccentBlue`
- `AccentPurple`
- `AccentCyan`
- `AccentGreen`
- `AccentYellow`
- `AccentRed`
- `Comment`
- `Gray`
- `DiffAdded` (可选，用于差异中添加的行)
- `DiffRemoved` (可选，用于差异中删除的行)
- `DiffModified` (可选，用于差异中修改的行)

**必需属性：**

- `name` (必须与 `customThemes` 对象中的键匹配，并且是字符串)
- `type` (必须是字符串 `"custom"`)
- `Background`
- `Foreground`
- `LightBlue`
- `AccentBlue`
- `AccentPurple`
- `AccentCyan`
- `AccentGreen`
- `AccentYellow`
- `AccentRed`
- `Comment`
- `Gray`

您可以对任何颜色值使用十六进制代码（例如，`#FF0000`）**或**标准 CSS 颜色名称（例如，`coral`、`teal`、`blue`）。有关支持名称的完整列表，请参阅 [CSS 颜色名称](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#color_keywords)。

您可以通过向 `customThemes` 对象添加更多条目来定义多个自定义主题。

### 自定义主题示例

<img src="../assets/theme-custom.png" alt="Custom theme example" width="600" />

### 使用您的自定义主题

- 使用 Gemini CLI 中的 `/theme` 命令选择您的自定义主题。您的自定义主题将出现在主题选择对话框中。
- 或者，通过将 `"theme": "MyCustomTheme"` 添加到您的 `settings.json` 中将其设置为默认值。
- 自定义主题可以在用户、项目或系统级别设置，并遵循与其他设置相同的 [配置优先级](./configuration.md)。

---

## 深色主题

### ANSI

<img src="../assets/theme-ansi.png" alt="ANSI theme" width="600" />

### Atom OneDark

<img src="../assets/theme-atom-one.png" alt="Atom One theme" width="600">

### Ayu

<img src="../assets/theme-ayu.png" alt="Ayu theme" width="600">

### Default

<img src="../assets/theme-default.png" alt="Default theme" width="600">

### Dracula

<img src="../assets/theme-dracula.png" alt="Dracula theme" width="600">

### GitHub

<img src="../assets/theme-github.png" alt="GitHub theme" width="600">

## 浅色主题

### ANSI Light

<img src="../assets/theme-ansi-light.png" alt="ANSI Light theme" width="600">

### Ayu Light

<img src="../assets/theme-ayu-light.png" alt="Ayu Light theme" width="600">

### Default Light

<img src="../assets/theme-default-light.png" alt="Default Light theme" width="600">

### GitHub Light

<img src="../assets/theme-github-light.png" alt="GitHub Light theme" width="600">

### Google Code

<img src="../assets/theme-google-light.png" alt="Google Code theme" width="600">

### Xcode

<img src="../assets/theme-xcode-light.png" alt="Xcode Light theme" width="600">
