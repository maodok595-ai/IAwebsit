# Guide de Déploiement sur Render

## Configuration Automatique

Ce projet est configuré pour un déploiement automatique sur Render via le fichier `render.yaml`.

## Étapes de Déploiement

### 1. Préparer votre repository GitHub

Assurez-vous que votre code est poussé sur GitHub:

```bash
git add .
git commit -m "Prêt pour le déploiement"
git push origin main
```

### 2. Créer un service sur Render

1. Allez sur [render.com](https://render.com) et connectez-vous
2. Cliquez sur **"New +"** → **"Web Service"**
3. Connectez votre repository GitHub
4. Render détectera automatiquement le fichier `render.yaml`

### 3. Configuration des Variables d'Environnement

Dans le dashboard Render, configurez ces variables:

#### **Variables Obligatoires:**

- `DATABASE_URL` - URL de connexion PostgreSQL
  - Format: `postgresql://user:password@host:port/database`
  - Vous pouvez créer une base de données PostgreSQL gratuite sur Render
  
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - URL de l'API OpenAI
  - Exemple: `https://api.openai.com/v1`
  
- `AI_INTEGRATIONS_OPENAI_API_KEY` - Clé API OpenAI
  - Obtenez-la depuis [platform.openai.com](https://platform.openai.com)

#### **Variables Auto-Générées:**

- `SESSION_SECRET` - Généré automatiquement par Render
- `NODE_ENV` - Défini automatiquement à `production`

### 4. Build et Start Commands

Ces commandes sont déjà configurées dans `render.yaml`:

- **Build Command**: `npm install && npm run build`
  - Installe les dépendances
  - Compile le frontend (Vite)
  - Compile le backend (esbuild)

- **Start Command**: `npm start`
  - Lance le serveur en mode production
  - Sert les fichiers statiques depuis `dist/public`

## Configuration Manuelle (Alternative)

Si vous préférez configurer manuellement sans `render.yaml`:

### Paramètres du Service

| Paramètre | Valeur |
|-----------|--------|
| **Name** | `codestudio` (ou votre choix) |
| **Environment** | `Node` |
| **Region** | Choisissez la région la plus proche |
| **Branch** | `main` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

### Instance Type

- **Free Tier**: Gratuit mais le service s'endort après 15 minutes d'inactivité
- **Starter**: $7/mois - Toujours actif, plus de ressources

## Créer une Base de Données PostgreSQL sur Render

1. Dans Render, cliquez sur **"New +"** → **"PostgreSQL"**
2. Choisissez un nom (ex: `codestudio-db`)
3. Sélectionnez **"Free"** ou un plan payant
4. Cliquez sur **"Create Database"**
5. Copiez l'**Internal Database URL**
6. Ajoutez-la comme variable `DATABASE_URL` dans votre Web Service

## Post-Déploiement

### Vérifier le Déploiement

1. Attendez que le build se termine (5-10 minutes)
2. Visitez l'URL fournie: `https://codestudio-xxxx.onrender.com`
3. Vérifiez que l'écran de sélection de mode s'affiche

### Initialiser la Base de Données

Si nécessaire, vous pouvez pousser le schéma de la base de données:

```bash
npm run db:push
```

### Logs et Debugging

- **Logs en temps réel**: Dashboard Render → Logs
- **Shell Access**: Dashboard Render → Shell (plans payants)

## Structure de l'Application

```
/dist
  /public         # Frontend compilé (Vite)
  index.js        # Backend compilé (esbuild)
```

## Troubleshooting

### Build Failed

- Vérifiez les logs de build dans Render
- Assurez-vous que toutes les dépendances sont dans `package.json`
- Vérifiez que Node.js version 18+ est supportée

### Application ne démarre pas

- Vérifiez que `DATABASE_URL` est correctement configurée
- Vérifiez que `AI_INTEGRATIONS_OPENAI_API_KEY` est définie
- Consultez les logs de runtime dans le dashboard

### Base de données inaccessible

- Vérifiez que vous utilisez l'**Internal Database URL** (pas External)
- Format: `postgresql://username:password@hostname/database`

### Temps de réponse lent (Free Tier)

- Les services gratuits s'endorment après 15 minutes
- Premier accès prend 30-60 secondes pour "réveiller" le service
- Solution: Passez à un plan Starter ($7/mois)

## Optimisations Production

### Variables d'environnement recommandées

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
SESSION_SECRET=<généré automatiquement>
```

### Performance

- Utilise esbuild pour un build rapide
- Frontend servi comme fichiers statiques
- Compression activée en production

## Support

- Documentation Render: [render.com/docs](https://render.com/docs)
- Support Render: [render.com/support](https://render.com/support)

## Coûts Estimés

| Service | Plan | Prix |
|---------|------|------|
| Web Service | Free | $0/mois |
| Web Service | Starter | $7/mois |
| PostgreSQL | Free (90 jours) | $0 |
| PostgreSQL | Starter | $7/mois |

**Note**: Le plan gratuit a des limitations:
- Service s'endort après 15 minutes d'inactivité
- 750 heures/mois (suffisant pour un service)
- Base de données gratuite expire après 90 jours
