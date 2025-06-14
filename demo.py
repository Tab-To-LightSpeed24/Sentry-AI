from scraper.mock_scraper import MOCK_POSTS
from processor.media_processor import process_media_item
import requests

BACKEND_URL = "http://localhost:8000/media"

print("📦 Processing mock Instagram posts...")

for post in MOCK_POSTS:
    try:
        result = process_media_item(post)
        print("✅", result)

        # Send to backend
        res = requests.post(BACKEND_URL, json=result)
        if res.status_code == 200:
            print(f"📝 Saved to backend: {result['post_id']}")
        else:
            print(f"❌ Failed to save {result['post_id']}: {res.text}")

    except Exception as e:
        print("❌ Error processing post:", post.get("id"), "-", str(e))
