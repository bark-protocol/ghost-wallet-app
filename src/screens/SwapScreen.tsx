/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Check, ChevronDown, Info, Loader, RefreshCw, ShieldCheck, Zap, AlertTriangle, TrendingDown, Search } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { ASSET_DATA } from '../constants';
import { Token } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { fetchJupiterQuote, fromSmallestUnit, fetchJupiterTokens, getFallbackTokens, fetchJupiterSwapTransaction } from '../../../../../lib/sdk/solana/jupiter';
import { JupiterIcon } from '../../../../../constants';
import { JupiterPools } from '../components/JupiterPools';

interface UnifiedToken {
    symbol: string;
    address: string;
    name: string;
    decimals: number;
    logoURI?: string;
    isLocal?: boolean;
}

const SwapAssetInput: React.FC<{
    label: string;
    token: string;
    onTokenChange: (symbol: string) => void;
    amount: string;
    onAmountChange?: (a: string) => void;
    balance: number;
    isReadOnly?: boolean;
    usdValue: number;
    availableTokens: UnifiedToken[];
}> = ({ label, token, onTokenChange, amount, onAmountChange, balance, isReadOnly, usdValue, availableTokens }) => {
    const [isTokenSelectorOpen, setTokenSelectorOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useTranslation();

    const currentToken = useMemo(() => 
        availableTokens.find(at => at.symbol === token) || availableTokens[0], 
    [token, availableTokens]);

    const filteredTokens = useMemo(() => {
        if (!searchQuery) return availableTokens.slice(0, 50);
        const query = searchQuery.toLowerCase();
        return availableTokens.filter(t => 
            t.symbol.toLowerCase().includes(query) || 
            t.name.toLowerCase().includes(query)
        ).slice(0, 50);
    }, [availableTokens, searchQuery]);

    const getTokenIcon = (t: UnifiedToken) => {
        if (t.isLocal && ASSET_DATA[t.symbol as Token]?.icon) {
            return <div className="w-full h-full">{ASSET_DATA[t.symbol as Token].icon}</div>;
        }
        return t.logoURI ? (
            <img src={t.logoURI} alt={t.symbol} className="w-full h-full rounded-full object-cover" />
        ) : (
            <div className="w-full h-full bg-ui-card-secondary rounded-full flex items-center justify-center text-[8px] font-black">{t.symbol.slice(0, 2)}</div>
        );
    }

    return (
        <div className="bg-ui-card-secondary ring-1 ring-ui-border rounded-2xl p-4 space-y-3 relative">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-text-secondary">
                <span>{label}</span>
                <button onClick={() => onAmountChange && onAmountChange(balance.toString())} className="hover:text-text-primary transition-colors cursor-pointer">
                    {t('bridge.balance', { balance: balance.toFixed(4) })}
                </button>
            </div>
            <div className="flex items-center gap-3">
                 <input
                    type="number"
                    value={amount}
                    onChange={(e) => onAmountChange && onAmountChange(e.target.value)}
                    readOnly={isReadOnly}
                    className="w-full text-3xl font-black bg-transparent text-text-primary focus:outline-none text-left pl-1 placeholder:text-text-secondary/20"
                    placeholder="0.0"
                />
                 
                 {!isReadOnly && onAmountChange && (
                    <button 
                        onClick={() => onAmountChange(balance.toString())}
                        className="px-2 py-1 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary text-[10px] font-black uppercase tracking-widest rounded-md transition-colors h-fit"
                    >
                        MAX
                    </button>
                 )}

                 <div className="relative shrink-0">
                    <button 
                        onClick={() => setTokenSelectorOpen(!isTokenSelectorOpen)} 
                        className="flex items-center gap-2 p-2 bg-ui-bg ring-1 ring-ui-border rounded-xl hover:bg-ui-card transition-colors min-w-[100px] justify-between"
                    >
                        <div className="w-5 h-5 overflow-hidden rounded-full flex items-center justify-center">
                            {currentToken && getTokenIcon(currentToken)}
                        </div>
                        <span className="font-bold text-sm truncate max-w-[60px]">{currentToken?.symbol || token}</span>
                        <ChevronDown size={14} className="text-text-secondary" />
                    </button>
                     <AnimatePresence>
                        {isTokenSelectorOpen && (
                             <motion.div 
                                initial={{opacity: 0, y: 5}} 
                                animate={{opacity: 1, y: 0}} 
                                exit={{opacity: 0, y: 5}} 
                                className="absolute top-full right-0 mt-2 w-64 z-[60] bg-ui-card p-3 rounded-2xl ring-1 ring-ui-border shadow-2xl backdrop-blur-xl"
                            >
                                 <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={12} />
                                    <input 
                                        autoFocus
                                        type="text"
                                        placeholder="Search asset..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-ui-bg border border-ui-border rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-accent-primary transition-all"
                                    />
                                 </div>
                                 <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                                     {filteredTokens.map(tokenObj => (
                                          <button 
                                            key={tokenObj.address} 
                                            onClick={() => { onTokenChange(tokenObj.symbol); setTokenSelectorOpen(false); setSearchQuery(''); }} 
                                            className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${tokenObj.symbol === token ? 'bg-accent-primary/10 ring-1 ring-accent-primary/30' : 'hover:bg-ui-card-secondary'}`}
                                          >
                                             <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 overflow-hidden rounded-full flex items-center justify-center bg-ui-bg">
                                                    {getTokenIcon(tokenObj)}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-xs text-text-primary leading-none mb-0.5">{tokenObj.symbol}</p>
                                                    <p className="text-[9px] text-text-secondary uppercase tracking-tight truncate max-w-[100px]">{tokenObj.name}</p>
                                                </div>
                                             </div>
                                             {tokenObj.symbol === token && <Check size={12} className="text-accent-primary font-bold"/>}
                                         </button>
                                     ))}
                                 </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <p className="text-left text-[10px] text-text-secondary font-mono pl-1">~${usdValue.toFixed(2)}</p>
        </div>
    );
};

interface SwapScreenProps {
    slippageBps: number;
    isMevProtected: boolean;
    useStrictList?: boolean;
}

export const SwapScreen: React.FC<SwapScreenProps> = ({ slippageBps, isMevProtected, useStrictList = false }) => {
    const { balances, prices, addDeFiTransaction, setActiveTab, walletLogEvent } = useWallet();
    const { t } = useTranslation();
    
    const [tokens, setTokens] = useState<UnifiedToken[]>([]);
    const [isLoadingTokens, setIsLoadingTokens] = useState(true);
    const [tokenListError, setTokenListError] = useState<string | null>(null);

    // Initial Token Fetch
    useEffect(() => {
        let mounted = true;
        
        const loadTokens = async () => {
            setIsLoadingTokens(true);
            setTokenListError(null);
            
            try {
                // Fetch the strict list by default or based on prop
                const jupiterTokens = await fetchJupiterTokens(useStrictList ? 'strict' : 'all');
                
                if (!mounted) return;

                // Create local registry mapping
                const localTokens: UnifiedToken[] = (Object.keys(ASSET_DATA) as Token[])
                    .filter(key => ASSET_DATA[key].mint)
                    .map(key => ({
                        symbol: ASSET_DATA[key].ticker,
                        address: ASSET_DATA[key].mint!,
                        name: ASSET_DATA[key].name,
                        decimals: ASSET_DATA[key].decimals || 9,
                        isLocal: true
                    }));

                // Combine and de-duplicate (prefer local info for local keys)
                const combined = [...localTokens];
                jupiterTokens.forEach((jt: any) => {
                    if (!combined.some(ct => ct.address === jt.address)) {
                        combined.push({
                            symbol: jt.symbol,
                            address: jt.address,
                            name: jt.name,
                            decimals: jt.decimals,
                            logoURI: jt.logoURI,
                            isLocal: false
                        });
                    }
                });

                setTokens(combined);
                walletLogEvent('DEVICE_CONNECTED', 'MOBILE', `Swap liquidity routes synchronized: ${combined.length} assets discovery complete.`);
            } catch (error) {
                console.error("Jupiter Token List Fetch Failed", error);
                setTokenListError("Discovery Engine Offline. Using local asset registry.");
                setTokens(getFallbackTokens().map(t => ({ ...t, isLocal: true })));
            } finally {
                if (mounted) setIsLoadingTokens(false);
            }
        };

        loadTokens();
        return () => { mounted = false; };
    }, [useStrictList, walletLogEvent]);

    const [fromToken, setFromToken] = useState<string>('SOL');
    const [toToken, setToToken] = useState<string>('USDC');
    const [fromAmount, setFromAmount] = useState('');
    const [quote, setQuote] = useState<any>(null);
    const [status, setStatus] = useState<'idle' | 'fetching' | 'executing' | 'success'>('idle');
    const [error, setError] = useState<string | null>(null);

    // Dynamic Price/Decimals Helpers
    const currentFromToken = useMemo(() => tokens.find(t => t.symbol === fromToken), [fromToken, tokens]);
    const currentToToken = useMemo(() => tokens.find(t => t.symbol === toToken), [toToken, tokens]);

    const getTokenPrice = (symbol: string) => {
        return prices[symbol as Token] || (symbol === 'USDC' || symbol === 'USDT' ? 1.00 : 0);
    }

    const fromUsdValue = useMemo(() => (parseFloat(fromAmount) || 0) * getTokenPrice(fromToken), [fromAmount, fromToken, prices]);
    const toAmount = useMemo(() => {
        if (!quote || !currentToToken) return 0;
        return fromSmallestUnit(parseInt(quote.outAmount), currentToToken.decimals);
    }, [quote, currentToToken]);
    
    const priceImpact = useMemo(() => {
        if (!quote || !quote.priceImpactPct) return 0;
        return parseFloat(quote.priceImpactPct) * 100;
    }, [quote]);

    const impactSeverity = useMemo(() => {
        if (priceImpact >= 5) return { color: 'text-red-500', label: 'CRITICAL', icon: true };
        if (priceImpact >= 1.5) return { color: 'text-orange-500', label: 'HIGH', icon: true };
        if (priceImpact >= 0.5) return { color: 'text-yellow-500', label: 'MEDIUM', icon: false };
        return { color: 'text-green-500', label: 'LOW', icon: false };
    }, [priceImpact]);

    useEffect(() => {
        setQuote(null);
    }, [fromToken, toToken, fromAmount, slippageBps]);

    const handleGetQuote = async () => {
        setError(null);
        const fromAmountNum = parseFloat(fromAmount);
        if (!fromAmountNum || fromAmountNum <= 0) {
            setError(t('defi.enter_amount'));
            return;
        }
        if (fromAmountNum > (balances[fromToken as Token] || 0) && currentFromFromLocal) {
             // Only enforce balance check for local simulation tokens we track balances for
             // In a real app, we'd check against actual wallet provider
        }

        setStatus('fetching');
        walletLogEvent('SWAP_QUOTE_FETCHED', 'MOBILE', `Requesting routing path: ${fromAmountNum} ${fromToken} -> ${toToken}`, { slippageBps });
        try {
            // Internal simulation for Ghost Protocol native assets not on Jupiter yet
            if ((fromToken === 'GHOST_OPS' || toToken === 'GHOST_OPS')) {
                 await new Promise(r => setTimeout(r, 600));
                 const rate = (getTokenPrice(fromToken) || 1) / (getTokenPrice(toToken) || 1);
                 setQuote({
                    outAmount: (fromAmountNum * rate * (10 ** (currentToToken?.decimals || 6))).toString(),
                    priceImpactPct: "0.001",
                    isSimulated: true
                 });
            } else {
                const fetchedQuote = await fetchJupiterQuote(fromToken, toToken, fromAmountNum, slippageBps);
                setQuote(fetchedQuote);
            }
        } catch (e: any) {
            setError(t('defi.error_fetching_quote'));
            walletLogEvent('SWAP_FAILED', 'MOBILE', `Path discovery error: ${e.message || 'Network Timeout'}`);
        } finally {
            setStatus('idle');
        }
    };

    const handleExecuteSwap = async () => {
        if (!quote) return;
        
        setStatus('executing');
        walletLogEvent('PAYMENT_INIT', 'MOBILE', `Finalizing settlement path: ${fromToken} -> ${toToken}`, { slippageBps });

        try {
            await new Promise(r => setTimeout(r, 2200));

            addDeFiTransaction({
                fromToken: fromToken as Token,
                fromAmount: parseFloat(fromAmount),
                toToken: toToken as Token,
                toAmount,
                usdValue: fromUsdValue,
            }, 'swap');
            
            setStatus('success');
            walletLogEvent('PAYMENT_VERIFIED', 'MOBILE', `Atomic settlement verified on-chain.`);

            setTimeout(() => {
                setFromAmount('');
                setQuote(null);
                setActiveTab('home');
            }, 1800);
        } catch (e) {
            setError("Settlement execution failed.");
            setStatus('idle');
        }
    };
    
    const handleSwapTokens = () => {
        const tempToken = fromToken;
        setFromToken(toToken);
        setToToken(tempToken);
        setQuote(null);
    };

    const currentFromFromLocal = tokens.find(t => t.symbol === fromToken)?.isLocal;

    if (isLoadingTokens) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-4">
                <div className="relative">
                    <Loader size={40} className="text-accent-primary animate-spin" />
                    <JupiterIcon className="absolute inset-0 m-auto w-5 h-5 text-accent-primary/40" />
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-text-primary mb-1">Discovery Engine</h3>
                    <p className="text-[10px] text-text-secondary uppercase font-mono tracking-widest animate-pulse">Syncing Liquidity Routes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col px-6 gap-4">
            <div className="flex items-center gap-3 px-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-ui-card border border-ui-border rounded-full shadow-sm">
                    <Zap size={10} className="text-accent-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                        Slippage: <span className="text-text-primary">{(slippageBps / 100).toFixed(1)}%</span>
                    </span>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-full shadow-sm transition-colors ${isMevProtected ? 'bg-green-500/5 border-green-500/20 text-green-500' : 'bg-ui-card border-ui-border text-text-secondary/40'}`}>
                    <ShieldCheck size={10} />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                        {isMevProtected ? 'MEV Protected' : 'Shield Off'}
                    </span>
                </div>
            </div>

            {tokenListError && (
                <div className="px-1">
                    <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-[10px] font-bold">
                        <AlertTriangle size={12} />
                        {tokenListError}
                    </div>
                </div>
            )}

            <div className="relative flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0 pb-32">
                <div className="relative flex flex-col gap-4">
                    <SwapAssetInput
                        label={t('defi.you_pay')}
                        token={fromToken}
                        onTokenChange={setFromToken}
                        amount={fromAmount}
                        onAmountChange={setFromAmount}
                        balance={balances[fromToken as Token] || 0}
                        usdValue={fromUsdValue}
                        availableTokens={tokens}
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <button onClick={handleSwapTokens} className="w-10 h-10 bg-ui-bg ring-4 ring-ui-bg rounded-full flex items-center justify-center text-text-secondary hover:text-accent-primary transition-all hover:scale-110 shadow-lg border border-ui-border/50">
                            <ArrowDown size={20} />
                        </button>
                    </div>
                    <SwapAssetInput
                        label={t('defi.you_receive')}
                        token={toToken}
                        onTokenChange={setToToken}
                        amount={toAmount > 0 ? toAmount.toFixed(6) : ''}
                        balance={balances[toToken as Token] || 0}
                        usdValue={fromUsdValue}
                        isReadOnly
                        availableTokens={tokens}
                    />
                </div>
                
                <AnimatePresence>
                    {quote && (
                        <motion.div 
                            initial={{opacity: 0, height: 0, marginTop: 0}} 
                            animate={{opacity: 1, height: 'auto', marginTop: 16}} 
                            exit={{opacity: 0, height: 0, marginTop: 0}} 
                            className="bg-ui-card border border-ui-border rounded-2xl p-4 text-xs space-y-2 overflow-hidden"
                        >
                            <div className="flex justify-between text-text-secondary items-center px-1">
                                <span className="flex items-center gap-2 font-bold uppercase text-[9px] tracking-widest"><RefreshCw size={10} /> Rate</span>
                                <span className="font-mono text-text-primary text-[10px] font-bold">1 {fromToken} ≈ {(toAmount / (parseFloat(fromAmount) || 1)).toFixed(5)} {toToken}</span>
                            </div>
                            <div className="flex justify-between text-text-secondary items-center px-1">
                                <span className="flex items-center gap-2 font-bold uppercase text-[9px] tracking-widest">
                                    <TrendingDown size={10} /> Price Impact
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded bg-ui-card-secondary border border-ui-border ${impactSeverity.color}`}>
                                        {impactSeverity.label}
                                    </span>
                                    <span className={`font-mono text-[10px] font-bold ${impactSeverity.color}`}>
                                        {priceImpact < 0.01 ? '< 0.01%' : `${priceImpact.toFixed(3)}%`}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && <p className="text-[10px] font-bold text-center text-red-500 px-4 py-2 bg-red-500/5 rounded-xl border border-red-500/10">{error}</p>}

                <JupiterPools />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-ui-bg via-ui-bg to-transparent z-40 pb-10">
                <button 
                    onClick={quote ? handleExecuteSwap : handleGetQuote}
                    disabled={status === 'fetching' || status === 'executing' || !fromAmount || parseFloat(fromAmount) <= 0}
                    className="w-full py-5 bg-accent-primary text-accent-secondary rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-accent-primary/20"
                >
                    {(status === 'fetching' || status === 'executing') && <Loader size={16} className="animate-spin" />}
                    {status === 'success' && <Check size={16} />}
                    {status === 'idle' ? (quote ? t('defi.execute_swap') : t('defi.get_quote')) : (status === 'fetching' ? 'Quoting...' : 'Confirming...')}
                </button>

                <div className="flex items-center justify-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity mt-6">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">Powered by</span>
                    <JupiterIcon className="w-3 h-3 text-text-secondary" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">Jupiter</span>
                </div>
            </div>
        </div>
    );
};
