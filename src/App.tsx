import {
  AlertTriangle,
  Bot,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  Gauge,
  Landmark,
  PlugZap,
  RefreshCw,
  Search,
  SlidersHorizontal,
  UserCircle,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buildEmailPreview, buildOrderStatusPreview, buildReportPreview, buildScheduledTaskPreview } from "./actionPreviews";
import { apiModeLabel, createConsoleApiClient } from "./apiClientFactory";
import { snapshotFromProvider, type ApiMode, type ApiResponse, type ConsoleDataSnapshot } from "./adapters";
import { ActionPreviewModal, DetailDrawer, GlobalAssistantDrawer } from "./components/overlays";
import { mockProvider } from "./mockProvider";
import { buildUser, can, canView, roles, roleScope } from "./permissions";
import {
  AssistantPage,
  ConfigsPage,
  CustomersPage,
  IntegrationPage,
  OpportunitiesPage,
  PerformancePage,
  RisksPage,
  TransactionsPage,
  UserCenterPage,
  WorkspacePage,
} from "./pages/consolePages";
import type { ActionPreview, AgentTask, DrawerState, OperationRecord, PageId, SystemUser, UserRole } from "./domain";

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
  { id: "integration", label: "接入准备", icon: PlugZap },
  { id: "users", label: "用户中心", icon: Users },
];

const initialSystemUsers: SystemUser[] = [
  { id: "SU001", name: "林越", loginName: "ops.lin", role: "运营", department: "运营中心", status: "启用", lastLogin: "2026-05-20 09:10", dataScope: "全机构" },
  { id: "SU002", name: "陈明", loginName: "sales.chen", role: "销售经理", department: "机构销售一部", status: "启用", lastLogin: "2026-05-20 08:52", dataScope: "关联客户与商机" },
  { id: "SU003", name: "沈知远", loginName: "director.shen", role: "销售总监", department: "机构销售部", status: "启用", lastLogin: "2026-05-19 18:21", dataScope: "全机构" },
  { id: "SU004", name: "周岚", loginName: "biz.zhou", role: "业务主管", department: "代销业务部", status: "启用", lastLogin: "2026-05-19 17:43", dataScope: "全机构" },
  { id: "SU005", name: "停用销售经理", loginName: "sales.locked", role: "销售经理", department: "机构销售二部", status: "锁定", lastLogin: "2026-05-18 14:20", dataScope: "关联客户与商机" },
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

function LoginPage({
  users,
  selectedUserId,
  setSelectedUserId,
  login,
}: {
  users: SystemUser[];
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
  login: () => void;
}) {
  const selected = users.find((user) => user.id === selectedUserId) ?? users[0];
  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="login-brand">
          <div>MA</div>
          <span>
            <strong>MAFDIC</strong>
            <em>Multi-Agent Fund Distribution Insight Claw</em>
          </span>
        </div>
        <div className="login-copy">
          <span>系统登录</span>
          <h1>基金代销运营工作台</h1>
          <p>选择一个 mock 用户进入系统，后续可替换为真实统一认证、单点登录和权限中心。</p>
        </div>
        <label className="login-field">
          <span>登录用户</span>
          <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name} · {user.role}</option>
            ))}
          </select>
        </label>
        <div className="login-preview">
          <div><span>账号</span><strong>{selected.loginName}</strong></div>
          <div><span>角色</span><strong>{selected.role}</strong></div>
          <div><span>部门</span><strong>{selected.department}</strong></div>
          <div><span>数据范围</span><strong>{selected.dataScope}</strong></div>
        </div>
        <button className="login-button" disabled={selected.status !== "启用"} onClick={login}>
          {selected.status === "启用" ? "进入系统" : `账号${selected.status}`}
        </button>
      </section>
    </main>
  );
}

function App() {
  const [activePage, setActivePage] = useState<PageId>("workspace");
  const [selectedRole, setSelectedRole] = useState<UserRole>("运营");
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(initialSystemUsers);
  const [selectedLoginUserId, setSelectedLoginUserId] = useState(initialSystemUsers[0].id);
  const [currentAccountId, setCurrentAccountId] = useState(initialSystemUsers[0].id);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [apiMode, setApiMode] = useState<ApiMode>("mock");
  const [consoleData, setConsoleData] = useState<ConsoleDataSnapshot>(initialData);
  const [apiState, setApiState] = useState<"loading" | "ready" | "error">("loading");
  const [apiTrace, setApiTrace] = useState("mock-api 初始化中");
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialData.customers[0].id);
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [actionPreview, setActionPreview] = useState<ActionPreview | null>(null);
  const [operationRecords, setOperationRecords] = useState<OperationRecord[]>([]);
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>([]);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "MSG-INIT",
      role: "assistant",
      text: "我可以结合当前页面上下文，帮你解释交易、风险、客户资产变化，或生成报表、邮件、定时任务草稿。",
    },
  ]);
  const current = useMemo(() => navigation.find((item) => item.id === activePage), [activePage]);
  const currentAccount = useMemo(() => systemUsers.find((user) => user.id === currentAccountId) ?? systemUsers[0], [currentAccountId, systemUsers]);
  const currentUser = useMemo(() => {
    const user = buildUser(selectedRole);
    return {
      ...user,
      id: currentAccount.id,
      name: currentAccount.name,
      dataScope: currentAccount.role === selectedRole ? currentAccount.dataScope : roleScope[selectedRole],
    };
  }, [currentAccount, selectedRole]);
  const apiClient = useMemo(() => createConsoleApiClient(apiMode), [apiMode]);
  const loadModularConsoleData = useCallback(async (): Promise<ApiResponse<ConsoleDataSnapshot>> => {
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
      reportGenerationRecords,
      scheduledReportTasks,
      metricDefinitions,
      opportunityAttributions,
      baseAgentTasks,
      agentGovernanceRules,
      agentAuditLogs,
      apiIntegrationModules,
      integrationChecklist,
      performanceStrategies,
    ] = await Promise.all([
      apiClient.listMetrics(),
      apiClient.searchCustomers({ pageSize: 100 }),
      apiClient.searchOrders({ pageSize: 100 }),
      apiClient.searchHoldings({ pageSize: 100 }),
      apiClient.searchRisks({ pageSize: 100 }),
      apiClient.searchOpportunities({ pageSize: 100 }),
      apiClient.searchConfigs({ pageSize: 100 }),
      apiClient.searchTasks({ pageSize: 100 }),
      apiClient.listAssistantActions(),
      apiClient.listReportTemplates(),
      apiClient.listReportGenerationRecords(),
      apiClient.listScheduledReportTasks(),
      apiClient.listMetricDefinitions(),
      apiClient.listOpportunityAttributions(),
      apiClient.listAgentTasks(),
      apiClient.listAgentGovernanceRules(),
      apiClient.listAgentAuditLogs(),
      apiClient.listApiIntegrationModules(),
      apiClient.listIntegrationChecklist(),
      apiClient.listPerformanceStrategies(),
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
      reportGenerationRecords,
      scheduledReportTasks,
      metricDefinitions,
      opportunityAttributions,
      baseAgentTasks,
      agentGovernanceRules,
      agentAuditLogs,
      apiIntegrationModules,
      integrationChecklist,
      performanceStrategies,
    ];
    const failed = responses.find((response) => !response.ok);
    if (failed && !failed.ok) {
      return failed;
    }
    return {
      ok: true,
      traceId: customers.ok ? customers.traceId : "mock-api",
      source: apiMode === "real" ? "real-api" : "mock-api",
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
        reportGenerationRecords: reportGenerationRecords.ok ? reportGenerationRecords.data : [],
        scheduledReportTasks: scheduledReportTasks.ok ? scheduledReportTasks.data : [],
        metricDefinitions: metricDefinitions.ok ? metricDefinitions.data : [],
        opportunityAttributions: opportunityAttributions.ok ? opportunityAttributions.data : [],
        agentTasks: baseAgentTasks.ok ? baseAgentTasks.data : [],
        agentGovernanceRules: agentGovernanceRules.ok ? agentGovernanceRules.data : [],
        agentAuditLogs: agentAuditLogs.ok ? agentAuditLogs.data : [],
        apiIntegrationModules: apiIntegrationModules.ok ? apiIntegrationModules.data : [],
        integrationChecklist: integrationChecklist.ok ? integrationChecklist.data : [],
        performanceStrategies: performanceStrategies.ok ? performanceStrategies.data : [],
      },
    };
  }, [apiClient, apiMode]);
  const loadConsoleData = async () => {
    setApiState("loading");
    const response = await loadModularConsoleData();
    if (response.ok) {
      setConsoleData(response.data);
      setApiState("ready");
      setApiTrace(`${apiModeLabel(apiMode)} · ${response.traceId}`);
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
        setApiTrace(`${apiModeLabel(apiMode)} · ${response.traceId}`);
        return;
      }
      setApiState("error");
      setApiTrace(`${response.error.code} · ${response.error.message}`);
    });
    return () => {
      ignore = true;
    };
  }, [loadModularConsoleData, apiMode]);

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
  const goToPage = (page: PageId) => {
    if (!canView(currentUser, page)) return;
    setActivePage(page);
  };
  const updateOperationStatus = (id: string, status: OperationRecord["status"]) => {
    if (!can(currentUser, "approve:operation")) return;
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
    if (!can(currentUser, "execute:ai")) return;
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
  const selectedCustomer = consoleData.customers.find((customer) => customer.id === selectedCustomerId) ?? consoleData.customers[0];
  const buildPreviewFromPrompt = (prompt: string): ActionPreview => {
    const text = prompt.toLowerCase();
    const risk = consoleData.risks[0];
    const order = consoleData.orders.find((item) => item.customerId === selectedCustomerId) ?? consoleData.orders[0];
    if (prompt.includes("周报") || prompt.includes("报告") || prompt.includes("经营")) return buildReportPreview();
    if (prompt.includes("定时") || prompt.includes("推送")) return buildScheduledTaskPreview();
    if (prompt.includes("邮件")) return buildEmailPreview(risk);
    if (prompt.includes("交易") || prompt.includes("确认") || text.includes("order")) return buildOrderStatusPreview(order, selectedCustomer?.shortName);
    if (prompt.includes("商机") || prompt.includes("归因")) {
      return {
        type: "归因说明",
        title: "商机收入归因说明",
        context: `${current?.label ?? "当前页面"} / ${selectedCustomer?.shortName ?? "全机构"}`,
        summary: "根据当前商机、交易归因比例、客户维护费和销售服务费，生成一份可人工复核的归因说明草稿。",
        steps: ["读取商机、客户和关联交易", "拆分维护费、销售服务费和净贡献", "生成归因说明草稿，等待人工确认"],
        requiresApproval: false,
      };
    }
    return {
      type: "异常解释",
      title: "当前页面业务解释",
      context: `${current?.label ?? "当前页面"} / ${selectedCustomer?.shortName ?? "全机构"}`,
      summary: "基于当前页面上下文生成解释草稿，当前不会修改业务对象、提交审批或触发外部动作。",
      steps: ["读取当前菜单和选中客户上下文", "整理关键业务对象和状态", "输出解释草稿供人工复核"],
      requiresApproval: false,
    };
  };
  const sendAssistantMessage = (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    const idSuffix = Date.now();
    const preview = buildPreviewFromPrompt(trimmed);
    const contextText = `${current?.label ?? "当前页面"}${selectedCustomer ? ` / ${selectedCustomer.shortName}` : ""}`;
    setChatMessages((messages) => [
      ...messages,
      { id: `MSG-U-${idSuffix}`, role: "user", text: trimmed },
      {
        id: `MSG-A-${idSuffix}`,
        role: "assistant",
        text: `已结合 ${contextText} 生成建议：${preview.summary} 如需沉淀为业务动作，可以生成草稿并送入人工确认链路。`,
      },
    ]);
  };
  const login = () => {
    const nextAccount = systemUsers.find((user) => user.id === selectedLoginUserId) ?? systemUsers[0];
    if (nextAccount.status !== "启用") return;
    setCurrentAccountId(nextAccount.id);
    setSelectedRole(nextAccount.role);
    setIsAuthenticated(true);
    setActivePage("workspace");
    setShowProfile(false);
    setAssistantOpen(false);
  };
  const logout = () => {
    setIsAuthenticated(false);
    setAssistantOpen(false);
    setDrawer(null);
    setActionPreview(null);
    setShowProfile(false);
  };

  if (!isAuthenticated) {
    return (
      <LoginPage
        users={systemUsers}
        selectedUserId={selectedLoginUserId}
        setSelectedUserId={setSelectedLoginUserId}
        login={login}
      />
    );
  }

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
                className={`${item.id === activePage ? "active" : ""} ${!canView(currentUser, item.id) ? "disabled" : ""}`}
                disabled={!canView(currentUser, item.id)}
                key={item.id}
                onClick={() => goToPage(item.id)}
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
            <div className="role-switcher">
              <span>{currentUser.dataScope}</span>
              <select value={selectedRole} onChange={(event) => {
                const nextRole = event.target.value as UserRole;
                const nextUser = buildUser(nextRole);
                setSelectedRole(nextRole);
                if (!canView(nextUser, activePage)) setActivePage("workspace");
              }}>
                {roles.map((role) => <option key={role}>{role}</option>)}
              </select>
            </div>
            <div className="role-switcher">
              <span>数据源</span>
              <select value={apiMode} onChange={(event) => setApiMode(event.target.value as ApiMode)}>
                <option value="mock">Mock</option>
                <option value="hybrid">Hybrid</option>
                <option value="real">Real</option>
              </select>
            </div>
            <span className={`api-pill api-pill-${apiState}`}>{apiTrace}</span>
            <button title="刷新 Mock API 数据" onClick={() => void loadConsoleData()}><RefreshCw size={18} /></button>
            <button title="全局搜索"><Search size={18} /></button>
            <button title="AI 对话" disabled={!can(currentUser, "execute:ai")} onClick={() => setAssistantOpen(true)}><Bot size={18} /></button>
            <div className="account-menu">
              <button
                className="account-button"
                title="登录信息"
                onClick={() => setShowProfile((visible) => !visible)}
              >
                <UserCircle size={18} />
                <span>
                  <strong>{currentAccount.name}</strong>
                  <em>{currentUser.role}</em>
                </span>
              </button>
              {showProfile ? (
                <div className="account-popover">
                  <div className="profile-card">
                    <UserCircle size={28} />
                    <div>
                      <strong>{currentAccount.name}</strong>
                      <span>{currentAccount.loginName}</span>
                    </div>
                  </div>
                  <div className="profile-facts">
                    <div><span>角色</span><strong>{currentUser.role}</strong></div>
                    <div><span>部门</span><strong>{currentAccount.department}</strong></div>
                    <div><span>数据范围</span><strong>{currentUser.dataScope}</strong></div>
                    <div><span>最近登录</span><strong>{currentAccount.lastLogin}</strong></div>
                  </div>
                  <div className="account-actions">
                    <button onClick={() => {
                      setActivePage("users");
                      setShowProfile(false);
                    }}>个人信息</button>
                    <button onClick={logout}>退出系统</button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        {apiState === "loading" ? <div className="api-banner">正在从 Mock API 拉取业务快照...</div> : null}
        {apiState === "error" ? <div className="api-banner api-banner-error">Mock API 返回异常，当前保留上一份业务快照。</div> : null}
        <div className="page-body">
          {activePage === "workspace" && (
            <WorkspacePage
              data={consoleData}
              user={currentUser}
              jump={goToPage}
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
              jump={goToPage}
            />
          )}
          {activePage === "transactions" && (
            <TransactionsPage
              data={consoleData}
              selectedCustomerId={selectedCustomerId}
              setSelectedCustomerId={setSelectedCustomerId}
              openOrder={openOrder}
              openCustomer={openCustomer}
              openRisk={openRisk}
              createPreview={setActionPreview}
            />
          )}
          {activePage === "risks" && (
            <RisksPage
              data={consoleData}
              openRisk={openRisk}
              openCustomer={openCustomer}
              openOrder={openOrder}
              createPreview={setActionPreview}
            />
          )}
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
              user={currentUser}
              openConfig={openConfig}
              openCustomer={openCustomer}
              createPreview={setActionPreview}
            />
          )}
          {activePage === "opportunities" && <OpportunitiesPage data={consoleData} openOpportunity={openOpportunity} openCustomer={openCustomer} openOrder={openOrder} />}
          {activePage === "assistant" && (
            <AssistantPage
              data={consoleData}
              user={currentUser}
              createPreview={setActionPreview}
              operationRecords={operationRecords}
              updateOperationStatus={updateOperationStatus}
              runtimeAgentTasks={agentTasks}
            />
          )}
          {activePage === "integration" && <IntegrationPage apiMode={apiMode} data={consoleData} />}
          {activePage === "users" && (
            <UserCenterPage
              users={systemUsers}
              currentUser={currentUser}
              navigationItems={navigation.map(({ id, label }) => ({ id, label }))}
              createUser={(user) => setSystemUsers((currentUsers) => [user, ...currentUsers])}
              updateUser={(id, patch) => {
                setSystemUsers((currentUsers) => currentUsers.map((user) => (user.id === id ? { ...user, ...patch } : user)));
                if (id === currentAccountId && patch.role) setSelectedRole(patch.role);
              }}
              deleteUser={(id) => {
                if (id === currentAccountId) return;
                setSystemUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));
              }}
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
        openRisk={openRisk}
        createPreview={setActionPreview}
      />
      <ActionPreviewModal
        preview={actionPreview}
        close={() => setActionPreview(null)}
        save={saveActionPreview}
        canSave={can(currentUser, "execute:ai")}
      />
      <div className="global-assistant-tab">
        <button
          className={`global-assistant-button ${assistantOpen ? "active" : ""}`}
          title={assistantOpen ? "关闭 AI 对话" : "AI 对话"}
          disabled={!can(currentUser, "execute:ai")}
          onClick={() => setAssistantOpen((open) => !open)}
        >
          <Bot size={20} />
        </button>
      </div>
      <GlobalAssistantDrawer
        open={assistantOpen}
        close={() => setAssistantOpen(false)}
        pageLabel={current?.label ?? "当前页面"}
        role={currentUser.role}
        dataScope={currentUser.dataScope}
        apiMode={apiModeLabel(apiMode)}
        selectedCustomerName={selectedCustomer?.shortName ?? "未选择客户"}
        messages={chatMessages}
        onSend={sendAssistantMessage}
        canExecute={can(currentUser, "execute:ai")}
        createPreview={(prompt) => {
          setActionPreview(buildPreviewFromPrompt(prompt));
          setAssistantOpen(false);
        }}
      />
    </div>
  );
}

export default App;
