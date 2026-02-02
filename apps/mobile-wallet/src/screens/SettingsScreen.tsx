/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { User, Shield, Bell, LogOut, Link, Palette, Code, Globe, FileText, Check, Database, Trash2, AlertTriangle, UserX, Landmark } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { ListItem } from '../common/ListItem';
import { ThemeSelector } from '../components/ThemeSelector';
import { useTranslation } from '../hooks/useTranslation';
import { locales, Locale } from '../context/LanguageContext';
import { Avatar } from '../components/Avatar';

const LanguageSelector: React.FC = () => {
    const { t, locale, setLocale } = useTranslation();

    return (
        <div className="bg-ui-card border border-ui-border rounded-2xl">
            {Object.entries(locales).map(([code, name], index, arr) => (
                 <button 
                    key={code} 
                    onClick={() => setLocale(code)} 
                    className={`w-full flex items-center justify-between p-4 text-left text-text-primary hover:bg-ui-card-secondary/50 transition-colors ${index < arr.length - 1 ? 'border-b border-ui-border' : ''}`}
                >
                    <span className="font-bold text-sm">{name}</span>
                    {locale === code && <Check size={16} className="text-accent-primary" />}
                </button>
            ))}
        </div>
    );
}


export const SettingsScreen: React.FC = () => {
    const { setActiveView, walletLogEvent } = useWallet();
    const { t } = useTranslation();

    const handleClearCache = () => {
        if(confirm("Are you sure you want to clear local storage? This will reset your session.")) {
            walletLogEvent('SETTINGS_CHANGE', 'MOBILE', 'User cleared local cache');
            window.location.reload();
        }
    };

    const handleRemoveAccount = () => {
        if(confirm("DANGER: This will permanently delete your wallet keys, settings, and transaction history. This action cannot be undone. Are you sure?")) {
            walletLogEvent('SETTINGS_CHANGE', 'MOBILE', 'User deleted account - Hard Reset');
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="h-full flex flex-col p-6 bg-ui-bg text-text-primary overflow-y-auto custom-scrollbar pb-32">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="relative mb-3">
                    <Avatar size="lg" className="border-4 border-ui-bg shadow-lg" />
                    <div className="absolute -bottom-1 -right-1 bg-ghost-gold text-ghost-brown text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border-2 border-ui-bg">
                        PRO
                    </div>
                </div>
                <h2 className="text-xl font-bold">{t('settings.display_name')}</h2>
                <p className="text-xs text-text-secondary font-mono bg-ui-card px-2 py-1 rounded-md mt-1 border border-ui-border">{t('settings.address')}</p>
            </div>
            
            <div className="space-y-4">
                {/* --- Appearance Section --- */}
                <h3 className="px-4 text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2"><Palette size={10}/> {t('settings.appearance')}</h3>
                <ThemeSelector />

                {/* --- Language Section --- */}
                <h3 className="px-4 pt-4 text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2"><Globe size={10}/> {t('settings.language')}</h3>
                <LanguageSelector />

                {/* --- General Section --- */}
                <h3 className="px-4 pt-4 text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">{t('settings.general')}</h3>
                <div className="bg-ui-card border border-ui-border rounded-2xl">
                    <ListItem icon={User} label={t('settings.profile')} onClick={() => setActiveView('profile')} />
                    <ListItem icon={Shield} label={t('settings.security')} onClick={() => setActiveView('security')} />
                    <ListItem icon={Bell} label={t('settings.notifications')} onClick={() => setActiveView('notifications')} isLast />
                </div>

                {/* --- Connections Section --- */}
                <h3 className="px-4 pt-4 text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">{t('settings.connections')}</h3>
                 <div className="bg-ui-card border border-ui-border rounded-2xl">
                    <ListItem icon={Link} label={t('settings.walletConnect')} onClick={() => setActiveView('walletConnect')} />
                    <ListItem icon={User} label="Import Wallet" onClick={() => setActiveView('importWallet')} isLast />
                </div>

                {/* --- Protocol Section --- */}
                <h3 className="px-4 pt-4 text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Protocol</h3>
                <div className="bg-ui-card border border-ui-border rounded-2xl">
                    <ListItem icon={Landmark} label="Governance & Staking" onClick={() => alert('Coming soon!')} isLast />
                </div>
                
                {/* --- Data & Storage Section --- */}
                <h3 className="px-4 pt-4 text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2"><Database size={10}/> Data & Storage</h3>
                <div className="bg-ui-card border border-ui-border rounded-2xl">
                    <ListItem icon={Trash2} label="Clear Local Cache" onClick={handleClearCache} isLast />
                </div>

                {/* --- Developer Section --- */}
                <h3 className="px-4 pt-4 text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">{t('settings.developer')}</h3>
                <div className="bg-ui-card border border-ui-border rounded-2xl">
                    <ListItem icon={Code} label={t('settings.developer_settings')} onClick={() => setActiveView('developer')} isLast />
                </div>

                {/* --- About Section --- */}
                <h3 className="px-4 pt-4 text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">About</h3>
                <div className="bg-ui-card border border-ui-border rounded-2xl">
                    <ListItem icon={FileText} label="Documentation & Legal" onClick={() => setActiveView('legal')} isLast />
                </div>
            </div>

            <div className="mt-8 pt-4 space-y-3 pb-8">
                 <button 
                    onClick={() => window.location.reload()}
                    className="w-full flex items-center justify-between p-4 bg-ui-card hover:bg-ui-card-secondary border border-ui-border rounded-2xl text-text-primary transition-colors group"
                 >
                    <div className="flex items-center gap-4">
                        <LogOut size={18} className="text-text-secondary" />
                        <span className="font-bold text-sm">{t('settings.logout')}</span>
                    </div>
                 </button>

                 <button 
                    onClick={handleRemoveAccount}
                    className="w-full flex items-center justify-between p-4 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 transition-colors group"
                 >
                    <div className="flex items-center gap-4">
                        <UserX size={18} />
                        <span className="font-bold text-sm">Delete Account</span>
                    </div>
                    <AlertTriangle size={16} className="text-red-500/50" />
                 </button>

                 <p className="text-[10px] text-text-secondary font-mono text-center pt-4 opacity-50">Ghost Wallet v1.0.0 (Build 240)</p>
            </div>
        </div>
    );
};