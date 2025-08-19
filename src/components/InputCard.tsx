'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  ExpandMore,
  Add,
  Remove,
  PlayArrow,
  Clear,
  AutoAwesome,
} from '@mui/icons-material';
import { ProductProfile } from '@/lib/types';
import { DEFAULT_SUBREDDITS } from '@/lib/subreddits';

interface InputCardProps {
  onSubmit: (me: ProductProfile, competitors: ProductProfile[]) => void;
  isLoading?: boolean;
}

export default function InputCard({ onSubmit, isLoading }: InputCardProps) {
  const [me, setMe] = useState<ProductProfile>({ name: '' });
  const [competitors, setCompetitors] = useState<ProductProfile[]>([
    { name: '' },
    { name: '' },
    { name: '' },
  ]);
  const [errors, setErrors] = useState<{ me?: string; competitors?: string[] }>({});
  const [touched, setTouched] = useState<{ me: boolean; competitors: boolean[] }>({
    me: false,
    competitors: [false, false, false],
  });
  const [competitorCount, setCompetitorCount] = useState(1);
  
  const meInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus on mount
    meInputRef.current?.focus();
    
    // Keyboard shortcut for focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        meInputRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (!me.name.trim()) {
      newErrors.me = 'Your product name is required';
    }
    
    const competitorErrors: string[] = [];
    if (!competitors[0].name.trim()) {
      competitorErrors[0] = 'At least one competitor is required';
    }
    
    if (competitorErrors.length > 0) {
      newErrors.competitors = competitorErrors;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    setTouched({
      me: true,
      competitors: [true, true, true],
    });
    
    if (validate()) {
      const validCompetitors = competitors
        .slice(0, competitorCount)
        .filter(c => c.name.trim());
      onSubmit(me, validCompetitors);
    }
  };

  const handleClear = () => {
    setMe({ name: '' });
    setCompetitors([{ name: '' }, { name: '' }, { name: '' }]);
    setErrors({});
    setTouched({ me: false, competitors: [false, false, false] });
    setCompetitorCount(1);
    meInputRef.current?.focus();
  };

  const addCompetitor = () => {
    if (competitorCount < 3) {
      setCompetitorCount(competitorCount + 1);
    }
  };

  const removeCompetitor = (index: number) => {
    const updated = [...competitors];
    updated[index] = { name: '' };
    setCompetitors(updated);
    if (index === competitorCount - 1 && competitorCount > 1) {
      setCompetitorCount(competitorCount - 1);
    }
  };

  return (
    <Box
      sx={{
        opacity: 1,
        transform: 'translateY(0)',
        transition: 'all 0.3s ease-out',
      }}
    >
      <Card 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          overflow: 'visible',
          background: (theme) => 
            theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, rgba(103, 80, 164, 0.03) 0%, rgba(56, 106, 32, 0.03) 100%)'
              : 'linear-gradient(135deg, rgba(208, 188, 255, 0.03) 0%, rgba(159, 214, 126, 0.03) 100%)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome sx={{ color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={700}>
              Competitive Intelligence
            </Typography>
          </Box>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Analyze feature launches, user feedback, and sentiment from 52 AI/ML/product/startup subreddits.
            Use <strong>exact product names</strong> for the best results.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Your Product"
                placeholder="Enter your product name"
                required
                value={me.name}
                onChange={(e) => {
                  setMe({ name: e.target.value });
                  if (touched.me) validate();
                }}
                onBlur={() => {
                  setTouched(prev => ({ ...prev, me: true }));
                  validate();
                }}
                error={touched.me && !!errors.me}
                helperText={
                  touched.me && errors.me ? errors.me : 
                  'Exact name (e.g., "Cursor", "GitHub Copilot")'
                }
                inputRef={meInputRef}
                InputProps={{
                  'aria-label': 'Your product name',
                  'aria-required': true,
                  'aria-describedby': 'your-product-helper',
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    transition: 'all 0.2s',
                    '&.Mui-focused': {
                      transform: 'translateY(-1px)',
                      boxShadow: (theme) => `0 4px 12px ${theme.palette.primary.main}20`,
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid size={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Competitors
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (up to 3)
                </Typography>
              </Box>
              
                                <Box>
                    {[0, 1, 2].slice(0, competitorCount).map((index) => (
                      <Box key={index}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        fullWidth
                        label={`Competitor ${index + 1}${index === 0 ? ' (required)' : ''}`}
                        required={index === 0}
                        value={competitors[index].name}
                        onChange={(e) => {
                          const updated = [...competitors];
                          updated[index] = { name: e.target.value };
                          setCompetitors(updated);
                          if (touched.competitors[index]) validate();
                        }}
                        onBlur={() => {
                          const newTouched = [...touched.competitors];
                          newTouched[index] = true;
                          setTouched(prev => ({ ...prev, competitors: newTouched }));
                          validate();
                        }}
                        error={touched.competitors[index] && !!errors.competitors?.[index]}
                        helperText={
                          touched.competitors[index] && errors.competitors?.[index] ? 
                          errors.competitors[index] : 
                          'Exact names for best match'
                        }
                        InputProps={{
                          'aria-label': `Competitor ${index + 1} name`,
                          'aria-required': index === 0,
                        }}
                      />
                      {index > 0 && (
                        <Tooltip title="Remove competitor">
                          <IconButton
                            onClick={() => removeCompetitor(index)}
                            size="small"
                            sx={{ mt: 1 }}
                            aria-label={`Remove competitor ${index + 1}`}
                          >
                            <Remove />
                          </IconButton>
                        </Tooltip>
                                              )}
                      </Box>
                      </Box>
                    ))}
                  </Box>
              
              <Collapse in={competitorCount < 3}>
                <Button
                  startIcon={<Add />}
                  onClick={addCompetitor}
                  size="small"
                  sx={{ mb: 2 }}
                >
                  Add competitor
                </Button>
              </Collapse>
            </Grid>
          </Grid>
          
          <Accordion 
            sx={{ 
              mt: 3,
              backgroundColor: 'background.paper',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMore />}
              aria-controls="subreddits-content"
              id="subreddits-header"
            >
              <Typography variant="subtitle1" fontWeight={500}>
                Communities scanned
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                ({DEFAULT_SUBREDDITS.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1}>
                {DEFAULT_SUBREDDITS.map((subreddit) => (
                  <Grid size="auto" key={subreddit}>
                    <Chip 
                      label={`r/${subreddit}`}
                      variant="outlined"
                      size="small"
                      sx={{ 
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: 11,
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
          
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              type="submit"
              disabled={isLoading}
              startIcon={<PlayArrow />}
              sx={{
                px: 4,
                fontWeight: 600,
                boxShadow: (theme) => `0 4px 12px ${theme.palette.primary.main}40`,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => `0 8px 20px ${theme.palette.primary.main}50`,
                },
              }}
            >
              Run Analysis
            </Button>
            
            <Button
              variant="text"
              size="large"
              onClick={handleClear}
              disabled={isLoading}
              startIcon={<Clear />}
            >
              Clear
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
