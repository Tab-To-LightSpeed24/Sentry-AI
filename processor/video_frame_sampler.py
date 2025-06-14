import cv2
import numpy as np
import requests
import tempfile
import os

def download_video(video_url):
    try:
        response = requests.get(video_url, stream=True)
        response.raise_for_status()
        temp_video = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
        with open(temp_video.name, 'wb') as f:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                f.write(chunk)
        return temp_video.name
    except Exception as e:
        print(f"❌ Failed to download video: {e}")
        return None

def extract_video_frames(video_url, model):
    path = download_video(video_url)
    if not path:
        return []

    cap = cv2.VideoCapture(path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames == 0:
        print("❌ No frames found in video.")
        return []

    sample_points = [int(total_frames * i) for i in [0.5, 0.7, 0.8, 0.9, 0.95]]
    frame_scores = []

    for idx in sample_points:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        success, frame = cap.read()
        if success:
            frame = cv2.resize(frame, (224, 224))
            frame = frame[:, :, ::-1]  # BGR to RGB
            frame = frame / 255.0
            frame_input = np.expand_dims(frame, axis=0)
            score = float(model.predict(frame_input)[0][0])
            frame_scores.append(score)
    cap.release()
    os.remove(path)
    return frame_scores
