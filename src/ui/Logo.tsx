
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

export const GhostIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <img 
        src="https://raw.githubusercontent.com/ghost-protocol-labs/ghost-assets/refs/heads/main/assets/GHOST.svg" 
        alt="GHOST logo" 
        className={className} 
    />
);

export const GhostWalletLogo: React.FC<{
    className?: string;
    iconClassName?: string;
    textClassName?: string;
    subtextClassName?: string;
    vertical?: boolean;
    textStacked?: boolean;
}> = ({
    className = "",
    iconClassName = "w-6 h-6",
    textClassName = "text-base",
    subtextClassName = "text-[9px]",
    vertical = false,
    textStacked = false,
}) => (
    <div className={`flex ${vertical ? 'flex-col items-center gap-4' : 'items-center gap-3'} ${className}`}>
        <GhostIcon className={iconClassName} />
        <div className={`flex flex-col ${vertical ? 'items-center' : (textStacked ? 'items-start -space-y-0.5' : 'items-center gap-1.5 flex-row')}`}>
            <span className={`tracking-tighter leading-none whitespace-nowrap font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-text-primary via-text-secondary to-text-secondary/60 ${textClassName}`}>
                GHOST
            </span>
             <div className={`flex items-center gap-2 ${vertical ? 'mt-1' : ''}`}>
                {vertical && <div className="h-px w-6 bg-ui-border opacity-50" />}
                <span className={`text-accent-primary font-mono uppercase tracking-[0.2em] leading-none ${subtextClassName}`}>
                    WALLET
                </span>
                {vertical && <div className="h-px w-6 bg-ui-border opacity-50" />}
            </div>
        </div>
    </div>
);
