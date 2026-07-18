from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime, timezone

from database import db
from models import BookingCreateRequest
from auth_utils import require_roles

router = APIRouter(prefix="/bookings", tags=["bookings"])


def booking_to_public(b: dict) -> dict:
    b = dict(b)
    b["id"] = str(b.pop("_id"))
    return b


@router.post("")
async def create_booking(payload: BookingCreateRequest, user: dict = Depends(require_roles("customer"))):
    try:
        service = await db.services.find_one({"_id": ObjectId(payload.service_id), "is_active": True})
    except Exception:
        raise HTTPException(status_code=404, detail="Service not found")
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    doc = {
        "customer_id": user["id"],
        "provider_id": service["provider_id"],
        "service_id": payload.service_id,
        "service_title": service["title"],
        "scheduled_date": payload.scheduled_date,
        "scheduled_time": payload.scheduled_time,
        "address": payload.address,
        "notes": payload.notes,
        "price": service["price"],
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.bookings.insert_one(doc)
    doc["_id"] = result.inserted_id
    return booking_to_public(doc)


@router.get("/my")
async def my_bookings(user: dict = Depends(require_roles("customer"))):
    bookings = [booking_to_public(b) async for b in db.bookings.find({"customer_id": user["id"]}).sort("created_at", -1)]
    for b in bookings:
        review = await db.reviews.find_one({"booking_id": b["id"]})
        b["has_review"] = review is not None
        provider = await db.users.find_one({"_id": ObjectId(b["provider_id"])})
        b["provider_name"] = provider["name"] if provider else "Unknown"
    return bookings


@router.put("/{booking_id}/cancel")
async def cancel_booking(booking_id: str, user: dict = Depends(require_roles("customer"))):
    try:
        booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Booking not found")
    if not booking or booking["customer_id"] != user["id"]:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking["status"] != "pending":
        raise HTTPException(status_code=400, detail="Only pending bookings can be cancelled")
    await db.bookings.update_one({"_id": ObjectId(booking_id)}, {"$set": {"status": "cancelled"}})
    updated = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    return booking_to_public(updated)
