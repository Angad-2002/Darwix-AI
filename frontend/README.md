# Sunobot Interface Frontend

This is the frontend application for the Sunobot Interface project, built with React, TypeScript, and Vite.

## Features

- Audio transcription with speaker diarization
- Title generation for content
- Modern UI with Material-UI components
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Building for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## API Configuration

The frontend expects the Django backend to be running at `http://localhost:8000`. If your backend is running at a different URL, update the `API_BASE_URL` in `src/services/api.ts`.

## Project Structure

- `src/` - Source code
  - `components/` - Reusable React components
  - `pages/` - Page components
  - `services/` - API service functions
  - `App.tsx` - Main application component
  - `main.tsx` - Application entry point

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
