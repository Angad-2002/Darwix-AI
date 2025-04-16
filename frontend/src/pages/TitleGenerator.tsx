import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Container,
  Alert,
  CircularProgress,
  ButtonProps,
  Paper,
  Chip,
  Fade,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { generateTitles } from '../services/api';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

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

const shine = keyframes`
  0% { background-position: -100px; }
  100% { background-position: 200px; }
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

const StyledButton = styled('button')<ButtonProps>(() => ({
  background: 'linear-gradient(135deg, #4e7bef 0%, #2756d1 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: '12px',
  padding: '16px 32px',
  fontSize: '1.1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  boxShadow: '0 4px 12px rgba(41, 86, 209, 0.2)',
  '&:hover': {
    background: 'linear-gradient(135deg, #2756d1 0%, #1a3c99 100%)',
    boxShadow: '0 8px 16px rgba(41, 86, 209, 0.3)',
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #9eb6ef 0%, #8298d1 100%)',
    cursor: 'not-allowed',
    transform: 'none',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
  },
}));

const TitleChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f5f7ff 100%)',
  border: '1px solid rgba(78, 123, 239, 0.3)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  borderRadius: '8px',
  padding: '20px 4px',
  fontSize: '1rem',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  animation: `${fadeIn} 0.5s ease-out forwards`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(78, 123, 239, 0.5)',
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
  background: 'linear-gradient(135deg, #4e7bef 0%, #2756d1 100%)',
  boxShadow: '0 10px 20px rgba(41, 86, 209, 0.2)',
  color: '#ffffff',
  margin: '0 auto 24px auto',
  position: 'relative',
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

const TitleGenerator = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titles, setTitles] = useState<string[]>([]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Please enter some content to generate titles');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await generateTitles(content);
      if (response.error) {
        setError(response.error);
      } else {
        setTitles(response.suggestions);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate titles. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7ff 0%, #e4e9ff 100%)',
      pt: 4,
      pb: 8,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6, animation: `${fadeIn} 1s ease-out` }}>
          <FloatingIcon>
            <LightbulbIcon sx={{ fontSize: 32 }} />
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
            <GradientText>Title Generator</GradientText>
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
            Generate engaging and creative titles for your content using advanced AI
          </Typography>
        </Box>

        <StyledPaper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
          <Box sx={{ mb: 4 }}>
            <StyledTextField
              fullWidth
              multiline
              rows={6}
              placeholder="Enter your content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              variant="outlined"
              disabled={loading}
            />
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <StyledButton
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} color="inherit" />
                  Generating...
                </>
              ) : (
                <>
                  <AutoAwesomeIcon />
                  Generate Titles
                </>
              )}
            </StyledButton>
          </Box>
        </StyledPaper>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              borderRadius: 3,
              '& .MuiAlert-message': {
                fontSize: '1rem'
              }
            }}
          >
            {error}
          </Alert>
        )}

        {titles.length > 0 && (
          <StyledPaper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                color: 'primary.main',
                mb: 3,
                textAlign: 'center'
              }}
            >
              Generated Titles
            </Typography>
            
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}>
              {titles.map((title, index) => (
                <Fade key={index} in={true} timeout={500} style={{ transitionDelay: `${index * 200}ms` }}>
                  <div>
                    <TitleChip
                      label={title}
                      clickable
                      onClick={() => navigator.clipboard.writeText(title)}
                      sx={{ width: '100%', height: 'auto', justifyContent: 'flex-start' }}
                    />
                  </div>
                </Fade>
              ))}
            </Box>
          </StyledPaper>
        )}
      </Container>
    </Box>
  );
};

export default TitleGenerator; 