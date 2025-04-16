import { Typography, Box, Card, CardContent, Container, useTheme, keyframes } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MicIcon from '@mui/icons-material/Mic';
import TitleIcon from '@mui/icons-material/Title';
import { styled } from '@mui/material/styles';

// Keyframe animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  overflow: 'visible',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    '& .card-icon': {
      animation: `${pulse} 2s ease-in-out infinite`,
    },
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

const StyledIcon = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4e7bef 0%, #2756d1 100%)',
  borderRadius: '20px',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  marginBottom: theme.spacing(3),
  boxShadow: '0 10px 20px rgba(41, 86, 209, 0.2)',
  width: '72px',
  height: '72px',
  margin: '0 auto',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    background: 'linear-gradient(135deg, #4e7bef 0%, #2756d1 100%)',
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

const FloatingBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  overflow: 'hidden',
  zIndex: 0,
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, rgba(78, 123, 239, 0.1) 0%, rgba(78, 123, 239, 0) 70%)',
    animation: `${float} 6s ease-in-out infinite`,
  },
  '&::before': {
    top: '-300px',
    left: '-200px',
    animationDelay: '0s',
  },
  '&::after': {
    bottom: '-300px',
    right: '-200px',
    animationDelay: '-3s',
  },
}));

const Home = () => {
  const theme = useTheme();

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7ff 0%, #e4e9ff 100%)',
      position: 'relative',
      overflow: 'hidden',
      pt: { xs: 4, md: 8 },
      pb: { xs: 6, md: 12 },
    }}>
      <FloatingBackground />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ 
          textAlign: 'center',
          position: 'relative',
          mb: { xs: 6, md: 10 },
          animation: `${fadeIn} 1s ease-out`,
        }}>
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
            <Typography component="span" sx={{ color: 'text.primary', mr: 1.5 }}>Welcome to</Typography>
            <GradientText>Sunobot Interface</GradientText>
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 6,
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
              fontWeight: 400,
              color: 'text.secondary',
              fontSize: { xs: '1.1rem', md: '1.25rem' },
            }}
          >
            Transform your audio content with advanced AI-powered transcription and title generation
          </Typography>
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            gap: { xs: 3, md: 4 },
            flexDirection: { xs: 'column', md: 'row' },
            position: 'relative',
            zIndex: 1,
            animation: `${fadeIn} 1s ease-out 0.3s both`,
          }}
        >
          <Box 
            component={RouterLink} 
            to="/transcribe" 
            sx={{ 
              textDecoration: 'none',
              flex: 1,
              minWidth: 0,
              display: 'block',
            }}
          >
            <StyledCard>
              <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <StyledIcon className="card-icon">
                  <MicIcon sx={{ fontSize: 36 }} />
                </StyledIcon>
                <Typography 
                  variant="h5" 
                  component="h2" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 2,
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                  }}
                >
                  <Typography component="span" sx={{ color: 'text.primary' }}>Audio Transcription</Typography>
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    lineHeight: 1.7,
                    fontSize: { xs: '0.95rem', md: '1rem' },
                  }}
                >
                  Upload your audio files for precise transcription with advanced speaker diarization. 
                  Supports MP3, WAV, M4A, and OGG formats.
                </Typography>
              </CardContent>
            </StyledCard>
          </Box>
          
          <Box 
            component={RouterLink} 
            to="/generate-titles" 
            sx={{ 
              textDecoration: 'none',
              flex: 1,
              minWidth: 0,
              display: 'block',
            }}
          >
            <StyledCard>
              <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <StyledIcon className="card-icon">
                  <TitleIcon sx={{ fontSize: 36 }} />
                </StyledIcon>
                <Typography 
                  variant="h5" 
                  component="h2" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 2,
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                  }}
                >
                  <Typography component="span" sx={{ color: 'text.primary' }}>Title Generator</Typography>
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    lineHeight: 1.7,
                    fontSize: { xs: '0.95rem', md: '1rem' },
                  }}
                >
                  Generate engaging and creative titles for your content using advanced AI. 
                  Perfect for articles, videos, and more.
                </Typography>
              </CardContent>
            </StyledCard>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 