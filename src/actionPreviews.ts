import type { ActionPreview, RiskEvent } from "./domain";

export function buildReportPreview(): ActionPreview {
  return {
    type: "报表预览",
    title: "机构客户周度经营报告",
    context: "经营分析 / 全部机构客户",
    summary: "本周机构客户资产规模保持增长，交易金额环比上升，待确认交易和赎回确认超时需要运营跟进。",
    steps: [
      "汇总客户资产、交易、收入、风险和商机进展",
      "生成管理摘要、客户贡献排行和异常说明",
      "形成报表草稿，等待人工确认后导出或加入定时任务",
    ],
    requiresApproval: true,
  };
}

export function buildScheduledTaskPreview(): ActionPreview {
  return {
    type: "定时任务",
    title: "每日 09:00 异常交易推送",
    context: "风险异常 / 交易确认",
    summary: "系统将每天筛选未确认、高风险和清算差异交易，生成摘要并推送给运营岗。",
    steps: [
      "每天 09:00 读取交易确认和风险事件 adapter",
      "生成异常清单、客户影响和处置建议",
      "发送前进入人工确认队列，第一版仅展示任务预览",
    ],
    requiresApproval: true,
  };
}

export function buildEmailPreview(risk?: RiskEvent): ActionPreview {
  return {
    type: "邮件草稿",
    title: risk ? `${risk.title}处理说明邮件` : "风险说明邮件",
    context: risk ? `${risk.relatedCustomer} / ${risk.triggeredRule}` : "风险异常 / 客户经理通知",
    summary: risk
      ? `建议向客户经理说明 ${risk.title} 的当前状态、命中规则和下一步处置动作。`
      : "建议向客户经理同步风险事件、处置建议和预计闭环时间。",
    steps: [
      "整理风险事实、关联订单和命中规则",
      "生成邮件正文、处理建议和需确认事项",
      "发送前必须由运营人员确认收件人、附件和敏感信息",
    ],
    requiresApproval: true,
  };
}
