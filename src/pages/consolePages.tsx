import {
  ArrowRight,
  Banknote,
  Bot,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ClipboardList,
  Layers3,
  Plus,
  PlugZap,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import { buildEmailPreview, buildOrderStatusPreview, buildReportPreview, buildRiskExplanationPreview, buildScheduledTaskPreview } from "../actionPreviews";
import { DataTable, MetricGrid, OperationQueue, PageHeader, PermissionNotice, StatusBadge, TextButton } from "../components/common";
import { statusLabel } from "../constants";
import type { ApiMode, ConsoleDataSnapshot } from "../adapters";
import type { ActionPreview, AgentTask, ConfigItem, CurrentUser, OperationRecord, PageId } from "../domain";
import { formatMoney } from "../mockData";
import { can } from "../permissions";

export function WorkspacePage({
  data,
  user,
  jump,
  operationRecords,
  updateOperationStatus,
}: {
  data: ConsoleDataSnapshot;
  user: CurrentUser;
  jump: (page: PageId) => void;
  operationRecords: OperationRecord[];
  updateOperationStatus: (id: string, status: OperationRecord["status"]) => void;
}) {
  const { assistantActions, configs, metrics, reportGenerationRecords, risks, scheduledReportTasks, tasks } = data;
  const todayFlows = [
    {
      title: "处理交易确认异常",
      desc: `${risks.filter((risk) => risk.severity === "high").length} 条高优先级风险，先核对订单和清算状态`,
      page: "risks" as PageId,
      tone: "risk",
    },
    {
      title: "复核配置草稿",
      desc: `${configs.filter((config) => config.status === "draft" || config.approvalStatus.includes("待")).length} 条配置待提交或待复核`,
      page: "configs" as PageId,
      tone: "warning",
    },
    {
      title: "确认报表输出",
      desc: `${reportGenerationRecords.filter((record) => record.approvalStatus === "待审批").length} 份报表等待审批，${scheduledReportTasks.filter((task) => task.status === "草稿").length} 个定时任务草稿`,
      page: "performance" as PageId,
      tone: "neutral",
    },
    {
      title: "检查 AI 待人审",
      desc: "查看 Agent 生成的报表、邮件、配置说明和定时任务草稿",
      page: "assistant" as PageId,
      tone: "neutral",
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow="MAFDIC / Operations"
        title="综合工作台"
        description="汇总今日运营状态、异常、报表、配置和 AI 建议，作为运营人员与管理者的统一入口。"
      />
      <MetricGrid metrics={metrics} />
      <div className="content-grid">
        <section className="panel span-12">
          <div className="panel-title">
            <h2>今日核心流程</h2>
            <span className="status status-pending">可点击处理</span>
          </div>
          <div className="flow-grid">
            {todayFlows.map((flow, index) => (
              <button className={`flow-card flow-${flow.tone}`} key={flow.title} onClick={() => jump(flow.page)}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{flow.title}</strong>
                <em>{flow.desc}</em>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </section>
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
            <h2>AI 下一步建议</h2>
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
            <h2>人工确认队列</h2>
            <button className="icon-button" title="查看 AI 助手" onClick={() => jump("assistant")}>
              <Bot size={18} />
            </button>
          </div>
          <OperationQueue
            records={operationRecords}
            onStatusChange={updateOperationStatus}
            canOperate={can(user, "approve:operation")}
          />
        </section>
      </div>
    </>
  );
}

export function CustomersPage({
  data,
  selectedCustomerId,
  setSelectedCustomerId,
  openOrder,
  openOpportunity,
  openRisk,
  jump,
}: {
  data: ConsoleDataSnapshot;
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  openOrder: (id: string) => void;
  openOpportunity: (id: string) => void;
  openRisk: (id: string) => void;
  jump: (page: PageId) => void;
}) {
  const { customers, holdings, opportunities, orders, risks } = data;
  const [keyword, setKeyword] = useState("");
  const visibleCustomers = customers.filter((customer) =>
    `${customer.name}${customer.shortName}${customer.relationshipManager}${customer.tags.join("")}`.includes(keyword.trim()),
  );
  const selected = customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0];
  const selectedHoldings = holdings.filter((holding) => holding.customerId === selected.id);
  const selectedOrders = orders.filter((order) => order.customerId === selected.id);
  const selectedOpportunities = opportunities.filter((opportunity) => opportunity.customerIds.includes(selected.id));
  const selectedRisks = risks.filter((risk) => risk.relatedCustomerId === selected.id);
  const totalHoldingValue = selectedHoldings.reduce((total, holding) => total + holding.marketValue, 0);
  const totalProfit = selectedHoldings.reduce((total, holding) => total + holding.profit, 0);
  const pendingOrders = selectedOrders.filter((order) => order.confirmationStatus === "pending" || order.confirmationStatus === "warning");
  const attributionRevenue = selectedOpportunities.reduce((total, opportunity) => total + opportunity.revenueContribution, 0);
  const customerSignals = [
    { label: "交易卡点", value: `${pendingOrders.length} 笔`, desc: pendingOrders[0]?.confirmationBlocker ?? "当前无待确认交易卡点" },
    { label: "风险事件", value: `${selectedRisks.length} 条`, desc: selectedRisks[0]?.currentBlocker ?? "当前无高优先级风险事件" },
    { label: "商机收入", value: formatMoney(attributionRevenue), desc: selectedOpportunities[0]?.stage ?? "暂无活跃商机归因" },
  ];

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
          <input
            className="control-input"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索客户、经理、标签"
          />
          <div className="customer-list">
            {visibleCustomers.map((customer) => (
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
            <div><span>服务等级</span><strong>{selected.serviceTier}</strong></div>
          </div>
          <div className="customer-brief">
            <div>
              <span>资金偏好</span>
              <strong>{selected.investmentPreference}</strong>
            </div>
            <div>
              <span>当前运营重点</span>
              <strong>{selected.operationFocus}</strong>
            </div>
          </div>
          <div className="quick-actions">
            <button onClick={() => jump("transactions")}>查看交易资产 <ArrowRight size={15} /></button>
            <button onClick={() => jump("opportunities")}>查看商机归因 <ArrowRight size={15} /></button>
            <button onClick={() => jump("risks")}>查看风险异常 <ArrowRight size={15} /></button>
          </div>
          <section className="customer-command">
            <div className="panel-title">
              <h2>客户运营信号</h2>
              <Layers3 size={18} />
            </div>
            <div className="customer-signal-grid">
              {customerSignals.map((signal) => (
                <article key={signal.label}>
                  <span>{signal.label}</span>
                  <strong>{signal.value}</strong>
                  <em>{signal.desc}</em>
                </article>
              ))}
            </div>
          </section>
          <section className="customer-command">
            <div className="panel-title">
              <h2>下一步动作</h2>
              <Bot size={18} />
            </div>
            <div className="customer-action-grid">
              {selected.nextBestActions.map((action) => <button key={action}>{action}</button>)}
            </div>
          </section>
          <section className="customer-command">
            <div className="panel-title">
              <h2>对象关系</h2>
              <ChartNoAxesCombined size={18} />
            </div>
            <div className="customer-relation-grid">
              <button onClick={() => jump("transactions")}>
                <span>交易</span>
                <strong>{selectedOrders.length} 笔</strong>
                <em>{pendingOrders.length} 笔待确认/异常</em>
              </button>
              <button onClick={() => jump("risks")}>
                <span>风险</span>
                <strong>{selectedRisks.length} 条</strong>
                <em>{selectedRisks[0]?.title ?? "暂无风险事件"}</em>
              </button>
              <button onClick={() => jump("opportunities")}>
                <span>商机</span>
                <strong>{selectedOpportunities.length} 个</strong>
                <em>{formatMoney(attributionRevenue)} 已归因收入</em>
              </button>
              <button onClick={() => jump("performance")}>
                <span>资产</span>
                <strong>{formatMoney(totalHoldingValue)}</strong>
                <em>浮盈亏 {formatMoney(totalProfit)}</em>
              </button>
            </div>
          </section>
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
  data,
  selectedCustomerId,
  setSelectedCustomerId,
  openOrder,
  openCustomer,
  openRisk,
  createPreview,
}: {
  data: ConsoleDataSnapshot;
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  openOrder: (id: string) => void;
  openCustomer: (id: string) => void;
  openRisk: (id: string) => void;
  createPreview: (preview: ActionPreview) => void;
}) {
  const { customers, holdings, orders, risks } = data;
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"全部" | "待确认" | "异常" | "已完成">("全部");
  const filteredOrders = orders.filter((order) => order.customerId === selectedCustomerId);
  const visibleOrders = filteredOrders.filter((order) => {
    const statusText = statusLabel[order.confirmationStatus];
    const matchesKeyword = `${order.id}${order.fundName}${order.tradeType}${order.channel}`.includes(keyword.trim());
    const matchesStatus = statusFilter === "全部" || statusText === statusFilter;
    return matchesKeyword && matchesStatus;
  });
  const selected = customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0];
  const selectedHoldings = holdings.filter((holding) => holding.customerId === selectedCustomerId);
  const selectedRisks = risks.filter((risk) => risk.relatedCustomerId === selectedCustomerId);
  const pendingOrders = filteredOrders.filter((order) => order.confirmationStatus === "pending" || order.confirmationStatus === "warning").length;
  const totalOrderAmount = filteredOrders.reduce((total, order) => total + order.amount, 0);
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
        <section className="panel span-12">
          <div className="panel-title">
            <h2>交易确认看板</h2>
            <span className="status status-pending">客户上下文联动</span>
          </div>
          <div className="trade-process-grid">
            <article>
              <span>当前客户</span>
              <strong>{selected.shortName}</strong>
              <em>{filteredOrders.length} 笔交易，合计 {formatMoney(totalOrderAmount)}</em>
            </article>
            <article>
              <span>待确认/异常</span>
              <strong>{pendingOrders} 笔</strong>
              <em>优先核对 TA 回执、确认金额、份额和清算状态</em>
            </article>
            <article>
              <span>持仓资产</span>
              <strong>{selectedHoldings.length} 只基金</strong>
              <em>交易确认后联动保有量、浮盈亏和资产归因口径</em>
            </article>
            <article>
              <span>关联风险</span>
              <strong>{selectedRisks.length} 条</strong>
              <em>可从订单回到风险闭环，保留处理轨迹</em>
            </article>
          </div>
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>交易记录</h2>
            <ClipboardList size={18} />
          </div>
          <div className="filter-row">
            <input
              className="control-input"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索订单、基金、渠道"
            />
            {(["全部", "待确认", "异常", "已完成"] as const).map((status) => (
              <button
                className={statusFilter === status ? "active" : ""}
                key={status}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
          <DataTable
            columns={["订单号", "客户", "基金", "类型", "金额", "确认状态", "卡点"]}
            rows={visibleOrders.map((order) => {
              const customer = customers.find((item) => item.id === order.customerId);
              return [
                <TextButton onClick={() => openOrder(order.id)}>{order.id}</TextButton>,
                <TextButton onClick={() => openCustomer(order.customerId)}>{customer?.shortName ?? "-"}</TextButton>,
                order.fundName,
                order.tradeType,
                formatMoney(order.amount),
                statusLabel[order.confirmationStatus],
                order.confirmationBlocker,
              ];
            })}
          />
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>资产归因</h2>
            <ChartNoAxesCombined size={18} />
          </div>
          <div className="timeline trade-timeline">
            {visibleOrders.map((order) => {
              const relatedRisk = risks.find((risk) => risk.relatedOrderId === order.id);
              const customer = customers.find((item) => item.id === order.customerId);
              return (
                <div key={order.id}>
                  <strong>{order.tradeType} · {formatMoney(order.amount)}</strong>
                  <span>{order.assetImpact}</span>
                  <div className="inline-actions">
                    <button onClick={() => openOrder(order.id)}>订单详情</button>
                    {relatedRisk ? <button onClick={() => openRisk(relatedRisk.id)}>关联风险</button> : null}
                    <button onClick={() => createPreview(buildOrderStatusPreview(order, customer?.shortName))}>生成说明</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>确认状态轨迹</h2>
            <ClipboardList size={18} />
          </div>
          <div className="order-flow-list">
            {visibleOrders.map((order) => (
              <article key={order.id}>
                <div>
                  <span>{order.id}</span>
                  <strong>{order.fundName}</strong>
                  <em>{order.confirmationBlocker}</em>
                </div>
                <div className="mini-stepper">
                  {order.settlementTrail.map((step) => <span key={step}>{step}</span>)}
                </div>
                <div className="risk-action-list">
                  {order.nextActions.map((action) => <span key={action}>{action}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export function RisksPage({
  data,
  openRisk,
  openCustomer,
  openOrder,
  createPreview,
}: {
  data: ConsoleDataSnapshot;
  openRisk: (id: string) => void;
  openCustomer: (id: string) => void;
  openOrder: (id: string) => void;
  createPreview: (preview: ActionPreview) => void;
}) {
  const { risks } = data;
  const [severityFilter, setSeverityFilter] = useState<"全部" | "high" | "medium" | "low">("全部");
  const visibleRisks = risks.filter((risk) => severityFilter === "全部" || risk.severity === severityFilter);
  const highRisks = risks.filter((risk) => risk.severity === "high").length;
  const pendingRisks = risks.filter((risk) => risk.status === "pending" || risk.status === "warning").length;
  const linkedOrders = risks.filter((risk) => risk.relatedOrderId).length;
  return (
    <>
      <PageHeader
        eyebrow="Risk Operations"
        title="风险异常"
        description="集中展示告警、命中规则、原因解释、处置建议和闭环结果。"
      />
      <div className="operation-strip">
        {(["全部", "high", "medium", "low"] as const).map((severity) => (
          <button
            className={severityFilter === severity ? "active" : ""}
            key={severity}
            onClick={() => setSeverityFilter(severity)}
          >
            {severity === "全部" ? "全部风险" : severity.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="content-grid">
        <section className="panel span-12">
          <div className="panel-title">
            <h2>处置闭环概览</h2>
            <span className="status status-warning">先核实再闭环</span>
          </div>
          <div className="risk-process-grid">
            <article>
              <span>优先处理</span>
              <strong>{highRisks} 条高优先级</strong>
              <em>先处理交易确认、清算差异和客户影响明确的事件</em>
            </article>
            <article>
              <span>待推进</span>
              <strong>{pendingRisks} 条未闭环</strong>
              <em>需要明确责任岗、下一步动作和人工确认记录</em>
            </article>
            <article>
              <span>可追溯</span>
              <strong>{linkedOrders} 条关联订单</strong>
              <em>从风险事件直接回到订单、客户和 AI 处理说明</em>
            </article>
          </div>
        </section>
        {visibleRisks.map((risk) => (
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
              <strong>卡点：{risk.currentBlocker}</strong>
            </div>
            <div className="risk-action-list">
              {risk.nextActions.slice(0, 3).map((action) => <span key={action}>{action}</span>)}
            </div>
            <div className="risk-record">
              <span>最新记录</span>
              <strong>{risk.handlingRecords.at(-1)}</strong>
            </div>
            <div className="card-actions">
              <button onClick={() => openRisk(risk.id)}>查看详情</button>
              {risk.relatedOrderId ? <button onClick={() => openOrder(risk.relatedOrderId as string)}>关联订单</button> : null}
              <button onClick={() => createPreview(buildRiskExplanationPreview(risk))}>生成说明</button>
              <button onClick={() => createPreview(buildEmailPreview(risk))}>草拟邮件</button>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

export function PerformancePage({
  data,
  openCustomer,
  openOpportunity,
  createPreview,
}: {
  data: ConsoleDataSnapshot;
  openCustomer: (id: string) => void;
  openOpportunity: (id: string) => void;
  createPreview: (preview: ActionPreview) => void;
}) {
  const {
    customers,
    holdings,
    metricDefinitions,
    metrics,
    opportunities,
    opportunityAttributions,
    orders,
    reportGenerationRecords,
    reportTemplates,
    risks,
    scheduledReportTasks,
  } = data;
  const totalMaintenanceFee = opportunityAttributions.reduce((sum, item) => sum + item.salesMaintenanceFee, 0);
  const totalServiceFee = opportunityAttributions.reduce((sum, item) => sum + item.distributionServiceFee, 0);
  const totalAsset = customers.reduce((sum, customer) => sum + customer.totalAsset, 0);
  const totalHoldingValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const totalProfit = holdings.reduce((sum, holding) => sum + holding.profit, 0);
  const totalTradeAmount = orders.reduce((sum, order) => sum + order.amount, 0);
  const blockedTradeAmount = orders
    .filter((order) => order.confirmationStatus === "pending" || order.confirmationStatus === "warning")
    .reduce((sum, order) => sum + order.amount, 0);
  const openRiskCount = risks.filter((risk) => risk.status !== "closed").length;
  const pendingReportApprovals = reportGenerationRecords.filter((record) => record.approvalStatus === "待审批").length;
  const activeSchedules = scheduledReportTasks.filter((task) => task.status === "启用").length;
  const sensitiveTemplates = reportTemplates.filter((template) => template.sensitivity !== "内部").length;
  const topCustomers = [...customers].sort((a, b) => b.revenueYtd - a.revenueYtd);
  const managementSignals = [
    {
      title: "资产保有质量",
      value: formatMoney(totalHoldingValue),
      desc: `客户资产 ${formatMoney(totalAsset)}，持仓浮盈亏 ${formatMoney(totalProfit)}`,
      tone: "good",
    },
    {
      title: "交易确认压力",
      value: formatMoney(blockedTradeAmount),
      desc: `${orders.filter((order) => order.confirmationStatus !== "closed").length} 笔交易仍在确认链路`,
      tone: blockedTradeAmount > 0 ? "risk" : "good",
    },
    {
      title: "商机落实收入",
      value: formatMoney(totalMaintenanceFee + totalServiceFee),
      desc: `维护费 ${formatMoney(totalMaintenanceFee)} + 销售服务费 ${formatMoney(totalServiceFee)}`,
      tone: "good",
    },
    {
      title: "风险闭环缺口",
      value: `${openRiskCount} 条`,
      desc: risks[0]?.currentBlocker ?? "暂无未闭环风险",
      tone: openRiskCount > 0 ? "risk" : "good",
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow="Business Insight"
        title="经营分析"
        description="为管理者提供资产、交易、收入、费用、客户贡献和商机转化的可下钻视图。"
      />
      <MetricGrid metrics={metrics} />
      <div className="metric-grid">
        <article className="metric-card"><span>报表模板</span><strong>{reportTemplates.length}</strong><em className="metric-neutral">绑定指标口径</em></article>
        <article className="metric-card"><span>待审批输出</span><strong>{pendingReportApprovals}</strong><em className="metric-risk">导出/推送需人审</em></article>
        <article className="metric-card"><span>定时任务</span><strong>{activeSchedules}</strong><em className="metric-good">启用中</em></article>
        <article className="metric-card"><span>敏感模板</span><strong>{sensitiveTemplates}</strong><em className="metric-risk">受控导出</em></article>
      </div>
      <div className="operation-strip">
        <button onClick={() => createPreview(buildReportPreview())}>生成周报预览</button>
        <button onClick={() => createPreview(buildScheduledTaskPreview())}>创建定时推送预览</button>
      </div>
      <div className="content-grid">
        <section className="panel span-12">
          <div className="panel-title">
            <h2>经营驾驶舱</h2>
            <span className="status status-pending">管理者视角</span>
          </div>
          <div className="insight-grid">
            {managementSignals.map((signal) => (
              <article className={`insight-card insight-${signal.tone}`} key={signal.title}>
                <span>{signal.title}</span>
                <strong>{signal.value}</strong>
                <em>{signal.desc}</em>
              </article>
            ))}
          </div>
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>经营解释链路</h2>
            <ChartNoAxesCombined size={18} />
          </div>
          <div className="management-flow">
            <article>
              <span>1</span>
              <strong>客户资产</strong>
              <em>机构客户资产与持仓市值形成经营底盘</em>
            </article>
            <article>
              <span>2</span>
              <strong>交易确认</strong>
              <em>交易确认状态决定资产入账、赎回出账和后续收入口径</em>
            </article>
            <article>
              <span>3</span>
              <strong>商机归因</strong>
              <em>交易挂接商机后，持仓带来维护费与销售服务费</em>
            </article>
            <article>
              <span>4</span>
              <strong>风险闭环</strong>
              <em>异常交易、额度和净值波动影响经营质量判断</em>
            </article>
            <article>
              <span>5</span>
              <strong>报表输出</strong>
              <em>管理报告绑定指标口径、人审和推送治理</em>
            </article>
          </div>
        </section>
        <section className="panel span-6">
          <div className="panel-title">
            <h2>客户贡献排行</h2>
            <Banknote size={18} />
          </div>
          <DataTable
            columns={["客户", "服务等级", "资产", "年内收入", "运营重点"]}
            rows={topCustomers.map((customer) => [
              <TextButton onClick={() => openCustomer(customer.id)}>{customer.shortName}</TextButton>,
              customer.serviceTier,
              formatMoney(customer.totalAsset),
              formatMoney(customer.revenueYtd),
              customer.operationFocus,
            ])}
          />
        </section>
        <section className="panel span-6">
          <div className="panel-title">
            <h2>商机落实收入</h2>
            <strong>{formatMoney(totalMaintenanceFee + totalServiceFee)}</strong>
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
        <section className="panel span-12">
          <div className="panel-title">
            <h2>收入拆分与质量</h2>
            <span className="status status-pending">商机归因口径</span>
          </div>
          <div className="revenue-quality-grid">
            <article>
              <span>客户维护费</span>
              <strong>{formatMoney(totalMaintenanceFee)}</strong>
              <em>来自商机关联交易形成持仓后的客户维护收入</em>
            </article>
            <article>
              <span>销售服务费</span>
              <strong>{formatMoney(totalServiceFee)}</strong>
              <em>来自销售服务费归集，按商机和销售分配比例沉淀</em>
            </article>
            <article>
              <span>交易总额</span>
              <strong>{formatMoney(totalTradeAmount)}</strong>
              <em>确认卡点金额 {formatMoney(blockedTradeAmount)}</em>
            </article>
            <article>
              <span>报表治理</span>
              <strong>{pendingReportApprovals} 待审批</strong>
              <em>{sensitiveTemplates} 个敏感模板，输出前必须人工确认</em>
            </article>
          </div>
        </section>
        <section className="panel span-7">
          <div className="panel-title">
            <h2>报表模板</h2>
            <span className="status status-draft">Phase 13</span>
          </div>
          <div className="template-grid">
            {reportTemplates.map((template) => (
              <article key={template.id}>
                <span>{template.reportType} · {template.cadence}</span>
                <strong>{template.name}</strong>
                <p>{template.description}</p>
                <em>负责人：{template.ownerRole} · {template.sensitivity} · {template.metricVersion}</em>
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
              `${metric.owner} · ${metric.version ?? "-"}`,
            ])}
          />
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>报表生成历史</h2>
            <span className="status status-pending">输出治理</span>
          </div>
          <DataTable
            columns={["报表", "触发人", "时间", "状态", "输出物", "审批", "推送", "失败原因"]}
            rows={reportGenerationRecords.map((record) => {
              const template = reportTemplates.find((item) => item.id === record.templateId);
              return [
                template?.name ?? record.templateId,
                record.triggeredBy,
                record.generatedAt,
                record.status,
                record.outputArtifact,
                record.approvalStatus,
                record.deliveryStatus,
                record.failureReason ?? "-",
              ];
            })}
          />
        </section>
        <section className="panel span-7">
          <div className="panel-title">
            <h2>定时推送任务</h2>
            <span className="status status-pending">需人审启用</span>
          </div>
          <DataTable
            columns={["模板", "周期", "收件范围", "数据范围", "状态", "上次", "下次", "审批"]}
            rows={scheduledReportTasks.map((task) => {
              const template = reportTemplates.find((item) => item.id === task.templateId);
              return [
                template?.name ?? task.templateId,
                task.cadence,
                task.recipients.join(" / "),
                task.dataScope,
                task.status,
                `${task.lastRun} · ${task.lastResult}`,
                task.nextRun,
                task.requiresApproval ? "需要" : "不需要",
              ];
            })}
          />
        </section>
        <section className="panel span-5">
          <div className="panel-title">
            <h2>报表安全边界</h2>
            <span className="status status-warning">强制约束</span>
          </div>
          <div className="timeline">
            <div><strong>敏感报表必须审批</strong><span>客户、交易、营收、归因相关报表默认进入待审批。</span></div>
            <div><strong>定时任务先草稿</strong><span>AI 可创建任务草稿，但启用前需要人工确认收件人和范围。</span></div>
            <div><strong>指标口径绑定版本</strong><span>每次生成报表都记录指标口径版本，避免同名指标口径漂移。</span></div>
          </div>
        </section>
      </div>
    </>
  );
}

export function ConfigsPage({
  data,
  user,
  openConfig,
  openCustomer,
  createPreview,
}: {
  data: ConsoleDataSnapshot;
  user: CurrentUser;
  openConfig: (id: string) => void;
  openCustomer: (id: string) => void;
  createPreview: (preview: ActionPreview) => void;
}) {
  const { configs, customers } = data;
  const [typeFilter, setTypeFilter] = useState<ConfigItem["type"] | "全部">("全部");
  const [drafts, setDrafts] = useState<ConfigItem[]>([]);
  const [draftType, setDraftType] = useState<ConfigItem["type"]>("垫资配置");
  const [draftCustomerId, setDraftCustomerId] = useState(customers[0].id);
  const [draftName, setDraftName] = useState("华北城投垫资额度临时调整");
  const allConfigs = useMemo(() => [...drafts, ...configs], [configs, drafts]);
  const visibleConfigs = allConfigs.filter((config) => typeFilter === "全部" || config.type === typeFilter);
  const configTypes: Array<ConfigItem["type"] | "全部"> = ["全部", "垫资配置", "垫资行", "孳息规则", "费用规则", "风控规则"];
  const canEditConfig = can(user, "edit:config");
  const blockedConfigs = allConfigs.filter((config) => config.validationResults?.some((item) => item.level === "阻断")).length;
  const draftVersions = allConfigs.filter((config) => config.versions?.some((version) => version.status === "草稿")).length;
  const createDraft = () => {
    if (!canEditConfig) return;
    const draft: ConfigItem = {
      id: `CFG-DRAFT-${Date.now()}`,
      customerId: draftType === "风控规则" ? undefined : draftCustomerId,
      type: draftType,
      name: draftName.trim() || `${draftType}变更草稿`,
      status: "draft",
      version: "v1 草稿",
      approvalStatus: "待提交",
      effectiveRange: "2026-06-01 起",
      ownerRole: draftType === "垫资行" ? "资金岗" : draftType === "风控规则" ? "风险运营岗" : "配置岗",
      changeReason: "业务原型中创建的配置变更草稿",
      parameters: [
        { label: "字段来源", value: "原型草稿" },
        { label: "后续处理", value: "待真实业务字段对齐" },
      ],
      validationResults: [
        { id: `VAL-${Date.now()}`, level: "提醒", title: "字段待确认", detail: "该草稿字段为产品原型字段，后续需要与真实 API 或配置表结构映射。" },
      ],
      approvalFlow: [
        { id: `APR-${Date.now()}`, nodeName: "配置提交", assignee: "配置岗", status: "待处理", opinion: "等待人工提交。" },
      ],
      versions: [
        { id: `VER-${Date.now()}`, version: "v1 草稿", status: "草稿", changedBy: user.role, changedAt: "刚刚", summary: "通过配置变更工作台创建草稿。" },
      ],
      auditLogs: [
        { id: `AUD-${Date.now()}`, actor: user.role, action: "创建草稿", at: "刚刚", detail: "创建配置草稿并生成审批说明。" },
      ],
    };
    setDrafts((currentDrafts) => [draft, ...currentDrafts]);
    createPreview({
      type: "审批说明",
      title: `${draft.name}审批说明`,
      context: `${draft.type} / ${draft.version}`,
      summary: `已生成 ${draft.type} 草稿，影响范围为 ${draft.customerId ? customers.find((customer) => customer.id === draft.customerId)?.shortName : "全局规则"}，需要确认字段、审批路径和生效时间。`,
      steps: ["创建配置草稿", "检查客户范围、规则冲突和生效期", "送入待确认队列，等待人工提交审批"],
      requiresApproval: true,
    });
  };
  return (
    <>
      <PageHeader
        eyebrow="Operational Configuration"
        title="运营配置"
        description="承载垫资配置、垫资行、孳息规则、费用规则、版本、审批和配置审计。"
      />
      <div className="metric-grid">
        <article className="metric-card"><span>配置总数</span><strong>{allConfigs.length}</strong><em className="metric-neutral">含草稿 {drafts.length} 条</em></article>
        <article className="metric-card"><span>待审批</span><strong>{allConfigs.filter((config) => config.approvalStatus.includes("待")).length}</strong><em className="metric-risk">需人工确认</em></article>
        <article className="metric-card"><span>校验阻断</span><strong>{blockedConfigs}</strong><em className="metric-risk">不可生效</em></article>
        <article className="metric-card"><span>草稿版本</span><strong>{draftVersions}</strong><em className="metric-neutral">待治理</em></article>
      </div>
      <div className="content-grid">
        <section className="panel span-8">
          <div className="panel-title">
            <h2>配置清单</h2>
            <ShieldCheck size={18} />
          </div>
          <div className="filter-row">
            {configTypes.map((type) => (
              <button
                className={typeFilter === type ? "active" : ""}
                key={type}
                onClick={() => setTypeFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
          <DataTable
            columns={["类型", "名称", "客户", "版本", "审批", "负责人", "生效期", "状态"]}
            rows={visibleConfigs.map((config) => [
              config.type,
              <TextButton onClick={() => {
                if (config.id.startsWith("CFG-DRAFT")) {
                  createPreview({
                    type: "审批说明",
                    title: `${config.name}审批说明`,
                    context: `${config.type} / ${config.version}`,
                    summary: `该草稿尚未写入后端配置库，当前用于确认字段、影响范围、审批路径和生效时间。`,
                    steps: ["复核配置草稿字段", "校验影响范围与规则冲突", "提交人工审批后等待生效"],
                    requiresApproval: true,
                  });
                  return;
                }
                openConfig(config.id);
              }}>{config.name}</TextButton>,
              config.customerId ? (
                <TextButton onClick={() => openCustomer(config.customerId!)}>
                  {customers.find((customer) => customer.id === config.customerId)?.shortName ?? "-"}
                </TextButton>
              ) : "-",
              config.version,
              config.approvalStatus,
              config.ownerRole ?? "-",
              config.effectiveRange,
              statusLabel[config.status],
            ])}
          />
        </section>
        <section className="panel span-4">
          <div className="panel-title">
            <h2>配置变更工作台</h2>
            <Plus size={18} />
          </div>
          {!canEditConfig ? (
            <PermissionNotice
              title="当前角色只读"
              message={`${user.role} 可以查看配置，但不能创建配置草稿或发起配置审批。`}
            />
          ) : null}
          <div className="config-form">
            <label>
              <span>配置类型</span>
              <select value={draftType} onChange={(event) => setDraftType(event.target.value as ConfigItem["type"])}>
                {configTypes.filter((type) => type !== "全部").map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label>
              <span>影响客户</span>
              <select value={draftCustomerId} onChange={(event) => setDraftCustomerId(event.target.value)}>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.shortName}</option>)}
              </select>
            </label>
            <label>
              <span>变更名称</span>
              <input value={draftName} onChange={(event) => setDraftName(event.target.value)} />
            </label>
            <button disabled={!canEditConfig} onClick={createDraft}>创建草稿并生成审批说明</button>
          </div>
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>治理工作台</h2>
            <span className="status status-pending">Phase 11</span>
          </div>
          <div className="process-lane">
            <div><strong>字段治理</strong><span>配置字段先按领域模型设计，真实 API 到位后通过 BFF 或配置表映射。</span></div>
            <div><strong>规则校验</strong><span>校验字段缺失、额度超限、生效期重叠、审批路径缺失。</span></div>
            <div><strong>版本审批</strong><span>草稿、复核、审批、生效都保留版本和审批意见。</span></div>
            <div><strong>回滚审计</strong><span>历史版本可形成回滚预览，所有操作进入审计记录。</span></div>
          </div>
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>配置治理明细</h2>
            <ShieldCheck size={18} />
          </div>
          <DataTable
            columns={["配置", "关键参数", "校验", "审批节点", "版本", "最近审计"]}
            rows={visibleConfigs.map((config) => [
              config.name,
              config.parameters?.slice(0, 2).map((item) => `${item.label}: ${item.value}`).join(" / ") ?? "-",
              config.validationResults?.map((item) => item.level).join(" / ") ?? "-",
              config.approvalFlow?.map((node) => `${node.nodeName}:${node.status}`).join(" / ") ?? "-",
              config.versions?.map((version) => `${version.version}:${version.status}`).join(" / ") ?? "-",
              config.auditLogs?.[0]?.detail ?? "-",
            ])}
          />
        </section>
      </div>
    </>
  );
}

export function OpportunitiesPage({
  data,
  openOpportunity,
  openCustomer,
  openOrder,
}: {
  data: ConsoleDataSnapshot;
  openOpportunity: (id: string) => void;
  openCustomer: (id: string) => void;
  openOrder: (id: string) => void;
}) {
  const { customers, opportunities, opportunityAttributions } = data;
  const totalExpected = opportunities.reduce((sum, opportunity) => sum + opportunity.expectedAmount, 0);
  const totalRevenue = opportunityAttributions.reduce((sum, attribution) => sum + attribution.revenueAmount, 0);
  const totalFee = opportunityAttributions.reduce((sum, attribution) => sum + attribution.feeAmount, 0);
  const maintenanceFee = opportunityAttributions.reduce((sum, attribution) => sum + attribution.salesMaintenanceFee, 0);
  const serviceFee = opportunityAttributions.reduce((sum, attribution) => sum + attribution.distributionServiceFee, 0);
  const netContribution = opportunityAttributions.reduce((sum, attribution) => sum + attribution.netContribution, 0);
  const linkedCustomers = new Set(opportunities.flatMap((opportunity) => opportunity.customerIds)).size;
  const linkedOrders = opportunities.reduce((sum, opportunity) => sum + opportunity.linkedOrders.length, 0);

  return (
    <>
      <PageHeader
        eyebrow="Opportunity Attribution"
        title="商机归因"
        description="展示从销售拜访、商机创建、客户交易关联、持仓收入形成到业绩分配的可追溯链路。"
      />
      <div className="metric-grid">
        <article className="metric-card"><span>商机预计金额</span><strong>{formatMoney(totalExpected)}</strong><em className="metric-neutral">3 条活跃链路</em></article>
        <article className="metric-card"><span>维护费收入</span><strong>{formatMoney(maintenanceFee)}</strong><em className="metric-good">客户维护费</em></article>
        <article className="metric-card"><span>销售服务费</span><strong>{formatMoney(serviceFee)}</strong><em className="metric-good">销售服务费</em></article>
        <article className="metric-card"><span>净贡献</span><strong>{formatMoney(netContribution)}</strong><em className="metric-good">可追溯业绩</em></article>
      </div>
      <div className="content-grid">
        <section className="panel span-12">
          <div className="panel-title">
            <h2>收入关系链路</h2>
            <span className="status status-pending">多对多归因</span>
          </div>
          <div className="opportunity-flow">
            <article><span>1</span><strong>销售拜访客户</strong><em>记录主办/协同销售与分配比例</em></article>
            <article><span>2</span><strong>创建商机</strong><em>商机可关联多个客户，限定可归因客户池</em></article>
            <article><span>3</span><strong>客户下交易</strong><em>只有关联客户的交易才能挂接商机</em></article>
            <article><span>4</span><strong>交易形成持仓</strong><em>持仓产生客户维护费和销售服务费</em></article>
            <article><span>5</span><strong>归因到商机</strong><em>一笔交易可按比例归因到多个商机</em></article>
          </div>
          <div className="opportunity-rule-strip">
            <span>{linkedCustomers} 个关联客户</span>
            <span>{linkedOrders} 条商机-交易关系</span>
            <span>{formatMoney(totalRevenue)} 总收入 = 维护费 + 销售服务费</span>
            <span>{formatMoney(totalFee)} 费用抵扣</span>
          </div>
        </section>
        <section className="panel span-7">
          <div className="panel-title">
            <h2>商机与业绩</h2>
            <BriefcaseBusiness size={18} />
          </div>
          <DataTable
            columns={["商机", "关联客户", "关联交易", "销售分配", "阶段", "预计金额", "归因收入"]}
            rows={opportunities.map((opportunity) => {
              const opportunityCustomers = customers.filter((item) => opportunity.customerIds.includes(item.id));
              return [
                <TextButton onClick={() => openOpportunity(opportunity.id)}>{opportunity.name}</TextButton>,
                opportunityCustomers.map((customer) => (
                  <TextButton key={customer.id} onClick={() => openCustomer(customer.id)}>{customer.shortName}</TextButton>
                )),
                opportunity.linkedOrders.map((link) => (
                  <TextButton key={link.orderId} onClick={() => openOrder(link.orderId)}>{link.orderId} · {link.allocationRatio}%</TextButton>
                )),
                opportunity.salesSplits.map((split) => `${split.salesName} ${split.ratio}%`).join(" / "),
                opportunity.stage,
                formatMoney(opportunity.expectedAmount),
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
            <div><strong>客户池校验</strong><span>交易客户必须已关联到商机，否则不能挂接该商机。</span></div>
            <div><strong>交易比例确认</strong><span>同一笔交易可关联多个商机，但归因比例需要人工确认。</span></div>
            <div><strong>销售分配确认</strong><span>同一商机可关联多个销售，按分配比例沉淀业绩。</span></div>
            <div><strong>收入拆分</strong><span>客户维护费与销售服务费共同构成代销业务收入。</span></div>
          </div>
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>归因明细</h2>
            <ChartNoAxesCombined size={18} />
          </div>
          <DataTable
            columns={["商机", "订单", "交易归因", "客户维护费", "销售服务费", "总收入", "费用", "净贡献", "规则", "置信度"]}
            rows={opportunityAttributions.map((attribution) => {
              const opportunity = opportunities.find((item) => item.id === attribution.opportunityId);
              return [
                opportunity ? <TextButton onClick={() => openOpportunity(opportunity.id)}>{opportunity.name}</TextButton> : "-",
                <TextButton onClick={() => openOrder(attribution.orderId)}>{attribution.orderId}</TextButton>,
                `${attribution.opportunityAllocationRatio}%`,
                formatMoney(attribution.salesMaintenanceFee),
                formatMoney(attribution.distributionServiceFee),
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
  data,
  user,
  createPreview,
  operationRecords,
  updateOperationStatus,
  runtimeAgentTasks,
}: {
  data: ConsoleDataSnapshot;
  user: CurrentUser;
  createPreview: (preview: ActionPreview) => void;
  operationRecords: OperationRecord[];
  updateOperationStatus: (id: string, status: OperationRecord["status"]) => void;
  runtimeAgentTasks: AgentTask[];
}) {
  const { agentAuditLogs, agentGovernanceRules, agentTasks, assistantActions, risks } = data;
  const visibleAgentTasks = [...runtimeAgentTasks, ...agentTasks];
  const highRiskTasks = visibleAgentTasks.filter((task) => task.riskLevel === "高").length;
  const pendingReviewTasks = visibleAgentTasks.filter((task) => task.humanReview === "待审核" || task.status === "待人审").length;
  const externalDrafts = agentAuditLogs.filter((log) => log.externalEffect !== "无").length;
  const canExecuteAi = can(user, "execute:ai");
  const canApproveOperation = can(user, "approve:operation");
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
      <div className="metric-grid">
        <article className="metric-card"><span>Agent 任务</span><strong>{visibleAgentTasks.length}</strong><em className="metric-neutral">含运行时任务</em></article>
        <article className="metric-card"><span>待人审</span><strong>{pendingReviewTasks}</strong><em className="metric-risk">需人工确认</em></article>
        <article className="metric-card"><span>高风险任务</span><strong>{highRiskTasks}</strong><em className="metric-risk">不可自动执行</em></article>
        <article className="metric-card"><span>外部草稿</span><strong>{externalDrafts}</strong><em className="metric-neutral">无直接外发</em></article>
      </div>
      <div className="content-grid">
        <section className="panel span-5">
          <div className="panel-title">
            <h2>推荐问题</h2>
            <Bot size={18} />
          </div>
          <div className="prompt-list">
            <button disabled={!canExecuteAi} onClick={() => createPreview(previewFromAction("A001"))}>解释东海资管赎回为什么未确认</button>
            <button disabled={!canExecuteAi} onClick={() => createPreview(buildReportPreview())}>生成本周机构客户经营报告</button>
            <button disabled={!canExecuteAi} onClick={() => createPreview(buildScheduledTaskPreview())}>创建每日 9 点异常交易推送</button>
            <button disabled={!canExecuteAi} onClick={() => createPreview({
              type: "异常解释",
              title: "华北城投资产变化原因",
              context: "客户全景 / 华北城投",
              summary: "资产变化主要来自近期申购流入、产品净值波动和收益分配，当前无异常赎回压力。",
              steps: ["汇总交易、持仓和行情数据", "拆解申购流入、净值波动和收益分配", "生成客户经营解释草稿"],
              requiresApproval: false,
            })}>分析华北城投资产变化原因</button>
          </div>
          {!canExecuteAi ? (
            <PermissionNotice title="AI 动作受限" message={`${user.role} 当前不能生成 AI 动作预览。`} />
          ) : null}
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
                <button disabled={!canExecuteAi} onClick={() => createPreview(previewFromAction(action.id))}>生成预览</button>
              </article>
            ))}
          </div>
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>动作草稿与审批占位</h2>
            <span className="status status-draft">mock 队列</span>
          </div>
          <OperationQueue
            records={operationRecords}
            onStatusChange={updateOperationStatus}
            canOperate={canApproveOperation}
          />
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>Agent 任务编排</h2>
            <span className="status status-pending">Phase 4</span>
          </div>
          <DataTable
            columns={["Agent", "任务", "上下文", "状态", "风险", "人审", "输出物"]}
            rows={visibleAgentTasks.map((task) => [
              task.agentName,
              task.title,
              task.context,
              task.status,
              task.riskLevel,
              task.humanReview ?? "-",
              task.outputArtifacts?.join(" / ") ?? "-",
            ])}
          />
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>Agent 治理边界</h2>
            <span className="status status-pending">Phase 12</span>
          </div>
          <DataTable
            columns={["Agent", "允许动作", "禁止动作", "人审", "最高风险", "数据源", "审计要求"]}
            rows={agentGovernanceRules.map((rule) => [
              rule.agentName,
              rule.allowedActions.join(" / "),
              rule.forbiddenActions.join(" / "),
              rule.requiresHumanReview ? "必须" : "按风险",
              <span className={`priority priority-${rule.maxRiskLevel === "高" ? "高" : rule.maxRiskLevel === "中" ? "中" : "低"}`}>{rule.maxRiskLevel}</span>,
              rule.dataSources.join(" / "),
              rule.auditRequirement,
            ])}
          />
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>Agent 审计记录</h2>
            <ShieldCheck size={18} />
          </div>
          <DataTable
            columns={["时间", "触发人", "Agent", "动作", "访问数据", "输出", "人审", "外部影响"]}
            rows={agentAuditLogs.map((log) => [
              log.at,
              log.triggeredBy,
              log.agentName,
              log.action,
              log.dataAccessed.join(" / "),
              log.output,
              log.humanReviewStatus,
              log.externalEffect,
            ])}
          />
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>AI 安全边界</h2>
            <span className="status status-warning">强制约束</span>
          </div>
          <div className="process-lane">
            <div><strong>只生成草稿</strong><span>报表、邮件、配置、定时任务都先进入草稿或待确认队列。</span></div>
            <div><strong>不绕过审批</strong><span>配置生效、风险关闭、外部发送必须由人工确认。</span></div>
            <div><strong>记录数据来源</strong><span>每个 Agent 任务保留输入数据范围和输出物版本。</span></div>
            <div><strong>高风险人审</strong><span>高风险或外部影响动作默认进入待人审状态。</span></div>
          </div>
        </section>
      </div>
    </>
  );
}

export function IntegrationPage({ apiMode, data }: { apiMode: ApiMode; data: ConsoleDataSnapshot }) {
  const { apiIntegrationModules, integrationChecklist, performanceStrategies } = data;
  const p0Modules = apiIntegrationModules.filter((item) => item.priority === "P0").length;
  const confirmedContracts = apiIntegrationModules.filter((item) => item.contractStatus === "已确认").length;
  const finishedMappings = apiIntegrationModules.filter((item) => item.mappingStatus === "已完成").length;
  const completedChecklist = integrationChecklist.filter((item) => item.status === "已完成").length;
  const highRiskModules = apiIntegrationModules.filter((item) => item.performanceRisk === "高").length;
  const modeForModule = (priority: string) => {
    if (apiMode === "real") return "Real";
    if (apiMode === "hybrid") return priority === "P0" ? "Hybrid" : "Mock";
    return "Mock";
  };

  return (
    <>
      <PageHeader
        eyebrow="API Integration Readiness"
        title="真实 API 接入准备"
        description="在业务接口正式提供前，先固化接口模块、字段映射、阻塞点和联调验收清单。"
      />
      <div className="metric-grid">
        <article className="metric-card"><span>P0 接口模块</span><strong>{p0Modules}</strong><em className="metric-risk">优先联调</em></article>
        <article className="metric-card"><span>契约已确认</span><strong>{confirmedContracts}</strong><em className="metric-neutral">共 {apiIntegrationModules.length} 个模块</em></article>
        <article className="metric-card"><span>字段映射完成</span><strong>{finishedMappings}</strong><em className="metric-neutral">等待真实样例</em></article>
        <article className="metric-card"><span>高性能风险</span><strong>{highRiskModules}</strong><em className="metric-risk">需 BFF/预计算</em></article>
      </div>
      <div className="content-grid">
        <section className="panel span-12">
          <div className="panel-title">
            <h2>API 切换计划</h2>
            <span className="status status-pending">{apiMode.toUpperCase()}</span>
          </div>
          <DataTable
            columns={["模块", "当前模式", "切换条件", "回滚策略"]}
            rows={apiIntegrationModules.map((module) => [
              module.name,
              modeForModule(module.priority),
              module.priority === "P0" ? "样例响应、状态码、分页筛选、权限范围全部确认" : "P0 稳定后逐步切换",
              "保留 Mock 快照，失败时回退到上一份数据并提示联调错误",
            ])}
          />
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>接口模块与映射状态</h2>
            <PlugZap size={18} />
          </div>
          <DataTable
            columns={["优先级", "模块", "负责方", "数据量", "映射层", "查询下推", "缓存", "性能风险"]}
            rows={apiIntegrationModules.map((module) => [
              <span className={`priority priority-${module.priority === "P0" ? "高" : module.priority === "P1" ? "中" : "低"}`}>{module.priority}</span>,
              module.name,
              module.owner,
              module.dataVolume,
              module.mappingLayer,
              module.queryPushdown,
              module.cacheStrategy,
              <span className={`priority priority-${module.performanceRisk === "高" ? "高" : module.performanceRisk === "中" ? "中" : "低"}`}>{module.performanceRisk}</span>,
            ])}
          />
        </section>
        <section className="panel span-12">
          <div className="panel-title">
            <h2>BFF 性能边界</h2>
            <span className="status status-pending">Phase 10</span>
          </div>
          <DataTable
            columns={["场景", "前端边界", "BFF 职责", "后端职责", "风险"]}
            rows={performanceStrategies.map((item) => [
              item.scenario,
              item.frontendBoundary,
              item.bffResponsibility,
              item.backendResponsibility,
              <span className={`priority priority-${item.risk === "高" ? "高" : item.risk === "中" ? "中" : "低"}`}>{item.risk}</span>,
            ])}
          />
        </section>
        <section className="panel span-7">
          <div className="panel-title">
            <h2>接入验收清单</h2>
            <span className="status status-draft">完成 {completedChecklist}/{integrationChecklist.length}</span>
          </div>
          <DataTable
            columns={["类别", "事项", "负责人", "状态"]}
            rows={integrationChecklist.map((item) => [
              item.category,
              item.title,
              item.owner,
              item.status,
            ])}
          />
        </section>
        <section className="panel span-5">
          <div className="panel-title">
            <h2>接入顺序建议</h2>
            <span className="status status-pending">Phase 9</span>
          </div>
          <div className="timeline">
            <div><strong>轻量映射留前端</strong><span>只保留字段改名、状态展示、空值兜底和当前页渲染。</span></div>
            <div><strong>重映射进 BFF</strong><span>分页、筛选、权限、状态归一、多接口聚合和缓存由 BFF 承担。</span></div>
            <div><strong>高成本计算异步化</strong><span>归因、报表、资产解释等高成本场景使用预计算或物化快照。</span></div>
          </div>
        </section>
      </div>
    </>
  );
}
