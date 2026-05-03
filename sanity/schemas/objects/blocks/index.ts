// Re-export tous les blocs polymorphes utilisables dans les pages editoriales.
export { imageTextBlock } from './imageTextBlock';
export { gridImagesBlock } from './gridImagesBlock';
export { quoteBlock } from './quoteBlock';
export { ctaBlock } from './ctaBlock';
export { factsBlock } from './factsBlock';
export { linksBlock } from './linksBlock';

// Liste des `_type` accepte dans le tableau `sections` d'une page.
// Reutilisable directement : `of: SECTION_BLOCKS`.
export const SECTION_BLOCKS = [
  { type: 'imageTextBlock' },
  { type: 'gridImagesBlock' },
  { type: 'quoteBlock' },
  { type: 'ctaBlock' },
  { type: 'factsBlock' },
  { type: 'linksBlock' },
];
