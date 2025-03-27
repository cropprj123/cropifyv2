import whisper
from flask import Flask, request, jsonify
import os
from moviepy.editor import VideoFileClip
import tempfile

app = Flask(__name__)
model = whisper.load_model("base")  # You can choose between "tiny", "base", "small", "medium", "large"

def extract_audio_from_video(video_path, output_path):
    """Extract audio from video file"""
    video = VideoFileClip(video_path)
    audio = video.audio
    audio.write_audiofile(output_path)
    video.close()
    audio.close()

@app.route('/api/speech-to-text', methods=['POST'])
def speech_to_text():
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400
    
    video_file = request.files['video']
    
    # Create temporary files for video and audio
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as video_temp:
        video_file.save(video_temp.name)
        
        # Create temporary audio file
        audio_temp = tempfile.NamedTemporaryFile(suffix='.mp3', delete=False)
        audio_path = audio_temp.name
        audio_temp.close()
        
        try:
            # Extract audio from video
            extract_audio_from_video(video_temp.name, audio_path)
            
            # Transcribe audio
            result = model.transcribe(audio_path)
            
            # Clean up temporary files
            os.unlink(video_temp.name)
            os.unlink(audio_path)
            
            return jsonify({
                'success': True,
                'text': result['text'],
                'segments': result['segments']
            })
            
        except Exception as e:
            # Clean up temporary files in case of error
            if os.path.exists(video_temp.name):
                os.unlink(video_temp.name)
            if os.path.exists(audio_path):
                os.unlink(audio_path)
            
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True) 