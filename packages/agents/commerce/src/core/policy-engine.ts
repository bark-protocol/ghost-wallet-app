import type { PolicyRule, Transaction, ApprovalRequest } from '../types';

export interface PolicyEvaluationResult {
  passed: boolean;
  triggeredRules: PolicyRule[];
  requiresApproval: boolean;
  approvalConfig?: {
    requiredApprovers: number;
    approverRoles: string[];
  };
  blocked: boolean;
  notifications: string[];
  metadata?: Record<string, unknown>;
}

export class PolicyEngine {
  private rules: Map<string, PolicyRule> = new Map();

  constructor(initialRules: PolicyRule[] = []) {
    initialRules.forEach(rule => this.addRule(rule));
  }

  addRule(rule: PolicyRule): void {
    this.rules.set(rule.id, rule);
  }

  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  getRule(ruleId: string): PolicyRule | undefined {
    return this.rules.get(ruleId);
  }

  getAllRules(): PolicyRule[] {
    return Array.from(this.rules.values());
  }

  getEnabledRules(): PolicyRule[] {
    return this.getAllRules()
      .filter(rule => rule.enabled)
      .sort((a, b) => b.priority - a.priority);
  }

  evaluateTransaction(transaction: Transaction): PolicyEvaluationResult {
    const enabledRules = this.getEnabledRules();
    const triggeredRules: PolicyRule[] = [];
    let requiresApproval = false;
    let blocked = false;
    const notifications = new Set<string>();
    const approverRoles = new Set<string>();
    let requiredApprovers = 0;

    for (const rule of enabledRules) {
      if (this.matchesRule(transaction, rule)) {
        triggeredRules.push(rule);

        // Apply rule actions
        if (rule.actions.block) {
          blocked = true;
        }

        if (rule.actions.requireApproval) {
          requiresApproval = true;
          if (rule.actions.approverRoles) {
            rule.actions.approverRoles.forEach(role => approverRoles.add(role));
          }
          if (rule.conditions.approverCount) {
            requiredApprovers = Math.max(requiredApprovers, rule.conditions.approverCount);
          }
        }

        if (rule.actions.notify) {
          rule.actions.notify.forEach(recipient => notifications.add(recipient));
        }
      }
    }

    return {
      passed: !blocked,
      triggeredRules,
      requiresApproval,
      approvalConfig: requiresApproval ? {
        requiredApprovers: requiredApprovers || 1,
        approverRoles: Array.from(approverRoles),
      } : undefined,
      blocked,
      notifications: Array.from(notifications),
    };
  }

  private matchesRule(transaction: Transaction, rule: PolicyRule): boolean {
    const { conditions } = rule;

    // Amount checks
    if (conditions.minAmount !== undefined && transaction.amount < conditions.minAmount) {
      return false;
    }
    if (conditions.maxAmount !== undefined && transaction.amount > conditions.maxAmount) {
      return true; // Exceeds limit - triggers rule
    }

    // Currency check
    if (conditions.currency && transaction.currency !== conditions.currency) {
      return false;
    }

    // Type-specific checks
    if (rule.type === 'amount_limit' && conditions.maxAmount !== undefined) {
      return transaction.amount > conditions.maxAmount;
    }

    if (rule.type === 'approval_required') {
      return conditions.requiresApproval === true;
    }

    return true;
  }

  evaluateApprovalRequest(request: ApprovalRequest): {
    status: 'pending' | 'approved' | 'rejected';
    canProceed: boolean;
  } {
    const approvedCount = request.approvers.filter(a => a.approvedAt).length;
    const canProceed = approvedCount >= request.requiredApprovers;

    return {
      status: canProceed ? 'approved' : 'pending',
      canProceed,
    };
  }
}

export function createPolicyEngine(rules?: PolicyRule[]): PolicyEngine {
  return new PolicyEngine(rules);
}
