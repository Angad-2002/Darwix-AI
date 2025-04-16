import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Update this with your Django backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const transcribeAudio = async (audioFile: File) => {
  const formData = new FormData();
  formData.append('audio_file', audioFile);
  
  const response = await api.post('/transcribe/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const generateTitles = async (content: string) => {
  const response = await api.post('/suggest-titles/', { content });
  return response.data;
};

export default api; 