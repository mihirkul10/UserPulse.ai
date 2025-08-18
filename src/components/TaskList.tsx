'use client';

import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircleOutline,
  RadioButtonUnchecked,
} from '@mui/icons-material';

interface Task {
  id: string;
  label: string;
}

interface TaskListProps {
  tasks: Task[];
  activeIndex: number;
  completedTasks: Set<number>;
}

export default function TaskList({ tasks, activeIndex, completedTasks }: TaskListProps) {
  const getTaskIcon = (index: number) => {
    if (completedTasks.has(index)) {
      return <CheckCircleOutline color="success" fontSize="small" />;
    } else if (index === activeIndex) {
      return <CircularProgress size={16} />;
    } else {
      return <RadioButtonUnchecked color="disabled" fontSize="small" />;
    }
  };

  return (
    <List dense>
      {tasks.map((task, index) => (
        <ListItem key={task.id} sx={{ py: 0.5 }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            {getTaskIcon(index)}
          </ListItemIcon>
          <ListItemText 
            primary={task.label}
            sx={{
              '& .MuiListItemText-primary': {
                fontSize: '0.875rem',
                fontWeight: index === activeIndex ? 600 : 400,
                color: completedTasks.has(index) ? 'success.main' : 'inherit',
              },
            }}
          />
        </ListItem>
      ))}
    </List>
  );
}

export const DEFAULT_TASKS: Task[] = [
  { id: 'context', label: 'Build context (me)' },
  { id: 'mine-me', label: 'Query Reddit for MY PRODUCT' },
  { id: 'mine-competitors', label: 'Query Reddit for COMPETITORS' },
  { id: 'filter', label: 'Filter for UX/feedback' },
  { id: 'classify', label: 'Cluster & classify' },
  { id: 'compose', label: 'Compose markdown' },
  { id: 'csv', label: 'Assemble CSV appendix' },
];
