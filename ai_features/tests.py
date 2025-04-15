from django.test import TestCase, Client
from django.core.files.uploadedfile import SimpleUploadedFile
import json
import os

class APITests(TestCase):
    def setUp(self):
        self.client = Client()
        self.test_audio_content = b'dummy audio content'
        self.test_blog_content = "This is a test blog post about artificial intelligence and machine learning."

    def test_transcribe_audio_endpoint(self):
        # Create a test audio file
        audio_file = SimpleUploadedFile(
            "test_audio.mp3",
            self.test_audio_content,
            content_type="audio/mpeg"
        )
        
        # Make the request
        response = self.client.post(
            '/api/transcribe/',
            {'audio_file': audio_file},
            format='multipart'
        )
        
        # Check response
        self.assertEqual(response.status_code, 200)
        self.assertIn('transcription', response.json())

    def test_suggest_titles_endpoint(self):
        # Make the request
        response = self.client.post(
            '/api/suggest-titles/',
            {'content': self.test_blog_content},
            content_type='application/json'
        )
        
        # Check response
        self.assertEqual(response.status_code, 200)
        self.assertIn('suggestions', response.json())
        self.assertEqual(len(response.json()['suggestions']), 3)

    def test_suggest_titles_invalid_input(self):
        # Make request with invalid JSON
        response = self.client.post(
            '/api/suggest-titles/',
            'invalid json',
            content_type='application/json'
        )
        
        # Check response
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.json())
