import type { ApprovalRequest, Transaction, UserRole } from '../types';

export interface ApprovalWorkflowConfig {
  expirationTimeMs?: number; // Default: 7 days
  notifyOnRequest?: boolean;
  notifyOnApproval?: boolean;
}

export class ApprovalWorkflow {
  private config: Required<ApprovalWorkflowConfig>;
  private requests: Map<string, ApprovalRequest> = new Map();

  constructor(config: ApprovalWorkflowConfig = {}) {
    this.config = {
      expirationTimeMs: config.expirationTimeMs || 7 * 24 * 60 * 60 * 1000, // 7 days
      notifyOnRequest: config.notifyOnRequest ?? true,
      notifyOnApproval: config.notifyOnApproval ?? true,
    };
  }

  createApprovalRequest(
    transaction: Transaction,
    requestedBy: string,
    requiredApprovers: number,
    eligibleRoles: string[]
  ): ApprovalRequest {
    const request: ApprovalRequest = {
      id: this.generateId(),
      transactionId: transaction.id,
      requestedBy,
      requestedAt: new Date(),
      requiredApprovers,
      approvers: [],
      status: 'pending',
      expiresAt: new Date(Date.now() + this.config.expirationTimeMs),
    };

    this.requests.set(request.id, request);
    return request;
  }

  async addApproval(
    requestId: string,
    approver: {
      userId: string;
      userName: string;
      role: string;
    },
    comment?: string
  ): Promise<{
    success: boolean;
    request: ApprovalRequest;
    isComplete: boolean;
    error?: string;
  }> {
    const request = this.requests.get(requestId);

    if (!request) {
      return {
        success: false,
        request: {} as ApprovalRequest,
        isComplete: false,
        error: 'Approval request not found',
      };
    }

    if (request.status !== 'pending') {
      return {
        success: false,
        request,
        isComplete: false,
        error: `Request already ${request.status}`,
      };
    }

    if (request.expiresAt && request.expiresAt < new Date()) {
      request.status = 'expired';
      return {
        success: false,
        request,
        isComplete: false,
        error: 'Request has expired',
      };
    }

    // Check if already approved by this user
    const existingApproval = request.approvers.find(a => a.userId === approver.userId);
    if (existingApproval) {
      return {
        success: false,
        request,
        isComplete: false,
        error: 'User has already approved',
      };
    }

    // Add approval
    request.approvers.push({
      ...approver,
      approvedAt: new Date(),
      comment,
    });

    // Check if complete
    const isComplete = request.approvers.length >= request.requiredApprovers;
    if (isComplete) {
      request.status = 'approved';
    }

    return {
      success: true,
      request,
      isComplete,
    };
  }

  async rejectRequest(
    requestId: string,
    rejectedBy: {
      userId: string;
      userName: string;
      role: string;
    },
    reason?: string
  ): Promise<{
    success: boolean;
    request: ApprovalRequest;
    error?: string;
  }> {
    const request = this.requests.get(requestId);

    if (!request) {
      return {
        success: false,
        request: {} as ApprovalRequest,
        error: 'Approval request not found',
      };
    }

    if (request.status !== 'pending') {
      return {
        success: false,
        request,
        error: `Request already ${request.status}`,
      };
    }

    request.status = 'rejected';
    request.approvers.push({
      userId: rejectedBy.userId,
      userName: rejectedBy.userName,
      role: rejectedBy.role,
      approvedAt: new Date(),
      comment: `REJECTED: ${reason || 'No reason provided'}`,
    });

    return {
      success: true,
      request,
    };
  }

  getRequest(requestId: string): ApprovalRequest | undefined {
    return this.requests.get(requestId);
  }

  getPendingRequests(filterOptions?: {
    transactionId?: string;
    requestedBy?: string;
  }): ApprovalRequest[] {
    let requests = Array.from(this.requests.values())
      .filter(r => r.status === 'pending');

    if (filterOptions?.transactionId) {
      requests = requests.filter(r => r.transactionId === filterOptions.transactionId);
    }

    if (filterOptions?.requestedBy) {
      requests = requests.filter(r => r.requestedBy === filterOptions.requestedBy);
    }

    return requests;
  }

  getRequestsByTransaction(transactionId: string): ApprovalRequest[] {
    return Array.from(this.requests.values())
      .filter(r => r.transactionId === transactionId);
  }

  canUserApprove(requestId: string, userRole: string, allowedRoles: string[]): boolean {
    const request = this.requests.get(requestId);
    if (!request || request.status !== 'pending') {
      return false;
    }

    return allowedRoles.length === 0 || allowedRoles.includes(userRole);
  }

  private generateId(): string {
    return `appr_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

export function createApprovalWorkflow(config?: ApprovalWorkflowConfig): ApprovalWorkflow {
  return new ApprovalWorkflow(config);
}
