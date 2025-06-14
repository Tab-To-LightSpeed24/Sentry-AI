from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
import asyncio
import logging
from typing import Optional, List
import json
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import Response
import httpx

# Import your existing modules (same folder)
from .db import create_db_and_tables, engine
from .models import MediaItem

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()


# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# Pydantic models
class MediaPost(BaseModel):
    post_id: str
    image_url: str
    caption: str
    nudity_score: float
    flagged: bool

class AccountScrapeRequest(BaseModel):
    accountName: str

class AccountScrapeResponse(BaseModel):
    message: str
    account_name: str
    status: str

class HashtagScrapeRequest(BaseModel):
    hashtag: str
    max_posts: Optional[int] = 20

class ScrapeStatusResponse(BaseModel):
    account_name: str
    status: str
    total_posts: Optional[int] = None
    flagged_posts: Optional[int] = None
    message: Optional[str] = None

# Database dependency
def get_session():
    with Session(engine) as session:
        yield session

# Routes
@app.get("/proxy-image")
async def proxy_image(request: Request):
    image_url = request.query_params.get("url")
    if not image_url:
        return Response(content="Missing URL", status_code=400)

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(image_url, headers={
                "User-Agent": "Mozilla/5.0"
            })

        return Response(content=resp.content, media_type=resp.headers.get("Content-Type", "image/jpeg"))
    except Exception as e:
        print("Image proxy error:", e)
        return Response(content="Failed to load image", status_code=500)

@app.get("/media")
def get_flagged_media(session: Session = Depends(get_session)):
    """Fetch all flagged media items"""
    try:
        items = session.query(MediaItem).filter(MediaItem.flagged == True).all()
        return items
    except Exception as e:
        logger.error(f"Error fetching flagged media: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch media")

@app.get("/media/all")
def get_all_media(session: Session = Depends(get_session)):
    """Fetch all media items"""
    try:
        items = session.query(MediaItem).all()
        return items
    except Exception as e:
        logger.error(f"Error fetching all media: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch media")

@app.post("/media")
def save_media(post: MediaPost, session: Session = Depends(get_session)):
    """Save a new media item"""
    try:
        # Check for duplicates
        existing = session.query(MediaItem).filter(MediaItem.post_id == post.post_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Post already exists")

        item = MediaItem(
            post_id=post.post_id,
            image_url=post.image_url,
            caption=post.caption,
            nudity_score=post.nudity_score,
            flagged=post.flagged,
        )
        session.add(item)
        session.commit()
        session.refresh(item)
        return {"message": f"Post {post.post_id} saved", "id": item.id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving media: {e}")
        raise HTTPException(status_code=500, detail="Failed to save media")

@app.post("/feedback")
def submit_feedback(media_id: int, reviewer_label: str, session: Session = Depends(get_session)):
    """Submit feedback for a media item"""
    try:
        item = session.get(MediaItem, media_id)
        if not item:
            raise HTTPException(status_code=404, detail="Post not found")

        # Update based on reviewer feedback
        if reviewer_label.lower() in ["safe", "not_flagged", "false_positive"]:
            item.flagged = False
        elif reviewer_label.lower() in ["unsafe", "flagged", "nsfw"]:
            item.flagged = True
        
        session.commit()
        return {"message": "Feedback recorded", "new_status": "flagged" if item.flagged else "safe"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback")

@app.post("/scrape-hashtag", response_model=AccountScrapeResponse)
async def scrape_hashtag_endpoint(
    request: HashtagScrapeRequest, 
    background_tasks: BackgroundTasks
):
    """Endpoint to scrape Instagram hashtag and analyze content"""
    hashtag = request.hashtag.strip()
    max_posts = request.max_posts or 20
    
    if not hashtag:
        raise HTTPException(status_code=400, detail="Hashtag is required")
    
    # Remove # symbol if user included it
    if hashtag.startswith('#'):
        hashtag = hashtag[1:]
    
    # Basic validation
    if not hashtag.replace('_', '').isalnum():
        raise HTTPException(status_code=400, detail="Invalid hashtag format")
    
    # Add the scraping task to background tasks
    background_tasks.add_task(process_hashtag_scraping, hashtag, max_posts)
    
    return AccountScrapeResponse(
        message=f"Hashtag scraping started for #{hashtag}",
        account_name=hashtag,
        status="processing"
    )

@app.post("/scrape-account", response_model=AccountScrapeResponse)
async def scrape_instagram_account(
    request: AccountScrapeRequest, 
    background_tasks: BackgroundTasks
):
    """Endpoint to initiate Instagram account scraping and NSFW analysis"""
    account_name = request.accountName.strip()
    
    if not account_name:
        raise HTTPException(status_code=400, detail="Account name is required")
    
    # Remove @ symbol if user included it
    if account_name.startswith('@'):
        account_name = account_name[1:]
    
    # Validate account name format
    if not account_name.replace('_', '').replace('.', '').isalnum():
        raise HTTPException(status_code=400, detail="Invalid account name format")
    
    # Add the scraping task to background tasks
    background_tasks.add_task(process_instagram_account, account_name)
    
    return AccountScrapeResponse(
        message="Account scraping request received! Processing now...",
        account_name=account_name,
        status="processing"
    )

@app.get("/scrape-status/{identifier}")
def get_scrape_status(identifier: str) -> ScrapeStatusResponse:
    """Get processing status for an account or hashtag"""
    try:
        with Session(engine) as session:
            # Count total posts for this identifier
            total_posts = session.query(MediaItem).filter(
                MediaItem.post_id.contains(identifier)
            ).count()
            
            # Count flagged posts
            flagged_posts = session.query(MediaItem).filter(
                MediaItem.post_id.contains(identifier),
                MediaItem.flagged == True
            ).count()
            
            status = "completed" if total_posts > 0 else "not_found"
            message = f"Found {total_posts} posts, {flagged_posts} flagged" if total_posts > 0 else "No posts found"
            
            return ScrapeStatusResponse(
                account_name=identifier,
                status=status,
                total_posts=total_posts,
                flagged_posts=flagged_posts,
                message=message
            )
    except Exception as e:
        logger.error(f"Error getting scrape status: {e}")
        return ScrapeStatusResponse(
            account_name=identifier,
            status="error",
            message="Failed to get status"
        )

# Background processing functions
async def process_hashtag_scraping(hashtag: str, max_posts: int):
    """Background task to scrape hashtag and analyze content"""
    try:
        logger.info(f"Starting hashtag scraping for: #{hashtag}")
        
        # Import your scraping modules (relative to project root)
        from scraper.playwright_scraper import scrape_hashtag, extract_meta_data
        from processor.media_processor import process_media_item
        
        # Run the scraping in a thread to avoid blocking
        loop = asyncio.get_event_loop()
        posts = await loop.run_in_executor(None, scrape_hashtag, hashtag, max_posts)
        
        if not posts:
            logger.warning(f"No posts found for hashtag: {hashtag}")
            return
        
        # Process each post
        processed_count = 0
        flagged_count = 0
        
        with Session(engine) as session:
            for post in posts:
                try:
                    # Process the media item
                    processed_post = await loop.run_in_executor(None, process_media_item, post)
                    
                    # Create MediaItem
                    media_item = MediaItem(
                        post_id=f"{hashtag}_{processed_post['post_id']}",
                        image_url=processed_post['image_url'],
                        caption=processed_post['caption'],
                        nudity_score=processed_post['nudity_score'],
                        flagged=processed_post['flagged']
                    )
                    
                    # Check if already exists
                    existing = session.query(MediaItem).filter(
                        MediaItem.post_id == media_item.post_id
                    ).first()
                    
                    if not existing:
                        session.add(media_item)
                        session.commit()
                        processed_count += 1
                        if media_item.flagged:
                            flagged_count += 1
                        logger.info(f"Processed post {media_item.post_id} - Flagged: {media_item.flagged}")
                    
                except Exception as e:
                    logger.error(f"Error processing individual post: {e}")
                    continue
        
        logger.info(f"Hashtag scraping completed for #{hashtag}. Processed: {processed_count}, Flagged: {flagged_count}")
        
    except Exception as e:
        logger.error(f"Error in hashtag scraping for {hashtag}: {str(e)}")

async def process_instagram_account(account_name: str):
    """Background task to scrape Instagram account and analyze content"""
    try:
        logger.info(f"Starting account scraping for: @{account_name}")
        
        # For now, this is a placeholder since account scraping logic isn't in the provided files
        # You would need to implement account-specific scraping similar to hashtag scraping
        
        # Simulate processing
        await asyncio.sleep(2)
        
        # This is where you'd implement account scraping logic
        # Similar to hashtag scraping but for user profiles
        
        logger.info(f"Account scraping completed for @{account_name}")
        
    except Exception as e:
        logger.error(f"Error processing account {account_name}: {str(e)}")

# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "NSFW Detection API is running"}

# Get statistics
@app.get("/stats")
def get_statistics(session: Session = Depends(get_session)):
    """Get system statistics"""
    try:
        total_posts = session.query(MediaItem).count()
        flagged_posts = session.query(MediaItem).filter(MediaItem.flagged == True).count()
        safe_posts = total_posts - flagged_posts
        
        return {
            "total_posts": total_posts,
            "flagged_posts": flagged_posts,
            "safe_posts": safe_posts,
            "flagged_percentage": round((flagged_posts / total_posts * 100), 2) if total_posts > 0 else 0
        }
    except Exception as e:
        logger.error(f"Error getting statistics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get statistics")

# Delete media item
@app.delete("/media/{media_id}")
def delete_media(media_id: int, session: Session = Depends(get_session)):
    """Delete a media item"""
    try:
        item = session.get(MediaItem, media_id)
        if not item:
            raise HTTPException(status_code=404, detail="Media item not found")
        
        session.delete(item)
        session.commit()
        return {"message": f"Media item {media_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting media item: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete media item")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)