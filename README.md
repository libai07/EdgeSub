# EdgeSub

Cloudflare Pages 订阅聚合服务，根据 UA 自动路由输出，节点自动归类重命名。

## 部署

Fork 本仓库，Cloudflare Pages 连接，添加环境变量后重新部署：

| 变量 | 必填 | 说明 | 默认值 |
| --- | --- | --- | --- |
| `SUB_PATH` | ✅ | 访问路径 | — |
| `SUB_TOKEN` | — | 访问令牌，留空不鉴权 | — |
| `NODES` | — | 节点链接，一行一个 | — |
| `NODES_URL` | — | 远程订阅地址，空格/换行分隔 | — |
| `FILTER` | — | 按节点名关键字过滤（空格分隔，仅包含） | — |
| `SUB_TITLE` | — | 订阅标题 | `EdgeSub · N nodes` |
| `LOG_LEVEL` | — | debug / info（默认）/ warn / error | `info` |
| `SPEED_TEST_INTERVAL` | — | sing-box 自动测速间隔（如 `5m`、`10m`、`30m`） | `10m` |

## 使用

```
https://你的域名/SUB_PATH?token=你的TOKEN
```

认证：`?token=` / `?key=` / `Authorization: Bearer <TOKEN>`

## UA 路由

| UA | 输出 | 支持协议 |
|---|---|---|
| `shadowrocket` | Base64 | VLESS、Hysteria2、AnyTLS |
| `v2rayn` | Base64 | VLESS、Hysteria2、AnyTLS |
| `v2rayng` | Base64 | VLESS、Hysteria2 |
| `sing-box` / `sfa/` / `sfi/` / `sfm/` | JSON（完整 sing-box 配置） | VLESS、Hysteria2、AnyTLS |

未匹配 → 404。

## 支持协议

本项目 **仅支持以下三大协议及其全部传输/加密组合**（其它协议均不解析、不输出）：

- **VLESS** — TCP Reality (Vision) / XHTTP Reality / WS+TLS / gRPC+TLS
- **Hysteria2** — UDP + TLS（支持混淆/限速/端口跳跃）
- **AnyTLS** — Reality / TLS

## 核心能力

### sing-box JSON：标准 5 层架构

| 层级 | 标签 | 类型 | 关键参数 |
|------|------|------|----------|
| 总控层 | 🔰 节点选择 | Select | 默认 → 🔮 故障转移 |
| 策略层 | 🔮 故障转移 | Fallback | `interval: 3600`、`lazy: true`，主力+备用 |
| 业务层 | 🤖 AI 服务 | Select | 默认主力，含故障转移+所有节点 |
| 业务层 | 🎬 国际媒体 | Select | 默认故障转移 |
| 兜底层 | 🐟 漏网之鱼 | Select | 默认 DIRECT，含总控层 |

**路由规则（严格顺序）：**

1. AI 规则（置顶） → `domain_keyword: openai,anthropic,claude` → 🤖 AI 服务
2. 国际媒体规则 → `domain_keyword: youtube,netflix,googlevideo,ytimg` → 🎬 国际媒体
3. 国内直连规则 → `ip_cidr(LAN) + geoip:cn` → DIRECT
4. 兜底规则（最后） → MATCH → 🐟 漏网之鱼 (default: DIRECT)

**分组：** 保留 `🌏 地区` 选择器供手动切换。

**环境变量：** `SPEED_TEST_INTERVAL` 自定义自动测速间隔（默认 `10m`，可改 `5m`/`30m`）。

### 节点处理

- 自动剔除含流量/到期关键词的通知节点
- 按 `FILTER` 关键字包含过滤（空格分隔，仅包含，无排除）
- 自动识别 26 个区域并按区域排序（重命名为 `地区 序号`，如 `台湾 1`、`香港 1`）
- 远程订阅视为 Base64 抓取，自动解码
- SSRF 防护（拦截内网/回环/元数据地址）

### 客户端输出差异

| 客户端 | 格式 | 分组/策略 |
|--------|------|-----------|
| Shadowrocket / v2rayN / v2rayNG | Base64 订阅链接 | 纯链接列表，依赖客户端原生解析 |
| sing-box / sfa / sfi / sfm | JSON 完整配置 | 完整 5 层策略 + 地区分组 + 路由规则 |

## 部署

Fork 本仓库，Cloudflare Pages 连接，添加环境变量后重新部署：

| 变量 | 必填 | 说明 | 默认值 |
| --- | --- | --- | --- |
| `SUB_PATH` | ✅ | 访问路径 | — |
| `SUB_TOKEN` | — | 访问令牌，留空不鉴权 | — |
| `NODES` | — | 节点链接，一行一个 | — |
| `NODES_URL` | — | 远程订阅地址，空格/换行分隔 | — |
| `FILTER` | — | 按节点名关键字过滤（空格分隔，仅包含） | — |
| `SUB_TITLE` | — | 订阅标题 | `EdgeSub · N nodes` |
| `LOG_LEVEL` | — | debug / info（默认）/ warn / error | `info` |
| `SPEED_TEST_INTERVAL` | — | sing-box 自动测速间隔（如 `5m`、`10m`、`30m`） | `10m` |

## 使用

```
https://你的域名/SUB_PATH?token=你的TOKEN
```

认证：`?token=` / `?key=` / `Authorization: Bearer <TOKEN>`

## UA 路由

| UA | 输出 | 支持协议 |
|---|---|---|
| `shadowrocket` | Base64 | VLESS、Hysteria2、AnyTLS |
| `v2rayn` | Base64 | VLESS、Hysteria2、AnyTLS |
| `v2rayng` | Base64 | VLESS、Hysteria2 |
| `sing-box` / `sfa/` / `sfi/` / `sfm/` | JSON（完整 sing-box 配置） | VLESS、Hysteria2、AnyTLS |

未匹配 → 404。

## 支持协议

本项目 **仅支持以下三大协议及其全部传输/加密组合**（其它协议均不解析、不输出）：

- **VLESS** — TCP Reality (Vision) / XHTTP Reality / WS+TLS / gRPC+TLS
- **Hysteria2** — UDP + TLS（支持混淆/限速/端口跳跃）
- **AnyTLS** — Reality / TLS

## 节点处理

- 自动剔除含流量/到期关键词的通知节点
- 按 `FILTER` 关键字包含过滤（空格分隔，仅包含，无排除）
- 自动识别 26 个区域并按区域排序（重命名为 `地区 序号`，如 `台湾 1`、`香港 1`）
- 远程订阅视为 Base64 抓取，自动解码
- SSRF 防护（拦截内网/回环/元数据地址）

## 客户端输出差异

| 客户端 | 格式 | 分组/策略 |
|--------|------|-----------|
| Shadowrocket / v2rayN / v2rayNG | Base64 订阅链接 | 纯链接列表，依赖客户端原生解析 |
| sing-box / sfa / sfi / sfm | JSON 完整配置 | 完整 5 层策略 + 地区分组 + 路由规则 |

## LICENSE

MIT