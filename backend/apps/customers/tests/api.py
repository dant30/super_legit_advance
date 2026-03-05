from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.customers.models import Customer


User = get_user_model()


class CustomerLifecycleAPITestCase(APITestCase):
    def setUp(self):
        self.staff_user = User.objects.create_user(
            email="staff-customers@test.com",
            phone_number="+254700210001",
            password="TestPass123!",
            role="admin",
            is_staff=True,
            is_active=True,
        )
        self.client.force_authenticate(user=self.staff_user)

    def _create_customer(self):
        payload = {
            "first_name": "Mary",
            "middle_name": "A",
            "last_name": "Kariuki",
            "date_of_birth": "1993-05-12",
            "gender": "F",
            "marital_status": "SINGLE",
            "id_type": "NATIONAL_ID",
            "id_number": "91020001",
            "nationality": "Kenyan",
            "phone_number": "+254711223344",
            "confirm_phone_number": "+254711223344",
            "email": "mary.kariuki@test.com",
            "confirm_email": "mary.kariuki@test.com",
            "physical_address": "Nairobi CBD",
            "county": "Nairobi",
            "sub_county": "Starehe",
            "ward": "N/A",
            "notes": "Lifecycle test seed",
        }
        response = self.client.post("/api/customers/create/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response_data = response.data or {}
        if isinstance(response_data, dict) and "id" in response_data:
            return response_data["id"]
        if isinstance(response_data.get("data"), dict) and "id" in response_data["data"]:
            return response_data["data"]["id"]
        return Customer.objects.latest("created_at").id

    def test_customer_lifecycle_create_retrieve_update_blacklist_activate(self):
        customer_id = self._create_customer()

        detail_response = self.client.get(f"/api/customers/{customer_id}/")
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["status"], Customer.STATUS_ACTIVE)
        self.assertIn("loan_statistics", detail_response.data)

        update_payload = {
            "first_name": "Maryanne",
            "physical_address": "Westlands, Nairobi",
            "county": "Nairobi",
            "sub_county": "Westlands",
            "status": Customer.STATUS_ACTIVE,
            "risk_level": Customer.RISK_LOW,
            "credit_score": "780.00",
        }
        update_response = self.client.patch(
            f"/api/customers/{customer_id}/",
            update_payload,
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        refreshed_customer = Customer.objects.get(id=customer_id)
        self.assertEqual(refreshed_customer.first_name, "Maryanne")
        self.assertEqual(refreshed_customer.sub_county, "Westlands")
        self.assertEqual(refreshed_customer.risk_level, Customer.RISK_LOW)
        self.assertEqual(refreshed_customer.credit_score, Decimal("780.00"))

        blacklist_response = self.client.post(
            f"/api/customers/{customer_id}/blacklist/",
            {"reason": "Persistent KYC mismatch"},
            format="json",
        )
        self.assertEqual(blacklist_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            blacklist_response.data.get("customer", {}).get("status"),
            Customer.STATUS_BLACKLISTED,
        )

        refreshed_customer.refresh_from_db()
        self.assertEqual(refreshed_customer.status, Customer.STATUS_BLACKLISTED)
        self.assertIn("Persistent KYC mismatch", refreshed_customer.notes)

        activate_response = self.client.post(
            f"/api/customers/{customer_id}/activate/",
            {},
            format="json",
        )
        self.assertEqual(activate_response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            activate_response.data.get("customer", {}).get("status"),
            Customer.STATUS_ACTIVE,
        )

        refreshed_customer.refresh_from_db()
        self.assertEqual(refreshed_customer.status, Customer.STATUS_ACTIVE)
