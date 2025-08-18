'use client';

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { SavedReport } from '@/lib/types';
import { getReports, deleteReport } from '@/lib/storage';

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onLoadReport: (report: SavedReport) => void;
}

export default function HistoryDrawer({ open, onClose, onLoadReport }: HistoryDrawerProps) {
  const [reports, setReports] = useState<SavedReport[]>([]);

  useEffect(() => {
    if (open) {
      setReports(getReports());
    }
  }, [open]);

  const handleDeleteReport = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    deleteReport(id);
    setReports(getReports());
  };

  const handleLoadReport = (report: SavedReport) => {
    onLoadReport(report);
    onClose();
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          maxWidth: '100vw',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Report History
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {reports.length === 0 ? (
          <Alert severity="info">
            No saved reports yet. Run your first analysis to see reports here.
          </Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {reports.length} of 5 reports saved
            </Typography>
            
            <List>
              {reports.map((report, index) => (
                <React.Fragment key={report.id}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleLoadReport(report)}>
                      <ListItemText
                        primary={
                          <Box>
                            <Typography variant="subtitle2" noWrap>
                              {report.input.me.name} vs{' '}
                              {report.input.competitors.slice(0, 2).map(c => c.name).join(', ')}
                              {report.input.competitors.length > 2 && ` +${report.input.competitors.length - 2}`}
                            </Typography>
                            <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              <Chip 
                                label={`${report.coverage.totalItemsUsed} items`}
                                size="small"
                                variant="outlined"
                              />
                              <Chip 
                                label={`${report.coverage.days}d`}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        }
                        secondary={formatDate(report.timestamp)}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={(e) => handleDeleteReport(report.id, e)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItemButton>
                  </ListItem>
                  {index < reports.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </>
        )}
      </Box>
    </Drawer>
  );
}
