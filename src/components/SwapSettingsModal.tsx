/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';
import { X, Info, ShieldCheck, Zap, ListFilter } from 'lucide-react';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { useWallet } from '../hooks/useWallet';

interface SwapSettingsModalProps {
    slippageBps: number;
    isMevProtected: boolean;
    useStrictList?: boolean; // New prop
    onSlippageChange: (bps: number) => void;
    onMevToggle: () => void;
    onListToggle?: () => void; // New prop
    onClose: () => void;
}

export const SwapSettingsModal: React.FC<SwapSettingsModalProps> = ({ 
    slippageBps, 
    isMevProtected, 
    useStrictList = false,
    onSlippageChange, 
    onMevToggle,
    onListToggle, 
    onClose 
}) => {
    const { walletLogEvent } = useWallet();
    
    const handleSlippagePreset = (percentage: number) => {
        const bps = Math.round(percentage * 100);
        onSlippageChange(bps);
        walletLogEvent('SETTINGS_CHANGE', 'MOBILE', `Slippage tolerance set to ${percentage}%`, { setting: 'slippage_bps', value: bps });
    };

    const handleCustomSlippage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            // Cap it at a reasonable max for safety in the demo
            const clamped = Math.min(Math.max(value, 0.01), 50);
            const bps = Math.round(clamped * 100);
            onSlippageChange(bps);
            walletLogEvent('SETTINGS_CHANGE', 'MOBILE', `Slippage tolerance set to ${clamped}%`, { setting: 'slippage_bps', value: bps });
        } else if (e.target.value === '') {
            onSlippageChange(0);
        }
    };
    
    const handleMevToggle = () => {
        onMevToggle();
        walletLogEvent('SETTINGS_CHANGE', 'MOBILE', `MEV Shield ${!isMevProtected ? 'enabled' : 'disabled'}`, { setting: 'mev_protection', value: !isMevProtected });
    };

    const handleListToggle = () => {
        if (onListToggle) {
            onListToggle();
            walletLogEvent('SETTINGS_CHANGE', 'MOBILE', `Token List changed to ${!useStrictList ? 'Jupiter Strict' : 'Ghost Protocol'}`, { setting: 'token_list', value: !useStrictList });
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6"
        >
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-ui-card ring-1 ring-ui-border rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden max-h-[80vh] overflow-y-auto custom-scrollbar"
            >
                {/* Header */}
                <div className="p-6 flex justify-between items-center border-b border-ui-border bg-ui-card-secondary/30 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent-primary/10 rounded-xl text-accent-primary">
                            <Zap size={18} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary">Swap Settings</h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-text-secondary hover:text-text-primary bg-ui-card-secondary rounded-full transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Slippage Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                                Slippage Tolerance <Info size={12} className="opacity-50" />
                            </label>
                            <span className="text-[10px] font-mono text-accent-primary font-bold">
                                {(slippageBps / 100).toFixed(2)}%
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {[0.1, 0.5, 1.0].map(p => {
                                const pBps = Math.round(p * 100);
                                const isActive = slippageBps === pBps;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => handleSlippagePreset(p)}
                                        className={`flex-1 py-3 text-[11px] font-black rounded-xl border transition-all ${
                                            isActive 
                                            ? 'bg-accent-primary text-accent-secondary border-accent-primary shadow-lg shadow-accent-primary/20' 
                                            : 'bg-ui-card-secondary border-ui-border text-text-secondary hover:border-accent-primary/50'
                                        }`}
                                    >
                                        {p}%
                                    </button>
                                );
                            })}
                            <div className="relative flex-[1.2]">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={slippageBps === 0 ? '' : (slippageBps / 100)}
                                    onChange={handleCustomSlippage}
                                    placeholder="Custom"
                                    className="w-full bg-ui-card-secondary text-center text-xs font-bold py-3 rounded-xl border border-ui-border focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20 transition-all text-text-primary placeholder:text-text-secondary/40"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary text-[10px] font-bold">%</span>
                            </div>
                        </div>
                    </div>

                    {/* Token List Section */}
                    {onListToggle && (
                        <div className="space-y-4">
                             <div className="p-4 bg-ui-card-secondary/50 border border-ui-border rounded-2xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${useStrictList ? 'bg-accent-primary/10 text-accent-primary' : 'bg-text-secondary/10 text-text-secondary'}`}>
                                            <ListFilter size={20} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-text-primary block leading-none mb-1">Jupiter Strict List</label>
                                            <p className="text-[10px] text-text-secondary font-medium">Use verified token list</p>
                                        </div>
                                    </div>
                                    <ToggleSwitch isOn={useStrictList} onToggle={handleListToggle} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MEV Protection Section */}
                    <div className="space-y-4">
                         <div className="p-4 bg-ui-card-secondary/50 border border-ui-border rounded-2xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isMevProtected ? 'bg-green-500/10 text-green-500' : 'bg-text-secondary/10 text-text-secondary'}`}>
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-text-primary block leading-none mb-1">MEV Shield</label>
                                        <p className="text-[10px] text-text-secondary font-medium">Anti-sandwich protection</p>
                                    </div>
                                </div>
                                <ToggleSwitch isOn={isMevProtected} onToggle={handleMevToggle} />
                            </div>
                            
                            <div className="pt-4 border-t border-ui-border/50">
                                <p className="text-[10px] leading-relaxed text-text-secondary">
                                    When enabled, your transaction is routed via private RPC nodes to prevent front-running.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-ui-card-secondary/30 border-t border-ui-border">
                    <button 
                        onClick={onClose}
                        className="w-full py-4 bg-text-primary text-ui-bg rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                        Save Preferences
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};