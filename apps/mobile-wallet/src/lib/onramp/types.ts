
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { Token } from "../../../../../types";

export type OnrampProviderId = 'stripe' | 'moonpay';

export interface OnrampQuote {
    provider: OnrampProviderId;
    fiatCurrency: string;
    fiatAmount: number;
    cryptoCurrency: Token;
    cryptoAmount: number;
    fee: number;
    rate: number;
    expiresAt: number;
}

export interface OnrampSessionConfig {
    userAddress: string;
    userEmail: string;
    fiatCurrency?: string;
}

export interface IOnrampProvider {
    id: OnrampProviderId;
    name: string;
    getQuote(amount: number, token: Token, fiat: string): Promise<OnrampQuote>;
    executeSession(quote: OnrampQuote, config: OnrampSessionConfig): Promise<{ txId: string; status: 'success' | 'pending' | 'failed' }>;
}
