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
                  component="img"
                  src="/logo.svg"
                  alt="UserPulse.AI"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1,
                  }}
                />
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
