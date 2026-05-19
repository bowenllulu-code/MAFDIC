export type Status = "active" | "pending" | "warning" | "closed" | "draft";

export type PageId =
  | "workspace"
  | "customers"
  | "transactions"
  | "risks"
  | "performance"
  | "configs"
  | "opportunities"
  | "assistant";

export type DrawerState =
  | { type: "order"; id: string }
  | { type: "risk"; id: string }
  | { type: "opportunity"; id: string }
  | { type: "config"; id: string }
  | null;

export type Metric = {
  label: string;
  value: string;
  change: string;
  tone: "good" | "neutral" | "risk";
};

export type Customer = {
  id: string;
  name: string;
  shortName: string;
  riskLevel: string;
  relationshipManager: string;
  status: Status;
  tags: string[];
  totalAsset: number;
  revenueYtd: number;
};

export type TransactionOrder = {
  id: string;
  customerId: string;
  fundName: string;
  tradeType: string;
  applyDate: string;
  amount: number;
  orderStatus: Status;
  confirmationStatus: Status;
  channel: string;
};

export type Holding = {
  id: string;
  customerId: string;
  fundName: string;
  shares: number;
  marketValue: number;
  profit: number;
  holdingDate: string;
};

export type RiskEvent = {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  relatedCustomerId: string;
  relatedOrderId?: string;
  relatedCustomer: string;
  triggeredRule: string;
  status: Status;
  detectedAt: string;
  suggestion: string;
};

export type Opportunity = {
  id: string;
  name: string;
  customerId: string;
  linkedOrderId?: string;
  stage: string;
  expectedAmount: number;
  probability: number;
  owner: string;
  revenueContribution: number;
};

export type OpportunityAttribution = {
  id: string;
  opportunityId: string;
  customerId: string;
  orderId: string;
  revenueAmount: number;
  feeAmount: number;
  netContribution: number;
  attributionRule: string;
  attributionOwner: string;
  confidence: number;
};

export type ConfigItem = {
  id: string;
  customerId?: string;
  type: "垫资配置" | "垫资行" | "孳息规则" | "费用规则" | "风控规则";
  name: string;
  status: Status;
  version: string;
  approvalStatus: string;
  effectiveRange: string;
  ownerRole?: string;
  changeReason?: string;
};

export type Task = {
  id: string;
  title: string;
  priority: "高" | "中" | "低";
  owner: string;
  dueAt: string;
  status: Status;
};

export type AssistantAction = {
  id: string;
  title: string;
  type: "报表" | "定时任务" | "邮件" | "配置说明" | "异常解释";
  description: string;
  requiresApproval: boolean;
};

export type ReportTemplate = {
  id: string;
  name: string;
  reportType: "经营周报" | "风险日报" | "商机归因报告";
  ownerRole: string;
  cadence: string;
  description: string;
};

export type MetricDefinition = {
  id: string;
  name: string;
  domain: "资产" | "交易" | "营收" | "风险" | "商机";
  formula: string;
  owner: string;
  updateFrequency: string;
};

export type AgentTask = {
  id: string;
  agentName: "数据分析 Agent" | "报表 Agent" | "调度 Agent" | "邮件 Agent" | "配置 Agent" | "风险 Agent" | "知识 Agent";
  title: string;
  context: string;
  status: "待执行" | "执行中" | "待人审" | "已完成";
  riskLevel: "低" | "中" | "高";
  lastUpdate: string;
};

export type ActionPreview = {
  title: string;
  type: "异常解释" | "报表预览" | "定时任务" | "邮件草稿" | "审批说明" | "归因说明";
  context: string;
  summary: string;
  steps: string[];
  requiresApproval: boolean;
};

export type OperationRecord = {
  id: string;
  title: string;
  type: ActionPreview["type"];
  context: string;
  status: "草稿" | "待确认" | "已确认" | "已驳回" | "已完成";
  createdAt: string;
  auditTrail: string[];
};
