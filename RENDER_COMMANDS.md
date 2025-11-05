# Commandes de Déploiement Render

## Configuration Rapide

### Build Command (Commande de construction)
```bash
npm install && npm run build
```

**Cette commande:**
1. Installe toutes les dépendances Node.js
2. Compile le frontend React avec Vite
3. Compile le backend Express/TypeScript avec esbuild
4. Génère le dossier `dist/` prêt pour la production

### Start Command (Commande de démarrage)
```bash
npm start
```

**Cette commande:**
- Lance le serveur Express en mode production
- Sert les fichiers statiques compilés
- Écoute sur le port fourni par Render (`process.env.PORT`)

## Variables d'Environnement Requises

Configurez ces variables dans le dashboard Render:

```
DATABASE_URL=postgresql://user:password@host:port/database
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
AI_INTEGRATIONS_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
SESSION_SECRET=<généré automatiquement par Render>
NODE_ENV=production
```

## Configuration dans Render Dashboard

### Option 1: Utiliser render.yaml (Recommandé)

Le fichier `render.yaml` est déjà configuré. Render le détectera automatiquement lors de la connexion de votre repository.

### Option 2: Configuration Manuelle

Si vous configurez manuellement dans le dashboard:

| Champ | Valeur |
|-------|--------|
| **Environment** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Node Version** | 18 ou supérieur |

## Scripts package.json Existants

Les scripts suivants sont déjà configurés:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  }
}
```

## Checklist Pré-Déploiement

- [ ] Code poussé sur GitHub
- [ ] Fichier `render.yaml` présent
- [ ] Variables d'environnement configurées dans Render
- [ ] Base de données PostgreSQL créée (si nécessaire)
- [ ] Clé API OpenAI disponible

## Architecture de Production

```
CodeStudio (Web Service)
├── Frontend compilé → dist/public/
├── Backend compilé → dist/index.js
└── PostgreSQL Database (service séparé)
```

## Première Connexion après Déploiement

1. Render construit votre application (5-10 min)
2. L'application démarre automatiquement
3. URL accessible: `https://your-app-name.onrender.com`
4. Les fichiers par défaut seront créés au premier lancement

## Commandes Post-Déploiement

### Pousser le Schéma de Base de Données

Si vous devez initialiser ou mettre à jour le schéma:

```bash
# En local, avec DATABASE_URL configurée
npm run db:push
```

### Vérifier les Logs

- Dashboard Render → Onglet "Logs"
- Les erreurs apparaîtront en temps réel

## Résumé des Fichiers Créés

| Fichier | Description |
|---------|-------------|
| `render.yaml` | Configuration automatique pour Render |
| `DEPLOYMENT.md` | Guide complet de déploiement |
| `.env.example` | Exemple de variables d'environnement |
| `RENDER_COMMANDS.md` | Ce fichier - référence rapide |

## Support

Pour plus de détails, consultez `DEPLOYMENT.md` qui contient le guide complet.
