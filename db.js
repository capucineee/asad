const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const UPLOADS = path.join(DATA_DIR, 'uploads');
// Le dossier de données doit exister et être accessible en écriture, sinon rien ne peut être enregistré
try {
  fs.mkdirSync(UPLOADS, { recursive: true });
  fs.accessSync(DATA_DIR, fs.constants.W_OK);
} catch (e) {
  console.error('\n──────────────────────────────────────────────');
  console.error(' LE SITE NE PEUT PAS DÉMARRER');
  console.error(` Impossible d'écrire dans le dossier : ${DATA_DIR}`);
  console.error('');
  console.error(' Sur Railway : un volume doit être rattaché au service,');
  console.error(' avec un point de montage EXACTEMENT identique à la');
  console.error(' variable DATA_DIR (par exemple /data pour les deux).');
  console.error(' Sans volume, supprimez la variable DATA_DIR.');
  console.error('');
  console.error(` Détail technique : ${e.message}`);
  console.error('──────────────────────────────────────────────\n');
  process.exit(1);
}

const db = new DatabaseSync(path.join(DATA_DIR, 'asad.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS animals (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('chien','chat')),
  sex TEXT NOT NULL DEFAULT 'inconnu',
  age TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  photo TEXT,
  distress INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'disponible',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'Bons réflexes',
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  cover TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS stories (
  id INTEGER PRIMARY KEY,
  pet_name TEXT NOT NULL,
  species TEXT NOT NULL DEFAULT 'chien' CHECK (species IN ('chien','chat')),
  adopter TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  photo TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS guestbook (
  id INTEGER PRIMARY KEY,
  author TEXT NOT NULL,
  message TEXT NOT NULL,
  approved INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);
`);

// Migrations légères (bases créées avant ces colonnes)
const storyCols = db.prepare('PRAGMA table_info(stories)').all().map((c) => c.name);
if (!storyCols.includes('animal_id')) db.exec('ALTER TABLE stories ADD COLUMN animal_id INTEGER REFERENCES animals(id) ON DELETE SET NULL');
if (!storyCols.includes('pending')) db.exec('ALTER TABLE stories ADD COLUMN pending INTEGER NOT NULL DEFAULT 0');

const adminCols = db.prepare('PRAGMA table_info(admins)').all().map((c) => c.name);
if (!adminCols.includes('role')) db.exec("ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'admin'");
// Il doit toujours exister au moins un super admin : le compte le plus ancien le devient si besoin
if (!db.prepare("SELECT 1 FROM admins WHERE role = 'super'").get()) {
  db.exec("UPDATE admins SET role = 'super' WHERE id = (SELECT MIN(id) FROM admins)");
}

const DEFAULT_SETTINGS = {
  hero_title: 'Chaque chien et chaque chat mérite une famille',
  hero_text:
    "L'ASAD recueille, soigne et replace les animaux en détresse. Découvrez ceux qui attendent une main tendue, ou aidez-nous à en sauver d'autres.",
  email: 'asad13@wanadoo.fr',
  phone: '06 63 39 05 29',
  address: '',
  facebook: '',
  instagram: '',
  donation_link: '',
};
for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
  db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)').run(k, v);
}

function getSettings() {
  const out = {};
  for (const r of db.prepare('SELECT key, value FROM settings').all()) out[r.key] = r.value;
  return out;
}

function setSetting(key, value) {
  db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(key, value);
}

// --- mots de passe (scrypt, sans dépendance native) ---
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(pw, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(pw, salt, 64);
  const ref = Buffer.from(hash, 'hex');
  return ref.length === test.length && crypto.timingSafeEqual(ref, test);
}

// Premier lancement : création d'un compte administrateur
function ensureFirstAdmin() {
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM admins').get();
  if (n > 0) return;
  const email = (process.env.ADMIN_EMAIL || 'admin@asad.fr').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(5).toString('hex');
  // Nom affiché : ADMIN_NAME, sinon le début de l'adresse e-mail (modifiable ensuite dans Comptes)
  const local = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
  const name = process.env.ADMIN_NAME || (local ? local[0].toUpperCase() + local.slice(1) : 'Administrateur');
  db.prepare("INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, 'super')").run(
    name,
    email,
    hashPassword(password)
  );
  console.log('\n──────────────────────────────────────────────');
  console.log(' Premier compte administrateur créé');
  console.log(`   Adresse e-mail : ${email}`);
  console.log(`   Mot de passe   : ${password}`);
  console.log(' (à changer depuis Administration > Comptes)');
  console.log('──────────────────────────────────────────────\n');
}
ensureFirstAdmin();

function slugify(s) {
  return (
    String(s)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 70) || 'article'
  );
}
function uniqueSlug(title, ignoreId = 0) {
  const base = slugify(title);
  let slug = base;
  let i = 2;
  while (db.prepare('SELECT 1 FROM posts WHERE slug = ? AND id != ?').get(slug, ignoreId)) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

module.exports = { db, UPLOADS, DATA_DIR, getSettings, setSetting, hashPassword, verifyPassword, uniqueSlug };
