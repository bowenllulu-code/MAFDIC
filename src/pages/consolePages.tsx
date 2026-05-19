import {
  ArrowRight,
  Banknote,
  Bot,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ClipboardList,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { buildEmailPreview, buildReportPreview, buildScheduledTaskPreview } from "../actionPreviews";
import { DataTable, MetricGrid, OperationQueue, PageHeader, StatusBadge, TextButton } from "../components/common";
import { statusLabel } from "../constants";
import type { ActionPreview, AgentTask, OperationRecord, PageId } from "../domain";
import { formatMoney } from "../mockData";
import { mockProvider } from "../mockProvider";

const metrics = mockProvider.getMetrics();
const customers = mockProvider.getCustomers();
const orders = mockProvider.getOrders();
const holdings = mockProvider.getHoldings();
const risks = mockProvider.getRiskEvents();
const opportunities = mockProvider.getOpportunities();
const configs = mockProvider.getConfigItems();
const tasks = mockProvider.getTasks();
const assistantActions = mockProvider.getAssistantActions();
const reportTemplates = mockProvider.getReportTemplates();
const metricDefinitions = mockProvider.getMetricDefinitions();
const opportunityAttributions = mockProvider.getOpportunityAttributions();
const agentTasks = mockProvider.getAgentTasks();

export function WorkspacePage({ jump, operationRecords }: { jump: (page: PageId) => void; operationRecords: OperationRecord[] }) {
  return (
    <>
      <PageHeader
        eyebrow="MAFDIC / Operations"
        title="综合工作台"
        description="汇总今日运营状态、异常、报表、配置和 AI 建议，作为运营人员与管理者的统一入口。"
      />
      <MetricGrid metrics={metrics} />
      <div className="content-grid">
        <section className="panel span-7">
          <div className="panel-title">
            <h2>待办与异常</h2>
            <button className="icon-button" title="筛选">
              <SlidersHorizontal size={18} />
            </button>
          </div>
          <div className="list">
            {tasks.map((task) => (
              <button className="row-button" key={task.id} onClick={() => jump("risks")}>
                <div>
                  <strong>{task.title}</strong>
                  <span>{task.owner} · 截止 {task.dueAt}</span>
                </div>
                <span className={`priority priority-${task.priority}`}>{task.priority}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="panel span-5">
          <div className="panel-title">
            <h2>AI 建议</h2>
            <Bot size={18} />
          </div>
          <div className="assistant-suggestions">
            {assistantActions.slice(0, 3).map((action) => (
              <button key={action.id} onClick={() => jump("assistant")}>
                <span>{action.type}</span>
                <strong>{action.title}</strong>
              </button>
            ))}
          </div>
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>任务与审批队列</h2>
            <button className="icon-button" title="查看 AI 助手" onClick={() => jump("assistant")}>
              <Bot size={18} />
            </button>
          </div>
          <OperationQueue records={operationRecords} />
        </section>
      </div>
    </>
  );
}

export function CustomersPage({
  selectedCustomerId,
  setSelectedCustomerId,
  openOrder,
  openOpportunity,
  openRisk,
  jump,
}: {
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  openOrder: (id: string) => void;
  openOpportunity: (id: string) => void;
  openRisk: (id: string) => void;
  jump: (page: PageId) => void;
}) {
  const selected = customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0];
  const selectedHoldings = holdings.filter((holding) => holding.customerId === selected.id);
  const selectedOrders = orders.filter((order) => order.customerId === selected.id);
  const selectedOpportunities = opportunities.filter((opportunity) => opportunity.customerId === selected.id);
  const selectedRisks = risks.filter((risk) => risk.relatedCustomerId === selected.id);

  return (
    <>
      <PageHeader
        eyebrow="Customer 360"
        title="客户全景图"
        description="围绕机构客户聚合账户、交易、持仓、收益、商机和风险，支撑客户维度下钻。"
      />
      <div className="content-grid">
        <section className="panel span-4">
          <div className="panel-title">
            <h2>机构客户</h2>
            <Search size={18} />
          </div>
          <div className="customer-list">
            {customers.map((customer) => (
              <button
                className={customer.id === selected.id ? "selected" : ""}
                key={customer.id}
                onClick={() => setSelectedCustomerId(customer.id)}
              >
                <strong>{customer.shortName}</strong>
                <span>{customer.relationshipManager} · {customer.riskLevel}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="panel span-8">
          <div className="profile-header">
            <div>
              <span className="eyebrow">当前客户</span>
              <h2>{selected.name}</h2>
            </div>
            <StatusBadge status={selected.status} />
          </div>
          <div className="mini-metrics">
            <div><span>资产规模</span><strong>{formatMoney(selected.totalAsset)}</strong></div>
            <div><span>年内收入</span><strong>{formatMoney(selected.revenueYtd)}</strong></div>
            <div><span>标签</span><strong>{selected.tags.join(" / ")}</strong></div>
          </div>
          <div className="quick-actions">
            <button onClick={() => jump("transactions")}>查看交易资产 <ArrowRight size={15} /></button>
            <button onClick={() => jump("opportunities")}>查看商机归因 <ArrowRight size={15} /></button>
            <button onClick={() => jump("risks")}>查看风险异常 <ArrowRight size={15} /></button>
          </div>
          <DataTable
            columns={["基金", "份额", "市值", "浮盈亏"]}
            rows={selectedHoldings.map((holding) => [
              holding.fundName,
              holding.shares.toLocaleString("zh-CN"),
              formatMoney(holding.marketValue),
              formatMoney(holding.profit),
            ])}
          />
          <DataTable
            columns={["订单", "类型", "金额", "确认状态"]}
            rows={selectedOrders.map((order) => [
              <TextButton onClick={() => openOrder(order.id)}>{order.id}</TextButton>,
              order.tradeType,
              formatMoney(order.amount),
              statusLabel[order.confirmationStatus],
            ])}
          />
          <DataTable
            columns={["商机", "阶段", "预计金额", "归因收入"]}
            rows={selectedOpportunities.map((opportunity) => [
              <TextButton onClick={() => openOpportunity(opportunity.id)}>{opportunity.name}</TextButton>,
              opportunity.stage,
              formatMoney(opportunity.expectedAmount),
              formatMoney(opportunity.revenueContribution),
            ])}
          />
          <DataTable
            columns={["风险", "规则", "时间", "状态"]}
            rows={selectedRisks.map((risk) => [
              <TextButton onClick={() => openRisk(risk.id)}>{risk.title}</TextButton>,
              risk.triggeredRule,
              risk.detectedAt,
              statusLabel[risk.status],
            ])}
          />
        </section>
      </div>
    </>
  );
}

export function TransactionsPage({
  selectedCustomerId,
  setSelectedCustomerId,
  openOrder,
  openCustomer,
}: {
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  openOrder: (id: string) => void;
  openCustomer: (id: string) => void;
}) {
  const filteredOrders = orders.filter((order) => order.customerId === selectedCustomerId);
  const selected = customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0];
  return (
    <>
      <PageHeader
        eyebrow="Transactions & Assets"
        title="交易与资产"
        description="查询交易、确认状态、持仓资产、收益费用和基金行情，解释资产为什么变化。"
      />
      <div className="context-strip">
        <span>当前客户上下文：{selected.shortName}</span>
        {customers.map((customer) => (
          <button
            className={customer.id === selectedCustomerId ? "active" : ""}
            key={customer.id}
            onClick={() => setSelectedCustomerId(customer.id)}
          >
            {customer.shortName}
          </button>
        ))}
      </div>
      <div className="content-grid">
        <section className="panel span-7">
          <div className="panel-title">
            <h2>交易记录</h2>
            <ClipboardList size={18} />
          </div>
          <DataTable
            columns={["订单号", "客户", "基金", "类型", "金额", "状态"]}
            rows={filteredOrders.map((order) => {
              const customer = customers.find((item) => item.id === order.customerId);
              return [
                <TextButton onClick={() => openOrder(order.id)}>{order.id}</TextButton>,
                <TextButton onClick={() => openCustomer(order.customerId)}>{customer?.shortName ?? "-"}</TextButton>,
                order.fundName,
                order.tradeType,
                formatMoney(order.amount),
                statusLabel[order.confirmationStatus],
              ];
            })}
          />
        </section>
        <section className="panel span-5">
          <div className="panel-title">
            <h2>资产归因</h2>
            <ChartNoAxesCombined size={18} />
          </div>
          <div className="timeline">
            <div><strong>申购流入</strong><span>+1.04 亿，来自 2 笔机构申购</span></div>
            <div><strong>净值波动</strong><span>-32 万，主要来自中证红利指数</span></div>
            <div><strong>收益分配</strong><span>+86 万，货币增强产品贡献最高</span></div>
          </div>
        </section>
      </div>
    </>
  );
}

export function RisksPage({
  openRisk,
  openCustomer,
  openOrder,
}: {
  openRisk: (id: string) => void;
  openCustomer: (id: string) => void;
  openOrder: (id: string) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Risk Operations"
        title="风险异常"
        description="集中展示告警、命中规则、原因解释、处置建议和闭环结果。"
      />
      <div className="content-grid">
        {risks.map((risk) => (
          <section className="panel span-4" key={risk.id}>
            <div className="risk-head">
              <span className={`severity severity-${risk.severity}`}>{risk.severity.toUpperCase()}</span>
              <StatusBadge status={risk.status} />
            </div>
            <h2>{risk.title}</h2>
            <p className="muted">
              <TextButton onClick={() => openCustomer(risk.relatedCustomerId)}>{risk.relatedCustomer}</TextButton>
            </p>
            <div className="detail-stack">
              <span>规则：{risk.triggeredRule}</span>
              <span>时间：{risk.detectedAt}</span>
              <strong>{risk.suggestion}</strong>
            </div>
            <div className="card-actions">
              <button onClick={() => openRisk(risk.id)}>查看详情</button>
              {risk.relatedOrderId ? <button onClick={() => openOrder(risk.relatedOrderId as string)}>关联订单</button> : null}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

export function PerformancePage({
  openCustomer,
  openOpportunity,
  createPreview,
}: {
  openCustomer: (id: string) => void;
  openOpportunity: (id: string) => void;
  createPreview: (preview: ActionPreview) => void;
}) {
  const totalOpportunityRevenue = opportunities.reduce((sum, item) => sum + item.revenueContribution, 0);
  return (
    <>
      <PageHeader
        eyebrow="Business Insight"
        title="经营分析"
        description="为管理者提供资产、交易、收入、费用、客户贡献和商机转化的可下钻视图。"
      />
      <MetricGrid metrics={metrics} />
      <div className="operation-strip">
        <button onClick={() => createPreview(buildReportPreview())}>生成周报预览</button>
        <button onClick={() => createPreview(buildScheduledTaskPreview())}>创建定时推送预览</button>
      </div>
      <div className="content-grid">
        <section className="panel span-6">
          <div className="panel-title">
            <h2>客户贡献排行</h2>
            <Banknote size={18} />
          </div>
          <DataTable
            columns={["客户", "资产", "年内收入"]}
            rows={customers.map((customer) => [
              <TextButton onClick={() => openCustomer(customer.id)}>{customer.shortName}</TextButton>,
              formatMoney(customer.totalAsset),
              formatMoney(customer.revenueYtd),
            ])}
          />
        </section>
        <section className="panel span-6">
          <div className="panel-title">
            <h2>商机归因收入</h2>
            <strong>{formatMoney(totalOpportunityRevenue)}</strong>
          </div>
          <div className="bar-list">
            {opportunities.map((opportunity) => (
              <button className="bar-row" key={opportunity.id} onClick={() => openOpportunity(opportunity.id)}>
                <span>{opportunity.name}</span>
                <div><i style={{ width: `${Math.max(8, opportunity.probability)}%` }} /></div>
                <strong>{formatMoney(opportunity.revenueContribution)}</strong>
              </button>
            ))}
          </div>
        </section>
        <section className="panel span-7">
          <div className="panel-title">
            <h2>报表模板</h2>
            <span className="status status-draft">Phase 3</span>
          </div>
          <div className="template-grid">
            {reportTemplates.map((template) => (
              <article key={template.id}>
                <span>{template.reportType} · {template.cadence}</span>
                <strong>{template.name}</strong>
                <p>{template.description}</p>
                <em>负责人：{template.ownerRole}</em>
                <button onClick={() => createPreview({
                  ...buildReportPreview(),
                  title: template.name,
                  context: `经营分析 / ${template.reportType}`,
                  summary: `${template.description} 当前生成模板预览，不导出文件、不发送邮件。`,
                })}>生成模板预览</button>
              </article>
            ))}
          </div>
        </section>
        <section className="panel span-5">
          <div className="panel-title">
            <h2>指标口径</h2>
            <ChartNoAxesCombined size={18} />
          </div>
          <DataTable
            columns={["指标", "领域", "更新", "负责人"]}
            rows={metricDefinitions.map((metric) => [
              metric.name,
              metric.domain,
              metric.updateFrequency,
              metric.owner,
            ])}
          />
        </section>
      </div>
    </>
  );
}

export function ConfigsPage({
  openConfig,
  openCustomer,
}: {
  openConfig: (id: string) => void;
  openCustomer: (id: string) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Operational Configuration"
        title="运营配置"
        description="承载垫资配置、垫资行、孳息规则、费用规则、版本、审批和配置审计。"
      />
      <section className="panel">
        <div className="panel-title">
          <h2>配置清单</h2>
          <ShieldCheck size={18} />
        </div>
        <DataTable
          columns={["类型", "名称", "客户", "版本", "审批", "生效期", "状态"]}
          rows={configs.map((config) => [
            config.type,
            <TextButton onClick={() => openConfig(config.id)}>{config.name}</TextButton>,
            config.customerId ? (
              <TextButton onClick={() => openCustomer(config.customerId!)}>
                {customers.find((customer) => customer.id === config.customerId)?.shortName ?? "-"}
              </TextButton>
            ) : "-",
            config.version,
            config.approvalStatus,
            config.effectiveRange,
            statusLabel[config.status],
          ])}
        />
      </section>
    </>
  );
}

export function OpportunitiesPage({
  openOpportunity,
  openCustomer,
  openOrder,
}: {
  openOpportunity: (id: string) => void;
  openCustomer: (id: string) => void;
  openOrder: (id: string) => void;
}) {
  const totalExpected = opportunities.reduce((sum, opportunity) => sum + opportunity.expectedAmount, 0);
  const totalRevenue = opportunityAttributions.reduce((sum, attribution) => sum + attribution.revenueAmount, 0);
  const totalFee = opportunityAttributions.reduce((sum, attribution) => sum + attribution.feeAmount, 0);
  const netContribution = opportunityAttributions.reduce((sum, attribution) => sum + attribution.netContribution, 0);

  return (
    <>
      <PageHeader
        eyebrow="Opportunity Attribution"
        title="商机归因"
        description="展示商机从客户、关联交易到收入和业绩结果的可追溯链路。"
      />
      <div className="metric-grid">
        <article className="metric-card"><span>商机预计金额</span><strong>{formatMoney(totalExpected)}</strong><em className="metric-neutral">3 条活跃链路</em></article>
        <article className="metric-card"><span>收入贡献</span><strong>{formatMoney(totalRevenue)}</strong><em className="metric-good">已归因收入</em></article>
        <article className="metric-card"><span>费用抵扣</span><strong>{formatMoney(totalFee)}</strong><em className="metric-neutral">交易关联费用</em></article>
        <article className="metric-card"><span>净贡献</span><strong>{formatMoney(netContribution)}</strong><em className="metric-good">可追溯业绩</em></article>
      </div>
      <div className="content-grid">
        <section className="panel span-7">
          <div className="panel-title">
            <h2>商机与业绩</h2>
            <BriefcaseBusiness size={18} />
          </div>
          <DataTable
            columns={["商机", "客户", "关联订单", "阶段", "预计金额", "概率", "归因收入"]}
            rows={opportunities.map((opportunity) => {
              const customer = customers.find((item) => item.id === opportunity.customerId);
              return [
                <TextButton onClick={() => openOpportunity(opportunity.id)}>{opportunity.name}</TextButton>,
                <TextButton onClick={() => openCustomer(opportunity.customerId)}>{customer?.shortName ?? "-"}</TextButton>,
                opportunity.linkedOrderId ? <TextButton onClick={() => openOrder(opportunity.linkedOrderId!)}>{opportunity.linkedOrderId}</TextButton> : "-",
                opportunity.stage,
                formatMoney(opportunity.expectedAmount),
                `${opportunity.probability}%`,
                formatMoney(opportunity.revenueContribution),
              ];
            })}
          />
        </section>
        <section className="panel span-5">
          <div className="panel-title">
            <h2>归因规则解释</h2>
            <span className="status status-draft">Phase 3</span>
          </div>
          <div className="timeline">
            <div><strong>关联交易识别</strong><span>按商机、客户、基金和订单时间窗口建立映射。</span></div>
            <div><strong>收入费用拆分</strong><span>读取收入和费用记录，计算净贡献。</span></div>
            <div><strong>置信度提示</strong><span>低置信度链路进入人工复核，不自动确认业绩。</span></div>
          </div>
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>归因明细</h2>
            <ChartNoAxesCombined size={18} />
          </div>
          <DataTable
            columns={["商机", "订单", "收入", "费用", "净贡献", "规则", "置信度"]}
            rows={opportunityAttributions.map((attribution) => {
              const opportunity = opportunities.find((item) => item.id === attribution.opportunityId);
              return [
                opportunity ? <TextButton onClick={() => openOpportunity(opportunity.id)}>{opportunity.name}</TextButton> : "-",
                <TextButton onClick={() => openOrder(attribution.orderId)}>{attribution.orderId}</TextButton>,
                formatMoney(attribution.revenueAmount),
                formatMoney(attribution.feeAmount),
                formatMoney(attribution.netContribution),
                attribution.attributionRule,
                `${attribution.confidence}%`,
              ];
            })}
          />
        </section>
      </div>
    </>
  );
}

export function AssistantPage({
  createPreview,
  operationRecords,
  runtimeAgentTasks,
}: {
  createPreview: (preview: ActionPreview) => void;
  operationRecords: OperationRecord[];
  runtimeAgentTasks: AgentTask[];
}) {
  const visibleAgentTasks = [...runtimeAgentTasks, ...agentTasks];
  const previewFromAction = (actionId: string) => {
    if (actionId === "A001") {
      const risk = risks[0];
      return {
        type: "异常解释",
        title: "赎回确认超时解释",
        context: `${risk.relatedCustomer} / ${risk.triggeredRule}`,
        summary: `${risk.suggestion} 建议先核对 TA 回执、申请单和清算记录，再生成处理说明。`,
        steps: ["读取关联订单和风险事件", "解释未确认原因和当前状态", "输出处置建议，不改变业务状态"],
        requiresApproval: false,
      } satisfies ActionPreview;
    }
    if (actionId === "A002") return buildReportPreview();
    if (actionId === "A003") return buildScheduledTaskPreview();
    if (actionId === "A004") return buildEmailPreview(risks[0]);
    return {
      type: "审批说明",
      title: "孳息规则变更审批说明",
      context: "运营配置 / 机构货币类产品孳息规则",
      summary: "该草稿规则将影响机构货币类产品孳息计算口径，提交前需要确认客户范围、产品范围和生效期。",
      steps: ["检查规则版本与生效期", "识别影响客户和产品", "生成审批说明草稿，等待人工确认"],
      requiresApproval: true,
    } satisfies ActionPreview;
  };

  return (
    <>
      <PageHeader
        eyebrow="Multi-Agent Workspace"
        title="AI 助手"
        description="用 mock 工作流验证问答、分析、报表、定时任务、邮件和配置说明的人审模式。"
      />
      <div className="content-grid">
        <section className="panel span-5">
          <div className="panel-title">
            <h2>推荐问题</h2>
            <Bot size={18} />
          </div>
          <div className="prompt-list">
            <button onClick={() => createPreview(previewFromAction("A001"))}>解释东海资管赎回为什么未确认</button>
            <button onClick={() => createPreview(buildReportPreview())}>生成本周机构客户经营报告</button>
            <button onClick={() => createPreview(buildScheduledTaskPreview())}>创建每日 9 点异常交易推送</button>
            <button onClick={() => createPreview({
              type: "异常解释",
              title: "华北城投资产变化原因",
              context: "客户全景 / 华北城投",
              summary: "资产变化主要来自近期申购流入、产品净值波动和收益分配，当前无异常赎回压力。",
              steps: ["汇总交易、持仓和行情数据", "拆解申购流入、净值波动和收益分配", "生成客户经营解释草稿"],
              requiresApproval: false,
            })}>分析华北城投资产变化原因</button>
          </div>
        </section>
        <section className="panel span-7">
          <div className="panel-title">
            <h2>动作预览</h2>
            <span className="status status-pending">需人审</span>
          </div>
          <div className="action-grid">
            {assistantActions.map((action) => (
              <article key={action.id}>
                <span>{action.type}</span>
                <strong>{action.title}</strong>
                <p>{action.description}</p>
                <em>{action.requiresApproval ? "执行前需要人工确认" : "可直接生成解释"}</em>
                <button onClick={() => createPreview(previewFromAction(action.id))}>生成预览</button>
              </article>
            ))}
          </div>
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>动作草稿与审批占位</h2>
            <span className="status status-draft">mock 队列</span>
          </div>
          <OperationQueue records={operationRecords} />
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>Agent 任务编排</h2>
            <span className="status status-pending">Phase 4</span>
          </div>
          <DataTable
            columns={["Agent", "任务", "上下文", "状态", "风险", "更新"]}
            rows={visibleAgentTasks.map((task) => [
              task.agentName,
              task.title,
              task.context,
              task.status,
              task.riskLevel,
              task.lastUpdate,
            ])}
          />
        </section>
      </div>
    </>
  );
}
