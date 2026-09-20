# Site de l'ASAD – Association des Animaux en Détresse

Node 22.5+ requis (base SQLite intégrée, aucune autre installation).

    npm install
    npm start            # http://localhost:3000  (PORT=xxxx pour changer)
    npm run seed         # (optionnel) contenu de démonstration

- Espace bénévoles : `/admin`. Au 1er lancement, un compte est créé et son mot de passe s'affiche dans la console
  (ou définissez ADMIN_EMAIL / ADMIN_PASSWORD avant le 1er lancement).
- En production : `NODE_ENV=production`, derrière HTTPS. Données et photos dans `data/` (à sauvegarder ; DATA_DIR pour le déplacer).

## Mise en ligne sur Railway

1. **New Project → Deploy from GitHub repo** → choisir ce dépôt.
2. Dans le service, onglet **Variables**, ajouter :
   - `NODE_ENV` = `production`
   - `DATA_DIR` = `/data`
   - `ADMIN_EMAIL` = l'e-mail du premier compte administrateur
   - `ADMIN_PASSWORD` = un mot de passe solide (8 caractères minimum ; à changer ensuite dans Comptes)
3. **Volume (indispensable)** : clic droit sur le service (ou `Ctrl/Cmd+K` → *Volume*) → *Attach volume*, point de montage **`/data`**.
   Sans volume, la base et les photos sont effacées à chaque déploiement.
4. Onglet **Settings → Networking → Generate Domain** pour obtenir l'adresse publique (ou *Custom Domain* pour votre nom de domaine).
5. Ne pas dépasser **1 réplica** (base SQLite sur un seul disque).

Le site démarre vide : aucun contenu de démonstration n'est déployé. Sauvegardez régulièrement le volume `/data`.
