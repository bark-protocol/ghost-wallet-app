/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

// Re-exporting core types from the main application to ensure consistency
export type { 
    Token,
    Transaction, 
    CartItem,
    Product,
    ApiResponse,
    OnrampQuote,
    OnrampProviderId,
    NetworkType,
    NetworkHealth
} from '../../../../types';

export type WalletTab = 'home' | 'defi' | 'transactions' | 'settings';
export type Chain = 'solana' | 'sui' | 'base' | 'ethereum';
export type Network = 'mainnet' | 'devnet';
export type RpcProvider = 'default' | 'helius' | 'infura' | 'alchemy';
export type WalletTheme = 'oled' | 'light' | 'slate' | 'moonshine' | 'nebula' | 'tidal' | 'styled' | 'carbon' | 'sunlight' | 'ghost';

export type WalletView = 
    | WalletTab
    | 'send' 
    | 'receive' 
    | 'deposit'
    | 'scan' 
    | 'pay' 
    | 'processing'
    | 'receipt'
    | 'profile'
    | 'walletConnect'
    | 'notifications'
    | 'developer'
    | 'security'
    | 'legal'
    | 'buy'
    | 'aiChat'
    | 'batchSend'
    | 'importWallet';

export interface Notification {
    id: string;
    icon: React.ElementType;
    title: string;
    body: string;
    timestamp: string;
    read: boolean;
}