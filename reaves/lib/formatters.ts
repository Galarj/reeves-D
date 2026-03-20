import { Source, CitationFormat } from '@/types';

export function formatCitation(source: Source, format: CitationFormat): string {
  const authors = source.authors || 'Unknown Author';
  const year = source.year || 'n.d.';
  const title = source.title || 'Untitled';
  const journal = source.journal || '';
  const doi = source.doi ? `https://doi.org/${source.doi}` : '';

  switch (format) {
    case 'APA': {
      // Author, A. A., & Author, B. B. (Year). Title of article. Journal Name. https://doi.org/xxx
      const doiPart = doi ? ` ${doi}` : '';
      const journalPart = journal ? ` ${journal}.` : '';
      return `${authors} (${year}). ${title}.${journalPart}${doiPart}`;
    }

    case 'MLA': {
      // Author. "Title of Article." Journal Name, Year. DOI.
      const doiPart = doi ? ` ${doi}.` : '';
      const journalPart = journal ? ` ${journal},` : '';
      return `${authors}. "${title}."${journalPart} ${year}.${doiPart}`;
    }

    case 'Chicago': {
      // Author. "Title of Article." Journal Name (Year). DOI.
      const doiPart = doi ? ` ${doi}.` : '';
      const journalPart = journal ? ` ${journal}` : '';
      return `${authors}. "${title}."${journalPart} (${year}).${doiPart}`;
    }

    default:
      return `${authors} (${year}). ${title}.`;
  }
}
