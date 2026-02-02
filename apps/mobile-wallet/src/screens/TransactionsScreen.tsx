/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo } from 'react';
import { useWallet } from '../hooks/useWallet';
import { TransactionListItem } from '../components/TransactionListItem';
import { format } from '../utils/format';
import { 
    Clock, LayoutGrid, List, Search, ArrowUpRight, 
    RefreshCw, ArrowRightLeft, Globe, ShieldCheck, 
    Activity, Filter, ChevronDown 
} from 'lucide-react';
import { Transaction } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { ASSET_DATA } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

// Sub-component for Card View
const TransactionCardItem: React.FC<{ transaction: Transaction; price: number }> = ({ transaction, price }) => {
    const asset = ASSET_DATA[transaction.token];
    if (!asset) return null;

    const isSwap = transaction.type === 'swap' && transaction.swapDetails;
    const isBridge = transaction.type === 'bridge' && transaction.swapDetails;
    const isTransfer = transaction.type === 'transfer';
    
    let Icon = ArrowUpRight;
    if (isSwap) Icon = RefreshCw;
    if (isBridge) Icon = Globe;
    if (isTransfer) Icon = ArrowRightLeft;

    const tokenAmount = (isSwap || isBridge) ? transaction.swapDetails?.toAmount : (transaction.amount / price);
    const fromAsset = (isSwap || isBridge) ? ASSET_DATA[transaction.swapDetails!.fromToken] : null;
    const isInEscrow = transaction.metadata?.escrowId || transaction.status === 'pending';

    return (
        <div className="bg-ui-card rounded-2xl border border-ui-border p-5 flex flex-col gap-4 shadow-xl hover:border-accent-primary/30 transition-all group relative overflow-hidden">
            {isInEscrow && (
                <div className="absolute top-0 right-0 px-2 py-1 bg-yellow-500/10 border-b border-l border-yellow-500/20 rounded-bl-lg">
                    <span className="text-[7px] font-black text-yellow-500 uppercase tracking-widest">Escrow</span>
                </div>
            )}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ui-card-secondary border border-ui-border flex items-center justify-center group-hover:border-accent-primary/50 transition-colors">
                        <Icon size={18} className="text-accent-primary" />
                    </div>
                    <div>
                        <h4 className="font-black text-[11px] text-text-primary uppercase tracking-widest leading-none mb-1">
                            {isSwap 
                                ? 'Protocol Swap' 
                                : isBridge
                                    ? 'Cross-Chain Bridge'
                                    : isTransfer
                                        ? `To ${transaction.merchant?.slice(0, 10)}...`
                                        : transaction.merchant
                            }
                        </h4>
                        <p className="text-[9px] text-text-secondary font-mono font-medium uppercase tracking-tight">{format(new Date(transaction.timestamp), 'MMM d, HH:mm')}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-mono font-black text-xs text-text-primary">${transaction.amount.toFixed(2)}</p>
                    <p className={`text-[8px] font-bold uppercase tracking-widest ${isInEscrow ? 'text-yellow-500/60' : 'text-green-500/60'}`}>
                        {isInEscrow ? 'Awaiting Proof' : 'Settled'}
                    </p>
                </div>
            </div>
            {(isSwap || isBridge) ? (
                <div className="flex items-center justify-between bg-ui-bg p-3 rounded-xl text-[10px] font-mono border border-ui-border">
                    <div className="flex flex-col">
                        <span className="text-[7px] text-text-secondary uppercase font-bold mb-0.5 tracking-tighter">Source</span>
                        <span className="text-text-secondary font-bold">{transaction.swapDetails?.fromAmount.toFixed(3)} {fromAsset?.ticker}</span>
                    </div>
                    <div className="w-4 h-[1px] bg-ui-border mx-2" />
                    <div className="flex flex-col items-end">
                        <span className="text-[7px] text-accent-primary uppercase font-bold mb-0.5 tracking-tighter">Target</span>
                        <span className="text-accent-primary font-bold">{tokenAmount?.toFixed(3)} {asset.ticker}</span>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between bg-ui-bg p-3 rounded-xl text-[10px] font-mono border border-ui-border">
                     <div className="flex flex-col">
                        <span className="text-[7px] text-text-secondary uppercase font-bold mb-0.5 tracking-tighter">Reference</span>
                        <span className="text-text-secondary font-mono">{transaction.id.slice(0, 12)}...</span>
                     </div>
                     <div className="flex flex-col items-end text-right">
                        <span className="text-[7px] text-accent-primary uppercase font-bold mb-0.5 tracking-tighter">Authorization</span>
                        <span className="text-accent-primary font-bold">{tokenAmount?.toFixed(4)} {asset.ticker}</span>
                     </div>
                </div>
            )}
            {transaction.metadata?.escrowId && (
                <div className="flex items-center gap-2 pt-1 border-t border-ui-border/50">
                    <ShieldCheck size={10} className="text-yellow-500" />
                    <span className="text-[7px] font-mono text-text-secondary uppercase tracking-widest">Escrow ID: {transaction.metadata.escrowId}</span>
                </div>
            )}
        </div>
    );
};

export const TransactionsScreen: React.FC = () => {
    const { transactions, prices } = useWallet();
    const { t } = useTranslation();

    const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [transactionTypeFilter, setTransactionTypeFilter] = useState<'all' | 'sale' | 'swap' | 'transfer' | 'bridge'>('all');

    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(tx => {
                if (transactionTypeFilter === 'all') return true;
                return tx.type === transactionTypeFilter;
            })
            .filter(tx => {
                if (!searchTerm.trim()) return true;
                const lowerSearch = searchTerm.toLowerCase();
                const merchantMatch = tx.merchant?.toLowerCase().includes(lowerSearch) ?? false;
                const tokenMatch = tx.token.toLowerCase().includes(lowerSearch);
                const fromTokenMatch = tx.swapDetails?.fromToken.toLowerCase().includes(lowerSearch) ?? false;
                const toTokenMatch = tx.swapDetails?.toToken.toLowerCase().includes(lowerSearch) ?? false;
                return merchantMatch || tokenMatch || fromTokenMatch || toTokenMatch;
            });
    }, [transactions, transactionTypeFilter, searchTerm]);
    
    const groupedTransactions = useMemo(() => {
        return filteredTransactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
            const date = format(new Date(tx.timestamp), 'MMMM d, yyyy');
            if (!acc[date]) acc[date] = [];
            acc[date].push(tx);
            return acc;
        }, {});
    }, [filteredTransactions]);

    const stats = useMemo(() => {
        const last24h = Date.now() - 86400000;
        const recentTxs = transactions.filter(t => t.timestamp > last24h);
        const totalVol = recentTxs.reduce((acc, t) => acc + t.amount, 0);
        return {
            count: recentTxs.length,
            volume: totalVol
        };
    }, [transactions]);

    return (
        <div className="h-full flex flex-col px-6 bg-ui-bg text-text-primary">
            {/* Header */}
            <div className="shrink-0 pt-4 pb-6 space-y-5">
                <div className="flex items-center justify-between bg-ui-card p-4 rounded-2xl border border-ui-border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                            <Activity size={18} />
                        </div>
                        <div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Ledger Health</h2>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[9px] font-mono font-bold text-green-500 uppercase">Synchronized</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-bold text-text-secondary uppercase tracking-widest mb-0.5">24H Volume</p>
                        <p className="text-xs font-mono font-black text-text-primary">${stats.volume.toFixed(2)}</p>
                    </div>
                </div>

                <div className="relative group">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search protocol ledger..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-ui-card border border-ui-border rounded-2xl py-3.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-accent-primary/50 focus:border-accent-primary/50 text-text-primary placeholder:text-text-secondary/40 transition-all shadow-inner"
                    />
                </div>
                
                <div className="flex justify-between items-center gap-3">
                    <div className="flex-1 overflow-x-auto custom-scrollbar flex gap-2 p-1.5 rounded-2xl border border-ui-border bg-ui-card-secondary/30">
                        {(['all', 'sale', 'swap', 'transfer', 'bridge'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setTransactionTypeFilter(type)}
                                className={`px-4 py-2 text-[9px] font-black rounded-xl transition-all capitalize whitespace-nowrap tracking-[0.1em] ${
                                    transactionTypeFilter === type 
                                    ? 'bg-accent-primary text-accent-secondary shadow-lg shadow-accent-primary/20' 
                                    : 'text-text-secondary hover:text-text-primary hover:bg-ui-card'
                                }`}
                            >
                                {type === 'sale' ? 'Checkout' : type}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-1 bg-ui-card-secondary/30 p-1.5 rounded-2xl border border-ui-border shrink-0 h-full shadow-sm">
                        <button 
                            onClick={() => setViewMode('list')} 
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-ui-card text-accent-primary' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            <List size={14} />
                        </button>
                        <button 
                            onClick={() => setViewMode('card')} 
                            className={`p-2 rounded-lg transition-all ${viewMode === 'card' ? 'bg-ui-card text-accent-primary' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            <LayoutGrid size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {filteredTransactions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-text-secondary p-6">
                    <div className="w-16 h-16 bg-ui-card rounded-[24px] flex items-center justify-center mb-6 border border-ui-border shadow-xl">
                        <Clock size={32} className="text-accent-primary/20" />
                    </div>
                    <h3 className="font-black text-text-primary uppercase tracking-widest text-xs mb-2">No Entries Found</h3>
                    <p className="text-[10px] max-w-[220px] font-medium leading-relaxed opacity-60 uppercase tracking-wider">Synchronize with node or adjust filters to view protocol history.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar -mx-6 px-6 pb-24">
                    <AnimatePresence>
                        {Object.entries(groupedTransactions).map(([date, txs]) => (
                            <motion.div 
                                key={date} 
                                className="mb-8"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="flex items-center gap-3 mb-4 px-1">
                                    <h3 className="text-[9px] font-black text-accent-primary/80 uppercase tracking-[0.25em]">
                                        {date}
                                    </h3>
                                    <div className="flex-1 h-[1px] bg-ui-border/50" />
                                </div>
                                <div className={`space-y-4 ${viewMode === 'card' ? 'grid grid-cols-1 gap-4 space-y-0' : ''}`}>
                                    {(txs as Transaction[]).map(tx => (
                                        viewMode === 'list' ?
                                        <TransactionListItem key={tx.id} transaction={tx} price={prices[tx.token] || 0} />
                                        : <TransactionCardItem key={tx.id} transaction={tx} price={prices[tx.token] || 0} />
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};