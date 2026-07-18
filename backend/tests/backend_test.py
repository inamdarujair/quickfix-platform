"""Backend API tests for QuickFix marketplace."""
import os
import io
import time
import uuid
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE:
    # Fallback: read frontend .env directly (test env sometimes lacks var)
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE = line.split("=", 1)[1].strip()
                    break
    except Exception:
        pass
assert BASE, "REACT_APP_BACKEND_URL missing"
BASE = BASE.rstrip("/")
API = f"{BASE}/api"


# ---------------- Helpers / fixtures ---------------- #

def _session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _login(email, password):
    s = _session()
    r = s.post(f"{API}/auth/login", json={"email": email, "password": password})
    return s, r


@pytest.fixture(scope="session")
def admin_session():
    s, r = _login("admin@quickfix.com", "Admin@123")
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return s


@pytest.fixture(scope="session")
def provider_session():
    s, r = _login("marcus.plumbing@quickfix.com", "Password@123")
    assert r.status_code == 200, f"provider login failed: {r.text}"
    return s


@pytest.fixture(scope="session")
def customer_session():
    s, r = _login("jordan.customer@quickfix.com", "Password@123")
    assert r.status_code == 200, f"customer login failed: {r.text}"
    return s


# ---------------- Health / basics ---------------- #

def test_root():
    r = requests.get(f"{API}/")
    assert r.status_code == 200


def test_categories():
    r = requests.get(f"{API}/services/categories")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) and len(data) >= 10


# ---------------- Auth ---------------- #

def test_login_invalid():
    r = requests.post(f"{API}/auth/login", json={"email": "nobody@x.com", "password": "wrong"})
    assert r.status_code == 401


def test_login_seed_admin_sets_cookie():
    s, r = _login("admin@quickfix.com", "Admin@123")
    assert r.status_code == 200
    assert "access_token" in s.cookies.get_dict()
    body = r.json()
    assert body["role"] == "admin"
    assert "_id" not in body and "password_hash" not in body


def test_me_endpoint(customer_session):
    r = customer_session.get(f"{API}/auth/me")
    assert r.status_code == 200
    assert r.json()["role"] == "customer"


def test_register_customer_then_login():
    email = f"TEST_cust_{uuid.uuid4().hex[:8]}@example.com"
    s = _session()
    r = s.post(f"{API}/auth/register", json={"name": "Test C", "email": email, "password": "Password@123", "role": "customer"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["role"] == "customer"
    assert "id" in body
    # cookie set
    assert "access_token" in s.cookies.get_dict()
    # /me works
    me = s.get(f"{API}/auth/me")
    assert me.status_code == 200


def test_register_provider():
    email = f"TEST_prov_{uuid.uuid4().hex[:8]}@example.com"
    s = _session()
    r = s.post(f"{API}/auth/register", json={"name": "Test P", "email": email, "password": "Password@123", "role": "provider"})
    assert r.status_code == 200
    assert r.json()["role"] == "provider"


def test_register_admin_forbidden():
    s = _session()
    r = s.post(f"{API}/auth/register", json={"name": "xx", "email": f"TEST_a_{uuid.uuid4().hex[:6]}@x.com", "password": "Password@123", "role": "admin"})
    # Should reject: router raises 400, pydantic may raise 422 for enum
    assert r.status_code in (400, 422)


def test_logout(customer_session):
    # Use a fresh login not shared to avoid killing other tests
    s, _ = _login("jordan.customer@quickfix.com", "Password@123")
    r = s.post(f"{API}/auth/logout")
    assert r.status_code == 200


# ---------------- Services listing ---------------- #

def test_list_services():
    r = requests.get(f"{API}/services", params={"limit": 5})
    assert r.status_code == 200
    d = r.json()
    assert "items" in d and "total" in d
    assert len(d["items"]) > 0
    svc = d["items"][0]
    assert "id" in svc and "_id" not in svc
    assert svc["is_active"] is True
    assert "provider" in svc


def test_list_services_filters():
    r = requests.get(f"{API}/services", params={"category": "plumbing", "city": "Austin", "sort": "price_asc"})
    assert r.status_code == 200
    d = r.json()
    for s in d["items"]:
        assert s["category"] == "plumbing"


def test_get_service_detail():
    lst = requests.get(f"{API}/services", params={"limit": 1}).json()["items"]
    svc_id = lst[0]["id"]
    r = requests.get(f"{API}/services/{svc_id}")
    assert r.status_code == 200
    d = r.json()
    assert d["id"] == svc_id
    assert "reviews" in d
    assert "provider" in d


def test_get_service_404():
    r = requests.get(f"{API}/services/notreal")
    assert r.status_code == 404


# ---------------- Provider service CRUD ---------------- #

@pytest.fixture(scope="session")
def created_service(provider_session):
    payload = {
        "title": "TEST_Service_" + uuid.uuid4().hex[:6],
        "description": "Test service description for automated tests",
        "category": "plumbing",
        "price": 99.5,
        "price_unit": "fixed",
        "city": "Austin",
    }
    r = provider_session.post(f"{API}/services", json=payload)
    assert r.status_code == 200, r.text
    svc = r.json()
    assert svc["title"] == payload["title"]
    return svc


def test_provider_my_services(provider_session, created_service):
    r = provider_session.get(f"{API}/provider/services")
    assert r.status_code == 200
    ids = [s["id"] for s in r.json()]
    assert created_service["id"] in ids


def test_update_service(provider_session, created_service):
    r = provider_session.put(f"{API}/services/{created_service['id']}", json={"price": 123.4})
    assert r.status_code == 200
    assert r.json()["price"] == 123.4
    # verify persisted via GET
    g = requests.get(f"{API}/services/{created_service['id']}")
    assert g.json()["price"] == 123.4


def test_customer_cannot_create_service(customer_session):
    r = customer_session.post(f"{API}/services", json={
        "title": "Bad", "description": "x" * 15, "category": "plumbing",
        "price": 10, "city": "Austin"
    })
    assert r.status_code == 403


def test_provider_stats(provider_session):
    r = provider_session.get(f"{API}/provider/stats")
    assert r.status_code == 200
    d = r.json()
    for k in ["total_services", "pending_bookings", "completed_bookings", "earnings"]:
        assert k in d


# ---------------- Booking lifecycle ---------------- #

@pytest.fixture(scope="session")
def booking_lifecycle(customer_session, provider_session, created_service):
    """Customer books provider's service, provider confirms + completes,
    customer leaves review."""
    # Book
    from datetime import date, timedelta
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    r = customer_session.post(f"{API}/bookings", json={
        "service_id": created_service["id"],
        "scheduled_date": tomorrow,
        "scheduled_time": "10:00",
        "address": "123 TEST street",
    })
    assert r.status_code == 200, r.text
    booking = r.json()
    assert booking["status"] == "pending"
    return booking


def test_booking_appears_in_customer_list(customer_session, booking_lifecycle):
    r = customer_session.get(f"{API}/bookings/my")
    assert r.status_code == 200
    ids = [b["id"] for b in r.json()]
    assert booking_lifecycle["id"] in ids


def test_provider_cannot_book(provider_session, created_service):
    from datetime import date, timedelta
    r = provider_session.post(f"{API}/bookings", json={
        "service_id": created_service["id"],
        "scheduled_date": (date.today() + timedelta(days=1)).isoformat(),
        "scheduled_time": "10:00",
        "address": "123 x street",
    })
    assert r.status_code == 403


def test_unauth_cannot_book(created_service):
    from datetime import date, timedelta
    r = requests.post(f"{API}/bookings", json={
        "service_id": created_service["id"],
        "scheduled_date": (date.today() + timedelta(days=1)).isoformat(),
        "scheduled_time": "10:00",
        "address": "1234",
    })
    assert r.status_code == 401


def test_provider_confirms_and_completes(provider_session, booking_lifecycle):
    bid = booking_lifecycle["id"]
    r = provider_session.put(f"{API}/provider/bookings/{bid}/status", json={"status": "confirmed"})
    assert r.status_code == 200
    assert r.json()["status"] == "confirmed"
    r = provider_session.put(f"{API}/provider/bookings/{bid}/status", json={"status": "completed"})
    assert r.status_code == 200
    assert r.json()["status"] == "completed"


def test_review_completed_booking(customer_session, booking_lifecycle, created_service):
    r = customer_session.post(f"{API}/reviews", json={
        "booking_id": booking_lifecycle["id"], "rating": 5, "comment": "Great job!"
    })
    assert r.status_code == 200, r.text
    # rating recalculated on service
    svc = requests.get(f"{API}/services/{created_service['id']}").json()
    assert svc["rating_count"] >= 1
    assert svc["rating_avg"] >= 1


def test_review_duplicate_forbidden(customer_session, booking_lifecycle):
    r = customer_session.post(f"{API}/reviews", json={
        "booking_id": booking_lifecycle["id"], "rating": 4, "comment": "again"
    })
    assert r.status_code == 400


def test_cancel_pending_booking_flow(customer_session, created_service):
    from datetime import date, timedelta
    r = customer_session.post(f"{API}/bookings", json={
        "service_id": created_service["id"],
        "scheduled_date": (date.today() + timedelta(days=2)).isoformat(),
        "scheduled_time": "11:00",
        "address": "cancel st",
    })
    assert r.status_code == 200
    bid = r.json()["id"]
    c = customer_session.put(f"{API}/bookings/{bid}/cancel")
    assert c.status_code == 200
    assert c.json()["status"] == "cancelled"


# ---------------- Profile update ---------------- #

def test_profile_update_persists(customer_session):
    new_phone = "555" + uuid.uuid4().hex[:6]
    r = customer_session.put(f"{API}/users/profile", json={"phone": new_phone, "city": "Austin"})
    assert r.status_code == 200
    assert r.json()["phone"] == new_phone
    me = customer_session.get(f"{API}/auth/me").json()
    assert me["phone"] == new_phone


# ---------------- Admin ---------------- #

def test_admin_stats(admin_session):
    r = admin_session.get(f"{API}/admin/stats")
    assert r.status_code == 200
    d = r.json()
    for k in ["total_customers", "total_providers", "total_services", "revenue", "bookings_by_status"]:
        assert k in d


def test_admin_users_list(admin_session):
    r = admin_session.get(f"{API}/admin/users", params={"role": "provider"})
    assert r.status_code == 200
    users = r.json()
    assert len(users) > 0
    assert all(u["role"] == "provider" for u in users)


def test_admin_block_unblock(admin_session):
    # Register a temp user we can block
    email = f"TEST_blk_{uuid.uuid4().hex[:6]}@x.com"
    reg = requests.post(f"{API}/auth/register", json={"name": "blk", "email": email, "password": "Password@123", "role": "customer"})
    uid = reg.json()["id"]
    r = admin_session.put(f"{API}/admin/users/{uid}/toggle-block")
    assert r.status_code == 200
    assert r.json()["is_blocked"] is True
    # blocked user cannot log in
    _, lg = _login(email, "Password@123")
    assert lg.status_code == 403
    # unblock
    r2 = admin_session.put(f"{API}/admin/users/{uid}/toggle-block")
    assert r2.json()["is_blocked"] is False
    # cleanup
    admin_session.delete(f"{API}/admin/users/{uid}")


def test_admin_cannot_block_admin(admin_session):
    admins = admin_session.get(f"{API}/admin/users", params={"role": "admin"}).json()
    if admins:
        r = admin_session.put(f"{API}/admin/users/{admins[0]['id']}/toggle-block")
        assert r.status_code == 400


def test_admin_bookings_list(admin_session):
    r = admin_session.get(f"{API}/admin/bookings")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ---------------- Admin Reviews (delete + rating recalc) ---------------- #

@pytest.fixture(scope="session")
def review_service_and_booking(customer_session, provider_session):
    """Create a fresh service + completed booking + review dedicated to review-delete tests."""
    from datetime import date, timedelta
    payload = {
        "title": "TEST_ReviewSvc_" + uuid.uuid4().hex[:6],
        "description": "Test service for review deletion tests",
        "category": "plumbing",
        "price": 50,
        "price_unit": "fixed",
        "city": "Austin",
    }
    svc = provider_session.post(f"{API}/services", json=payload).json()
    booking = customer_session.post(f"{API}/bookings", json={
        "service_id": svc["id"],
        "scheduled_date": (date.today() + timedelta(days=3)).isoformat(),
        "scheduled_time": "09:00",
        "address": "review test address",
    }).json()
    provider_session.put(f"{API}/provider/bookings/{booking['id']}/status", json={"status": "confirmed"})
    provider_session.put(f"{API}/provider/bookings/{booking['id']}/status", json={"status": "completed"})
    review = customer_session.post(f"{API}/reviews", json={
        "booking_id": booking["id"], "rating": 3, "comment": "TEST review for deletion"
    }).json()
    return {"service": svc, "booking": booking, "review": review}


def test_admin_reviews_list(admin_session, review_service_and_booking):
    r = admin_session.get(f"{API}/admin/reviews")
    assert r.status_code == 200
    reviews = r.json()
    assert isinstance(reviews, list)
    ids = [rv["id"] for rv in reviews]
    assert review_service_and_booking["review"]["id"] in ids
    match = next(rv for rv in reviews if rv["id"] == review_service_and_booking["review"]["id"])
    assert match["service_title"] == review_service_and_booking["service"]["title"]
    assert "_id" not in match


def test_admin_reviews_list_non_admin_forbidden(customer_session):
    r = customer_session.get(f"{API}/admin/reviews")
    assert r.status_code == 403


def test_delete_review_non_admin_forbidden(customer_session, review_service_and_booking):
    review_id = review_service_and_booking["review"]["id"]
    r = customer_session.delete(f"{API}/reviews/{review_id}")
    assert r.status_code == 403


def test_delete_review_provider_forbidden(provider_session, review_service_and_booking):
    review_id = review_service_and_booking["review"]["id"]
    r = provider_session.delete(f"{API}/reviews/{review_id}")
    assert r.status_code == 403


def test_delete_review_admin_recalculates_rating(admin_session, review_service_and_booking):
    review_id = review_service_and_booking["review"]["id"]
    service_id = review_service_and_booking["service"]["id"]

    # sanity: rating currently reflects the single review (3.0/1)
    before = requests.get(f"{API}/services/{service_id}").json()
    assert before["rating_count"] == 1
    assert before["rating_avg"] == 3.0

    r = admin_session.delete(f"{API}/reviews/{review_id}")
    assert r.status_code == 200
    assert "message" in r.json()

    after = requests.get(f"{API}/services/{service_id}").json()
    assert after["rating_count"] == 0
    assert after["rating_avg"] == 0

    # review should no longer show for the service
    remaining = requests.get(f"{API}/reviews/service/{service_id}").json()
    assert review_id not in [rv["id"] for rv in remaining]


def test_delete_review_404_after_deletion(admin_session, review_service_and_booking):
    review_id = review_service_and_booking["review"]["id"]
    r = admin_session.delete(f"{API}/reviews/{review_id}")
    assert r.status_code == 404


def test_delete_review_unauth(review_service_and_booking):
    r = requests.delete(f"{API}/reviews/{review_service_and_booking['review']['id']}")
    assert r.status_code == 401


# ---------------- Delete service (cleanup) ---------------- #

def test_delete_service_soft(provider_session, created_service):
    r = provider_session.delete(f"{API}/services/{created_service['id']}")
    assert r.status_code == 200
    # Should no longer appear in public list
    lst = requests.get(f"{API}/services", params={"limit": 200}).json()["items"]
    assert created_service["id"] not in [s["id"] for s in lst]
