from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from bson import ObjectId
from datetime import datetime, timezone

from database import db
from models import ReviewCreateRequest
from auth_utils import require_roles
from storage_utils import save_upload

router = APIRouter(prefix="/reviews", tags=["reviews"])

MAX_PHOTOS = 3
MAX_PHOTO_SIZE = 5 * 1024 * 1024


def review_to_public(r: dict) -> dict:
    r = dict(r)
    r["id"] = str(r.pop("_id"))
    return r


async def recalculate_rating(collection_name: str, field: str, entity_id: str):
    pipeline = [
        {"$match": {field: entity_id}},
        {"$group": {"_id": None, "avg": {"$avg": "$rating"}, "count": {"$sum": 1}}},
    ]
    result = await db.reviews.aggregate(pipeline).to_list(1)
    if result:
        avg = round(result[0]["avg"], 1)
        count = result[0]["count"]
    else:
        avg, count = 0, 0
    await db[collection_name].update_one({"_id": ObjectId(entity_id)}, {"$set": {"rating_avg": avg, "rating_count": count}})


@router.post("")
async def create_review(payload: ReviewCreateRequest, user: dict = Depends(require_roles("customer"))):
    try:
        booking = await db.bookings.find_one({"_id": ObjectId(payload.booking_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Booking not found")
    if not booking or booking["customer_id"] != user["id"]:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking["status"] != "completed":
        raise HTTPException(status_code=400, detail="You can only review completed bookings")
    existing = await db.reviews.find_one({"booking_id": payload.booking_id})
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this booking")

    doc = {
        "booking_id": payload.booking_id,
        "customer_id": user["id"],
        "customer_name": user["name"],
        "provider_id": booking["provider_id"],
        "service_id": booking["service_id"],
        "rating": payload.rating,
        "comment": payload.comment,
        "photos": [],
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.reviews.insert_one(doc)
    doc["_id"] = result.inserted_id

    await recalculate_rating("services", "service_id", booking["service_id"])
    await recalculate_rating("users", "provider_id", booking["provider_id"])
    return review_to_public(doc)


@router.post("/{review_id}/photos")
async def upload_review_photos(review_id: str, files: list[UploadFile] = File(...), user: dict = Depends(require_roles("customer"))):
    try:
        review = await db.reviews.find_one({"_id": ObjectId(review_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Review not found")
    if not review or review["customer_id"] != user["id"]:
        raise HTTPException(status_code=404, detail="Review not found")

    existing_photos = review.get("photos", [])
    if len(existing_photos) + len(files) > MAX_PHOTOS:
        raise HTTPException(status_code=400, detail=f"Maximum {MAX_PHOTOS} photos allowed per review")

    new_paths = []
    for file in files:
        if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
            raise HTTPException(status_code=400, detail="Only JPEG, PNG or WEBP images are allowed")
        data = await file.read()
        if len(data) > MAX_PHOTO_SIZE:
            raise HTTPException(status_code=400, detail="Each photo must be smaller than 5MB")
        path = await save_upload(data, file.filename, file.content_type, f"reviews/{review_id}")
        new_paths.append(path)

    all_photos = existing_photos + new_paths
    await db.reviews.update_one({"_id": ObjectId(review_id)}, {"$set": {"photos": all_photos}})
    updated = await db.reviews.find_one({"_id": ObjectId(review_id)})
    return review_to_public(updated)


@router.get("/service/{service_id}")
async def get_service_reviews(service_id: str):
    reviews = [review_to_public(r) async for r in db.reviews.find({"service_id": service_id}).sort("created_at", -1)]
    return reviews
