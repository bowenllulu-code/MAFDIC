import {
  AlertTriangle,
  Bot,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  Gauge,
  Landmark,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { snapshotFromProvider, type ApiResponse, type ConsoleDataSnapshot } from "./adapters";
import { ActionPreviewModal, DetailDrawer } from "./components/overlays";
import { mockApiClient } from "./mockApi";
import { mockProvider } from "./mockProvider";
import {
  AssistantPage,
  ConfigsPage,
  CustomersPage,
  OpportunitiesPage,
  PerformancePage,
  RisksPage,
  TransactionsPage,
  WorkspacePage,
} from "./pages/consolePages";
import type { ActionPreview, AgentTask, DrawerState, OperationRecord, PageId } from "./domain";

const initialData = snapshotFromProvider(mockProvider);

const navigation: Array<{ id: PageId; label: string; icon: typeof Gauge }> = [
  { id: "workspace", label: "综合工作台", icon: Gauge },
  { id: "customers", label: "客户全景图", icon: Building2 },
  { id: "transactions", label: "交易与资产", icon: Landmark },
  { id: "risks", label: "风险异常", icon: AlertTriangle },
  { id: "performance", label: "经营分析", icon: ChartNoAxesCombined },
  { id: "configs", label: "运营配置", icon: SlidersHorizontal },
  { id: "opportunities", label: "商机归因", icon: BriefcaseBusiness },
  { id: "assistant", label: "AI 助手", icon: Bot },
];

function App() {
  const [activePage, setActivePage] = useState<PageId>("workspace");
  const [consoleData, setConsoleData] = useState<ConsoleDataSnapshot>(initialData);
  const [apiState, setApiState] = useState<"loading" | "ready" | "error">("loading");
  const [apiTrace, setApiTrace] = useState("mock-api 初始化中");
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialData.customers[0].id);
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [actionPreview, setActionPreview] = useState<ActionPreview | null>(null);
  const [operationRecords, setOperationRecords] = useState<OperationRecord[]>([]);
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>([]);
  const current = useMemo(() => navigation.find((item) => item.id === activePage), [activePage]);
  const loadModularConsoleData = async (): Promise<ApiResponse<ConsoleDataSnapshot>> => {
    const [
      metrics,
      customers,
      orders,
      holdings,
      risks,
      opportunities,
      configs,
      tasks,
      assistantActions,
      reportTemplates,
      metricDefinitions,
      opportunityAttributions,
      baseAgentTasks,
    ] = await Promise.all([
      mockApiClient.listMetrics(),
      mockApiClient.searchCustomers({ pageSize: 100 }),
      mockApiClient.searchOrders({ pageSize: 100 }),
      mockApiClient.searchHoldings({ pageSize: 100 }),
      mockApiClient.searchRisks({ pageSize: 100 }),
      mockApiClient.searchOpportunities({ pageSize: 100 }),
      mockApiClient.searchConfigs({ pageSize: 100 }),
      mockApiClient.searchTasks({ pageSize: 100 }),
      mockApiClient.listAssistantActions(),
      mockApiClient.listReportTemplates(),
      mockApiClient.listMetricDefinitions(),
      mockApiClient.listOpportunityAttributions(),
      mockApiClient.listAgentTasks(),
    ]);
    const responses = [
      metrics,
      customers,
      orders,
      holdings,
      risks,
      opportunities,
      configs,
      tasks,
      assistantActions,
      reportTemplates,
      metricDefinitions,
      opportunityAttributions,
      baseAgentTasks,
    ];
    const failed = responses.find((response) => !response.ok);
    if (failed && !failed.ok) {
      return failed;
    }
    return {
      ok: true,
      traceId: customers.ok ? customers.traceId : "mock-api",
      source: "mock-api" as const,
      receivedAt: new Date().toISOString(),
      data: {
        metrics: metrics.ok ? metrics.data : [],
        customers: customers.ok ? customers.data.items : [],
        orders: orders.ok ? orders.data.items : [],
        holdings: holdings.ok ? holdings.data.items : [],
        risks: risks.ok ? risks.data.items : [],
        opportunities: opportunities.ok ? opportunities.data.items : [],
        configs: configs.ok ? configs.data.items : [],
        tasks: tasks.ok ? tasks.data.items : [],
        assistantActions: assistantActions.ok ? assistantActions.data : [],
        reportTemplates: reportTemplates.ok ? reportTemplates.data : [],
        metricDefinitions: metricDefinitions.ok ? metricDefinitions.data : [],
        opportunityAttributions: opportunityAttributions.ok ? opportunityAttributions.data : [],
        agentTasks: baseAgentTasks.ok ? baseAgentTasks.data : [],
      },
    };
  };
  const loadConsoleData = async () => {
    setApiState("loading");
    const response = await loadModularConsoleData();
    if (response.ok) {
      setConsoleData(response.data);
      setApiState("ready");
      setApiTrace(`${response.source} modules · ${response.traceId}`);
      return;
    }
    setApiState("error");
    setApiTrace(`${response.error.code} · ${response.error.message}`);
  };

  useEffect(() => {
    let ignore = false;
    void loadModularConsoleData().then((response) => {
      if (ignore) return;
      if (response.ok) {
        setConsoleData(response.data);
        setApiState("ready");
        setApiTrace(`${response.source} modules · ${response.traceId}`);
        return;
      }
      setApiState("error");
      setApiTrace(`${response.error.code} · ${response.error.message}`);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const jumpToCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setActivePage("customers");
    setDrawer(null);
  };
  const openCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setActivePage("customers");
  };
  const openOrder = (id: string) => setDrawer({ type: "order", id });
  const openRisk = (id: string) => setDrawer({ type: "risk", id });
  const openOpportunity = (id: string) => setDrawer({ type: "opportunity", id });
  const openConfig = (id: string) => setDrawer({ type: "config", id });
  const updateOperationStatus = (id: string, status: OperationRecord["status"]) => {
    setOperationRecords((currentRecords) =>
      currentRecords.map((record) =>
        record.id === id
          ? {
              ...record,
              status,
              auditTrail: [`${status} · 刚刚`, ...record.auditTrail],
            }
          : record,
      ),
    );
  };
  const saveActionPreview = (preview: ActionPreview) => {
    const idSuffix = Date.now();
    const record: OperationRecord = {
      id: `OP-${idSuffix}`,
      title: preview.title,
      type: preview.type,
      context: preview.context,
      status: preview.requiresApproval ? "待确认" : "草稿",
      createdAt: "刚刚",
      auditTrail: [`${preview.requiresApproval ? "进入待确认" : "保存草稿"} · 刚刚`],
    };
    const agentTask: AgentTask = {
      id: `AGT-${idSuffix}`,
      agentName:
        preview.type === "报表预览"
          ? "报表 Agent"
          : preview.type === "定时任务"
            ? "调度 Agent"
            : preview.type === "邮件草稿"
              ? "邮件 Agent"
              : preview.type === "审批说明"
                ? "配置 Agent"
                : preview.type === "归因说明"
                  ? "数据分析 Agent"
                  : "风险 Agent",
      title: preview.title,
      context: preview.context,
      status: preview.requiresApproval ? "待人审" : "已完成",
      riskLevel: preview.requiresApproval ? "中" : "低",
      lastUpdate: "刚刚",
    };
    setOperationRecords((currentRecords) => [record, ...currentRecords]);
    setAgentTasks((currentTasks) => [agentTask, ...currentTasks]);
    setActionPreview(null);
    setActivePage(preview.type === "归因说明" ? "opportunities" : "workspace");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div>MA</div>
          <span>
            <strong>MAFDIC</strong>
            <em>Fund Distribution Insight Claw</em>
          </span>
        </div>
        <nav>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={item.id === activePage ? "active" : ""}
                key={item.id}
                onClick={() => setActivePage(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <main>
        <header className="topbar">
          <div>
            <span>当前模块</span>
            <strong>{current?.label}</strong>
          </div>
          <div className="topbar-actions">
            <span className={`api-pill api-pill-${apiState}`}>{apiTrace}</span>
            <button title="刷新 Mock API 数据" onClick={() => void loadConsoleData()}><RefreshCw size={18} /></button>
            <button title="全局搜索"><Search size={18} /></button>
            <button title="AI 助手" onClick={() => setActivePage("assistant")}><Bot size={18} /></button>
          </div>
        </header>
        {apiState === "loading" ? <div className="api-banner">正在从 Mock API 拉取业务快照...</div> : null}
        {apiState === "error" ? <div className="api-banner api-banner-error">Mock API 返回异常，当前保留上一份业务快照。</div> : null}
        <div className="page-body">
          {activePage === "workspace" && (
            <WorkspacePage
              data={consoleData}
              jump={setActivePage}
              operationRecords={operationRecords}
              updateOperationStatus={updateOperationStatus}
            />
          )}
          {activePage === "customers" && (
            <CustomersPage
              data={consoleData}
              selectedCustomerId={selectedCustomerId}
              setSelectedCustomerId={setSelectedCustomerId}
              openOrder={openOrder}
              openOpportunity={openOpportunity}
              openRisk={openRisk}
              jump={setActivePage}
            />
          )}
          {activePage === "transactions" && (
            <TransactionsPage
              data={consoleData}
              selectedCustomerId={selectedCustomerId}
              setSelectedCustomerId={setSelectedCustomerId}
              openOrder={openOrder}
              openCustomer={openCustomer}
            />
          )}
          {activePage === "risks" && <RisksPage data={consoleData} openRisk={openRisk} openCustomer={openCustomer} openOrder={openOrder} />}
          {activePage === "performance" && (
            <PerformancePage
              data={consoleData}
              openCustomer={openCustomer}
              openOpportunity={openOpportunity}
              createPreview={setActionPreview}
            />
          )}
          {activePage === "configs" && (
            <ConfigsPage
              data={consoleData}
              openConfig={openConfig}
              openCustomer={openCustomer}
              createPreview={setActionPreview}
            />
          )}
          {activePage === "opportunities" && <OpportunitiesPage data={consoleData} openOpportunity={openOpportunity} openCustomer={openCustomer} openOrder={openOrder} />}
          {activePage === "assistant" && (
            <AssistantPage
              data={consoleData}
              createPreview={setActionPreview}
              operationRecords={operationRecords}
              updateOperationStatus={updateOperationStatus}
              runtimeAgentTasks={agentTasks}
            />
          )}
        </div>
      </main>
      <DetailDrawer
        data={consoleData}
        drawer={drawer}
        close={() => setDrawer(null)}
        jumpToCustomer={jumpToCustomer}
        openOrder={openOrder}
        createPreview={setActionPreview}
      />
      <ActionPreviewModal preview={actionPreview} close={() => setActionPreview(null)} save={saveActionPreview} />
    </div>
  );
}

export default App;
