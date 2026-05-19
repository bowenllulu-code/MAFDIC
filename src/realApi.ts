import type { ApiResponse, ConsoleApiClient, ConsoleDataSnapshot } from "./adapters";

function notConfigured<T>(method: string): Promise<ApiResponse<T>> {
  return Promise.resolve({
    ok: false,
    error: {
      code: "REAL_API_NOT_CONFIGURED",
      message: `${method} requires real API base URL and credentials.`,
      retryable: false,
    },
    traceId: `real-missing-${Date.now().toString(36)}`,
    source: "real-api",
    receivedAt: new Date().toISOString(),
  });
}

export const realApiClient: ConsoleApiClient = {
  getConsoleSnapshot: () => notConfigured<ConsoleDataSnapshot>("getConsoleSnapshot"),
  searchCustomers: () => notConfigured("searchCustomers"),
  searchOrders: () => notConfigured("searchOrders"),
  searchHoldings: () => notConfigured("searchHoldings"),
  searchRisks: () => notConfigured("searchRisks"),
  searchOpportunities: () => notConfigured("searchOpportunities"),
  searchConfigs: () => notConfigured("searchConfigs"),
  searchTasks: () => notConfigured("searchTasks"),
  listMetrics: () => notConfigured("listMetrics"),
  listAssistantActions: () => notConfigured("listAssistantActions"),
  listReportTemplates: () => notConfigured("listReportTemplates"),
  listReportGenerationRecords: () => notConfigured("listReportGenerationRecords"),
  listScheduledReportTasks: () => notConfigured("listScheduledReportTasks"),
  listMetricDefinitions: () => notConfigured("listMetricDefinitions"),
  listOpportunityAttributions: () => notConfigured("listOpportunityAttributions"),
  listAgentTasks: () => notConfigured("listAgentTasks"),
  listAgentGovernanceRules: () => notConfigured("listAgentGovernanceRules"),
  listAgentAuditLogs: () => notConfigured("listAgentAuditLogs"),
  listApiIntegrationModules: () => notConfigured("listApiIntegrationModules"),
  listIntegrationChecklist: () => notConfigured("listIntegrationChecklist"),
  listPerformanceStrategies: () => notConfigured("listPerformanceStrategies"),
};
