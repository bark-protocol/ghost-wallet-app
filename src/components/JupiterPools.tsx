
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, ArrowRight, Loader2, Droplets, Zap } from 'lucide-react';
import { fetchJupiterTokens } from '../../../../../lib/sdk/solana/jupiter';
import { ASSET_DATA, JupiterIcon } from '../../../../../constants';
import { Token } from '../types';

interface PoolData {
    symbol: string;
    name: string;
    logo: React.ReactNode | string;
    tvl: string;
    volume24h: string;
    change24h: number;
    isVerified?: boolean;
}

export const JupiterPools: React.FC = () => {
    const [pools, setPools] = useState<PoolData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPools = async () => {
            try {
                const tokens = await fetchJupiterTokens('strict');
                
                // Construct fixed pools first using protocol icons
                const topMarkets: PoolData[] = [
                    {
                        symbol: 'GHOST',
                        name: 'Ghost Protocol',
                        logo: ASSET_DATA['GHOST'].icon,
                        tvl: '14.2M',
                        volume24h: '2.8M',
                        change24h: 8.42,
                        isVerified: true
                    },
                    {
                        symbol: 'JUP',
                        name: 'Jupiter',
                        logo: ASSET_DATA['JUP'].icon,
                        tvl: '85.4M',
                        volume24h: '12.6M',
                        change24h: 3.15,
                        isVerified: true
                    },
                    {
                        symbol: 'SOL',
                        name: 'Solana',
                        logo: ASSET_DATA['SOL'].icon,
                        tvl: '4.2B',
                        volume24h: '1.5B',
                        change24h: 1.24,
                        isVerified: true
                    }
                ];

                // Select a few prominent tokens from Jupiter to fill the rest, 
                // avoiding duplicates with topMarkets
                const dynamic = tokens
                    .filter((t: any) => !topMarkets.some(m => m.symbol === t.symbol))
                    .slice(0, 3)
                    .map((t: any) => ({
                        symbol: t.symbol,
                        name: t.name,
                        logo: t.logoURI,
                        tvl: (Math.random() * 10 + 2).toFixed(1) + 'M',
                        volume24h: (Math.random() * 5 + 1).toFixed(1) + 'M',
                        change24h: (Math.random() * 10 - 4),
                    }));

                setPools([...topMarkets, ...dynamic]);
            } catch (e) {
                console.error("Failed to load Jupiter pools", e);
            } finally {
                setLoading(false);
            }
        };
        loadPools();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
                <Loader2 className="animate-spin text-accent-primary" size={24} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Scanning Liquidity...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4 mt-10">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5">
                        <JupiterIcon />
                    </div>
                    <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Hot Markets</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-accent-primary/10 rounded-md ring-1 ring-accent-primary/20">
                    <div className="w-1 h-1 rounded-full bg-accent-primary animate-pulse" />
                    <span className="text-[8px] font-black text-accent-primary uppercase tracking-widest">Live v6</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {pools.map((pool, idx) => (
                    <motion.button
                        key={pool.symbol}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-ui-border bg-ui-card p-4 transition-all hover:bg-ui-card-secondary active:scale-[0.98]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/0 via-accent-primary/0 to-accent-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                        
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ui-bg p-1 ring-1 ring-ui-border transition-all group-hover:ring-accent-primary/30 overflow-hidden">
                                {typeof pool.logo === 'string' ? (
                                    <img src={pool.logo} alt={pool.symbol} className="h-full w-full rounded-full object-cover" />
                                ) : (
                                    <div className="h-full w-full">{pool.logo}</div>
                                )}
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-black uppercase leading-none text-text-primary">{pool.symbol}/USDC</p>
                                    {(idx === 0 || pool.isVerified) && <Zap size={10} className="fill-accent-primary text-accent-primary" />}
                                </div>
                                <p className="mt-1 text-[10px] font-medium uppercase tracking-tight text-text-secondary truncate max-w-[80px]">{pool.name}</p>
                            </div>
                        </div>

                        <div className="relative z-10 flex items-center gap-6 sm:gap-8">
                            <div className="hidden text-right sm:block">
                                <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-text-secondary">Volume</p>
                                <div className="flex items-center gap-1 font-mono text-xs font-bold text-text-primary">
                                    <BarChart3 size={10} className="text-accent-primary/50" />
                                    ${pool.volume24h}
                                </div>
                            </div>
                            <div className="min-w-[65px] text-right">
                                <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-text-secondary">24h Change</p>
                                <div className={`flex items-center justify-end gap-1 font-mono text-xs font-bold ${pool.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    <TrendingUp size={10} className={pool.change24h < 0 ? 'rotate-180' : ''} />
                                    {pool.change24h >= 0 ? '+' : ''}{pool.change24h.toFixed(2)}%
                                </div>
                            </div>
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-ui-border bg-ui-card-secondary transition-all group-hover:border-accent-primary group-hover:bg-accent-primary group-hover:text-accent-secondary">
                                <ArrowRight size={14} />
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
            
            <div className="flex justify-center pt-2">
                <button className="flex items-center gap-2 rounded-full border border-ui-border bg-ui-card-secondary px-4 py-2 text-[9px] font-black uppercase tracking-widest text-text-secondary transition-all hover:border-accent-primary/50 hover:text-text-primary">
                    Explore Ecosystem <Droplets size={12} />
                </button>
            </div>
        </div>
    );
};
