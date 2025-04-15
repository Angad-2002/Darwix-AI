# Darwix-AI Project

A Django-based AI service that provides two main features:
1. Audio transcription with speaker diarization
2. AI-powered title suggestions for blog posts

## Features

- **Audio Transcription**: Uses Whisper for transcription and pyannote.audio for speaker diarization
- **Title Generation**: Uses facebook/opt-350m model to generate engaging titles for content
- **RESTful API**: Easy to integrate with any frontend application
- **Local Models**: All AI processing is done locally, no external API costs

## Setup

1. Clone the repository:
```bash
git clone https://github.com/Angad-2002/Darwix-AI.git
cd Darwix-AI
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the root directory with:
```
OPENAI_API_KEY=your_openai_api_key
HF_TOKEN=your_huggingface_token
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Start the development server:
```bash
python manage.py runserver
```

## API Endpoints

### 1. Title Suggestions
```bash
POST /api/suggest-titles/
Content-Type: application/json

{
    "content": "Your blog post content here..."
}
```

### 2. Audio Transcription
```bash
POST /api/transcribe/
Content-Type: multipart/form-data

audio_file: [your_audio_file]
```

## License

MIT License - see the [LICENSE](LICENSE) file for details. 
