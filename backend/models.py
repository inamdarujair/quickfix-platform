from typing import Optional, List, Any
from datetime import datetime, timezone
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator, EmailStr
from typing_extensions import Annotated
from bson import ObjectId


def validate_object_id(v: Any) -> str:
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, str):
        return v
    raise ValueError("Invalid ObjectId")


PyObjectId = Annotated[str, BeforeValidator(validate_object_id)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    @classmethod
    def from_mongo(cls, doc: Optional[dict]):
        if doc is None:
            return None
        return cls(**doc)

    def to_mongo(self) -> dict:
        data = self.model_dump(by_alias=True, exclude_none=True)
        data.pop("_id", None)
        return data


class UserRole(str, Enum):
    customer = "customer"
    provider = "provider"
    admin = "admin"


class User(BaseDocument):
    name: str
    email: EmailStr
    password_hash: str
    role: UserRole
    phone: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    avatar_path: Optional[str] = None
    bio: Optional[str] = None
    is_blocked: bool = False
    is_verified: bool = False
    rating_avg: float = 0
    rating_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: UserRole
    phone: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    avatar_path: Optional[str] = None
    bio: Optional[str] = None
    is_blocked: bool = False
    is_verified: bool = False
    rating_avg: float = 0
    rating_count: int = 0
    created_at: datetime


def user_to_public(user: dict) -> dict:
    user = dict(user)
    user["id"] = str(user.pop("_id"))
    user.pop("password_hash", None)
    return user


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)
    role: UserRole = UserRole.customer
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=80)
    phone: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None


class Service(BaseDocument):
    provider_id: str
    title: str
    description: str
    category: str
    price: float
    price_unit: str = "fixed"
    city: str
    images: List[str] = []
    is_active: bool = True
    rating_avg: float = 0
    rating_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ServiceCreateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=100)
    description: str = Field(min_length=10, max_length=2000)
    category: str
    price: float = Field(gt=0)
    price_unit: str = "fixed"
    city: str


class ServiceUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    price_unit: Optional[str] = None
    city: Optional[str] = None
    is_active: Optional[bool] = None


class Booking(BaseDocument):
    customer_id: str
    provider_id: str
    service_id: str
    service_title: str
    scheduled_date: str
    scheduled_time: str
    address: str
    notes: Optional[str] = None
    price: float
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BookingCreateRequest(BaseModel):
    service_id: str
    scheduled_date: str
    scheduled_time: str
    address: str = Field(min_length=5)
    notes: Optional[str] = None


class BookingStatusUpdateRequest(BaseModel):
    status: str


class Review(BaseDocument):
    booking_id: str
    customer_id: str
    customer_name: str
    provider_id: str
    service_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ReviewCreateRequest(BaseModel):
    booking_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = Field(default=None, max_length=1000)
