/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Key, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';

interface ImportWalletScreenProps {
    onImported?: () => void;
    onBack?: () => void;
    isModal?: boolean;
}

export const ImportWalletScreen: React.FC<ImportWalletScreenProps> = ({ onImported, onBack, isModal }) => {
    const { setActiveView, activeTab, walletLogEvent } = useWallet();
    const [privateKey, setPrivateKey] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const handleImport = async () => {
        if (!privateKey.trim()) return;
        setIsImporting(true);
        walletLogEvent('SETTINGS_CHANGE', 'MOBILE', 'Wallet import initiated');
        
        // Simulate import process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setIsImporting(false);
        walletLogEvent('SETTINGS_CHANGE', 'MOBILE', 'Wallet import simulation successful');
        
        if (onImported) {
            onImported();
        } else {
            alert('Simulation: Wallet imported successfully.');
            setActiveView(activeTab);
        }
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            setActiveView(activeTab);
        }
    };

    return (
        <div className="flex flex-col h-full bg-ui-bg text-text-primary p-6">
            <header className="flex items-center shrink-0 pt-4 pb-2 relative">
                <button onClick={handleBack} className="absolute left-0 p-2 text-text-secondary hover:text-text-primary bg-ui-card-secondary rounded-full transition-colors">
                    <ArrowLeft size={18} />
                </button>
                <h1 className="flex-1 text-center font-black text-[10px] uppercase tracking-[0.3em]">Import Wallet</h1>
            </header>

            <main className="flex-1 flex flex-col overflow-hidden py-6">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-accent-primary/10 border border-accent-primary/20 rounded-[24px] flex items-center justify-center mx-auto mb-4 text-accent-primary">
                        <Key size={32} />
                    </div>
                    <h2 className="font-black text-xl uppercase tracking-tighter">Enter Private Key</h2>
                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-mono">Or 12/24 Word Seed Phrase</p>
                </div>

                <div className="relative">
                    <textarea
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        className="w-full h-32 bg-ui-card border border-ui-border rounded-2xl p-4 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-accent-primary transition-all"
                        placeholder="Paste your private key or seed phrase here..."
                    />
                    <button 
                        onClick={() => setIsVisible(!isVisible)}
                        className="absolute top-3 right-3 p-2 text-text-secondary hover:text-text-primary"
                    >
                        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                 <div className="mt-4 p-3 bg-red-500/5 ring-1 ring-red-500/20 rounded-xl flex items-start gap-3">
                    <p className="text-[10px] text-red-400/80 leading-relaxed font-bold">
                        DANGER: This is a simulation. Do not paste real keys. Importing a key will overwrite your current wallet.
                    </p>
                 </div>
            </main>

            <footer className="flex-shrink-0 z-10 pt-4 pb-8">
                <motion.button 
                    onClick={handleImport}
                    disabled={!privateKey.trim() || isImporting}
                    className="w-full py-5 bg-accent-primary text-accent-secondary rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {isImporting ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Securing Vault...</span>
                        </>
                    ) : (
                        "Import & Secure"
                    )}
                </motion.button>
            </footer>
        </div>
    );
};