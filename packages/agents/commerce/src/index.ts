// Core exports
export * from './core';
export * from './types';

// Re-export main classes for convenience
export { PolicyEngine, createPolicyEngine } from './core/policy-engine';
export { ImmutableLedger, createLedger, InMemoryLedgerStorage } from './core/ledger';
export { ApprovalWorkflow, createApprovalWorkflow } from './core/approval-workflow';
