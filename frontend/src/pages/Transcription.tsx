import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Alert,
  Container,
  ButtonProps,
  IconButton,
  Tooltip,
  Fade,
  LinearProgress,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Divider,
  AppBar,
  Toolbar,
  Drawer,
  ListItemButton,
  ListItemIcon,
  useMediaQuery,
  Slide,
  useScrollTrigger,
} from '@mui/material';
import { styled, keyframes, alpha } from '@mui/material/styles';
import { transcribeAudio } from '../services/api';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LanguageIcon from '@mui/icons-material/Language';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import './Transcription.css';

// Keyframe animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'visible',
  position: 'relative',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
    zIndex: 0,
  },
}));

const StyledButton = styled(Button)<ButtonProps>(() => ({
  background: 'linear-gradient(135deg, #4e7bef 0%, #2756d1 100%)',
  borderRadius: '12px',
  padding: '12px 32px',
  fontSize: '1.1rem',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(41, 86, 209, 0.2)',
  '&:hover': {
    background: 'linear-gradient(135deg, #2756d1 0%, #1a3c99 100%)',
    boxShadow: '0 8px 16px rgba(41, 86, 209, 0.3)',
    transform: 'translateY(-2px)',
  },
  '&.Mui-disabled': {
    background: 'linear-gradient(135deg, #9eb6ef 0%, #8298d1 100%)',
    color: 'rgba(255, 255, 255, 0.8)',
  },
}));

const FloatingIcon = styled(Box)(({ theme }) => ({
  animation: `${float} 3s ease-in-out infinite`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '64px',
  height: '64px',
  borderRadius: '20px',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
  color: '#ffffff',
  margin: '0 auto 24px auto',
  position: 'relative',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 15px 30px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    background: 'inherit',
    borderRadius: '22px',
    zIndex: -1,
    opacity: 0.5,
    filter: 'blur(8px)',
  },
}));

const GradientText = styled('span')(({ theme }) => ({
  background: 'linear-gradient(135deg, #4e7bef 0%, #2756d1 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  color: 'transparent',
  display: 'inline-block',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'inherit',
    filter: 'blur(30px)',
    opacity: 0.3,
    zIndex: -1,
  },
}));

const StyledUploadZone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
  borderRadius: theme.spacing(3),
  padding: theme.spacing(6),
  textAlign: 'center',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  background: alpha(theme.palette.background.paper, 0.6),
  backdropFilter: 'blur(10px)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    background: alpha(theme.palette.primary.main, 0.02),
    transform: 'translateY(-2px)',
  },
  '&.drag-active': {
    borderColor: theme.palette.primary.main,
    background: alpha(theme.palette.primary.main, 0.05),
    transform: 'scale(1.02)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0)} 100%)`,
    zIndex: -1,
  },
}));

const StyledLanguageSelect = styled(Select)(({ theme }) => ({
  borderRadius: 20,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(8px)',
  minWidth: 180,
  '& .MuiSelect-select': {
    paddingLeft: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: alpha(theme.palette.divider, 0.2),
    borderRadius: 20,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: alpha(theme.palette.primary.main, 0.5),
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
}));

const StyledToggleButton = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  borderRadius: 20,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(8px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: 'blur(10px)',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: 'none',
}));

const LogoText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

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

const HeaderContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(2, 0),
  marginBottom: theme.spacing(4),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    background: alpha(theme.palette.background.paper, 0.7),
    backdropFilter: 'blur(10px)',
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    zIndex: -1,
  },
}));

const Controls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

const DarkModeSwitch = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '6px',
  borderRadius: 20,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(8px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
  },
}));

interface NavbarProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  selectedLanguage: string;
  setSelectedLanguage: (value: string) => void;
}

const Navbar = ({ isDarkMode, setIsDarkMode, selectedLanguage, setSelectedLanguage }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  const trigger = useScrollTrigger();

  const navItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'History', icon: <HistoryIcon />, path: '/history' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help', icon: <HelpIcon />, path: '/help' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.text}
            sx={{
              mx: 2,
              borderRadius: 2,
              mb: 1,
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <Slide appear={false} direction="down" in={!trigger}>
        <StyledAppBar position="fixed">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 1 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FloatingLogo>
                  <GraphicEqIcon sx={{ fontSize: 24 }} />
                </FloatingLogo>
                <LogoText variant="h6">
                  Sunobot Transcription
                </LogoText>
              </Box>

              {!isMobile && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {navItems.map((item) => (
                    <Button
                      key={item.text}
                      startIcon={item.icon}
                      sx={{
                        color: 'text.primary',
                        borderRadius: 2,
                        px: 2,
                        '&:hover': {
                          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      {item.text}
                    </Button>
                  ))}
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Select transcription language" arrow>
                <FormControl size="small" sx={{ minWidth: { xs: 120, md: 180 } }}>
                  <StyledLanguageSelect
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as string)}
                    startAdornment={
                      <LanguageIcon 
                        sx={{ 
                          color: 'primary.main',
                          opacity: 0.8,
                        }} 
                      />
                    }
                  >
                    <MenuItem value="auto" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="span" sx={{ 
                        width: 24, 
                        height: 24, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: '50%',
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      }}>
                        <AutoFixHighIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      </Box>
                      Auto Detect
                    </MenuItem>
                    <Divider sx={{ my: 1 }} />
                    {[
                      { code: 'en', name: 'English', flag: '🇬🇧' },
                      { code: 'es', name: 'Spanish', flag: '🇪🇸' },
                      { code: 'fr', name: 'French', flag: '🇫🇷' },
                      { code: 'de', name: 'German', flag: '🇩🇪' },
                      { code: 'it', name: 'Italian', flag: '🇮🇹' },
                      { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
                      { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
                      { code: 'pl', name: 'Polish', flag: '🇵🇱' },
                      { code: 'ru', name: 'Russian', flag: '🇷🇺' },
                      { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
                      { code: 'ko', name: 'Korean', flag: '🇰🇷' },
                      { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
                    ].map((lang) => (
                      <MenuItem 
                        key={lang.code} 
                        value={lang.code}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                        }}
                      >
                        <Box component="span" sx={{ fontSize: '1.2rem' }}>
                          {lang.flag}
                        </Box>
                        {lang.name}
                      </MenuItem>
                    ))}
                  </StyledLanguageSelect>
                </FormControl>
              </Tooltip>

              <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`} arrow>
                <StyledToggleButton 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  sx={{ 
                    cursor: 'pointer',
                    transform: isDarkMode ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <Box sx={{ 
                    position: 'relative', 
                    width: 40, 
                    height: 24, 
                    bgcolor: isDarkMode ? 'primary.main' : 'grey.300',
                    borderRadius: 12,
                    transition: 'all 0.3s ease',
                  }}>
                    <Box sx={{
                      position: 'absolute',
                      top: 2,
                      left: isDarkMode ? 18 : 2,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: 'background.paper',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {isDarkMode ? (
                        <DarkModeIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                      ) : (
                        <LightModeIcon sx={{ fontSize: 14, color: 'grey.500' }} />
                      )}
                    </Box>
                  </Box>
                </StyledToggleButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </StyledAppBar>
      </Slide>

      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
};

const UploadContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(3),
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const ResultsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(3),
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const TranscriptionSegment = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(3, 4),
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const Transcription = () => {
  const theme = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Create theme based on dark mode
  const themeProvider = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#4e7bef',
      },
    },
  });

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileValidation(droppedFile);
    }
  }, []);

  const handleFileValidation = (selectedFile: File) => {
    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    // Check file type
    const validTypes = ['.mp3', '.wav', '.m4a', '.ogg'];
    const fileExt = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
    if (!validTypes.includes(fileExt)) {
      setError('Invalid file type. Supported types: mp3, wav, m4a, ogg');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileValidation(event.target.files[0]);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const exportToTxt = () => {
    if (!result) return;
    const text = result.segments.map((segment: any) => 
      `[${Math.floor(segment.start)}s - ${Math.floor(segment.end)}s] ${segment.text}`
    ).join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcription.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    handleMenuClose();
  };

  const exportToJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcription.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    handleMenuClose();
  };

  const handleSubmit = async () => {
    if (!file) return;
    setError(null);
    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', selectedLanguage);

      const data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:8000/api/transcribe/');
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(progress);
          }
        });

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.response);
            setDetectedLanguage(response.detected_language);
            resolve(response);
          } else {
            reject(new Error('Failed to transcribe audio'));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error occurred'));
        };

        xhr.send(formData);
      });

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleCopyText = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <ThemeProvider theme={themeProvider}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #f5f7ff 0%, #e4e9ff 100%)',
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 4, md: 6 },
        pb: { xs: 6, md: 8 },
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
            animation: `${fadeIn} 1s ease-out` 
          }}>
            <FloatingIcon>
              <GraphicEqIcon sx={{ fontSize: 32 }} />
            </FloatingIcon>
            <Typography 
              variant="h2" 
              component="h1"
              gutterBottom
              sx={{ 
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.75rem' },
                letterSpacing: '-0.02em',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <GradientText>Audio Transcription</GradientText>
            </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary"
              sx={{ 
                mb: 6,
                maxWidth: '800px',
                mx: 'auto',
                lineHeight: 1.6,
                fontWeight: 400,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
              }}
            >
              Transform your audio into text with advanced AI-powered transcription
            </Typography>
          </Box>

          <StyledPaper elevation={0}>
            <StyledUploadZone
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={dragActive ? 'drag-active' : ''}
            >
              <input
                accept="audio/mp3,audio/wav,audio/m4a,audio/ogg"
                className="file-input"
                id="audio-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="audio-upload">
                <Box sx={{ position: 'relative' }}>
                  <FloatingIcon>
                    <CloudUploadIcon sx={{ fontSize: 40 }} />
                  </FloatingIcon>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    {dragActive ? 'Drop your file here' : 'Drop your audio file here'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    or click to browse (MP3, WAV, M4A, OGG)
                  </Typography>
                  {file && (
                    <Fade in timeout={500}>
                      <Box sx={{ mt: 3 }}>
                        <Typography 
                          sx={{ 
                            color: 'text.primary',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                          }}
                        >
                          <GraphicEqIcon sx={{ color: theme.palette.primary.main }} />
                          {file.name}
                        </Typography>
                      </Box>
                    </Fade>
                  )}
                </Box>
              </label>
            </StyledUploadZone>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <StyledButton
                onClick={handleSubmit}
                disabled={!file || loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Transcribing...' : 'Start Transcription'}
              </StyledButton>
            </Box>
          </StyledPaper>

          {error && (
            <Fade in timeout={500}>
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 3,
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {loading && (
            <Box sx={{ width: '100%', mt: 4 }}>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  },
                }}
              />
              <Typography 
                variant="body2" 
                color="text.secondary" 
                align="center" 
                sx={{ mt: 1 }}
              >
                {uploadProgress === 100 ? 'Processing...' : `Uploading: ${Math.round(uploadProgress)}%`}
              </Typography>
            </Box>
          )}

          {result && (
            <Fade in timeout={500}>
              <StyledPaper elevation={0} sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 1 }}>
                      Transcription Results
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {Math.floor(result.duration)}s
                    </Typography>
                  </Box>
                  <Box>
                    <Tooltip title="Export options" arrow>
                      <IconButton onClick={handleMenuClick}>
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      PaperProps={{
                        elevation: 0,
                        sx: {
                          borderRadius: 2,
                          mt: 1.5,
                          backgroundColor: alpha(theme.palette.background.paper, 0.8),
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        },
                      }}
                    >
                      <MenuItem onClick={exportToTxt} sx={{ gap: 1 }}>
                        <DownloadIcon fontSize="small" /> Export as TXT
                      </MenuItem>
                      <MenuItem onClick={exportToJson} sx={{ gap: 1 }}>
                        <DownloadIcon fontSize="small" /> Export as JSON
                      </MenuItem>
                    </Menu>
                  </Box>
                </Box>

                <List sx={{ p: 0 }}>
                  {result.segments.map((segment: any, index: number) => (
                    <Fade 
                      key={index} 
                      in 
                      timeout={500} 
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      <TranscriptionSegment>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: theme.palette.primary.main,
                                fontFamily: 'monospace',
                                fontWeight: 600,
                              }}
                            >
                              {`${Math.floor(segment.start)}s - ${Math.floor(segment.end)}s`}
                            </Typography>
                            {segment.confidence && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={segment.confidence * 100}
                                  sx={{
                                    width: 60,
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    '& .MuiLinearProgress-bar': {
                                      borderRadius: 2,
                                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                    }
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {`${Math.round(segment.confidence * 100)}%`}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          <Typography color="text.primary" sx={{ lineHeight: 1.6 }}>
                            {segment.text}
                          </Typography>
                        </Box>
                        <Tooltip title={copiedIndex === index ? "Copied!" : "Copy text"} arrow>
                          <IconButton 
                            onClick={() => handleCopyText(segment.text, index)}
                            size="small"
                            sx={{ 
                              ml: 2,
                              color: copiedIndex === index ? 'success.main' : 'action.active',
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                          >
                            {copiedIndex === index ? <CheckIcon /> : <ContentCopyIcon />}
                          </IconButton>
                        </Tooltip>
                      </TranscriptionSegment>
                    </Fade>
                  ))}
                </List>
              </StyledPaper>
            </Fade>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Transcription; 