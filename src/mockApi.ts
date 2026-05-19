import type {
  ApiResponse,
  ConfigQuery,
  ConsoleApiClient,
  ConsoleDataSnapshot,
  CustomerQuery,
  ListQuery,
  OpportunityQuery,
  OrderQuery,
  PageResult,
  RiskQuery,
} from "./adapters";
import { snapshotFromProvider } from "./adapters";
import type { ConfigItem, Customer, Holding, Opportunity, RiskEvent, Task, TransactionOrder } from "./domain";
import { mockProvider } from "./mockProvider";

const MOCK_LATENCY_MS = 320;

function cloneSnapshot(snapshot: ConsoleDataSnapshot): ConsoleDataSnapshot {
  return structuredClone(snapshot);
}

function traceId() {
  return `mock-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function success<T>(data: T): ApiResponse<T> {
  return {
    ok: true,
    data,
    traceId: traceId(),
    source: "mock-api",
    receivedAt: new Date().toISOString(),
  };
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function textIncludes(value: string, keyword?: string) {
  if (!keyword?.trim()) return true;
  return value.toLowerCase().includes(keyword.trim().toLowerCase());
}

function pageItems<T>(items: T[], query?: ListQuery): PageResult<T> {
  const page = Math.max(1, query?.page ?? 1);
  const pageSize = Math.max(1, query?.pageSize ?? 20);
  const start = (page - 1) * pageSize;
  return {
    items: structuredClone(items.slice(start, start + pageSize)),
    page,
    pageSize,
    total: items.length,
  };
}

async function endpoint<T>(data: T): Promise<ApiResponse<T>> {
  await wait(MOCK_LATENCY_MS);
  return success(structuredClone(data));
}

const source = snapshotFromProvider(mockProvider);

export const mockApiClient: ConsoleApiClient = {
  async getConsoleSnapshot() {
    await wait(MOCK_LATENCY_MS);
    return success(cloneSnapshot(source));
  },
  async searchCustomers(query?: CustomerQuery) {
    const items = source.customers.filter((customer: Customer) => {
      const searchText = `${customer.id}${customer.name}${customer.shortName}${customer.relationshipManager}${customer.tags.join("")}`;
      return (
        textIncludes(searchText, query?.keyword) &&
        (!query?.riskLevel || customer.riskLevel === query.riskLevel) &&
        (!query?.status || customer.status === query.status)
      );
    });
    return endpoint(pageItems(items, query));
  },
  async searchOrders(query?: OrderQuery) {
    const items = source.orders.filter((order: TransactionOrder) => {
      const searchText = `${order.id}${order.fundName}${order.tradeType}${order.channel}`;
      return (
        textIncludes(searchText, query?.keyword) &&
        (!query?.customerId || order.customerId === query.customerId) &&
        (!query?.confirmationStatus || order.confirmationStatus === query.confirmationStatus)
      );
    });
    return endpoint(pageItems(items, query));
  },
  async searchHoldings(query?: ListQuery & { customerId?: string }) {
    const items = source.holdings.filter((holding: Holding) => {
      const searchText = `${holding.id}${holding.fundName}`;
      return textIncludes(searchText, query?.keyword) && (!query?.customerId || holding.customerId === query.customerId);
    });
    return endpoint(pageItems(items, query));
  },
  async searchRisks(query?: RiskQuery) {
    const items = source.risks.filter((risk: RiskEvent) => {
      const searchText = `${risk.id}${risk.title}${risk.relatedCustomer}${risk.triggeredRule}`;
      return (
        textIncludes(searchText, query?.keyword) &&
        (!query?.severity || risk.severity === query.severity) &&
        (!query?.status || risk.status === query.status)
      );
    });
    return endpoint(pageItems(items, query));
  },
  async searchOpportunities(query?: OpportunityQuery) {
    const items = source.opportunities.filter((opportunity: Opportunity) => {
      const searchText = `${opportunity.id}${opportunity.name}${opportunity.owner}${opportunity.stage}`;
      return (
        textIncludes(searchText, query?.keyword) &&
        (!query?.customerId || opportunity.customerId === query.customerId) &&
        (!query?.stage || opportunity.stage === query.stage)
      );
    });
    return endpoint(pageItems(items, query));
  },
  async searchConfigs(query?: ConfigQuery) {
    const items = source.configs.filter((config: ConfigItem) => {
      const searchText = `${config.id}${config.name}${config.type}${config.ownerRole ?? ""}${config.changeReason ?? ""}`;
      return (
        textIncludes(searchText, query?.keyword) &&
        (!query?.type || config.type === query.type) &&
        (!query?.status || config.status === query.status)
      );
    });
    return endpoint(pageItems(items, query));
  },
  async searchTasks(query?: ListQuery) {
    const items = source.tasks.filter((task: Task) => {
      const searchText = `${task.id}${task.title}${task.owner}${task.priority}`;
      return textIncludes(searchText, query?.keyword);
    });
    return endpoint(pageItems(items, query));
  },
  async listMetrics() {
    return endpoint(source.metrics);
  },
  async listAssistantActions() {
    return endpoint(source.assistantActions);
  },
  async listReportTemplates() {
    return endpoint(source.reportTemplates);
  },
  async listMetricDefinitions() {
    return endpoint(source.metricDefinitions);
  },
  async listOpportunityAttributions() {
    return endpoint(source.opportunityAttributions);
  },
  async listAgentTasks() {
    return endpoint(source.agentTasks);
  },
  async listApiIntegrationModules() {
    return endpoint(source.apiIntegrationModules);
  },
  async listIntegrationChecklist() {
    return endpoint(source.integrationChecklist);
  },
};
