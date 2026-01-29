
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Token } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { ASSET_DATA } from '../constants';
import { useWallet } from '../hooks/useWallet';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';

interface TotalBalanceProps {
    balances: Record<Token, number>;
    prices: Record<Token, number>;
}

export const TotalBalance: React.FC<TotalBalanceProps> = ({ balances, prices }) => {
    const { t } = useTranslation();
    const { isBalancesHidden, toggleBalancesHidden } = useWallet();
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    const totalUsdBalance = useMemo(() => (Object.keys(balances) as Token[]).reduce((acc, token) => {
        return acc + ((balances[token] || 0) * (prices[token] || 0));
    }, 0), [balances, prices]);

    const totalSolValue = useMemo(() => {
        const solPrice = prices['SOL'] || 1;
        return totalUsdBalance / solPrice;
    }, [totalUsdBalance, prices]);

    const sortedTokensByValue = useMemo(() => {
        return (Object.keys(balances) as Token[])
            .map(token => ({
                token,
                usdValue: (balances[token] || 0) * (prices[token] || 0),
            }))
            .filter(item => item.usdValue > 0.01) // Filter out negligible amounts
            .sort((a, b) => b.usdValue - a.usdValue);
    }, [balances, prices]);

    return (
        <div className="relative flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
                <p className="text-[9px] text-accent-primary/80 uppercase tracking-[0.3em] font-bold">{t('home.total_liquidity')}</p>
                <button onClick={toggleBalancesHidden} className="text-text-secondary/50 hover:text-text-primary transition-colors">
                    {isBalancesHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
            </div>
            
            <div 
                className="relative inline-block cursor-pointer group flex flex-col items-center"
                onMouseEnter={() => setIsTooltipVisible(true)}
                onMouseLeave={() => setIsTooltipVisible(false)}
                onClick={() => setIsTooltipVisible(p => !p)}
            >
                <h2 className="text-5xl font-black tracking-tighter mb-1 text-text-primary truncate px-2 group-hover:text-accent-primary/80 transition-colors">
                    {isBalancesHidden ? '••••••' : `$${totalUsdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </h2>
                <p className="text-xs font-mono font-bold text-text-secondary mb-4 opacity-60">
                    {isBalancesHidden ? '•••• SOL' : `≈ ${totalSolValue.toFixed(4)} SOL`}
                </p>

                <AnimatePresence>
                    {isTooltipVisible && !isBalancesHidden && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-ui-card/80 backdrop-blur-lg ring-1 ring-ui-border rounded-2xl shadow-2xl z-50 text-left overflow-hidden"
                        >
                            <div className="p-4 border-b border-ui-border">
                                <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Portfolio Breakdown</h4>
                            </div>
                            <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
                                <div className="space-y-1">
                                    {sortedTokensByValue.map(({ token, usdValue }) => {
                                        const asset = ASSET_DATA[token];
                                        if (!asset) return null;
                                        return (
                                            <div key={token} className="flex items-center justify-between p-2 rounded-lg hover:bg-ui-card-secondary">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6">{asset.icon}</div>
                                                    <span className="text-xs font-bold text-text-primary">{asset.ticker}</span>
                                                </div>
                                                <div className="text-right">
                                                     <span className="text-xs font-mono font-bold text-text-primary">${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <div className="flex gap-3">
                <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-ui-card rounded-full inline-flex border border-ui-border">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)] animate-pulse" />
                    <span className="text-[8px] font-bold font-mono text-text-secondary uppercase tracking-widest">{t('home.status')}</span>
                </div>
                {!isBalancesHidden && (
                    <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-500/10 rounded-full inline-flex border border-green-500/20 text-green-500">
                        <TrendingUp size={10} />
                        <span className="text-[8px] font-bold font-mono uppercase tracking-widest">+5.2% (24h)</span>
                    </div>
                )}
            </div>
        </div>
    );
};
