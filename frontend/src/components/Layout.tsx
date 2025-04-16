import { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, IconButton, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { styled } from '@mui/material/styles';

interface LayoutProps {
  children: ReactNode;
  isDarkMode: boolean;
  setIsDarkMode: (isDarkMode: boolean) => void;
}

const FloatingLogo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '42px',
  height: '42px',
  borderRadius: '12px',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  color: '#ffffff',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
  },
}));

const Layout = ({ children, isDarkMode, setIsDarkMode }: LayoutProps) => {
  return (
    <>
      <AppBar position="static" sx={{ 
        background: '#1976d2',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FloatingLogo>
              <GraphicEqIcon sx={{ fontSize: 24 }} />
            </FloatingLogo>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              color: 'white',
              letterSpacing: '-0.02em',
            }}>
              Sunobot Interface
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button color="inherit" component={RouterLink} to="/">
              Home
            </Button>
            <Button color="inherit" component={RouterLink} to="/transcribe">
              Transcribe
            </Button>
            <Button color="inherit" component={RouterLink} to="/generate-titles">
              Generate Titles
            </Button>

            <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`} arrow>
              <IconButton 
                onClick={() => setIsDarkMode(!isDarkMode)}
                color="inherit"
                sx={{ ml: 2 }}
              >
                {isDarkMode ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {children}
      </Container>
    </>
  );
};

export default Layout;