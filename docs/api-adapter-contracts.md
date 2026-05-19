# API Adapter Contracts

## 1. 目标

MAFDIC 前期使用 mock 数据建设页面和业务交互，后续业务侧会提供真实 API。Adapter 层的目标是让页面、报表和 AI Agent 面向稳定的领域接口工作，而不是直接依赖外部接口字段。

## 2. Adapter 原则

- 外部 API 字段不得直接泄露到 UI 层
- Adapter 负责字段转换、状态归一、错误归一和分页归一
- Adapter 返回 MAFDIC domain model
- Adapter 保留 `sourceSystem` 和 `sourceId`
- 未来替换 mock provider 时，页面调用方式不变

## 3. 通用返回结构

当前前端原型已实现统一 `ApiResponse<T>`，用于模拟真实接口接入前的 API 边界：

```ts
type ApiResponse<T> =
  | {
      ok: true;
      data: T;
      traceId: string;
      source: "mock-api" | "real-api";
      receivedAt: string;
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
        retryable: boolean;
      };
      traceId: string;
      source: "mock-api" | "real-api";
      receivedAt: string;
    };
```

页面层当前只消费 `ConsoleDataSnapshot`，后续真实 API 可以逐模块替换快照生成逻辑。

```ts
type ConsoleDataSnapshot = {
  metrics: Metric[];
  customers: Customer[];
  orders: TransactionOrder[];
  holdings: Holding[];
  risks: RiskEvent[];
  opportunities: Opportunity[];
  configs: ConfigItem[];
  tasks: Task[];
  assistantActions: AssistantAction[];
  reportTemplates: ReportTemplate[];
  metricDefinitions: MetricDefinition[];
  opportunityAttributions: OpportunityAttribution[];
  agentTasks: AgentTask[];
};
```

### PageResult

```ts
type PageResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
```

当前 Mock API 已按模块暴露查询接口，页面快照由这些接口并行组装：

```ts
type ConsoleApiClient = {
  getConsoleSnapshot(): Promise<ApiResponse<ConsoleDataSnapshot>>;
  searchCustomers(query?: CustomerQuery): Promise<ApiResponse<PageResult<Customer>>>;
  searchOrders(query?: OrderQuery): Promise<ApiResponse<PageResult<TransactionOrder>>>;
  searchHoldings(query?: HoldingQuery): Promise<ApiResponse<PageResult<Holding>>>;
  searchRisks(query?: RiskQuery): Promise<ApiResponse<PageResult<RiskEvent>>>;
  searchOpportunities(query?: OpportunityQuery): Promise<ApiResponse<PageResult<Opportunity>>>;
  searchConfigs(query?: ConfigQuery): Promise<ApiResponse<PageResult<ConfigItem>>>;
  searchTasks(query?: ListQuery): Promise<ApiResponse<PageResult<Task>>>;
  listMetrics(): Promise<ApiResponse<Metric[]>>;
  listAssistantActions(): Promise<ApiResponse<AssistantAction[]>>;
  listReportTemplates(): Promise<ApiResponse<ReportTemplate[]>>;
  listMetricDefinitions(): Promise<ApiResponse<MetricDefinition[]>>;
  listOpportunityAttributions(): Promise<ApiResponse<OpportunityAttribution[]>>;
  listAgentTasks(): Promise<ApiResponse<AgentTask[]>>;
};
```

### AdapterError

```ts
type AdapterError = {
  code: string;
  message: string;
  sourceSystem?: string;
  sourceTraceId?: string;
  retryable: boolean;
};
```

## 4. 客户与账户 Adapter

```ts
interface CustomerAdapter {
  searchCustomers(query: CustomerSearchQuery): Promise<PageResult<Customer>>;
  getCustomer(customerId: string): Promise<Customer>;
  getCustomerContacts(customerId: string): Promise<Contact[]>;
  getTradingAccounts(customerId: string): Promise<TradingAccount[]>;
  getFundAccounts(customerId: string): Promise<FundAccount[]>;
  getCustomerOverview(customerId: string): Promise<CustomerOverview>;
}
```

## 5. 交易与资产 Adapter

```ts
interface TransactionAssetAdapter {
  searchOrders(query: TransactionOrderQuery): Promise<PageResult<TransactionOrder>>;
  getOrder(orderId: string): Promise<TransactionOrder>;
  getOrderStatusEvents(orderId: string): Promise<OrderStatusEvent[]>;
  getHoldings(query: HoldingQuery): Promise<PageResult<Holding>>;
  getAssetSnapshots(query: AssetSnapshotQuery): Promise<AssetSnapshot[]>;
  explainAssetChange(query: AssetChangeQuery): Promise<AssetChangeExplanation>;
}
```

## 6. 基金行情 Adapter

```ts
interface FundMarketAdapter {
  searchFunds(query: FundSearchQuery): Promise<PageResult<Fund>>;
  getFund(fundId: string): Promise<Fund>;
  getFundQuotes(query: FundQuoteQuery): Promise<FundMarketQuote[]>;
}
```

## 7. 确认与清算 Adapter

```ts
interface ConfirmationClearingAdapter {
  getConfirmationRecords(orderId: string): Promise<ConfirmationRecord[]>;
  getClearingRecords(orderId: string): Promise<ClearingRecord[]>;
  getReconciliationDifferences(query: ReconciliationQuery): Promise<PageResult<ReconciliationDifference>>;
}
```

## 8. 营收与业绩归因 Adapter

```ts
interface RevenueAttributionAdapter {
  searchRevenueRecords(query: RevenueQuery): Promise<PageResult<RevenueRecord>>;
  searchFeeRecords(query: FeeQuery): Promise<PageResult<FeeRecord>>;
  getPerformanceAttribution(query: AttributionQuery): Promise<PerformanceAttribution[]>;
  getBusinessPerformanceSummary(query: PerformanceSummaryQuery): Promise<BusinessPerformanceSummary>;
}
```

## 9. 商机 Adapter

```ts
interface OpportunityAdapter {
  searchOpportunities(query: OpportunityQuery): Promise<PageResult<SalesOpportunity>>;
  getOpportunity(opportunityId: string): Promise<SalesOpportunity>;
  getOpportunityTransactionLinks(opportunityId: string): Promise<OpportunityTransactionLink[]>;
  getOpportunityPerformance(opportunityId: string): Promise<PerformanceAttribution[]>;
}
```

## 10. 运营配置 Adapter

运营配置中，一部分数据未来可能由 MAFDIC 自己持久化，一部分可能来自外部业务系统。第一版先用统一接口表达。

```ts
interface OperationalConfigAdapter {
  searchAdvanceFundingConfigs(query: AdvanceFundingConfigQuery): Promise<PageResult<AdvanceFundingConfig>>;
  getAdvanceFundingConfig(configId: string): Promise<AdvanceFundingConfig>;
  searchFundingBanks(query: FundingBankQuery): Promise<PageResult<FundingBank>>;
  searchInterestAccrualRules(query: InterestAccrualRuleQuery): Promise<PageResult<InterestAccrualRule>>;
  searchFeeRules(query: FeeRuleQuery): Promise<PageResult<FeeRule>>;
  validateConfigChange(payload: ConfigChangePayload): Promise<ConfigValidationResult>;
}
```

## 11. 风险与异常 Adapter

```ts
interface RiskAdapter {
  searchRiskEvents(query: RiskEventQuery): Promise<PageResult<RiskEvent>>;
  getRiskEvent(riskEventId: string): Promise<RiskEvent>;
  getRiskExplanation(riskEventId: string): Promise<RiskExplanation>;
  getRiskHandlingSuggestions(riskEventId: string): Promise<RiskHandlingSuggestion[]>;
}
```

## 12. 作业、审批与审计 Adapter

```ts
interface WorkflowAdapter {
  searchTasks(query: TaskQuery): Promise<PageResult<Task>>;
  getTask(taskId: string): Promise<Task>;
  searchApprovals(query: ApprovalQuery): Promise<PageResult<ApprovalInstance>>;
  getApproval(approvalId: string): Promise<ApprovalInstance>;
  searchAuditLogs(query: AuditLogQuery): Promise<PageResult<AuditLog>>;
}
```

## 13. AI 助手与报表 Adapter

第一版可以全部由 mock provider 实现，后续再拆分为大模型服务、Agent 编排服务、报表服务和任务调度服务。

```ts
interface AssistantAdapter {
  listConversations(): Promise<AssistantConversation[]>;
  getConversation(conversationId: string): Promise<AssistantConversation>;
  sendMessage(payload: AssistantMessagePayload): Promise<AssistantMessageResult>;
  createActionPreview(payload: AssistantActionPayload): Promise<AssistantActionPreview>;
  approveActionPreview(previewId: string): Promise<AssistantActionPreview>;
}
```

```ts
interface ReportingTaskAdapter {
  listReportDefinitions(): Promise<ReportDefinition[]>;
  previewReport(payload: ReportPreviewPayload): Promise<ReportPreview>;
  createScheduledTask(payload: ScheduledTaskPayload): Promise<ScheduledTask>;
  listScheduledTasks(query: ScheduledTaskQuery): Promise<PageResult<ScheduledTask>>;
}
```

## 14. Mock Provider 要求

第一版 mock provider 应覆盖：

- 至少 5 个机构客户
- 至少 20 笔交易订单
- 至少 10 条持仓记录
- 至少 5 只基金行情
- 至少 8 条商机
- 至少 10 条收入或费用记录
- 至少 6 条风险事件
- 至少 6 条运营配置
- 至少 5 条待办任务
- 至少 5 个 AI 动作预览样例

## 15. 后续真实 API 接入步骤

1. 收集业务侧 API 文档和样例响应
2. 对照 domain model 做字段映射表
3. 标记缺失字段、冗余字段和状态码差异
4. 实现真实 adapter
5. 保留 mock provider 作为本地开发和演示数据源
6. 增加 adapter 层单元测试和契约测试
