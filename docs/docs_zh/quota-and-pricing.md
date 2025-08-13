# 配额和定价

本文档提供有关 Gemini API 的配额和定价信息。

## 配额

Gemini API 的默认配额为每分钟 60 个请求 (RPM)。此配额应用于每个 Google Cloud 项目，并由使用该项目的所有应用程序和 IP 地址共享。

如果您超出此配额，您的请求将被限制，并且您将收到 `429 RESOURCE_EXHAUSTED` 错误。

### 增加您的配额

如果您需要更多配额，可以通过 Google Cloud Console 请求增加。

1.  转到 Google Cloud Console 中的 [配额页面](https://console.cloud.google.com/iam-admin/quotas)。
2.  在 **Filter table** 字段中，搜索 `Gemini API`。
3.  选中 `Generative Language API` 配额旁边的复选框。
4.  单击 **EDIT QUOTAS** 按钮。
5.  填写表单以请求增加配额。

您的请求将由 Google Cloud 团队审核。如果获得批准，配额增加将应用于您的项目。

## 定价

Gemini API 目前免费使用，最高可达 60 RPM。这意味着您不会因在此配额内的任何请求而被收费。

如果您超出免费层级配额，将根据 [Gemini API 定价页面](https://ai.google.dev/pricing) 向您收取使用费。

### 定价示例

假设您的项目每分钟向 Gemini API 发出 100 个请求。

- 每分钟的前 60 个请求是免费的。
- 剩余的每分钟 40 个请求将按标准费率收费。

例如，如果标准费率为每个请求 0.001 美元，则您的费用将为：

`40 请求/分钟 * 0.001 美元/请求 = 0.04 美元/分钟`

这将是您超出免费层级配额的费用。

**注意：** 定价可能会发生变化。请始终参考 [Gemini API 定价页面](https://ai.google.dev/pricing) 以获取最新信息。
