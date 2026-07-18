import os
import logging
from datetime import datetime, timezone

from database import db
from auth_utils import hash_password, verify_password

logger = logging.getLogger(__name__)

SAMPLE_IMAGES = {
    "plumbing": "https://images.unsplash.com/photo-1768321916212-17ae334a3d63",
    "electrical": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2lhbiUyMHdvcmtpbmd8ZW58MHx8fHwxNzg0MzUzNzU2fDA&ixlib=rb-4.1.0&q=85",
    "cleaning": "https://images.pexels.com/photos/6195125/pexels-photo-6195125.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "painting": "https://images.pexels.com/photos/7218579/pexels-photo-7218579.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "carpentry": "https://images.unsplash.com/photo-1768321918210-a775e4c88f08",
    "ac_repair": "https://images.pexels.com/photos/38190070/pexels-photo-38190070.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "appliance_repair": "https://images.pexels.com/photos/6720523/pexels-photo-6720523.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "pest_control": "https://images.unsplash.com/photo-1768321915339-b88858824bc6",
    "gardening": "https://images.pexels.com/photos/4246271/pexels-photo-4246271.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    "moving": "https://images.pexels.com/photos/7203849/pexels-photo-7203849.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
}

PROVIDER_AVATARS = [
    "https://images.pexels.com/photos/2505053/pexels-photo-2505053.jpeg",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
]

SAMPLE_PROVIDERS = [
    {"name": "Marcus Reid", "email": "marcus.plumbing@quickfix.com", "city": "Austin", "bio": "Licensed plumber with 12 years of experience in residential repairs.", "services": [
        {"title": "Emergency Pipe Leak Repair", "category": "plumbing", "price": 85, "price_unit": "hour", "description": "Fast, reliable pipe leak detection and repair for homes and apartments. Available for emergency callouts."},
        {"title": "Bathroom Fixture Installation", "category": "plumbing", "price": 150, "price_unit": "fixed", "description": "Professional installation of sinks, faucets, showers and toilets with a 1-year workmanship guarantee."},
    ]},
    {"name": "Elena Vasquez", "email": "elena.electric@quickfix.com", "city": "Austin", "bio": "Certified electrician specializing in home rewiring and smart panel upgrades.", "services": [
        {"title": "Full Home Rewiring", "category": "electrical", "price": 1200, "price_unit": "fixed", "description": "Complete rewiring service for older homes, including panel upgrades and code compliance checks."},
        {"title": "Ceiling Fan & Light Installation", "category": "electrical", "price": 95, "price_unit": "hour", "description": "Safe, quick installation of ceiling fans, chandeliers and smart lighting systems."},
    ]},
    {"name": "Sophia Larsen", "email": "sophia.clean@quickfix.com", "city": "Denver", "bio": "Runs a 5-person eco-friendly cleaning crew serving Denver for 6 years.", "services": [
        {"title": "Deep Home Cleaning", "category": "cleaning", "price": 120, "price_unit": "fixed", "description": "Top-to-bottom deep clean including kitchen degreasing, bathroom sanitation and window sills."},
        {"title": "Recurring Weekly Cleaning", "category": "cleaning", "price": 60, "price_unit": "hour", "description": "Reliable weekly or bi-weekly cleaning plans tailored to your home's needs."},
    ]},
    {"name": "David Okafor", "email": "david.paint@quickfix.com", "city": "Denver", "bio": "Interior and exterior painting specialist with a sharp eye for finish quality.", "services": [
        {"title": "Interior Wall Painting", "category": "painting", "price": 45, "price_unit": "hour", "description": "Premium quality interior painting with clean edges and durable, low-odor paints."},
        {"title": "Exterior House Painting", "category": "painting", "price": 2200, "price_unit": "fixed", "description": "Full exterior repaint including power washing, scraping, priming and weatherproof coating."},
    ]},
    {"name": "Priya Nair", "email": "priya.carpentry@quickfix.com", "city": "Seattle", "bio": "Custom furniture maker and finish carpenter with a background in fine woodworking.", "services": [
        {"title": "Custom Shelving & Storage", "category": "carpentry", "price": 400, "price_unit": "fixed", "description": "Bespoke shelving, closets and storage units built to fit your exact space."},
        {"title": "Furniture Repair & Restoration", "category": "carpentry", "price": 70, "price_unit": "hour", "description": "Repair and restoration of wooden furniture, doors and cabinetry."},
    ]},
    {"name": "Tom Whitfield", "email": "tom.ac@quickfix.com", "city": "Seattle", "bio": "HVAC technician certified in AC installation, repair and seasonal maintenance.", "services": [
        {"title": "AC Unit Repair & Servicing", "category": "ac_repair", "price": 90, "price_unit": "hour", "description": "Diagnostics and repair for all major AC brands, plus seasonal maintenance tune-ups."},
        {"title": "New AC Installation", "category": "ac_repair", "price": 1800, "price_unit": "fixed", "description": "Full split or window AC unit installation with duct inspection and warranty."},
    ]},
    {"name": "Grace Lin", "email": "grace.appliance@quickfix.com", "city": "Chicago", "bio": "Appliance repair technician certified across all major kitchen and laundry brands.", "services": [
        {"title": "Washing Machine Repair", "category": "appliance_repair", "price": 75, "price_unit": "hour", "description": "Diagnosis and repair of washers, dryers and dishwashers from all major manufacturers."},
        {"title": "Refrigerator Repair", "category": "appliance_repair", "price": 80, "price_unit": "hour", "description": "Same-day refrigerator and freezer repair including compressor and thermostat issues."},
    ]},
    {"name": "Hassan Malik", "email": "hassan.pest@quickfix.com", "city": "Chicago", "bio": "Licensed pest control specialist using pet-safe, eco-conscious treatments.", "services": [
        {"title": "General Pest Control Treatment", "category": "pest_control", "price": 130, "price_unit": "fixed", "description": "Whole-home pest inspection and treatment for ants, roaches and rodents."},
        {"title": "Termite Inspection & Treatment", "category": "pest_control", "price": 250, "price_unit": "fixed", "description": "Thorough termite inspection with targeted treatment and a written protection plan."},
    ]},
    {"name": "Isabel Cruz", "email": "isabel.garden@quickfix.com", "city": "Miami", "bio": "Landscape designer and gardener helping homes stay green year-round.", "services": [
        {"title": "Lawn Mowing & Maintenance", "category": "gardening", "price": 50, "price_unit": "fixed", "description": "Regular lawn mowing, edging and cleanup to keep your yard looking sharp."},
        {"title": "Garden Landscaping Design", "category": "gardening", "price": 600, "price_unit": "fixed", "description": "Full landscape redesign including planting plans, mulching and irrigation setup."},
    ]},
    {"name": "Owen Baxter", "email": "owen.moving@quickfix.com", "city": "Miami", "bio": "Runs a fully insured local moving crew known for careful, on-time moves.", "services": [
        {"title": "Local Home Moving", "category": "moving", "price": 110, "price_unit": "hour", "description": "Full-service local moving with packing, loading, transport and unloading."},
        {"title": "Office Relocation", "category": "moving", "price": 900, "price_unit": "fixed", "description": "Efficient office moving service with equipment handling and after-hours scheduling."},
    ]},
]

SAMPLE_CUSTOMERS = [
    {"name": "Jordan Blake", "email": "jordan.customer@quickfix.com", "city": "Austin"},
    {"name": "Amelia Frost", "email": "amelia.customer@quickfix.com", "city": "Denver"},
]

DEFAULT_PASSWORD = "Password@123"


async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@quickfix.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "name": "QuickFix Admin",
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "is_blocked": False,
            "is_verified": True,
            "rating_avg": 0,
            "rating_count": 0,
            "created_at": datetime.now(timezone.utc),
        })
        logger.info("Seeded admin user")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})


async def seed_sample_data():
    existing_services = await db.services.count_documents({})
    if existing_services > 0:
        return
    logger.info("Seeding sample providers, services and customers")

    for idx, provider in enumerate(SAMPLE_PROVIDERS):
        result = await db.users.insert_one({
            "name": provider["name"],
            "email": provider["email"],
            "password_hash": hash_password(DEFAULT_PASSWORD),
            "role": "provider",
            "phone": "+1 555 010" + str(100 + idx),
            "city": provider["city"],
            "address": f"{100 + idx} Main Street, {provider['city']}",
            "avatar_path": None,
            "bio": provider["bio"],
            "is_blocked": False,
            "is_verified": idx % 3 != 0,
            "rating_avg": 0,
            "rating_count": 0,
            "created_at": datetime.now(timezone.utc),
        })
        provider_id = str(result.inserted_id)
        provider["_avatar_url"] = PROVIDER_AVATARS[idx % len(PROVIDER_AVATARS)]
        await db.users.update_one({"_id": result.inserted_id}, {"$set": {"avatar_url_external": provider["_avatar_url"]}})

        for svc in provider["services"]:
            await db.services.insert_one({
                "provider_id": provider_id,
                "title": svc["title"],
                "description": svc["description"],
                "category": svc["category"],
                "price": svc["price"],
                "price_unit": svc["price_unit"],
                "city": provider["city"],
                "images": [],
                "image_url_external": SAMPLE_IMAGES.get(svc["category"]),
                "is_active": True,
                "rating_avg": 0,
                "rating_count": 0,
                "created_at": datetime.now(timezone.utc),
            })

    for customer in SAMPLE_CUSTOMERS:
        await db.users.insert_one({
            "name": customer["name"],
            "email": customer["email"],
            "password_hash": hash_password(DEFAULT_PASSWORD),
            "role": "customer",
            "phone": "+1 555 020100",
            "city": customer["city"],
            "address": f"22 Oak Avenue, {customer['city']}",
            "avatar_path": None,
            "bio": None,
            "is_blocked": False,
            "is_verified": False,
            "rating_avg": 0,
            "rating_count": 0,
            "created_at": datetime.now(timezone.utc),
        })
