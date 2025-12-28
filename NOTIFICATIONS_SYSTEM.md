# Système de Gestion des Notifications et Annonces

Ce document décrit le système complet de gestion des notifications et annonces pour ccak-frontend-scolarite.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Pages](#pages)
- [Composants](#composants)
- [API](#api)
- [Templates Email](#templates-email)
- [Utilisation](#utilisation)

## 🎯 Vue d'ensemble

Le système permet de :
- **Envoyer des notifications** aux utilisateurs via multiple canaux (In-App, Email, SMS)
- **Créer et gérer des annonces** avec ciblage d'audience
- **Gérer les templates d'emails** utilisés pour les notifications
- **Prévisualiser les templates** avant envoi
- **Suivre l'état des notifications** (lues/non lues)

## 🏗 Architecture

```
ccak-frontend-scolarite/
├── app/
│   └── dashboard/
│       ├── notifications/     # Page gestion notifications
│       ├── announcements/     # Page gestion annonces
│       └── templates/         # Page gestion templates
├── components/
│   ├── notifications/
│   │   ├── SendNotificationModal.tsx
│   │   └── NotificationList.tsx
│   ├── announcements/
│   │   ├── CreateAnnouncementModal.tsx
│   │   └── AnnouncementCard.tsx
│   └── templates/
│       ├── TemplateCard.tsx
│       └── TemplatePreviewModal.tsx
└── lib/
    └── api/
        ├── auth-fetch.ts
        ├── notifications.ts
        ├── announcements.ts
        └── templates.ts
```

## 📄 Pages

### 1. Gestion des Notifications (`/dashboard/notifications`)

Interface pour :
- Envoyer des notifications à un ou plusieurs utilisateurs
- Visualiser l'historique des notifications
- Statistiques (total, lues, non lues)
- Filtrage par type et statut

**Accès** : Administrateurs uniquement

### 2. Gestion des Annonces (`/dashboard/announcements`)

Interface pour :
- Créer des annonces (brouillon ou publiées)
- Modifier et supprimer des annonces
- Publier des brouillons
- Cibler des audiences spécifiques (rôles)
- Programmer la publication et l'expiration

**Accès** : Administrateurs uniquement

### 3. Gestion des Templates (`/dashboard/templates`)

Interface pour :
- Visualiser tous les templates disponibles
- Voir les variables disponibles
- Prévisualiser le rendu avec données d'exemple
- Accéder au code source sur GitHub

**Accès** : Administrateurs uniquement

## 🧩 Composants

### Notifications

#### `SendNotificationModal`
Modal pour créer et envoyer une notification.

**Props** :
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onSend: (payload: SendNotificationPayload) => void;
  isLoading?: boolean;
}
```

**Fonctionnalités** :
- Sélection des destinataires (IDs multiples)
- Choix du type de notification
- Titre et message personnalisables
- Sélection des canaux (In-App, Email, SMS)
- Prévisualisation du template utilisé

#### `NotificationList`
Liste tabulaire des notifications.

**Props** :
```typescript
{
  notifications: Notification[];
}
```

**Affichage** :
- Type avec badge coloré
- Titre et message
- Canaux d'envoi
- Statut (lue/non lue)
- Date d'envoi

### Annonces

#### `CreateAnnouncementModal`
Modal pour créer ou modifier une annonce.

**Props** :
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAnnouncementPayload) => void;
  announcement?: Announcement | null;
  isLoading?: boolean;
}
```

**Fonctionnalités** :
- Titre et contenu
- Niveaux de priorité (Basse, Moyenne, Haute, Critique)
- Ciblage par rôles (Étudiants, Enseignants, Admin, Personnel)
- Programmation de publication
- Date d'expiration
- Mode brouillon/publié

#### `AnnouncementCard`
Carte affichant une annonce.

**Props** :
```typescript
{
  announcement: Announcement;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
}
```

**Actions** :
- Modifier
- Publier (si brouillon)
- Supprimer

### Templates

#### `TemplateCard`
Carte affichant un template email.

**Props** :
```typescript
{
  template: EmailTemplate;
  onPreview: (template: EmailTemplate) => void;
}
```

**Affichage** :
- Nom et description
- Chemin du fichier
- Variables disponibles
- Actions (Aperçu, Voir sur GitHub)

#### `TemplatePreviewModal`
Modal de prévisualisation de template.

**Props** :
```typescript
{
  template: EmailTemplate;
  isOpen: boolean;
  onClose: () => void;
}
```

**Fonctionnalités** :
- Génération de données d'exemple
- Prévisualisation du rendu HTML
- Liste des variables avec valeurs
- Lien vers le code source

## 🔌 API

### Notifications API (`lib/api/notifications.ts`)

```typescript
// Récupérer les notifications
notificationsApi.getNotifications({ type?, is_read?, page?, per_page? })

// Envoyer une notification
notificationsApi.sendNotification(payload)

// Marquer comme lue
notificationsApi.markAsRead(id)

// Marquer toutes comme lues
notificationsApi.markAllAsRead()

// Compteur non lues
notificationsApi.getUnreadCount()

// Supprimer
notificationsApi.deleteNotification(id)
```

### Announcements API (`lib/api/announcements.ts`)

```typescript
// Récupérer les annonces
announcementsApi.getAnnouncements({ priority?, dismissed?, page?, per_page? })

// Récupérer une annonce
announcementsApi.getAnnouncement(id)

// Créer une annonce
announcementsApi.createAnnouncement(payload)

// Modifier une annonce
announcementsApi.updateAnnouncement(id, payload)

// Supprimer une annonce
announcementsApi.deleteAnnouncement(id)

// Dismisser une annonce
announcementsApi.dismissAnnouncement(id)

// Publier une annonce
announcementsApi.publishAnnouncement(id)
```

### Templates API (`lib/api/templates.ts`)

```typescript
// Récupérer les templates
templatesApi.getTemplates()

// Prévisualiser un template
templatesApi.getTemplatePreview(templateName, variables)
```

## 📧 Templates Email

Les templates sont stockés dans le backend Laravel :
`ccak-backend-scolarite/resources/views/emails/notifications/`

### Templates disponibles

1. **notification** (`generic.blade.php`)
   - Template générique pour toutes notifications
   - Variables : `title`, `message`, `user.name`

2. **welcome** (`welcome.blade.php`)
   - Email de bienvenue
   - Variables : `user.name`

3. **grade_published** (`grade-published.blade.php`)
   - Notification de note publiée
   - Variables : `user.name`, `grade.subject`, `grade.score`, `grade.url`

4. **enrollment_confirmed** (`enrollment-confirmed.blade.php`)
   - Confirmation d'inscription
   - Variables : `user.name`, `course.name`, `enrollment.url`

5. **document_ready** (`document-ready.blade.php`)
   - Document disponible
   - Variables : `user.name`, `document.name`, `document.url`

6. **password_reset** (`password-reset.blade.php`)
   - Réinitialisation mot de passe
   - Variables : `user.name`, `reset.url`, `reset.token`

### Structure d'un template

```blade
@extends('emails.layouts.notification')

@section('content')
    <h2>{{ $notification->title }}</h2>
    <p>Bonjour {{ $user->name }},</p>
    <p>{{ $notification->message }}</p>
    <!-- Contenu spécifique au template -->
@endsection
```

## 🚀 Utilisation

### Envoyer une notification

1. Aller sur `/dashboard/notifications`
2. Cliquer sur "Nouvelle notification"
3. Remplir le formulaire :
   - IDs des destinataires
   - Type de notification
   - Titre et message
   - Canaux (In-App, Email, SMS)
4. Cliquer sur "Envoyer"

### Créer une annonce

1. Aller sur `/dashboard/announcements`
2. Cliquer sur "Nouvelle annonce"
3. Remplir le formulaire :
   - Titre et contenu
   - Priorité
   - Public cible
   - Dates de publication/expiration
4. Sauvegarder en brouillon ou publier directement

### Gérer les templates

1. Aller sur `/dashboard/templates`
2. Voir la liste des templates disponibles
3. Cliquer sur "Aperçu" pour prévisualiser
4. Générer des données d'exemple pour voir le rendu
5. Modifier les templates dans le backend si nécessaire

## 🔒 Sécurité

- Toutes les routes sont protégées par authentification
- Les actions admin nécessitent le rôle ADMIN
- Les tokens JWT sont validés côté backend
- Les données sont validées avant envoi

## 📝 Variables d'environnement

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Backend (.env)
RABBITMQ_EMAIL_ENDPOINT=https://api.ccak.edu.sn/api/notifications/rabbitmq/bulk-email
RABBITMQ_SMS_ENDPOINT=https://api.ccak.edu.sn/api/notifications/rabbitmq/bulk-sms
SMS_SENDER_ADDRESS=tel:+221787841965
SMS_SENDER_NAME=UCAK
MAIL_FROM_ADDRESS=noreply@ucak.sn
MAIL_FROM_NAME=UCAK
```

## 🎨 Personnalisation

### Ajouter un nouveau template

1. Créer le fichier `.blade.php` dans `resources/views/emails/notifications/`
2. Ajouter le template dans `lib/api/templates.ts`
3. Ajouter le type dans le backend (`app/Models/Notification.php`)

### Modifier les couleurs

Les couleurs sont définies dans les composants :
- Priorités : `priorityColors` dans `AnnouncementCard`
- Types : `typeColors` dans `NotificationList`
- Thème principal : `#00365F` (bleu UCAK)

## 🐛 Dépannage

### Les notifications ne s'envoient pas
- Vérifier que le backend est démarré
- Vérifier les credentials RabbitMQ
- Vérifier les logs Laravel

### Les templates ne s'affichent pas
- Vérifier que les fichiers .blade.php existent
- Vérifier les permissions des fichiers
- Vider le cache Laravel : `php artisan cache:clear`

### Erreur d'authentification
- Vérifier le token JWT
- Vérifier la configuration Keycloak
- Vérifier que l'utilisateur a le rôle ADMIN

## 📚 Ressources

- [Documentation Laravel Blade](https://laravel.com/docs/blade)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation TanStack Query](https://tanstack.com/query)
- [Documentation Tailwind CSS](https://tailwindcss.com)
