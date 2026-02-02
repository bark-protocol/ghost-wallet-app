/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// FIX: Import `useMemo` from `react` to resolve the "Cannot find name 'useMemo'" error.
import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { SetupScreen } from '../screens/SetupScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { MainLayout } from './MainLayout';
import { ProfileScreen } from '../screens/ProfileScreen';
import { WalletConnectScreen } from '../screens/WalletConnectScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { DeveloperScreen } from '../screens/DeveloperScreen';
import { LockScreen } from '../screens/LockScreen';
import { SecurityScreen } from '../screens/SecurityScreen';
import { SendScreen } from '../screens/SendScreen';
import { ReceiveScreen } from '../screens/ReceiveScreen';
import { DepositScreen } from '../screens/DepositScreen';
import { BuyScreen } from '../screens/BuyScreen';
import { AIChatScreen } from '../screens/AIChatScreen';
import { BatchSendScreen } from '../screens/BatchSendScreen';
import { ImportWalletScreen } from '../screens/setup/ImportWalletScreen';
import { ArrowLeft, ShieldAlert, Scale, Info } from 'lucide-react';

const overlayVariants = {
    hidden: { opacity: 0, scale: 1.05 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 }
};

const LegalScreen: React.FC = () => {
    const { setActiveView, activeTab } = useWallet();
    return (
        <div className="flex flex-col h-full bg-ui-bg text-text-primary">
            <header className="flex items-center p-6 shrink-0 border-b border-ui-border bg-ui-card/30 backdrop-blur-md">
                <button onClick={() => setActiveView(activeTab)} className="p-2 text-text-secondary hover:text-text-primary bg-ui-card-secondary rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="flex-1 text-center font-black text-xs uppercase tracking-[0.3em] ml-[-40px]">Compliance & Legal</h1>
            </header>
            <main className="flex-1 overflow-y-auto p-8 text-sm text-text-secondary space-y-8 custom-scrollbar">
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-accent-primary mb-1">
                        <Info size={16} />
                        <h2 className="font-black text-[10px] uppercase tracking-[0.2em]">Protocol Documentation</h2>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-80">
                        This application is a high-fidelity interactive simulation of the <span className="text-text-primary font-bold">Ghost Protocol Layer-2</span> infrastructure. 
                        It demonstrates modular components including GhostPay, GhostWallet, and the ZK-Shield privacy layer. 
                        This is an investor-ready mockup intended for technical validation and UI/UX demonstration only.
                    </p>
                </section>

                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-accent-primary mb-1">
                        <Scale size={16} />
                        <h2 className="font-black text-[10px] uppercase tracking-[0.2em]">Terms of Service</h2>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-80">
                        By utilizing this interface, you acknowledge that all financial values, token balances, and transaction logs are 
                        <span className="text-text-primary font-bold"> synthetic and carry no real-world value</span>. 
                        Ghost Protocol Labs is not responsible for any misuse of this simulation or for any data entered into this non-production environment.
                    </p>
                </section>
                
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-accent-primary mb-1">
                        <ShieldAlert size={16} />
                        <h2 className="font-black text-[10px] uppercase tracking-[0.2em]">Privacy Policy</h2>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-80">
                        We prioritize absolute data sovereignty. No personal data, IP addresses, or private keys are transmitted to external servers. 
                        All application state is ephemeral, stored locally within your browser's session storage, and is purged upon session reset or hardware refresh.
                    </p>
                </section>

                <div className="pt-8 text-center opacity-30">
                    <p className="text-[8px] font-mono uppercase tracking-[0.4em]">Protocol Revision v2.4.1 // Legal Hash: 0x82...D91</p>
                </div>
            </main>
        </div>
    );
};

const MODAL_VIEWS: Record<string, React.ReactNode> = {
    profile: <ProfileScreen />,
    walletConnect: <WalletConnectScreen />,
    scan: <ScanScreen />,
    notifications: <NotificationsScreen />,
    developer: <DeveloperScreen />,
    security: <SecurityScreen />,
    legal: <LegalScreen />,
    send: <SendScreen />,
    receive: <ReceiveScreen />,
    deposit: <DepositScreen />,
    buy: <BuyScreen />,
    aiChat: <AIChatScreen />,
    batchSend: <BatchSendScreen />,
    importWallet: <ImportWalletScreen isModal={true} onSuccess={() => {}} />,
}

export const AppNavigator: React.FC = () => {
    const { isOnboarded, paymentRequest, activeView, isLocked, setActiveView, activeTab } = useWallet();
    
    const isModalView = activeView in MODAL_VIEWS;

    // A bit of a hack to pass the correct onSuccess to the modal from here
    const modalViewContent = useMemo(() => {
        if (activeView === 'importWallet') {
            return <ImportWalletScreen isModal={true} onSuccess={() => setActiveView(activeTab)} />;
        }
        return MODAL_VIEWS[activeView as keyof typeof MODAL_VIEWS];
    }, [activeView, activeTab]);

    return (
        <div className="w-full h-full relative bg-black">
            <AnimatePresence>
                {isLocked && isOnboarded && (
                    <motion.div
                        key="lockscreen"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100]"
                    >
                        <LockScreen />
                    </motion.div>
                )}
            </AnimatePresence>
            
            <AnimatePresence>
                {!isOnboarded ? (
                    <motion.div 
                        key="onboarding" 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full"
                    >
                        <SetupScreen />
                    </motion.div>
                ) : (
                    <motion.div 
                        key="main-app" 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full"
                    >
                        <MainLayout />
                    </motion.div>
                )}
            </AnimatePresence>
            
            <AnimatePresence>
                {paymentRequest && isOnboarded && (
                     <motion.div 
                        key="payment"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 z-[70]"
                    >
                        <PaymentScreen />
                    </motion.div>
                )}
                {isModalView && isOnboarded && (
                     <motion.div 
                        key={activeView}
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 z-[60] bg-black"
                    >
                        {modalViewContent}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
