import type { ReactNode } from "react";
import { CheckCircle2, CircleX, Play, RotateCcw } from "lucide-react";
import { statusLabel } from "../constants";
import type { Metric, OperationRecord, Status } from "../domain";

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`status status-${status}`}>{statusLabel[status]}</span>;
}

export function PageHeader({ title, eyebrow, description }: { title: string; eyebrow: string; description: string }) {
  return (
    <div className="page-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      <p>{description}</p>
    </div>
  );
}

export function TextButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button className="text-button" onClick={onClick}>
      {children}
    </button>
  );
}

export function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <section className="metric-grid">
      {metrics.map((metric) => (
        <article className="metric-card" key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <em className={`metric-${metric.tone}`}>{metric.change}</em>
        </article>
      ))}
    </section>
  );
}

export function OperationQueue({
  records,
  onStatusChange,
  canOperate = true,
}: {
  records: OperationRecord[];
  onStatusChange?: (id: string, status: OperationRecord["status"]) => void;
  canOperate?: boolean;
}) {
  if (records.length === 0) {
    return (
      <div className="empty-state">
        <strong>暂无待确认动作</strong>
        <span>从风险处置、配置变更、报表生成或 AI 助手产生的草稿，会进入这里等待人工确认。</span>
      </div>
    );
  }

  return (
    <div className="queue-list">
      {records.map((record) => (
        <article key={record.id}>
          <div>
            <span>{record.type} · {record.context}</span>
            <strong>{record.title}</strong>
            <em>{record.auditTrail.at(-1) ?? record.createdAt}</em>
          </div>
          <div className="queue-actions">
            <span className={`operation-status operation-status-${record.status}`}>{record.status}</span>
            {onStatusChange && canOperate && record.status === "草稿" ? (
              <button title="送审" onClick={() => onStatusChange(record.id, "待确认")}><Play size={15} /></button>
            ) : null}
            {onStatusChange && canOperate && record.status === "待确认" ? (
              <>
                <button title="确认" onClick={() => onStatusChange(record.id, "已确认")}><CheckCircle2 size={15} /></button>
                <button title="驳回" onClick={() => onStatusChange(record.id, "已驳回")}><CircleX size={15} /></button>
              </>
            ) : null}
            {onStatusChange && canOperate && record.status === "已确认" ? (
              <button title="完成" onClick={() => onStatusChange(record.id, "已完成")}><CheckCircle2 size={15} /></button>
            ) : null}
            {onStatusChange && canOperate && record.status === "已驳回" ? (
              <button title="重新送审" onClick={() => onStatusChange(record.id, "待确认")}><RotateCcw size={15} /></button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export function PermissionNotice({ title, message }: { title: string; message: string }) {
  return (
    <section className="permission-notice">
      <strong>{title}</strong>
      <span>{message}</span>
    </section>
  );
}

export function DataTable({ columns, rows, emptyText = "暂无匹配数据" }: { columns: string[]; rows: ReactNode[][]; emptyText?: string }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => <th key={column}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="table-empty" colSpan={columns.length}>{emptyText}</td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => <td key={`${index}-${cellIndex}`}>{cell}</td>)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
