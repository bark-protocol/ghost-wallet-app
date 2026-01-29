/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { WalletContext } from './WalletContext';

interface LanguageContextType {
    locale: string;
    setLocale: (locale: string) => void;
    t: (key: string, options?: any) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const locales = {
    'en-US': 'English',
    'fr-FR': 'Français',
    'fi-FI': 'Suomi',
    'sv-SE': 'Svenska',
    'de-DE': 'Deutsch',
    'et-EE': 'Eesti',
    'ru-RU': 'Русский'
};

export type Locale = keyof typeof locales;

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locale, setLocaleState] = useState<string>('en-US');
    const [translations, setTranslations] = useState<Record<string, any>>({});
    const walletContext = useContext(WalletContext);

    const setLocale = useCallback((newLocale: string) => {
        setLocaleState(newLocale);
        if (walletContext?.walletLogEvent) {
            walletContext.walletLogEvent('SETTINGS_CHANGE', 'MOBILE', `Wallet language changed to ${newLocale}`, { setting: 'language', value: newLocale });
        }
    }, [walletContext?.walletLogEvent]);

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                // Using an absolute path from the root to avoid resolution issues in deep routes
                const path = `/packages/sdk/ghostwallet/src/locales/${locale}.json`;
                const response = await fetch(path);
                if (!response.ok) {
                    throw new Error(`Failed to load translations for ${locale} at ${path}`);
                }
                const data = await response.json();
                setTranslations(data);
            } catch (error) {
                console.error("[GHOST_OS] Translation Load Error:", error);
                if (locale !== 'en-US') {
                    setLocale('en-US');
                }
            }
        };

        fetchTranslations();
    }, [locale, setLocale]);

    const t = useCallback((key: string, options?: any): string => {
        const keys = key.split('.');
        let result = translations;
        for (const k of keys) {
            result = result?.[k];
            if (result === undefined) {
                return key;
            }
        }
        
        if (typeof result === 'string' && options) {
            return Object.entries(options).reduce((acc: string, [optKey, value]) => {
                return acc.replace(`{{${optKey}}}`, String(value));
            }, result);
        }

        return typeof result === 'string' ? result : key;
    }, [translations]);

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
};