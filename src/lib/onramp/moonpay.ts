
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { IOnrampProvider, OnrampQuote, OnrampSessionConfig } from "./types";
import { Token } from "../../../../../types";

export class MoonPayProvider implements IOnrampProvider {
    id: 'moonpay' = 'moonpay';
    name = 'MoonPay';

    async getQuote(amount: number, token: Token, fiat: string = 'USD'): Promise<OnrampQuote> {
        // Simulate network latency for /api/v1/payments/onramp/quote
        await new Promise(resolve => setTimeout(resolve, 600));

        // Mock rates (simulating live market data)
        const baseRates: Record<string, number> = {
            'SOL': 160.50,
            'USDC': 1.01, // Slight premium
            'SUI': 1.85,
            'GHOST': 1.25,
            'GHST': 0.85,
            'JUP': 1.45,
            'BONK': 0.000028,
            'RAY': 1.50
        };

        const rate = baseRates[token] || 100;
        const fee = amount * 0.035; // 3.5% fee
        const netAmount = amount - fee;
        const cryptoAmount = netAmount / rate;

        return {
            provider: 'moonpay',
            fiatCurrency: fiat,
            fiatAmount: amount,
            cryptoCurrency: token,
            cryptoAmount: parseFloat(cryptoAmount.toFixed(6)),
            fee: parseFloat(fee.toFixed(2)),
            rate,
            expiresAt: Date.now() + 30000 // 30s expiry
        };
    }

    async executeSession(quote: OnrampQuote, config: OnrampSessionConfig): Promise<{ txId: string; status: 'success' | 'pending' | 'failed' }> {
        console.log(`[MoonPay] Initializing Widget for ${config.userEmail}...`);
        
        // Simulate widget interaction time
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Simulate backend callback to /api/v1/payments/onramp/crypto
        console.log(`[MoonPay] Webhook received: Crypto Purchase Confirmed`);

        return {
            txId: `mp_tx_${Math.random().toString(36).substring(2, 9)}`,
            status: 'success'
        };
    }
}
