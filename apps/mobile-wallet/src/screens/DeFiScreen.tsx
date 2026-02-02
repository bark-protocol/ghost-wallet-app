/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwapScreen } from './SwapScreen';
import { BridgeScreen } from './BridgeScreen';
import { useTranslation } from '../hooks/useTranslation';
import { Settings, Info } from 'lucide-react';
import { SwapSettingsModal } from '../components/SwapSettingsModal';
import { useWallet } from '../hooks/useWallet';

type DeFiTab = 'swap' | 'bridge';

export const DeFiScreen: React.FC = () => {
    const { walletLogEvent } = useWallet();
    const [activeTab, setActiveTab] = useState<DeFiTab>('swap');
    const { t } = useTranslation();

    // Advanced Swap Settings
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [slippageBps, setSlippageBps] = useState(50); // Default 0.5%
    const [isMevProtected, setIsMevProtected] = useState(true);
    const [useStrictList, setUseStrictList] = useState(false);

    const handleTabChange = (tabId: DeFiTab) => {
        if (activeTab !== tabId) {
            setActiveTab(tabId);
            walletLogEvent('SETTINGS_CHANGE', 'MOBILE', `DeFi Tab switched to ${tabId.toUpperCase()}`, { previous: activeTab, current: tabId });
        }
    };

    const handleOpenSettings = () => {
        setIsSettingsOpen(true);
        walletLogEvent('SETTINGS_CHANGE', 'MOBILE', 'Opened DeFi Settings Modal');
    };

    const TabButton: React.FC<{ tabId: DeFiTab, label: string, badge?: string }> = ({ tabId, label, badge }) => (
        <button
            onClick={() => handleTabChange(tabId)}
            className="relative flex-1 py-3 text-sm font-bold transition-colors h-full flex items-center justify-center"
        >
            <div className="relative z-10 flex items-center justify-center gap-2">
                <span className={`${activeTab === tabId ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>{label}</span>
                {badge && (
                    <span className="text-[7px] font-black bg-accent-primary/20 text-accent-primary px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                        {badge}
                    </span>
                )}
            </div>
            {activeTab === tabId && (
                <motion.div
                    layoutId="defi-tab-indicator"
                    className="absolute inset-0 bg-ui-card-secondary rounded-lg"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
            )}
        </button>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="shrink-0 px-6 pt-2 pb-4 flex flex-col gap-4">
                <div className="flex items-center gap-2 h-[52px]">
                    <div className="flex-1 bg-ui-card p-1 rounded-xl border border-ui-border grid grid-cols-2 gap-1 h-full">
                        <TabButton tabId="swap" label={t('defi.swap')} badge="JUPITER" />
                        <TabButton tabId="bridge" label={t('defi.bridge')} badge="LI.FI" />
                    </div>
                    <button 
                        onClick={handleOpenSettings}
                        className="h-full aspect-square bg-ui-card rounded-xl border border-ui-border text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center"
                    >
                        <Settings size={20} />
                    </button>
                </div>
                
                {activeTab === 'bridge' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/5 ring-1 ring-blue-500/20 rounded-xl">
                        <Info size={14} className="text-blue-400" />
                        <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-widest leading-none">
                            LI.FI Cross-Chain Protocol Simulation
                        </p>
                    </div>
                )}
                {activeTab === 'swap' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-500/5 ring-1 ring-green-500/20 rounded-xl">
                        <Info size={14} className="text-green-400" />
                        <p className="text-[10px] text-green-400/80 font-bold uppercase tracking-widest leading-none">
                            Jupiter Aggregator Simulation
                        </p>
                    </div>
                )}
            </div>
            
            <div className="flex-1 overflow-hidden min-h-0">
                {activeTab === 'swap' ? <SwapScreen slippageBps={slippageBps} isMevProtected={isMevProtected} useStrictList={useStrictList} /> : <BridgeScreen />}
            </div>

            <AnimatePresence>
                {isSettingsOpen && (
                    <SwapSettingsModal
                        slippageBps={slippageBps}
                        isMevProtected={isMevProtected}
                        useStrictList={useStrictList}
                        onSlippageChange={setSlippageBps}
                        onMevToggle={() => setIsMevProtected(p => !p)}
                        onListToggle={() => setUseStrictList(p => !p)}
                        onClose={() => setIsSettingsOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};