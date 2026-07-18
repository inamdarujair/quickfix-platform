from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from database import db
from models import BookingStatusUpdateRequest
from auth_utils import require_roles
from routers.bookings import booking_to_public
from routers.services import service_to_public
from constants import BOOKING_STATUSES

router = APIRouter(prefix="/provider", tags=["provider"])

VALID_TRANSITIONS = {
    "pending": {"confirmed", "rejected"},
    "confirmed": {"completed", "cancelled"},
}


@router.get("/services")
async def my_services(user: dict = Depends(require_roles("provider"))):
    return [service_to_public(s) async for s in db.services.find({"provider_id": user["id"]}).sort("created_at", -1)]


@router.get("/bookings")
async def my_provider_bookings(status: Optional[str] = None, user: dict = Depends(require_roles("provider"))):
    query = {"provider_id": user["id"]}
    if status:
        query["status"] = status
    bookings = [booking_to_public(b) async for b in db.bookings.find(query).sort("created_at", -1)]
    for b in bookings:
        customer = await db.users.find_one({"_id": ObjectId(b["customer_id"])})
        b["customer_name"] = customer["name"] if customer else "Unknown"
        b["customer_phone"] = customer.get("phone") if customer else None
    return bookings


@router.put("/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, payload: BookingStatusUpdateRequest, user: dict = Depends(require_roles("provider"))):
    if payload.status not in BOOKING_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    try:
        booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Booking not found")
    if not booking or booking["provider_id"] != user["id"]:
        raise HTTPException(status_code=404, detail="Booking not found")

    allowed = VALID_TRANSITIONS.get(booking["status"], set())
    if payload.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Cannot change status from {booking['status']} to {payload.status}")

    await db.bookings.update_one({"_id": ObjectId(booking_id)}, {"$set": {"status": payload.status}})
    updated = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    return booking_to_public(updated)


@router.get("/stats")
async def provider_stats(user: dict = Depends(require_roles("provider"))):
    total_services = await db.services.count_documents({"provider_id": user["id"]})
    total_bookings = await db.bookings.count_documents({"provider_id": user["id"]})
    pending = await db.bookings.count_documents({"provider_id": user["id"], "status": "pending"})
    completed = await db.bookings.count_documents({"provider_id": user["id"], "status": "completed"})

    pipeline = [
        {"$match": {"provider_id": user["id"], "status": "completed"}},
        {"$group": {"_id": None, "earnings": {"$sum": "$price"}}},
    ]
    result = await db.bookings.aggregate(pipeline).to_list(1)
    earnings = result[0]["earnings"] if result else 0

    return {
        "total_services": total_services,
        "total_bookings": total_bookings,
        "pending_bookings": pending,
        "completed_bookings": completed,
        "earnings": earnings,
        "rating_avg": user.get("rating_avg", 0),
        "rating_count": user.get("rating_count", 0),
    }
