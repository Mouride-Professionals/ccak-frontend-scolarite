"use client";

import React, { useState } from 'react';
import NotificationList from './NotificationList';

const NotificationPopup = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Pour le test : true affiche le point rouge, false le cache.
    const hasNewNotifications = true;

    return (
        <div className="relative">
            {/* On reprend exactement le style du bouton original de la Navbar */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative rounded-lg p-2 text-[#00365F] transition-colors hover:bg-zinc-100"
            >
                {/* L'icône SVG (La belle cloche bleue) */}
                <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {/* Le Point Rouge (Conditionnel) */}
                {/* J'ai remis les dimensions exactes de la maquette : h-2 w-2 */}
                {hasNewNotifications && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
                )}
            </button>

            {/* Le Menu Déroulant */}
            {isOpen && (
                <div className="absolute right-0 mt-2 z-50">
                    <NotificationList />
                </div>
            )}
        </div>
    );
};

export default NotificationPopup;