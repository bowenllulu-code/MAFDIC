import {
  ArrowRight,
  Banknote,
  Bot,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ClipboardList,
  Plus,
  PlugZap,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import { buildEmailPreview, buildReportPreview, buildScheduledTaskPreview } from "../actionPreviews";
import { DataTable, MetricGrid, OperationQueue, PageHeader, PermissionNotice, StatusBadge, TextButton } from "../components/common";
import { statusLabel } from "../constants";
import type { ConsoleDataSnapshot } from "../adapters";
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
  const { assistantActions, metrics, tasks } = data;
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
  data,
  selectedCustomerId,
  setSelectedCustomerId,
  openOrder,
  openCustomer,
}: {
  data: ConsoleDataSnapshot;
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  openOrder: (id: string) => void;
  openCustomer: (id: string) => void;
}) {
  const { customers, orders } = data;
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
            columns={["订单号", "客户", "基金", "类型", "金额", "状态"]}
            rows={visibleOrders.map((order) => {
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
  data,
  openRisk,
  openCustomer,
  openOrder,
}: {
  data: ConsoleDataSnapshot;
  openRisk: (id: string) => void;
  openCustomer: (id: string) => void;
  openOrder: (id: string) => void;
}) {
  const { risks } = data;
  const [severityFilter, setSeverityFilter] = useState<"全部" | "high" | "medium" | "low">("全部");
  const visibleRisks = risks.filter((risk) => severityFilter === "全部" || risk.severity === severityFilter);
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
  const { customers, metricDefinitions, metrics, opportunities, reportGenerationRecords, reportTemplates, scheduledReportTasks } = data;
  const totalOpportunityRevenue = opportunities.reduce((sum, item) => sum + item.revenueContribution, 0);
  const pendingReportApprovals = reportGenerationRecords.filter((record) => record.approvalStatus === "待审批").length;
  const activeSchedules = scheduledReportTasks.filter((task) => task.status === "启用").length;
  const sensitiveTemplates = reportTemplates.filter((template) => template.sensitivity !== "内部").length;
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

export function IntegrationPage({ data }: { data: ConsoleDataSnapshot }) {
  const { apiIntegrationModules, integrationChecklist, performanceStrategies } = data;
  const p0Modules = apiIntegrationModules.filter((item) => item.priority === "P0").length;
  const confirmedContracts = apiIntegrationModules.filter((item) => item.contractStatus === "已确认").length;
  const finishedMappings = apiIntegrationModules.filter((item) => item.mappingStatus === "已完成").length;
  const completedChecklist = integrationChecklist.filter((item) => item.status === "已完成").length;
  const highRiskModules = apiIntegrationModules.filter((item) => item.performanceRisk === "高").length;

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
