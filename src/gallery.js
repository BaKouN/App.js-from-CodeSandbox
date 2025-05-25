export const slides = [
  {
    name: 'clubMed',
    date: '2025-04-02',
    title: 'Le Club Med',
    body: "J'arrive toujours pas a croire que tu te rappelles pas que c'etait moi le mec de l'iPhone. \nTu te rappeles qu'on s'est promis d'y retourner au moins ?"
  },
  {
    name: 'btb1',
    date: '2025-04-06',
    title: 'Alors amis ou on se marie ?',
    body: "1st Date. Tu trouves que ca va trop vite ? \nBig Up JuicyGaets pour l'excuse parfaite de t'inviter et s/o Chris Brown pour les moves !"
  },
  {
    name: 'picnic1',
    date: '2025-04-10',
    title: 'Le Picnic du test',
    body: "La vie est un test. ce picnic l'etait tout autant. je cours, j'arrive en retard, mais finalement, les bricks on sauvés le date. \nT'en voudras pour ton retour ?"
  },
  {
    name: 'picnic2',
    date: '2025-04-10',
    title: 'Deja cute, non ?',
    body: "Franchement ton sourire sur cette photo me fait craquer. \nCa se voit que je commence a glisser deja, regarde comment j'suis penché même"
  },
  {
    name: 'basketDate',
    date: '2025-04-10',
    title: 'Panier ou Vérité ?',
    body: "Ma partie preferee de ce date, on etait tous les deux NULS NULS NULS au basket mais les questions etaient vreuuuumenmt \nMon style vestimentaire ne s'en remet pas."
  },
  {
    name: 'cafe1',
    date: '2025-04-13',
    title: 'Amour, gloire et café',
    body: "Ta vie, une telenovela \nTon ex qui croise ton sosie, Felipe qui lache pas l'affaire, hate de voir la saison deux !"
  },
  {
    name: 'cook1',
    date: '2025-04-16',
    title: 'Chef a domicile',
    body: "Vu que je paie pas le loyer, j'ai vite compris qu'il fallait se rendre utile. \nCombo cuisine + vaisselle, qui me test ?"  
  },
  {
    name: 'photobooth',
    date: '2025-04-18',
    title: 'Mamacitaaaaaa',
    body: "Bad Bunny. Toi en mode soirée pour la premiere fois. Moi qui fond telle neige au soleil en te voyant arriver."
  },
  {
    name: 'fievre3',
    date: '2025-04-25',
    title: "Unis contre nos opps",
    body: "La fievre, Grenoble Gang, et des Opps \nJe dis toujours que c'est la photo qu'on montrera a nos gosses"
  },
  {
    name: 'paparazzi2',
    date: '2025-04-25',
    title: 'Pas de photos !',
    body: "J'éspère que tu te sens famous parce que clairement c'est une photo de star ça"
  },
  {
    name: 'pizza2',
    date: '2025-05-02',
    title: 'Triple Pepperoni SVP',
    body: "C'etait pas les mardis fous, mais c'etait nos 1 mois ! \nJe sais pas si c'est la taille de la pizza ou le resto pour les 1 mois qui fait tout much "
  },
  {
    name: 'quai2',
    date: '2025-05-02',
    title: 'Loin des yeux, Pres de SDLV',
    body:
    'Je continuerai toute ma vie a te foutre la honte devant tes collegues. \n Tu peux essayer de changer de taff hein, je recommencerai'
  },
  {
    name: 'sofa',
    date: '2025-05-09',
    title: 'T\'es belle comme ca tout le temps ?',
    body: "C'est ce que je me dis meme quand on est posé chez toi, franchement comme je dis souvent. Que Dieu soit béni. \nPS : T'as le droit de choisir un hoodie pour le garder quand tu reviens"
  },
  {
    name: 'blueDressJeMeurs5',
    date: '2025-05-18',
    title: 'LA Robe Bleue',
    body: "Quand t'es arrivée en bas de chez toi, j'ai perdu la voix pendant 5 minutes. \nT'es vraiment la déesse que tu penses être, je suis tellement heureux d'avoir une femme aussi radieuse que toi. "
  },
  {
    name: 'ghibliBasket',
    date: '2024-06-09',
    title: "Joyeux Anniversaire Emma !",
    ext: 'PNG',
    body: "J'espere que tu as kiffé ta journée, que tu as kiffé le cadeau \nJe suis tres chanceux de t'avoir dans ma vie, tu fais de moi un homme meilleur tous les jours et je te remercie pour ca. Je t'attends avec impatience, tu me manques mimi."
    },
].map((s) => ({
  url: `/${s.name}.${s.ext ?? 'webp'}`,
  date: s.date,
  title: s.title,
  body: s.body
}));