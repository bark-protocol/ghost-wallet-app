
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { AppNavigator } from './navigation/AppNavigator';
import { WalletProvider, WalletProviderProps } from './context/WalletContext';
import { ClusterProvider } from './context/ClusterContext';
import { FeeProvider } from './context/FeeContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { SystemEventType, LogSource } from '../../../../types/systemLog';

export type GhostWalletAppProps = Omit<WalletProviderProps, 'children' | 'logEvent'> & {
    logEvent: (type: SystemEventType, source: LogSource, message: string, metadata?: any) => void;
};

const ThemedApp: React.FC = () => {
    const { theme } = useTheme();
    return (
        <div className={`w-full h-full bg-ui-bg font-sans theme-${theme}`}>
            <AppNavigator />
        </div>
    );
};

/**
 * The root component for the Ghost Wallet mobile application.
 * Providers are ordered such that children can consume contexts from their parents.
 */
const GhostWalletApp: React.FC<GhostWalletAppProps> = (props) => {
    return (
        <WalletProvider {...props}>
            <LanguageProvider>
                <ThemeProvider>
                    <ClusterProvider>
                        <FeeProvider>
                            <ThemedApp />
                        </FeeProvider>
                    </ClusterProvider>
                </ThemeProvider>
            </LanguageProvider>
        </WalletProvider>
    );
};

export default GhostWalletApp;
