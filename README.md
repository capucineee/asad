# Site de l'ASAD – Association des Animaux en Détresse

Node 22.5+ requis (base SQLite intégrée, aucune autre installation).

    npm install
    npm start            # http://localhost:3000  (PORT=xxxx pour changer)
    npm run seed         # (optionnel) contenu de démonstration

- Espace bénévoles : `/admin`. Au 1er lancement, un compte est créé et son mot de passe s'affiche dans la console
  (ou définissez ADMIN_EMAIL / ADMIN_PASSWORD avant le 1er lancement).
- En production : `NODE_ENV=production`, derrière HTTPS. Données et photos dans `data/` (à sauvegarder ; DATA_DIR pour le déplacer).
