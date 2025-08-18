import { SavedReport, AnalyzeInput, ReportSections, CoverageMeta } from './types';

const STORAGE_KEY = 'competitor-insight-reports';
const MAX_REPORTS = 5;

export function saveReport(
  input: AnalyzeInput,
  report: ReportSections,
  coverage: CoverageMeta
): void {
  if (typeof window === 'undefined') return;
  
  const newReport: SavedReport = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    input,
    report,
    coverage,
  };
  
  const existingReports = getReports();
  const updatedReports = [newReport, ...existingReports].slice(0, MAX_REPORTS);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
}

export function getReports(): SavedReport[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load reports from storage:', error);
    return [];
  }
}

export function deleteReport(id: string): void {
  if (typeof window === 'undefined') return;
  
  const reports = getReports().filter(report => report.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function clearAllReports(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(STORAGE_KEY);
}
