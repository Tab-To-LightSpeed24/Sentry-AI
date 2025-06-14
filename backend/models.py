# models.py
from sqlmodel import SQLModel, Field
from typing import Optional

class MediaItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    post_id: str
    image_url: str
    caption: str
    nudity_score: float
    flagged: bool  # ✅ THIS must be present

class Feedback(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    media_id: str
    reviewer_label: str
    reviewer_id: Optional[str] = None  # Firebase UID


