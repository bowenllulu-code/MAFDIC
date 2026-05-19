import {
  AlertTriangle,
  Bot,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  Gauge,
  Landmark,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ActionPreviewModal, DetailDrawer } from "./components/overlays";
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

const customers = mockProvider.getCustomers();

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
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0].id);
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [actionPreview, setActionPreview] = useState<ActionPreview | null>(null);
  const [operationRecords, setOperationRecords] = useState<OperationRecord[]>([]);
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>([]);
  const current = useMemo(() => navigation.find((item) => item.id === activePage), [activePage]);
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
  const saveActionPreview = (preview: ActionPreview) => {
    const idSuffix = Date.now();
    const record: OperationRecord = {
      id: `OP-${idSuffix}`,
      title: preview.title,
      type: preview.type,
      context: preview.context,
      status: preview.requiresApproval ? "待确认" : "草稿",
      createdAt: "刚刚",
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
            <button title="全局搜索"><Search size={18} /></button>
            <button title="AI 助手" onClick={() => setActivePage("assistant")}><Bot size={18} /></button>
          </div>
        </header>
        <div className="page-body">
          {activePage === "workspace" && <WorkspacePage jump={setActivePage} operationRecords={operationRecords} />}
          {activePage === "customers" && (
            <CustomersPage
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
              selectedCustomerId={selectedCustomerId}
              setSelectedCustomerId={setSelectedCustomerId}
              openOrder={openOrder}
              openCustomer={openCustomer}
            />
          )}
          {activePage === "risks" && <RisksPage openRisk={openRisk} openCustomer={openCustomer} openOrder={openOrder} />}
          {activePage === "performance" && (
            <PerformancePage
              openCustomer={openCustomer}
              openOpportunity={openOpportunity}
              createPreview={setActionPreview}
            />
          )}
          {activePage === "configs" && <ConfigsPage openConfig={openConfig} openCustomer={openCustomer} />}
          {activePage === "opportunities" && <OpportunitiesPage openOpportunity={openOpportunity} openCustomer={openCustomer} openOrder={openOrder} />}
          {activePage === "assistant" && (
            <AssistantPage
              createPreview={setActionPreview}
              operationRecords={operationRecords}
              runtimeAgentTasks={agentTasks}
            />
          )}
        </div>
      </main>
      <DetailDrawer
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
