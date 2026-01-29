/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mail, User, Wallet, Edit3, Camera, ShieldCheck, Calendar, Star, Key, CheckCircle, XCircle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { Button } from '../common/Button';
import { useUser } from '../../../../../hooks/use-users';
import { Avatar } from '../components/Avatar';
import { Token } from '../types';
import { SIMULATED_CLIENT, shortenAddress } from '../../../../../lib/keys';

export const ProfileScreen: React.FC = () => {
    const { setActiveView, activeTab, balances, prices, walletLogEvent, isBalancesHidden, hasGenesisNft } = useWallet();
    const { user } = useUser('user_12345');

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName);
            setEmail(user.email);
            setAvatarPreview(user.avatarUrl || null);
        }
    }, [user]);

    const totalUsdBalance = (Object.keys(balances) as Token[]).reduce((acc, token) => {
        return acc + ((balances[token] || 0) * (prices[token] || 0));
    }, 0);

    const hasPortalAccess = (balances.SOL || 0) >= 3 || hasGenesisNft;

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
                walletLogEvent('SETTINGS_CHANGE', 'MOBILE', 'User updated profile avatar');
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSaveChanges = () => {
        walletLogEvent('SETTINGS_CHANGE', 'MOBILE', 'Profile changes saved', { action: 'save_profile', displayName, email });
        alert(`Simulated: Profile saved!\nName: ${displayName}\nEmail: ${email}`);
        setActiveView(activeTab);
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        alert(`${label} copied!`);
    };

    return (
        <div className="flex flex-col h-full bg-ui-bg text-text-primary">
            <header className="flex items-center p-4 shrink-0 border-b border-ui-border">
                <button onClick={() => setActiveView(activeTab)} className="p-2 text-text-secondary hover:text-text-primary">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="flex-1 text-center font-bold text-sm uppercase tracking-widest">My Identity</h1>
                <div className="w-9" />
            </header>

            <main className="flex-1 p-6 flex flex-col overflow-y-auto custom-scrollbar">
                <div className="flex flex-col items-center text-center mb-8 bg-ui-card border border-ui-border rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-transparent pointer-events-none" />
                    
                    <div className="relative mb-4">
                        <div className="p-1 bg-ui-bg rounded-full ring-1 ring-ui-border">
                            <Avatar src={avatarPreview} size="lg" />
                        </div>
                        <button 
                            onClick={handleAvatarClick}
                            className="absolute bottom-0 right-0 w-8 h-8 bg-accent-primary text-accent-secondary rounded-full flex items-center justify-center border-2 border-ui-bg hover:brightness-110 shadow-lg"
                        >
                            <Camera size={14} />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>
                    
                    <h2 className="text-xl font-black uppercase tracking-tighter mb-1">{SIMULATED_CLIENT.walletId}</h2>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-0.5 rounded-md border border-green-500/20">
                            <ShieldCheck size={10} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Protocol Verified</span>
                        </div>
                    </div>

                     <div className="w-full pt-4 mt-4 border-t border-ui-border">
                        <div className={`p-3 rounded-xl flex items-center justify-center gap-2 border ${hasPortalAccess ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-red-500/5 border-red-500/20 text-red-400'}`}>
                            {hasPortalAccess ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                    Ghost Portal Access
                                </span>
                                <span className="text-[8px] font-mono uppercase tracking-widest opacity-60">
                                    {hasPortalAccess ? 'Granted' : 'Hold ≥3 SOL or Genesis NFT'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-ui-card border border-ui-border rounded-2xl p-4 space-y-4 shadow-sm">
                         <div>
                            <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest px-1">Display Name</label>
                            <div className="relative mt-1">
                                 <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full bg-ui-bg border border-ui-border rounded-xl p-3 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary font-bold"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-text-secondary uppercase tracking-widest px-1">Secure Contact</label>
                            <div className="relative mt-1">
                                 <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-ui-bg border border-ui-border rounded-xl p-3 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                         <h3 className="px-2 text-[9px] font-black text-text-secondary uppercase tracking-[0.2em]">Cryptographic Keys</h3>
                         
                         <div 
                            onClick={() => copyToClipboard(SIMULATED_CLIENT.publicKey, "Public Key")}
                            className="bg-ui-card border border-ui-border rounded-2xl p-4 flex justify-between items-center group cursor-pointer hover:bg-ui-card-secondary transition-all"
                         >
                            <div className="flex items-center gap-3">
                                <Key size={16} className="text-accent-primary" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold uppercase tracking-widest">Public Key</span>
                                    <span className="text-[10px] font-mono text-text-secondary">{shortenAddress(SIMULATED_CLIENT.publicKey, 12)}</span>
                                </div>
                            </div>
                            <div className="px-2 py-1 bg-ui-bg rounded text-[8px] font-black uppercase tracking-widest text-text-secondary group-hover:text-accent-primary border border-ui-border">Copy</div>
                         </div>

                         <div className="bg-ui-card border border-ui-border rounded-2xl p-4 flex justify-between items-center opacity-40">
                            <div className="flex items-center gap-3">
                                <Lock size={16} className="text-text-secondary" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold uppercase tracking-widest">Master Seed</span>
                                    <span className="text-[10px] font-mono text-text-secondary">•••• •••• •••• ••••</span>
                                </div>
                            </div>
                            <div className="p-2 bg-ui-bg rounded-xl text-text-secondary">
                                <ShieldCheck size={14} />
                            </div>
                         </div>
                    </div>
                </div>

                <div className="mt-auto pt-8">
                    <Button variant="primary" onClick={handleSaveChanges} className="py-5 shadow-xl shadow-accent-primary/20">
                        Synchronize Changes
                    </Button>
                </div>
            </main>
        </div>
    );
};