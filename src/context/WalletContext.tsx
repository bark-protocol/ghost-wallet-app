/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { createContext, useState, useEffect, useCallback } from 'react';
import CryptoJS from 'crypto-js';
import { Token, Transaction, WalletView, ApiResponse, CartItem, WalletTab, Notification } from '../types';
import { getTokenPrices } from '../../../../../lib/pricefeeds';
import { ShieldCheck, ArrowDown, ArrowUp } from 'lucide-react';
import { SystemEventType, LogSource } from '../../../../../types/systemLog';
import { trpc } from '../../../../../lib/trpc';

interface WalletContextType {
    activeView: WalletView;
    setActiveView: (view: WalletView) => void;
    activeTab: WalletTab;
    setActiveTab: (tab: WalletTab) => void;
    balances: Record<Token, number>;
    prices: Record<Token, number>;
    transactions: Transaction[];
    addTransaction: (tx: Transaction) => void;
    addDeFiTransaction: (details: { fromToken: Token; fromAmount: number; toToken: Token; toAmount: number; usdValue: number; feeOps?: number }, type: 'swap' | 'bridge') => void;
    paymentRequest: { total: number; cart: any[]; preferredMethod?: Token } | null;
    setPaymentRequest: (req: { total: number; cart: any[]; preferredMethod?: Token } | null) => void;
    isOnboarded: boolean;
    completeOnboarding: () => void;
    onTxComplete?: (response: ApiResponse, transaction: Transaction) => void;
    notifications: Notification[];
    hasUnreadNotifications: boolean;
    markNotificationsAsRead: () => void;
    // Security
    isLocked: boolean;
    unlock: () => void;
    setPin: (pin: string) => void;
    checkPin: (pin: string) => boolean;
    hasPin: boolean;
    isAppLockEnabled: boolean;
    toggleAppLock: () => void;
    isBiometricEnabled: boolean;
    toggleBiometric: () => void;
    isPinForPaymentEnabled: boolean;
    togglePinForPayment: () => void;
    walletLogEvent: (type: SystemEventType, source: LogSource, message: string, metadata?: any) => void;
    // UI Visibility
    isNavVisible: boolean;
    setIsNavVisible: (visible: boolean) => void;
    isBalancesHidden: boolean;
    toggleBalancesHidden: () => void;
    // NFT State
    hasGenesisNft: boolean;
    setHasGenesisNft: (has: boolean) => void;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export interface WalletProviderProps {
    children: React.ReactNode;
    paymentRequestIn?: { total: number; cart: CartItem[]; preferredMethod?: Token } | null;
    onTxComplete?: (response: ApiResponse, transaction: Transaction) => void;
    logEvent: (type: SystemEventType, source: LogSource, message: string, metadata?: any) => void;
}

const ENCRYPTION_KEY = 'ghost_wallet_secret_key';

const generateDummyTransactions = (): Transaction[] => {
    const tokens: Token[] = ['USDC', 'SOL', 'GHOST', 'SUI', 'JUP', 'BONK'];
    const dummySalesItems = [
        { id: '1', name: 'Espresso', price: 1, image: '☕', quantity: 1 },
        { id: '3', name: 'Latte', price: 2, image: '🥛', quantity: 1 },
    ];
    const transactions: Transaction[] = [];
    for (let i = 0; i < 30; i++) {
        const token = tokens[i % tokens.length];
        const amount = Math.random() * (token === 'USDC' ? 50 : 5) + 1;
        const typeIndex = i % 4;
        const type = typeIndex === 0 ? 'sale' : (typeIndex === 1 ? 'swap' : (typeIndex === 2 ? 'bridge' : 'transfer'));
        const baseTx: Transaction = {
            id: `tx_${Date.now() - i * 3600000}_${i}`,
            timestamp: Date.now() - i * 3600000,
            amount: amount,
            token: token,
            status: 'success',
            riskScore: Math.floor(Math.random() * 10),
            type: type as any,
            isPrivate: i % 5 === 0,
        };
        if (type === 'sale') {
            transactions.push({ ...baseTx, merchant: 'Ghost Coffee', items: dummySalesItems.map(item => ({...item, quantity: Math.floor(Math.random() * 3) + 1})) });
        } else if (type === 'swap' || type === 'bridge') {
            const fromToken = tokens[(i + 1) % tokens.length];
            const fromAmount = amount * (Math.random() * 0.8 + 0.9);
            transactions.push({ 
                ...baseTx, 
                swapDetails: { fromToken: fromToken, fromAmount: parseFloat(fromAmount.toFixed(4)), toToken: token, toAmount: parseFloat((amount / (Math.random() * 0.5 + 0.8)).toFixed(4)) }, 
                merchant: type === 'swap' ? 'Ghost DEX' : 'Ghost Bridge'
            });
        } else {
            const dummyRecipient = `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 8)}`;
            transactions.push({ ...baseTx, merchant: dummyRecipient, memo: `Transfer to ${dummyRecipient.slice(0, 6)}... for services` });
        }
    }
    return transactions.sort((a, b) => b.timestamp - a.timestamp);
};

const generateDummyNotifications = (): Notification[] => [
    { id: '1', icon: ShieldCheck, title: 'Security Alert', body: 'A new device has been authorized on your account.', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
    { id: '2', icon: ArrowDown, title: 'Asset Received', body: 'You received 1.5 SOL from wallet 0x...aBcd.', timestamp: new Date(Date.now() - 86400000).toISOString(), read: false },
    { id: '3', icon: ArrowUp, title: 'Payment Sent', body: 'Your payment of $12.50 to Ghost Coffee was successful.', timestamp: new Date(Date.now() - 172800000).toISOString(), read: true },
];

export const WalletProvider: React.FC<WalletProviderProps> = ({ children, paymentRequestIn, onTxComplete, logEvent }) => {
    const [activeTab, setActiveTab] = useState<WalletTab>('home');
    const [activeView, setActiveView] = useState<WalletView>(activeTab);
    const [isNavVisible, setIsNavVisible] = useState(true);
    const [isBalancesHidden, setIsBalancesHidden] = useState(false);
    const [hasGenesisNft, setHasGenesisNft] = useState(false);

    const [balances, setBalances] = useState<Record<Token, number>>({ 
        'SOL': 0, 'USDC': 0, 'SUI': 0, 'GHOST': 0, 'GHST': 0, 'GHOST_OPS': 0,
        'JUP': 0, 'BONK': 0, 'RAY': 0
    });
    const [prices, setPrices] = useState<Record<Token, number>>({} as any);
    const [transactions, setTransactions] = useState<Transaction[]>(generateDummyTransactions());
    const [paymentRequest, setPaymentRequest] = useState<{ total: number; cart: any[]; preferredMethod?: Token } | null>(null);
    const [isOnboarded, setIsOnboarded] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(generateDummyNotifications());
    const hasUnreadNotifications = notifications.some(n => !n.read);

    const [pin, setPinState] = useState<string | null>(null);
    const [hasPin, setHasPin] = useState(false);
    const [isLocked, setIsLocked] = useState(true);
    const [isAppLockEnabled, setIsAppLockEnabled] = useState(false);
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
    const [isPinForPaymentEnabled, setIsPinForPaymentEnabled] = useState(false);

    // Fetch initial balances from tRPC backend
    const { data: remoteBalances } = trpc.wallet.balance.useQuery(undefined, {
        refetchInterval: 15000, // Refetch every 15 seconds
    });

    useEffect(() => {
        if (remoteBalances) {
            setBalances(remoteBalances as Record<Token, number>);
        }
    }, [remoteBalances]);
    
    const walletLogEvent = useCallback((type: SystemEventType, source: LogSource, message: string, metadata?: any) => {
        logEvent(type, source, message, metadata);
    }, [logEvent]);

    useEffect(() => {
        const storedPin = localStorage.getItem(ENCRYPTION_KEY);
        const onboarded = localStorage.getItem('ghost_wallet_onboarded') === 'true';
        const appLockEnabled = localStorage.getItem('ghost_wallet_app_lock') === 'true';
        const pinForPayment = localStorage.getItem('ghost_wallet_pin_for_payment') === 'true';
        const hideBalances = localStorage.getItem('ghost_wallet_hide_balances') === 'true';
        const hasNft = localStorage.getItem('ghost_wallet_has_nft') === 'true';

        setIsAppLockEnabled(appLockEnabled);
        setIsPinForPaymentEnabled(pinForPayment);
        setIsBalancesHidden(hideBalances);
        setHasGenesisNft(hasNft);

        if (storedPin) setHasPin(true);
        if (onboarded) {
            setIsOnboarded(true);
            setIsLocked(!!storedPin && appLockEnabled);
        }

        const fetchPrices = async () => {
            const allTokens = Object.keys(balances) as Token[];
            const fetchedPrices = await getTokenPrices(allTokens);
            setPrices(fetchedPrices);
        };
        fetchPrices();
        const interval = setInterval(fetchPrices, 15000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setPaymentRequest(paymentRequestIn || null);
        if (paymentRequestIn) setActiveView('pay');
    }, [paymentRequestIn]);
    
    useEffect(() => {
        if (!paymentRequest) setActiveView(activeTab);
    }, [paymentRequest, activeTab]);

    const completeOnboarding = () => {
        localStorage.setItem('ghost_wallet_onboarded', 'true');
        setIsOnboarded(true);
        setIsLocked(false);
    };
    
    const addTransaction = (tx: Transaction) => setTransactions(prev => [tx, ...prev]);
    
    const addDeFiTransaction = (details: { fromToken: Token; fromAmount: number; toToken: Token; toAmount: number; usdValue: number; feeOps?: number; }, type: 'swap' | 'bridge') => {
        const newTx: Transaction = {
            id: `${type}_${Date.now()}`,
            timestamp: Date.now(),
            amount: details.usdValue,
            token: details.toToken,
            status: 'success',
            riskScore: Math.floor(Math.random() * 5),
            type: type,
            swapDetails: details,
            merchant: type === 'swap' ? 'Ghost DEX' : 'Ghost Bridge'
        };
        addTransaction(newTx);
        setBalances(prev => {
            const newBalances = { ...prev };
            newBalances[details.fromToken] = (newBalances[details.fromToken] || 0) - details.fromAmount;
            newBalances[details.toToken] = (newBalances[details.toToken] || 0) + details.toAmount;
            if (details.feeOps) newBalances['GHOST_OPS'] = (newBalances['GHOST_OPS'] || 0) - details.feeOps;
            return newBalances;
        });
        
        const eventType = type === 'bridge' ? 'BRIDGE_EXECUTED' : 'SWAP_EXECUTED';
        const actionLabel = type === 'bridge' ? 'Bridge' : 'Swap';
        walletLogEvent(eventType, 'MOBILE', `${actionLabel} executed: ${details.fromAmount.toFixed(4)} ${details.fromToken} for ${details.toAmount.toFixed(4)} ${details.toToken}`, { ...details });
    };

    const markNotificationsAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    const setPin = (newPin: string) => {
        const encryptedPin = CryptoJS.AES.encrypt(newPin, ENCRYPTION_KEY).toString();
        localStorage.setItem(ENCRYPTION_KEY, encryptedPin);
        setPinState(encryptedPin);
        setHasPin(true);
    };
    
    const checkPin = (pinAttempt: string): boolean => {
        const storedPin = localStorage.getItem(ENCRYPTION_KEY);
        if (!storedPin) return false;
        try {
            const decryptedPin = CryptoJS.AES.decrypt(storedPin, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
            return pinAttempt === decryptedPin;
        } catch (e) {
            return false;
        }
    };
    
    const unlock = () => setIsLocked(false);
    const toggleAppLock = () => {
        const newValue = !isAppLockEnabled;
        setIsAppLockEnabled(newValue);
        localStorage.setItem('ghost_wallet_app_lock', String(newValue));
        walletLogEvent('SETTINGS_CHANGE', 'MOBILE', `App Lock ${newValue ? 'enabled' : 'disabled'}`);
    };
    const toggleBiometric = () => {
        const newValue = !isBiometricEnabled;
        setIsBiometricEnabled(newValue);
        walletLogEvent('SETTINGS_CHANGE', 'MOBILE', `Biometrics ${newValue ? 'enabled' : 'disabled'}`);
    };
    const togglePinForPayment = () => {
        const newValue = !isPinForPaymentEnabled;
        setIsPinForPaymentEnabled(newValue);
        localStorage.setItem('ghost_wallet_pin_for_payment', String(newValue));
        walletLogEvent('SETTINGS_CHANGE', 'MOBILE', `PIN for payment ${newValue ? 'enabled' : 'disabled'}`);
    };

    const toggleBalancesHidden = () => {
        const newValue = !isBalancesHidden;
        setIsBalancesHidden(newValue);
        localStorage.setItem('ghost_wallet_hide_balances', String(newValue));
        walletLogEvent('SETTINGS_CHANGE', 'MOBILE', `Balance masking ${newValue ? 'enabled' : 'disabled'}`);
    };

    const setHasGenesisNftAndPersist = (has: boolean) => {
        setHasGenesisNft(has);
        localStorage.setItem('ghost_wallet_has_nft', String(has));
    };
    
    const value = {
        activeView, setActiveView,
        activeTab, setActiveTab,
        balances, prices, transactions, addTransaction, addDeFiTransaction,
        paymentRequest, setPaymentRequest,
        isOnboarded, completeOnboarding, onTxComplete,
        notifications, hasUnreadNotifications, markNotificationsAsRead,
        isLocked, unlock, setPin, checkPin, hasPin,
        isAppLockEnabled, toggleAppLock,
        isBiometricEnabled, toggleBiometric,
        isPinForPaymentEnabled, togglePinForPayment,
        walletLogEvent,
        isNavVisible, setIsNavVisible,
        isBalancesHidden, toggleBalancesHidden,
        hasGenesisNft, setHasGenesisNft: setHasGenesisNftAndPersist
    };

    return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};