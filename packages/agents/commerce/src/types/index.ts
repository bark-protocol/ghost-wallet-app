import { z } from 'zod';

// Policy Engine Types
export const PolicyRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['amount_limit', 'approval_required', 'time_based', 'velocity', 'custom']),
  enabled: z.boolean().default(true),
  priority: z.number().default(0),
  conditions: z.object({
    minAmount: z.number().optional(),
    maxAmount: z.number().optional(),
    currency: z.string().optional(),
    timeWindow: z.string().optional(), // e.g., "1h", "24h", "7d"
    maxTransactions: z.number().optional(),
    requiresApproval: z.boolean().optional(),
    approverCount: z.number().optional(),
    customLogic: z.string().optional(),
  }),
  actions: z.object({
    requireApproval: z.boolean().default(false),
    approverRoles: z.array(z.string()).optional(),
    block: z.boolean().default(false),
    notify: z.array(z.string()).optional(),
    flagForReview: z.boolean().default(false),
  }),
  metadata: z.record(z.unknown()).optional(),
});

export type PolicyRule = z.infer<typeof PolicyRuleSchema>;

export const TransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['payment', 'refund', 'transfer', 'withdrawal']),
  amount: z.number(),
  currency: z.string().default('USD'),
  from: z.string(),
  to: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'completed', 'failed']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export const ApprovalRequestSchema = z.object({
  id: z.string(),
  transactionId: z.string(),
  requestedBy: z.string(),
  requestedAt: z.date(),
  requiredApprovers: z.number(),
  approvers: z.array(z.object({
    userId: z.string(),
    userName: z.string(),
    role: z.string(),
    approvedAt: z.date().optional(),
    comment: z.string().optional(),
  })),
  status: z.enum(['pending', 'approved', 'rejected', 'expired']),
  expiresAt: z.date().optional(),
});

export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;

export const LedgerEntrySchema = z.object({
  id: z.string(),
  transactionId: z.string(),
  timestamp: z.date(),
  action: z.string(),
  actor: z.string(),
  actorRole: z.string().optional(),
  data: z.record(z.unknown()),
  hash: z.string(), // For immutability verification
  previousHash: z.string().optional(),
});

export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;

// Compliance Types
export const ComplianceCheckSchema = z.object({
  id: z.string(),
  transactionId: z.string(),
  checkType: z.enum(['aml', 'kyc', 'sanctions', 'pci_dss', 'soc2', 'custom']),
  status: z.enum(['passed', 'failed', 'pending', 'manual_review']),
  performedAt: z.date(),
  performedBy: z.string(),
  result: z.object({
    passed: z.boolean(),
    score: z.number().optional(),
    flags: z.array(z.string()).optional(),
    details: z.record(z.unknown()).optional(),
  }),
});

export type ComplianceCheck = z.infer<typeof ComplianceCheckSchema>;

// User and Role Types
export const UserRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  permissions: z.array(z.enum([
    'view_transactions',
    'create_transactions',
    'approve_transactions',
    'reject_transactions',
    'manage_policies',
    'view_audit_logs',
    'manage_users',
    'view_analytics',
  ])),
  approvalLimit: z.number().optional(),
});

export type UserRole = z.infer<typeof UserRoleSchema>;

// Webhook Types
export const WebhookEventSchema = z.object({
  id: z.string(),
  event: z.enum([
    'transaction.created',
    'transaction.approved',
    'transaction.rejected',
    'transaction.completed',
    'approval.requested',
    'approval.granted',
    'policy.triggered',
    'compliance.flagged',
  ]),
  timestamp: z.date(),
  data: z.record(z.unknown()),
  metadata: z.record(z.unknown()).optional(),
});

export type WebhookEvent = z.infer<typeof WebhookEventSchema>;

// Analytics Types
export const AnalyticsMetricsSchema = z.object({
  totalTransactions: z.number(),
  totalVolume: z.number(),
  approvalRate: z.number(),
  averageApprovalTime: z.number(),
  policyViolations: z.number(),
  complianceFlags: z.number(),
  period: z.object({
    start: z.date(),
    end: z.date(),
  }),
});

export type AnalyticsMetrics = z.infer<typeof AnalyticsMetricsSchema>;
