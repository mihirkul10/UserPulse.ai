'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Fade,
  Collapse,
} from '@mui/material';
import {
  CheckCircleOutline,
  RadioButtonUnchecked,
  Circle,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressController } from './SmoothProgress';

interface Task {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
  subtext?: string;
}

interface ProgressPanelProps {
  tasks: Task[];
  progressController: ProgressController;
  currentSubtext?: string;
}

const TaskIcon = ({ status }: { status: Task['status'] }) => {
  switch (status) {
    case 'active':
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <CircularProgress size={20} thickness={3} />
        </motion.div>
      );
    case 'completed':
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        >
          <CheckCircleOutline sx={{ color: 'success.main' }} />
        </motion.div>
      );
    default:
      return <RadioButtonUnchecked sx={{ color: 'text.disabled', fontSize: 20 }} />;
  }
};

export default function ProgressPanel({ 
  tasks, 
  progressController,
  currentSubtext 
}: ProgressPanelProps) {
  const [progressValue, setProgressValue] = useState(0);
  const [displaySubtext, setDisplaySubtext] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const value = progressController.tick();
      setProgressValue(value);
    }, 16); // 60fps

    return () => clearInterval(interval);
  }, [progressController]);

  useEffect(() => {
    if (currentSubtext) {
      setDisplaySubtext(currentSubtext);
    }
  }, [currentSubtext]);

  const activeTask = tasks.find(t => t.status === 'active');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Analyzing Competitors...
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  minWidth: 45,
                  fontFeatureSettings: '"tnum"',
                  fontWeight: 500,
                }}
              >
                {isNaN(progressValue) ? '0' : Math.round(progressValue)}%
              </Typography>
              <Box sx={{ flexGrow: 1, ml: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={isNaN(progressValue) ? 0 : progressValue}
                  sx={{
                    height: 8,
                    '& .MuiLinearProgress-bar': {
                      transition: 'transform 0.2s ease-out',
                      background: (theme) => 
                        `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    },
                  }}
                  aria-label="Analysis progress"
                  aria-valuenow={isNaN(progressValue) ? 0 : Math.round(progressValue)}
                />
              </Box>
            </Box>
            
            <AnimatePresence mode="wait">
              {displaySubtext && (
                <motion.div
                  key={displaySubtext}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ ml: 7 }}
                  >
                    {displaySubtext}
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
          
          <List sx={{ py: 0 }}>
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <ListItem 
                  sx={{ 
                    px: 0,
                    py: 1,
                    opacity: task.status === 'pending' ? 0.5 : 1,
                    transition: 'opacity 0.3s',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <TaskIcon status={task.status} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography 
                        variant="body2"
                        fontWeight={task.status === 'active' ? 600 : 400}
                      >
                        {task.label}
                      </Typography>
                    }
                    secondary={
                      task.status === 'active' && task.subtext && (
                        <Fade in timeout={200}>
                          <Typography variant="caption" color="text.secondary">
                            {task.subtext}
                          </Typography>
                        </Fade>
                      )
                    }
                  />
                </ListItem>
              </motion.div>
            ))}
          </List>
        </CardContent>
      </Card>
    </motion.div>
  );
}
