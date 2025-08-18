'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Divider,
} from '@mui/material';
import {
  Close,
  Input,
  Search,
  Analytics,
  Assignment,
  PlayArrow,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface HowItWorksDialogProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    label: 'Enter names',
    icon: <Input />,
    description: 'Add your product + up to 3 competitors (use exact names).',
    details: 'Use exact product names for the best match quality.',
  },
  {
    label: 'Mine Reddit',
    icon: <Search />,
    description: 'We scan top AI/ML/product subreddits for posts & comments.',
    details: 'We search 52+ communities including r/MachineLearning, r/startups, r/programming.',
  },
  {
    label: 'Analyze',
    icon: <Analytics />,
    description: 'GPT-5 clusters insights into launches, loves, and dislikes.',
    details: 'AI classifies discussions into aspects like performance, pricing, features, and sentiment.',
  },
  {
    label: 'Get your report',
    icon: <Assignment />,
    description: 'Evidence-linked insights with quotes + Reddit permalinks, ready to copy or download.',
    details: 'Every insight includes clickable sources and actionable founder recommendations.',
  },
];

export default function HowItWorksDialog({ open, onClose }: HowItWorksDialogProps) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'visible',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <PlayArrow sx={{ color: 'primary.main' }} />
          </motion.div>
          <Typography variant="h5" fontWeight={600}>
            How it works
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          size="small"
          aria-label="Close dialog"
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ px: 3, py: 2 }}>
        <Typography variant="body2" color="text.secondary" paragraph>
          Get competitive intelligence from Reddit in 4 quick steps.
        </Typography>
        
        <Stepper orientation="vertical" activeStep={activeStep}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                icon={
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: index <= activeStep ? 'primary.main' : 'action.disabled',
                      color: index <= activeStep ? 'primary.contrastText' : 'text.disabled',
                      transition: 'all 0.3s',
                    }}
                  >
                    {step.icon}
                  </Box>
                }
                sx={{
                  '& .MuiStepLabel-labelContainer': {
                    ml: 2,
                  },
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  {step.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent sx={{ ml: 7, pb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {step.details}
                </Typography>
                
                {index === 1 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Sample subreddits:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {['MachineLearning', 'startups', 'programming', 'vscode', 'SaaS'].map((sub) => (
                        <Chip 
                          key={sub}
                          label={`r/${sub}`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontSize: 10,
                            fontFamily: 'ui-monospace, monospace',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {index === 3 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Report includes:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {['Launches', 'User Sentiment', 'Pain Points', 'Strategic Insights', 'Action Items'].map((item) => (
                        <Chip 
                          key={item}
                          label={item}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: 10 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            <strong>Data source:</strong> Reddit only (authentic user feedback)
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            <strong>AI model:</strong> GPT-5 for analysis + reporting
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <strong>Privacy:</strong> Reports are stored locally in your browser
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="text">
          Close
        </Button>
        <Button 
          onClick={() => {
            if (activeStep < steps.length - 1) {
              setActiveStep(activeStep + 1);
            } else {
              setActiveStep(0);
            }
          }}
          variant="contained"
          startIcon={activeStep < steps.length - 1 ? undefined : <PlayArrow />}
        >
          {activeStep < steps.length - 1 ? 'Next Step' : 'Start Over'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
