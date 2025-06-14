
import instaloader
from processor.media_processor import process_media_item
import requests
import time

# Username you're using for login
INSTAGRAM_USERNAME = "kaushik___24"
SEED_ACCOUNTS = [
    "mylf_daily"
]

BACKEND_URL = "http://localhost:8000/media"

def main():
    L = instaloader.Instaloader(download_pictures=False, download_videos=False, download_video_thumbnails=False)
    
    try:
        # Attempt to load an existing session
        L.load_session_from_file(INSTAGRAM_USERNAME)
        print(f"🔐 Loaded session for {INSTAGRAM_USERNAME}.")
    except FileNotFoundError:
        print(f"❌ No session file found for {INSTAGRAM_USERNAME}. Please log in manually using:")
        print(f"   instaloader --login={INSTAGRAM_USERNAME}")
        return

    for username in SEED_ACCOUNTS:
        print(f"🔍 Scanning @{username}...")
        try:
            profile = instaloader.Profile.from_username(L.context, username)
            posts = profile.get_posts()
            count = 0

            for post in posts:
                if count >= 5:
                    break
                if post.is_video:
                    continue  # skip videos for now

                post_data = {
                    'id': post.shortcode,
                    'display_url': post.url,
                    'thumbnail_src': post.url,
                    'edge_media_to_caption': {
                        'edges': [{'node': {'text': post.caption or ""}}]
                    }
                }

                try:
                    result = process_media_item(post_data)
                    print(f"✅ Processed: {result['post_id']} (flagged={result['flagged']})")

                    res = requests.post(BACKEND_URL, json=result)
                    if res.status_code == 200:
                        print(f"📤 Sent to backend: {result['post_id']}")
                    else:
                        print(f"❌ Failed to save {result['post_id']}: {res.status_code} - {res.text}")

                except Exception as e:
                    print(f"❌ Processing failed for {post.shortcode}: {e}")

                count += 1
                time.sleep(2)  # be polite to Instagram

        except Exception as e:
            print(f"❌ Failed to scan @{username}: {e}")
        
        time.sleep(30)

if __name__ == "__main__":
    main()
