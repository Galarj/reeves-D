# REAVES — Project Kickstart Brief
## Research Evaluation And Verified Evidence Synthesis

**HackFest 2026: Axis · Ateneo de Manila University**
**Theme: "Research, Reinvented" · Accenture Case Challenge**

---

## 1. Product Vision

REAVES is an AI-powered research co-pilot for students. Unlike search engines or simple summarizers, REAVES **validates and explains every decision it makes** — surfacing credible sources, scoring them transparently, synthesizing across findings, detecting research gaps, flagging source bias, and scaffolding the student's argument — all in one workflow.

> "We don't just summarize. We validate."

The core loop:
**Ask → Clarify → Search → Validate → Understand → Synthesize → Argue → Write**

---

## 2. Problem Statement

Students today face an overwhelming amount of information online, but accessing large volumes of data does not guarantee quality or reliability. Navigating this sea of content to find credible, relevant, and up-to-date research sources is time-consuming, confusing, and often discouraging. This challenge is compounded by the lack of effective tools that can not only recommend verified sources but also help synthesize insights and organize citations efficiently.

---

## 3. Target User

- University students (undergraduate and graduate)
- Researching for papers, theses, case studies, or reports
- Cross-discipline: STEM, social sciences, humanities, business
- Pain points: information overload, source credibility anxiety, citation formatting, difficulty finding their argument angle

---

## 4. Key MVP Features

### Already built (v2 prototype)
| Feature | What it does |
|---|---|
| Natural-language query input | Student types a research question in plain English |
| AI query clarifier | Before searching, AI asks 1 smart question to narrow the angle |
| Source discovery | Returns 5 relevant academic sources per search |
| Transparent trust scoring | 4-factor credibility breakdown per source: peer-reviewed, citation count, author H-index, recency |
| AI reasoning per source | One-sentence explanation of why each source scored what it scored |
| AI synthesis engine | Cross-source summary identifying consensus, conflict, and key findings |
| Research gap detector | AI surfaces 3 unanswered questions in the literature, each with a suggested research angle |
| Follow-up chat | Student can ask follow-up questions on the synthesis in-line |
| Save to notebook | One-click save, session-persistent |
| Citation auto-format | APA / MLA / Chicago with one-click copy |

### New MVP features to add (v3)
| Feature | Why it matters |
|---|---|
| **Source bias detector** | Flags ideological, funding, or publication bias per source — most AI-unique feature |
| **AI thesis statement builder** | From saved notebook → generates 3 thesis angles with supporting sources mapped |
| **Jargon simplifier** | Click any abstract → AI rewrites it in plain language |
| **Live contradiction alert** | As you save sources, AI flags when a new source contradicts existing notebook entries |
| **Research outline generator** | From notebook → AI drafts a paper outline with section titles and source assignments |
| **Side-by-side source comparison** | Select 2–3 sources → AI generates comparison table (methodology, findings, limitations) |

---

## 5. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR1 | Natural-language research question entry, session persistence | Must have |
| FR2 | AI query clarifier — ask 1 clarifying question before searching | Must have |
| FR3 | Source discovery via academic APIs (Semantic Scholar, PubMed) | Must have |
| FR4 | Credibility scoring: peer-review, citation count, H-index, recency | Must have |
| FR5 | AI reasoning explanation per source credibility score | Must have |
| FR6 | Cross-source synthesis with agreement and conflict tagging | Must have |
| FR7 | Research gap detection — 3 unanswered questions per search | Must have |
| FR8 | Follow-up question chat on synthesis panel | Must have |
| FR9 | Save to notebook, tag, annotate | Must have |
| FR10 | Citation auto-format: APA, MLA, Chicago, one-click copy | Must have |
| FR11 | Source bias detector | Should have |
| FR12 | Thesis statement builder from notebook | Should have |
| FR13 | Jargon simplifier per abstract | Should have |
| FR14 | Live contradiction alert on save | Should have |
| FR15 | Research outline generator | Nice to have |
| FR16 | Side-by-side source comparison | Nice to have |
| FR17 | User authentication (email + Google SSO) | Should have |
| FR18 | Export notebook as PDF / .docx | Nice to have |

### Non-functional requirements
- **Performance**: Source results < 3s, AI synthesis < 8s
- **Security**: HTTPS everywhere, API keys server-side only, RLS per user
- **Accessibility**: WCAG 2.1 AA, keyboard-navigable, screen reader support
- **Reliability**: Graceful fallback if academic API unavailable
- **Portability**: Fully responsive — mobile, tablet, desktop

---

## 6. System Architecture

```
┌─────────────────────────────────────┐
│         Student (Browser)           │
└──────────────┬──────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────┐
│     Frontend — Next.js 14 + React   │
│  Search · Clarifier · Source cards  │
│  Trust breakdown · Gap detector     │
│  Thesis builder · Notebook · Cites  │
└──────────────┬──────────────────────┘
               │ Internal API calls
┌──────────────▼──────────────────────┐
│   Backend — Next.js API Routes      │
│  Auth middleware · Rate limiting    │
│  Prompt orchestration · Supabase    │
└────┬──────────┬──────────┬──────────┘
     │          │          │
┌────▼────┐ ┌──▼──────┐ ┌─▼──────────┐
│ Claude  │ │Academic │ │  Supabase  │
│   API   │ │  APIs   │ │  (Postgres)│
│Clarify  │ │Semantic │ │  Auth · DB │
│Synthesize│ │Scholar  │ │  Realtime  │
│Score    │ │PubMed   │ └────────────┘
│Gap detect│ │CrossRef │
└─────────┘ └─────────┘
```

---

## 7. Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI library**: React 18
- **Styling**: Tailwind CSS + shadcn/ui components
- **Fonts**: Syne (display) + DM Sans (body)
- **State**: React useState / useReducer (no Redux needed at MVP)

### Backend
- **API routes**: Next.js API Routes (serverless, same repo)
- **Runtime**: Node.js 20
- **Auth**: Supabase Auth (email + Google OAuth)
- **ORM/client**: Supabase JS SDK (`@supabase/supabase-js`)

### AI Layer
- **Model**: `claude-sonnet-4-20250514` via Anthropic API
- **Pattern**: Multi-step prompt chaining
  1. Clarifier prompt → returns JSON clarification options
  2. Search + score prompt → returns sources with trust factors
  3. Synthesis + gap prompt → returns synthesis, agreements, conflicts, gaps
  4. Bias prompt → returns per-source bias flags
  5. Thesis prompt → returns 3 thesis angles from notebook
- **Key principle**: All prompts instruct Claude to return **only valid JSON** — no markdown fences

### Database — Supabase (PostgreSQL)
- **Why Supabase**: Auth built-in, Row Level Security, Realtime, generous free tier, native Next.js integration
- **Tables**: see Section 8

### External APIs
- **Semantic Scholar API** (free, no key needed for basic use) — real academic paper metadata
- **PubMed E-utilities** (free, NCBI) — biomedical literature
- **CrossRef API** (free) — DOI resolution and citation metadata

### Deployment
- **Frontend + API**: Vercel (one `git push` deploy)
- **Database**: Supabase cloud (free tier)
- **CI/CD**: GitHub Actions → auto-deploy on push to `main`
- **Env management**: Vercel environment variables

---

## 8. Database Schema (Supabase / PostgreSQL)

```sql
-- Enable RLS on all tables
-- Users managed by Supabase Auth (auth.users)

-- User profiles (extends Supabase auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users see own profile" on profiles for all using (auth.uid() = id);

-- Search sessions
create table searches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  raw_query text not null,
  refined_query text,
  clarifier_question text,
  chosen_angle text,
  synthesis text,
  agreements jsonb,
  conflicts jsonb,
  research_gaps jsonb,
  created_at timestamptz default now()
);
alter table searches enable row level security;
create policy "Users see own searches" on searches for all using (auth.uid() = user_id);

-- Saved sources (notebook entries)
create table saved_sources (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  search_id uuid references searches(id) on delete set null,
  title text not null,
  authors text,
  year integer,
  journal text,
  abstract text,
  doi text,
  trust_score integer,
  trust_factors jsonb,
  trust_reason text,
  bias_flags jsonb,
  user_note text,
  tag text default 'Untagged',
  created_at timestamptz default now()
);
alter table saved_sources enable row level security;
create policy "Users see own sources" on saved_sources for all using (auth.uid() = user_id);

-- Citations
create table citations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  source_id uuid references saved_sources(id) on delete cascade,
  preferred_format text default 'APA',
  created_at timestamptz default now()
);
alter table citations enable row level security;
create policy "Users see own citations" on citations for all using (auth.uid() = user_id);

-- Thesis drafts
create table thesis_drafts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  search_id uuid references searches(id) on delete set null,
  angle_a text,
  angle_b text,
  angle_c text,
  chosen_angle text,
  created_at timestamptz default now()
);
alter table thesis_drafts enable row level security;
create policy "Users see own thesis drafts" on thesis_drafts for all using (auth.uid() = user_id);
```

---

## 9. Folder Structure

```
reaves/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout, fonts, providers
│   ├── page.tsx                  # Landing / hero page
│   ├── dashboard/
│   │   └── page.tsx              # Main research dashboard (search + results)
│   ├── notebook/
│   │   └── page.tsx              # Saved sources + notebook view
│   └── api/
│       ├── clarify/route.ts      # POST: AI query clarifier
│       ├── search/route.ts       # POST: source search + trust scoring
│       ├── synthesize/route.ts   # POST: synthesis + gap detection
│       ├── bias/route.ts         # POST: source bias analysis
│       ├── thesis/route.ts       # POST: thesis builder from notebook
│       └── followup/route.ts     # POST: follow-up question on synthesis
│
├── components/
│   ├── search/
│   │   ├── SearchBar.tsx         # Query input + chip suggestions
│   │   └── ClarifierCard.tsx     # AI clarifier options UI
│   ├── results/
│   │   ├── SourceCard.tsx        # Source with trust breakdown
│   │   ├── TrustBreakdown.tsx    # 4-factor credibility grid
│   │   ├── SynthesisPanel.tsx    # AI synthesis + follow-up chat
│   │   ├── GapDetector.tsx       # Research gaps card
│   │   └── BiasFlag.tsx          # Bias indicator per source
│   ├── notebook/
│   │   ├── NotebookPanel.tsx     # Right panel notebook view
│   │   ├── CitationCard.tsx      # Citation with format switcher
│   │   └── ThesisBuilder.tsx     # Thesis angle generator
│   └── ui/                       # shadcn/ui components
│
├── lib/
│   ├── anthropic.ts              # Claude API client + prompt templates
│   ├── supabase.ts               # Supabase client (browser)
│   ├── supabase-server.ts        # Supabase client (server-side)
│   ├── academic-apis.ts          # Semantic Scholar + PubMed fetchers
│   └── formatters.ts             # APA / MLA / Chicago citation formatters
│
├── prompts/
│   ├── clarifier.ts              # Clarifier system prompt
│   ├── search-score.ts           # Source generation + trust scoring prompt
│   ├── synthesize.ts             # Synthesis + gaps prompt
│   ├── bias.ts                   # Bias detection prompt
│   ├── thesis.ts                 # Thesis builder prompt
│   └── jargon.ts                 # Jargon simplifier prompt
│
├── types/
│   └── index.ts                  # TypeScript interfaces for all data models
│
├── .env.local                    # Local secrets (never commit)
├── .env.example                  # Template for teammates
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 10. Environment Variables

```bash
# .env.local — never commit this file

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server-side only, never expose to browser

# Academic APIs (no keys needed for free tier)
SEMANTIC_SCHOLAR_API_KEY=         # optional — higher rate limits
```

---

## 11. Core AI Prompt Templates

### Prompt 1 — Query Clarifier
```
System:
You are REAVES's AI clarifier. Given a student's research question,
return ONLY valid JSON:
{
  "ambiguous": true | false,
  "clarifier_question": "One specific question to narrow the angle (max 20 words)",
  "options": ["Option A (max 8 words)", "Option B", "Option C"],
  "refined_queries": ["Specific query if A chosen", "if B", "if C"]
}
If already specific, set ambiguous to false and return empty arrays.
No markdown. No explanation. JSON only.

User: {raw_query}
```

### Prompt 2 — Source Search + Trust Scoring
```
System:
You are REAVES's research AI. Return ONLY valid JSON:
{
  "sources": [{
    "id": "s1",
    "title": "Full paper title",
    "authors": "Surname A, Surname B",
    "year": 2023,
    "journal": "Journal Name",
    "trust_score": 88,
    "trust_factors": {
      "peer_reviewed": true,
      "citation_count": 214,
      "author_hindex": 32,
      "recency_years": 2,
      "open_access": false
    },
    "trust_reason": "One sentence explaining this score.",
    "abstract": "2-3 sentences on findings.",
    "doi": "10.xxxx/example"
  }],
  "synthesis": "3-4 sentence synthesis across all sources.",
  "agreements": ["consensus point (max 8 words)", ...],
  "conflicts": ["debate point (max 8 words)", ...],
  "research_gaps": [
    {"gap": "Unanswered question (max 12 words)", "angle": "Suggested approach (max 12 words)"},
    ...
  ]
}
Return exactly 5 sources. No markdown. JSON only.

User: Research query: {refined_query}
```

### Prompt 3 — Source Bias Detector
```
System:
You are REAVES's bias detector. Given a source, return ONLY valid JSON:
{
  "bias_detected": true | false,
  "bias_type": "funding | ideological | publication | geographic | none",
  "bias_note": "One sentence explaining the potential bias, or null if none.",
  "severity": "low | medium | high | none"
}
Be objective. Only flag clear signals (industry funding, advocacy journals,
single-country samples generalized globally). No markdown. JSON only.

User: Title: {title}, Authors: {authors}, Journal: {journal}, Abstract: {abstract}
```

### Prompt 4 — Thesis Builder
```
System:
You are REAVES's thesis builder. Given a student's saved sources,
generate 3 distinct thesis angles. Return ONLY valid JSON:
{
  "angles": [
    {
      "thesis": "A complete, arguable thesis statement (1-2 sentences).",
      "stance": "The position this thesis takes (max 8 words)",
      "supporting_sources": ["s1", "s3"],
      "gap_it_fills": "What gap in the literature this addresses (max 12 words)"
    }
  ]
}
Make each angle genuinely distinct — different stances, not paraphrases.
No markdown. JSON only.

User: Research topic: {topic}. Sources: {sources_json}
```

---

## 12. Build Order (Full-Day Sprint)

| Hours | Task | Owner suggestion |
|---|---|---|
| 1–2 | Project setup: Next.js + Supabase + Tailwind + GitHub repo | 1 person |
| 1–3 | Supabase schema, auth, RLS policies | 1 person |
| 2–5 | API routes: clarify, search/score, synthesize/gaps | 1 person |
| 2–6 | Frontend: SearchBar, ClarifierCard, SourceCard + TrustBreakdown | 1–2 people |
| 5–7 | Frontend: SynthesisPanel, GapDetector, FollowUpChat | 1 person |
| 6–8 | Notebook panel, CitationCard, format switcher | 1 person |
| 8–10 | Bias detector + ThesisBuilder API + UI | 1 person |
| 10–11 | Jargon simplifier, contradiction alert | 1 person |
| 11–13 | UI polish, responsive layout, loading states, error handling | All |
| 13–14 | Rehearse pitch demo flow, deploy to Vercel | All |

---

## 13. Judging Rubric Alignment

| Criterion | Weight | How REAVES addresses it |
|---|---|---|
| **Idea & Concept** | 50% | Validates + explains every source decision. Query clarifier + bias detector + thesis builder are novel. Gap detector shows AI understanding the shape of a field, not just retrieving from it. |
| **Technology** | 30% | Multi-step prompt chaining. Transparent AI reasoning (not a black box). Real academic API integration. Supabase RLS for data privacy. |
| **Pitch & Presentation** | 20% | Live demo flow: type → clarify → sources with trust breakdowns → synthesis → gap → thesis draft. Entire loop in under 2 minutes. |

---

## 14. Pitch Demo Script (2-minute live demo)

1. **Type**: "What is the impact of social media on mental health?"
2. **Show**: AI clarifier asks — "Are you focusing on adolescents, adults, or platform-specific effects?"
3. **Select**: "Adolescents" — watch query refine automatically
4. **Show**: 5 sources appear with color-coded trust badges and 4-factor breakdowns
5. **Highlight**: Click one trust score — show the AI reasoning sentence
6. **Scroll**: AI Synthesis panel — point out the agreement tags (✓) and conflict tags (⚡)
7. **Scroll**: Research Gap Detector — click "Research this →" on one gap
8. **Show**: It loads as the next query — "REAVES is a loop, not a dead end"
9. **Save**: Save 2–3 sources → open Notebook → click "Build Thesis"
10. **Show**: 3 thesis angles appear with supporting sources mapped

---

## 15. Tagline Options

- *"Don't just search. Understand."*
- *"Research that explains itself."*
- *"From question to argument — verified."*
- *"REAVES: Where research becomes insight."*

---

*REAVES — HackFest 2026: Axis · Built for Ateneo de Manila University*
*Powered by Anthropic Claude · Supabase · Next.js · Vercel*
