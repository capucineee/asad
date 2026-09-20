// Contenu de démonstration (à lancer une seule fois : npm run seed)
const { db, uniqueSlug } = require('./db');
const hasAnimals = db.prepare('SELECT COUNT(*) n FROM animals').get().n > 0;
const animals = [
  ['Noisette', 'chien', 'femelle', '3 ans', "Noisette est une adorable croisée labrador, douce et joueuse. Elle adore les balades et les câlins. Elle s'entend bien avec les autres chiens et les enfants.\n\nElle a été retrouvée attachée devant un magasin et cherche désormais une famille pour la vie.", 1],
  ['Filou', 'chat', 'male', '1 an', "Filou est un jeune chat roux plein d'énergie. Curieux et affectueux, il ronronne dès qu'on le caresse.\n\nIl s'adapterait à un appartement avec accès à un balcon sécurisé.", 0],
  ['Plume', 'chat', 'femelle', '8 ans', "Plume est une chatte calme et câline, abandonnée à cause d'un déménagement. Elle rêve d'un canapé et d'une famille tranquille.", 1],
  ['Rocky', 'chien', 'male', '5 ans', "Rocky est un grand gaillard au cœur tendre. Un peu timide au début, il devient très attaché à son humain. Idéal avec un jardin.", 0],
  ['Câline', 'chat', 'femelle', '4 mois', "Une petite chatonne sociable, née dans la rue et recueillie avec ses frères et sœurs. Elle est identifiée, vaccinée et prête à partir.", 0],
  ['Max', 'chien', 'male', '10 ans', "Max est un papy qui a encore de beaux jours devant lui. Calme, propre, il ne demande qu'une place au chaud et des promenades tranquilles.", 0],
];
if (!hasAnimals) for (const [n, s, x, a, d, dis] of animals)
  db.prepare('INSERT INTO animals (name, species, sex, age, description, distress) VALUES (?,?,?,?,?,?)').run(n, s, x, a, d, dis);
if (!hasAnimals) db.prepare("UPDATE animals SET status='adopte' WHERE name='Max'").run();
// Exemple d'annonce pour deux animaux inséparables
if (!hasAnimals)
  db.prepare(
    'INSERT INTO animals (name, species, sex, age, description, is_pair, name2, species2, sex2, age2) VALUES (?,?,?,?,?,1,?,?,?,?)'
  ).run('Iris', 'chien', 'femelle', '3 ans',
    "Iris et Pacha ont grandi ensemble et ne se quittent jamais. Ils dorment collés l'un à l'autre et se cherchent dès qu'ils sont séparés.\n\nNous cherchons une famille prête à les accueillir tous les deux.",
    'Pacha', 'chat', 'male', '5 ans');

const posts = [
  ['Vous avez trouvé un animal errant : les bons réflexes', 'Bons réflexes',
`Un chien qui erre au bord de la route, un chat amaigri devant votre porte… Voici comment réagir calmement et efficacement.

## 1. Approchez-vous doucement
Ne courez pas après l'animal. Parlez d'une voix douce, accroupissez-vous et laissez-le venir. Un animal effrayé peut mordre ou griffer, même s'il est gentil d'habitude.

## 2. Mettez-le en sécurité
- Proposez de l'eau fraîche (et un peu de nourriture adaptée).
- Isolez-le dans une pièce calme ou un jardin fermé.
- Sur la route, sécurisez-vous d'abord : votre sécurité passe avant tout.

## 3. Cherchez son identité
Regardez s'il porte un collier avec un médaillon. Rendez-vous ensuite chez un vétérinaire : il pourra lire gratuitement la puce électronique ou le tatouage et retrouver le propriétaire.

## 4. Prévenez les bonnes personnes
- La mairie ou la fourrière de la commune.
- Les associations locales, dont l'ASAD.
- Les groupes d'animaux perdus de votre quartier, avec une photo.

## 5. Ne le gardez pas « pour toujours » sans démarches
Un animal errant a peut-être une famille qui le cherche. Déclarez-le rapidement : c'est aussi une obligation légale.

Et si vous ne pouvez pas le garder, contactez-nous : nous ferons le maximum pour vous aider.`],
  ['Chien ou chat perdu : que faire dans les premières heures ?', 'Bons réflexes',
`Votre compagnon a disparu ? Respirez, et agissez vite.

## Dans l'heure qui suit
- Fouillez les alentours : jardin, cave, garage, dessous de voiture. Les chats se cachent souvent tout près.
- Appelez-le calmement, secouez sa gamelle.
- Prévenez vos voisins.

## Dans la journée
- Appelez la mairie, la fourrière et les vétérinaires du secteur.
- Faites mettre à jour les informations de sa puce d'identification.
- Publiez une annonce avec une belle photo, son nom, le lieu et un numéro de téléphone.

## Ne perdez pas espoir
De nombreux animaux retrouvent leur famille grâce à la mobilisation des voisins et au partage des annonces.`],
  ['Adopter un animal : les questions à se poser', 'Adoption',
`Adopter, c'est un engagement de 10 à 20 ans. Voici de quoi bien réfléchir.

- Ai-je le temps de m'en occuper chaque jour ?
- Mon logement est-il adapté ?
- Ai-je prévu le budget : nourriture, vétérinaire, vaccins, stérilisation ?
- Toute la famille est-elle d'accord ?
- Que se passera-t-il pendant les vacances ?

## Chez ASAD
Nos bénévoles vous rencontrent, vous présentent l'animal et vous aident à trouver le compagnon qui vous ressemble. Tous nos animaux sont identifiés et vaccinés avant d'être adoptés.`],
];
if (!hasAnimals) for (const [t, c, body] of posts)
  db.prepare('INSERT INTO posts (title, slug, category, excerpt, content) VALUES (?,?,?,?,?)').run(
    t, uniqueSlug(t), c, body.split('\n')[0].slice(0, 160), body);

if (!hasAnimals) db.prepare('INSERT INTO guestbook (author, message, approved) VALUES (?,?,1)').run('Sophie', "Merci à toute l'équipe : Nala a trouvé chez nous sa maison. Vous êtes formidables !");
if (!hasAnimals) db.prepare('INSERT INTO guestbook (author, message, approved) VALUES (?,?,1)').run('Marc', "Un accueil chaleureux et des bénévoles à l'écoute. Bravo pour votre travail.");
if (!hasAnimals) db.prepare('INSERT INTO guestbook (author, message, approved) VALUES (?,?,0)').run('Léa', "Bravo pour votre engagement, je fais un don ce mois-ci !");
console.log('Contenu de démonstration ajouté.');

// Histoires d'adoption de démonstration
if (!db.prepare('SELECT COUNT(*) n FROM stories').get().n) {
  db.prepare('INSERT INTO stories (pet_name, species, adopter, title, content) VALUES (?,?,?,?,?)').run(
    'Nala', 'chat', 'Sophie et sa famille', 'De la rue au canapé',
    "Nala a été trouvée toute maigre sous une voiture, un soir de pluie. Elle avait peur de tout.\n\nAprès quelques semaines chez sa famille d'accueil, elle a rencontré Sophie, et c'est le coup de foudre. Aujourd'hui, Nala ronronne dès le réveil et règne sur le canapé.");
  db.prepare('INSERT INTO stories (pet_name, species, adopter, title, content) VALUES (?,?,?,?,?)').run(
    'Max', 'chien', 'Marc', 'Un papy heureux',
    "À 10 ans, Max pensait avoir tout perdu. Marc, retraité, cherchait un compagnon de promenade calme.\n\nDepuis, ils font ensemble deux balades par jour, et Max a retrouvé toute sa joie de vivre.");
}
