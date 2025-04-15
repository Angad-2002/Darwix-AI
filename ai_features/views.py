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

from .services import TranscriptionService, TitleSuggestionService
from .models import BlogPost, Transcription

logger = logging.getLogger(__name__)

# Create your views here.

@csrf_exempt
@require_http_methods(["POST"])
def transcribe_audio(request):
    try:
        if 'audio_file' not in request.FILES:
            return JsonResponse({'error': 'No audio file provided'}, status=400)

        audio_file = request.FILES['audio_file']
        
        # Save the file temporarily
        file_path = default_storage.save(
            f'audio_files/{audio_file.name}',
            ContentFile(audio_file.read())
        )
        
        # Get the full path
        full_path = default_storage.path(file_path)
        
        # Initialize service and process
        service = TranscriptionService()
        result = service.transcribe_audio(full_path)
        
        # Clean up the temporary file
        default_storage.delete(file_path)
        
        # Save transcription to database
        Transcription.objects.create(
            audio_file=file_path,
            transcription_text=json.dumps(result)
        )
        
        return JsonResponse(result)
    
    except Exception as e:
        logger.error(f"Error in transcribe_audio: {str(e)}\n{traceback.format_exc()}")
        return JsonResponse({'error': str(e)}, status=500)

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
