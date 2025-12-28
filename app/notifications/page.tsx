"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { useState } from "react";

// 1. On enrichit les données avec un "type" (notification ou annonce)
const notificationsData = [
    {
        id: 1,
        date: "le 25/12/2025",
        user: "Modou Gaye",
        action: "inscription validée",
        time: "il y a 1h",
        avatarColor: "bg-blue-100 text-blue-600",
        type: "Notification" // Nouveau champ
    },
    {
        id: 2,
        date: "le 25/12/2025",
        user: "Administration",
        action: "Réunion pédagogique demain",
        time: "il y a 2h",
        avatarColor: "bg-orange-100 text-orange-600",
        type: "Annonce" // C'est une annonce
    },
    {
        id: 3,
        date: "le 24/12/2025",
        user: "Jean Ndiaye",
        action: "inscription validée",
        time: "il y a 1j",
        avatarColor: "bg-blue-100 text-blue-600",
        type: "Notification"
    },
    {
        id: 4,
        date: "le 23/12/2025",
        user: "Service Technique",
        action: "Maintenance du serveur prévue ce soir",
        time: "il y a 2j",
        avatarColor: "bg-red-100 text-red-600",
        type: "Annonce"
    },
];

export default function NotificationsPage() {
    // État pour gérer le filtre actif
    const [activeTab, setActiveTab] = useState("Tous");

    // 2. La Logique de filtrage
    // Si l'onglet est "Tous", on garde tout. Sinon, on ne garde que ce qui correspond au type.
    const filteredNotifications = activeTab === "Tous"
        ? notificationsData
        : notificationsData.filter(notif => notif.type === activeTab);

    return (
        <DashboardLayout title="Notifications">
            <div className="mx-auto max-w-5xl bg-white min-h-[600px] p-8 rounded-xl shadow-sm">

                {/* En-tête */}
                <div className="flex justify-between items-center mb-6">
                    {/* Titre en bleu foncé officiel */}
                    <h2 className="text-2xl font-bold text-[#00365F]">Notifications</h2>
                    <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>

                {/* 3. Les 3 Onglets de Filtre */}
                <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
                    {["Tous", "Notification", "Annonce"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-4 text-sm font-medium mr-4 transition-colors whitespace-nowrap ${activeTab === tab
                                    ? "border-b-2 border-[#00365F] text-[#00365F]" // Actif : Bleu foncé
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Liste des notifications filtrées */}
                <div className="space-y-8">
                    {filteredNotifications.map((notif) => (
                        <div key={notif.id} className="group">
                            {/* Date avec le point bleu foncé */}
                            <div className="flex items-center mb-3">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#00365F] mr-2"></span>
                                <span className="text-sm text-gray-500">{notif.date}</span>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                {/* Partie Gauche : Avatar + Texte */}
                                <div className="flex items-center gap-4 overflow-hidden">
                                    {/* CORRECTION AVATAR : 
                                'flex-shrink-0' empêche l'icône de s'écraser si l'écran est petit.
                            */}
                                    <div className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center ${notif.avatarColor}`}>
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>

                                    <div className="text-sm min-w-0">
                                        {/* Nom en bleu foncé */}
                                        <span className="font-bold text-[#00365F]">{notif.user}</span>
                                        <span className="text-gray-600 mx-1 truncate block sm:inline">
                                            {notif.action}
                                        </span>
                                        <span className="text-gray-400 text-xs block sm:inline">
                                            • {notif.time}
                                        </span>
                                    </div>
                                </div>

                                {/* Partie Droite : Badge Type (Annonce ou Notification) */}
                                <div className="ml-4 flex-shrink-0">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${notif.type === "Annonce"
                                            ? "bg-orange-100 text-orange-700 border border-orange-200"
                                            : "bg-blue-50 text-blue-700 border border-blue-100"
                                        }`}>
                                        {notif.type}
                                    </span>
                                </div>
                            </div>

                            <div className="border-b border-gray-100 mt-4 ml-14"></div>
                        </div>
                    ))}

                    {/* Message si la liste est vide */}
                    {filteredNotifications.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            Aucune {activeTab.toLowerCase()} trouvée.
                        </div>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}