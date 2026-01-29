
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { TotalBalance } from '../components/TotalBalance';
import { AssetListItem } from '../components/AssetListItem';
import { ASSET_DATA } from '../constants';
import { Token } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { Layers, Loader2, CheckCircle2, ShieldAlert, X, ShieldCheck, Zap } from 'lucide-react';
import { ActionGrid } from '../components/ActionGrid';
import { useMintNFT } from '../hooks/useMintNFT';
import { motion, AnimatePresence } from 'framer-motion';

export const HomeScreen: React.FC = () => {
    const { balances, prices } = useWallet();
    const { t } = useTranslation();
    const { mintGenesis, isLoading, error, processSteps, activeStep, signature } = useMintNFT();
    const [showMintModal, setShowMintModal] = useState(false);

    const totalPortfolioValue = (Object.keys(balances) as Token[]).reduce((acc, token) => {
        return acc + ((balances[token] || 0) * (prices[token] || 0));
    }, 0);

    const handleStartMint = async () => {
        setShowMintModal(true);
        await mintGenesis();
    };

    return (
        <div className="flex flex-col h-full text-text-primary bg-ui-bg px-6 pb-2 relative">
            {/* Balance */}
            <div className="text-center pt-4 mb-2 shrink-0">
                <TotalBalance balances={balances} prices={prices} />
            </div>

            {/* Quick Actions */}
            <div className="shrink-0 mb-4">
                <ActionGrid />
            </div>

            {/* Asset List */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
                <div className="flex justify-between items-center mb-4 shrink-0 px-1">
                    <h3 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em]">{t('home.holdings')}</h3>
                    <button 
                        onClick={handleStartMint}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-ui-card-secondary ring-1 ring-ui-border rounded-full text-[9px] font-bold uppercase tracking-widest text-accent-primary hover:bg-accent-primary/10 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={12} className="animate-spin" /> Protocol Sync...
                            </>
                        ) : (
                            <>
                                <Layers size={12} /> Mint Genesis NFT
                            </>
                        )}
                    </button>
                </div>
                <div className="space-y-3 overflow-y-auto pr-1 custom-scrollbar pb-4 flex-1">
                    {(Object.keys(ASSET_DATA) as Token[]).filter(t => t !== 'GHOST_OPS').map(t => (
                        <AssetListItem 
                            key={t}
                            token={t}
                            balance={balances[t] || 0}
                            price={prices[t] || 0}
                            totalPortfolioValue={totalPortfolioValue}
                        />
                    ))}
                </div>
            </div>

            {/* Mint Progress Modal */}
            <AnimatePresence>
                {showMintModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md p-6 flex items-center justify-center"
                    >
                        <div className="w-full max-w-sm bg-ui-card border border-ui-border rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
                            <div className="p-6 border-b border-ui-border flex justify-between items-center bg-ui-card-secondary/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-accent-primary/10 rounded-xl text-accent-primary">
                                        <Layers size={18} />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-widest">Genesis Mint</h3>
                                </div>
                                <button onClick={() => !isLoading && setShowMintModal(false)} className={`p-2 transition-opacity ${isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-white/5 rounded-full'}`}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="p-8 space-y-4">
                                {processSteps.map((step, idx) => (
                                    <div key={step.id} className={`flex items-center gap-4 transition-opacity ${activeStep < idx ? 'opacity-30' : 'opacity-100'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                                            step.status === 'success' ? 'bg-green-500 border-green-500' :
                                            step.status === 'processing' ? 'border-accent-primary' :
                                            step.status === 'error' ? 'bg-red-500 border-red-500' :
                                            'border-ui-border'
                                        }`}>
                                            {step.status === 'success' && <CheckCircle2 size={14} className="text-white" />}
                                            {step.status === 'processing' && <Loader2 size={14} className="text-accent-primary animate-spin" />}
                                            {step.status === 'error' && <ShieldAlert size={14} className="text-white" />}
                                            {step.status === 'idle' && <div className="w-1.5 h-1.5 rounded-full bg-ui-border" />}
                                        </div>
                                        <span className={`text-[11px] font-bold uppercase tracking-widest ${step.status === 'processing' ? 'text-accent-primary' : 'text-text-primary'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {signature && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-8 pb-8">
                                    <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl space-y-2">
                                        <div className="flex items-center gap-2 text-green-500">
                                            <ShieldCheck size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Mint Finalized</span>
                                        </div>
                                        <p className="text-[9px] font-mono text-text-secondary truncate">{signature}</p>
                                        <button 
                                            onClick={() => setShowMintModal(false)}
                                            className="w-full mt-4 py-3 bg-accent-primary text-accent-secondary rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-accent-primary/20"
                                        >
                                            Return to Vault
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {error && (
                                <div className="px-8 pb-8">
                                    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center">{error}</p>
                                        <button onClick={() => setShowMintModal(false)} className="w-full mt-4 py-3 bg-ui-border text-text-primary rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">Close</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
