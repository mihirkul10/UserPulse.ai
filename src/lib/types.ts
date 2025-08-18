export interface ProductProfile {
  name: string;
}

export interface AnalyzeInput {
  me: ProductProfile;
  competitors: ProductProfile[]; // length 1..3
  days: number;
  minScoreReddit: number;
  maxThreads: number;
  langs: string[];        // e.g., ["en"]
  subreddits: string[];   // default: DEFAULT_SUBREDDITS
}

export interface RawItem {
  id: string;
  type: "post" | "comment";
  author: string;
  subreddit: string;
  title_or_text: string;
  url?: string;           // outbound link if any
  thread_url: string;     // Reddit permalink
  created_at: string;     // ISO
  score: number;          // upvotes
  num_comments?: number;
  evidence_urls: string[]; // parsed GitHub/blog/docs/changelog links
  matchedCompetitor: string; // which competitor this item belongs to
}

export interface UnifiedItem extends RawItem {
  rankScore: number;
  aspect?: "launch" | "love" | "notlove";
}

export interface ReportSections {
  header: string;
  launches: string;
  loving: string;
  notLoving: string;
  strategicRead: string;
  takeaways: string;
  appendixCsv: string; // CSV text
  raw?: string; // Full markdown report
}

export interface CoverageMeta {
  days: number;
  totalThreads: number;
  totalComments: number;
  totalItemsUsed: number;
  subredditsUsed: number;
}

export interface ContextPack {
  contextText: string;
  keywords: string[];
}

export interface SavedReport {
  id: string;
  timestamp: string;
  input: AnalyzeInput;
  report: ReportSections;
  coverage: CoverageMeta;
}

export interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  substatus?: string;
}
