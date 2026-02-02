# Commerce Agent Enterprise Stack

Policy-driven payment orchestration and approval workflows for enterprise applications.

## Features

### Core Components

- **Policy Engine**: Define and evaluate transaction policies with configurable rules
- **Immutable Ledger**: Cryptographically secure audit trail for all transactions
- **Approval Workflows**: Multi-approver workflows with role-based access control
- **Compliance Framework**: Built-in support for AML, KYC, PCI DSS, and SOC 2

### Key Capabilities

- Configurable approval rules based on amount, type, velocity
- Multi-signature approval workflows
- Real-time policy evaluation
- Immutable audit logs with chain-of-custody
- Webhook notifications for events
- Role-based permissions system
- Analytics and reporting

## Installation

```bash
pnpm add @ghost-wallet/commerce-agent
```

## Usage

### Policy Engine

```typescript
import { createPolicyEngine, PolicyRule } from '@ghost-wallet/commerce-agent';

const rules: PolicyRule[] = [
  {
    id: 'high-value-approval',
    name: 'High Value Transaction Approval',
    type: 'amount_limit',
    enabled: true,
    priority: 10,
    conditions: {
      maxAmount: 10000,
      currency: 'USD',
      approverCount: 2,
    },
    actions: {
      requireApproval: true,
      approverRoles: ['finance_manager', 'cfo'],
      notify: ['finance@company.com'],
    },
  },
];

const engine = createPolicyEngine(rules);
const result = engine.evaluateTransaction(transaction);

if (result.requiresApproval) {
  console.log(`Requires ${result.approvalConfig?.requiredApprovers} approvals`);
}
```

### Immutable Ledger

```typescript
import { createLedger } from '@ghost-wallet/commerce-agent';

const ledger = createLedger();

// Record an action
await ledger.recordAction(
  transaction.id,
  'transaction.created',
  'user@example.com',
  { amount: 5000, currency: 'USD' },
  'finance_user'
);

// Get transaction history
const history = await ledger.getTransactionHistory(transaction.id);

// Verify ledger integrity
const { valid } = await ledger.verifyIntegrity();
console.log(`Ledger is ${valid ? 'valid' : 'compromised'}`);
```

### Approval Workflows

```typescript
import { createApprovalWorkflow } from '@ghost-wallet/commerce-agent';

const workflow = createApprovalWorkflow({
  expirationTimeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// Create approval request
const request = workflow.createApprovalRequest(
  transaction,
  'requester@company.com',
  2, // requires 2 approvals
  ['finance_manager', 'cfo']
);

// Add approval
const result = await workflow.addApproval(request.id, {
  userId: 'manager1',
  userName: 'Jane Doe',
  role: 'finance_manager',
}, 'Approved for Q4 budget');

if (result.isComplete) {
  console.log('Transaction fully approved!');
}
```

## Architecture

```
packages/agents/commerce/
├── src/
│   ├── core/
│   │   ├── policy-engine.ts      # Policy evaluation logic
│   │   ├── ledger.ts              # Immutable audit trail
│   │   └── approval-workflow.ts   # Multi-approver workflows
│   ├── types/
│   │   └── index.ts               # TypeScript definitions
│   └── index.ts                   # Main exports
```

## Compliance

This package is designed to support:

- **SOC 2**: Audit trails, access controls, and monitoring
- **PCI DSS**: Secure transaction handling and logging
- **GDPR**: Data privacy and retention policies
- **AML/KYC**: Transaction monitoring and flagging

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Run tests
pnpm test

# Lint
pnpm lint
```

## License

MIT
