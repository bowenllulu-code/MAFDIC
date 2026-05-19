import type { Status } from "./domain";

export const statusLabel: Record<Status, string> = {
  active: "正常",
  pending: "待处理",
  warning: "异常",
  closed: "已完成",
  draft: "草稿",
};

export const operationStatusLabel = {
  草稿: "草稿",
  待确认: "待确认",
  已确认: "已确认",
  已驳回: "已驳回",
  已完成: "已完成",
} as const;
