

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect } from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { Notification } from '../types';
import { format } from '../lib/format';

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    const { icon: Icon } = notification;
    
    // A simple time ago function for display
    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    return (
        <div className="flex items-start gap-4 p-4 bg-[#1C1C1E] ring-1 ring-white/10 rounded-2xl relative">
            {!notification.read && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-ghost-gold rounded-full" />
            )}
            <div className={`p-2 rounded-lg ${notification.read ? 'bg-white/10 text-white/40' : 'bg-ghost-gold/10 text-ghost-gold'}`}>
                 <Icon size={16} />
            </div>
            <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-1">{notification.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed mb-2">{notification.body}</p>
                <p className="text-[10px] text-white/30 font-mono">{timeAgo(notification.timestamp)}</p>
            </div>
        </div>
    );
};

export const NotificationsScreen: React.FC = () => {
    const { setActiveView, activeTab, notifications, markNotificationsAsRead } = useWallet();

    useEffect(() => {
        // Mark notifications as read when the component is mounted
        const timer = setTimeout(markNotificationsAsRead, 1000);
        return () => clearTimeout(timer);
    }, [markNotificationsAsRead]);

    return (
        <div className="flex flex-col h-full bg-black text-white">
            <header className="flex items-center p-4 shrink-0 ring-1 ring-white/10">
                <button 
                    onClick={() => setActiveView(activeTab)} 
                    className="p-2 text-white/60 hover:text-white"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="flex-1 text-center font-bold text-sm uppercase tracking-widest">Alarms & Info</h1>
                <div className="w-9" /> {/* Spacer */}
            </header>

            <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {notifications.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-white/40">
                        <Bell size={32} className="mb-4" />
                        <h2 className="font-bold">All Caught Up</h2>
                        <p className="text-xs">You have no new notifications.</p>
                    </div>
                )}
            </main>
        </div>
    );
};