# SmartSupport - Système de Gestion de Tickets avec Assistance IA 🚀

**SmartSupport** est une application web moderne et collaborative de gestion de tickets de support technique, développée dans le cadre d'un **Projet de Fin d'Études (PFE)**. Elle intègre une assistance basée sur l'Intelligence Artificielle (via l'API **Google Gemini**) pour automatiser le tri des incidents, générer des résumés de problèmes complexes et suggérer des pistes de résolution immédiates aux agents de support.

---

## 📋 Table des Matières
1. [Contexte & Objectifs](#-contexte--objectifs)
2. [Fonctionnalités Clés](#-fonctionnalités-clés)
3. [Architecture & Stack Technique](#-architecture--stack-technique)
4. [Structure du Projet](#-structure-du-projet)
5. [Installation & Configuration](#-installation--configuration)
   - [Configuration du Backend (Laravel)](#1-configuration-du-backend-laravel)
   - [Configuration du Frontend (React)](#2-configuration-du-frontend-react)
6. [Indicateurs de Performance (KPIs)](#-indicateurs-de-performance-kpis)

---

## 🎯 Contexte & Objectifs

Dans toute entreprise, la réactivité du support technique est un facteur clé de productivité. L'objectif de **SmartSupport** est de simplifier ce processus :
* **Centraliser** tous les incidents et demandes d'assistance au sein d'espaces de travail collaboratifs.
* **Accélérer le tri** en laissant l'IA catégoriser automatiquement les demandes (Réseau, Matériel, Logiciel, Facturation, etc.).
* **Assister les agents** en fournissant instantanément un résumé court des longues descriptions et une suggestion de solution directement exploitable.
* **Mesurer les performances** en calculant automatiquement le temps moyen nécessaire pour résoudre un incident.

---

## ✨ Fonctionnalités Clés

### 🔐 Authentification & Gestion des Rôles
* Inscription et connexion sécurisées basées sur les jetons **JWT (JSON Web Tokens)**.
* Gestion multi-espaces de travail (**Workspaces**) : un utilisateur peut créer ou rejoindre plusieurs espaces collaboratifs.
* Rôles contextuels définis par espace de travail : **Employé** (création et suivi de tickets) ou **Administrateur / Support** (attribution, gestion, résolution et statistiques).

### 🎫 Gestion des Tickets
* Formulaire de création de ticket simple et intuitif.
* Cycle de vie complet du ticket : `En attente (Pending)` ➔ `En cours (In Progress)` ➔ `Résolu (Resolved)`.
* **Journalisation d'Audit (Logs) :** Chaque action effectuée sur un ticket (création, changement de statut, assignation) est enregistrée et affichée chronologiquement pour assurer une traçabilité totale.
* Assignation des tickets aux membres de l'espace de travail.

### 🤖 Assistance IA (Google Gemini 2.5 Flash)
* **Catégorisation automatique :** L'IA analyse le titre et la description pour ranger le ticket dans la bonne catégorie.
* **Résumé automatique :** Génération d'une synthèse courte (une phrase) facilitant la lecture rapide par les administrateurs.
* **Suggestion de solution :** L'IA propose une première piste de résolution technique ou fonctionnelle dès la soumission du ticket.
* **Mode interactif :** Option permettant à l'utilisateur de demander une suggestion en direct lors de la rédaction de son ticket.

### 📊 Tableau de Bord & Statistiques
* Tableau de bord pour les administrateurs récapitulant le volume total de tickets et leur état actuel.
* Calcul en temps réel du **Temps Moyen de Résolution** (en heures).
* Historique des tickets récents de l'espace de travail.

---

## 🛠️ Architecture & Stack Technique

L'application repose sur une architecture découplée (API First) :

| Composant | Technologie | Description |
| :--- | :--- | :--- |
| **Frontend** | **React JS** + **Tailwind CSS** | Interface utilisateur dynamique, fluide et responsive. Icônes gérées avec *Lucide React*. |
| **Backend** | **Laravel (PHP)** | API RESTful structurée, gestion des contrôleurs, middleware de validation de tokens. |
| **Base de Données** | **MySQL** | Stockage relationnel (users, workspaces, workspace_members, tickets, ticket_logs). |
| **Sécurité** | **JWT (tymon/jwt-auth)** | Authentification sans état (stateless) via des jetons sécurisés. |
| **IA** | **Google Gemini API** | Modèle `gemini-2.5-flash` utilisé pour l'analyse sémantique (NLP) et la génération de contenu. |

---

## 📁 Structure du Projet

```text
ProjetFinD'etude/
├── Backend/          # Code source de l'API RESTful (Laravel)
│   ├── app/          # Modèles, Contrôleurs et Services (ex: GeminiService)
│   ├── database/     # Migrations de base de données
│   ├── routes/       # Définition des routes de l'API (api.php)
│   └── .env          # Fichier de configuration (clé API, base de données)
│
├── FrontEnd/         # Code source de l'application cliente (React)
│   ├── src/
│   │   ├── api/      # Configuration Axios
│   │   ├── context/  # Contexte global (Auth & Workspace)
│   │   ├── pages/    # Composants pages (Dashboard, Tickets, Login, etc.)
│   │   └── routes/   # Système de routage sécurisé (AppRoutes.jsx)
│   └── package.json  # Dépendances Node.js
│
└── README.md         # Documentation principale du dépôt
```

---

## ⚙️ Installation & Configuration

### Prérequis
* PHP `>= 8.1` & Composer
* Node.js & NPM
* Serveur MySQL (ex: Laragon, XAMPP ou MySQL local)

---

### 1. Configuration du Backend (Laravel)

1. Accédez au dossier `Backend` :
   ```bash
   cd Backend
   ```

2. Installez les dépendances PHP :
   ```bash
   composer install
   ```

3. Créez et configurez le fichier d'environnement `.env` :
   ```bash
   copy .env.example .env
   ```
   *Ouvrez le fichier `.env` et configurez vos accès à la base de données MySQL ainsi que votre clé Gemini :*
   ```ini
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=smart_support
   DB_USERNAME=root
   DB_PASSWORD=
   
   GEMINI_API_KEY=votre_cle_api_gemini
   ```

4. Générez la clé de chiffrement de l'application et la clé JWT :
   ```bash
   php artisan key:generate
   php artisan jwt:secret
   ```

5. Exécutez les migrations de base de données pour créer les tables :
   ```bash
   php artisan migrate
   ```

6. Lancez le serveur de développement :
   ```bash
   php artisan serve
   ```
   *Le serveur Laravel sera accessible sur `http://127.0.0.1:8000`.*

---

### 2. Configuration du Frontend (React)

1. Accédez au dossier `FrontEnd` :
   ```bash
   cd ../FrontEnd
   ```

2. Installez les paquets Node.js :
   ```bash
   npm install
   ```

3. Lancez l'application en mode développement :
   ```bash
   npm run dev
   ```
   *L'interface utilisateur React sera lancée sur `http://localhost:5173` (ou le port indiqué dans votre console).*

---

## 📈 Indicateurs de Performance (KPIs)

Afin d'aider l'équipe d'administration à évaluer la réactivité du support, SmartSupport calcule le **Temps Moyen de Résolution (TMR)**. 
Lorsqu'un administrateur bascule l'état d'un ticket vers `resolved`, le système calcule dynamiquement la durée écoulée depuis sa création :

$$\text{TMR} = \frac{\sum (\text{resolved\_at} - \text{created\_at})}{\text{Nombre total de tickets résolus}}$$

Ces métriques s'affichent instantanément dans le composant de performance de l'administrateur, offrant une visibilité claire sur l'efficacité globale du support technique.
