export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 10;

import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '../jobStore';

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId') || '';
  const job = getJob(jobId);
  if (!job) return NextResponse.json({ error: 'Invalid job id' }, { status: 404 });
  return NextResponse.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    logs: job.logs.slice(-50),
    error: job.error,
    hasResult: !!job.result,
  });
}


