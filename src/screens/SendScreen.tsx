/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, ChevronDown, Check, Loader2, Send, Scan, Search, History, Layers } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { Token } from '../types';
import { ASSET_DATA } from '../constants';
import { Button } from '../common/Button';
import { Avatar } from '../components/Avatar';

const RECENT_CONTACTS = [
    { name: 'Alice', address: '8x...29a', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&h=64' },
    { name: 'Bob', address: '3y...91b', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=64&h=64' },
    { name: 'Carol', address: '9z...12c', avatar: null },
    { name: 'Dave', address: '2w...88d', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=64&h=64' },
];

export const SendScreen: React.FC = () => {
    const { setActiveView, activeTab, balances, prices, addTransaction, walletLogEvent } = useWallet();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState<Token>('SOL');
    const [isTokenSelectorOpen, setTokenSelectorOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const availableTokens = (Object.keys(ASSET_DATA) as Token[]).filter(t => !['GHOST_OPS', 'GHOST', 'GHST'].includes(t));
    const balance = balances[selectedToken] || 0;
    const usdValue = (parseFloat(amount) || 0) * (prices[selectedToken] || 0);

    const handleSend = async () => {
        if (!recipient || !amount || parseFloat(amount) <= 0) return;
        if (parseFloat(amount) > balance) {
            alert("Insufficient balance");
            return;
        }

        setIsSending(true);
        // Simulate network delay
        await new Promise(r => setTimeout(r, 2000));

        const txId = 'tx_send_' + Math.random().toString(36).substring(2, 10);
        addTransaction({
            id: txId,
            timestamp: Date.now(),
            amount: usdValue,
            token: selectedToken,
            status: 'success',
            riskScore: 2,
            type: 'transfer',
            merchant: recipient, // Using merchant field as recipient for simplicity in this demo
            memo: `Transfer to ${recipient.slice(0, 8)}...`
        });

        walletLogEvent('WALLET_DEBIT', 'MOBILE', `Sent ${amount} ${selectedToken} to ${recipient}`, { txId, amount, token: selectedToken });

        setIsSending(false);
        setActiveView(activeTab);
    };

    return (
        <div className="flex flex-col h-full bg-ui-bg text-text-primary">
            <header className="flex items-center p-4 shrink-0 border-b border-ui-border">
                <button onClick={() => setActiveView(activeTab)} className="p-2 text-text-secondary hover:text-text-primary">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="flex-1 text-center font-bold text-sm uppercase tracking-widest">Send Assets</h1>
                <div className="w-9" />
            </header>

            <main className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                {/* Batch Payments Button */}
                 <button 
                    onClick={() => setActiveView('batchSend')}
                    className="w-full bg-accent-primary/10 border border-accent-primary/20 rounded-2xl p-4 flex items-center justify-between group hover:bg-accent-primary/20 transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent-primary/20 rounded-xl text-accent-primary">
                            <Layers size={16}/>
                        </div>
                        <div className="text-left">
                            <span className="text-xs font-black uppercase tracking-widest text-accent-primary">Batch Payments (x402)</span>
                            <p className="text-[10px] text-text-secondary font-medium">Send to multiple recipients in one flow</p>
                        </div>
                    </div>
                    <ChevronDown size={16} className="text-accent-primary -rotate-90" />
                </button>


                {/* Recent Contacts */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Recent Contacts</label>
                        <button className="text-[10px] font-bold text-accent-primary hover:text-accent-secondary transition-colors">View All</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                        {RECENT_CONTACTS.map((contact, i) => (
                            <button 
                                key={i} 
                                onClick={() => setRecipient(contact.address)}
                                className="flex flex-col items-center gap-2 group min-w-[60px]"
                            >
                                <div className={`p-0.5 rounded-full ring-2 transition-all ${recipient === contact.address ? 'ring-accent-primary scale-110' : 'ring-transparent group-hover:ring-ui-border'}`}>
                                    <Avatar src={contact.avatar} name={contact.name} size="md" />
                                </div>
                                <span className={`text-[10px] font-bold ${recipient === contact.address ? 'text-accent-primary' : 'text-text-secondary'}`}>{contact.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recipient Input */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">To</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-x-0 -translate-y-1/2 text-text-secondary pointer-events-none">
                            <Search size={16} />
                        </div>
                        <input 
                            type="text"
                            value={recipient}
                            onChange={e => setRecipient(e.target.value)}
                            placeholder="Address, domain, or identity"
                            className="w-full bg-ui-card border border-ui-border rounded-xl p-4 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all font-mono"
                        />
                        <button 
                            onClick={() => setActiveView('scan')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-secondary hover:text-text-primary bg-ui-card-secondary hover:bg-ui-border rounded-full transition-colors"
                        >
                            <Scan size={16} />
                        </button>
                    </div>
                </div>

                {/* Amount & Asset */}
                <div className="bg-ui-card-secondary ring-1 ring-ui-border rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center text-[10px] font-black text-text-secondary uppercase tracking-widest">
                        <span>Amount</span>
                        <button onClick={() => setAmount(balance.toString())} className="hover:text-accent-primary transition-colors bg-ui-card px-2 py-1 rounded-md ring-1 ring-ui-border">
                            Max: {balance.toFixed(4)}
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <input 
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="flex-1 bg-transparent text-4xl font-black focus:outline-none placeholder:text-text-secondary/20 text-text-primary"
                        />
                        <div className="relative">
                            <button 
                                onClick={() => setTokenSelectorOpen(!isTokenSelectorOpen)}
                                className="flex items-center gap-2 p-2 px-3 bg-ui-bg ring-1 ring-ui-border rounded-xl hover:bg-ui-card transition-colors shadow-sm"
                            >
                                <div className="w-5 h-5">{ASSET_DATA[selectedToken]?.icon}</div>
                                <span className="font-bold text-sm">{selectedToken}</span>
                                <ChevronDown size={14} className="text-text-secondary" />
                            </button>
                            {isTokenSelectorOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 z-50 bg-ui-card ring-1 ring-ui-border rounded-xl shadow-2xl p-2">
                                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                        {availableTokens.map(t => (
                                            <button 
                                                key={t}
                                                onClick={() => { setSelectedToken(t); setTokenSelectorOpen(false); }}
                                                className="w-full flex items-center justify-between p-3 hover:bg-ui-card-secondary rounded-lg transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5">{ASSET_DATA[t]?.icon}</div>
                                                    <div className="flex flex-col text-left">
                                                        <span className="font-bold text-xs">{t}</span>
                                                        <span className="text-[8px] text-text-secondary font-mono">{balances[t]?.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                {t === selectedToken && <Check size={12} className="text-accent-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono text-text-secondary pt-2 border-t border-ui-border/50">
                        <span>≈ ${usdValue.toFixed(2)} USD</span>
                        <span>Fee: &lt; $0.01</span>
                    </div>
                </div>
            </main>

            <footer className="p-6 pt-0">
                <Button 
                    onClick={handleSend}
                    disabled={isSending || !recipient || !amount || parseFloat(amount) <= 0}
                    className="flex items-center justify-center gap-3 py-5 shadow-xl shadow-accent-primary/10"
                >
                    {isSending ? (
                        <>
                            <Loader2 size={18} className="animate-spin" /> Sending Assets...
                        </>
                    ) : (
                        <>
                            <Send size={18} /> Confirm Transaction
                        </>
                    )}
                </Button>
            </footer>
        </div>
    );
};