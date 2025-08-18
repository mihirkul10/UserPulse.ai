'use client';

import React, { useState, useRef } from 'react';
import { Box } from '@mui/material';
import AppShell from '@/components/AppShell';
import InputCard from '@/components/InputCard';
import ProgressPanel from '@/components/ProgressPanel';
import DebugConsole, { LogEntry } from '@/components/DebugConsole';
import ReportView from '@/components/ReportView';
import HistoryDrawer from '@/components/HistoryDrawer';
import HowItWorksDialog from '@/components/HowItWorksDialog';
import { ProgressController } from '@/components/SmoothProgress';
import { ProductProfile, AnalyzeInput, ReportSections, CoverageMeta } from '@/lib/types';
import { runAnalysisWithStreaming, AnalysisResult } from '@/app/actions';
import { saveReport } from '@/lib/storage';
import { DEFAULT_SUBREDDITS } from '@/lib/subreddits';

// Task definitions
const TASKS = [
  { id: 'context', label: 'Build context for your product', status: 'pending' as const },
  { id: 'mine-me', label: 'Query Reddit for your product', status: 'pending' as const },
  { id: 'mine-competitors', label: 'Query Reddit for competitors', status: 'pending' as const },
  { id: 'filter', label: 'Filter for UX/feedback relevance', status: 'pending' as const },
  { id: 'classify', label: 'Cluster & classify insights', status: 'pending' as const },
  { id: 'compose', label: 'Compose markdown report', status: 'pending' as const },
  { id: 'csv', label: 'Assemble CSV appendix', status: 'pending' as const },
];

export default function Home() {
  const [state, setState] = useState<'setup' | 'analyzing' | 'report'>('setup');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentInput, setCurrentInput] = useState<AnalyzeInput | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [tasks, setTasks] = useState(TASKS);
  const [currentSubtext, setCurrentSubtext] = useState<string>('');
  
  const progressController = useRef(new ProgressController());

  const addLog = (service: string, message: string, level?: LogEntry['level']) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    setLogs(prev => [...prev, { timestamp, service, message, level }]);
  };

  const handleStartAnalysis = async (me: ProductProfile, competitors: ProductProfile[]) => {
    setState('analyzing');
    setLogs([]);
    setTasks(TASKS.map(t => ({ ...t, status: 'pending' as const })));
    progressController.current.reset();
    setConsoleOpen(true);
    
    const input: AnalyzeInput = {
      me,
      competitors,
      days: 30,
      minScoreReddit: 0,
      maxThreads: 250,
      langs: ['en'],
      subreddits: DEFAULT_SUBREDDITS,
    };
    
    setCurrentInput(input);
    
    try {
      addLog('System', 'Starting competitive analysis...', 'info');
      
      const result = await runAnalysisWithStreaming(
        input,
        (log) => {
          // Parse log format: [Service] message
          const match = log.match(/^\[(\w+)\]\s*(.*)$/);
          if (match) {
            const service = match[1];
            const message = match[2];
            const level = message.includes('✓') ? 'success' : 
                         message.includes('❌') ? 'error' :
                         message.includes('🔍') || message.includes('📊') || message.includes('📝') ? 'info' : 'info';
            addLog(service, message, level);
          } else {
            addLog('System', log);
          }
        },
        (progress) => {
          if (typeof progress.percentage === 'number' && !isNaN(progress.percentage)) {
            progressController.current.setTarget(progress.percentage);
          }
          
          // Update task statuses
          const newTasks = TASKS.map((task, idx) => ({
            ...task,
            status: idx < progress.taskIndex ? 'completed' as const :
                   idx === progress.taskIndex ? 'active' as const :
                   'pending' as const
          }));
          setTasks(newTasks);
          
          // Update subtext based on current task
          const subtexts = [
            'Analyzing product context...',
            `Searching Reddit for ${me.name}...`,
            `Searching Reddit for ${competitors[0]?.name || 'competitors'}...`,
            'Filtering for relevant discussions...',
            'Classifying insights by aspect...',
            'Writing comprehensive report...',
            'Generating CSV export...'
          ];
          setCurrentSubtext(subtexts[progress.taskIndex] || '');
        }
      );
      
      addLog('System', 'Analysis complete!', 'success');
      setAnalysisResult(result);
      saveReport(input, result.report, result.coverage);
      setState('report');
      
      // Auto-collapse Agent Brain after a short delay when report is ready
      setTimeout(() => {
        setConsoleOpen(false);
      }, 2000);
    } catch (error) {
      addLog('System', `Analysis failed: ${error}`, 'error');
      console.error('Analysis failed:', error);
      setState('setup');
    }
  };

  const handleNewAnalysis = () => {
    setState('setup');
    setAnalysisResult(null);
    setCurrentInput(null);
    setLogs([]);
    setTasks(TASKS.map(t => ({ ...t, status: 'pending' as const })));
    progressController.current.reset();
  };

  const handleLoadFromHistory = (report: { report: ReportSections; coverage: CoverageMeta; input: AnalyzeInput }) => {
    setAnalysisResult({
      report: report.report,
      coverage: report.coverage,
    });
    setCurrentInput(report.input);
    setState('report');
    setHistoryOpen(false);
    setConsoleOpen(false); // Collapse Agent Brain when loading from history
  };

  return (
    <AppShell 
      onHistoryOpen={() => setHistoryOpen(true)}
      onHowItWorksOpen={() => setHowItWorksOpen(true)}
    >
      <Box>
        {state === 'setup' && (
          <InputCard 
            onSubmit={handleStartAnalysis}
            isLoading={false}
          />
        )}
        
        {state === 'analyzing' && (
          <>
            <DebugConsole
              logs={logs}
              isOpen={consoleOpen}
              onToggle={() => setConsoleOpen(!consoleOpen)}
              isRunning={true}
            />
            <ProgressPanel
              tasks={tasks}
              progressController={progressController.current}
              currentSubtext={currentSubtext}
            />
          </>
        )}
        
        {state === 'report' && analysisResult && currentInput && (
          <>
            <DebugConsole
              logs={logs}
              isOpen={consoleOpen}
              onToggle={() => setConsoleOpen(!consoleOpen)}
              isRunning={false}
            />
            <ReportView
              report={analysisResult.report}
              coverage={analysisResult.coverage}
              input={currentInput}
              onNewAnalysis={handleNewAnalysis}
            />
          </>
        )}
        
        <HistoryDrawer
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          onLoadReport={handleLoadFromHistory}
        />
        
        <HowItWorksDialog
          open={howItWorksOpen}
          onClose={() => setHowItWorksOpen(false)}
        />
      </Box>
    </AppShell>
  );
}