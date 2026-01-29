
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ArrowRightLeft, Clock, Settings, Camera, X } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { WalletTab } from '../types';
import { useTranslation } from '../hooks/useTranslation';

const NavButton: React.FC<{ item: { id: WalletTab, icon: React.ElementType, label: string }, isActive: boolean, onClick: () => void }> = ({ item, isActive, onClick }) => {
    const { icon: Icon } = item;
    return (
        <button
            onClick={onClick}
            className="relative flex flex-col items-center justify-center gap-1 w-full h-full text-text-secondary hover:text-text-primary transition-colors text-center"
            aria-label={item.label}
        >
            <div className="relative p-1">
                <Icon size={18} className={`relative z-10 transition-all duration-300 ${isActive ? 'text-accent-primary scale-110' : 'opacity-70'}`} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                    <motion.div
                        layoutId="nav-glow"
                        className="absolute inset-0 bg-accent-primary/20 blur-md rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    />
                )}
            </div>
            <span className={`text-[9px] font-bold transition-all duration-300 ${isActive ? 'text-text-primary translate-y-0 opacity-100' : 'text-text-secondary/70 translate-y-0.5 opacity-80'}`}>
                {item.label}
            </span>
        </button>
    );
}

export const BottomNavBar: React.FC = () => {
    const { activeTab, setActiveTab, setActiveView, activeView } = useWallet();
    const { t } = useTranslation();

    const NAV_ITEMS_LEFT: { id: WalletTab, icon: React.ElementType, label: string }[] = [
        { id: 'home', icon: Home, label: t('nav.home') },
        { id: 'defi', icon: ArrowRightLeft, label: t('nav.defi') },
    ];
    const NAV_ITEMS_RIGHT: { id: WalletTab, icon: React.ElementType, label: string }[] = [
        { id: 'transactions', icon: Clock, label: t('nav.history') },
        { id: 'settings', icon: Settings, label: t('nav.settings') },
    ];
    
    const isScanOpen = activeView === 'scan';

    const handleCenterClick = () => {
        if (isScanOpen) {
            setActiveView(activeTab);
        } else {
            setActiveView('scan');
        }
    };

    return (
        <nav className="w-full px-6 pb-6 pt-0 pointer-events-none flex justify-center">
            <div className="bg-ui-card/70 dark:bg-black/70 backdrop-blur-xl border border-ui-border/50 rounded-full px-2 h-[68px] grid grid-cols-5 items-center shadow-[0_8px_32px_rgba(0,0,0,0.2)] pointer-events-auto w-full max-w-sm ring-1 ring-white/5 relative overflow-hidden">
                
                {/* Subtle sheen effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                {NAV_ITEMS_LEFT.map((item) => (
                    <NavButton key={item.id} item={item} isActive={activeTab === item.id} onClick={() => setActiveTab(item.id)} />
                ))}
                
                <div className="flex justify-center items-center relative -top-5">
                    <button 
                        onClick={handleCenterClick}
                        className="w-12 h-12 bg-accent-primary text-accent-secondary rounded-full flex items-center justify-center shadow-lg shadow-accent-primary/30 hover:brightness-110 hover:scale-105 transition-all active:scale-95 border-[4px] border-ui-bg relative z-10 group"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {isScanOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <X size={20} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="scan"
                                    initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                    exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Camera size={20} className="group-hover:scale-110 transition-transform" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                    {/* Cutout illusion / shadow for the floating button */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-black/20 blur-xl rounded-full -z-10" />
                </div>

                {NAV_ITEMS_RIGHT.map((item) => (
                    <NavButton key={item.id} item={item} isActive={activeTab === item.id} onClick={() => setActiveTab(item.id)} />
                ))}
            </div>
        </nav>
    );
};
