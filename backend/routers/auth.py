from fastapi import APIRouter, Response, HTTPException, Depends, Request
from bson import ObjectId

from database import db
from models import RegisterRequest, LoginRequest, user_to_public
from auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    set_auth_cookies,
    clear_auth_cookies,
    get_current_user,
    check_lockout,
    record_failed_attempt,
    clear_attempts,
    get_jwt_secret,
    JWT_ALGORITHM,
)
import jwt

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(payload: RegisterRequest, response: Response):
    email = payload.email.lower()
    if payload.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot register as admin")
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    from datetime import datetime, timezone

    doc = {
        "name": payload.name,
        "email": email,
        "password_hash": hash_password(payload.password),
        "role": payload.role.value,
        "phone": payload.phone,
        "city": None,
        "address": None,
        "avatar_path": None,
        "bio": None,
        "is_blocked": False,
        "is_verified": False,
        "rating_avg": 0,
        "rating_count": 0,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    user = user_to_public(doc)

    access_token = create_access_token(user["id"], email, user["role"])
    refresh_token = create_refresh_token(user["id"])
    set_auth_cookies(response, access_token, refresh_token)
    return user


@router.post("/login")
async def login(payload: LoginRequest, response: Response):
    email = payload.email.lower()
    identifier = f"login:{email}"
    await check_lockout(identifier)

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        await record_failed_attempt(identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.get("is_blocked"):
        raise HTTPException(status_code=403, detail="Your account has been blocked. Contact support.")

    await clear_attempts(identifier)
    public_user = user_to_public(user)
    access_token = create_access_token(public_user["id"], email, public_user["role"])
    refresh_token = create_refresh_token(public_user["id"])
    set_auth_cookies(response, access_token, refresh_token)
    return public_user


@router.post("/logout")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"message": "Logged out"}


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@router.post("/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user or user.get("is_blocked"):
        raise HTTPException(status_code=401, detail="User not found")

    public_user = user_to_public(user)
    access_token = create_access_token(public_user["id"], public_user["email"], public_user["role"])
    new_refresh_token = create_refresh_token(public_user["id"])
    set_auth_cookies(response, access_token, new_refresh_token)
    return public_user
