# secret-bafa

Secret BAFA — application React + TypeScript + Vite + Tailwind, backend Firebase Firestore.

## Fonctionnalites

- **Multi-tenancy** : une sous-collection Firestore par session de formation (`formations/{fid}/...`)
- **Mots de passe securises** : hash SHA-256 + salt aleatoire par utilisateur (Web Crypto API)
- Connexion par code de formation, creation de formation depuis l'ecran d'auth

## Developpement local

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de production dans dist/
npm run typecheck  # verification TypeScript
```

## Deploiement Docker Compose (VPS)

```bash
docker compose up -d --build
```

Par defaut, l'app est servie sur le port `8080`. Modifie via la variable `PORT` :

```bash
PORT=80 docker compose up -d --build
```

L'image multi-stage build Vite avec `node:20-alpine` puis sert les fichiers statiques
avec `nginx:alpine`. Fallback SPA configure dans `nginx.conf`.

## Regles Firestore

Les donnees vivent sous `formations/{fid}/{collection}`. Prevois des regles
qui verifient `fid` et le hash des mots de passe cote document.
