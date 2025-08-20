/**
 * Zotero Item Types Configuration
 * Defines all supported item types with their fields and labels
 */

export const ITEM_TYPES = {
  book: {
    label: 'Livre',
    icon: '📚',
    fields: ['title', 'creators', 'date', 'publisher', 'place', 'ISBN', 'edition', 'volume', 'series', 'numPages', 'language', 'abstractNote', 'url', 'extra']
  },
  bookSection: {
    label: 'Chapitre de livre',
    icon: '📖',
    fields: ['title', 'creators', 'bookTitle', 'date', 'publisher', 'place', 'pages', 'ISBN', 'language', 'abstractNote', 'url', 'extra']
  },
  journalArticle: {
    label: 'Article de revue',
    icon: '📄',
    fields: ['title', 'creators', 'publicationTitle', 'volume', 'issue', 'pages', 'date', 'DOI', 'ISSN', 'language', 'abstractNote', 'url', 'extra']
  },
  magazineArticle: {
    label: 'Article de magazine',
    icon: '📰',
    fields: ['title', 'creators', 'publicationTitle', 'volume', 'issue', 'pages', 'date', 'ISSN', 'language', 'abstractNote', 'url', 'extra']
  },
  newspaperArticle: {
    label: 'Article de journal',
    icon: '🗞️',
    fields: ['title', 'creators', 'publicationTitle', 'section', 'pages', 'date', 'place', 'language', 'abstractNote', 'url', 'extra']
  },
  conferencePaper: {
    label: 'Article de colloque',
    icon: '🎤',
    fields: ['title', 'creators', 'proceedingsTitle', 'conferenceName', 'place', 'date', 'pages', 'DOI', 'language', 'abstractNote', 'url', 'extra']
  },
  encyclopediaArticle: {
    label: 'Article d\'encyclopédie',
    icon: '📚',
    fields: ['title', 'creators', 'encyclopediaTitle', 'date', 'publisher', 'place', 'pages', 'language', 'abstractNote', 'url', 'extra']
  },
  dictionaryEntry: {
    label: 'Entrée de dictionnaire',
    icon: '📖',
    fields: ['title', 'creators', 'dictionaryTitle', 'date', 'publisher', 'place', 'pages', 'language', 'abstractNote', 'url', 'extra']
  },
  webpage: {
    label: 'Page Web',
    icon: '🌐',
    fields: ['title', 'creators', 'websiteTitle', 'websiteType', 'date', 'accessDate', 'language', 'abstractNote', 'url', 'extra']
  },
  thesis: {
    label: 'Thèse',
    icon: '🎓',
    fields: ['title', 'creators', 'thesisType', 'university', 'place', 'date', 'numPages', 'language', 'abstractNote', 'url', 'extra']
  },
  manuscript: {
    label: 'Manuscrit',
    icon: '📜',
    fields: ['title', 'creators', 'manuscriptType', 'place', 'date', 'numPages', 'archive', 'archiveLocation', 'callNumber', 'language', 'abstractNote', 'url', 'extra']
  },
  interview: {
    label: 'Interview',
    icon: '🎙️',
    fields: ['title', 'creators', 'medium', 'interviewMedium', 'date', 'place', 'language', 'abstractNote', 'url', 'extra']
  },
  artwork: {
    label: 'Illustration',
    icon: '🎨',
    fields: ['title', 'creators', 'artworkMedium', 'artworkSize', 'date', 'place', 'language', 'abstractNote', 'url', 'extra']
  },
  videoRecording: {
    label: 'Film',
    icon: '🎬',
    fields: ['title', 'creators', 'studio', 'place', 'date', 'runningTime', 'language', 'abstractNote', 'url', 'extra']
  },
  radioBroadcast: {
    label: 'Émission radio',
    icon: '📻',
    fields: ['title', 'creators', 'programTitle', 'network', 'place', 'date', 'runningTime', 'language', 'abstractNote', 'url', 'extra']
  },
  tvBroadcast: {
    label: 'Émission TV',
    icon: '📺',
    fields: ['title', 'creators', 'programTitle', 'network', 'place', 'date', 'runningTime', 'episodeNumber', 'language', 'abstractNote', 'url', 'extra']
  },
  presentation: {
    label: 'Présentation',
    icon: '💼',
    fields: ['title', 'creators', 'presentationType', 'meetingName', 'place', 'date', 'language', 'abstractNote', 'url', 'extra']
  },
  blogPost: {
    label: 'Billet de blog',
    icon: '✍️',
    fields: ['title', 'creators', 'blogTitle', 'date', 'accessDate', 'language', 'abstractNote', 'url', 'extra']
  },
  document: {
    label: 'Document',
    icon: '📄',
    fields: ['title', 'creators', 'date', 'publisher', 'place', 'language', 'abstractNote', 'url', 'extra']
  }
};

export const FIELD_LABELS = {
  title: 'Titre',
  creators: 'Auteurs',
  date: 'Date de publication',
  originalDate: 'Date de publication originale',
  publisher: 'Maison d\'édition',
  place: 'Lieu',
  language: 'Langue',
  abstractNote: 'Résumé',
  url: 'URL',
  extra: 'Extra',
  
  // Book fields
  ISBN: 'ISBN',
  edition: 'Édition',
  volume: 'Volume',
  series: 'Collection',
  numPages: 'Nombre de pages',
  numberOfVolumes: 'Nombre de volumes',
  seriesNumber: 'Numéro dans la collection',
  
  // Book section fields
  bookTitle: 'Titre du livre',
  pages: 'Pages',
  
  // Article fields
  publicationTitle: 'Publication',
  issue: 'Numéro',
  DOI: 'DOI',
  ISSN: 'ISSN',
  journalAbbreviation: 'Abréviation de la revue',
  section: 'Section',
  
  // Conference fields
  proceedingsTitle: 'Titre des actes',
  conferenceName: 'Nom de la conférence',
  
  // Encyclopedia fields
  encyclopediaTitle: 'Titre de l\'encyclopédie',
  dictionaryTitle: 'Titre du dictionnaire',
  
  // Web fields
  websiteTitle: 'Titre du site web',
  websiteType: 'Type de site web',
  accessDate: 'Date d\'accès',
  
  // Thesis fields
  university: 'Université',
  thesisType: 'Type de thèse',
  
  // Manuscript fields
  manuscriptType: 'Type de manuscrit',
  archive: 'Archive',
  archiveLocation: 'Localisation dans l\'archive',
  callNumber: 'Cote',
  
  // Media fields
  medium: 'Support',
  interviewMedium: 'Support de l\'interview',
  artworkMedium: 'Technique',
  artworkSize: 'Dimensions',
  studio: 'Studio',
  runningTime: 'Durée',
  programTitle: 'Titre du programme',
  network: 'Chaîne',
  episodeNumber: 'Numéro d\'épisode',
  
  // Presentation fields
  presentationType: 'Type de présentation',
  meetingName: 'Nom de la rencontre',
  
  // Blog fields
  blogTitle: 'Titre du blog',
  
  // Common fields
  rights: 'Droits'
};

export const CREATOR_TYPES = {
  author: 'Auteur',
  contributor: 'Collaborateur',
  editor: 'Éditeur',
  translator: 'Traducteur',
  seriesEditor: 'Directeur de collection',
  bookAuthor: 'Auteur du livre',
  director: 'Réalisateur',
  producer: 'Producteur',
  performer: 'Interprète',
  interviewer: 'Intervieweur',
  interviewee: 'Personne interviewée',
  artist: 'Artiste',
  presenter: 'Présentateur'
};

export const SPECIAL_COLLECTIONS = [
  {
    key: 'duplicates',
    data: { name: 'Doublons' },
    icon: '📑',
    special: true
  },
  {
    key: 'uncategorized',
    data: { name: 'Non classés' },
    icon: '📄',
    special: true
  },
  {
    key: 'trash',
    data: { name: 'Corbeille' },
    icon: '🗑️',
    special: true
  }
];

/**
 * Get item type configuration
 */
export function getItemType(itemType) {
  return ITEM_TYPES[itemType] || ITEM_TYPES.document;
}

/**
 * Get field label
 */
export function getFieldLabel(field) {
  return FIELD_LABELS[field] || field;
}

/**
 * Get creator type label
 */
export function getCreatorTypeLabel(creatorType) {
  return CREATOR_TYPES[creatorType] || 'Auteur';
}

/**
 * Create default item data
 */
export function createDefaultItem(itemType = 'book') {
  return {
    itemType,
    title: '',
    creators: [{ creatorType: 'author', firstName: '', lastName: '' }],
    date: '',
    language: 'fr',
    place: '',
    publisher: '',
    extra: '',
    originalDate: '',
    abstractNote: '',
    url: '',
    accessDate: '',
    rights: '',
    archive: '',
    archiveLocation: '',
    callNumber: '',
    edition: '',
    volume: '',
    numberOfVolumes: '',
    series: '',
    seriesNumber: '',
    ISBN: '',
    numPages: '',
    bookTitle: '',
    publicationTitle: '',
    issue: '',
    pages: '',
    ISSN: '',
    DOI: '',
    journalAbbreviation: '',
    section: '',
    proceedingsTitle: '',
    conferenceName: '',
    encyclopediaTitle: '',
    dictionaryTitle: '',
    websiteTitle: '',
    websiteType: '',
    university: '',
    thesisType: '',
    manuscriptType: '',
    medium: '',
    interviewMedium: '',
    artworkMedium: '',
    artworkSize: '',
    studio: '',
    runningTime: '',
    programTitle: '',
    network: '',
    episodeNumber: '',
    presentationType: '',
    meetingName: '',
    blogTitle: ''
  };
}