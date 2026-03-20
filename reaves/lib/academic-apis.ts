import { Source } from '@/types';

export interface SemanticScholarPaper {
  paperId: string;
  title: string;
  authors: { name: string }[];
  year: number;
  venue: string;
  citationCount: number;
  isOpenAccess: boolean;
  externalIds: { DOI?: string };
  abstract: string;
}

export async function searchSemanticScholar(query: string, limit = 5): Promise<Partial<Source>[]> {
  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['x-api-key'] = apiKey;

  const fields = 'paperId,title,authors,year,venue,citationCount,isOpenAccess,externalIds,abstract';
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=${fields}`;

  try {
    const res = await fetch(url, { headers, next: { revalidate: 300 } });
    if (!res.ok) return [];
    
    const data = await res.json();
    if (!data.data) return [];

    return (data.data as SemanticScholarPaper[]).map((paper) => ({
      id: paper.paperId,
      title: paper.title,
      authors: paper.authors?.map((a) => a.name).join(', ') || 'Unknown',
      year: paper.year,
      journal: paper.venue || 'Unknown Journal',
      doi: paper.externalIds?.DOI || '',
      abstract: paper.abstract || '',
      trust_factors: {
        peer_reviewed: true,
        citation_count: paper.citationCount || 0,
        author_hindex: 0,
        recency_years: paper.year ? new Date().getFullYear() - paper.year : 10,
        open_access: paper.isOpenAccess || false,
      },
    }));
  } catch {
    return [];
  }
}

export async function searchPubMed(query: string, limit = 5): Promise<Partial<Source>[]> {
  try {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${limit}&retmode=json`;
    const searchRes = await fetch(searchUrl, { next: { revalidate: 300 } });
    if (!searchRes.ok) return [];

    const searchData = await searchRes.json();
    const ids: string[] = searchData.esearchresult?.idlist || [];
    if (ids.length === 0) return [];

    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const summaryRes = await fetch(summaryUrl, { next: { revalidate: 300 } });
    if (!summaryRes.ok) return [];

    const summaryData = await summaryRes.json();
    const result = summaryData.result;
    if (!result) return [];

    return ids.map((id) => {
      const paper = result[id];
      if (!paper) return null;
      return {
        id: `pubmed-${id}`,
        title: paper.title || 'Untitled',
        authors: paper.authors?.map((a: { name: string }) => a.name).join(', ') || 'Unknown',
        year: parseInt(paper.pubdate?.split(' ')[0] || '0'),
        journal: paper.fulljournalname || paper.source || 'PubMed',
        doi: paper.elocationid?.replace('doi: ', '') || '',
        abstract: '',
        trust_factors: {
          peer_reviewed: true,
          citation_count: 0,
          author_hindex: 0,
          recency_years: 0,
          open_access: false,
        },
      };
    }).filter(Boolean) as Partial<Source>[];
  } catch {
    return [];
  }
}
