/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ArrowUpRight, RefreshCw, ArrowRightLeft, Globe, ShieldCheck, Clock } from 'lucide-react';
import { Transaction } from '../types';
import { ASSET_DATA } from '../constants';
import { format } from '../utils/format';

interface TransactionListItemProps {
    transaction: Transaction;
    price: number;
}

export const TransactionListItem: React.FC<TransactionListItemProps> = ({ transaction, price }) => {
    const asset = ASSET_DATA[transaction.token];
    if (!asset) return null;

    const tokenAmount = transaction.amount / price;
    const isCredit = false; // Assuming debit for this demo
    const isInEscrow = transaction.metadata?.escrowId || transaction.status === 'pending';
    
    // Determine icon based on transaction type
    let IconComponent = ArrowUpRight;
    let transactionLabel = 'Protocol Checkout';
    
    switch (transaction.type) {
        case 'swap':
            IconComponent = RefreshCw;
            transactionLabel = 'DEX Swap';
            break;
        case 'transfer':
            IconComponent = ArrowRightLeft;
            transactionLabel = 'P2P Transfer';
            break;
        case 'bridge':
            IconComponent = Globe;
            transactionLabel = 'L2 Bridge Relay';
            break;
        default:
            IconComponent = ArrowUpRight;
            transactionLabel = 'Direct Checkout';
    }

    return (
        <div className="flex items-center justify-between p-4 bg-ui-card border border-ui-border rounded-2xl shadow-lg hover:bg-ui-card-secondary transition-all group active:scale-[0.99] relative overflow-hidden">
            {isInEscrow && (
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-yellow-500/10 border-b border-l border-yellow-500/20 rounded-bl-lg">
                    <div className="flex items-center gap-1">
                        <Clock size={8} className="text-yellow-500" />
                        <span className="text-[6px] font-black text-yellow-500 uppercase tracking-widest">Escrow</span>
                    </div>
                </div>
            )}
            
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-ui-card-secondary rounded-xl border border-ui-border group-hover:border-accent-primary/50 transition-colors">
                    <IconComponent size={18} className={isInEscrow ? "text-yellow-400 animate-pulse" : "text-accent-primary"} />
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="font-black text-[11px] uppercase tracking-wider text-text-primary leading-none">
                        {transactionLabel}
                    </span>
                    <span className="text-[9px] text-text-secondary font-bold uppercase tracking-widest font-mono flex items-center gap-1.5">
                        {transaction.merchant?.slice(0, 14)} 
                        <span className="w-1 h-1 rounded-full bg-ui-border" />
                        {format(new Date(transaction.timestamp), 'h:mm a')}
                    </span>
                </div>
            </div>
            <div className="text-right">
                <div className={`font-black text-[11px] font-mono ${isCredit ? 'text-green-400' : 'text-text-primary'}`}>
                    {isCredit ? '+' : '-'}{tokenAmount.toFixed(4)} {asset.ticker}
                </div>
                <div className="text-[10px] text-text-secondary font-bold font-mono">
                    ${transaction.amount.toFixed(2)}
                </div>
            </div>
        </div>
    );
};