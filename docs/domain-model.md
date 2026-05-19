# Domain Model Draft

## 1. 建模原则

- 先满足 MVP 页面和 mock 数据，不追求一次覆盖全部生产字段
- 所有外部来源对象保留 `sourceSystem` 和 `sourceId`
- 所有金额字段保留币种
- 所有状态字段使用可枚举值，方便页面筛选和状态标签展示
- 所有关键对象保留更新时间，方便审计和数据新鲜度提示

## 2. 通用字段

多数业务对象建议包含：

- `id`：MAFDIC 内部 ID
- `sourceSystem`：来源系统
- `sourceId`：来源系统原始 ID
- `createdAt`：创建时间
- `updatedAt`：更新时间
- `status`：业务状态

## 3. 客户与账户

### Customer

- `id`
- `sourceSystem`
- `sourceId`
- `name`
- `shortName`
- `customerType`
- `institutionType`
- `riskLevel`
- `relationshipManager`
- `status`
- `tags`
- `createdAt`
- `updatedAt`

### Contact

- `id`
- `customerId`
- `name`
- `role`
- `phone`
- `email`
- `isPrimary`
- `status`

### TradingAccount

- `id`
- `customerId`
- `accountNo`
- `accountName`
- `channel`
- `status`
- `openedAt`

### FundAccount

- `id`
- `customerId`
- `fundAccountNo`
- `taCode`
- `status`
- `openedAt`

## 4. 基金、行情与资产

### Fund

- `id`
- `sourceSystem`
- `sourceId`
- `fundCode`
- `fundName`
- `fundType`
- `riskLevel`
- `manager`
- `status`

### FundMarketQuote

- `id`
- `fundId`
- `quoteDate`
- `nav`
- `accumulatedNav`
- `dailyReturn`
- `sourceSystem`
- `sourceId`

### Holding

- `id`
- `customerId`
- `fundId`
- `tradingAccountId`
- `shares`
- `availableShares`
- `frozenShares`
- `marketValue`
- `currency`
- `costAmount`
- `unrealizedProfit`
- `holdingDate`

### AssetSnapshot

- `id`
- `customerId`
- `snapshotDate`
- `totalMarketValue`
- `totalCost`
- `totalProfit`
- `currency`
- `holdingCount`

## 5. 交易与确认清算

### TransactionOrder

- `id`
- `sourceSystem`
- `sourceId`
- `customerId`
- `fundId`
- `tradingAccountId`
- `orderNo`
- `tradeType`
- `applyDate`
- `amount`
- `shares`
- `currency`
- `orderStatus`
- `confirmationStatus`
- `channel`
- `submittedBy`
- `updatedAt`

### OrderStatusEvent

- `id`
- `orderId`
- `eventType`
- `eventTime`
- `status`
- `description`
- `operator`

### ConfirmationRecord

- `id`
- `orderId`
- `taCode`
- `confirmDate`
- `confirmedAmount`
- `confirmedShares`
- `confirmedNav`
- `confirmationStatus`
- `failureReason`
- `sourceSystem`
- `sourceId`

### ClearingRecord

- `id`
- `orderId`
- `clearingDate`
- `clearingAmount`
- `currency`
- `clearingStatus`
- `counterparty`
- `sourceSystem`
- `sourceId`

### ReconciliationDifference

- `id`
- `orderId`
- `differenceType`
- `differenceAmount`
- `description`
- `severity`
- `status`
- `detectedAt`

## 6. 收入、费用与业绩归因

### RevenueRecord

- `id`
- `sourceSystem`
- `sourceId`
- `customerId`
- `fundId`
- `orderId`
- `opportunityId`
- `revenueType`
- `amount`
- `currency`
- `revenueDate`
- `channel`

### FeeRecord

- `id`
- `sourceSystem`
- `sourceId`
- `customerId`
- `fundId`
- `orderId`
- `feeType`
- `amount`
- `currency`
- `feeDate`

### PerformanceAttribution

- `id`
- `opportunityId`
- `customerId`
- `orderId`
- `revenueAmount`
- `feeAmount`
- `netContribution`
- `currency`
- `attributionRule`
- `attributionOwner`
- `attributionDate`

## 7. 商机

### SalesOpportunity

- `id`
- `sourceSystem`
- `sourceId`
- `name`
- `customerId`
- `stage`
- `expectedAmount`
- `currency`
- `expectedCloseDate`
- `owner`
- `probability`
- `status`
- `createdAt`
- `updatedAt`

### OpportunityTransactionLink

- `id`
- `opportunityId`
- `orderId`
- `linkType`
- `confidence`
- `linkedAt`
- `linkedBy`

## 8. 运营配置

### AdvanceFundingConfig

- `id`
- `customerId`
- `fundingBankId`
- `limitAmount`
- `currency`
- `effectiveFrom`
- `effectiveTo`
- `status`
- `version`
- `approvalStatus`
- `updatedBy`
- `updatedAt`

### FundingBank

- `id`
- `bankName`
- `bankCode`
- `branchName`
- `accountNo`
- `status`
- `supportedCurrency`
- `updatedAt`

### InterestAccrualRule

- `id`
- `ruleName`
- `customerId`
- `fundId`
- `rateType`
- `rate`
- `dayCountBasis`
- `effectiveFrom`
- `effectiveTo`
- `status`
- `version`

### FeeRule

- `id`
- `ruleName`
- `feeType`
- `customerId`
- `fundId`
- `rate`
- `effectiveFrom`
- `effectiveTo`
- `status`
- `version`

## 9. 风险、作业与审批

### RiskEvent

- `id`
- `sourceSystem`
- `sourceId`
- `riskType`
- `severity`
- `title`
- `description`
- `relatedCustomerId`
- `relatedOrderId`
- `triggeredRule`
- `status`
- `detectedAt`
- `closedAt`

### Task

- `id`
- `taskType`
- `title`
- `description`
- `priority`
- `assignee`
- `relatedObjectType`
- `relatedObjectId`
- `status`
- `dueAt`
- `createdAt`

### ApprovalInstance

- `id`
- `approvalType`
- `title`
- `relatedObjectType`
- `relatedObjectId`
- `initiator`
- `currentNode`
- `approvalStatus`
- `createdAt`
- `updatedAt`

### AuditLog

- `id`
- `actor`
- `action`
- `objectType`
- `objectId`
- `before`
- `after`
- `createdAt`

## 10. AI 与报表任务

### AssistantConversation

- `id`
- `userId`
- `title`
- `contextObjectType`
- `contextObjectId`
- `createdAt`
- `updatedAt`

### AssistantActionPreview

- `id`
- `conversationId`
- `actionType`
- `title`
- `description`
- `payload`
- `riskLevel`
- `requiresApproval`
- `status`

### ScheduledTask

- `id`
- `taskName`
- `taskType`
- `schedule`
- `owner`
- `status`
- `nextRunAt`
- `createdAt`

### ReportDefinition

- `id`
- `reportName`
- `reportType`
- `template`
- `parameters`
- `owner`
- `status`
- `createdAt`

