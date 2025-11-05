# CodeStudio - IDE Web avec Intelligence Artificielle

CodeStudio est un environnement de développement intégré (IDE) basé sur le web avec assistance IA. Créez des sites web complets en utilisant soit l'IA conversationnelle, soit l'éditeur de code traditionnel.

## 🚀 Fonctionnalités

### Deux Modes de Développement

- **Mode IA** - Interface conversationnelle où l'IA crée des sites complets à partir de descriptions
- **Mode Éditeur Manuel** - Éditeur Monaco (VS Code) pour coder manuellement

### Caractéristiques Principales

- ✨ Assistant IA intégré (OpenAI)
- 📝 Éditeur Monaco avec coloration syntaxique
- 👁️ Aperçu en temps réel
- 📁 Gestionnaire de fichiers
- 🎨 Support HTML, CSS, JavaScript
- 📱 Design responsive (mobile & desktop)
- 🌓 Mode sombre/clair
- 💾 Persistance en base de données

## 🛠️ Stack Technique

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build
- **Monaco Editor** (éditeur de VS Code)
- **TailwindCSS** pour le styling
- **shadcn/ui** pour les composants
- **TanStack Query** pour la gestion d'état

### Backend
- **Node.js** avec Express
- **TypeScript**
- **Drizzle ORM** pour la base de données
- **PostgreSQL** (Neon)
- **OpenAI API** pour l'IA

## 📦 Installation Locale

### Prérequis

- Node.js 18 ou supérieur
- npm 9 ou supérieur
- PostgreSQL (ou compte Neon)
- Clé API OpenAI

### Configuration

1. Clonez le repository
```bash
git clone <votre-repo>
cd codestudio
```

2. Installez les dépendances
```bash
npm install
```

3. Configurez les variables d'environnement

Créez un fichier `.env` basé sur `.env.example`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/codestudio
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
AI_INTEGRATIONS_OPENAI_API_KEY=sk-votre-clé-api
SESSION_SECRET=votre-secret-de-session
NODE_ENV=development
PORT=5000
```

4. Initialisez la base de données
```bash
npm run db:push
```

5. Lancez l'application
```bash
npm run dev
```

6. Ouvrez votre navigateur à `http://localhost:5000`

## 🚀 Déploiement sur Render

### Commandes de Déploiement

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

### Configuration Rapide

1. Poussez votre code sur GitHub
2. Créez un compte sur [render.com](https://render.com)
3. Créez un nouveau "Web Service"
4. Connectez votre repository
5. Render détectera automatiquement `render.yaml`
6. Configurez les variables d'environnement:
   - `DATABASE_URL`
   - `AI_INTEGRATIONS_OPENAI_API_KEY`
   - `AI_INTEGRATIONS_OPENAI_BASE_URL`
7. Déployez!

Pour plus de détails, consultez [DEPLOYMENT.md](./DEPLOYMENT.md) et [RENDER_COMMANDS.md](./RENDER_COMMANDS.md).

## 📖 Utilisation

### Mode IA

1. Sélectionnez "Mode IA" à l'écran d'accueil
2. Décrivez le site web que vous voulez créer
3. L'IA génère tous les fichiers nécessaires
4. Visualisez le résultat dans l'aperçu
5. Basculez vers le Mode Éditeur pour affiner

### Mode Éditeur Manuel

1. Sélectionnez "Mode Éditeur" à l'écran d'accueil
2. Utilisez l'explorateur de fichiers pour naviguer
3. Éditez le code dans Monaco Editor
4. Cliquez sur "Run Code" pour voir l'aperçu
5. Utilisez l'assistant IA pour obtenir de l'aide

## 🗂️ Structure du Projet

```
codestudio/
├── client/               # Frontend React
│   └── src/
│       ├── components/  # Composants réutilisables
│       ├── pages/       # Pages de l'application
│       ├── lib/         # Utilitaires
│       └── App.tsx      # Composant racine
├── server/              # Backend Express
│   ├── index.ts         # Point d'entrée
│   ├── routes.ts        # Routes API
│   ├── storage.ts       # Interface de stockage
│   └── lib/             # Bibliothèques serveur
├── shared/              # Code partagé
│   └── schema.ts        # Schémas Zod
├── render.yaml          # Configuration Render
└── package.json         # Dépendances
```

## 🔧 Scripts Disponibles

```bash
npm run dev        # Développement avec hot reload
npm run build      # Build production
npm start          # Démarrer en production
npm run check      # Vérification TypeScript
npm run db:push    # Pousser schéma DB
```

## 🌐 Variables d'Environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `DATABASE_URL` | URL PostgreSQL | Oui |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Clé API OpenAI | Oui |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | URL API OpenAI | Oui |
| `SESSION_SECRET` | Secret pour sessions | Oui |
| `NODE_ENV` | Environnement (development/production) | Oui |
| `PORT` | Port serveur (défaut: 5000) | Non |

## 📝 API Endpoints

### Fichiers
- `GET /api/workspace/files/:projectId` - Liste des fichiers
- `POST /api/workspace/files` - Créer un fichier
- `PATCH /api/workspace/files/:id` - Modifier un fichier
- `DELETE /api/workspace/files/:id` - Supprimer un fichier

### IA
- `POST /api/ai/chat` - Conversation avec l'IA

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT

## 🆘 Support

- Documentation complète: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Commandes Render: [RENDER_COMMANDS.md](./RENDER_COMMANDS.md)
- Exemples d'environnement: [.env.example](./.env.example)

## 🎯 Roadmap

- [x] Éditeur de code Monaco
- [x] Aperçu en temps réel
- [x] Assistant IA
- [x] Mode IA conversationnel
- [x] Design responsive
- [ ] Persistance automatique des fichiers IA
- [ ] Support multi-projets
- [ ] Collaboration en temps réel
- [ ] Export de projets
- [ ] Thèmes personnalisés

---

Développé avec ❤️ pour rendre le développement web accessible à tous.
