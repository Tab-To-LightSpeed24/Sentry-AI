# mock_scraper.py
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from processor.media_processor import process_media_item

# Simulated Instagram post metadata (public-like structure)
MOCK_POSTS = [
    {
        "id": "post1",
        "display_url": "/images/image1.jpg",
        "thumbnail_src": "frontend/public/images/image1.jpg",
        "edge_media_to_caption": {
            "edges": [{"node": {"text": "Beach vibes and sunshine!"}}]
        }
    },
    {
        "id": "post2",
        "display_url": "/images/image2.jpg",
        "thumbnail_src": "frontend/public/images/image2.jpg",
        "edge_media_to_caption": {
            "edges": [{"node": {"text": "Lazy afternoon by the pool 🌴"}}]
        }
    },
    {
        "id": "post3",
        "display_url": "/images/image3.jpg",
        "thumbnail_src": "frontend/public/images/image3.jpg",
        "edge_media_to_caption": {
            "edges": [{"node": {"text": "Sunset hikes are the best therapy 🌄"}}]
        }
    },
    {
        "id": "post4",
        "display_url": "/images/image4.jpg",
        "thumbnail_src": "frontend/public/images/image4.jpg",
        "edge_media_to_caption": {
            "edges": [{"node": {"text": "Coffee + rain = cozy mood ☕🌧️"}}]
        }
    },
    {
        "id": "post5",
        "display_url": "/images/image5.jpg",
        "thumbnail_src": "frontend/public/images/image5.jpg",
        "edge_media_to_caption": {
            "edges": [{"node": {"text": "Feeling cute in my new outfit 👗✨"}}]
        }
    },
    {
        "id": "post6",
        "display_url": "/images/image6.jpg",
        "thumbnail_src": "frontend/public/images/image6.jpg",
        "edge_media_to_caption": {
            "edges": [{"node": {"text": "Throwback to paradise 🏖️"}}]
        }
    },
    {
        "id": "post7",
        "display_url": "/images/image7.jpg",
        "thumbnail_src": "frontend/public/images/image7.jpg",
        "edge_media_to_caption": {
            "edges": [{"node": {"text": "Saturday morning brunch with friends 🥐🍓"}}]
        }
    },
    {
        "id": "post8",
        "display_url": "/images/image8.jpg",
        "thumbnail_src": "frontend/public/images/image8.jpg",
        "edge_media_to_caption": {
            "edges": [{"node": {"text": "Adventures in the city 🌆"}}]
        }
    },
    {
        "id": "post9",
        "display_url": "/images/image9.jpg",
        "thumbnail_src": "frontend/public/images/image9.jpg",
        "edge_media_to_caption": {
            "edges": [{"node": {"text": "New tattoo reveal 🎨🖤"}}]
        }
    },
    {
        "id": "post10",
        "display_url": "/images/image10.jpg",
        "thumbnail_src": "frontend/public/images/image10.jpg",
        "edge_media_to_caption": {
            "edges": [{"node": {"text": "Snowy mornings and warm hearts ❄️❤️"}}]
        }
    }
]

if __name__ == "__main__":
    from processor.media_processor import process_media_item

    print("🔍 Processing mock Instagram posts...")
    for post in MOCK_POSTS:
        result = process_media_item(post)
        print("\n✅ Processed Post:")
        print(result)
