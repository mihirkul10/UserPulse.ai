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
    
    const mineMe = await streamCall('/api/fetch/reddit', {
      target: 'me',
      ...input,
      subreddits: input.subreddits.length > 0 ? input.subreddits : DEFAULT_SUBREDDITS,
      meContext,
    }, onLog) as RawItem[];
    
    onLog(`[Crawler] ✓ Found ${mineMe.length} discussions about ${input.me.name}`);
    
    // Step 3: Mine COMPETITORS (55%)
    onProgress({ percentage: PROGRESS_WEIGHTS.CONTEXT + PROGRESS_WEIGHTS.MINE_ME + PROGRESS_WEIGHTS.MINE_COMPETITORS, taskIndex: 2 });
    onLog(`[Crawler] 🔍 Searching ${input.subreddits.length} subreddits for discussions about competitors: ${input.competitors.map(c => c.name).join(', ')}...`);
    
    const mineCompetitors = await streamCall('/api/fetch/reddit', {
      target: 'competitors',
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
    const result = await streamCall('/api/analyze', {
      items: allItems,
      input,
      meContext,
    }, onLog) as AnalysisResult;
    
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
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Request to ${endpoint} failed`);
    }
    
    // For now, return JSON directly
    // TODO: Implement actual streaming when routes support it
    const result = await response.json();
    return result;
  } catch (error) {
    onLog(`[System] Error calling ${endpoint}: ${error instanceof Error ? error.message : 'Unknown'}`);
    throw error;
  }
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
