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
