import React from 'react';
import NotificationItem from './NotificationItem';
// 👇 1. On importe Link ici
import Link from 'next/link';

const notifications = [
    { id: 1, title: 'Nouvelle Inscription', date: '2/10/25', name: 'Moustapha Fall', level: 'Master 2' },
    { id: 2, title: 'Nouvelle Inscription', date: '3/10/25', name: 'Awa Diop', level: 'Licence 1' },
    { id: 3, title: 'Nouvelle Inscription', date: '4/10/25', name: 'Jean Ndiaye', level: 'Master 1' },
    { id: 4, title: 'Nouvelle Inscription', date: '5/10/25', name: 'Fatou Sow', level: 'Licence 3' },
];

const NotificationList = () => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-100 w-80">
            {notifications.map((notif, index) => (
                <NotificationItem
                    key={notif.id}
                    title={notif.title}
                    date={notif.date}
                    name={notif.name}
                    level={notif.level}
                    isLastItem={index === notifications.length - 1}
                />
            ))}

            {/* 👇 2. C'est ici qu'on change le bouton en Lien */}
            <div className="mt-4 text-center">
                <Link
                    href="/notifications"
                    className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors"
                >
                    Voir plus
                </Link>
            </div>
        </div>
    );
};

export default NotificationList;