'use client';

import React, { useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Container,
  Divider,
  Button,
  useScrollTrigger,
  Fade,
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  History,
  GitHub,
  InfoOutlined,
} from '@mui/icons-material';
import { useTheme } from './ThemeProvider';
import { motion } from 'framer-motion';

interface AppShellProps {
  children: React.ReactNode;
  onHistoryOpen?: () => void;
  onHowItWorksOpen?: () => void;
}

// Removed unused HideOnScroll component

interface ElevationScrollProps {
  children: React.ReactElement<{ elevation?: number }>;
}

function ElevationScroll({ children }: ElevationScrollProps) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  } as any);
}

export default function AppShell({ children, onHistoryOpen, onHowItWorksOpen }: AppShellProps) {
  const { mode, toggleTheme } = useTheme();


  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        toggleTheme();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        onHistoryOpen?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme, onHistoryOpen]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ElevationScroll>
        <AppBar 
          position="sticky" 
          color="inherit"
          sx={{
            backdropFilter: 'blur(10px)',
            backgroundColor: (theme) => 
              theme.palette.mode === 'light' 
                ? 'rgba(251, 248, 253, 0.8)' 
                : 'rgba(11, 11, 12, 0.8)',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: mode === 'dark' ? '#ffffff' : '#1a1a1a',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <svg width="48" height="48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="100" cy="100" r="75" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.9"/>
                    <g transform="translate(100, 50)">
                      <circle cx="-25" cy="0" r="8" fill="currentColor" opacity="0.7"/>
                      <circle cx="0" cy="0" r="8" fill="currentColor" opacity="0.9"/>
                      <circle cx="25" cy="0" r="8" fill="currentColor" opacity="0.7"/>
                    </g>
                    <path d="M 40 100 L 60 100 L 70 85 L 80 115 L 90 75 L 100 125 L 110 75 L 120 115 L 130 85 L 140 100 L 160 100" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"/>
                    <circle cx="90" cy="75" r="3" fill="#FF6B35"/>
                    <circle cx="100" cy="125" r="4" fill="#FF6B35"/>
                    <circle cx="110" cy="75" r="3" fill="#FF6B35"/>
                    <g transform="translate(100, 150)" opacity="0.6">
                      <rect x="-30" y="0" width="8" height="15" rx="2" fill="currentColor"/>
                      <rect x="-15" y="-5" width="8" height="20" rx="2" fill="currentColor"/>
                      <rect x="0" y="-2" width="8" height="17" rx="2" fill="currentColor"/>
                      <rect x="15" y="-8" width="8" height="23" rx="2" fill="currentColor"/>
                      <rect x="30" y="0" width="8" height="15" rx="2" fill="currentColor"/>
                    </g>
                  </svg>
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    background: (theme) => 
                      `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1.2,
                  }}
                >
                  UserPulse.AI
                </Typography>
              </motion.div>
              
              <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 2 }}>
                <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center' }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 400,
                    fontStyle: 'italic',
                  }}
                >
                  Scan Reddit. Hear what users say about your competitors.
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<InfoOutlined />}
                onClick={onHowItWorksOpen}
                sx={{
                  borderRadius: 6,
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2,
                }}
              >
                How it works
              </Button>
              
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              
              
              <Tooltip title="View history (⌘/Ctrl + H)" arrow>
                <IconButton 
                  onClick={onHistoryOpen}
                  size="small"
                  aria-label="View report history"
                >
                  <History fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode (⌘/Ctrl + \\)`} arrow>
                <IconButton 
                  onClick={toggleTheme}
                  size="small"
                  aria-label="Toggle theme"
                >
                  {mode === 'light' ? <DarkMode fontSize="small" /> : <LightMode fontSize="small" />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="View on GitHub" arrow>
                <IconButton 
                  component="a"
                  href="https://github.com/mihirkul10/UserPulse.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  aria-label="View source on GitHub"
                >
                  <GitHub fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      
      <Container 
        maxWidth="lg" 
        sx={{ 
          flexGrow: 1,
          py: 3,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Fade in timeout={400}>
          <Box>{children}</Box>
        </Fade>
      </Container>
    </Box>
  );
}
