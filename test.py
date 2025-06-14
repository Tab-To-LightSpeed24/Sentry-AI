from scraper.mock_scraper import MOCK_POSTS
from processor.media_processor import process_media_item

for post in MOCK_POSTS:
    print("Scanning post:", post["id"])
    result = process_media_item(post)
    print(result)
