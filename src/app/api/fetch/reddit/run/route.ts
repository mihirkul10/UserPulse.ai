export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 300;

import { NextRequest, NextResponse } from 'next/server';
import { getJob, updateJob, completeJob, failJob } from '../../../analyze/jobStore';
import { POST as FetchRedditPOST } from '../route';

export async function POST(req: NextRequest) {
  const jobId = req.headers.get('x-job-id') || '';
  const job = getJob(jobId);
  if (!job) return NextResponse.json({ error: 'Invalid job id' }, { status: 404 });
  try {
    const result = await FetchRedditPOST(req);
    const data = await result.json();
    completeJob(jobId, { items: data });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    failJob(jobId, e?.message || 'Unknown error');
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}


