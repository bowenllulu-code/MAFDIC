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

export type ConsoleApiClient = {
  getConsoleSnapshot(): Promise<ApiResponse<ConsoleDataSnapshot>>;
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
