// Articles prêts à publier, proposés dans l'administration (Articles > « Articles prêts à publier »).
// Format du texte : ligne vide = nouveau paragraphe, « ## » = sous-titre, « - » = liste.
//
// Volontairement, aucun de ces textes n'affirme ce que fait l'association (vaccination, délais,
// tarifs…) : ces informations doivent venir d'elle. Les conseils sont d'ordre général et ne
// remplacent pas l'avis d'un vétérinaire.

module.exports = [
  {
    key: 'trouve-un-animal',
    category: 'Bons réflexes',
    title: 'Que faire si je trouve un animal ?',
    excerpt: 'Un chien seul au bord d’une route, un chat amaigri devant votre porte : les bons gestes, dans l’ordre, pour l’aider sans vous mettre en danger.',
    content: `Un chien qui erre, un chat qui miaule devant votre porte… On veut aider, mais on ne sait pas toujours par où commencer. Voici les bons réflexes, dans l’ordre.

## 1. Évaluez la situation
Avant de vous approcher, regardez calmement :

- L’animal est-il **blessé**, très maigre, ou en danger (au milieu d’une route) ? Dans ce cas, c’est une urgence : consultez notre article « Animal blessé sur la route ».
- Un chat en bonne santé qui se promène n’est pas forcément perdu : beaucoup de chats ont une maison et explorent le quartier.

## 2. Approchez-vous doucement
Ne courez pas après l’animal : cela l’effraie et il risque de s’enfuir sur la route. Accroupissez-vous, parlez d’une voix douce, détournez le regard et laissez-le venir vers vous. Un animal apeuré peut mordre ou griffer, même s’il est très doux d’habitude.

## 3. Mettez-le en sécurité
- Proposez de l’eau fraîche.
- Isolez-le dans une pièce calme, un garage ou un jardin fermé.
- Évitez le lait de vache pour un chat : beaucoup le digèrent mal.
- Ne le laissez pas sortir seul tant que vous ne savez pas à qui il appartient.

## 4. Cherchez sa famille
- **Collier ou médaille** : regardez s’il porte un numéro de téléphone.
- **Vétérinaire** : chiens et chats doivent être identifiés par une puce électronique ou un tatouage. Un vétérinaire peut lire la puce et retrouver le propriétaire. Beaucoup le font gratuitement, appelez avant de vous déplacer.
- **Mairie et fourrière** : signalez la découverte. La fourrière conserve les animaux un délai légal afin de laisser leur propriétaire se manifester.
- **Annonce** : prenez une photo, publiez-la dans les groupes de votre quartier et affichez-la chez les commerçants. Gardez un détail secret (une marque, une particularité) pour vérifier qui se présente.

## 5. Ne le gardez pas « en cachette »
Un animal trouvé a peut-être une famille qui le cherche partout. Déclarez-le rapidement : c’est aussi une obligation.

## Personne ne se manifeste ?
Si vous ne pouvez pas le garder, ne le laissez pas repartir dans la rue : contactez une association, nous vous conseillerons au mieux.`,
  },

  {
    key: 'animal-blesse-route',
    category: 'Bons réflexes',
    title: 'Animal blessé sur la route : que faire ?',
    excerpt: 'Vous voyez un chien ou un chat blessé au bord de la chaussée. Sécurité, gestes de premiers secours et personnes à appeler : les réflexes qui comptent.',
    content: `Voir un animal blessé sur la route est bouleversant. Le premier réflexe est d’agir vite, mais **votre sécurité passe avant tout** : un second accident n’aiderait personne.

## 1. Sécurisez les lieux
- Garez-vous sans gêner, mettez vos feux de détresse et enfilez un gilet jaune si vous en avez un.
- Ne traversez pas en courant : attendez qu’il n’y ait plus de véhicule.
- Si la circulation est dangereuse, appelez le **17** (police ou gendarmerie) pour qu’on sécurise la zone.

## 2. Attention aux morsures et aux griffures
Un animal qui souffre peut mordre ou griffer, même avec son propriétaire.

- Ne le touchez pas à mains nues si vous pouvez l’éviter.
- Approchez-vous lentement, parlez doucement.
- Pour un chien, une couverture ou une veste posée sur la tête le calme souvent.
- Ne tentez pas de lui mettre un objet dans la gueule.

## 3. Déplacez-le avec précaution
S’il est en danger sur la chaussée, déplacez-le le moins possible :

- Glissez dessous une couverture, un manteau ou une planche.
- Soutenez tout le corps, si possible à deux, pour ne pas plier le dos.
- Installez-le à l’abri, sur une surface stable.

## 4. Appelez un vétérinaire
Contactez le vétérinaire le plus proche ou le service de garde de votre secteur, et expliquez la situation. La mairie ou les services de secours peuvent vous aider à en trouver un si vous êtes perdu.

## 5. À ne pas faire
- Ne lui donnez **ni à manger ni à boire** : il devra peut-être être opéré.
- Ne lui donnez aucun médicament.
- Ne le laissez pas seul si vous pouvez rester.

## 6. Repérez-le pour son propriétaire
Notez l’endroit précis et regardez s’il porte un collier. Le vétérinaire pourra lire sa puce électronique pour prévenir sa famille.

**En cas de doute, appelez toujours un vétérinaire :** il vous guidera au téléphone.`,
  },

  {
    key: 'animal-perdu',
    category: 'Bons réflexes',
    title: 'Chien ou chat perdu : les premières heures sont décisives',
    excerpt: 'Votre compagnon a disparu ? Voici quoi faire tout de suite, et les erreurs à éviter, pour maximiser vos chances de le retrouver.',
    content: `Votre chien ou votre chat a disparu ? Respirez : dans la grande majorité des cas, les animaux perdus sont retrouvés, surtout quand on agit vite et de façon organisée.

## Dans l’heure qui suit
- **Fouillez les alentours proches** : jardin, garage, cave, abris, dessous des voitures. Un chat effrayé se cache souvent à quelques mètres de chez lui.
- Appelez-le calmement, secouez sa gamelle ou son paquet de croquettes.
- Prévenez vos voisins et demandez-leur de vérifier leurs cabanons et garages.

## Dans la journée
- **Contactez la mairie, la fourrière et les vétérinaires** du secteur, en donnant sa description et son numéro d’identification.
- **Déclarez la perte** sur le site du fichier national d’identification (I-CAD) : c’est ce qui permet de vous joindre si quelqu’un le trouve et fait lire sa puce.
- **Publiez une annonce** avec une belle photo bien nette, son nom, le lieu et la date de disparition, et un numéro de téléphone. Partagez-la dans les groupes de votre quartier.
- **Affichez** dans un rayon d’un kilomètre au moins : commerces, boulangerie, vétérinaires, arrêts de bus.

## Conseils selon l’animal
**Pour un chat :** il rentre parfois de nuit. Cherchez le soir à la lampe torche, au calme, et laissez à l’extérieur sa litière ou un vêtement qui porte votre odeur.

**Pour un chien :** ne lui criez pas dessus et ne le poursuivez pas, cela le fait fuir. Si vous l’apercevez, asseyez-vous ou tournez-vous de côté et appelez-le d’une voix joyeuse.

## Les erreurs à éviter
- Attendre « qu’il revienne tout seul » avant de commencer à chercher.
- Ne donner sur l’annonce qu’une photo floue ou aucune photo.
- Oublier de prévenir quand il est retrouvé, pour que les bénévoles arrêtent de le chercher.

**Ne perdez pas espoir** : le partage des annonces et la mobilisation des voisins ramènent chaque jour des animaux chez eux.`,
  },

  {
    key: 'chaton-trouve',
    category: 'Bons réflexes',
    title: 'Chaton trouvé seul : faut-il le récupérer ?',
    excerpt: 'Un chaton miaule dans un jardin ou au pied d’un mur. Attention : le prendre trop vite peut le séparer de sa mère. Comment décider ?',
    content: `Un tout petit chaton qui miaule seul dans un jardin, sous une voiture ou au pied d’un mur : la première envie est de le ramasser. Pourtant, **il n’est pas forcément abandonné**.

## Commencez par observer
Une chatte laisse parfois ses petits quelques heures pour aller se nourrir. Si le chaton n’est pas en danger immédiat :

- Éloignez-vous et observez de loin, sans le toucher, pendant plusieurs heures.
- Si la mère revient le chercher, laissez-les tranquilles : c’est la meilleure solution pour lui.

## Quand intervenir sans attendre
Récupérez-le si :

- il est **blessé**, sale ou très faible ;
- il est **en danger** (route, chien, pluie, chaleur ou froid extrêmes) ;
- la mère a été retrouvée morte, ou n’est pas revenue après une longue attente ;
- il pleure de façon continue depuis longtemps.

## Les premiers gestes
- **Réchauffez-le** : un chaton ne sait pas se réchauffer seul. Une bouillotte tiède enveloppée dans un linge, dans un carton douillet, convient. Évitez la chaleur directe.
- **Ne lui donnez pas de lait de vache** : il risque des troubles digestifs. Il existe des laits spéciaux pour chatons, en animalerie ou chez le vétérinaire.
- Ne le nourrissez jamais **sur le dos** : tenez-le sur le ventre, comme lorsqu’il tète.

## Consultez un vétérinaire rapidement
Idéalement dans les 24 heures : il évaluera son âge, sa santé, et vous expliquera comment le nourrir. Les tout-petits demandent des soins très réguliers, y compris la nuit.

## Vous ne pouvez pas vous en occuper ?
C’est tout à fait compréhensible. Contactez une association ou un vétérinaire au plus vite, sans le laisser sans soin.`,
  },

  {
    key: 'avant-adopter',
    category: 'Adoption',
    title: 'Adopter un animal : les questions à se poser avant',
    excerpt: 'Adopter, c’est un engagement de dix à vingt ans. Une liste de questions simples pour vous assurer que le moment est le bon.',
    content: `Le coup de cœur est magnifique, mais adopter un chien ou un chat est un engagement de **dix à vingt ans**. Prendre le temps de la réflexion, c’est le meilleur cadeau à faire à l’animal.

## Votre vie de tous les jours
- Ai-je le **temps** de m’en occuper chaque jour : sorties, jeux, câlins, soins ?
- Combien d’heures l’animal restera-t-il seul ? Un chien ne supporte pas toujours l’absence.
- Mon logement est-il adapté à sa taille et à ses besoins ?
- Suis-je prêt à supporter les poils, les griffes sur le canapé et quelques bêtises ?

## Le budget
Nourriture, vétérinaire, vaccins, identification, stérilisation, antiparasitaires, assurance éventuelle, garde pendant les vacances : c’est un budget régulier, et il faut prévoir une marge pour les imprévus.

## Votre entourage
- Toute la famille est-elle d’accord ?
- Y a-t-il des allergies ?
- Des enfants ? L’animal doit apprendre à les respecter, et eux à le respecter.
- Des animaux déjà présents ? La rencontre doit se faire progressivement.

## Les vacances et les imprévus
Qui gardera l’animal si vous partez, si vous êtes malade ou si vous déménagez ? Anticipez : c’est la première cause d’abandon.

## Choisir un animal qui vous ressemble
Un chien très énergique ne s’épanouira pas dans une vie tranquille, et un chat âgé ne cherchera pas à jouer toute la journée. **Ne choisissez pas sur l’apparence** : posez des questions sur son caractère, son histoire, ses habitudes.

## Prenez le temps d’échanger
Rencontrez l’animal plusieurs fois si c’est possible et posez toutes vos questions à l’association : c’est le moment idéal. Une bonne adoption, c’est un animal et une famille qui se conviennent.`,
  },

  {
    key: 'premiers-jours',
    category: 'Adoption',
    title: 'Les premiers jours d’un animal adopté',
    excerpt: 'Une nouvelle maison, de nouvelles odeurs, de nouveaux visages : comment aider votre chien ou votre chat à se sentir en sécurité.',
    content: `L’animal que vous venez d’adopter change de vie d’un coup : nouveau lieu, nouvelles odeurs, nouvelles personnes. Il a besoin de **calme, de repères et de patience**.

## Préparez la maison avant son arrivée
- Un coin tranquille avec un panier ou une couverture, de l’eau fraîche et une gamelle.
- Pour un chat : une litière, un endroit où se cacher, un griffoir.
- Rangez ce qui pourrait l’intriguer ou le blesser : fils électriques, produits ménagers, plantes toxiques, petits objets.

## Le jour de l’arrivée
- Laissez-le explorer à son rythme, sans le forcer à sortir de sa cachette.
- Évitez les visites, les fêtes et les câlins insistants les premiers jours.
- Pour un chat, gardez-le d’abord dans une seule pièce, puis ouvrez progressivement le reste de la maison.

## Installer une routine
Les repas, les sorties et le coucher à heures régulières le rassurent beaucoup. Ne changez pas brutalement son alimentation : mélangez l’ancienne et la nouvelle nourriture sur plusieurs jours.

## La rencontre avec les autres animaux
- Faites les présentations **progressivement**, en commençant par les odeurs (une couverture, un jouet).
- Évitez de les laisser seuls ensemble au début.
- Récompensez les comportements calmes.

## Patience : il lui faut du temps
On parle souvent du repère « 3 jours, 3 semaines, 3 mois » : quelques jours pour se poser, quelques semaines pour comprendre les règles, quelques mois pour se sentir vraiment chez soi. Certains animaux n’osent pas jouer, manger ou dormir devant vous au début : c’est normal.

## La visite chez le vétérinaire
Prévoyez un premier rendez-vous rapidement pour faire un bilan de santé, vérifier l’identification et faire le point sur les vaccins.

**Et si ça se passe mal ?** Une difficulté au début n’est pas un échec. N’hésitez pas à demander conseil à l’association ou à un vétérinaire, ou à un éducateur comportementaliste.`,
  },

  {
    key: 'canicule',
    category: 'Santé',
    title: 'Canicule : protéger son chien et son chat de la chaleur',
    excerpt: 'Un coup de chaleur peut être mortel en quelques minutes. Les gestes simples qui protègent vos animaux, et les signes qui doivent alerter.',
    content: `Chiens et chats ne transpirent pas comme nous : ils supportent très mal la chaleur. Un **coup de chaleur peut être mortel en quelques minutes**, mais il se prévient facilement.

## La règle absolue : jamais dans une voiture
Même les fenêtres entrouvertes, même à l’ombre, même « juste cinq minutes » : la température d’un véhicule monte très vite. Si vous voyez un animal enfermé et en détresse dans une voiture, appelez immédiatement le **17**.

## Au quotidien quand il fait chaud
- **Eau fraîche** à volonté, changée souvent, à plusieurs endroits.
- **Sorties** tôt le matin et tard le soir, jamais aux heures les plus chaudes.
- **Bitume** : posez le dos de votre main sur le sol pendant cinq secondes. Si c’est insupportable, c’est trop chaud pour ses coussinets.
- Un endroit **frais et ombragé** à la maison ; un tapis rafraîchissant peut aider.
- Pas d’exercice intense, pas de balade à vélo avec un chien par forte chaleur.
- Ne rasez pas à ras un chien à poils longs : le poil le protège aussi du soleil.

## Les animaux plus fragiles
Les chiens et les chats au nez écrasé (bouledogues, carlins, persans…), les animaux âgés, en surpoids ou malades supportent moins bien la chaleur. Redoublez de vigilance.

## Les signes du coup de chaleur
- Halètement intense et bruyant, langue très rouge ou pâle
- Bave abondante, agitation, puis grande faiblesse
- Vomissements, titubation, perte de connaissance

## Que faire en cas de doute ?
1. Mettez l’animal **à l’ombre, dans un endroit frais**, tout de suite.
2. Rafraîchissez-le progressivement avec de l’eau **tiède ou fraîche** (pas glacée), sur les pattes, le ventre et le cou.
3. Proposez de l’eau par petites quantités.
4. **Appelez sans attendre un vétérinaire** : même s’il semble aller mieux, il faut le faire examiner.`,
  },

  {
    key: 'aliments-toxiques',
    category: 'Santé',
    title: 'Ces aliments et produits qui empoisonnent chiens et chats',
    excerpt: 'Chocolat, raisins, oignon, lys… Ce qui est inoffensif pour nous peut être dangereux pour eux. La liste à connaître, et quoi faire en cas d’ingestion.',
    content: `Beaucoup de choses qui nous semblent inoffensives sont **dangereuses pour les chiens et les chats**. Certaines intoxications sont graves, d’autres passent inaperçues au début : mieux vaut savoir quoi éviter.

## Dans la cuisine
- **Chocolat et cacao** : toxique pour les chiens comme pour les chats, d’autant plus qu’il est noir.
- **Raisins et raisins secs** : peuvent provoquer une atteinte des reins chez le chien.
- **Oignon, ail, échalote, poireau** : abîment les globules rouges, surtout chez le chat.
- **Xylitol** : un édulcorant présent dans certains chewing-gums, bonbons et produits « sans sucre ». Très dangereux pour le chien.
- **Café, thé, boissons énergisantes** et **alcool**.
- **Os cuits**, surtout de volaille : ils se brisent en éclats.
- **Aliments très gras, salés ou épicés**, restes de table.

## À la maison et au jardin
- **Lys** : toutes les parties de la plante sont très toxiques pour le chat, même le pollen ou l’eau du vase.
- Certaines plantes d’intérieur et de jardin : renseignez-vous avant d’en acheter.
- **Produits ménagers, antigel, engrais, raticides et anti-limaces**.
- **Médicaments humains**, notamment le paracétamol et l’ibuprofène : ne donnez jamais un médicament sans avis vétérinaire.

## Que faire en cas d’ingestion ?
1. Éloignez l’animal du produit et gardez l’emballage.
2. **Appelez tout de suite votre vétérinaire** ou un centre antipoison vétérinaire : dites ce qu’il a avalé, en quelle quantité et à quelle heure.
3. **Ne le faites pas vomir** de votre propre initiative, sauf si un professionnel vous le demande : ce n’est pas toujours adapté.
4. Ne donnez ni lait, ni huile, ni « remède de grand-mère ».

**Les premiers signes** (vomissements, bave, tremblements, faiblesse, abattement) peuvent arriver plusieurs heures après. Dans le doute, appelez.`,
  },

  {
    key: 'sterilisation',
    category: 'Santé',
    title: 'Pourquoi faire stériliser son animal ?',
    excerpt: 'La stérilisation protège la santé de votre compagnon et limite les portées non désirées, l’une des causes de l’abandon. Ce qu’il faut savoir.',
    content: `La stérilisation est l’un des gestes les plus utiles pour un chien ou un chat. Elle protège l’animal, et elle limite le nombre d’animaux non désirés qui finissent abandonnés.

## Pour la santé de votre animal
- Elle réduit le risque de certaines maladies, notamment des infections de l’utérus et des tumeurs chez la femelle.
- Elle évite les grossesses répétées, qui épuisent l’organisme.
- Elle réduit certains comportements liés aux hormones : fugues, marquage urinaire, bagarres, miaulements de chaleurs.

## Pour éviter les portées non désirées
Une chatte peut avoir **plusieurs portées par an**, chacune de plusieurs chatons. Sans stérilisation, le nombre de chats errants augmente très vite, et beaucoup vivent dans de mauvaises conditions.

## À quel âge ?
L’âge dépend de l’espèce, de la taille et de l’animal : **demandez conseil à votre vétérinaire**, qui vous indiquera le bon moment. Chez la chatte, on stérilise souvent avant les premières chaleurs.

## Les idées reçues
- « Il faut qu’elle ait une portée avant » : c’est faux, rien ne l’exige.
- « Il va grossir » : le besoin en nourriture diminue un peu, il suffit d’adapter les rations.
- « Ça change son caractère » : l’animal reste le même, en général plus calme et plus câlin.

## Pour les chats qui vivent dehors
Beaucoup de chats libres ne sont pas stérilisés. Renseignez-vous auprès de votre mairie ou d’une association : des démarches existent pour les faire stériliser et identifier, afin de mieux les suivre.

## Le coût
C’est un investissement, mais bien moins lourd que celui de soins répétés ou de portées à placer. Certaines associations et collectivités proposent des aides : renseignez-vous.`,
  },

  {
    key: 'ne-pas-abandonner',
    category: 'Bons réflexes',
    title: 'Vous ne pouvez plus garder votre animal ? Ne l’abandonnez pas',
    excerpt: 'Déménagement, maladie, budget… Il arrive qu’on ne puisse plus s’occuper de son compagnon. Voici les solutions, avant d’en arriver à l’abandon.',
    content: `Un déménagement, un changement de situation, un problème de santé… Il arrive qu’on ne puisse plus garder son compagnon. C’est une décision douloureuse, et il existe des alternatives à l’abandon.

## L’abandon est interdit
Abandonner un animal est **un délit puni par la loi**, et une souffrance pour lui : un animal qui a toujours vécu en famille est perdu, affamé, en danger sur la route. Si vous êtes dans cette situation, il vaut toujours mieux demander de l’aide que le laisser.

## Avant d’en arriver là, cherchez des solutions
- **Parlez-en autour de vous** : famille, amis, voisins. Quelqu’un peut le garder temporairement, ou définitivement.
- **Pour un logement qui refuse les animaux** : renseignez-vous sur vos droits et cherchez des solutions de garde le temps de trouver.
- **Pour un souci de comportement** : un vétérinaire ou un éducateur comportementaliste peut souvent aider.
- **Pour un problème de budget** : parlez-en à votre vétérinaire, certaines aides et associations peuvent soutenir les soins.

## Si vraiment vous devez le confier
- **Contactez une association**, comme l’ASAD, en expliquant honnêtement la situation. Il peut y avoir des délais, mais c’est la meilleure façon de lui trouver une famille.
- Rassemblez son **carnet de santé**, ses papiers d’identification, et notez ses habitudes : ce qu’il mange, ce qu’il aime, ce qui lui fait peur.
- Évitez les annonces « gratuit, bon à donner » sans échange sérieux : préférez rencontrer les personnes et poser des questions.
- Ne le déposez pas devant un refuge ou dans la nature.

## Pensez à la prochaine fois
Avant d’adopter, réfléchissez à la durée de vie de l’animal (dix à vingt ans) et aux imprévus possibles. C’est le meilleur moyen d’éviter d’en arriver là.

**Vous avez un doute ou une question ?** Contactez-nous : nous vous écouterons sans jugement.`,
  },
];
