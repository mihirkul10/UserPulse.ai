'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  Snackbar,
  Divider,
} from '@mui/material';
import {
  ContentCopy,
  Download,
  Save,
  Refresh,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { ReportSections, CoverageMeta, AnalyzeInput } from '@/lib/types';
import { copyToClipboard, exportMarkdown, exportCsv } from '@/app/actions';
import { saveReport } from '@/lib/storage';
import { styled } from '@mui/material/styles';

interface ReportViewProps {
  report: ReportSections;
  coverage: CoverageMeta;
  input: AnalyzeInput;
  onNewAnalysis: () => void;
}

// Styled component for better formatted markdown
const StyledMarkdown = styled(Box)(({ theme }) => ({
  '& h1': {
    fontSize: '2rem',
    fontWeight: 700,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  '& h2': {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  '& h3': {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
  },
  '& h4': {
    fontSize: '1.1rem',
    fontWeight: 500,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  '& p': {
    marginBottom: theme.spacing(2),
    lineHeight: 1.7,
  },
  '& ul, & ol': {
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
  },
  '& li': {
    marginBottom: theme.spacing(1),
    lineHeight: 1.7,
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    fontWeight: 500,
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(33, 150, 243, 0.1)' 
      : 'rgba(25, 118, 210, 0.08)',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(33, 150, 243, 0.2)'
        : 'rgba(25, 118, 210, 0.15)',
      textDecoration: 'underline',
    },
  },
  '& hr': {
    margin: theme.spacing(4, 0),
    border: 'none',
    borderTop: `2px solid ${theme.palette.divider}`,
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    paddingLeft: theme.spacing(2),
    marginLeft: 0,
    marginRight: 0,
    fontStyle: 'italic',
    color: theme.palette.text.secondary,
  },
  '& code': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.05)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '0.9em',
  },
  '& strong': {
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  '& em': {
    fontStyle: 'italic',
    color: theme.palette.text.secondary,
  },
}))

export default function ReportView({ report, coverage, input, onNewAnalysis }: ReportViewProps) {
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  });

  const handleCopyMarkdown = async () => {
    try {
      const fullReport = report.raw || [
        report.header,
        report.launches,
        report.loving,
        report.notLoving,
        report.strategicRead,
        report.takeaways,
      ].filter(Boolean).join('\n\n');
      
      await copyToClipboard(fullReport);
      setSnackbar({ open: true, message: 'Report copied to clipboard!', type: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to copy report', type: 'error' });
    }
  };

  const handleExportMarkdown = () => {
    try {
      exportMarkdown(report);
      setSnackbar({ open: true, message: 'Markdown file downloaded!', type: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to export markdown', type: 'error' });
    }
  };

  const handleExportCsv = () => {
    try {
      exportCsv(report);
      setSnackbar({ open: true, message: 'CSV file downloaded!', type: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to export CSV', type: 'error' });
    }
  };

  const handleSaveReport = () => {
    try {
      saveReport(input, report, coverage);
      setSnackbar({ open: true, message: 'Report saved to history!', type: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to save report', type: 'error' });
    }
  };

  return (
    <Box>
      {/* Header with actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h4" gutterBottom>
                Competitive Intelligence Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {input.me.name} vs {input.competitors.map(c => c.name).join(', ')}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button
                  startIcon={<ContentCopy />}
                  onClick={handleCopyMarkdown}
                  variant="outlined"
                  size="small"
                >
                  Copy Markdown
                </Button>
                <Button
                  startIcon={<Download />}
                  onClick={handleExportMarkdown}
                  variant="outlined"
                  size="small"
                >
                  Export MD
                </Button>
                <Button
                  startIcon={<Download />}
                  onClick={handleExportCsv}
                  variant="outlined"
                  size="small"
                >
                  Export CSV
                </Button>
                <Button
                  startIcon={<Save />}
                  onClick={handleSaveReport}
                  variant="outlined"
                  size="small"
                >
                  Save Report
                </Button>
                <Button
                  startIcon={<Refresh />}
                  onClick={onNewAnalysis}
                  variant="contained"
                  size="small"
                >
                  New Analysis
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Coverage stats */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Coverage Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Chip 
                label={`${coverage.days} days`} 
                variant="outlined" 
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Chip 
                label={`${coverage.totalItemsUsed} items`} 
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Chip 
                label={`${coverage.subredditsUsed} subreddits`} 
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Chip 
                label={`${coverage.totalThreads} threads`} 
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Report content */}
      <Card sx={{ boxShadow: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          {report.raw ? (
            <StyledMarkdown>
              <ReactMarkdown>{report.raw}</ReactMarkdown>
            </StyledMarkdown>
          ) : (
            <StyledMarkdown>
              {report.header && (
                <>
                  <ReactMarkdown>{report.header}</ReactMarkdown>
                  <Divider sx={{ my: 3 }} />
                </>
              )}

              {report.launches && (
                <Box>
                <ReactMarkdown>{report.launches}</ReactMarkdown>
                <Divider sx={{ my: 2 }} />
              </Box>
            )}

            {report.loving && (
              <Box>
                <ReactMarkdown>{report.loving}</ReactMarkdown>
                <Divider sx={{ my: 2 }} />
              </Box>
            )}

            {report.notLoving && (
              <Box>
                <ReactMarkdown>{report.notLoving}</ReactMarkdown>
                <Divider sx={{ my: 2 }} />
              </Box>
            )}

            {report.strategicRead && (
              <Box>
                <ReactMarkdown>{report.strategicRead}</ReactMarkdown>
                <Divider sx={{ my: 2 }} />
              </Box>
            )}

                {report.takeaways && (
                  <Box>
                    <ReactMarkdown>{report.takeaways}</ReactMarkdown>
                  </Box>
                )}
            </StyledMarkdown>
          )}

          {report.appendixCsv && (
            <Box sx={{ mt: 4 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Detailed evidence data is available in CSV format. 
                  Click &quot;Export CSV&quot; above to download the appendix data.
                </Typography>
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.type}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
