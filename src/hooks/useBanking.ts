/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState, useCallback } from 'react';
import { OnrampProviderId, Token } from '../types';
import { useWallet } from './useWallet';
import { trpcClient } from '../../../../../lib/trpc';

export const useBanking = () => {
    const { walletLogEvent } = useWallet();
    const [isQuoting, setIsQuoting] = useState(false);

    const fetchQuote = useCallback(async (provider: OnrampProviderId, amount: number, token: Token) => {
        setIsQuoting(true);
        try {
            const quote = await trpcClient.onramp.quote.query({ provider, amount, token });
            return quote;
        } catch (e) {
            console.error(e);
            return null;
        } finally {
            setIsQuoting(false);
        }
    }, []);

    return {
        fetchQuote,
        isQuoting
    };
};