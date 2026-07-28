# EdgeSub-Simple

Cloudflare Pages 订阅聚合服务。极简实现：聚合 → 清洗 → 重命名 → 输出。

## 部署

1. Fork 仓库
2. Cloudflare Pages 连接仓库
3. 设置环境变量
4. 部署

## 环境变量

| 变量 | 必填 | 说明 | 默认值 |
|------|------|------|--------|
| `SUB_PATH` | ✅ | 订阅路径（如 `sub`） | — |
| `SUB_TOKEN` | — | 访问令牌，留空不鉴权 | — |
| `NODES` | — | 内嵌节点链接，一行一个 | — |
| `NODES_URL` | — | 远程订阅地址，空格/换行分隔多个 | — |
| `FILTER` | — | 节点名关键词过滤（空格分隔，仅保留匹配项） | — |
| `SUB_TITLE` | — | 订阅标题 | `EdgeSub` |
| `REGIONS_JSON` | — | 自定义地域规则（JSON 数组，优先级高于内置） | — |
| `DNS_REMOTE_SERVER` | — | sing-box 远程 DNS 服务器域名 | `dns.google` |
| `DNS_DIRECT_SERVER` | — | sing-box 直连 DNS 服务器地址 | `223.5.5.5` |
| `TUN_INTERFACE_NAME` | — | TUN 网卡接口名 | `tun0` |

## 使用

方式一（推荐，Header 鉴权）：
```
curl -H "Authorization: Bearer TOKEN" https://你的域名/SUB_PATH
```

方式二（URL 参数鉴权）：
```
https://你的域名/SUB_PATH?token=你的TOKEN
```

> 提示：推荐使用 Authorization 头传 Token，避免 URL 中暴露密钥。

## UA 路由

| User-Agent 关键字 | 输出格式 | 支持协议 |
|---|---|---|
| `shadowrocket` | Base64 | VLESS、Hysteria2、AnyTLS |
| `v2rayn` | Base64 | VLESS、Hysteria2、AnyTLS |
| `v2rayng` | Base64 | VLESS、Hysteria2、AnyTLS |
| `sing-box` / `sfa` / `sfi` / `sfm` | JSON（完整 sing-box 配置） | VLESS、Hysteria2、AnyTLS |

未匹配关键字 → Base64（兜底）。

## 支持协议

- **VLESS** — Reality (Vision) / XHTTP / WebSocket+TLS / gRPC+TLS / HTTPUpgrade / H2
- **Hysteria2** — UDP + TLS（支持混淆、限速、端口跳跃）
- **AnyTLS** — Reality / TLS

## sing-box JSON 输出结构

```
出站 ─┬─ direct（直连）
      ├─ 节点 1 … 节点 N
      └─ 🔰 节点选择（Selector，含所有节点，默认第一个）
```

含 TUN、DNS（直连/远程/FakeIP）、路由（私网直连、其余走 Selector）。

## 自定义地域（REGIONS_JSON）

```json
[
  {"code":"CUSTOM","name":"自定义","flag":"🏷️","order":5,"kw":["自定义","Custom"]}
]
```

- `code`：地区代码（唯一）
- `name`：显示名称
- `flag`：Emoji 旗帜
- `order`：排序优先级（数值越小越靠前）
- `kw`：匹配关键词数组（短代码精确匹配、长关键词包含匹配、Emoji 直接匹配）

## 许可证

MIT