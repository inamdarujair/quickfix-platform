from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from bson import ObjectId

from database import db
from models import UpdateProfileRequest, user_to_public
from auth_utils import get_current_user
from storage_utils import save_upload

router = APIRouter(prefix="/users", tags=["users"])

MAX_AVATAR_SIZE = 5 * 1024 * 1024


@router.put("/profile")
async def update_profile(payload: UpdateProfileRequest, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if updates:
        await db.users.update_one({"_id": ObjectId(user["id"])}, {"$set": updates})
    updated = await db.users.find_one({"_id": ObjectId(user["id"])})
    return user_to_public(updated)


@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=400, detail="Only JPEG, PNG or WEBP images are allowed")
    data = await file.read()
    if len(data) > MAX_AVATAR_SIZE:
        raise HTTPException(status_code=400, detail="Image must be smaller than 5MB")
    path = await save_upload(data, file.filename, file.content_type, f"avatars/{user['id']}")
    await db.users.update_one({"_id": ObjectId(user["id"])}, {"$set": {"avatar_path": path}})
    updated = await db.users.find_one({"_id": ObjectId(user["id"])})
    return user_to_public(updated)
