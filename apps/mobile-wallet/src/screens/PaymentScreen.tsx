
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { ApiResponse, Transaction } from '../types';
import { GhostPayApp } from '../../../ghostpay/src/App';

/**
 * This screen is a simplified wrapper around the core GhostPay component,
 * adapting it for use within the standalone mobile wallet application flow.
 */
export const PaymentScreen: React.FC = () => {
    const { 
        paymentRequest, 
        setPaymentRequest, 
        addTransaction: addWalletTransaction, 
        setActiveTab,
        balances,
        prices,
        onTxComplete,
        isPinForPaymentEnabled,
        walletLogEvent, 
    } = useWallet();

    const [theme] = useState<'dark' | 'light'>('dark');

    const handleTxComplete = (response: ApiResponse, transaction: Transaction) => {
        addWalletTransaction(transaction);
        setPaymentRequest(null); // This will close the modal
        setActiveTab('home');
        walletLogEvent('PAYMENT_CONFIRMED', 'MOBILE', `Payment confirmed for $${transaction.amount.toFixed(2)} in ${transaction.token}`, { txId: transaction.id, token: transaction.token, usdAmount: transaction.amount }); 
        if (onTxComplete) {
            onTxComplete(response, transaction);
        }
    };
    
    const handleCancel = () => {
        setPaymentRequest(null);
    }

    // The GhostPay component contains the full UI and logic for payment.
    // We pass our mobile app's state and callbacks to it.
    return (
        <div className="w-full h-full">
            <GhostPayApp
                activeTx={paymentRequest}
                onTxComplete={handleTxComplete}
                onCancel={handleCancel}
                theme={theme}
                assetBalances={balances}
                prices={prices}
                requirePinForPayment={isPinForPaymentEnabled}
            />
        </div>
    );
};
