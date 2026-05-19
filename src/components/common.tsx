import type { ReactNode } from "react";
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

export function OperationQueue({ records }: { records: OperationRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="empty-state">
        <strong>暂无新动作</strong>
        <span>AI 生成的说明、报表、邮件、审批草稿会进入这里。</span>
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
            <em>{record.createdAt}</em>
          </div>
          <span className={record.status === "待确认" ? "status status-pending" : "status status-draft"}>
            {record.status}
          </span>
        </article>
      ))}
    </div>
  );
}

export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => <th key={column}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => <td key={`${index}-${cellIndex}`}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
