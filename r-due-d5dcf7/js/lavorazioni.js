window.LAVORAZIONI = [
  {
    id: 'carrozzeria', nome: 'Carrozzeria e riparazioni',
    frase: 'Danni lievi e danni gravi, su ogni marca e con ogni polizza.',
    voci: ['Riparazione di qualsiasi casa automobilistica', 'Ogni compagnia, con o senza scatola nera', 'RCA, indennizzo diretto, CID doppia firma, kasko', 'Furto e incendio, atti vandalici, eventi naturali', 'Danni da animali selvatici e da manto stradale', 'Veicoli esteri e fondo vittime della strada', 'Spot repair', 'Paraurti in plastica e vetroresina', 'Microcar', 'Raddrizzatura scocche al banco dima', 'Certificato di garanzia sui lavori'],
    foto: [
      { src: 'img/lav/carrozzeria-cofano.webp', w: 900, h: 538, alt: 'Cofano di BMW in fondo grigio, auto mascherata', dida: 'Cofano in fondo, prima della vernice' },
      { src: 'img/lav/carrozzeria-banco.webp', w: 640, h: 480, alt: 'Auto ancorata al banco dima', dida: 'Scocca al banco dima' },
    ],
  },
  {
    id: 'verniciature', nome: 'Verniciature',
    frase: 'Uguale al primo impianto, oppure come non l\'ha mai fatta nessuno.',
    voci: ['Tradizionali come da primo impianto', 'Pastello, metallizzato, perlato, micalizzato', 'Opache e satinate', 'Camaleontiche e cangianti', 'Bicolore', 'Colore letto con lo spettrofotometro', 'Vernici all\'acqua, in cabina'],
    foto: [
      { src: 'img/lav/verniciature-cabina.webp', w: 900, h: 538, alt: 'BMW Serie 4 in cabina, blu appena spruzzato', dida: 'In cabina, vernice appena stesa' },
      { src: 'img/lav/verniciature-opaca.webp', w: 640, h: 480, alt: 'Mercedes station wagon in rosso opaco', dida: 'Rosso opaco' },
    ],
  },
  {
    id: 'ausiliari', nome: 'Lavori ausiliari',
    frase: 'I lavori piccoli che si notano.',
    voci: ['Verniciatura pinze freno', 'Mostrine e modanature interne, in qualsiasi colore', 'Pellicola trasparente antisasso', 'Grandine: levabolli, senza stucco né vernice', 'Terminali di scarico da cromati a neri'],
    foto: [
      { src: 'img/lav/ausiliari-antisasso.webp', w: 550, h: 480, mani: true, alt: 'Mani che stendono la pellicola antisasso sul parafango', dida: 'Pellicola antisasso, stesa a mano' },
      { src: 'img/lav/ausiliari-pinze.webp', w: 640, h: 480, alt: 'Pinza freno rossa dietro un cerchio', dida: 'Pinze verniciate' },
    ],
  },
  {
    id: 'tuning', nome: 'Tuning e personalizzazioni',
    frase: 'Dal ritocco leggero alla modifica completa, chiavi in mano.',
    voci: ['Kit estetici per auto, suv e fuoristrada', 'Spoiler, portiere ad apertura verticale, angel eyes', 'Modifiche ai cofani', 'Modifiche a paraurti e parafanghi', 'Soft tuning o extreme tuning', 'Kit procurato e montato, con certificato di garanzia'],
    nota: 'In Italia non tutte le modifiche sono omologabili. Si guarda prima.',
    foto: [
      { src: 'img/lav/tuning-megane.webp', w: 731, h: 480, alt: 'Renault Megane bianca e nera con la grafica R Due', dida: 'Megane R Due' },
      { src: 'img/lav/tuning-smart.webp', w: 640, h: 480, alt: 'Smart con vernice cangiante', dida: 'Smart cangiante' },
    ],
  },
  {
    id: 'detailing', nome: 'Detailing',
    frase: 'Ogni parte dell\'auto ha il suo trattamento. A mano.',
    voci: ['Lucidatura a specchio', 'Swirl, ologrammi, ossidazione, buccia d\'arancia', 'Pulizia e ricondizionamento degli interni', 'Pelle, alcantara, plastiche e cruscotti', 'Sanificazione all\'ozono e del condizionatore', 'Capote', 'Vano motore', 'Anche moto, camper, van, quad, moto d\'acqua, microcar'],
    foto: [
      { src: 'img/lav/detailing-lucidatura.webp', w: 640, h: 480, mani: true, alt: 'Lucidatura del paraurti di una Porsche nera', dida: 'Lucidatura a mano' },
      { src: 'img/lav/detailing-porsche.webp', w: 640, h: 480, mani: true, alt: 'Porsche nera in lavorazione in officina', dida: 'Porsche in officina' },
    ],
  },
  {
    id: 'nanotecnologia', nome: 'Nanotecnologia',
    frase: 'Una barriera invisibile che tiene lontano sporco e acqua.',
    voci: ['Carrozzeria, vetri, cerchi, interni e capote', 'Protezione dai raggi UV', 'Idrorepellente', 'Per auto, moto, camper, van e camion', 'Trattamenti per auto wrappate', 'Trattamenti per vernici opache e satinate'],
    foto: [
      { src: 'img/lav/nano-pistola.webp', w: 422, h: 423, mani: true, alt: 'Applicazione con la pistola sul parafango di un\'auto grigia', dida: 'Applicazione sul parafango' },
      { src: 'img/lav/nano-cupra.webp', w: 900, h: 720, alt: 'Cupra grigio opaco trattata, vista da dietro', dida: 'Cupra trattata su interni, esterni, vetri e cerchi' },
    ],
  },
  {
    id: 'glass', nome: 'Glass',
    frase: 'Vetri riparati, sostituiti o oscurati.',
    voci: ['Riparazione parabrezza con resina', 'Sostituzione di parabrezza, lunotti e finestrini', 'Polizza cristalli', 'Pellicole oscuranti', 'Fasce parasole sagomate', 'Eliminazione dei graffi dai cristalli', 'Trattamenti idrorepellenti'],
    foto: [
      { src: 'img/lav/glass-graffi.webp', w: 826, h: 476, mani: true, alt: 'Eliminazione dei graffi dal parabrezza, auto protetta dalla carta', dida: 'Graffi tolti dal parabrezza' },
      { src: 'img/lav/glass-parabrezza.webp', w: 640, h: 374, mani: true, alt: 'Lavoro sul parabrezza con l\'auto mascherata', dida: 'Auto protetta, si lavora solo sul vetro' },
    ],
  },
  {
    id: 'wrapping', nome: 'Wrapping',
    frase: 'Cambi colore con una pellicola. La vernice sotto resta intatta.',
    voci: ['Cambio colore integrale o parziale', 'Tetto, specchi, cofano', 'Opaco, metallizzato, perlato, cromato, carbon look', 'Stampati personalizzati', 'Interni e cruscotti', 'Camper, caravan, van e cargo', 'Moto, scooter, quad, microcar', 'Moto d\'acqua e barche'],
    foto: [
      { src: 'img/lav/wrapping-ferrari.webp', w: 640, h: 480, mani: true, alt: 'Ferrari F430 grigia rivestita a mano con pellicola bianca', dida: 'Una Ferrari vera, in officina da loro' },
      { src: 'img/lav/wrapping-ferrari-mani.webp', w: 576, h: 365, mani: true, alt: 'Due persone stendono la pellicola bianca', dida: 'La pellicola si stende in due' },
      { src: 'img/lav/wrapping-ferrari-dopo.webp', w: 640, h: 375, alt: 'La stessa Ferrari finita in bianco, di profilo', dida: 'La stessa Ferrari, finita' },
    ],
  },
  {
    id: 'cubicatura', nome: 'Cubicatura',
    frase: 'La decorazione si trasferisce in acqua e poi si vernicia sopra.',
    voci: ['Calotte specchi, maniglie, modanature', 'Cruscotti, pomelli del cambio, volanti', 'Carene di moto e caschi', 'Effetto carbonio, alluminio spazzolato', 'Radica, legno, marmo, mimetico', 'Finitura trasparente lucida o opaca'],
    foto: [
      { src: 'img/lav/cubicatura-calotta.webp', w: 640, h: 480, alt: 'Calotta dello specchietto cubicata effetto carbonio', dida: 'Calotta effetto carbonio' },
      { src: 'img/lav/cubicatura-specchio.webp', w: 640, h: 480, alt: 'Specchietto cubicato montato su un\'auto azzurra', dida: 'Montata sull\'auto' },
    ],
  },
  {
    id: 'illuminazione', nome: 'Illuminazione',
    frase: 'Fari che tornano trasparenti, e fanali su misura.',
    voci: ['Rigenerazione fari ingialliti o opachi', 'Oscuramento dei fanali posteriori', 'Da alogena a xenon e bixenon', 'Da alogena a LED'],
    nota: 'L\'oscuramento dei fanali e alcune trasformazioni non sono omologati: te lo diciamo prima.',
    foto: [
      { src: 'img/lav/illuminazione-faro.webp', w: 615, h: 408, alt: 'Frontale di Fiat Punto con i fari rigenerati', dida: 'Fari rigenerati' },
      { src: 'img/lav/illuminazione-fanale.webp', w: 640, h: 480, alt: 'Grande Punto bianca con fanali posteriori scuri', dida: 'Fanali posteriori scuri' },
    ],
  },
  {
    id: 'wheels', nome: 'Wheels',
    frase: 'Cerchi smontati, verniciati in cabina e rimontati.',
    voci: ['Verniciatura cerchi in lega, anche bicolore', 'Cerchi di moto e scooter', 'Vendita e montaggio cerchi omologati', 'Kit ruotino di scorta'],
    foto: [
      { src: 'img/lav/wheels-cabina.webp', w: 640, h: 480, alt: 'Cerchi in lega appesi in cabina di verniciatura', dida: 'Cerchi in cabina' },
      { src: 'img/lav/wheels-neri.webp', w: 640, h: 480, alt: 'Cerchi neri appena verniciati', dida: 'Verniciati di nero' },
    ],
  },
  {
    id: 'restauro', nome: 'Restauro',
    frase: 'Auto, moto, Vespe e Lambrette d\'epoca, riportate a posto.',
    voci: ['Auto e moto d\'epoca', 'Vespe e Lambrette', 'Antiruggine e risanamento della carrozzeria', 'Dall\'esterno agli interni', 'Pelle di sedili e cruscotti'],
    foto: [
      { src: 'img/lav/restauro-mustang.webp', w: 640, h: 423, alt: 'Ford Mustang d\'epoca davanti alla sede', dida: 'Mustang davanti alla sede' },
      { src: 'img/lav/restauro-porsche.webp', w: 640, h: 480, alt: 'Porsche d\'epoca in cabina con la carta di mascheratura', dida: 'Porsche d\'epoca, mascherata per la vernice' },
    ],
  },
];
