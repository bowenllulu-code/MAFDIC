# MAFDIC

MAFDIC 全称为 **Multi-Agent Fund Distribution Insight Claw**。

MAFDIC 是一个面向机构投资者运营场景的基金代销运营系统。它采用 claw 化、多 Agent 协同的产品形态，覆盖运营工作台、客户全景、交易与资产、风险异常、经营分析、运营配置、商机归因、AI 助手和真实 API 接入准备等能力。

## 目标用户

- 基金代销专职运营人员
- 清算、配置、风控、销售运营等业务角色
- 高层管理者和经营决策人员
- 数据、报表、系统集成和智能运营相关负责人

## 当前能力

- 综合工作台：运营指标、待办、异常、AI 建议和操作队列
- 客户全景：客户资产、收入、持仓、交易、商机和风险联动
- 交易与资产：交易查询、确认状态、客户上下文和资产归因
- 风险异常：风险事件、命中规则、关联客户和关联订单
- 经营分析：客户贡献、商机归因收入、报表模板、指标口径
- 运营配置：垫资配置、垫资行、孳息规则、费用规则、风控规则
- 配置治理：校验结果、审批流、版本记录、审计记录和回滚预览
- 商机归因：商机、交易、收入、费用和净贡献追踪
- AI 助手：动作预览、Agent 任务编排、Agent 治理边界和审计记录
- 报表治理：报表模板、生成历史、定时推送、安全边界和指标版本
- 权限角色：运营岗、清算岗、配置岗、风控岗、管理者、系统管理员
- Mock API：模块化查询、分页、筛选、加载态、错误态和 trace id
- API 接入准备：接口模块、字段映射、性能风险、BFF 边界和切换计划

## 产品原则

MAFDIC 优先追求运营可信度。所有会改变配置、创建任务、发送通知、导出敏感数据或影响业务状态的自动化动作，都必须可预览、可审批、可审计、可回滚。

AI Agent 只能在授权边界内生成解释、草稿、预览和建议，不能绕过人工审批或直接产生外部影响。

## 技术栈

- React
- TypeScript
- Vite
- Lucide React
- ESLint

当前版本以本地 Mock API 和领域模型为主，真实业务 API 接入前通过 Adapter / BFF 边界隔离外部字段差异。

## 本地开发

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

指定本地访问地址：

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

构建验证：

```bash
npm run build
```

代码检查：

```bash
npm run lint
```

## API 模式

当前前端支持三种数据源模式：

- `Mock`：全部使用本地 Mock API
- `Hybrid`：用于后续模块级真实 API 灰度接入，目前仍回退 Mock 数据
- `Real`：真实 API 占位模式；未配置真实地址和凭证时会返回 `REAL_API_NOT_CONFIGURED`

真实 API 接入时建议通过 MAFDIC BFF / Backend Adapter 处理字段标准化、权限过滤、分页筛选下推、缓存、聚合和预计算，前端只做轻量展示映射。

## 文档

- [产品方案](docs/product-solution.md)
- [产品蓝图](docs/product-blueprint.md)
- [架构草案](docs/architecture.md)
- [路线图](docs/roadmap.md)
- [MVP 计划](docs/mvp-plan.md)
- [信息架构](docs/information-architecture.md)
- [领域模型草案](docs/domain-model.md)
- [API Adapter 契约](docs/api-adapter-contracts.md)
- [数据接入性能策略](docs/integration-performance-strategy.md)
- [配置治理](docs/config-governance.md)
- [Agent 治理](docs/agent-governance.md)
- [报表治理](docs/report-governance.md)
- [API 切换策略](docs/api-switching-strategy.md)

## 仓库状态

项目已经具备可运行的 React + TypeScript 运营控制台原型，并持续围绕真实 API 接入前的产品、权限、治理、审计、BFF 性能边界和联调准备进行迭代。
