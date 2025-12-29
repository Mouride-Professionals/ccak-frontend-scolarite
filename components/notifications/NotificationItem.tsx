import React from 'react';

interface NotificationItemProps {
    title: string;
    date: string;
    name: string;
    level: string;
    isLastItem?: boolean;
}

const NotificationItem = ({ title, date, name, level, isLastItem = false }: NotificationItemProps) => {
    return (
        <div className="py-3">
            {/* Ligne 1 : Titre et Date */}
            <div className="flex justify-between items-center mb-1">
                <h4 className="text-blue-900 font-semibold text-sm">
                    {title}
                </h4>
                <span className="text-xs text-red-500 font-medium">
                    {date}
                </span>
            </div>

            {/* Ligne 2 : Nom et Niveau */}
            <div className="flex justify-between items-center mb-2">
                <p className="text-gray-700 text-sm">
                    {name}
                </p>
                <span className="text-red-500 font-medium text-sm">
                    {level}
                </span>
            </div>

            {/* Ligne de séparation : On l'affiche SAUF si c'est le dernier élément */}
            {!isLastItem && (
                <hr className="border-gray-200 mt-2" />
            )}
        </div>
    );
};

export default NotificationItem;