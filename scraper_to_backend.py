import os
import sys
import requests

# Add the root folder to import scraper and processor
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

from scraper.playwright_scraper import scrape_hashtag
from processor.media_processor import process_media_item

BACKEND_URL = "http://localhost:8000/media"

def main():
    hashtag = "hentai"  # You can make this dynamic if needed
    max_posts = 25

    print(f"📥 Scraping posts for #{hashtag}...")
    posts = scrape_hashtag(hashtag, max_posts)

    if not posts:
        print("⚠️ No posts found. Exiting.")
        return

    for post in posts:
        try:
            print(f"📸 Processing {post['id']}")
            result = process_media_item(post)

            # Send result to backend
            response = requests.post(BACKEND_URL, json=result)

            if response.status_code == 200:
                print(f"✅ Sent to backend: {result['post_id']}")
            else:
                print(f"❌ Backend error ({response.status_code}): {response.text}")
        except Exception as e:
            print(f"❌ Failed to process {post.get('id')}: {e}")

if __name__ == "__main__":
    main()
