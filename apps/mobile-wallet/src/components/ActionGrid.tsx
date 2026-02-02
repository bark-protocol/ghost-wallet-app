
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ArrowUp, ArrowDown, RefreshCw, CreditCard } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { WalletView } from '../types';

interface ActionItemProps {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
}

const ActionItem: React.FC<ActionItemProps> = ({ icon: Icon, label, onClick }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center gap-2 group"
    >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-90 ring-1 ring-ui-border bg-ui-card hover:bg-ui-card-secondary group-hover:ring-accent-primary/50">
            <Icon size={20} className="text-accent-primary transition-colors" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary group-hover:text-text-primary transition-colors">
            {label}
        </span>
    </button>
);

export const ActionGrid: React.FC = () => {
    const { setActiveView, setActiveTab } = useWallet();

    const ACTIONS = [
        { id: 'send', label: 'Send', icon: ArrowUp, view: 'send' as WalletView },
        { id: 'deposit', label: 'Deposit', icon: ArrowDown, view: 'deposit' as WalletView },
        { id: 'swap', label: 'Swap', icon: RefreshCw, tab: 'defi' as const },
        { id: 'banking', label: 'Banking', icon: CreditCard, view: 'buy' as WalletView },
    ];

    return (
        <div className="grid grid-cols-4 gap-4 w-full py-4">
            {ACTIONS.map(action => (
                <ActionItem 
                    key={action.id}
                    icon={action.icon}
                    label={action.label}
                    onClick={() => {
                        if (action.tab) setActiveTab(action.tab);
                        if (action.view) setActiveView(action.view);
                    }}
                />
            ))}
        </div>
    );
};
