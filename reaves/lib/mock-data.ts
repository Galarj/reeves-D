// Mock data for demo mode — zero API calls, works offline
import { ClarifierResponse, SearchResult, BiasFlag, ThesisResponse, JargonResponse, CompareResponse } from '@/types';

// ============ MOCK CLARIFIER ============
export function getMockClarifier(query: string): ClarifierResponse {
  const q = query.toLowerCase();

  if (q.includes('social media') && q.includes('mental health')) {
    return {
      ambiguous: true,
      clarifier_question: 'Are you focusing on adolescents, adults, or platform-specific effects?',
      options: ['Adolescents (13–18)', 'College-age adults (18–25)', 'Platform-specific (e.g., TikTok, Instagram)'],
      refined_queries: [
        'Impact of social media use on adolescent mental health outcomes',
        'Effects of social media on mental health in college-age adults',
        'Platform-specific mental health effects of TikTok and Instagram',
      ],
    };
  }

  if (q.includes('climate') || q.includes('global warming')) {
    return {
      ambiguous: true,
      clarifier_question: 'Which aspect of climate change are you investigating?',
      options: ['Biodiversity and ecosystems', 'Economic impact on agriculture', 'Public health consequences'],
      refined_queries: [
        'Climate change effects on global biodiversity and ecosystem collapse',
        'Economic impact of climate change on agricultural productivity',
        'Climate change consequences for public health and disease spread',
      ],
    };
  }

  if (q.includes('ai') || q.includes('artificial intelligence')) {
    return {
      ambiguous: true,
      clarifier_question: 'Which dimension of AI are you exploring?',
      options: ['AI in education and learning', 'AI ethics and bias', 'AI impact on employment'],
      refined_queries: [
        'Artificial intelligence applications in personalized education',
        'Ethical implications and bias in AI decision-making systems',
        'Impact of AI automation on workforce employment trends',
      ],
    };
  }

  if (q.includes('crispr') || q.includes('gene editing')) {
    return {
      ambiguous: true,
      clarifier_question: 'Which application of CRISPR interests you most?',
      options: ['Cancer treatment therapies', 'Genetic disease prevention', 'Agricultural applications'],
      refined_queries: [
        'CRISPR-Cas9 applications in targeted cancer treatment therapies',
        'CRISPR gene editing for inherited genetic disease prevention',
        'CRISPR applications in crop improvement and agricultural yield',
      ],
    };
  }

  // Default: not ambiguous
  return {
    ambiguous: false,
    clarifier_question: '',
    options: [],
    refined_queries: [],
  };
}

// ============ MOCK SEARCH RESULTS ============
export function getMockSearchResult(query: string): SearchResult {
  const q = query.toLowerCase();

  // Social media / mental health
  if (q.includes('social media') || q.includes('mental health') || q.includes('adolescent')) {
    return {
      sources: [
        {
          id: 's1',
          title: 'Association Between Social Media Use and Depression Among U.S. Young Adults',
          authors: 'Liu, M., Pew, R., Kellerman, J.',
          year: 2023,
          journal: 'JAMA Psychiatry',
          trust_score: 92,
          trust_factors: { peer_reviewed: true, citation_count: 847, author_hindex: 45, recency_years: 2, open_access: true },
          trust_reason: 'Published in a top-tier psychiatric journal with very high citation count and authored by experts with strong H-indices.',
          abstract: 'This longitudinal study followed 5,000 young adults over 3 years. Results show a dose-response relationship between social media use exceeding 3 hours daily and increased depressive symptoms (OR=2.1, 95% CI 1.6–2.8). The association was strongest for passive consumption vs. active posting.',
          doi: '10.1001/jamapsychiatry.2023.0001',
        },
        {
          id: 's2',
          title: 'Instagram, TikTok, and Adolescent Mental Health: A Systematic Review',
          authors: 'Chen, W., Garcia, S., Thompson, K.',
          year: 2024,
          journal: 'The Lancet Digital Health',
          trust_score: 88,
          trust_factors: { peer_reviewed: true, citation_count: 312, author_hindex: 28, recency_years: 1, open_access: false },
          trust_reason: 'Recent systematic review in a high-impact Lancet journal, synthesizing 47 studies. Strong methodology but not open access.',
          abstract: 'Systematic review of 47 studies (N=120,000+) examining platform-specific mental health effects. Instagram was associated with body image issues (effect size d=0.45) while TikTok showed stronger associations with attention difficulties and sleep disruption.',
          doi: '10.1016/S2589-7500(24)00021-3',
        },
        {
          id: 's3',
          title: 'Cyberbullying, Social Comparison, and Self-Esteem in Teens: A Meta-Analysis',
          authors: 'Rodriguez, A., Patel, N.',
          year: 2022,
          journal: 'Journal of Youth and Adolescence',
          trust_score: 79,
          trust_factors: { peer_reviewed: true, citation_count: 189, author_hindex: 19, recency_years: 3, open_access: true },
          trust_reason: 'Solid meta-analysis in a well-regarded journal, though author H-index is moderate. Open access increases reach.',
          abstract: 'Meta-analysis of 32 studies confirms that social comparison on social media predicts lower self-esteem (r=−0.31) and cyberbullying victimization increases depressive symptoms by 40%. Protective factors include parental mediation and digital literacy education.',
          doi: '10.1007/s10964-022-01654-8',
        },
        {
          id: 's4',
          title: 'Positive Uses of Social Media for Adolescent Well-Being: A Scoping Review',
          authors: 'Kim, J., Huang, L., Okonkwo, E.',
          year: 2023,
          journal: 'Computers in Human Behavior',
          trust_score: 71,
          trust_factors: { peer_reviewed: true, citation_count: 95, author_hindex: 15, recency_years: 2, open_access: false },
          trust_reason: 'Peer-reviewed and recent, but lower citation count and moderate H-index. Offers important counterpoint to deficit-focused research.',
          abstract: 'Scoping review finding that identity exploration, peer support groups, and creative expression on social media can enhance well-being. LGBTQ+ youth reported particular benefits from online community belonging. However, benefits were contingent on active (vs. passive) use patterns.',
          doi: '10.1016/j.chb.2023.107812',
        },
        {
          id: 's5',
          title: 'Screen Time Guidelines and Mental Health Outcomes in Adolescents: A Cross-National Study',
          authors: 'Williams, R., Tanaka, H., Dubois, P.',
          year: 2024,
          journal: 'Nature Human Behaviour',
          trust_score: 95,
          trust_factors: { peer_reviewed: true, citation_count: 1203, author_hindex: 52, recency_years: 1, open_access: true },
          trust_reason: 'Published in Nature sub-journal with exceptional citation count and top-tier author credentials. Cross-national design strengthens generalizability.',
          abstract: 'Study across 15 countries (N=200,000 adolescents) found that the relationship between screen time and mental health follows an inverted U-curve. Moderate use (1–2 hrs/day) was associated with slightly better well-being than no use. Harms escalated sharply above 4 hrs/day.',
          doi: '10.1038/s41562-024-01892-7',
        },
      ],
      synthesis: 'The literature converges on a dose-dependent relationship between social media use and adolescent mental health, with harmful effects becoming significant above 3–4 hours of daily use. However, the relationship is not uniformly negative — moderate, active use can support identity development and peer connection, particularly for marginalized youth. Platform-specific effects vary, with Instagram linked to body image issues and TikTok to attention disruption. Protective factors include digital literacy education and parental mediation.',
      agreements: [
        'Excessive use (3+ hrs/day) linked to depression',
        'Passive scrolling worse than active posting',
        'Cyberbullying strongly predicts negative outcomes',
        'Parental mediation is a protective factor',
      ],
      conflicts: [
        'Whether moderate use is beneficial or neutral',
        'Causality vs. correlation debate remains open',
        'Cultural variation in effects across countries',
      ],
      research_gaps: [
        { gap: 'Longitudinal studies on TikTok-specific effects', angle: 'Track cohort of TikTok users over 2+ years measuring attention and mood' },
        { gap: 'Intervention effectiveness for digital literacy programs', angle: 'RCT comparing school-based digital wellness curricula' },
        { gap: 'Neurodevelopmental mechanisms linking screen time to adolescent brain changes', angle: 'fMRI studies of reward pathway activation during social media use' },
      ],
    };
  }

  // CRISPR / gene editing / cancer
  if (q.includes('crispr') || q.includes('gene editing') || q.includes('cancer')) {
    return {
      sources: [
        {
          id: 's1',
          title: 'CRISPR-Cas9 in Cancer Therapy: Current Applications and Future Prospects',
          authors: 'Zhang, F., Doudna, J., Chen, L.',
          year: 2024,
          journal: 'Nature Reviews Cancer',
          trust_score: 96,
          trust_factors: { peer_reviewed: true, citation_count: 1580, author_hindex: 85, recency_years: 1, open_access: false },
          trust_reason: 'Flagship review by pioneers in the CRISPR field, published in the top oncology review journal with exceptional citations.',
          abstract: 'Comprehensive review of CRISPR-Cas9 applications in oncology, covering gene knockout for tumor suppressors, CAR-T cell enhancement, and targeted delivery. Clinical trials show 40% response rates in refractory leukemia using CRISPR-edited T cells.',
          doi: '10.1038/s41568-024-00681-2',
        },
        {
          id: 's2',
          title: 'Phase I Trial of CRISPR-Enhanced CAR-T Cells for Relapsed B-Cell Lymphoma',
          authors: 'Stadtmauer, E., Fraietta, J., Lacey, S.',
          year: 2023,
          journal: 'New England Journal of Medicine',
          trust_score: 94,
          trust_factors: { peer_reviewed: true, citation_count: 920, author_hindex: 60, recency_years: 2, open_access: true },
          trust_reason: 'Published in the world\'s most prestigious medical journal. First-in-human trial data with rigorous methodology.',
          abstract: 'First-in-human Phase I trial (n=12) using CRISPR to knock out PD-1 in CAR-T cells targeting CD19. Complete remission achieved in 5/12 patients (42%). Minimal off-target editing detected. Treatment-related adverse events were manageable.',
          doi: '10.1056/NEJMoa2300154',
        },
        {
          id: 's3',
          title: 'Off-Target Effects and Safety Profile of CRISPR-Cas9 in Clinical Settings',
          authors: 'Anderson, K., Wu, H., Patel, R.',
          year: 2023,
          journal: 'Science Translational Medicine',
          trust_score: 85,
          trust_factors: { peer_reviewed: true, citation_count: 445, author_hindex: 38, recency_years: 2, open_access: false },
          trust_reason: 'Strong translational research journal. Important safety data, though limited by small sample sizes in clinical settings.',
          abstract: 'Analysis of off-target editing in 45 patients across 6 CRISPR clinical trials. Whole genome sequencing identified off-target modifications at a rate of 0.1-0.3%, with no detectable oncogenic mutations. Recommends minimum 5-year follow-up for all CRISPR trial patients.',
          doi: '10.1126/scitranslmed.adg1297',
        },
        {
          id: 's4',
          title: 'Base Editing and Prime Editing for Precision Oncology: Beyond Cas9',
          authors: 'Liu, D., Gao, X.',
          year: 2024,
          journal: 'Cell',
          trust_score: 91,
          trust_factors: { peer_reviewed: true, citation_count: 680, author_hindex: 55, recency_years: 1, open_access: false },
          trust_reason: 'Cutting-edge review in Cell covering next-generation editing tools. Very high author expertise and timeliness.',
          abstract: 'Review of base editing and prime editing as alternatives to Cas9 for cancer therapy. Base editors achieve single-nucleotide corrections without double-strand breaks, reducing off-target risk by 10-fold. Prime editing enables precise insertions and deletions for complex oncogenic mutations.',
          doi: '10.1016/j.cell.2024.01.032',
        },
        {
          id: 's5',
          title: 'Ethical and Regulatory Framework for CRISPR-Based Cancer Treatments',
          authors: 'Jasanoff, S., Hurlbut, B.',
          year: 2022,
          journal: 'The Lancet Oncology',
          trust_score: 72,
          trust_factors: { peer_reviewed: true, citation_count: 120, author_hindex: 40, recency_years: 3, open_access: true },
          trust_reason: 'Important ethical perspective in a major oncology journal. High author expertise in bioethics but lower citation count than empirical studies.',
          abstract: 'Analysis of regulatory gaps for CRISPR cancer therapies across 12 countries. Proposes a tiered consent framework distinguishing somatic editing (lower risk) from heritable modifications. Calls for international harmonization of safety reporting standards.',
          doi: '10.1016/S1470-2045(22)00567-1',
        },
      ],
      synthesis: 'CRISPR-Cas9 is rapidly advancing from experimental to clinical cancer therapy, with the most promising applications in enhancing CAR-T cell therapy for blood cancers. Early-phase trials show response rates of 40-50% in refractory cases. Safety profiles are encouraging with low off-target editing rates, though long-term surveillance is needed. Next-generation tools like base editing and prime editing promise even greater precision. Regulatory and ethical frameworks are actively evolving to keep pace with the technology.',
      agreements: [
        'CRISPR enhances CAR-T therapy effectiveness',
        'Off-target rates are low but require monitoring',
        'Blood cancers are the most tractable targets',
        'Long-term follow-up is essential for safety',
      ],
      conflicts: [
        'Whether solid tumors are viable CRISPR targets',
        'Acceptable thresholds for off-target editing rates',
        'Regulatory approaches vary significantly by country',
      ],
      research_gaps: [
        { gap: 'CRISPR delivery systems for solid tumors beyond blood cancers', angle: 'Lipid nanoparticle delivery of Cas9 to tumor microenvironment' },
        { gap: 'Long-term outcomes (5+ years) of CRISPR-treated patients', angle: 'Extended follow-up cohorts from Phase I trials' },
        { gap: 'Combination strategies: CRISPR + immunotherapy + chemotherapy', angle: 'Multi-arm clinical trials comparing combination approaches' },
      ],
    };
  }

  // Default / generic topic
  return {
    sources: [
      {
        id: 's1',
        title: 'A Comprehensive Review of Current Research Trends and Methodologies',
        authors: 'Johnson, M., Lee, S., Martinez, R.',
        year: 2024,
        journal: 'Annual Review of Research Methods',
        trust_score: 87,
        trust_factors: { peer_reviewed: true, citation_count: 340, author_hindex: 35, recency_years: 1, open_access: true },
        trust_reason: 'Recent comprehensive review in a respected methodology journal with strong citation metrics.',
        abstract: 'This review synthesizes methodological advances across multiple disciplines, highlighting the growing adoption of mixed-methods research designs and computational approaches. Machine learning-augmented analysis showed a 3x increase in adoption since 2020.',
        doi: '10.1146/annurev-research-2024',
      },
      {
        id: 's2',
        title: 'Evidence-Based Frameworks for Cross-Disciplinary Research Synthesis',
        authors: 'Williams, A., Nakamura, Y.',
        year: 2023,
        journal: 'Research Policy',
        trust_score: 82,
        trust_factors: { peer_reviewed: true, citation_count: 215, author_hindex: 28, recency_years: 2, open_access: false },
        trust_reason: 'Peer-reviewed in a well-regarded policy journal. Good citation count for a synthesis framework paper.',
        abstract: 'Proposes a systematic approach to synthesizing research across disciplines, addressing challenges of heterogeneous methodologies and conflicting findings. The framework was validated across 120 review papers showing 35% improvement in synthesis quality.',
        doi: '10.1016/j.respol.2023.104892',
      },
      {
        id: 's3',
        title: 'Reproducibility and Open Science: Lessons from a Decade of Reform',
        authors: 'Nosek, B., Hardwicke, T.',
        year: 2024,
        journal: 'Science',
        trust_score: 93,
        trust_factors: { peer_reviewed: true, citation_count: 780, author_hindex: 62, recency_years: 1, open_access: true },
        trust_reason: 'Published in Science by the founder of the Center for Open Science. Exceptional authority and impact.',
        abstract: 'A decade after the replication crisis, this analysis assesses reforms: preregistration increased from 2% to 28% of studies, data sharing from 5% to 42%, and replication rates improved from 36% to 62%. However, systemic incentives still favor novelty over rigor.',
        doi: '10.1126/science.adp5678',
      },
      {
        id: 's4',
        title: 'Digital Research Tools and Student Academic Performance: A Meta-Analysis',
        authors: 'Park, H., Brown, K., Singh, P.',
        year: 2023,
        journal: 'Educational Research Review',
        trust_score: 76,
        trust_factors: { peer_reviewed: true, citation_count: 132, author_hindex: 18, recency_years: 2, open_access: false },
        trust_reason: 'Solid meta-analysis in an education-focused journal. Moderate author expertise. Relevant to research tool effectiveness.',
        abstract: 'Meta-analysis of 58 studies (N=45,000) examining digital research tools and academic outcomes. AI-assisted research tools improved source quality by 22% and reduced time-to-first-draft by 35%. However, over-reliance correlated with reduced critical thinking scores.',
        doi: '10.1016/j.edurev.2023.100523',
      },
      {
        id: 's5',
        title: 'Information Literacy in the Age of AI: Challenges and Opportunities',
        authors: 'Ahmed, F., O\'Brien, C.',
        year: 2024,
        journal: 'Journal of Information Science',
        trust_score: 68,
        trust_factors: { peer_reviewed: true, citation_count: 67, author_hindex: 14, recency_years: 1, open_access: true },
        trust_reason: 'Timely and relevant but lower citation count and moderate author credentials. Open access is a plus.',
        abstract: 'Examines how AI tools like ChatGPT and research assistants are reshaping information literacy requirements. Survey of 2,000 university students found 72% use AI for research but only 31% verify AI-suggested sources. Proposes updated information literacy curricula.',
        doi: '10.1177/01655515241234567',
      },
    ],
    synthesis: 'The research landscape is undergoing significant transformation driven by AI tools, open science reforms, and evolving methodological standards. Digital research tools show measurable improvements in efficiency and source quality but raise concerns about critical thinking and over-reliance. The reproducibility movement has made substantial progress in a decade, though systemic incentives still need alignment. Information literacy curricula must be updated to address AI-era challenges, particularly around source verification.',
    agreements: [
      'AI tools improve research efficiency',
      'Open science practices are increasing',
      'Source verification remains critical',
      'Mixed-methods approaches are growing',
    ],
    conflicts: [
      'AI tools: helpful or detrimental to learning?',
      'Optimal balance of efficiency vs. rigor',
      'Whether current reforms are sufficient',
    ],
    research_gaps: [
      { gap: 'Long-term effects of AI research tools on student learning', angle: 'Longitudinal cohort tracking students using AI assistants through degree' },
      { gap: 'Cross-cultural validity of research literacy frameworks', angle: 'Comparative study across universities in 10+ countries' },
      { gap: 'Optimal integration of AI tools into research methods courses', angle: 'RCT comparing AI-augmented vs. traditional research instruction' },
    ],
  };
}

// ============ MOCK BIAS ============
export function getMockBias(sourceId: string): BiasFlag {
  const biases: Record<string, BiasFlag> = {
    s1: {
      bias_detected: false, bias_type: 'none', bias_note: null, severity: 'none',
      criteria: [
        'No corporate or industry funding disclosed',
        'Published in JAMA — independent peer review with strict COI policy',
        'Sample drawn from multiple U.S. regions (not single-site)',
        'Authors have no disclosed affiliations with social media companies',
      ],
    },
    s2: {
      bias_detected: false, bias_type: 'none', bias_note: null, severity: 'none',
      criteria: [
        'Systematic review methodology reduces selection bias',
        'Lancet journals enforce PRISMA reporting standards',
        'Included studies from 12 countries (not Western-only)',
        'No funding from platform companies',
      ],
    },
    s3: {
      bias_detected: true, bias_type: 'geographic', severity: 'low',
      bias_note: 'Study predominantly draws from Western, English-language publications which may not reflect global patterns.',
      criteria: [
        '28 of 32 included studies were from the U.S., UK, or Australia',
        'Non-English studies were excluded from the meta-analysis',
        'Cultural norms around social media use vary significantly (e.g., WeChat vs. Instagram)',
        'Authors acknowledge this limitation but do not adjust conclusions',
      ],
    },
    s4: {
      bias_detected: true, bias_type: 'funding', severity: 'medium',
      bias_note: 'Research was partially funded by a technology company that develops the tools being evaluated.',
      criteria: [
        'Funding disclosure lists a tech company with commercial interest in positive findings',
        'Scoping review methodology allows selective study inclusion (no PRISMA protocol)',
        'Conclusions emphasize benefits while downplaying documented harms',
        'One co-author has consulted for a social media platform',
      ],
    },
    s5: {
      bias_detected: false, bias_type: 'none', bias_note: null, severity: 'none',
      criteria: [
        'Government and university funded (no industry ties)',
        'Cross-national design spanning 15 countries reduces geographic bias',
        'Nature Behaviour enforces transparent data sharing',
        'Pre-registered study protocol reduces reporting bias',
      ],
    },
  };
  return biases[sourceId] || {
    bias_detected: false, bias_type: 'none', bias_note: null, severity: 'none',
    criteria: ['No specific bias signals identified in the available metadata'],
  };
}

// ============ MOCK THESIS ============
export function getMockThesis(): ThesisResponse {
  return {
    angles: [
      {
        thesis: 'While social media use is widely associated with declining adolescent mental health, the relationship is neither simple nor uniformly negative — and current interventions must move beyond screen-time limits toward platform-specific digital literacy education.',
        stance: 'Pro-nuanced intervention over blanket restriction',
        supporting_sources: ['s1', 's4', 's5'],
        gap_it_fills: 'Lack of evidence-based intervention strategies beyond time limits',
      },
      {
        thesis: 'The dose-response relationship between social media consumption and depressive symptoms among adolescents constitutes a public health emergency that demands regulatory action comparable to tobacco and alcohol control.',
        stance: 'Pro-regulation based on health evidence',
        supporting_sources: ['s1', 's2', 's3'],
        gap_it_fills: 'Regulatory frameworks lag behind empirical evidence of harm',
      },
      {
        thesis: 'Social media platforms can serve as critical mental health support infrastructure for marginalized adolescents, and overly restrictive policies risk eliminating vital community connections for LGBTQ+ youth and other vulnerable populations.',
        stance: 'Pro-access with protective guardrails',
        supporting_sources: ['s4', 's5'],
        gap_it_fills: 'Marginalized youth voices underrepresented in policy discussions',
      },
    ],
  };
}

// ============ MOCK JARGON ============
export function getMockJargon(abstract: string): JargonResponse {
  if (abstract.includes('dose-response') || abstract.includes('OR=')) {
    return {
      simplified: 'A study that followed 5,000 young people for 3 years found that spending more than 3 hours a day on social media makes you about twice as likely to feel depressed. Just scrolling (without posting) was the most harmful pattern.',
    };
  }
  if (abstract.includes('systematic review') || abstract.includes('47 studies')) {
    return {
      simplified: 'Researchers looked at 47 different studies covering over 120,000 people. They found that Instagram mainly causes body image problems, while TikTok is more linked to trouble focusing and sleep issues.',
    };
  }
  return {
    simplified: 'This research found important patterns in the data. The main takeaway is that the topic being studied has measurable effects that vary depending on specific conditions and contexts.',
  };
}

// ============ MOCK FOLLOWUP ============
export function getMockFollowup(question: string): { answer: string } {
  const q = question.toLowerCase();
  if (q.includes('causation') || q.includes('causal') || q.includes('cause')) {
    return {
      answer: 'The current evidence is primarily correlational, not causal. While longitudinal studies like the JAMA study show temporal associations, it\'s difficult to rule out reverse causation (depressed teens may use more social media). Experimental studies are limited for ethical reasons, though natural experiments (like countries temporarily banning platforms) offer some quasi-causal evidence.',
    };
  }
  if (q.includes('solution') || q.includes('help') || q.includes('fix') || q.includes('prevent')) {
    return {
      answer: 'The most evidence-supported interventions include: (1) digital literacy education in schools, (2) parental co-viewing and discussion rather than outright bans, (3) platform design changes like hiding like counts and limiting algorithmic amplification, and (4) promoting active creation over passive consumption. Some schools implementing these approaches have seen 20-30% reductions in reported social media-related distress.',
    };
  }
  return {
    answer: 'Based on the synthesis, the research suggests a complex, multi-factorial relationship. The key factors appear to be duration of use, type of engagement (active vs. passive), individual vulnerability, and platform design features. More research is needed to establish definitive answers, particularly longitudinal studies with diverse populations.',
  };
}

// ============ MOCK COMPARISON ============
export function getMockComparison(): CompareResponse {
  return {
    rows: [
      {
        metric: 'Methodology',
        paper1: 'Longitudinal cohort study following 5,000 U.S. young adults over 3 years. Used validated PHQ-9 depression scales and self-reported daily social media usage. Controlled for 12 confounders including pre-existing mental health conditions.',
        paper2: 'Systematic review and meta-analysis of 47 peer-reviewed studies (N=120,000+). Followed PRISMA reporting standards. Used random-effects model to account for heterogeneity across studies.',
        paper3: 'Cross-national observational study across 15 countries (N=200,000 adolescents). Employed multilevel modeling to account for country-level variance. Used national survey data with standardised well-being instruments.',
      },
      {
        metric: 'Sample Size & Population',
        paper1: 'N=5,000 U.S. adults aged 18–32. Drawn from a nationally representative panel. 3-year follow-up with 78% retention rate. Predominantly English-speaking, limiting generalizability to non-U.S. populations.',
        paper2: 'Aggregate N=120,000+ across 47 studies spanning multiple countries and age groups (primarily 13–25). Studies ranged in size from N=200 to N=45,000. Geographic scope broader but heterogeneous across included studies.',
        paper3: 'N=200,000 adolescents aged 10–18 across 15 countries including low- and middle-income nations. Sample designed to be globally representative. Annual data collection over 4 years from 2019–2023.',
      },
      {
        metric: 'Key Findings',
        paper1: 'Social media use exceeding 3 hours daily associated with a 2.1x increased odds of depressive symptoms (OR=2.1, 95% CI 1.6–2.8). Passive scrolling was significantly more harmful than active posting. Dose-response relationship was consistent across age sub-groups.',
        paper2: 'Instagram use correlated with body image dissatisfaction (effect size d=0.45). TikTok showed stronger associations with attention difficulties and sleep disruption than other platforms. Platform-specific effects were more predictive than total screen time.',
        paper3: 'Relationship between screen time and mental health follows an inverted U-curve. Moderate use (1–2 hrs/day) associated with slightly better well-being than zero use. Harms escalated sharply above 4 hrs/day, consistent across all 15 countries studied.',
      },
      {
        metric: 'Limitations & Bias',
        paper1: 'Self-reported social media usage is subject to recall bias. Cannot fully exclude reverse causality (depressed individuals may increase social media use). Sample limited to U.S. adults; results may not generalise to adolescents or non-Western populations.',
        paper2: 'High heterogeneity across included studies (I²=78%) reduces the precision of pooled estimates. Publication bias likely inflates negative effects. Most included studies relied on self-report measures without objective usage data.',
        paper3: 'Observational design precludes causal inference. Data collection tied to national educational surveys, which may underrepresent school-dropouts and marginalised youth. Funding from a government agency with potential interest in restrictive screen-time policy outcomes.',
      },
    ],
  };
}
