/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowDown, Check, Cpu, Info, Loader, ShieldCheck, 
    ChevronDown, Globe, Zap, ArrowRight, ExternalLink 
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { ASSET_DATA } from '../constants';
import { Token, Chain } from '../types';
import { SolIcon, SuiIcon } from '../../../../../constants'; 
import { useTranslation } from '../hooks/useTranslation';

// --- CONFIGURATION ---
const CHAIN_DATA: Record<Chain, { name: string; icon: React.ReactNode; tokens: Token[]; color: string }> = {
    solana: { name: 'Solana', icon: <SolIcon />, tokens: ['SOL', 'USDC', 'GHOST', 'GHST'], color: 'text-purple-400' },
    sui: { name: 'Sui', icon: <SuiIcon />, tokens: ['SUI', 'USDC', 'GHOST', 'GHST'], color: 'text-blue-400' },
    base: { name: 'Base', icon: <Globe className="text-blue-600" />, tokens: ['USDC', 'GHOST', 'GHST'], color: 'text-blue-600' },
    ethereum: { name: 'Ethereum', icon: <Globe className="text-gray-400" />, tokens: ['USDC', 'GHOST', 'GHST'], color: 'text-gray-400' },
};

const BRIDGE_FEE_OPS = 0.5;

interface ChainSelectorProps {
    label: string;
    chain: Chain;
    onSelect: (c: Chain) => void;
}

const ChainSelector: React.FC<ChainSelectorProps> = ({ label, chain, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <span className="text-[8px] font-black text-text-secondary uppercase tracking-[0.2em] ml-1 mb-1 block">{label}</span>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-2.5 bg-ui-bg ring-1 ring-ui-border rounded-xl hover:bg-ui-card transition-colors"
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-5 h-5 shrink-0">{CHAIN_DATA[chain].icon}</div>
                    <span className="text-xs font-bold text-text-primary capitalize truncate">{chain}</span>
                </div>
                <ChevronDown size={12} className="text-text-secondary shrink-0" />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 right-0 mt-2 z-50 bg-ui-card ring-1 ring-ui-border rounded-xl shadow-2xl p-1"
                    >
                        {(Object.keys(CHAIN_DATA) as Chain[]).map(c => (
                            <button 
                                key={c} 
                                onClick={() => { onSelect(c); setIsOpen(false); }}
                                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${c === chain ? 'bg-accent-primary/10' : 'hover:bg-ui-card-secondary'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6">{CHAIN_DATA[c].icon}</div>
                                    <span className="text-xs font-bold capitalize">{c}</span>
                                </div>
                                {c === chain && <Check size={14} className="text-accent-primary" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const BridgeScreen: React.FC = () => {
    const { balances, prices, addDeFiTransaction, setActiveTab, walletLogEvent } = useWallet();
    const { t } = useTranslation();
    
    const [fromChain, setFromChain] = useState<Chain>('solana');
    const [toChain, setToChain] = useState<Chain>('sui');
    const [fromToken, setFromToken] = useState<Token>('USDC');
    const [toToken, setToToken] = useState<Token>('USDC');
    const [amount, setAmount] = useState('');
    
    const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
    const [step, setStep] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const steps = [
        "Initiating Cross-Chain Handshake",
        "Locking Assets in Escrow",
        "Verifying State with ZK-Oracle",
        "Finalizing Settlement"
    ];

    const usdValue = useMemo(() => (parseFloat(amount) || 0) * (prices[fromToken] || 0), [amount, fromToken, prices]);

    const handleSwapChains = () => {
        const prevFrom = fromChain;
        setFromChain(toChain);
        setToChain(prevFrom);
        setStep(0);
    };

    const handleBridge = async () => {
        setError(null);
        const amountNum = parseFloat(amount);
        
        if (!amountNum || amountNum <= 0) {
            setError("Enter a valid amount");
            return;
        }

        if (amountNum > (balances[fromToken] || 0)) {
            setError(`Insufficient ${fromToken} balance`);
            return;
        }

        if ((balances['GHOST_OPS'] || 0) < BRIDGE_FEE_OPS) {
            setError("Insufficient Ghost-OPS for bridge fees");
            return;
        }

        setStatus('processing');
        walletLogEvent('PAYMENT_INIT', 'MOBILE', `Bridging ${amount} ${fromToken} from ${fromChain.toUpperCase()} to ${toChain.toUpperCase()}`);

        // Sequence simulation
        for (let i = 0; i < steps.length; i++) {
            setStep(i);
            await new Promise(r => setTimeout(r, 1200));
        }

        addDeFiTransaction({
            fromToken,
            fromAmount: amountNum,
            toToken,
            toAmount: amountNum, 
            usdValue,
            feeOps: BRIDGE_FEE_OPS
        }, 'bridge');

        setStatus('success');
    };

    if (status === 'processing') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-ui-bg text-center overflow-y-auto custom-scrollbar">
                <div className="relative w-24 h-24 mb-10 shrink-0">
                    <motion.div 
                        className="absolute inset-0 border-4 border-accent-primary/20 rounded-full"
                    />
                    <motion.div 
                        className="absolute inset-0 border-4 border-t-accent-primary rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Globe size={32} className="text-accent-primary animate-pulse" />
                    </div>
                </div>
                
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">Omni-Chain Relay</h3>
                <div className="space-y-4 w-full max-w-xs">
                    {steps.map((label, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${i < step ? 'bg-green-500' : i === step ? 'bg-accent-primary' : 'bg-ui-card ring-1 ring-ui-border'}`}>
                                {i < step ? <Check size={12} className="text-white" /> : <span className="text-[10px] font-bold text-white">{i + 1}</span>}
                            </div>
                            <span className={`text-[11px] font-bold uppercase tracking-wide text-left transition-opacity ${i === step ? 'opacity-100' : 'opacity-40'}`}>
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-ui-bg text-center overflow-y-auto custom-scrollbar">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-green-500/20 shrink-0">
                    <ShieldCheck size={40} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Bridge Confirmed</h2>
                <p className="text-sm text-text-secondary mb-8 leading-relaxed max-w-[240px] mx-auto font-medium">
                    Assets are now available on the <span className="text-text-primary font-bold uppercase">{toChain}</span> network.
                </p>
                <div className="w-full space-y-3 mb-10 max-w-xs">
                    <div className="p-4 bg-ui-card rounded-2xl border border-ui-border flex justify-between items-center text-[10px] font-mono">
                        <span className="opacity-50 uppercase">Relay Hash</span>
                        <span className="text-accent-primary flex items-center gap-1">0x72a...d91 <ExternalLink size={10} /></span>
                    </div>
                </div>
                <button 
                    onClick={() => setActiveTab('home')}
                    className="w-full max-w-xs py-4 bg-accent-primary text-accent-secondary rounded-xl text-sm font-black uppercase tracking-widest shadow-xl shadow-accent-primary/20"
                >
                    Back to Portfolio
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col px-6 overflow-hidden relative">
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pt-2 pb-32">
                
                <div className="flex items-center justify-between p-3 bg-ui-card rounded-2xl ring-1 ring-ui-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent-primary/10 rounded-xl">
                            <Globe size={16} className="text-accent-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Omni-Chain Relay</p>
                            <p className="text-[8px] text-text-secondary font-mono uppercase">v1.2 // Mainnet Node</p>
                        </div>
                    </div>
                    <div className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-[8px] font-black uppercase tracking-widest ring-1 ring-green-500/20">
                        Live
                    </div>
                </div>

                <div className="relative space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <ChainSelector label="Source" chain={fromChain} onSelect={setFromChain} />
                        <ChainSelector label="Destination" chain={toChain} onSelect={setToChain} />
                    </div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 mt-1.5">
                        <button 
                            onClick={handleSwapChains}
                            className="w-8 h-8 bg-ui-bg ring-4 ring-ui-bg rounded-full flex items-center justify-center text-text-secondary hover:text-accent-primary transition-all border border-ui-border shadow-md"
                        >
                            <ArrowRight size={16} className="rotate-0" />
                        </button>
                    </div>
                </div>

                <div className="bg-ui-card ring-1 ring-ui-border rounded-[24px] p-5 space-y-5">
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-1">
                            <span>Asset Amount</span>
                            <button onClick={() => setAmount((balances[fromToken] || 0).toString())} className="text-accent-primary hover:opacity-70 transition-opacity bg-accent-primary/5 px-2 py-0.5 rounded-md">MAX</button>
                        </div>
                        <div className="flex items-center gap-3">
                             <input 
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="flex-1 bg-transparent text-3xl font-black focus:outline-none placeholder:text-text-secondary/10 text-text-primary"
                                placeholder="0.00"
                            />
                            <div className="px-3 py-1.5 bg-ui-bg ring-1 ring-ui-border rounded-xl flex items-center gap-2">
                                <div className="w-4 h-4 shrink-0">{ASSET_DATA[fromToken]?.icon}</div>
                                <span className="text-xs font-bold">{fromToken}</span>
                            </div>
                        </div>
                        <p className="text-[9px] font-mono text-text-secondary font-bold px-1">~${usdValue.toFixed(2)} USD</p>
                    </div>

                    <div className="pt-4 border-t border-ui-border space-y-2">
                         <div className="flex justify-between items-center text-[10px]">
                            <span className="text-text-secondary font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <Cpu size={12} className="opacity-50" /> Protocol Fee
                            </span>
                            <span className="font-mono text-accent-primary font-black">{BRIDGE_FEE_OPS} OPS</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-text-secondary font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <ShieldCheck size={12} className="opacity-50" /> ZK Verification
                            </span>
                            <span className="font-mono text-text-primary font-bold">Encrypted</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5">
                        <Info size={14} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-red-400 font-bold leading-relaxed">{error}</p>
                    </motion.div>
                )}

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                     <div className="p-2 bg-ghost-gold/10 rounded-lg text-ghost-gold">
                         <ShieldCheck size={16} />
                     </div>
                     <div className="flex-1">
                         <p className="text-[9px] font-black uppercase text-white/60 mb-0.5">Relay Security</p>
                         <p className="text-[8px] text-white/30 uppercase leading-none">Atomic settlement via liquidity pools</p>
                     </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 px-6 pt-4 pb-10 bg-gradient-to-t from-ui-bg via-ui-bg to-transparent">
                <button 
                    onClick={handleBridge}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className="w-full py-5 bg-accent-primary text-accent-secondary rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-accent-primary/20"
                >
                    <Zap size={18} /> Initiate Bridge Relay
                </button>
            </div>
        </div>
    );
};