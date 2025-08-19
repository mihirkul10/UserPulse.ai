'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  Collapse,
  useTheme,
} from '@mui/material';
import {
  Psychology,
  ExpandMore,
  ExpandLess,
  ContentCopy,
  Clear,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { alpha } from '@mui/material/styles';

export interface LogEntry {
  timestamp: string;
  service: string;
  message: string;
  level?: 'info' | 'warn' | 'error' | 'success';
}

interface DebugConsoleProps {
  logs: LogEntry[];
  isOpen: boolean;
  onToggle: () => void;
  isRunning: boolean;
}

const SERVICE_COLORS: Record<string, string> = {
  'Context': '#6750A4',
  'Crawler': '#386A20',
  'Filter': '#0B57D0',
  'Classifier': '#F9AB00',
  'Writer': '#0F9D58',
  'CSV': '#B3261E',
};

export default function DebugConsole({ 
  logs, 
  isOpen, 
  onToggle, 
  isRunning 
}: DebugConsoleProps) {
  const theme = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  useEffect(() => {
    // Keyboard shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        onToggle();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  const handleCopy = () => {
    const text = logs
      .map(log => `[${log.timestamp}] [${log.service}] ${log.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
  };

  const handleClear = () => {
    // This would need to be connected to a clear function in the parent
    console.log('Clear logs');
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 10;
    setAutoScroll(isAtBottom);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        sx={{
          mb: 2,
          overflow: 'hidden',
          backgroundColor: theme.palette.mode === 'light' ? '#1C1B1F' : '#0B0B0C',
          border: 1,
          borderColor: theme.palette.mode === 'light' ? 'divider' : alpha('#E6E1E5', 0.1),
          height: 'fit-content',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            backgroundColor: alpha('#000', 0.2),
            borderBottom: 1,
            borderColor: alpha('#E6E1E5', 0.1),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Psychology sx={{ color: '#4ADE80', fontSize: 18 }} />
            <Typography
              variant="caption"
              sx={{
                color: '#E6E1E5',
                fontFamily: '"JetBrains Mono", "Cascadia Code", ui-monospace, monospace',
                fontWeight: 500,
              }}
            >
              Agent Brain
            </Typography>
            {isRunning && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#4ADE80',
                  }}
                />
              </motion.div>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Copy logs">
              <IconButton size="small" onClick={handleCopy} sx={{ color: '#E6E1E5' }}>
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear logs">
              <IconButton size="small" onClick={handleClear} sx={{ color: '#E6E1E5' }}>
                <Clear fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={isOpen ? 'Collapse' : 'Expand'}>
              <IconButton size="small" onClick={onToggle} sx={{ color: '#E6E1E5' }}>
                {isOpen ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Collapse in={isOpen}>
          <Box
            ref={scrollRef}
            onScroll={handleScroll}
            sx={{
              height: 240,
              overflowY: 'auto',
              overflowX: 'hidden',
              p: 2,
              fontFamily: '"JetBrains Mono", "Cascadia Code", ui-monospace, monospace',
              fontSize: 12,
              lineHeight: 1.6,
              '&::-webkit-scrollbar': {
                width: 8,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha('#E6E1E5', 0.2),
                borderRadius: 4,
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
            }}
          >
            <AnimatePresence initial={false}>
              {logs.map((log, index) => (
                <motion.div
                  key={`${log.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box sx={{ display: 'flex', gap: 1, mb: 0.5, alignItems: 'flex-start' }}>
                    <Typography
                      component="span"
                      sx={{
                        color: alpha('#E6E1E5', 0.5),
                        fontSize: 11,
                        minWidth: 60,
                      }}
                    >
                      {log.timestamp}
                    </Typography>
                    
                    <Chip
                      label={log.service}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 10,
                        fontWeight: 600,
                        backgroundColor: alpha(SERVICE_COLORS[log.service] || '#E6E1E5', 0.2),
                        color: SERVICE_COLORS[log.service] || '#E6E1E5',
                        border: `1px solid ${alpha(SERVICE_COLORS[log.service] || '#E6E1E5', 0.3)}`,
                        '& .MuiChip-label': {
                          px: 1,
                        },
                      }}
                    />
                    
                    <Typography
                      component="span"
                      sx={{
                        color: log.level === 'error' ? '#EF4444' :
                               log.level === 'warn' ? '#F59E0B' :
                               log.level === 'success' ? '#4ADE80' :
                               '#E6E1E5',
                        flex: 1,
                        wordBreak: 'break-word',
                      }}
                    >
                      {log.message}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {logs.length === 0 && (
              <Typography sx={{ color: alpha('#E6E1E5', 0.3), textAlign: 'center', mt: 8 }}>
                Waiting for logs...
              </Typography>
            )}
          </Box>
        </Collapse>
      </Paper>
    </motion.div>
  );
}