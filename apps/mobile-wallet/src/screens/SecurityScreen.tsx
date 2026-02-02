/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ArrowLeft, Fingerprint, KeyRound, Lock, Shield, Bot, BadgePercent } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { ListItem } from '../common/ListItem';

export const SecurityScreen: React.FC = () => {
    const { 
        setActiveView, 
        activeTab, 
        isAppLockEnabled,
        toggleAppLock,
        isBiometricEnabled, 
        toggleBiometric, 
        isPinForPaymentEnabled, 
        togglePinForPayment,
        walletLogEvent
    } = useWallet();

    const handleChangePin = () => {
        walletLogEvent('SETTINGS_CHANGE', 'MOBILE', 'Attempted to change PIN');
        alert('Simulated: Navigating to PIN change screen.');
    };

    return (
        <div className="flex flex-col h-full bg-ui-bg text-text-primary">
            <header className="flex items-center p-4 shrink-0 ring-1 ring-ui-border">
                <button onClick={() => setActiveView(activeTab)} className="p-2 text-text-secondary hover:text-text-primary">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="flex-1 text-center font-bold text-sm uppercase tracking-widest">Security & Privacy</h1>
                <div className="w-9" /> {/* Spacer */}
            </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                <div>
                    <h3 className="px-4 text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-2">Authentication</h3>
                    <div className="bg-ui-card ring-1 ring-ui-border rounded-2xl">
                        <ListItem 
                            icon={Lock} 
                            label="App Lock"
                            accessory="toggle"
                            toggleState={isAppLockEnabled}
                            onToggleChange={toggleAppLock}
                        />
                        <ListItem 
                            icon={KeyRound} 
                            label="Change PIN" 
                            onClick={handleChangePin}
                        />
                        <ListItem 
                            icon={Fingerprint} 
                            label="Biometric Unlock" 
                            accessory="toggle"
                            toggleState={isBiometricEnabled}
                            onToggleChange={toggleBiometric}
                        />
                         <ListItem 
                            icon={BadgePercent} 
                            label="Require PIN for Payments"
                            accessory="toggle"
                            toggleState={isPinForPaymentEnabled}
                            onToggleChange={togglePinForPayment}
                            isLast
                        />
                    </div>
                    <p className="text-[10px] text-text-secondary px-4 mt-2">
                        Enable 'App Lock' to require your PIN every time you open the wallet.
                    </p>
                </div>

                <div>
                    <h3 className="px-4 text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-2">Advanced Security</h3>
                    <div className="bg-ui-card ring-1 ring-ui-border rounded-2xl">
                        <ListItem icon={Shield} label="Two-Factor Authentication" onClick={() => walletLogEvent('SETTINGS_CHANGE', 'MOBILE', 'Navigated to 2FA settings')} />
                        <ListItem icon={Lock} label="Hardware Wallets" onClick={() => walletLogEvent('SETTINGS_CHANGE', 'MOBILE', 'Navigated to Hardware Wallets settings')} isLast/>
                    </div>
                     <p className="text-[10px] text-text-secondary px-4 mt-2">
                        For institutional-grade security, consider integrating a hardware wallet.
                    </p>
                </div>
                
                <div>
                    <h3 className="px-4 text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] mb-2">Backup</h3>
                    <div className="bg-ui-card ring-1 ring-ui-border rounded-2xl">
                        <ListItem icon={Bot} label="Encrypted Cloud Backup" onClick={() => walletLogEvent('SETTINGS_CHANGE', 'MOBILE', 'Navigated to Encrypted Cloud Backup settings')} isLast/>
                    </div>
                </div>

            </main>
        </div>
    );
};