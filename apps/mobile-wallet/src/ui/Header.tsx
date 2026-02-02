/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { Bell, Scan, MessageSquare } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { GhostWalletLogo } from './Logo';

export const Header: React.FC = () => {
    const { activeTab, setActiveView, hasUnreadNotifications } = useWallet();
    const { t } = useTranslation();

    const titleMap: Record<string, string> = {
        defi: t('header.defi'),
        transactions: t('header.transactions'),
        settings: t('header.settings')
    };

    const descriptionMap: Record<string, string> = {
        defi: "Swap & Bridge Assets",
        transactions: "Recent Activity",
        settings: "App Preferences"
    };

    const title = titleMap[activeTab] || 'Wallet';
    const description = descriptionMap[activeTab] || 'Manage Assets';

    return (
        <header className="shrink-0 flex justify-between items-center px-6 pt-8 pb-4 bg-ui-bg/80 backdrop-blur-md z-50">
            {activeTab === 'home' ? (
                <GhostWalletLogo 
                    iconClassName="w-8 h-8"
                    textClassName="text-lg"
                    subtextClassName="text-[8px]"
                    textStacked={true}
                />
            ) : (
                <div className="flex flex-col justify-center">
                    <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight capitalize leading-none">
                        {title}
                    </h1>
                    <span className="text-[10px] md:text-xs text-text-secondary font-medium tracking-wide mt-1 opacity-80">
                        {description}
                    </span>
                </div>
            )}
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setActiveView('aiChat')}
                    className="p-2.5 bg-accent-primary/10 rounded-full border border-accent-primary/20 text-accent-primary hover:bg-accent-primary/20 transition-all active:scale-95 shadow-sm"
                    title="Ghost AI Assistant"
                >
                    <MessageSquare size={18} />
                </button>
                <button 
                    onClick={() => setActiveView('scan')}
                    className="p-2.5 bg-ui-card rounded-full border border-ui-border text-text-secondary hover:bg-ui-card-secondary transition-all active:scale-95 shadow-sm"
                >
                    <Scan size={18} />
                </button>
                <button 
                    onClick={() => setActiveView('notifications')}
                    className="relative p-2.5 bg-ui-card rounded-full border border-ui-border text-text-secondary hover:bg-ui-card-secondary transition-all active:scale-95 shadow-sm"
                >
                    <Bell size={18} />
                    {hasUnreadNotifications && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-ui-bg" />
                    )}
                </button>
            </div>
        </header>
    );
};