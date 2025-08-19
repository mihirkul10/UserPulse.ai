export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { createJob, updateJob } from '../jobStore';

export async function POST(req: NextRequest) {
  const jobId = Math.random().toString(36).slice(2);
  createJob(jobId);
  // Mark running immediately; worker endpoint will do heavy lifting
  updateJob(jobId, { status: 'running', logs: ['[System] Background analysis started'] });

  const body = await req.text();

  // Fire background request to worker route with header Vercel understands
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
  fetch(`${baseUrl}/api/analyze/run`, {
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


