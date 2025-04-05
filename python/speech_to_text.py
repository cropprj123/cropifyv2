import whisper
from flask import Flask, request, jsonify
import os
from moviepy.editor import VideoFileClip
import tempfile
import logging

app = Flask(__name__)
model = whisper.load_model("base")  # You can choose between "tiny", "base", "small", "medium", "large"

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_audio_from_video(video_path, output_path):
    """Extract audio from video file"""
    try:
        logger.info(f"Extracting audio from video: {video_path}")
        video = VideoFileClip(video_path)
        audio = video.audio
        audio.write_audiofile(output_path)
        video.close()
        audio.close()
        logger.info("Audio extraction completed successfully")
    except Exception as e:
        logger.error(f"Error extracting audio: {str(e)}")
        raise

@app.route('/api/speech-to-text', methods=['POST'])
def speech_to_text():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        video_file = request.files['video']
        logger.info("Received video file")
        
        # Create temporary files for video and audio
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as video_temp:
            video_file.save(video_temp.name)
            video_path = video_temp.name
            logger.info(f"Saved video to temporary file: {video_path}")
        
        # Create temporary audio file
        audio_temp = tempfile.NamedTemporaryFile(suffix='.mp3', delete=False)
        audio_path = audio_temp.name
        audio_temp.close()
        logger.info(f"Created temporary audio file: {audio_path}")
        
        try:
            # Extract audio from video
            extract_audio_from_video(video_path, audio_path)
            
            # Transcribe audio
            logger.info("Starting transcription")
            result = model.transcribe(audio_path)
            logger.info("Transcription completed")
            
            # Clean up temporary files
            os.unlink(video_path)
            os.unlink(audio_path)
            logger.info("Cleaned up temporary files")
            
            return jsonify({
                'success': True,
                'text': result['text'],
                'segments': result['segments']
            })
            
        except Exception as e:
            logger.error(f"Error processing video: {str(e)}")
            # Clean up temporary files in case of error
            if os.path.exists(video_path):
                os.unlink(video_path)
            if os.path.exists(audio_path):
                os.unlink(audio_path)
            
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
            
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True) 