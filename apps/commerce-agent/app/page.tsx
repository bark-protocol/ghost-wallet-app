'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-14 items-center px-6">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            <span className="text-lg font-semibold">{'Commerce Agent'}</span>
          </div>
          <nav className="ml-auto flex items-center gap-4 text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              {'Overview'}
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              {'Transactions'}
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              {'Policies'}
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              {'Audit Logs'}
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              {'Analytics'}
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              {'Settings'}
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{'Dashboard'}</h1>
          <p className="text-muted-foreground">
            {'Monitor transactions and manage approval workflows'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {'Total Transactions'}
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{'1,284'}</div>
              <p className="text-xs text-muted-foreground">
                {'+12.5% from last month'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {'Pending Approvals'}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{'23'}</div>
              <p className="text-xs text-muted-foreground">
                {'8 require your approval'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {'Total Volume'}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{'$2.4M'}</div>
              <p className="text-xs text-muted-foreground">
                {'+18.2% from last month'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {'Policy Violations'}
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{'12'}</div>
              <p className="text-xs text-muted-foreground">
                {'-4 from last week'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="approvals" className="space-y-4">
          <TabsList>
            <TabsTrigger value="approvals">{'Pending Approvals'}</TabsTrigger>
            <TabsTrigger value="transactions">{'Recent Transactions'}</TabsTrigger>
            <TabsTrigger value="policies">{'Active Policies'}</TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{'Approval Queue'}</CardTitle>
                <CardDescription>
                  {'Transactions awaiting your approval'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: 'TXN-1001',
                      amount: '$15,000',
                      from: 'Marketing Budget',
                      to: 'Ad Campaign Q4',
                      status: 'pending',
                      approvals: '1/2',
                    },
                    {
                      id: 'TXN-1002',
                      amount: '$8,500',
                      from: 'Operations',
                      to: 'Equipment Purchase',
                      status: 'pending',
                      approvals: '0/2',
                    },
                    {
                      id: 'TXN-1003',
                      amount: '$25,000',
                      from: 'R&D Budget',
                      to: 'Lab Equipment',
                      status: 'pending',
                      approvals: '1/3',
                    },
                  ].map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{txn.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {`${txn.from} → ${txn.to}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {`Approvals: ${txn.approvals}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold">{txn.amount}</span>
                        <div className="flex gap-2">
                          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                            <CheckCircle2 className="h-4 w-4" />
                            {'Approve'}
                          </button>
                          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                            <XCircle className="h-4 w-4" />
                            {'Reject'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{'Recent Transactions'}</CardTitle>
                <CardDescription>
                  {'Latest transaction activity'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: 'TXN-998',
                      amount: '$5,000',
                      description: 'Software Licenses',
                      status: 'completed',
                      time: '2 hours ago',
                    },
                    {
                      id: 'TXN-999',
                      amount: '$12,500',
                      description: 'Contractor Payment',
                      status: 'completed',
                      time: '5 hours ago',
                    },
                    {
                      id: 'TXN-1000',
                      amount: '$3,200',
                      description: 'Office Supplies',
                      status: 'completed',
                      time: '1 day ago',
                    },
                  ].map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{txn.id}</p>
                        <p className="text-sm text-muted-foreground">{txn.description}</p>
                        <p className="text-xs text-muted-foreground">{txn.time}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold">{txn.amount}</span>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-500/10 text-green-500">
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{'Active Policies'}</CardTitle>
                <CardDescription>
                  {'Currently enforced transaction policies'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: 'High Value Approval',
                      description: 'Transactions over $10,000 require 2 approvals',
                      enabled: true,
                      triggered: 23,
                    },
                    {
                      name: 'Velocity Check',
                      description: 'Max 5 transactions per hour per user',
                      enabled: true,
                      triggered: 3,
                    },
                    {
                      name: 'International Transfer',
                      description: 'All international transfers require CFO approval',
                      enabled: true,
                      triggered: 8,
                    },
                  ].map((policy, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{policy.name}</p>
                        <p className="text-sm text-muted-foreground">{policy.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {`Triggered ${policy.triggered} times this month`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-500/10 text-green-500">
                          {'Enabled'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
