
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { MoonPayProvider } from "./moonpay";
import { StripeProvider } from "./stripe";
import { IOnrampProvider, OnrampProviderId, OnrampQuote, OnrampSessionConfig } from "./types";
import { Token } from "../../../../../types";

// This acts as the SDK for "Bridged Token Protocol" (BTP) regarding Fiat <-> Crypto bridges
export class OnrampSDK {
    private providers: Record<OnrampProviderId, IOnrampProvider>;

    constructor() {
        this.providers = {
            moonpay: new MoonPayProvider(),
            stripe: new StripeProvider()
        };
    }

    /**
     * Gets the best quote across all providers or a specific one.
     * Simulates a request to /api/v1/payments/onramp/quote
     */
    async getQuote(providerId: OnrampProviderId, amount: number, token: Token, fiat: string = 'USD'): Promise<OnrampQuote> {
        const provider = this.providers[providerId];
        if (!provider) throw new Error(`Provider ${providerId} not supported`);
        return provider.getQuote(amount, token, fiat);
    }

    /**
     * Executes the onramp transaction.
     * Simulates a POST to /api/v1/payments/onramp/crypto
     */
    async execute(quote: OnrampQuote, config: OnrampSessionConfig) {
        const provider = this.providers[quote.provider];
        return provider.executeSession(quote, config);
    }

    getAvailableProviders() {
        return Object.values(this.providers).map(p => ({ id: p.id, name: p.name }));
    }
}

export const onrampSDK = new OnrampSDK();
