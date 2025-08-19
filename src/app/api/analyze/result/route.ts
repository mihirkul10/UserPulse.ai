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
  if (job.status !== 'completed' || !job.result) return NextResponse.json({ error: 'Not ready' }, { status: 202 });
  return NextResponse.json(job.result);
}


