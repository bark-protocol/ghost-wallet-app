/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Zap, Loader2, ArrowDownLeft, Check, Landmark, CreditCard, ChevronRight } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { Button } from '../common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Token } from '../types';
import { ASSET_DATA } from '../constants';
import { AnimatedCreditCard } from '../components/AnimatedCreditCard';
import { onrampSDK } from '../lib/onramp';
import { OnrampQuote, OnrampProviderId } from '../lib/onramp/types';

type Mode = 'buy' | 'sell';

export const BuyScreen: React.FC = () => {
    const { setActiveView, activeTab, walletLogEvent } = useWallet();
    const [mode, setMode] = useState<Mode>('buy');
    const [amount, setAmount] = useState('100');
    const [selectedToken, setSelectedToken] = useState<Token>('SOL');
    const [selectedProvider, setSelectedProvider] = useState<OnrampProviderId>('moonpay');
    
    const [quote, setQuote] = useState<OnrampQuote | null>(null);
    const [isQuoting, setIsQuoting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Fetch quote when inputs change
    useEffect(() => {
        const fetchQuote = async () => {
            const val = parseFloat(amount);
            if (!val || val <= 0) {
                setQuote(null);
                return;
            }
            
            setIsQuoting(true);
            try {
                const q = await onrampSDK.getQuote(selectedProvider, val, selectedToken);
                setQuote(q);
            } catch (e) {
                console.error(e);
            } finally {
                setIsQuoting(false);
            }
        };

        const timer = setTimeout(fetchQuote, 500); 
        return () => clearTimeout(timer);
    }, [amount, selectedToken, selectedProvider]);

    const handleTransaction = async () => {
        if (!quote) return;
        
        setIsProcessing(true);
        const actionLabel = mode === 'sell' ? 'Offramp' : 'Onramp';
        walletLogEvent('PAYMENT_INIT', 'MOBILE', `${actionLabel} initiated: ${amount} USD via ${selectedProvider.toUpperCase()}`);
        
        try {
            const result = await onrampSDK.execute(quote, {
                userAddress: 'GhST7v1n6P2xP2A8aDRC4Ze93b822d5a32GhST7v1',
                userEmail: 'demo.user@ghostprotocol.io'
            });

            if (result.status === 'success') {
                setIsProcessing(false);
                setIsSuccess(true);
                
                const logMessage = mode === 'sell'
                    ? `Off-ramped ${amount} USD to Bank Account`
                    : `Purchased ${quote.cryptoAmount} ${selectedToken} via ${selectedProvider}`;
                    
                walletLogEvent(
                    mode === 'sell' ? 'WALLET_DEBIT' : 'WALLET_CREDIT', 
                    'MOBILE', 
                    logMessage,
                    { amount: parseFloat(amount), provider: selectedProvider, txId: result.txId }
                );
                
                setTimeout(() => setActiveView(activeTab), 3000);
            }
        } catch (e) {
            setIsProcessing(false);
            alert("Transaction failed: Connection to provider lost.");
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-center p-8 bg-ui-bg text-text-primary">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-green-500/20"
                >
                    <ShieldCheck size={48} className="text-green-500" />
                </motion.div>
                <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">{mode === 'sell' ? 'Withdrawal Pending' : 'Purchase Finalized'}</h2>
                <p className="text-sm text-text-secondary mb-8 leading-relaxed max-w-[240px] mx-auto font-medium">
                    {mode === 'sell'
                        ? 'Funds are being routed to your linked bank account. Arrival expected in 1-2 business days.' 
                        : `Your ${selectedToken} has been successfully credited to your secure vault.`}
                </p>
                <div className="p-4 bg-ui-card rounded-2xl text-[10px] font-mono text-text-secondary border border-ui-border">
                    SETTLEMENT ID: {Math.random().toString(36).substring(7).toUpperCase()}
                </div>
            </div>
        );
    }

    const availableTokens = Object.keys(ASSET_DATA).filter(t => t !== 'GHOST_OPS') as Token[];

    return (
        <div className="flex flex-col h-full bg-ui-bg text-text-primary">
            <header className="flex items-center p-4 shrink-0 border-b border-ui-border bg-ui-card/30 backdrop-blur-md">
                <button onClick={() => setActiveView(activeTab)} className="p-2 text-text-secondary hover:text-text-primary transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="flex-1 text-center font-bold text-sm uppercase tracking-widest">Banking Hub</h1>
                <div className="w-9" />
            </header>

            <main className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar pb-32">
                
                {/* Credit Card Visualization */}
                <div className="w-full max-w-sm mx-auto">
                    <AnimatedCreditCard 
                        provider={selectedProvider} 
                        last4="8821" 
                        expiry="12/28" 
                        holder="JANE DOE" 
                    />
                </div>

                {/* Buy/Sell Selector */}
                <div className="flex bg-ui-card ring-1 ring-ui-border rounded-2xl p-1 shadow-sm">
                    <button 
                        onClick={() => setMode('buy')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'buy' ? 'bg-accent-primary text-accent-secondary shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                        Deposit Fiat
                    </button>
                    <button 
                        onClick={() => setMode('sell')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'sell' ? 'bg-accent-primary text-accent-secondary shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                        Withdraw Fiat
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Amount Card */}
                    <div className="bg-ui-card ring-1 ring-ui-border rounded-3xl p-6 space-y-8 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent" />
                        
                        <div className="space-y-2 text-center">
                            <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.3em]">Transaction Amount (USD)</label>
                            <div className="flex items-center justify-center gap-1">
                                <span className="text-3xl font-bold text-text-secondary opacity-40">$</span>
                                <input 
                                    type="number"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="bg-transparent text-5xl font-black focus:outline-none w-44 text-center text-text-primary placeholder:text-text-secondary/10"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* Provider Selection */}
                            <div className="flex items-center justify-between p-3 bg-ui-card-secondary/50 rounded-2xl border border-ui-border/50">
                                <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard size={12} className="opacity-50" /> Relay Provider
                                </span>
                                <div className="flex gap-2 bg-ui-bg p-1 rounded-xl border border-ui-border">
                                    {(['moonpay', 'stripe'] as OnrampProviderId[]).map(p => (
                                        <button 
                                            key={p} 
                                            onClick={() => setSelectedProvider(p)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedProvider === p ? 'bg-accent-primary text-accent-secondary shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
                                        >
                                            {p === 'stripe' ? 'Link' : 'MoonPay'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Asset Selection */}
                            <div className="flex items-center justify-between p-3 bg-ui-card-secondary/50 rounded-2xl border border-ui-border/50">
                                <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                                    <Landmark size={12} className="opacity-50" /> Target Asset
                                </span>
                                <div className="flex gap-2 max-w-[160px] overflow-x-auto custom-scrollbar pb-1">
                                    {availableTokens.map(t => (
                                        <button 
                                            key={t}
                                            onClick={() => setSelectedToken(t)}
                                            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${selectedToken === t ? 'bg-ui-bg border-accent-primary scale-110 shadow-md' : 'border-transparent bg-ui-card opacity-40 hover:opacity-100'}`}
                                        >
                                            <div className="w-4 h-4">{ASSET_DATA[t]?.icon}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Summary Block */}
                        {quote && (
                            <div className="pt-6 border-t border-ui-border flex flex-col gap-3">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="font-bold text-text-secondary uppercase tracking-widest">Network Estimated</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-black text-accent-primary text-sm">
                                            {quote.cryptoAmount} {selectedToken}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-[9px]">
                                    <span className="font-medium text-text-secondary uppercase tracking-widest">Provider Fee</span>
                                    <span className="font-mono text-text-primary font-bold">${quote.fee.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Security Badge */}
                <div className="p-4 bg-green-500/5 rounded-2xl border border-green-500/10 flex items-center gap-4">
                     <div className="p-2 bg-green-500/10 rounded-xl text-green-500">
                         <ShieldCheck size={18} />
                     </div>
                     <div className="flex-1">
                         <p className="text-[10px] font-black uppercase text-green-500 mb-0.5">Sovereign Protection</p>
                         <p className="text-[9px] text-text-secondary uppercase leading-none font-medium">Bank-level encryption via secure enclave</p>
                     </div>
                </div>
            </main>

            <footer className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-ui-bg via-ui-bg to-transparent pb-10">
                <Button 
                    onClick={handleTransaction}
                    disabled={isProcessing || !quote || parseFloat(amount) <= 0}
                    className="py-5 flex items-center justify-center gap-3 shadow-2xl shadow-accent-primary/10 relative overflow-hidden"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 size={18} className="animate-spin" /> Finalizing Settlement...
                        </>
                    ) : (
                        <>
                            {mode === 'sell' ? <ArrowDownLeft size={18} /> : <Zap size={18} />}
                            <span className="relative z-10">{mode === 'sell' ? 'Withdraw to Linked Bank' : `Purchase ${selectedToken} Assets`}</span>
                        </>
                    )}
                </Button>
            </footer>
        </div>
    );
};