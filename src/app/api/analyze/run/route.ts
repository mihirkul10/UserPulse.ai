export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 300; // BG functions can run longer when invoked with header

import { NextRequest, NextResponse } from 'next/server';
import { getJob, updateJob, completeJob, failJob } from '../jobStore';
import { AnalyzeInput, RawItem, ContextPack } from '@/lib/types';
import { filterForRelevance, classifyAspects, writeReport, writeReportV2 } from '@/lib/openai';
import { groupBy, uniqBy } from 'lodash';
import dayjs from 'dayjs';

export async function POST(req: NextRequest) {
  const jobId = req.headers.get('x-job-id') || '';
  const job = getJob(jobId);
  if (!job) return NextResponse.json({ error: 'Invalid job id' }, { status: 400 });

  try {
    const { items, input, meContext }: { items: RawItem[]; input: AnalyzeInput; meContext: ContextPack } = await req.json();
    const log = (m: string) => updateJob(jobId, { logs: [...(getJob(jobId)?.logs || []), m] });

    const dedup = uniqBy(items, 'id');
    updateJob(jobId, { progress: 25 });

    const byCompetitor = groupBy(dedup, 'matchedCompetitor');
    const allClassified: any[] = [];
    for (const [name, arr] of Object.entries(byCompetitor)) {
      log(`[Classifier] Classifying ${arr.length} items for ${name}`);
      const cls = await classifyAspects(arr as any, name);
      allClassified.push(...cls);
    }
    updateJob(jobId, { progress: 60 });

    log('[Writer] Generating report');
    const reportMd = await writeReportV2(allClassified as any, input, {
      days: input.days,
      totalThreads: items.filter(i => i.type === 'post').length,
      totalComments: items.filter(i => i.type === 'comment').length,
      totalItemsUsed: allClassified.length,
      subredditsUsed: new Set(items.map(i => i.subreddit)).size,
    });

    const report = await writeReport(allClassified as any, input, {
      days: input.days,
      totalThreads: items.filter(i => i.type === 'post').length,
      totalComments: items.filter(i => i.type === 'comment').length,
      totalItemsUsed: allClassified.length,
      subredditsUsed: new Set(items.map(i => i.subreddit)).size,
    }, meContext);

    completeJob(jobId, { report: { ...report, raw: reportMd }, coverage: {
      days: input.days,
      totalThreads: items.filter(i => i.type === 'post').length,
      totalComments: items.filter(i => i.type === 'comment').length,
      totalItemsUsed: allClassified.length,
      subredditsUsed: new Set(items.map(i => i.subreddit)).size,
    }});
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    failJob(jobId, e?.message || 'Unknown error');
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}


