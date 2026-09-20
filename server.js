const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cookieSession = require('cookie-session');
const multer = require('multer');
const heicConvert = require('heic-convert');
const { db, UPLOADS, DATA_DIR, getSettings, setSetting, hashPassword, verifyPassword, uniqueSlug } = require('./db');

const app = express();
const PROD = process.env.NODE_ENV === 'production';
if (PROD) app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');

// Numéro de version des fichiers css/js : force le navigateur à recharger
// ses fichiers dès qu'ils changent, au lieu de garder une version périmée.
const assetVersion = (() => {
  try {
    const stamps = ['public/css/style.css', 'public/js/site.js'].map((p) => fs.statSync(path.join(__dirname, p)).mtimeMs);
    return crypto.createHash('sha1').update(stamps.join('|')).digest('hex').slice(0, 8);
  } catch {
    return String(Date.now());
  }
})();

// ---------- secret de session persistant ----------
const secretFile = path.join(DATA_DIR, '.secret');
if (!fs.existsSync(secretFile)) fs.writeFileSync(secretFile, crypto.randomBytes(32).toString('hex'), { mode: 0o600 });
const SECRET = process.env.SESSION_SECRET || fs.readFileSync(secretFile, 'utf8');

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  next();
});
app.get('/health', (req, res) => res.type('text').send('ok')); // contrôle de santé (hébergeur)
app.use('/uploads', express.static(UPLOADS, { maxAge: '7d' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: PROD ? '1d' : 0 }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(
  cookieSession({
    name: 'asad_session',
    keys: [SECRET],
    maxAge: 365 * 24 * 3600 * 1000, // la connexion reste valable un an, prolongée à chaque visite
    httpOnly: true,
    sameSite: 'lax',
    secure: PROD,
  })
);

// ---------- helpers ----------
const fdate = (d) =>
  new Date(d.replace(' ', 'T') + 'Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const clean = (v, max = 200) => String(v ?? '').trim().slice(0, max);

// Texte simple -> HTML : paragraphes, "## Titre", "- liste"
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function formatContent(text) {
  const blocks = String(text).replace(/\r/g, '').split(/\n{2,}/);
  return blocks
    .map((b) => {
      const lines = b.split('\n').filter((l) => l.trim());
      if (!lines.length) return '';
      if (lines.every((l) => /^\s*[-•]\s+/.test(l)))
        return '<ul>' + lines.map((l) => `<li>${esc(l.replace(/^\s*[-•]\s+/, ''))}</li>`).join('') + '</ul>';
      if (/^##\s+/.test(lines[0])) {
        const rest = lines.slice(1).map(esc).join('<br>');
        return `<h2>${esc(lines[0].replace(/^##\s+/, ''))}</h2>` + (rest ? `<p>${rest}</p>` : '');
      }
      return '<p>' + lines.map(esc).join('<br>') + '</p>';
    })
    .join('\n');
}

// ---------- comptage des animaux ----------
// Une annonce en duo représente DEUX animaux : on compte les têtes, pas les annonces.
const HEADS = "CASE WHEN is_pair = 1 AND name2 != '' THEN 2 ELSE 1 END";
const countHeads = (where) => db.prepare(`SELECT COALESCE(SUM(${HEADS}), 0) AS n FROM animals WHERE ${where}`).get().n;
// Un animal est « adopté » s'il est marqué comme tel, ou s'il a une histoire d'adoption
// publiée. On ne compte pas deux fois ceux qui sont dans les deux cas.
const countAdopted = () =>
  countHeads("status = 'adopte'") +
  db.prepare(
    `SELECT COUNT(*) AS n FROM stories s
     WHERE s.published = 1
       AND NOT EXISTS (SELECT 1 FROM animals a WHERE a.id = s.animal_id AND a.status = 'adopte')`
  ).get().n;

// ---------- partage sur les réseaux sociaux ----------
// Facebook a besoin d'adresses complètes (https://…) pour afficher une vignette
const absUrl = (req, p) => `${req.protocol}://${req.get('host')}${p}`;
const plain = (t, n = 200) => {
  const clean = String(t || '').replace(/\s+/g, ' ').trim();
  return clean.length > n ? clean.slice(0, n - 1).trim() + '…' : clean;
};

// ---------- affichage des animaux (un seul, ou un duo inséparable) ----------
const sexLabel = (species, sex) =>
  species === 'chat' ? (sex === 'femelle' ? 'Chatte' : 'Chat') : sex === 'femelle' ? 'Chienne' : 'Chien';
const isPair = (a) => !!(a.is_pair && a.name2);
const petName = (a) => (isPair(a) ? `${a.name} & ${a.name2}` : a.name);
const animalMeta = (a) => {
  if (!isPair(a)) return sexLabel(a.species, a.sex) + (a.age ? ` · ${a.age}` : '');
  const count = { chien: 0, chat: 0 };
  count[a.species] = (count[a.species] || 0) + 1;
  count[a.species2] = (count[a.species2] || 0) + 1;
  const parts = [];
  if (count.chien) parts.push(count.chien > 1 ? '2 chiens' : '1 chien');
  if (count.chat) parts.push(count.chat > 1 ? '2 chats' : '1 chat');
  return 'Duo inséparable · ' + parts.join(' et ');
};

// ---------- variables communes aux vues ----------
app.use((req, res, next) => {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(16).toString('hex');
  res.locals.csrf = req.session.csrf;
  res.locals.settings = getSettings();
  res.locals.path = req.path;
  res.locals.flash = req.session.flash || null;
  req.session.flash = null;
  res.locals.admin = null;
  if (req.session.adminId) {
    const a = db.prepare('SELECT id, name, email, role FROM admins WHERE id = ?').get(req.session.adminId);
    if (a) {
      res.locals.admin = req.admin = a;
      // Connexion glissante : tant que la personne revient, elle n'a pas à ressaisir son mot de passe.
      // On ne rafraîchit qu'une fois par jour, pour ne pas renvoyer le cookie à chaque page.
      const now = Date.now();
      if (!req.session.vu || now - req.session.vu > 24 * 3600 * 1000) req.session.vu = now;
    } else {
      req.session = null;
    }
  }
  res.locals.assetVersion = assetVersion;
  res.locals.absUrl = (p) => absUrl(req, p);
  res.locals.og = null;
  res.locals.petName = petName;
  res.locals.animalMeta = animalMeta;
  res.locals.sexLabel = sexLabel;
  res.locals.fdate = fdate;
  res.locals.formatContent = formatContent;
  next();
});

function csrfOk(req) {
  const t = Buffer.from(String(req.body?._csrf || ''));
  const s = Buffer.from(String(req.session.csrf || ''));
  return t.length === s.length && crypto.timingSafeEqual(t, s);
}
// Vérifie le jeton sur tous les POST non-multipart ; les routes avec fichier appellent checkCsrf après multer
app.use((req, res, next) => {
  if (req.method === 'POST' && !(req.headers['content-type'] || '').startsWith('multipart/') && !csrfOk(req)) {
    return res.status(403).render('error', { title: 'Session expirée', message: 'Votre session a expiré. Rechargez la page et réessayez.' });
  }
  next();
});
function checkCsrf(req, res, next) {
  if (csrfOk(req)) return next();
  if (req.file) fs.unlink(req.file.path, () => {});
  res.status(403).render('error', { title: 'Session expirée', message: 'Votre session a expiré. Rechargez la page et réessayez.' });
}
const flash = (req, type, text, link) => (req.session.flash = { type, text, link });

// petit limiteur en mémoire (par IP)
const hits = new Map();
function limit(name, max, windowMs) {
  return (req, res, next) => {
    const key = `${name}:${req.ip}`;
    const now = Date.now();
    const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (arr.length >= max) return res.status(429).render('error', { title: 'Doucement !', message: 'Trop de tentatives. Réessayez dans quelques minutes.' });
    arr.push(now);
    hits.set(key, arr);
    next();
  };
}
setInterval(() => hits.clear(), 3600 * 1000).unref();

// ---------- envoi de photos ----------
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/heic': '.heic', 'image/heif': '.heic' };
// Les iPhone envoient des photos HEIC, parfois sans type MIME : on se fie aussi à l'extension
const extOf = (file) => EXT[file.mimetype] || (/\.(heic|heif)$/i.test(file.originalname || '') ? '.heic' : null);
const uploader = multer({
  storage: multer.diskStorage({
    destination: UPLOADS,
    filename: (req, file, cb) => cb(null, crypto.randomBytes(12).toString('hex') + extOf(file)),
  }),
  limits: { fileSize: 12 * 1024 * 1024, files: 2 },
  fileFilter: (req, file, cb) => cb(null, !!extOf(file)),
});
const isHeic = (file) => {
  const b = Buffer.alloc(12);
  const fd = fs.openSync(file.path, 'r');
  fs.readSync(fd, b, 0, 12, 0);
  fs.closeSync(fd);
  return b.subarray(4, 8).toString() === 'ftyp' && /^(heic|heix|hevc|hevx|heim|heis|mif1|msf1)/.test(b.subarray(8, 12).toString());
};
// Convertit une photo HEIC (iPhone) en JPG ; sinon ne touche à rien
async function convertHeic(file) {
  if (!file || !isHeic(file)) return true;
  try {
    const jpg = await heicConvert({ buffer: fs.readFileSync(file.path), format: 'JPEG', quality: 0.86 });
    const name = crypto.randomBytes(12).toString('hex') + '.jpg';
    fs.writeFileSync(path.join(UPLOADS, name), Buffer.from(jpg));
    fs.unlink(file.path, () => {});
    Object.assign(file, { filename: name, path: path.join(UPLOADS, name), mimetype: 'image/jpeg' });
    return true;
  } catch (e) {
    console.error('HEIC:', e.message);
    fs.unlink(file.path, () => {});
    return false;
  }
}
const upload = (field) => (req, res, next) =>
  uploader.single(field)(req, res, async (err) => {
    const back = req.get('referer') || (req.originalUrl.startsWith('/admin') ? '/admin' : '/histoires');
    if (err) {
      flash(req, 'error', err.code === 'LIMIT_FILE_SIZE' ? 'La photo est trop lourde (12 Mo maximum).' : "La photo n'a pas pu être envoyée.");
      return res.redirect(back);
    }
    if (!(await convertHeic(req.file))) {
      flash(req, 'error', 'Cette photo n’a pas pu être lue. Essayez de la reprendre ou d’en choisir une autre.');
      return res.redirect(back);
    }
    next();
  });
// Variante pour un formulaire qui porte plusieurs photos (annonce en duo)
const uploadMany = (names) => (req, res, next) =>
  uploader.fields(names.map((name) => ({ name, maxCount: 1 })))(req, res, async (err) => {
    const back = req.get('referer') || '/admin/animaux';
    if (err) {
      flash(req, 'error', err.code === 'LIMIT_FILE_SIZE' ? 'Une photo est trop lourde (12 Mo maximum).' : "La photo n'a pas pu être envoyée.");
      return res.redirect(back);
    }
    for (const n of names) {
      const file = req.files?.[n]?.[0];
      if (file && !(await convertHeic(file))) {
        flash(req, 'error', 'Cette photo n’a pas pu être lue. Essayez de la reprendre ou d’en choisir une autre.');
        return res.redirect(back);
      }
    }
    next();
  });
function removeFile(name) {
  if (name && /^[a-f0-9]+\.(jpg|png|webp)$/.test(name)) fs.unlink(path.join(UPLOADS, name), () => {});
}
// Vérifie qu'un fichier envoyé est bien une image (signature), sinon le supprime
function validImage(file) {
  if (!file) return true;
  const b = Buffer.alloc(12);
  const fd = fs.openSync(file.path, 'r');
  fs.readSync(fd, b, 0, 12, 0);
  fs.closeSync(fd);
  const ok =
    (b[0] === 0xff && b[1] === 0xd8) ||
    b.subarray(0, 4).toString('hex') === '89504e47' ||
    (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP');
  if (!ok) fs.unlink(file.path, () => {});
  return ok;
}

// =====================================================================
//  SITE PUBLIC
// =====================================================================
app.get('/', (req, res) => {
  const animals = db.prepare("SELECT * FROM animals WHERE status != 'adopte' ORDER BY distress DESC, created_at DESC LIMIT 6").all();
  const posts = db.prepare('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3').all();
  const stories = db.prepare('SELECT * FROM stories WHERE published = 1 ORDER BY created_at DESC LIMIT 3').all();
  const messages = db.prepare('SELECT * FROM guestbook WHERE approved = 1 ORDER BY created_at DESC LIMIT 3').all();
  const stats = {
    adopted: countAdopted(),
    waiting: countHeads("status != 'adopte'"),
    distress: countHeads("distress = 1 AND status != 'adopte'"),
  };
  res.render('home', { title: null, animals, posts, stories, messages, stats });
});

app.get('/animaux', (req, res) => {
  const filter = ['chien', 'chat', 'detresse'].includes(req.query.filtre) ? req.query.filtre : 'tous';
  let where = '1=1';
  if (filter === 'chien' || filter === 'chat') where = `(species = '${filter}' OR (is_pair = 1 AND species2 = '${filter}'))`;
  if (filter === 'detresse') where = "distress = 1 AND status != 'adopte'";
  const animals = db
    .prepare(`SELECT * FROM animals WHERE ${where} ORDER BY (status = 'adopte'), distress DESC, created_at DESC`)
    .all();
  res.render('animals', { title: 'Nos animaux', animals, filter });
});

app.get('/animaux/:id', (req, res, next) => {
  const animal = db.prepare('SELECT * FROM animals WHERE id = ?').get(Number(req.params.id));
  if (!animal) return next();
  const story = db.prepare('SELECT id, title FROM stories WHERE animal_id = ? AND published = 1 ORDER BY created_at DESC').get(animal.id);
  res.render('animal', {
    title: petName(animal),
    animal,
    story,
    og: {
      type: 'article',
      title: `${petName(animal)} ${isPair(animal) ? 'cherchent' : 'cherche'} une famille`,
      description: plain(animal.description) || `${petName(animal)} ${isPair(animal) ? 'attendent' : 'attend'} une famille. Découvrez ${isPair(animal) ? 'leur' : 'sa'} fiche sur le site de l'ASAD.`,
      image: animal.photo,
    },
  });
});

app.get('/blog', (req, res) => {
  const posts = db.prepare('SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC').all();
  res.render('blog', { title: 'Le blog', posts });
});
app.get('/blog/:slug', (req, res, next) => {
  const post = db.prepare('SELECT * FROM posts WHERE slug = ? AND published = 1').get(req.params.slug);
  if (!post) return next();
  const more = db.prepare('SELECT * FROM posts WHERE published = 1 AND id != ? ORDER BY created_at DESC LIMIT 2').all(post.id);
  res.render('post', {
    title: post.title,
    post,
    more,
    og: { type: 'article', title: post.title, description: plain(post.excerpt || post.content), image: post.cover },
  });
});

app.get('/histoires', (req, res) => {
  const stories = db.prepare('SELECT * FROM stories WHERE published = 1 ORDER BY created_at DESC').all();
  res.render('stories', { title: 'Histoires d’adoption', stories });
});
app.get('/histoires/proposer', (req, res) => res.render('story-propose', { title: 'Raconter mon histoire' }));
app.post('/histoires/proposer', limit('story', 3, 3600 * 1000), upload('photo'), checkCsrf, (req, res) => {
  const b = req.body;
  const back = () => res.redirect('/histoires/proposer');
  if (b.website) {
    if (req.file) removeFile(req.file.filename);
    return res.redirect('/histoires'); // piège anti-robots
  }
  if (!validImage(req.file)) {
    flash(req, 'error', 'Ce fichier n’est pas une photo valide (JPG, PNG ou WebP).');
    return back();
  }
  const pet = clean(b.pet_name, 60);
  const adopter = clean(b.adopter, 80);
  const title = clean(b.title, 120);
  const content = clean(b.content, 5000);
  if (!pet || !adopter || content.length < 20 || !b.consent) {
    if (req.file) removeFile(req.file.filename);
    flash(req, 'error', 'Merci de remplir le nom de l’animal, votre prénom et votre histoire (quelques lignes), et de cocher l’accord de publication.');
    return back();
  }
  db.prepare('INSERT INTO stories (pet_name, species, adopter, title, content, photo, published, pending) VALUES (?,?,?,?,?,?,0,1)').run(
    pet, b.species === 'chat' ? 'chat' : 'chien', adopter, title || `L’histoire de ${pet}`, content, req.file ? req.file.filename : null
  );
  flash(req, 'ok', 'Merci ! Votre histoire a bien été envoyée. Elle sera publiée dès que l’équipe l’aura relue.');
  res.redirect('/histoires');
});
app.get('/histoires/:id', (req, res, next) => {
  const story = db.prepare('SELECT * FROM stories WHERE id = ? AND published = 1').get(Number(req.params.id));
  if (!story) return next();
  const more = db.prepare('SELECT * FROM stories WHERE published = 1 AND id != ? ORDER BY created_at DESC LIMIT 2').all(story.id);
  res.render('story', {
    title: `${story.pet_name} : ${story.title}`,
    story,
    more,
    og: { type: 'article', title: `${story.pet_name} — ${story.title}`, description: plain(story.content), image: story.photo },
  });
});

app.get('/livre-d-or', (req, res) => {
  const messages = db.prepare('SELECT * FROM guestbook WHERE approved = 1 ORDER BY created_at DESC').all();
  res.render('guestbook', { title: "Livre d'or", messages });
});
app.post('/livre-d-or', limit('gb', 5, 3600 * 1000), (req, res) => {
  if (req.body.website) return res.redirect('/livre-d-or'); // piège anti-robots
  const author = clean(req.body.author, 60);
  const message = clean(req.body.message, 1000);
  if (!author || message.length < 5) {
    flash(req, 'error', 'Merci d’indiquer votre prénom et un petit message.');
    return res.redirect('/livre-d-or#ecrire');
  }
  db.prepare('INSERT INTO guestbook (author, message) VALUES (?, ?)').run(author, message);
  flash(req, 'ok', 'Merci pour votre message ! Il apparaîtra dès que l’équipe l’aura relu.');
  res.redirect('/livre-d-or');
});

app.get('/association', (req, res) => res.render('about', { title: "L'association" }));

// =====================================================================
//  ADMINISTRATION
// =====================================================================
const requireAdmin = (req, res, next) => (req.admin ? next() : res.redirect('/admin/connexion'));
// Actions réservées au super admin (gestion des comptes et des droits)
const requireSuper = (req, res, next) => {
  if (req.admin.role === 'super') return next();
  flash(req, 'error', 'Seul le super admin peut gérer les comptes.');
  res.redirect('/admin/comptes');
};
const superCount = () => db.prepare("SELECT COUNT(*) n FROM admins WHERE role = 'super'").get().n;

app.get('/admin/connexion', (req, res) => {
  if (req.admin) return res.redirect('/admin');
  res.render('admin/login', { title: 'Connexion', layout: false });
});
app.post('/admin/connexion', limit('login', 8, 15 * 60 * 1000), (req, res) => {
  const a = db.prepare('SELECT * FROM admins WHERE email = ?').get(clean(req.body.email, 200).toLowerCase());
  if (!a || !verifyPassword(String(req.body.password || ''), a.password_hash)) {
    flash(req, 'error', 'Adresse e-mail ou mot de passe incorrect.');
    return res.redirect('/admin/connexion');
  }
  req.session.adminId = a.id;
  req.session.csrf = crypto.randomBytes(16).toString('hex');
  res.redirect('/admin');
});
app.post('/admin/deconnexion', (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.use('/admin', requireAdmin);

app.get('/admin', (req, res) => {
  const c = (sql) => db.prepare(sql).get().n;
  res.render('admin/dashboard', {
    title: 'Tableau de bord',
    stats: {
      animals: countHeads("status != 'adopte'"),
      distress: countHeads("distress = 1 AND status != 'adopte'"),
      posts: c('SELECT COUNT(*) n FROM posts'),
      pending: c('SELECT COUNT(*) n FROM guestbook WHERE approved = 0'),
      pendingStories: c('SELECT COUNT(*) n FROM stories WHERE pending = 1'),
    },
  });
});

app.get('/admin/aide', (req, res) => res.render('admin/help', { title: 'Aide' }));

// ----- animaux -----
const SEXES = ['femelle', 'male', 'inconnu'];
const STATUSES = ['disponible', 'reserve', 'adopte'];

app.get('/admin/animaux', (req, res) => {
  const animals = db.prepare('SELECT * FROM animals ORDER BY created_at DESC').all();
  res.render('admin/animals', { title: 'Les animaux', animals });
});
app.get('/admin/animaux/nouveau', (req, res) => {
  res.render('admin/animal-form', { title: 'Nouvel animal', animal: { species: 'chien', sex: 'inconnu', status: 'disponible', distress: 0 } });
});
app.get('/admin/animaux/:id', (req, res, next) => {
  const animal = db.prepare('SELECT * FROM animals WHERE id = ?').get(Number(req.params.id));
  if (!animal) return next();
  res.render('admin/animal-form', { title: `Modifier ${animal.name}`, animal });
});

function saveAnimal(req, res) {
  const id = Number(req.params.id || 0);
  const old = id ? db.prepare('SELECT * FROM animals WHERE id = ?').get(id) : null;
  const b = req.body;
  const f1 = req.files?.photo?.[0];
  const f2 = req.files?.photo2?.[0];
  const drop = () => {
    if (f1) removeFile(f1.filename);
    if (f2) removeFile(f2.filename);
  };
  const back = req.get('referer') || '/admin/animaux';
  const fail = (msg) => {
    drop();
    flash(req, 'error', msg);
    return res.redirect(back);
  };
  if (!validImage(f1) || !validImage(f2)) return fail('Ce fichier n’est pas une photo valide (JPG, PNG ou WebP).');

  const name = clean(b.name, 60);
  if (!name) return fail('Le nom de l’animal est obligatoire.');
  const pair = b.is_pair ? 1 : 0;
  const name2 = clean(b.name2, 60);
  if (pair && !name2) return fail('Indiquez le nom du second animal, ou décochez « deux animaux inséparables ».');

  const data = {
    name,
    species: b.species === 'chat' ? 'chat' : 'chien',
    sex: SEXES.includes(b.sex) ? b.sex : 'inconnu',
    age: clean(b.age, 40),
    description: clean(b.description, 5000),
    distress: b.distress ? 1 : 0,
    status: STATUSES.includes(b.status) ? b.status : 'disponible',
    is_pair: pair,
    name2: pair ? name2 : '',
    species2: b.species2 === 'chat' ? 'chat' : 'chien',
    sex2: SEXES.includes(b.sex2) ? b.sex2 : 'inconnu',
    age2: pair ? clean(b.age2, 40) : '',
  };

  // Photo remplacée, retirée, ou inchangée — pour chacun des deux animaux
  const pick = (file, current, remove) => {
    if (file) {
      removeFile(current);
      return file.filename;
    }
    if (old && remove) {
      removeFile(current);
      return null;
    }
    return current;
  };
  const photo = pick(f1, old ? old.photo : null, b.remove_photo);
  let photo2 = pick(f2, old ? old.photo2 : null, b.remove_photo2);
  if (!pair && photo2) {
    removeFile(photo2);
    photo2 = null;
  }

  if (old) {
    db.prepare(
      'UPDATE animals SET name=?, species=?, sex=?, age=?, description=?, distress=?, status=?, photo=?, is_pair=?, name2=?, species2=?, sex2=?, age2=?, photo2=? WHERE id=?'
    ).run(data.name, data.species, data.sex, data.age, data.description, data.distress, data.status, photo,
      data.is_pair, data.name2, data.species2, data.sex2, data.age2, photo2, id);
  } else {
    db.prepare(
      'INSERT INTO animals (name, species, sex, age, description, distress, status, photo, is_pair, name2, species2, sex2, age2, photo2) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    ).run(data.name, data.species, data.sex, data.age, data.description, data.distress, data.status, photo,
      data.is_pair, data.name2, data.species2, data.sex2, data.age2, photo2);
  }
  const shown = petName({ ...data, name2: data.name2 });
  flash(req, 'ok', old ? `${shown} a bien été mis à jour.` : `${shown} a été ajouté au site.`);
  res.redirect('/admin/animaux');
}
app.post('/admin/animaux', uploadMany(['photo', 'photo2']), checkCsrf, saveAnimal);
app.post('/admin/animaux/:id', uploadMany(['photo', 'photo2']), checkCsrf, saveAnimal);

app.post('/admin/animaux/:id/detresse', (req, res) => {
  const a = db.prepare('SELECT * FROM animals WHERE id = ?').get(Number(req.params.id));
  if (a) {
    db.prepare('UPDATE animals SET distress = ? WHERE id = ?').run(a.distress ? 0 : 1, a.id);
    flash(req, 'ok', a.distress ? `Le badge « En détresse » a été retiré pour ${petName(a)}.` : `${petName(a)} porte maintenant le badge « En détresse ».`);
  }
  res.redirect('/admin/animaux');
});
app.post('/admin/animaux/:id/adopte', (req, res) => {
  const a = db.prepare('SELECT * FROM animals WHERE id = ?').get(Number(req.params.id));
  if (a) {
    db.prepare("UPDATE animals SET status = 'adopte', distress = 0 WHERE id = ?").run(a.id);
    flash(req, 'ok', `Bravo ! ${petName(a)} est adopté 🎉 Souhaitez-vous raconter son histoire ?`, { href: `/admin/histoires/nouveau?animal=${a.id}`, label: `Écrire l’histoire de ${petName(a)}` });
  }
  res.redirect('/admin/animaux');
});
app.post('/admin/animaux/:id/supprimer', (req, res) => {
  const a = db.prepare('SELECT * FROM animals WHERE id = ?').get(Number(req.params.id));
  if (a) {
    removeFile(a.photo);
    removeFile(a.photo2);
    db.prepare('DELETE FROM animals WHERE id = ?').run(a.id);
    flash(req, 'ok', `${petName(a)} a été supprimé.`);
  }
  res.redirect('/admin/animaux');
});

// ----- articles -----
app.get('/admin/articles', (req, res) => {
  res.render('admin/posts', { title: 'Les articles', posts: db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all() });
});
app.get('/admin/articles/nouveau', (req, res) => {
  res.render('admin/post-form', { title: 'Nouvel article', post: { category: 'Bons réflexes', published: 1 } });
});
app.get('/admin/articles/:id', (req, res, next) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(Number(req.params.id));
  if (!post) return next();
  res.render('admin/post-form', { title: 'Modifier l’article', post });
});
function savePost(req, res) {
  const id = Number(req.params.id || 0);
  const old = id ? db.prepare('SELECT * FROM posts WHERE id = ?').get(id) : null;
  if (!validImage(req.file)) {
    flash(req, 'error', 'Ce fichier n’est pas une photo valide (JPG, PNG ou WebP).');
    return res.redirect(req.get('referer') || '/admin/articles');
  }
  const b = req.body;
  const title = clean(b.title, 120);
  const content = clean(b.content, 30000);
  if (!title || !content) {
    if (req.file) removeFile(req.file.filename);
    flash(req, 'error', 'Le titre et le texte de l’article sont obligatoires.');
    return res.redirect(req.get('referer') || '/admin/articles');
  }
  const category = clean(b.category, 40) || 'Bons réflexes';
  const excerpt = clean(b.excerpt, 300) || content.replace(/[#\-•\n]+/g, ' ').slice(0, 160).trim() + '…';
  const published = b.published ? 1 : 0;
  let cover = old ? old.cover : null;
  if (req.file) {
    removeFile(cover);
    cover = req.file.filename;
  } else if (old && b.remove_photo) {
    removeFile(cover);
    cover = null;
  }
  if (old) {
    db.prepare('UPDATE posts SET title=?, category=?, excerpt=?, content=?, cover=?, published=? WHERE id=?').run(
      title, category, excerpt, content, cover, published, id
    );
  } else {
    db.prepare('INSERT INTO posts (title, slug, category, excerpt, content, cover, published) VALUES (?,?,?,?,?,?,?)').run(
      title, uniqueSlug(title), category, excerpt, content, cover, published
    );
  }
  flash(req, 'ok', published ? 'L’article est publié sur le blog.' : 'L’article est enregistré en brouillon (non visible).');
  res.redirect('/admin/articles');
}
app.post('/admin/articles', upload('cover'), checkCsrf, savePost);
app.post('/admin/articles/:id', upload('cover'), checkCsrf, savePost);
app.post('/admin/articles/:id/supprimer', (req, res) => {
  const p = db.prepare('SELECT * FROM posts WHERE id = ?').get(Number(req.params.id));
  if (p) {
    removeFile(p.cover);
    db.prepare('DELETE FROM posts WHERE id = ?').run(p.id);
    flash(req, 'ok', 'L’article a été supprimé.');
  }
  res.redirect('/admin/articles');
});

// ----- histoires d'adoption -----
const adoptable = () => db.prepare('SELECT id, name, species, status FROM animals ORDER BY (status = \'adopte\') DESC, name').all();
app.get('/admin/histoires', (req, res) => {
  res.render('admin/stories', { title: 'Histoires d’adoption', stories: db.prepare('SELECT * FROM stories ORDER BY pending DESC, created_at DESC').all() });
});
app.get('/admin/histoires/nouveau', (req, res) => {
  const a = db.prepare('SELECT * FROM animals WHERE id = ?').get(Number(req.query.animal));
  const story = a ? { species: a.species, pet_name: a.name, animal_id: a.id, published: 1 } : { species: 'chien', published: 1 };
  res.render('admin/story-form', { title: 'Nouvelle histoire', story, animals: adoptable() });
});
app.get('/admin/histoires/:id', (req, res, next) => {
  const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(Number(req.params.id));
  if (!story) return next();
  res.render('admin/story-form', { title: 'Modifier l’histoire', story, animals: adoptable() });
});
function saveStory(req, res) {
  const id = Number(req.params.id || 0);
  const old = id ? db.prepare('SELECT * FROM stories WHERE id = ?').get(id) : null;
  if (!validImage(req.file)) {
    flash(req, 'error', 'Ce fichier n’est pas une photo valide (JPG, PNG ou WebP).');
    return res.redirect(req.get('referer') || '/admin/histoires');
  }
  const b = req.body;
  const pet = clean(b.pet_name, 60);
  const title = clean(b.title, 120);
  const content = clean(b.content, 10000);
  if (!pet || !title || !content) {
    if (req.file) removeFile(req.file.filename);
    flash(req, 'error', 'Le nom de l’animal, le titre et l’histoire sont obligatoires.');
    return res.redirect(req.get('referer') || '/admin/histoires');
  }
  const species = b.species === 'chat' ? 'chat' : 'chien';
  const adopter = clean(b.adopter, 80);
  const published = b.published ? 1 : 0;
  const animalId = db.prepare('SELECT id FROM animals WHERE id = ?').get(Number(b.animal_id))?.id ?? null;
  let photo = old ? old.photo : null;
  if (req.file) {
    removeFile(photo);
    photo = req.file.filename;
  } else if (old && b.remove_photo) {
    removeFile(photo);
    photo = null;
  }
  if (old) {
    db.prepare('UPDATE stories SET pet_name=?, species=?, adopter=?, title=?, content=?, photo=?, published=?, animal_id=?, pending=? WHERE id=?').run(
      pet, species, adopter, title, content, photo, published, animalId, published ? 0 : old.pending, id
    );
  } else {
    db.prepare('INSERT INTO stories (pet_name, species, adopter, title, content, photo, published, animal_id) VALUES (?,?,?,?,?,?,?,?)').run(
      pet, species, adopter, title, content, photo, published, animalId
    );
  }
  // Une histoire d'adoption publiée signifie que l'animal a trouvé sa famille :
  // sa fiche passe automatiquement en « adopté », pour ne pas rester dans les annonces.
  let alsoAdopted = null;
  if (published && animalId) {
    const a = db.prepare("SELECT * FROM animals WHERE id = ? AND status != 'adopte'").get(animalId);
    if (a) {
      db.prepare("UPDATE animals SET status = 'adopte', distress = 0 WHERE id = ?").run(animalId);
      alsoAdopted = petName(a);
    }
  }
  flash(req, 'ok',
    published
      ? `L’histoire de ${pet} est publiée.` + (alsoAdopted ? ` La fiche de ${alsoAdopted} est passée en « adopté ».` : '')
      : 'L’histoire est enregistrée en brouillon (non visible).');
  res.redirect('/admin/histoires');
}
app.post('/admin/histoires', upload('photo'), checkCsrf, saveStory);
app.post('/admin/histoires/:id', upload('photo'), checkCsrf, saveStory);
app.post('/admin/histoires/:id/valider', (req, res) => {
  const id = Number(req.params.id);
  const st = db.prepare('SELECT * FROM stories WHERE id = ?').get(id);
  db.prepare('UPDATE stories SET published = 1, pending = 0 WHERE id = ?').run(id);
  let alsoAdopted = null;
  if (st?.animal_id) {
    const a = db.prepare("SELECT * FROM animals WHERE id = ? AND status != 'adopte'").get(st.animal_id);
    if (a) {
      db.prepare("UPDATE animals SET status = 'adopte', distress = 0 WHERE id = ?").run(a.id);
      alsoAdopted = petName(a);
    }
  }
  flash(req, 'ok', 'L’histoire est maintenant publiée sur le site.' + (alsoAdopted ? ` La fiche de ${alsoAdopted} est passée en « adopté ».` : ''));
  res.redirect('/admin/histoires');
});
app.post('/admin/histoires/:id/supprimer', (req, res) => {
  const st = db.prepare('SELECT * FROM stories WHERE id = ?').get(Number(req.params.id));
  if (st) {
    removeFile(st.photo);
    db.prepare('DELETE FROM stories WHERE id = ?').run(st.id);
    flash(req, 'ok', 'L’histoire a été supprimée.');
  }
  res.redirect('/admin/histoires');
});

// ----- livre d'or -----
app.get('/admin/livre-d-or', (req, res) => {
  const messages = db.prepare('SELECT * FROM guestbook ORDER BY approved, created_at DESC').all();
  res.render('admin/guestbook', { title: "Livre d'or", messages });
});
app.post('/admin/livre-d-or/:id/valider', (req, res) => {
  db.prepare('UPDATE guestbook SET approved = 1 WHERE id = ?').run(Number(req.params.id));
  flash(req, 'ok', 'Le message est maintenant visible dans le livre d’or.');
  res.redirect('/admin/livre-d-or');
});
app.post('/admin/livre-d-or/:id/supprimer', (req, res) => {
  db.prepare('DELETE FROM guestbook WHERE id = ?').run(Number(req.params.id));
  flash(req, 'ok', 'Le message a été supprimé.');
  res.redirect('/admin/livre-d-or');
});

// ----- réglages -----
app.get('/admin/reglages', (req, res) => res.render('admin/settings', { title: 'Réglages du site' }));
app.post('/admin/reglages', (req, res) => {
  const lim = { hero_title: 120, hero_text: 400, email: 120, phone: 30, address: 200, facebook: 200, instagram: 200, donation_link: 300 };
  for (const [k, max] of Object.entries(lim)) {
    let v = clean(req.body[k], max);
    if (['facebook', 'instagram', 'donation_link'].includes(k) && v && !/^https?:\/\//i.test(v)) v = 'https://' + v;
    setSetting(k, v);
  }
  flash(req, 'ok', 'Les réglages ont été enregistrés.');
  res.redirect('/admin/reglages');
});

// ----- comptes administrateurs -----
app.get('/admin/comptes', (req, res) => {
  res.render('admin/accounts', { title: 'Comptes', admins: db.prepare("SELECT id, name, email, role, created_at FROM admins ORDER BY (role = 'super') DESC, id").all() });
});
app.post('/admin/comptes', requireSuper, (req, res) => {
  const name = clean(req.body.name, 60);
  const email = clean(req.body.email, 200).toLowerCase();
  const pw = String(req.body.password || '');
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || pw.length < 8) {
    flash(req, 'error', 'Indiquez un nom, une adresse e-mail valide et un mot de passe d’au moins 8 caractères.');
    return res.redirect('/admin/comptes');
  }
  if (db.prepare('SELECT 1 FROM admins WHERE email = ?').get(email)) {
    flash(req, 'error', 'Un compte existe déjà avec cette adresse e-mail.');
    return res.redirect('/admin/comptes');
  }
  const role = req.body.role === 'super' ? 'super' : 'admin';
  db.prepare('INSERT INTO admins (name, email, password_hash, role) VALUES (?,?,?,?)').run(name, email, hashPassword(pw), role);
  flash(req, 'ok', `Le compte de ${name} a été créé.`);
  res.redirect('/admin/comptes');
});
app.post('/admin/comptes/nom', (req, res) => {
  const name = clean(req.body.name, 60);
  if (!name) flash(req, 'error', 'Indiquez votre prénom ou votre nom.');
  else {
    db.prepare('UPDATE admins SET name = ? WHERE id = ?').run(name, req.admin.id);
    flash(req, 'ok', `C’est noté : vous serez désormais accueilli(e) sous le nom « ${name} ».`);
  }
  res.redirect('/admin/comptes');
});
app.post('/admin/comptes/mot-de-passe', (req, res) => {
  const a = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.admin.id);
  const pw = String(req.body.new_password || '');
  if (!verifyPassword(String(req.body.current_password || ''), a.password_hash)) {
    flash(req, 'error', 'Votre mot de passe actuel est incorrect.');
  } else if (pw.length < 8) {
    flash(req, 'error', 'Le nouveau mot de passe doit faire au moins 8 caractères.');
  } else {
    db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(hashPassword(pw), a.id);
    flash(req, 'ok', 'Votre mot de passe a été changé.');
  }
  res.redirect('/admin/comptes');
});
app.post('/admin/comptes/:id/reinitialiser', requireSuper, (req, res) => {
  const a = db.prepare('SELECT * FROM admins WHERE id = ?').get(Number(req.params.id));
  if (!a || a.id === req.admin.id) {
    flash(req, 'error', 'Pour votre propre mot de passe, utilisez « Changer mon mot de passe ».');
    return res.redirect('/admin/comptes');
  }
  const words = ['Ronron', 'Museau', 'Croquette', 'Moustache', 'Papatte', 'Caramel', 'Noisette'];
  const pw = words[crypto.randomInt(words.length)] + crypto.randomInt(1000, 10000);
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(hashPassword(pw), a.id);
  flash(req, 'ok', `Nouveau mot de passe de ${a.name} : ${pw} — notez-le et transmettez-le lui, il ne sera plus affiché.`);
  res.redirect('/admin/comptes');
});
app.post('/admin/comptes/:id/role', requireSuper, (req, res) => {
  const a = db.prepare('SELECT * FROM admins WHERE id = ?').get(Number(req.params.id));
  const role = req.body.role === 'super' ? 'super' : 'admin';
  if (!a) flash(req, 'error', 'Compte introuvable.');
  else if (a.role === role) flash(req, 'ok', 'Aucun changement.');
  else if (role === 'admin' && superCount() <= 1) flash(req, 'error', 'Il doit rester au moins un super admin. Nommez d’abord un autre super admin.');
  else {
    db.prepare('UPDATE admins SET role = ? WHERE id = ?').run(role, a.id);
    flash(req, 'ok', role === 'super' ? `${a.name} est maintenant super admin.` : `${a.name} est maintenant administrateur (sans gestion des comptes).`);
  }
  res.redirect('/admin/comptes');
});
app.post('/admin/comptes/:id/supprimer', requireSuper, (req, res) => {
  const id = Number(req.params.id);
  const total = db.prepare('SELECT COUNT(*) n FROM admins').get().n;
  const target = db.prepare('SELECT role FROM admins WHERE id = ?').get(id);
  if (id === req.admin.id) flash(req, 'error', 'Vous ne pouvez pas supprimer votre propre compte.');
  else if (total <= 1) flash(req, 'error', 'Il doit rester au moins un compte administrateur.');
  else if (target?.role === 'super' && superCount() <= 1) flash(req, 'error', 'Il doit rester au moins un super admin.');
  else {
    db.prepare('DELETE FROM admins WHERE id = ?').run(id);
    flash(req, 'ok', 'Le compte a été supprimé.');
  }
  res.redirect('/admin/comptes');
});

// ---------- 404 / erreurs ----------
app.use((req, res) => res.status(404).render('error', { title: 'Page introuvable', message: 'Cette page n’existe pas (ou plus). Peut-être a-t-elle été adoptée ? 🐾' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: 'Oups', message: 'Une erreur est survenue. Réessayez dans un instant.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ASAD → http://localhost:${PORT}`));
