# Darwix-AI

A Django-based AI service that provides two main features:
1. Audio transcription with speaker diarization
2. AI-powered title suggestions for blog posts

## Features

* **Audio Transcription**: Uses Whisper for transcription and pyannote.audio for speaker diarization
* **Title Generation**: Uses facebook/opt-350m model to generate engaging titles for content
* **RESTful API**: Easy to integrate with any frontend application
* **Local Models**: All AI processing is done locally, no external API costs

## Screenshots

### Audio Transcription Example
![Transcription Example](docs/images/transcription-example.png)
*Example of audio transcription with speaker diarization and timestamps*

### Title Suggestions Example
![Title Suggestions](docs/images/title-suggestions.png)
*Example of AI-generated title suggestions for a blog post*

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

## API Usage Examples

### 1. Audio Transcription

Transcribe an audio file with speaker diarization:

```bash
# Using curl
curl -X POST -F "audio_file=@path/to/your/audio.mp3" http://localhost:8000/api/transcribe/

# Using PowerShell
$filePath = "C:\path\to\your\audio.mp3"
$uri = "http://localhost:8000/api/transcribe/"

$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"audio_file`"; filename=`"audio.mp3`"",
    "Content-Type: audio/mpeg",
    "",
    [System.Text.Encoding]::UTF8.GetString($fileBytes),
    "--$boundary--"
) -join $LF

Invoke-RestMethod -Uri $uri -Method Post -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyLines
```

Example Response:
```json
{
    "segments": [
        {
            "speaker": "Speaker 0",
            "text": "This is the transcribed text from the first speaker.",
            "start": 0.0,
            "end": 5.2,
            "time": "00:00.000 → 00:05.200"
        },
        {
            "speaker": "Speaker 1",
            "text": "This is the response from the second speaker.",
            "start": 5.5,
            "end": 8.7,
            "time": "00:05.500 → 00:08.700"
        }
    ],
    "duration": "00:08.700",
    "duration_seconds": 8.7
}
```

### 2. Title Suggestions

Get AI-generated title suggestions for your content:

```bash
# Using curl
curl -X POST -H "Content-Type: application/json" -d "{\"content\":\"Your blog post content here...\"}" http://localhost:8000/api/suggest-titles/

# Using PowerShell
$body = @{
    content = "Your blog post content here..."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/suggest-titles/" -Method Post -Body $body -ContentType "application/json"
```

Example Response:
```json
{
    "suggestions": [
        "The Future of AI in Content Creation",
        "How Artificial Intelligence is Transforming Writing",
        "AI-Powered Content Generation: A New Era"
    ]
}
```

## Supported Audio Formats

- MP3 (.mp3)
- WAV (.wav)
- M4A (.m4a)
- OGG (.ogg)

Maximum file size: 10MB

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 400: Bad Request (invalid input)
- 500: Internal Server Error

Example error response:
```json
{
    "error": "Error message describing what went wrong"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Sunobot Interface

A modern web application for AI-powered audio transcription and title generation.

## Project Structure

```
sunobot-interface/
├── frontend/          # React + Vite frontend
└── backend/           # Django backend API
```

## Deployment Guide

### Backend Deployment (Django)

1. **Prerequisites**
   - Python 3.8+
   - PostgreSQL
   - Redis (optional, for caching)

2. **Environment Setup**
   ```bash
   # Create and activate virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   cd backend
   pip install -r requirements.txt
   ```

3. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```
   DEBUG=False
   SECRET_KEY=your-secret-key
   ALLOWED_HOSTS=your-domain.com,www.your-domain.com
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```

4. **Database Setup**
   ```bash
   python manage.py migrate
   python manage.py collectstatic
   ```

5. **Production Server**
   ```bash
   # Install Gunicorn
   pip install gunicorn

   # Start Gunicorn
   gunicorn backend.wsgi:application --bind 0.0.0.0:8000
   ```

6. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location /static/ {
           alias /path/to/your/static/files/;
       }

       location /media/ {
           alias /path/to/your/media/files/;
       }
   }
   ```

### Frontend Deployment (React + Vite)

1. **Prerequisites**
   - Node.js 16+
   - npm or yarn

2. **Environment Setup**
   Create a `.env` file in the frontend directory:
   ```
   VITE_API_URL=https://your-backend-domain.com
   ```

3. **Build for Production**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

4. **Deploy Static Files**
   The built files will be in the `dist` directory. You can serve these files using Nginx:

   ```nginx
   server {
       listen 80;
       server_name your-frontend-domain.com;
       root /path/to/frontend/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### Deployment Options

1. **Traditional VPS/Dedicated Server**
   - Set up a Linux server (Ubuntu/Debian recommended)
   - Install required software (Nginx, PostgreSQL, Python, Node.js)
   - Follow the backend and frontend deployment steps above
   - Use systemd to manage the Gunicorn process

2. **Docker Deployment**
   - Use the provided Dockerfile and docker-compose.yml
   - Build and run containers:
     ```bash
     docker-compose up -d
     ```

3. **Cloud Platforms**
   - **Heroku**:
     - Add Procfile for backend
     - Configure environment variables
     - Deploy using Heroku Git or GitHub integration

   - **Vercel/Netlify** (Frontend):
     - Connect your GitHub repository
     - Set build command: `npm run build`
     - Set output directory: `dist`

   - **AWS**:
     - Use Elastic Beanstalk for backend
     - Use S3 + CloudFront for frontend
     - Set up RDS for database

## Security Considerations

1. **SSL/TLS**
   - Install SSL certificates (Let's Encrypt recommended)
   - Force HTTPS redirects
   - Set secure headers

2. **API Security**
   - Use environment variables for sensitive data
   - Implement rate limiting
   - Set up CORS properly
   - Use secure session cookies

3. **Database**
   - Regular backups
   - Use connection pooling
   - Set up proper user permissions

## Monitoring

1. **Backend Monitoring**
   - Set up logging
   - Use Sentry for error tracking
   - Monitor server resources

2. **Frontend Monitoring**
   - Implement error boundary
   - Use analytics tools
   - Monitor performance metrics

## Maintenance

1. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Regular database maintenance

2. **Backup Strategy**
   - Daily database backups
   - Regular configuration backups
   - Document recovery procedures

## Support

For deployment support or issues:
1. Check the issues section in the repository
2. Contact the development team
3. Review logs for detailed error information
