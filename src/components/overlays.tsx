import { X } from "lucide-react";
import { buildEmailPreview, buildOrderStatusPreview, buildRiskExplanationPreview } from "../actionPreviews";
import type { ConsoleDataSnapshot } from "../adapters";
import { statusLabel } from "../constants";
import type { ActionPreview, ConfigItem, DrawerState, Opportunity, RiskEvent, TransactionOrder } from "../domain";
import { formatMoney } from "../mockData";

export function DetailDrawer({
  data,
  drawer,
  close,
  jumpToCustomer,
  openOrder,
  openRisk,
  createPreview,
}: {
  data: ConsoleDataSnapshot;
  drawer: DrawerState;
  close: () => void;
  jumpToCustomer: (id: string) => void;
  openOrder: (id: string) => void;
  openRisk: (id: string) => void;
  createPreview: (preview: ActionPreview) => void;
}) {
  if (!drawer) return null;
  const { configs, customers, opportunities, orders, risks } = data;

  const renderOrder = (order: TransactionOrder) => {
    const customer = customers.find((item) => item.id === order.customerId);
    const relatedRisk = risks.find((risk) => risk.relatedOrderId === order.id);
    const relatedOpportunity = opportunities.find((opportunity) => opportunity.linkedOrders.some((link) => link.orderId === order.id));
    return (
      <>
        <span className="eyebrow">Transaction</span>
        <h2>{order.id}</h2>
        <div className="drawer-facts">
          <div><span>客户</span><strong>{customer?.shortName ?? "-"}</strong></div>
          <div><span>基金</span><strong>{order.fundName}</strong></div>
          <div><span>金额</span><strong>{formatMoney(order.amount)}</strong></div>
          <div><span>确认状态</span><strong>{statusLabel[order.confirmationStatus]}</strong></div>
        </div>
        <div className="drawer-section">
          <h3>状态轨迹</h3>
          <div className="timeline compact">
            {order.settlementTrail.map((step) => {
              const [title, ...content] = step.split(" · ");
              return <div key={step}><strong>{title}</strong><span>{content.join(" · ") || order.channel}</span></div>;
            })}
            <div><strong>资产影响</strong><span>{order.assetImpact}</span></div>
          </div>
          <div className="drawer-note">
            <strong>当前卡点</strong>
            <span>{order.confirmationBlocker}</span>
          </div>
        </div>
        <div className="drawer-section">
          <h3>关联对象</h3>
          <div className="drawer-actions">
            <button onClick={() => jumpToCustomer(order.customerId)}>打开客户全景</button>
            {relatedRisk && <button onClick={() => openRisk(relatedRisk.id)}>打开关联风险</button>}
            <button onClick={() => createPreview(buildOrderStatusPreview(order, customer?.shortName))}>解释确认状态</button>
            {relatedOpportunity && <span>商机：{relatedOpportunity.name}</span>}
            {relatedRisk && <span>风险：{relatedRisk.title}</span>}
          </div>
        </div>
        <div className="drawer-section">
          <h3>下一步动作</h3>
          <div className="action-chip-list">
            {order.nextActions.map((action) => <span key={action}>{action}</span>)}
          </div>
        </div>
      </>
    );
  };

  const renderRisk = (risk: RiskEvent) => (
    <>
      <span className="eyebrow">Risk Event</span>
      <h2>{risk.title}</h2>
      <div className="drawer-facts">
        <div><span>客户</span><strong>{risk.relatedCustomer}</strong></div>
        <div><span>等级</span><strong>{risk.severity.toUpperCase()}</strong></div>
        <div><span>命中规则</span><strong>{risk.triggeredRule}</strong></div>
        <div><span>状态</span><strong>{statusLabel[risk.status]}</strong></div>
      </div>
      <div className="drawer-section">
        <h3>AI 解释草案</h3>
        <p>{risk.suggestion} 当前卡点：{risk.currentBlocker}</p>
      </div>
      <div className="drawer-section">
        <h3>处置动作</h3>
        <div className="action-chip-list">
          {risk.nextActions.map((action) => <span key={action}>{action}</span>)}
        </div>
      </div>
      <div className="drawer-section">
        <h3>处置记录</h3>
        <div className="timeline compact">
          {risk.handlingRecords.map((record) => {
            const [time, ...content] = record.split(" ");
            return <div key={record}><strong>{time}</strong><span>{content.join(" ")}</span></div>;
          })}
        </div>
      </div>
      <div className="drawer-actions">
        <button onClick={() => jumpToCustomer(risk.relatedCustomerId)}>打开客户全景</button>
        {risk.relatedOrderId ? <button onClick={() => openOrder(risk.relatedOrderId as string)}>查看关联订单</button> : null}
        <button onClick={() => createPreview(buildRiskExplanationPreview(risk))}>生成处理说明</button>
        <button onClick={() => createPreview(buildEmailPreview(risk))}>草拟邮件</button>
      </div>
    </>
  );

  const renderOpportunity = (opportunity: Opportunity) => {
    const opportunityCustomers = customers.filter((item) => opportunity.customerIds.includes(item.id));
    const attributionSummary = opportunity.linkedOrders.map((link) => `${link.orderId} · ${link.allocationRatio}%`).join(" / ");
    return (
      <>
        <span className="eyebrow">Opportunity Attribution</span>
        <h2>{opportunity.name}</h2>
        <div className="drawer-facts">
          <div><span>客户</span><strong>{opportunityCustomers.map((customer) => customer.shortName).join(" / ")}</strong></div>
          <div><span>阶段</span><strong>{opportunity.stage}</strong></div>
          <div><span>预计金额</span><strong>{formatMoney(opportunity.expectedAmount)}</strong></div>
          <div><span>归因收入</span><strong>{formatMoney(opportunity.revenueContribution)}</strong></div>
        </div>
        <div className="drawer-section">
          <h3>归因链路</h3>
          <div className="timeline compact">
            <div><strong>销售拜访</strong><span>{opportunity.salesSplits.map((split) => `${split.salesName}${split.ratio}%`).join(" / ")}</span></div>
            <div><strong>关联客户</strong><span>{opportunityCustomers.map((customer) => customer.shortName).join(" / ")}</span></div>
            <div><strong>关联交易</strong><span>{attributionSummary || "暂无关联订单"}</span></div>
            <div><strong>收入形成</strong><span>交易形成持仓后，客户维护费与销售服务费共同计入商机落实收入。</span></div>
          </div>
        </div>
        <div className="drawer-section">
          <h3>销售分配</h3>
          <div className="action-chip-list">
            {opportunity.salesSplits.map((split) => <span key={`${split.salesName}-${split.ratio}`}>{split.role} · {split.salesName} {split.ratio}%</span>)}
          </div>
        </div>
        <div className="drawer-actions">
          <button onClick={() => jumpToCustomer(opportunity.customerId)}>打开客户全景</button>
          {opportunity.linkedOrders[0] ? <button onClick={() => openOrder(opportunity.linkedOrders[0].orderId)}>查看关联订单</button> : null}
          <button onClick={() => createPreview({
            type: "归因说明",
            title: `${opportunity.name}业绩归因说明`,
            context: `${opportunityCustomers.map((customer) => customer.shortName).join(" / ")} / ${opportunity.stage}`,
            summary: `该商机预计金额 ${formatMoney(opportunity.expectedAmount)}，当前归因收入 ${formatMoney(opportunity.revenueContribution)}，销售分配为 ${opportunity.salesSplits.map((split) => `${split.salesName}${split.ratio}%`).join(" / ")}。`,
            steps: ["读取商机、关联客户和销售分配", "校验交易客户是否属于商机关联客户池", "按交易归因比例计算维护费、销售服务费和净贡献"],
            requiresApproval: false,
          })}>生成归因说明</button>
        </div>
      </>
    );
  };

  const renderConfig = (config: ConfigItem) => {
    const customer = config.customerId ? customers.find((item) => item.id === config.customerId) : undefined;
    return (
      <>
        <span className="eyebrow">Operational Config</span>
        <h2>{config.name}</h2>
        <div className="drawer-facts">
          <div><span>类型</span><strong>{config.type}</strong></div>
          <div><span>版本</span><strong>{config.version}</strong></div>
          <div><span>审批</span><strong>{config.approvalStatus}</strong></div>
          <div><span>状态</span><strong>{statusLabel[config.status]}</strong></div>
        </div>
        <div className="drawer-section">
          <h3>变更影响预览</h3>
          <p>该配置影响 {customer?.shortName ?? "通用客户范围"}，生效期为 {config.effectiveRange}。提交前应校验额度、日期、规则冲突和审批路径。</p>
        </div>
        <div className="drawer-section">
          <h3>关键字段</h3>
          <div className="drawer-facts">
            {(config.parameters ?? []).slice(0, 4).map((item) => (
              <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>
            ))}
          </div>
        </div>
        <div className="drawer-section">
          <h3>校验结果</h3>
          <div className="detail-stack">
            {(config.validationResults ?? []).map((item) => (
              <span key={item.id}><strong>{item.level}</strong> · {item.title}：{item.detail}</span>
            ))}
          </div>
        </div>
        <div className="drawer-section">
          <h3>审批流</h3>
          <div className="timeline compact">
            {(config.approvalFlow ?? []).map((node) => (
              <div key={node.id}><strong>{node.nodeName} · {node.status}</strong><span>{node.assignee} · {node.opinion}{node.handledAt ? ` · ${node.handledAt}` : ""}</span></div>
            ))}
          </div>
        </div>
        <div className="drawer-section">
          <h3>版本治理</h3>
          <div className="timeline compact">
            {(config.versions ?? []).map((version) => (
              <div key={version.id}><strong>{version.version} · {version.status}</strong><span>{version.changedBy} · {version.changedAt} · {version.summary}</span></div>
            ))}
          </div>
        </div>
        <div className="drawer-section">
          <h3>审计记录</h3>
          <div className="detail-stack">
            {(config.auditLogs ?? []).map((log) => (
              <span key={log.id}>{log.at} · {log.actor} · {log.action}：{log.detail}</span>
            ))}
          </div>
        </div>
        <div className="drawer-actions">
          {config.customerId ? <button onClick={() => jumpToCustomer(config.customerId as string)}>打开客户全景</button> : null}
          <button onClick={() => createPreview({
            type: "审批说明",
            title: `${config.name}版本回滚预览`,
            context: `${config.type} / ${config.version}`,
            summary: `当前配置包含 ${config.versions?.length ?? 0} 个版本。回滚前需要确认历史版本字段、影响客户和审批链路，不会自动生效。`,
            steps: ["读取当前版本和可回滚版本", "对比关键字段和生效范围", "生成回滚审批说明，等待人工确认"],
            requiresApproval: true,
          })}>生成回滚预览</button>
          <button onClick={() => createPreview({
            type: "审批说明",
            title: `${config.name}审批说明`,
            context: `${config.type} / ${config.version}`,
            summary: `该配置当前审批状态为${config.approvalStatus}，生效期为 ${config.effectiveRange}。提交前需要确认影响范围和规则冲突。`,
            steps: ["检查配置版本、生效期和状态", "识别影响客户、产品和规则冲突", "生成审批说明草稿，等待人工提交"],
            requiresApproval: true,
          })}>生成审批说明</button>
        </div>
      </>
    );
  };

  const content =
    drawer.type === "order"
      ? renderOrder(orders.find((order) => order.id === drawer.id) ?? orders[0])
      : drawer.type === "risk"
        ? renderRisk(risks.find((risk) => risk.id === drawer.id) ?? risks[0])
        : drawer.type === "opportunity"
          ? renderOpportunity(opportunities.find((opportunity) => opportunity.id === drawer.id) ?? opportunities[0])
          : renderConfig(configs.find((config) => config.id === drawer.id) ?? configs[0]);

  return (
    <div className="drawer-backdrop" onClick={close}>
      <aside className="drawer" onClick={(event) => event.stopPropagation()}>
        <button className="drawer-close" title="关闭" onClick={close}><X size={18} /></button>
        {content}
      </aside>
    </div>
  );
}

export function ActionPreviewModal({
  preview,
  close,
  save,
  canSave,
}: {
  preview: ActionPreview | null;
  close: () => void;
  save: (preview: ActionPreview) => void;
  canSave: boolean;
}) {
  if (!preview) return null;

  return (
    <div className="preview-backdrop" onClick={close}>
      <section className="preview-modal" onClick={(event) => event.stopPropagation()}>
        <button className="drawer-close" title="关闭" onClick={close}><X size={18} /></button>
        <span className="eyebrow">{preview.type}</span>
        <h2>{preview.title}</h2>
        <div className="preview-context">
          <span>业务上下文</span>
          <strong>{preview.context}</strong>
        </div>
        <div className="preview-section">
          <h3>草稿摘要</h3>
          <p>{preview.summary}</p>
        </div>
        <div className="preview-section">
          <h3>拟执行步骤</h3>
          <ol>
            {preview.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </div>
        <div className="approval-note">
          <strong>{preview.requiresApproval ? "需要人工确认" : "仅生成说明草稿"}</strong>
          <span>
            {preview.requiresApproval
              ? "当前不会真实提交审批、发送邮件、创建任务或导出报表。"
              : "当前只生成解释内容，不改变任何业务对象状态。"}
          </span>
        </div>
        {!canSave ? (
          <div className="approval-note approval-note-denied">
            <strong>当前角色无执行权限</strong>
            <span>可以查看 AI 生成内容，但不能保存草稿、送入待确认队列或触发后续操作。</span>
          </div>
        ) : null}
        <div className="preview-actions">
          <button onClick={close}>关闭预览</button>
          <button disabled={!canSave} onClick={() => save(preview)}>
            {preview.requiresApproval ? "送入待确认队列" : "保存为草稿"}
          </button>
        </div>
      </section>
    </div>
  );
}
