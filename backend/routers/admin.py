from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from database import db
from models import user_to_public
from auth_utils import require_roles
from routers.bookings import booking_to_public
from routers.services import service_to_public

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
async def admin_stats(user: dict = Depends(require_roles("admin"))):
    total_customers = await db.users.count_documents({"role": "customer"})
    total_providers = await db.users.count_documents({"role": "provider"})
    total_services = await db.services.count_documents({})
    active_services = await db.services.count_documents({"is_active": True})
    total_bookings = await db.bookings.count_documents({})

    pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "revenue": {"$sum": "$price"}}},
    ]
    result = await db.bookings.aggregate(pipeline).to_list(1)
    revenue = result[0]["revenue"] if result else 0

    status_counts = {}
    async for row in db.bookings.aggregate([{"$group": {"_id": "$status", "count": {"$sum": 1}}}]):
        status_counts[row["_id"]] = row["count"]

    return {
        "total_customers": total_customers,
        "total_providers": total_providers,
        "total_services": total_services,
        "active_services": active_services,
        "total_bookings": total_bookings,
        "revenue": revenue,
        "bookings_by_status": status_counts,
    }


@router.get("/users")
async def list_users(role: Optional[str] = None, q: Optional[str] = None, user: dict = Depends(require_roles("admin"))):
    query = {}
    if role:
        query["role"] = role
    if q:
        query["$or"] = [{"name": {"$regex": q, "$options": "i"}}, {"email": {"$regex": q, "$options": "i"}}]
    users = [user_to_public(u) async for u in db.users.find(query).sort("created_at", -1)]
    return users


@router.put("/users/{user_id}/toggle-block")
async def toggle_block_user(user_id: str, user: dict = Depends(require_roles("admin"))):
    target = await db.users.find_one({"_id": ObjectId(user_id)})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target["role"] == "admin":
        raise HTTPException(status_code=400, detail="Cannot block an admin account")
    new_status = not target.get("is_blocked", False)
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_blocked": new_status}})
    updated = await db.users.find_one({"_id": ObjectId(user_id)})
    return user_to_public(updated)


@router.put("/users/{user_id}/toggle-verify")
async def toggle_verify_provider(user_id: str, user: dict = Depends(require_roles("admin"))):
    target = await db.users.find_one({"_id": ObjectId(user_id)})
    if not target or target["role"] != "provider":
        raise HTTPException(status_code=404, detail="Provider not found")
    new_status = not target.get("is_verified", False)
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_verified": new_status}})
    updated = await db.users.find_one({"_id": ObjectId(user_id)})
    return user_to_public(updated)


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, user: dict = Depends(require_roles("admin"))):
    target = await db.users.find_one({"_id": ObjectId(user_id)})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target["role"] == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete an admin account")
    await db.users.delete_one({"_id": ObjectId(user_id)})
    return {"message": "User deleted"}


@router.get("/services")
async def list_all_services(category: Optional[str] = None, is_active: Optional[bool] = None, user: dict = Depends(require_roles("admin"))):
    query = {}
    if category:
        query["category"] = category
    if is_active is not None:
        query["is_active"] = is_active
    services = [service_to_public(s) async for s in db.services.find(query).sort("created_at", -1)]
    for s in services:
        provider = await db.users.find_one({"_id": ObjectId(s["provider_id"])})
        s["provider_name"] = provider["name"] if provider else "Unknown"
    return services


@router.put("/services/{service_id}/toggle-active")
async def toggle_service_active(service_id: str, user: dict = Depends(require_roles("admin"))):
    svc = await db.services.find_one({"_id": ObjectId(service_id)})
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    new_status = not svc.get("is_active", True)
    await db.services.update_one({"_id": ObjectId(service_id)}, {"$set": {"is_active": new_status}})
    updated = await db.services.find_one({"_id": ObjectId(service_id)})
    return service_to_public(updated)


@router.delete("/services/{service_id}")
async def delete_service_admin(service_id: str, user: dict = Depends(require_roles("admin"))):
    result = await db.services.delete_one({"_id": ObjectId(service_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted"}


@router.get("/bookings")
async def list_all_bookings(status: Optional[str] = None, user: dict = Depends(require_roles("admin"))):
    query = {}
    if status:
        query["status"] = status
    bookings = [booking_to_public(b) async for b in db.bookings.find(query).sort("created_at", -1)]
    for b in bookings:
        customer = await db.users.find_one({"_id": ObjectId(b["customer_id"])})
        provider = await db.users.find_one({"_id": ObjectId(b["provider_id"])})
        b["customer_name"] = customer["name"] if customer else "Unknown"
        b["provider_name"] = provider["name"] if provider else "Unknown"
    return bookings
