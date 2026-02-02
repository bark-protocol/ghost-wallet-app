
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useContext } from 'react';
import { WalletContext } from '../context/WalletContext';

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};