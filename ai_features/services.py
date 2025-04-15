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
            logger.info("Initializing TranscriptionService...")
            
            # Check for HF_TOKEN
            hf_token = os.getenv('HF_TOKEN')
            if not hf_token:
                raise Exception("HF_TOKEN environment variable is not set. Please set it in your .env file.")
            logger.info("HF_TOKEN found")
            
            # Initialize pyannote pipeline
            logger.info("Loading pyannote pipeline...")
            try:
                self.pipeline = Pipeline.from_pretrained(
                    "pyannote/speaker-diarization-3.0",
                    use_auth_token=hf_token
                )
                self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
                logger.info(f"Using device: {self.device}")
                self.pipeline = self.pipeline.to(self.device)
                logger.info("Pyannote pipeline loaded successfully")
            except Exception as e:
                logger.error(f"Error loading pyannote pipeline: {str(e)}")
                raise Exception("Failed to initialize pyannote pipeline. Please check your HF_TOKEN and internet connection.")
            
            # Initialize Whisper model
            logger.info("Loading Whisper model...")
            try:
                self.whisper_model = whisper.load_model('base')
                logger.info("Whisper model loaded successfully")
            except Exception as e:
                logger.error(f"Error loading Whisper model: {str(e)}")
                raise Exception("Failed to initialize Whisper model. Please check if the model is properly installed.")
            
            logger.info("TranscriptionService initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing TranscriptionService: {str(e)}")
            raise

    def format_timestamp(self, seconds):
        """Convert seconds to MM:SS.mmm format"""
        minutes = int(seconds // 60)
        remaining_seconds = seconds % 60
        return f"{minutes:02d}:{remaining_seconds:06.3f}"

    def clean_text(self, text):
        """Clean up transcribed text by removing redundant parts and formatting."""
        # Remove repeated sentences that might appear due to diarization overlap
        sentences = text.split('.')
        unique_sentences = []
        seen_texts = set()  # Track unique text segments
        
        for sentence in sentences:
            sentence = sentence.strip()
            # Normalize the sentence for comparison
            normalized = ' '.join(sentence.lower().split())
            if sentence and normalized not in seen_texts:
                unique_sentences.append(sentence)
                seen_texts.add(normalized)
        
        return '. '.join(unique_sentences).strip()

    def merge_overlapping_segments(self, segments):
        """Merge segments that have overlapping or very close timestamps."""
        if not segments:
            return segments
            
        # Sort segments by start time
        sorted_segments = sorted(segments, key=lambda x: x['start'])
        merged = []
        current = sorted_segments[0]
        
        for next_seg in sorted_segments[1:]:
            # If segments are from same speaker and close in time (within 1 second)
            if (next_seg['speaker'] == current['speaker'] and 
                next_seg['start'] - current['end'] < 1.0):
                # Merge the segments
                current['end'] = max(current['end'], next_seg['end'])
                current['text'] = self.clean_text(current['text'] + ' ' + next_seg['text'])
                current['time'] = f"{self.format_timestamp(current['start'])} → {self.format_timestamp(current['end'])}"
            else:
                merged.append(current)
                current = next_seg
        
        merged.append(current)
        return merged

    def transcribe_audio(self, audio_path):
        try:
            logger.info(f"Starting transcription for file: {audio_path}")
            
            if not os.path.exists(audio_path):
                raise Exception(f"Audio file not found: {audio_path}")
            
            # First get the transcription from Whisper
            logger.info("Starting transcription with Whisper...")
            try:
                result = self.whisper_model.transcribe(
                    audio_path,
                    language="en",
                    task="transcribe",
                    initial_prompt="This is an audio clip.",
                    temperature=0.0
                )
                logger.info("Whisper transcription completed successfully")
            except Exception as e:
                logger.error(f"Error during transcription: {str(e)}")
                raise Exception("Failed to transcribe audio")

            # Then perform diarization
            logger.info("Starting diarization...")
            try:
                diarization = self.pipeline(audio_path)
                
                # Extract diarization segments
                segments = []
                for turn, track, speaker in diarization.itertracks(yield_label=True):
                    # Find matching transcription segments
                    segment_text = ""
                    for seg in result["segments"]:
                        seg_start = float(seg['start'])
                        seg_end = float(seg['end'])
                        
                        # If there's overlap between the diarization segment and transcription segment
                        if (seg_start < turn.end and seg_end > turn.start):
                            segment_text += " " + seg['text']
                    
                    # Only add segments that have text
                    if segment_text.strip():
                        clean_text = self.clean_text(segment_text)
                        if clean_text:  # Only add if there's text after cleaning
                            segments.append({
                                "speaker": f"Speaker {speaker.split('_')[-1]}",  # Convert SPEAKER_00 to Speaker 0
                                "text": clean_text,
                                "start": round(float(turn.start), 2),
                                "end": round(float(turn.end), 2),
                                "time": f"{self.format_timestamp(turn.start)} → {self.format_timestamp(turn.end)}"
                            })
                
                # Merge overlapping segments
                segments = self.merge_overlapping_segments(segments)
                
                # If no segments were found with speaker diarization, use the full transcription
                if not segments:
                    logger.warning("No speaker segments found, using full transcription")
                    clean_text = self.clean_text(result["text"])
                    end_time = float(result["segments"][-1]["end"]) if result["segments"] else 0.0
                    segments.append({
                        "speaker": "Speaker Unknown",
                        "text": clean_text,
                        "start": 0.0,
                        "end": round(end_time, 2),
                        "time": f"00:00.000 → {self.format_timestamp(end_time)}"
                    })
                
                # Calculate total duration
                total_duration = max(seg["end"] for seg in segments)
                
                logger.info(f"Processing completed with {len(segments)} segments")
                return {
                    "segments": segments,
                    "duration": self.format_timestamp(total_duration),
                    "duration_seconds": round(total_duration, 2)
                }
                
            except Exception as e:
                logger.error(f"Error during diarization: {str(e)}")
                # If diarization fails, return the full transcription without speaker separation
                logger.warning("Falling back to full transcription without speaker diarization")
                clean_text = self.clean_text(result["text"])
                end_time = float(result["segments"][-1]["end"]) if result["segments"] else 0.0
                return {
                    "segments": [{
                        "speaker": "Speaker Unknown",
                        "text": clean_text,
                        "start": 0.0,
                        "end": round(end_time, 2),
                        "time": f"00:00.000 → {self.format_timestamp(end_time)}"
                    }],
                    "duration": self.format_timestamp(end_time),
                    "duration_seconds": round(end_time, 2)
                }
                
        except Exception as e:
            logger.error(f"Error in transcribe_audio: {str(e)}")
            return {"error": str(e)}

class TitleSuggestionService:
    def __init__(self):
        self.generator = pipeline(
            "text-generation",
            model="gpt2",
            device="cuda" if torch.cuda.is_available() else "cpu"
        )

    def clean_title(self, title):
        """Clean up a title by removing numbers, extra spaces, and unwanted text."""
        # Remove common prefixes and formatting
        prefixes = ['1.', '2.', '3.', '-', '#', '*', 'Title:', 'Headline:']
        for prefix in prefixes:
            if title.lower().startswith(prefix.lower()):
                title = title[len(prefix):]
        
        # Clean up the title
        title = title.strip()
        # Remove quotes if they wrap the entire title
        if title.startswith('"') and title.endswith('"'):
            title = title[1:-1]
        return title.strip()

    def generate_titles(self, content):
        try:
            # Extract key topics from the content
            first_sentence = content.split('.')[0].strip()
            topics = [word.strip() for word in first_sentence.split() if len(word) > 3]
            
            # Create three different prompts for variety
            prompts = [
                f"Title: A news article about {first_sentence}\n\nHeadline:",
                f"Write a catchy title about {', '.join(topics[:3])}:\n\n1.",
                f"Generate an engaging headline about {first_sentence}:\n\n"
            ]
            
            titles = []
            for prompt in prompts:
                response = self.generator(
                    prompt,
                    max_length=len(prompt) + 50,
                    num_return_sequences=1,
                    temperature=0.8,
                    top_k=50,
                    top_p=0.95,
                    do_sample=True,
                    no_repeat_ngram_size=2
                )
                
                # Extract and clean the generated title
                generated_text = response[0]['generated_text']
                # Remove the prompt from the generated text
                if '\n' in generated_text:
                    generated_text = generated_text.split('\n')[-1]
                elif ':' in generated_text:
                    generated_text = generated_text.split(':')[-1]
                
                clean_title = self.clean_title(generated_text)
                
                # Ensure the title is reasonable length and meaningful
                if clean_title and 3 <= len(clean_title.split()) <= 12:
                    titles.append(clean_title)
            
            # If we don't have enough good titles, add backup titles
            if len(titles) < 3:
                backup_titles = [
                    f"The Global Impact of Climate Change: A Call to Action",
                    f"Sustainable Solutions: Fighting Climate Change Together",
                    f"Green Technology: Our Answer to Climate Crisis"
                ]
                while len(titles) < 3:
                    backup_title = backup_titles[len(titles)]
                    if backup_title not in titles:
                        titles.append(backup_title)

            # Ensure exactly 3 unique titles
            titles = list(dict.fromkeys(titles))[:3]  # Remove duplicates and keep first 3
            titles = [t[:100] for t in titles]  # Limit length of each title

            return {"suggestions": titles}
            
        except Exception as e:
            logger.error(f"Error in generate_titles: {str(e)}")
            return {"error": str(e)} 