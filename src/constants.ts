import type { Status } from "./domain";

export const statusLabel: Record<Status, string> = {
  active: "正常",
  pending: "待处理",
  warning: "异常",
  closed: "已完成",
  draft: "草稿",
};
