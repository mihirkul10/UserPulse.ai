import { CoverageMeta, ReportSections } from '@/lib/types';

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface JobState {
  id: string;
  status: JobStatus;
  progress: number; // 0..100
  logs: string[];
  error?: string;
  result?: { report: ReportSections; coverage: CoverageMeta };
  updatedAt: number;
}

// Ensure a single shared store across route modules/instances in the same process
const g = globalThis as any;
if (!g.__USERPULSE_JOB_STORE__) {
  g.__USERPULSE_JOB_STORE__ = new Map<string, JobState>();
}
const jobs: Map<string, JobState> = g.__USERPULSE_JOB_STORE__;

export function createJob(id: string): JobState {
  const state: JobState = {
    id,
    status: 'queued',
    progress: 0,
    logs: ['[System] Job queued'],
    updatedAt: Date.now(),
  };
  jobs.set(id, state);
  return state;
}

export function getJob(id: string): JobState | undefined {
  return jobs.get(id);
}

export function updateJob(id: string, patch: Partial<JobState>): JobState | undefined {
  const prev = jobs.get(id);
  if (!prev) return undefined;
  const next = { ...prev, ...patch, updatedAt: Date.now() } as JobState;
  jobs.set(id, next);
  return next;
}

export function completeJob(id: string, result: { report: ReportSections; coverage: CoverageMeta }) {
  updateJob(id, { status: 'completed', progress: 100, result, logs: [...(jobs.get(id)?.logs || []), '[System] Job completed'] });
}

export function failJob(id: string, message: string) {
  const logs = jobs.get(id)?.logs || [];
  updateJob(id, { status: 'failed', progress: 100, error: message, logs: [...logs, `[System] Error: ${message}`] });
}


