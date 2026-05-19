import type {
  AssistantAction,
  ConfigItem,
  Customer,
  Holding,
  Metric,
  Opportunity,
  RiskEvent,
  Task,
  TransactionOrder,
  ReportTemplate,
  MetricDefinition,
  OpportunityAttribution,
  AgentTask,
} from "./domain";

export type ConsoleDataProvider = {
  getMetrics(): Metric[];
  getCustomers(): Customer[];
  getOrders(): TransactionOrder[];
  getHoldings(): Holding[];
  getRiskEvents(): RiskEvent[];
  getOpportunities(): Opportunity[];
  getConfigItems(): ConfigItem[];
  getTasks(): Task[];
  getAssistantActions(): AssistantAction[];
  getReportTemplates(): ReportTemplate[];
  getMetricDefinitions(): MetricDefinition[];
  getOpportunityAttributions(): OpportunityAttribution[];
  getAgentTasks(): AgentTask[];
};

export type ConsoleDataSnapshot = {
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

export type ApiResponse<T> =
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

export type PageResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type ListQuery = {
  keyword?: string;
  page?: number;
  pageSize?: number;
};

export type CustomerQuery = ListQuery & {
  riskLevel?: string;
  status?: Customer["status"];
};

export type OrderQuery = ListQuery & {
  customerId?: string;
  confirmationStatus?: TransactionOrder["confirmationStatus"];
};

export type RiskQuery = ListQuery & {
  severity?: RiskEvent["severity"];
  status?: RiskEvent["status"];
};

export type ConfigQuery = ListQuery & {
  type?: ConfigItem["type"];
  status?: ConfigItem["status"];
};

export type OpportunityQuery = ListQuery & {
  customerId?: string;
  stage?: string;
};

export type ConsoleApiClient = {
  getConsoleSnapshot(): Promise<ApiResponse<ConsoleDataSnapshot>>;
  searchCustomers(query?: CustomerQuery): Promise<ApiResponse<PageResult<Customer>>>;
  searchOrders(query?: OrderQuery): Promise<ApiResponse<PageResult<TransactionOrder>>>;
  searchHoldings(query?: ListQuery & { customerId?: string }): Promise<ApiResponse<PageResult<Holding>>>;
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

export function snapshotFromProvider(provider: ConsoleDataProvider): ConsoleDataSnapshot {
  return {
    metrics: provider.getMetrics(),
    customers: provider.getCustomers(),
    orders: provider.getOrders(),
    holdings: provider.getHoldings(),
    risks: provider.getRiskEvents(),
    opportunities: provider.getOpportunities(),
    configs: provider.getConfigItems(),
    tasks: provider.getTasks(),
    assistantActions: provider.getAssistantActions(),
    reportTemplates: provider.getReportTemplates(),
    metricDefinitions: provider.getMetricDefinitions(),
    opportunityAttributions: provider.getOpportunityAttributions(),
    agentTasks: provider.getAgentTasks(),
  };
}
