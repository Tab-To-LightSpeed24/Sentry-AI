import os
import re
import cv2
import numpy as np
import tensorflow_hub as hub
from PIL import Image
import requests
from io import BytesIO
from keras.models import load_model
from processor.video_frame_sampler import extract_video_frames

# Load model
MODEL_PATH = "nsfw_model/nsfw_model.h5"
model = load_model(MODEL_PATH, custom_objects={'KerasLayer': hub.KerasLayer})

# Caption/emoji patterns
NSFW_PHRASES = [
    r"onlyfans", r"link in bio", r"dm for", r"18\\+", r"nsfw", r"explicit",
    r"spicy", r"uncensored", r"nude", r"leak", r"private", r"premium"
]
NSFW_EMOJIS = ["🔞", "🍑", "🍆", "💦", "👅", "👙", "🩲", "💋", "🔥"]

def analyze_caption(caption):
    caption = caption.lower()
    score = 0
    matches = []

    for pattern in NSFW_PHRASES:
        if re.search(pattern, caption):
            score += 1
            matches.append(pattern)

    for emoji in NSFW_EMOJIS:
        if emoji in caption:
            score += 1
            matches.append(emoji)

    return score, matches

def load_and_preprocess_image(image_url):
    response = requests.get(image_url)
    img = Image.open(BytesIO(response.content)).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    return np.expand_dims(img_array, axis=0)

def process_media_item(post):
    image_url = post.get("display_url")
    caption = post.get("edge_media_to_caption", {}).get("edges", [{}])[0].get("node", {}).get("text", "")

    # Run NLP filtering
    caption_score, matches = analyze_caption(caption)

    # Handle video or image
    is_video = ".mp4" in image_url or "video" in image_url

    if is_video:
        frame_scores = extract_video_frames(image_url, model)
        nudity_score = max(frame_scores) if frame_scores else 0.0
    else:
        img_tensor = load_and_preprocess_image(image_url)
        nudity_score = float(model.predict(img_tensor)[0][0])

    flagged = nudity_score > 0.75 or caption_score >= 2

    return {
        "post_id": post.get("id"),
        "image_url": image_url,
        "caption": caption,
        "nudity_score": nudity_score,
        "caption_score": caption_score,
        "caption_matches": matches,
        "flagged": flagged
    }
