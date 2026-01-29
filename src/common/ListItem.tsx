/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { ToggleSwitch } from './ToggleSwitch';

interface ListItemProps {
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
    isLast?: boolean;
    inSection?: boolean;
    accessory?: 'chevron' | 'toggle' | 'none' | React.ReactNode;
    toggleState?: boolean;
    onToggleChange?: () => void;
}

export const ListItem: React.FC<ListItemProps> = ({ 
    icon: Icon, 
    label, 
    onClick, 
    isLast = false, 
    inSection = true,
    accessory = 'chevron',
    toggleState = false,
    onToggleChange = () => {}
}) => {
    const isClickable = !!onClick;
    const isToggle = accessory === 'toggle';

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (isToggle) {
                onToggleChange();
            } else if (isClickable) {
                onClick?.();
            }
        }
    };
    
    const renderAccessory = () => {
        if (accessory === 'chevron') return <ChevronRight size={16} className="text-text-secondary" />;
        if (accessory === 'toggle') return <ToggleSwitch isOn={toggleState} onToggle={onToggleChange} />;
        if (accessory === 'none') return null;
        return accessory;
    };

    const content = (
        <div className="flex items-center justify-between p-4 text-left text-text-primary">
            <div className="flex items-center gap-4">
                <Icon size={18} className="text-text-secondary" />
                <span className="font-bold text-sm">{label}</span>
            </div>
            {renderAccessory()}
        </div>
    );

    const containerClasses = `
        w-full group transition-colors
        ${inSection ? 'bg-transparent' : 'bg-ui-card ring-1 ring-ui-border rounded-2xl'}
        ${!isLast && inSection ? 'border-b border-ui-border' : ''}
        ${isClickable || isToggle ? 'hover:bg-ui-card-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-inset' : ''}
    `;

    if (isToggle) {
        return (
            <button
                role="switch"
                aria-checked={toggleState}
                onClick={onToggleChange}
                onKeyDown={handleKeyDown}
                className={containerClasses}
            >
                {content}
            </button>
        );
    }

    if (isClickable) {
        return (
            <button
                role="menuitem"
                onClick={onClick}
                onKeyDown={handleKeyDown}
                className={containerClasses}
            >
                {content}
            </button>
        );
    }
    
    return <div className={containerClasses}>{content}</div>;
};
