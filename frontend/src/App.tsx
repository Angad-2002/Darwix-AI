import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useState } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Transcription from './pages/Transcription';
import TitleGenerator from './pages/TitleGenerator';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: isDarkMode ? '#60a5fa' : '#1976d2',
        light: isDarkMode ? '#93c5fd' : '#42a5f5',
        dark: isDarkMode ? '#3b82f6' : '#1565c0',
      },
      secondary: {
        main: isDarkMode ? '#f472b6' : '#dc004e',
      },
      background: {
        default: isDarkMode ? '#0a0a0a' : '#f5f7ff',
        paper: isDarkMode ? '#1a1a1a' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#f3f4f6' : '#000000',
        secondary: isDarkMode ? '#d1d5db' : '#666666',
      },
      divider: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      action: {
        active: isDarkMode ? '#60a5fa' : '#1976d2',
        hover: isDarkMode ? 'rgba(96, 165, 250, 0.08)' : 'rgba(25, 118, 210, 0.08)',
        selected: isDarkMode ? 'rgba(96, 165, 250, 0.16)' : 'rgba(25, 118, 210, 0.16)',
        disabled: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
        disabledBackground: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            ...(isDarkMode && {
              backgroundColor: '#1a1a1a',
              '[class*="MuiPaper-outlined"]': {
                borderColor: 'rgba(255, 255, 255, 0.12)',
              },
            }),
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? '#1a1a1a' : '#1976d2',
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            ...(isDarkMode && {
              '&.MuiButton-contained': {
                backgroundColor: '#60a5fa',
                '&:hover': {
                  backgroundColor: '#3b82f6',
                },
              },
            }),
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            ...(isDarkMode && {
              color: '#f3f4f6',
              '&:hover': {
                backgroundColor: 'rgba(96, 165, 250, 0.08)',
              },
            }),
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/transcribe" element={<Transcription />} />
            <Route path="/generate-titles" element={<TitleGenerator />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
