import { AnalyzeInput, ReportSections, CoverageMeta, ContextPack, RawItem } from '@/lib/types';
import { DEFAULT_SUBREDDITS } from '@/lib/subreddits';
import { PROGRESS_WEIGHTS } from '@/components/SmoothProgress';

export interface AnalysisResult {
  report: ReportSections;
  coverage: CoverageMeta;
}

export interface ProgressCallback {
  (step: string, substatus?: string): void;
}

export interface LogCallback {
  (log: string): void;
}

export interface ProgressUpdateCallback {
  (progress: { percentage: number; taskIndex: number }): void;
}

// Enhanced streaming analysis function
export async function runAnalysisWithStreaming(
  input: AnalyzeInput,
  onLog: LogCallback,
  onProgress: ProgressUpdateCallback
): Promise<AnalysisResult> {
  try {
    // Step 1: Build context (10%)
    onProgress({ percentage: PROGRESS_WEIGHTS.CONTEXT, taskIndex: 0 });
    onLog(`[Context] Analyzing ${input.me.name} to understand product category and features...`);
    
    const meRes = await fetch('/api/mine/context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input.me),
    });
    
    if (!meRes.ok) {
      const error = await meRes.json();
      throw new Error(error.error || 'Failed to analyze your product');
    }
    
    const meContext: ContextPack = await meRes.json();
    onLog(`[Context] ✓ Generated context keywords and category for ${input.me.name}`);
    
    // Step 2: Mine MY PRODUCT (30%)
    onProgress({ percentage: PROGRESS_WEIGHTS.CONTEXT + PROGRESS_WEIGHTS.MINE_ME, taskIndex: 1 });
    onLog(`[Crawler] 🔍 Searching ${input.subreddits.length} subreddits for discussions about ${input.me.name}...`);
    
    const mineMe = await runBackgroundJob('/api/fetch/reddit', {
      ...input,
      subreddits: input.subreddits.length > 0 ? input.subreddits : DEFAULT_SUBREDDITS,
      meContext,
    }, onLog) as RawItem[];
    
    onLog(`[Crawler] ✓ Found ${mineMe.length} discussions about ${input.me.name}`);
    
    // Step 3: Mine COMPETITORS (55%)
    onProgress({ percentage: PROGRESS_WEIGHTS.CONTEXT + PROGRESS_WEIGHTS.MINE_ME + PROGRESS_WEIGHTS.MINE_COMPETITORS, taskIndex: 2 });
    onLog(`[Crawler] 🔍 Searching ${input.subreddits.length} subreddits for discussions about competitors: ${input.competitors.map(c => c.name).join(', ')}...`);
    
    const mineCompetitors = await runBackgroundJob('/api/fetch/reddit', {
      ...input,
      subreddits: input.subreddits.length > 0 ? input.subreddits : DEFAULT_SUBREDDITS,
      meContext,
    }, onLog) as RawItem[];
    
    onLog(`[Crawler] ✓ Found ${mineCompetitors.length} discussions about competitors`);
    
    // Step 4: Filter (65%)
    onProgress({ percentage: PROGRESS_WEIGHTS.CONTEXT + PROGRESS_WEIGHTS.MINE_ME + PROGRESS_WEIGHTS.MINE_COMPETITORS + PROGRESS_WEIGHTS.FILTER, taskIndex: 3 });
    onLog(`[Filter] 🎯 Filtering ${mineMe.length + mineCompetitors.length} posts/comments for UX and feedback relevance...`);
    
    // Step 5: Classify (80%)
    onProgress({ percentage: PROGRESS_WEIGHTS.CONTEXT + PROGRESS_WEIGHTS.MINE_ME + PROGRESS_WEIGHTS.MINE_COMPETITORS + PROGRESS_WEIGHTS.FILTER + PROGRESS_WEIGHTS.CLASSIFY, taskIndex: 4 });
    onLog(`[Classifier] 📊 Classifying discussions into aspects (performance, pricing, features, etc.)...`);
    
    // Step 6: Compose (95%)
    onProgress({ percentage: PROGRESS_WEIGHTS.CONTEXT + PROGRESS_WEIGHTS.MINE_ME + PROGRESS_WEIGHTS.MINE_COMPETITORS + PROGRESS_WEIGHTS.FILTER + PROGRESS_WEIGHTS.CLASSIFY + PROGRESS_WEIGHTS.COMPOSE, taskIndex: 5 });
    onLog(`[Writer] 📝 Generating comprehensive competitive intelligence report with insights and recommendations...`);
    
    const allItems = [...mineMe, ...mineCompetitors];

    // Submit background job to avoid Vercel timeouts
    onLog('[System] Submitting background job for report generation...');
    const startRes = await fetch('/api/analyze/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: allItems, input, meContext }),
    });
    const { jobId } = await startRes.json();
    onLog(`[System] Job started: ${jobId}`);

    // Poll status until complete
    let result: AnalysisResult | null = null;
    let lastProgress = 0;
    for (let i = 0; i < 600; i++) { // up to 10 minutes with 1s interval
      await new Promise(r => setTimeout(r, 1000));
      const statusRes = await fetch(`/api/analyze/status?jobId=${jobId}`);
      const status = await statusRes.json();
      if (status.logs) status.logs.forEach((l: string) => onLog(l));
      if (typeof status.progress === 'number' && status.progress !== lastProgress) {
        lastProgress = status.progress;
        onProgress({ percentage: Math.max(lastProgress, 90), taskIndex: 5 });
      }
      if (status.status === 'completed') {
        const res = await fetch(`/api/analyze/result?jobId=${jobId}`);
        result = await res.json();
        break;
      }
      if (status.status === 'failed') {
        throw new Error(status.error || 'Background job failed');
      }
    }
    if (!result) {
      onLog('[System] Background job took too long, returning local fallback.');
      result = buildLocalFallbackReport(allItems, input, meContext, onLog);
    }
    
    // Step 7: CSV (100%)
    onProgress({ percentage: 100, taskIndex: 6 });
    onLog(`[CSV] 📋 Exporting detailed data to CSV with ${allItems.length} analyzed discussions...`);
    onLog(`[System] 🎉 Analysis complete! Generated report with insights from ${allItems.length} Reddit discussions.`);
    
    return result;
  } catch (error) {
    onLog(`[System] ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// ------------------
// Local fallback report generator (client-side) to guarantee output
// ------------------
function buildLocalFallbackReport(
  items: RawItem[],
  input: AnalyzeInput,
  _meContext: ContextPack,
  onLog: LogCallback
): AnalysisResult {
  const coverage: CoverageMeta = {
    days: input.days,
    totalThreads: items.filter(i => i.type === 'post').length,
    totalComments: items.filter(i => i.type === 'comment').length,
    totalItemsUsed: items.length,
    subredditsUsed: new Set(items.map(i => i.subreddit)).size,
  };

  const md = generateHeuristicMarkdown(items, input, coverage);

  const report: ReportSections = {
    header: '# **Competitive Intelligence Report**\n\n',
    launches: '',
    loving: '',
    notLoving: '',
    strategicRead: '',
    takeaways: '',
    appendixCsv: buildCsv(items),
    raw: md,
  };

  onLog(`[Writer] ✅ Generated local fallback report with ${items.length} items across ${coverage.subredditsUsed} subreddits.`);
  return { report, coverage };
}

function generateHeuristicMarkdown(items: RawItem[], input: AnalyzeInput, coverage: CoverageMeta): string {
  const byCompetitor: Record<string, RawItem[]> = {};
  for (const it of items.slice(0, 250)) {
    const key = it.matchedCompetitor || 'Unknown';
    (byCompetitor[key] ||= []).push(it);
  }

  const posRx = /(love|awesome|great|fast|amazing|improve|like|good|easy|works|best)/i;
  const negRx = /(bug|crash|slow|issue|problem|expensive|pricey|hate|bad|hard|doesn\'t|broken|error|downtime)/i;
  const updRx = /(launch|release|update|version|v\d|beta|ga|announc)/i;

  const sectionForProduct = (name: string, arr: RawItem[]) => {
    const updates = arr.filter(a => updRx.test(a.title_or_text)).slice(0, 3);
    const loves = arr.filter(a => posRx.test(a.title_or_text)).slice(0, 4);
    const notLoves = arr.filter(a => negRx.test(a.title_or_text)).slice(0, 4);

    const list = (xs: RawItem[]) => xs.map(x => `• ${truncate(x.title_or_text, 140)}\n  [ref](${x.thread_url})`).join('\n');

    return [
      `### **${name}**`,
      ``,
      `#### **🚀 New Updates**`,
      updates.length ? list(updates) : '• No major launches mentioned in this window.',
      ``,
      `#### **💚 What Users Love**`,
      loves.length ? list(loves) : '• Positive mentions exist but were not strongly classified in this window.',
      ``,
      `#### **⚠️ What Users Dislike**`,
      notLoves.length ? list(notLoves) : '• Few explicit complaints detected in this window.',
      ``,
      `---`,
    ].join('\n');
  };

  const competitorsMd = [input.me.name, ...input.competitors.map(c => c.name)]
    .filter(Boolean)
    .map(name => sectionForProduct(name, byCompetitor[name] || []))
    .join('\n');

  const header = [
    '# **Competitive Intelligence Report**',
    '',
    '---',
    '',
    `*Report generated via heuristic fallback (no AI model). Data from ${coverage.totalThreads} threads and ${coverage.totalComments} comments across ${coverage.subredditsUsed} subreddits over ${coverage.days} days.*`,
    '',
  ].join('\n');

  const takeaways = [
    '## **💡 Strategic Takeaways**',
    '',
    '1. Focus on repeatedly mentioned pain points and turn them into roadmap items.',
    '2. Emphasize strengths users already praise in your marketing and onboarding.',
    '3. Track new launches closely to adjust positioning within 1–2 weeks of release.',
    '',
    '---',
    `*This fallback ensures the report is always generated even if the serverless analysis fails.*`,
  ].join('\n');

  return [header, '## **Competitor Analysis**', '', competitorsMd, takeaways].join('\n');
}

function truncate(s: string, n: number): string {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function buildCsv(items: RawItem[]): string {
  const headers = ['Competitor', 'User Feedback', 'Score', 'Subreddit', 'Thread Link'];
  const rows = items.slice(0, 200).map(i => [
    i.matchedCompetitor,
    '"' + truncate(i.title_or_text.replace(/"/g, '""'), 180) + '"',
    String(i.score ?? 0),
    `r/${i.subreddit}`,
    i.thread_url,
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// Stream-aware API call helper
async function streamCall(
  endpoint: string,
  data: unknown,
  onLog: LogCallback
): Promise<unknown> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    // Read raw text first to guard against empty/HTML responses from platform timeouts
    const rawText = await response.text();
    
    if (!response.ok) {
      // Try to parse JSON error, otherwise surface raw text
      try {
        const errJson = rawText ? JSON.parse(rawText) : {};
        throw new Error(errJson.error || `Request to ${endpoint} failed (${response.status}).`);
      } catch {
        throw new Error(`Request to ${endpoint} failed (${response.status}). Body: ${rawText?.slice(0, 200) || 'empty response'}`);
      }
    }
    
    // Try to parse JSON; if invalid, surface raw body for debugging
    try {
      const parsed = rawText ? JSON.parse(rawText) : null;
      if (parsed == null) throw new Error('Empty JSON body');
      return parsed;
    } catch (e) {
      throw new Error(`Invalid JSON from ${endpoint}. Body: ${rawText?.slice(0, 200) || 'empty'}`);
    }
  } catch (error) {
    onLog(`[System] Error calling ${endpoint}: ${error instanceof Error ? error.message : 'Unknown'}`);
    throw error;
  }
}

// Background job helper for endpoints converted to BG mode
async function runBackgroundJob(
  endpointBase: '/api/fetch/reddit' | '/api/analyze',
  payload: any,
  onLog: LogCallback
): Promise<unknown> {
  // Map endpoint to its start/status/result paths
  const base = endpointBase === '/api/fetch/reddit' ? '/api/fetch/reddit' : '/api/analyze';
  const startPath = `${base}/start`;
  const statusPath = `${base}/status?jobId=`;
  const resultPath = `${base}/result?jobId=`;

  const startRes = await fetch(startPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const { jobId } = await startRes.json();

  let lastLogSent = '';
  for (let i = 0; i < 900; i++) { // 15 minutes max
    await new Promise(r => setTimeout(r, 1000));
    const statusRes = await fetch(`${statusPath}${jobId}`);
    const status = await statusRes.json();
    if (status.logs && status.logs.length > 0) {
      const latest = status.logs[status.logs.length - 1];
      if (latest && latest !== lastLogSent) {
        onLog(latest);
        lastLogSent = latest;
      }
    }
    if (status.status === 'completed') {
      const res = await fetch(`${resultPath}${jobId}`);
      const data = await res.json();
      // Normalize result shape per job type
      if (endpointBase === '/api/fetch/reddit') {
        return (data && data.items) ? data.items : [];
      }
      return data;
    }
    if (status.status === 'failed') {
      throw new Error(status.error || 'Background job failed');
    }
  }
  throw new Error('Background job timed out');
}

// Legacy function for backward compatibility
export async function runAnalysis(
  input: AnalyzeInput, 
  onProgress?: ProgressCallback
): Promise<AnalysisResult> {
  const logCallback: LogCallback = (log: string) => {
    console.log(log);
  };
  
  const progressCallback: ProgressUpdateCallback = (progress: { percentage: number; taskIndex: number }) => {
    const taskNames = ['context', 'mine-me', 'mine-competitors', 'filter', 'classify', 'compose', 'csv'];
    onProgress?.(taskNames[progress.taskIndex] || 'processing', `${Math.round(progress.percentage)}% complete`);
  };
  
  return runAnalysisWithStreaming(input, logCallback, progressCallback);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportMarkdown(report: ReportSections): void {
  const fullReport = [
    report.header,
    report.launches,
    report.loving,
    report.notLoving,
    report.strategicRead,
    report.takeaways,
  ].filter(Boolean).join('\n\n');
  
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(fullReport, `competitor-analysis-${timestamp}.md`, 'text/markdown');
}

export function exportCsv(report: ReportSections): void {
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(report.appendixCsv, `competitor-analysis-${timestamp}.csv`, 'text/csv');
}
