import os
import json
from pyannote.audio import Pipeline
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import whisper
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class TranscriptionService:
    def __init__(self):
        try:
            self.pipeline = Pipeline.from_pretrained(
                "pyannote/speaker-diarization-3.0",
                use_auth_token=os.getenv('HF_TOKEN')
            )
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            self.pipeline = self.pipeline.to(self.device)
            # Initialize Whisper model (using 'base' for good balance of accuracy and speed)
            self.whisper_model = whisper.load_model('base', device=self.device)
            logger.info("TranscriptionService initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing TranscriptionService: {str(e)}")
            raise

    def transcribe_audio(self, audio_path):
        try:
            logger.info(f"Starting transcription for file: {audio_path}")
            
            # Perform diarization
            diarization = self.pipeline(audio_path)
            logger.info("Diarization completed successfully")
            
            # Transcribe using local Whisper model
            result = self.whisper_model.transcribe(audio_path)
            logger.info("Whisper transcription completed successfully")
            
            # Extract segments with timestamps
            whisper_segments = result["segments"]
            
            # Combine diarization with transcription
            segments = []
            for turn, _, speaker in diarization.itertracks(yield_label=True):
                # Find matching transcription segments
                segment_text = ""
                for seg in whisper_segments:
                    seg_start = float(seg['start'])
                    seg_end = float(seg['end'])
                    if (seg_start <= turn.end and seg_end >= turn.start):
                        segment_text += " " + seg['text']
                
                if segment_text.strip():  # Only add segments that have text
                    segments.append({
                        "speaker": f"Speaker {speaker}",
                        "text": segment_text.strip(),
                        "start_time": turn.start,
                        "end_time": turn.end
                    })

            logger.info(f"Transcription completed with {len(segments)} segments")
            return {"transcription": segments}
        except Exception as e:
            logger.error(f"Error in transcribe_audio: {str(e)}")
            return {"error": str(e)}

class TitleSuggestionService:
    def __init__(self):
        self.generator = pipeline(
            "text-generation",
            model="facebook/opt-350m",
            device="cuda" if torch.cuda.is_available() else "cpu"
        )

    def generate_titles(self, content):
        try:
            prompt = f"""Generate 3 engaging and SEO-friendly titles for this blog post:

{content}

Titles:"""
            
            # Generate titles
            response = self.generator(
                prompt,
                max_length=150,
                num_return_sequences=3,
                temperature=0.7,
                do_sample=True,
                top_k=50,
                top_p=0.95,
                no_repeat_ngram_size=2
            )

            # Extract and clean titles
            titles = []
            for output in response:
                # Extract everything after "Titles:" and split by newlines
                generated_text = output['generated_text'].split("Titles:")[-1].strip()
                # Split by newlines and numbers to get individual titles
                title_candidates = [t.strip().lstrip('123456789-. ') for t in generated_text.split('\n')]
                # Add non-empty titles
                titles.extend([t for t in title_candidates if t and len(t) > 10])

            # Ensure we have exactly 3 titles
            titles = titles[:3]
            while len(titles) < 3:
                titles.append("AI Transformation in Modern Business")

            return {"suggestions": titles}
            
        except Exception as e:
            return {"error": str(e)} 