from pathlib import Path
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import json
import time

# Constants
SESSION_FILE = "auth/instagram_login.json"


def extract_meta_data(soup):
    """Extract data from meta tags."""
    og_image = soup.find("meta", property="og:image")
    og_video = soup.find("meta", property="og:video")
    description_tag = soup.find("meta", attrs={"name": "description"})

    display_url = og_image["content"] if og_image else ""
    video_url = og_video["content"] if og_video else ""
    caption = ""

    if description_tag:
        parts = description_tag["content"].split(":")
        if len(parts) > 1:
            caption = ":".join(parts[1:]).strip()

    return caption, display_url, video_url

def scrape_hashtag(HASHTAG,MAX_POSTS):
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()

        # Reuse or create session
        if Path(SESSION_FILE).exists():
            print("🔐 Reusing saved Instagram login session.")
            context = browser.new_context(storage_state=SESSION_FILE)
        else:
            print("🔐 No session found. Please login manually.")
            page = context.new_page()
            page.goto("https://www.instagram.com/accounts/login/")
            page.wait_for_timeout(60000)
            context.storage_state(path=SESSION_FILE)

        page = context.new_page()
        print(f"🌐 Visiting https://www.instagram.com/explore/tags/{HASHTAG}/")
        page.goto(f"https://www.instagram.com/explore/tags/{HASHTAG}/", timeout=60000)
        page.wait_for_timeout(5000)

        print("🔍 Extracting post links...")
        links = page.eval_on_selector_all(
            'a[href^="/p/"]',
            "els => els.map(e => e.href)"
        )
        print(f"✅ Found {len(links)} links.")

        visited = set()
        for link in links:
            if link in visited or len(results) >= MAX_POSTS:
                continue
            visited.add(link)

            print(f"🖼️ Scanning: {link}")
            try:
                page.goto(link, timeout=60000)
                page.wait_for_timeout(3000)
                html = page.content()
                soup = BeautifulSoup(html, "html.parser")

                caption, display_url, video_url = extract_meta_data(soup)

                post_data = {
                    "id": link.split("/")[-2],
                    "caption": caption,
                    "display_url": display_url,
                    "video_url": video_url,
                }
                results.append(post_data)
                print("✅ Post added.")

            except Exception as e:
                print(f"❌ Failed to process post: {e}")

        browser.close()

    print(f"🎯 Total posts scraped: {len(results)}")
    print(json.dumps(results, indent=2))
    return results

# Run scraper
if __name__ == "__main__":
    HASHTAG = "hentai"
    MAX_POSTS = 10
    scrape_hashtag(HASHTAG,MAX_POSTS)
