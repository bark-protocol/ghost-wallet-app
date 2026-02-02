/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Send, Loader2, Check, AlertTriangle, FileUp } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { Token } from '../types';
import { ASSET_DATA } from '../constants';
import { Button } from '../common/Button';
import { trpc } from '../../../../../lib/trpc';

interface Payment {
    id: number;
    recipient: string;
    amount: string;
}

export const BatchSendScreen: React.FC = () => {
    const { setActiveView, activeTab, balances, prices, addTransaction, walletLogEvent } = useWallet();
    const [payments, setPayments] = useState<Payment[]>([{ id: Date.now(), recipient: '', amount: '' }]);
    const [selectedToken, setSelectedToken] = useState<Token>('SOL');
    const [error, setError] = useState<string | null>(null);

    const batchTransferMutation = trpc.payments.batchTransfer.useMutation({
        onSuccess: (response, validPayments) => {
            validPayments.forEach((p, i) => {
                const usdValue = (parseFloat(p.amount) || 0) * (prices[selectedToken] || 0);
                addTransaction({
                    id: response.signatures[i],
                    timestamp: Date.now(),
                    amount: usdValue,
                    token: selectedToken,
                    status: 'success',
                    riskScore: 1,
                    type: 'transfer',
                    merchant: p.recipient,
                });
            });
            walletLogEvent('PAYMENT_CONFIRMED', 'MOBILE', `Batch transfer of ${validPayments.length} payments completed`, { total: totalUsdValue });
            setActiveView(activeTab);
        },
        onError: (e) => {
            setError(e.message || "Batch transfer failed.");
        }
    });

    const totalAmount = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const totalUsdValue = totalAmount * (prices[selectedToken] || 0);
    const availableBalance = balances[selectedToken] || 0;
    const hasSufficientBalance = totalAmount <= availableBalance;

    const addPayment = () => {
        setPayments([...payments, { id: Date.now(), recipient: '', amount: '' }]);
    };

    const removePayment = (id: number) => {
        setPayments(payments.filter(p => p.id !== id));
    };

    const updatePayment = (id: number, field: 'recipient' | 'amount', value: string) => {
        setPayments(payments.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const handleSend = () => {
        setError(null);
        if (!hasSufficientBalance) {
            setError("Insufficient balance for this batch transaction.");
            return;
        }

        const validPayments = payments.filter(p => p.recipient && parseFloat(p.amount) > 0);
        if (validPayments.length === 0) {
            setError("Please add at least one valid payment.");
            return;
        }

        batchTransferMutation.mutate(validPayments);
    };

    return (
        <div className="flex flex-col h-full bg-ui-bg text-text-primary">
            <header className="flex items-center p-4 shrink-0 border-b border-ui-border">
                <button onClick={() => setActiveView('send')} className="p-2 text-text-secondary hover:text-text-primary">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="flex-1 text-center font-bold text-sm uppercase tracking-widest">Batch Payments (x402)</h1>
                <div className="w-9" />
            </header>

            <main className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
                <div className="bg-ui-card border border-ui-border rounded-2xl p-4 flex justify-between items-center">
                    <div>
                        <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Asset</label>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-5 h-5">{ASSET_DATA[selectedToken]?.icon}</div>
                            <span className="text-sm font-bold">{selectedToken}</span>
                        </div>
                    </div>
                    <div>
                         <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest text-right block">Total Amount</label>
                        <p className="text-xl font-black text-right text-accent-primary">{totalAmount.toFixed(4)}</p>
                        <p className="text-[10px] text-text-secondary font-mono text-right">≈ ${totalUsdValue.toFixed(2)}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Payment List</label>
                    <button className="text-[10px] font-bold text-accent-primary flex items-center gap-1 hover:text-accent-secondary">
                        <FileUp size={12} /> Import CSV
                    </button>
                </div>
                
                <AnimatePresence>
                    <motion.div layout className="space-y-3">
                        {payments.map((payment, index) => (
                            <motion.div 
                                key={payment.id} 
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-ui-card border border-ui-border rounded-xl p-3 flex items-center gap-2"
                            >
                                <span className="text-[10px] font-mono text-text-secondary">{index + 1}.</span>
                                <input 
                                    type="text" 
                                    placeholder="Recipient Address"
                                    value={payment.recipient}
                                    onChange={(e) => updatePayment(payment.id, 'recipient', e.target.value)}
                                    className="flex-1 bg-ui-card-secondary border border-ui-border rounded-md p-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                />
                                <input 
                                    type="number" 
                                    placeholder="Amount"
                                    value={payment.amount}
                                    onChange={(e) => updatePayment(payment.id, 'amount', e.target.value)}
                                    className="w-24 bg-ui-card-secondary border border-ui-border rounded-md p-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                />
                                <button 
                                    onClick={() => removePayment(payment.id)}
                                    className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-md"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
                
                <button 
                    onClick={addPayment}
                    className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-ui-border rounded-xl text-text-secondary hover:border-accent-primary hover:text-accent-primary transition-colors"
                >
                    <Plus size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">Add Recipient</span>
                </button>

                {!hasSufficientBalance && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400">
                        <AlertTriangle size={14} />
                        <p className="text-xs font-bold">Insufficient balance. You need {totalAmount.toFixed(4)} {selectedToken}, but have {availableBalance.toFixed(4)}.</p>
                    </div>
                )}
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">{error}</div>
                )}
            </main>

            <footer className="p-6 pt-0">
                <Button 
                    onClick={handleSend}
                    disabled={batchTransferMutation.isPending || !hasSufficientBalance || payments.length === 0}
                    className="flex items-center justify-center gap-3 py-5 shadow-xl shadow-accent-primary/10"
                >
                    {batchTransferMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {batchTransferMutation.isPending ? `Broadcasting ${payments.length} Transactions...` : `Execute Batch (${payments.length})`}
                </Button>
            </footer>
        </div>
    );
};