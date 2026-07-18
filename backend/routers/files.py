from fastapi import APIRouter, HTTPException, Response

from database import db
from storage_utils import get_object

router = APIRouter(prefix="/files", tags=["files"])


@router.get("/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type") or content_type)
