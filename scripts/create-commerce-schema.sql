-- Commerce Agent Database Schema
-- This script creates the necessary tables for the Commerce Agent Enterprise Stack

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'transfer', 'withdrawal')),
    amount DECIMAL(19, 4) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    from_account VARCHAR(255) NOT NULL,
    to_account VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policy rules table
CREATE TABLE IF NOT EXISTS policy_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('amount_limit', 'approval_required', 'time_based', 'velocity', 'custom')),
    enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval requests table
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    requested_by VARCHAR(255) NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    required_approvers INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approvers table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS approval_approvers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    approval_request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ledger entries table (immutable audit log)
CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action VARCHAR(255) NOT NULL,
    actor VARCHAR(255) NOT NULL,
    actor_role VARCHAR(100),
    data JSONB NOT NULL,
    hash VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance checks table
CREATE TABLE IF NOT EXISTS compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    check_type VARCHAR(50) NOT NULL CHECK (check_type IN ('aml', 'kyc', 'sanctions', 'pci_dss', 'soc2', 'custom')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('passed', 'failed', 'pending', 'manual_review')),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    performed_by VARCHAR(255) NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    permissions JSONB NOT NULL,
    approval_limit DECIMAL(19, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook events table
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    delivered BOOLEAN DEFAULT false,
    delivery_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_from_account ON transactions(from_account);
CREATE INDEX IF NOT EXISTS idx_transactions_to_account ON transactions(to_account);

CREATE INDEX IF NOT EXISTS idx_policy_rules_enabled ON policy_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_policy_rules_priority ON policy_rules(priority DESC);

CREATE INDEX IF NOT EXISTS idx_approval_requests_transaction_id ON approval_requests(transaction_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);

CREATE INDEX IF NOT EXISTS idx_approval_approvers_approval_request_id ON approval_approvers(approval_request_id);
CREATE INDEX IF NOT EXISTS idx_approval_approvers_user_id ON approval_approvers(user_id);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_transaction_id ON ledger_entries(transaction_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_timestamp ON ledger_entries(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_actor ON ledger_entries(actor);

CREATE INDEX IF NOT EXISTS idx_compliance_checks_transaction_id ON compliance_checks(transaction_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_status ON compliance_checks(status);

CREATE INDEX IF NOT EXISTS idx_webhook_events_delivered ON webhook_events(delivered);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_rules_updated_at BEFORE UPDATE ON policy_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_requests_updated_at BEFORE UPDATE ON approval_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default roles
INSERT INTO user_roles (name, permissions, approval_limit) VALUES
('admin', '["view_transactions", "create_transactions", "approve_transactions", "reject_transactions", "manage_policies", "view_audit_logs", "manage_users", "view_analytics"]'::jsonb, 1000000),
('finance_manager', '["view_transactions", "create_transactions", "approve_transactions", "reject_transactions", "view_audit_logs", "view_analytics"]'::jsonb, 100000),
('finance_user', '["view_transactions", "create_transactions", "view_audit_logs"]'::jsonb, 10000),
('auditor', '["view_transactions", "view_audit_logs", "view_analytics"]'::jsonb, NULL)
ON CONFLICT (name) DO NOTHING;

-- Insert sample policy rules
INSERT INTO policy_rules (name, description, rule_type, enabled, priority, conditions, actions) VALUES
('High Value Approval', 'Transactions over $10,000 require 2 approvals from finance managers', 'amount_limit', true, 10,
 '{"maxAmount": 10000, "currency": "USD", "approverCount": 2}'::jsonb,
 '{"requireApproval": true, "approverRoles": ["finance_manager", "admin"], "notify": ["finance@company.com"]}'::jsonb),
('Velocity Check', 'Maximum 5 transactions per hour per user', 'velocity', true, 5,
 '{"timeWindow": "1h", "maxTransactions": 5}'::jsonb,
 '{"flagForReview": true, "notify": ["security@company.com"]}'::jsonb),
('Large Transfer Approval', 'Transfers over $50,000 require admin approval', 'amount_limit', true, 15,
 '{"maxAmount": 50000, "currency": "USD", "approverCount": 1}'::jsonb,
 '{"requireApproval": true, "approverRoles": ["admin"], "notify": ["cfo@company.com"]}'::jsonb)
ON CONFLICT DO NOTHING;
