from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from bson import ObjectId
from datetime import datetime, timezone

from database import db
from models import ServiceCreateRequest, ServiceUpdateRequest, user_to_public
from auth_utils import get_current_user, require_roles
from storage_utils import save_upload
from constants import CATEGORIES

router = APIRouter(prefix="/services", tags=["services"])

MAX_IMAGE_SIZE = 5 * 1024 * 1024
MAX_IMAGES = 5


def service_to_public(svc: dict) -> dict:
    svc = dict(svc)
    svc["id"] = str(svc.pop("_id"))
    return svc


async def attach_provider(svc: dict) -> dict:
    provider = await db.users.find_one({"_id": ObjectId(svc["provider_id"])})
    svc["provider"] = user_to_public(provider) if provider else None
    return svc


@router.get("/categories")
async def list_categories():
    counts = {}
    async for row in db.services.aggregate([
        {"$match": {"is_active": True}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
    ]):
        counts[row["_id"]] = row["count"]
    return [{"key": c, "count": counts.get(c, 0)} for c in CATEGORIES]


@router.get("")
async def list_services(
    category: Optional[str] = None,
    city: Optional[str] = None,
    q: Optional[str] = None,
    min_price: Optional[float] = Query(default=None),
    max_price: Optional[float] = Query(default=None),
    sort: str = "newest",
    page: int = 1,
    limit: int = 12,
):
    query = {"is_active": True}
    if category:
        query["category"] = category
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]
    price_filter = {}
    if min_price is not None:
        price_filter["$gte"] = min_price
    if max_price is not None:
        price_filter["$lte"] = max_price
    if price_filter:
        query["price"] = price_filter

    sort_map = {
        "newest": [("created_at", -1)],
        "price_asc": [("price", 1)],
        "price_desc": [("price", -1)],
        "rating": [("rating_avg", -1)],
    }
    sort_spec = sort_map.get(sort, sort_map["newest"])

    total = await db.services.count_documents(query)
    skip = max(page - 1, 0) * limit
    cursor = db.services.find(query).sort(sort_spec).skip(skip).limit(limit)
    services = [service_to_public(doc) async for doc in cursor]
    services = [await attach_provider(svc) for svc in services]
    return {"items": services, "total": total, "page": page, "limit": limit}


@router.get("/{service_id}")
async def get_service(service_id: str):
    try:
        svc = await db.services.find_one({"_id": ObjectId(service_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Service not found")
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    svc = service_to_public(svc)
    svc = await attach_provider(svc)
    reviews = [service_to_public(r) async for r in db.reviews.find({"service_id": service_id}).sort("created_at", -1)]
    svc["reviews"] = reviews
    return svc


@router.post("")
async def create_service(payload: ServiceCreateRequest, user: dict = Depends(require_roles("provider"))):
    if payload.category not in CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")
    doc = {
        "provider_id": user["id"],
        "title": payload.title,
        "description": payload.description,
        "category": payload.category,
        "price": payload.price,
        "price_unit": payload.price_unit,
        "city": payload.city,
        "images": [],
        "is_active": True,
        "rating_avg": 0,
        "rating_count": 0,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.services.insert_one(doc)
    doc["_id"] = result.inserted_id
    return service_to_public(doc)


async def _get_owned_service(service_id: str, provider_id: str) -> dict:
    try:
        svc = await db.services.find_one({"_id": ObjectId(service_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Service not found")
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    if svc["provider_id"] != provider_id:
        raise HTTPException(status_code=403, detail="You don't own this service")
    return svc


@router.put("/{service_id}")
async def update_service(service_id: str, payload: ServiceUpdateRequest, user: dict = Depends(require_roles("provider"))):
    await _get_owned_service(service_id, user["id"])
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if "category" in updates and updates["category"] not in CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")
    if updates:
        await db.services.update_one({"_id": ObjectId(service_id)}, {"$set": updates})
    updated = await db.services.find_one({"_id": ObjectId(service_id)})
    return service_to_public(updated)


@router.delete("/{service_id}")
async def delete_service(service_id: str, user: dict = Depends(require_roles("provider"))):
    await _get_owned_service(service_id, user["id"])
    await db.services.update_one({"_id": ObjectId(service_id)}, {"$set": {"is_active": False}})
    return {"message": "Service deactivated"}


@router.post("/{service_id}/images")
async def upload_service_images(service_id: str, files: list[UploadFile] = File(...), user: dict = Depends(require_roles("provider"))):
    svc = await _get_owned_service(service_id, user["id"])
    existing_images = svc.get("images", [])
    if len(existing_images) + len(files) > MAX_IMAGES:
        raise HTTPException(status_code=400, detail=f"Maximum {MAX_IMAGES} images allowed per service")

    new_paths = []
    for file in files:
        if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
            raise HTTPException(status_code=400, detail="Only JPEG, PNG or WEBP images are allowed")
        data = await file.read()
        if len(data) > MAX_IMAGE_SIZE:
            raise HTTPException(status_code=400, detail="Each image must be smaller than 5MB")
        path = await save_upload(data, file.filename, file.content_type, f"services/{service_id}")
        new_paths.append(path)

    all_images = existing_images + new_paths
    await db.services.update_one({"_id": ObjectId(service_id)}, {"$set": {"images": all_images}})
    updated = await db.services.find_one({"_id": ObjectId(service_id)})
    return service_to_public(updated)
