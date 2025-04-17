from django.shortcuts import render
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import json
import traceback
import logging
import tempfile
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .services import TranscriptionService, TitleSuggestionService
from .models import BlogPost, Transcription

logger = logging.getLogger(__name__)

# Create your views here.

@api_view(['POST'])
def transcribe(request):
    try:
        if 'audio_file' not in request.FILES:
            return JsonResponse(
                {'error': 'No audio file provided'},
                json_dumps_params={'indent': 4, 'ensure_ascii': False},
                status=400
            )

        audio_file = request.FILES['audio_file']
        
        # Check file size (10MB limit)
        if audio_file.size > 10 * 1024 * 1024:
            return JsonResponse(
                {'error': 'File size exceeds 10MB limit'},
                json_dumps_params={'indent': 4, 'ensure_ascii': False},
                status=400
            )

        # Check file type
        if not audio_file.name.lower().endswith(('.mp3', '.wav', '.m4a', '.ogg')):
            return JsonResponse(
                {'error': 'Invalid file type. Supported types: mp3, wav, m4a, ogg'},
                json_dumps_params={'indent': 4, 'ensure_ascii': False},
                status=400
            )

        # Save the uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.name)[1]) as temp_file:
            for chunk in audio_file.chunks():
                temp_file.write(chunk)
            temp_path = temp_file.name

        try:
            # Process the audio file
            transcription_service = TranscriptionService()
            result = transcription_service.transcribe_audio(temp_path)

            # Remove temporary file
            os.unlink(temp_path)

            if 'error' in result:
                return JsonResponse(
                    {'error': result['error']},
                    json_dumps_params={'indent': 4, 'ensure_ascii': False},
                    status=500
                )

            return JsonResponse(
                result,
                json_dumps_params={'indent': 4, 'ensure_ascii': False}
            )

        except Exception as e:
            # Clean up temp file in case of error
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            logger.error(f"Error during transcription: {str(e)}")
            return JsonResponse(
                {'error': f'Transcription failed: {str(e)}'},
                json_dumps_params={'indent': 4, 'ensure_ascii': False},
                status=500
            )

    except Exception as e:
        logger.error(f"Error in transcribe view: {str(e)}")
        return JsonResponse(
            {'error': f'Server error: {str(e)}'},
            json_dumps_params={'indent': 4, 'ensure_ascii': False},
            status=500
        )

@csrf_exempt
@require_http_methods(["POST"])
def suggest_titles(request):
    try:
        # Log the raw request body for debugging
        logger.debug(f"Request body: {request.body}")
        
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError as e:
            return JsonResponse({'error': f'Invalid JSON: {str(e)}'}, status=400)
        
        content = data.get('content')
        if not content:
            return JsonResponse({'error': 'No content provided'}, status=400)
        
        # Initialize service and generate titles
        service = TitleSuggestionService()
        result = service.generate_titles(content)
        
        # Check if there was an error in title generation
        if 'error' in result:
            logger.error(f"Error in title generation: {result['error']}")
            return JsonResponse(result, status=500)
        
        return JsonResponse(result)
    
    except Exception as e:
        error_msg = f"Error in suggest_titles: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_msg)
        return JsonResponse({'error': str(e), 'traceback': traceback.format_exc()}, status=500)

@api_view(['GET'])
def health_check(request):
    return Response({"status": "healthy"}, status=status.HTTP_200_OK)
