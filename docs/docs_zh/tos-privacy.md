# Gemini CLI：服务条款和隐私声明

Gemini CLI 是一个开源工具，可让您直接从命令行界面与 Google 强大的语言模型进行交互。适用于您使用 Gemini CLI 的服务条款和隐私声明取决于您用于向 Google 进行身份验证的帐户类型。

本文概述了适用于不同帐户类型和身份验证方法的具体条款和隐私政策。注意：有关适用于您使用 Gemini CLI 的配额和定价详细信息，请参阅 [配额和定价](./quota-and-pricing.md)。

## 如何确定您的身份验证方法

您的身份验证方法是指您用于登录和访问 Gemini CLI 的方法。有四种身份验证方式：

- 使用您的 Google 帐户登录 Gemini Code Assist for Individuals
- 使用您的 Google 帐户登录 Gemini Code Assist for Workspace、Standard 或 Enterprise 用户
- 将 API 密钥与 Gemini Developer 结合使用
- 将 API 密钥与 Vertex AI GenAI API 结合使用

对于这四种身份验证方法中的每一种，可能适用不同的服务条款和隐私声明。

| 身份验证                          | 帐户      | 服务条款                                                                                   | 隐私声明                                                                                                                                                                     |
| :-------------------------------- | :-------- | :----------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 通过 Google 的 Gemini Code Assist | 个人      | [Google 服务条款](https://policies.google.com/terms?hl=en-US)                              | [Gemini Code Assist 个人隐私声明](https://developers.google.com/gemini-code-assist/resources/privacy-notice-gemini-code-assist-individuals)                                  |
| 通过 Google 的 Gemini Code Assist | 标准/企业 | [Google Cloud Platform 服务条款](https://cloud.google.com/terms)                           | [Gemini Code Assist 标准版和企业版隐私声明](https://cloud.google.com/gemini/docs/codeassist/security-privacy-compliance#standard_and_enterprise_data_protection_and_privacy) |
| Gemini Developer API              | 未付费    | [Gemini API 服务条款 - 未付费服务](https://ai.google.dev/gemini-api/terms#unpaid-services) | [Google 隐私政策](https://policies.google.com/privacy)                                                                                                                       |
| Gemini Developer API              | 已付费    | [Gemini API 服务条款 - 已付费服务](https://ai.google.dev/gemini-api/terms#paid-services)   | [Google 隐私政策](https://policies.google.com/privacy)                                                                                                                       |
| Vertex AI Gen API                 |           | [Google Cloud Platform 服务条款](https://cloud.google.com/terms/service-terms/)            | [Google Cloud 隐私声明](https://cloud.google.com/terms/cloud-privacy-notice)                                                                                                 |

## 1. 如果您已使用 Google 帐户登录 Gemini Code Assist for Individuals

对于使用其 Google 帐户访问 [Gemini Code Assist for Individuals](https://developers.google.com/gemini-code-assist/docs/overview#supported-features-gca) 的用户，适用以下服务条款和隐私声明文档：

- **服务条款：** 您对 Gemini CLI 的使用受 [Google 服务条款](https://policies.google.com/terms?hl=en-US) 的约束。
- **隐私声明：** 您的数据收集和使用在 [Gemini Code Assist 个人隐私声明](https://developers.google.com/gemini-code-assist/resources/privacy-notice-gemini-code-assist-individuals) 中进行了描述。

## 2. 如果您已使用 Google 帐户登录 Gemini Code Assist for Workspace、Standard 或 Enterprise 用户

对于使用其 Google 帐户访问 Gemini Code Assist [标准版或企业版](https://cloud.google.com/gemini/docs/codeassist/overview#editions-overview) 的用户，适用以下服务条款和隐私声明文档：

- **服务条款：** 您对 Gemini CLI 的使用受 [Google Cloud Platform 服务条款](https://cloud.google.com/terms) 的约束。
- **隐私声明：** 您的数据收集和使用在 [Gemini Code Assist 标准版和企业版隐私声明](https://cloud.google.com/gemini/docs/codeassist/security-privacy-compliance#standard_and_enterprise_data_protection_and_privacy) 中进行了描述。

## 3. 如果您已使用 Gemini API 密钥登录 Gemini Developer API

如果您使用 Gemini API 密钥通过 [Gemini Developer API](https://ai.google.dev/gemini-api/docs) 进行身份验证，则适用以下服务条款和隐私声明文档：

- **服务条款：** 您对 Gemini CLI 的使用受 [Gemini API 服务条款](https://ai.google.dev/gemini-api/terms) 的约束。这些条款可能因您使用的是未付费服务还是已付费服务而异：
  - 对于未付费服务，请参阅 [Gemini API 服务条款 - 未付费服务](https://ai.google.dev/gemini-api/terms#unpaid-services)。
  - 对于已付费服务，请参阅 [Gemini API 服务条款 - 已付费服务](https://ai.google.dev/gemini-api/terms#paid-services)。
- **隐私声明：** 您的数据收集和使用在 [Google 隐私政策](https://policies.google.com/privacy) 中进行了描述。

## 4. 如果您已使用 Gemini API 密钥登录 Vertex AI GenAI API

如果您使用 Gemini API 密钥通过 [Vertex AI GenAI API](https://cloud.google.com/vertex-ai/generative-ai/docs/reference/rest) 后端进行身份验证，则适用以下服务条款和隐私声明文档：

- **服务条款：** 您对 Gemini CLI 的使用受 [Google Cloud Platform 服务条款](https://cloud.google.com/terms/service-terms/) 的约束。
- **隐私声明：** 您的数据收集和使用在 [Google Cloud 隐私声明](https://cloud.google.com/terms/cloud-privacy-notice) 中进行了描述。

### 使用情况统计信息选择退出

您可以按照此处提供的说明选择退出向 Google 发送使用情况统计信息：[使用情况统计信息配置](./cli/configuration.md#usage-statistics)。

## Gemini CLI 常见问题 (FAQ)

### 1. 我的代码（包括提示和答案）是否用于训练 Google 的模型？

您的代码（包括提示和答案）是否用于训练 Google 的模型取决于您使用的身份验证方法和帐户类型。

默认情况下（如果您未选择退出）：

- **使用 Google 帐户的 Gemini Code Assist for Individuals**：是。当您使用个人 Google 帐户时，适用 [Gemini Code Assist 个人隐私声明](https://developers.google.com/gemini-code-assist/resources/privacy-notice-gemini-code-assist-individuals) 条款。根据此声明，您的**提示、答案和相关代码将被收集**，并可能用于改进 Google 的产品，包括用于模型训练。
- **使用 Google 帐户的 Gemini Code Assist for Workspace、Standard 或 Enterprise**：否。对于这些帐户，您的数据受 [Gemini Code Assist 隐私声明](https://cloud.google.com/gemini/docs/codeassist/security-privacy-compliance#standard_and_enterprise_data_protection_and_privacy) 条款的约束，这些条款将您的输入视为机密。您的**提示、答案和相关代码不会被收集**，也不会用于训练模型。
- **通过 Gemini Developer API 使用 Gemini API 密钥**：您的代码是否被收集或使用取决于您使用的是未付费服务还是已付费服务。
  - **未付费服务**：是。当您通过 Gemini Developer API 使用 Gemini API 密钥并使用未付费服务时，适用 [Gemini API 服务条款 - 未付费服务](https://ai.google.dev/gemini-api/terms#unpaid-services) 条款。根据此声明，您的**提示、答案和相关代码将被收集**，并可能用于改进 Google 的产品，包括用于模型训练。
  - **已付费服务**：否。当您通过 Gemini Developer API 使用 Gemini API 密钥并使用已付费服务时，适用 [Gemini API 服务条款 - 已付费服务](https://ai.google.dev/gemini-api/terms#paid-services) 条款，这些条款将您的输入视为机密。您的**提示、答案和相关代码不会被收集**，也不会用于训练模型。
- **通过 Vertex AI GenAI API 使用 Gemini API 密钥**：否。对于这些帐户，您的数据受 [Google Cloud 隐私声明](https://cloud.google.com/terms/cloud-privacy-notice) 条款的约束，这些条款将您的输入视为机密。您的**提示、答案和相关代码不会被收集**，也不会用于训练模型。

有关选择退出的更多信息，请参阅下一个问题。

### 2. 什么是使用情况统计信息，以及选择退出控制什么？

**使用情况统计信息**设置是 Gemini CLI 中所有可选数据收集的单一控制。

它收集的数据取决于您的帐户和身份验证类型：

- **使用 Google 帐户的 Gemini Code Assist for Individuals**：启用此设置后，Google 可以收集匿名遥测数据（例如，运行的命令和性能指标）以及**您的提示和答案，包括代码**，以改进模型。
- **使用 Google 帐户的 Gemini Code Assist for Workspace、Standard 或 Enterprise**：此设置仅控制匿名遥测数据的收集。您的提示和答案（包括代码）永远不会被收集，无论此设置如何。
- **通过 Gemini Developer API 使用 Gemini API 密钥**：
  **未付费服务**：启用此设置后，Google 可以收集匿名遥测数据（例如，运行的命令和性能指标）以及**您的提示和答案，包括代码**，以改进模型。禁用时，我们将按照 [Google 如何使用您的数据](https://ai.google.dev/gemini-api/terms#data-use-unpaid) 中的描述使用您的数据。
  **已付费服务**：此设置仅控制匿名遥测数据的收集。Google 会在有限的时间内记录提示和响应，仅用于检测违反禁止使用政策的行为以及任何必要的法律或监管披露。
- **通过 Vertex AI GenAI API 使用 Gemini API 密钥**：此设置仅控制匿名遥测数据的收集。您的提示和答案（包括代码）永远不会被收集，无论此设置如何。

有关收集哪些数据以及如何使用这些数据的更多信息，请参阅适用于您的身份验证方法的隐私声明。

您可以通过遵循 [使用情况统计信息配置](./cli/configuration.md#usage-statistics) 文档中的说明，为任何帐户类型禁用使用情况统计信息。
