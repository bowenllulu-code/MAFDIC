export type Status = "active" | "pending" | "warning" | "closed" | "draft";

export type PageId =
  | "workspace"
  | "customers"
  | "transactions"
  | "risks"
  | "performance"
  | "configs"
  | "opportunities"
  | "assistant"
  | "integration";

export type UserRole = "运营岗" | "清算岗" | "配置岗" | "风控岗" | "管理者" | "系统管理员";

export type Permission =
  | `view:${PageId}`
  | "operate:queue"
  | "approve:operation"
  | "edit:config"
  | "approve:config"
  | "execute:ai"
  | "view:all-data";

export type CurrentUser = {
  id: string;
  name: string;
  role: UserRole;
  dataScope: "本人客户" | "所属团队" | "全机构" | "全系统";
  permissions: Permission[];
};

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
  serviceTier: string;
  investmentPreference: string;
  operationFocus: string;
  nextBestActions: string[];
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
  confirmationBlocker: string;
  assetImpact: string;
  settlementTrail: string[];
  nextActions: string[];
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
  currentBlocker: string;
  nextActions: string[];
  handlingRecords: string[];
};

export type Opportunity = {
  id: string;
  name: string;
  customerId: string;
  customerIds: string[];
  linkedOrderId?: string;
  linkedOrders: { orderId: string; allocationRatio: number; note: string }[];
  salesSplits: { salesName: string; role: string; ratio: number }[];
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
  opportunityAllocationRatio: number;
  salesMaintenanceFee: number;
  distributionServiceFee: number;
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
  parameters?: Array<{ label: string; value: string }>;
  validationResults?: ConfigValidationResult[];
  approvalFlow?: ApprovalFlowNode[];
  versions?: ConfigVersion[];
  auditLogs?: ConfigAuditLog[];
};

export type ConfigValidationResult = {
  id: string;
  level: "通过" | "提醒" | "阻断";
  title: string;
  detail: string;
};

export type ApprovalFlowNode = {
  id: string;
  nodeName: string;
  assignee: string;
  status: "未开始" | "待处理" | "已通过" | "已驳回";
  opinion: string;
  handledAt?: string;
};

export type ConfigVersion = {
  id: string;
  version: string;
  status: "当前生效" | "草稿" | "历史版本" | "可回滚";
  changedBy: string;
  changedAt: string;
  summary: string;
};

export type ConfigAuditLog = {
  id: string;
  actor: string;
  action: string;
  at: string;
  detail: string;
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
  sensitivity?: "内部" | "敏感" | "高敏";
  metricVersion?: string;
  dataSources?: string[];
  requiresApproval?: boolean;
};

export type MetricDefinition = {
  id: string;
  name: string;
  domain: "资产" | "交易" | "营收" | "风险" | "商机";
  formula: string;
  owner: string;
  updateFrequency: string;
  version?: string;
};

export type ReportGenerationRecord = {
  id: string;
  templateId: string;
  triggeredBy: string;
  generatedAt: string;
  status: "生成中" | "待审批" | "已完成" | "失败";
  outputArtifact: string;
  approvalStatus: "无需审批" | "待审批" | "已通过" | "已驳回";
  deliveryStatus: "未推送" | "待推送" | "已推送" | "推送失败";
  failureReason?: string;
};

export type ScheduledReportTask = {
  id: string;
  templateId: string;
  cadence: string;
  recipients: string[];
  dataScope: string;
  status: "启用" | "暂停" | "草稿";
  lastRun: string;
  nextRun: string;
  lastResult: "成功" | "失败" | "待运行";
  requiresApproval: boolean;
};

export type AgentTask = {
  id: string;
  agentName: "数据分析 Agent" | "报表 Agent" | "调度 Agent" | "邮件 Agent" | "配置 Agent" | "风险 Agent" | "知识 Agent";
  title: string;
  context: string;
  status: "待执行" | "执行中" | "待人审" | "已完成" | "已暂停" | "已取消" | "执行失败";
  riskLevel: "低" | "中" | "高";
  lastUpdate: string;
  inputSources?: string[];
  executionSteps?: string[];
  outputArtifacts?: string[];
  humanReview?: "不需要" | "待审核" | "已通过" | "已驳回";
};

export type AgentGovernanceRule = {
  id: string;
  agentName: AgentTask["agentName"];
  allowedActions: string[];
  forbiddenActions: string[];
  requiresHumanReview: boolean;
  maxRiskLevel: "低" | "中" | "高";
  dataSources: string[];
  auditRequirement: string;
};

export type AgentAuditLog = {
  id: string;
  taskId: string;
  agentName: AgentTask["agentName"];
  triggeredBy: string;
  action: string;
  dataAccessed: string[];
  output: string;
  humanReviewStatus: "无需人审" | "待人审" | "已通过" | "已驳回";
  externalEffect: "无" | "邮件草稿" | "定时任务草稿" | "配置草稿" | "报表草稿";
  at: string;
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

export type ApiIntegrationModule = {
  id: string;
  name: string;
  owner: string;
  priority: "P0" | "P1" | "P2";
  contractStatus: "待提供" | "待确认" | "已确认";
  mappingStatus: "未开始" | "映射中" | "已完成";
  mockEndpoint: string;
  realEndpoint: string;
  blocker: string;
  dataVolume: "小" | "中" | "大";
  mappingLayer: "前端轻量" | "BFF 标准化" | "后端预计算";
  queryPushdown: "必须" | "建议" | "可选";
  cacheStrategy: "不缓存" | "字典缓存" | "短期缓存" | "物化快照";
  performanceRisk: "低" | "中" | "高";
};

export type PerformanceStrategyItem = {
  id: string;
  scenario: string;
  frontendBoundary: string;
  bffResponsibility: string;
  backendResponsibility: string;
  risk: "低" | "中" | "高";
};

export type IntegrationChecklistItem = {
  id: string;
  title: string;
  category: "契约" | "字段" | "安全" | "联调" | "验收";
  status: "未开始" | "进行中" | "已完成";
  owner: string;
};
