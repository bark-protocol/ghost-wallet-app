
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className, ...props }) => {
    const baseClasses = "w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-50";

    const variantClasses = {
        primary: "bg-ghost-gold text-ghost-brown hover:brightness-110",
        secondary: "bg-white/10 border border-white/20 text-white hover:bg-white/20",
        ghost: "text-white/40 hover:text-white"
    };

    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};