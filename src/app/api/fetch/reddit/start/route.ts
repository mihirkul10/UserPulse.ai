export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { createJob, updateJob } from '../../../analyze/jobStore';

export async function POST(req: NextRequest) {
  const jobId = Math.random().toString(36).slice(2);
  createJob(jobId);
  updateJob(jobId, { status: 'running', logs: ['[Crawler] Background Reddit mining started'] });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
  const body = await req.text();
  fetch(`${baseUrl}/api/fetch/reddit/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-vercel-background': '1',
      'x-job-id': jobId,
    },
    body,
  }).catch(() => {});

  return NextResponse.json({ jobId }, { status: 202 });
}


