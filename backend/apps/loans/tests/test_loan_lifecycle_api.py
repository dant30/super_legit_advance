from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.customers.models import Customer
from apps.loans.models import Loan


User = get_user_model()


class LoanLifecycleAPITestCase(APITestCase):
    def setUp(self):
        self.staff_user = User.objects.create_user(
            email="staff-loans@test.com",
            phone_number="+254700100200",
            password="TestPass123!",
            role="admin",
            is_staff=True,
            is_active=True,
        )
        self.client.force_authenticate(user=self.staff_user)

        self.customer = Customer.objects.create(
            first_name="Jane",
            last_name="Borrower",
            date_of_birth=date(1992, 5, 14),
            gender="F",
            marital_status="SINGLE",
            id_type="NATIONAL_ID",
            id_number="90000001",
            phone_number="+254711000001",
            physical_address="Nairobi CBD",
            county="Nairobi",
            sub_county="Starehe",
            status=Customer.STATUS_ACTIVE,
            credit_score=Decimal("700.00"),
            created_by=self.staff_user,
            updated_by=self.staff_user,
        )

    def _create_loan(self):
        payload = {
            "customer": self.customer.id,
            "loan_type": "BUSINESS",
            "purpose": "BUSINESS_CAPITAL",
            "purpose_description": "Stock purchase",
            "amount_requested": "12000.00",
            "term_months": 12,
            "interest_rate": "12.00",
            "interest_type": "FIXED",
            "repayment_frequency": "MONTHLY",
            "notes": "Initial application",
        }
        response = self.client.post("/api/loans/create/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response_data = response.data or {}
        if "id" in response_data:
            return response_data["id"]
        if isinstance(response_data.get("data"), dict) and "id" in response_data["data"]:
            return response_data["data"]["id"]
        return Loan.objects.latest("created_at").id

    def test_full_loan_lifecycle_create_view_update_approve_disburse(self):
        loan_id = self._create_loan()

        detail_response = self.client.get(f"/api/loans/{loan_id}/")
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["status"], "PENDING")

        update_response = self.client.patch(
            f"/api/loans/{loan_id}/",
            {"notes": "Updated after review"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        approve_response = self.client.post(
            f"/api/loans/{loan_id}/approve/",
            {"approved_amount": "11000.00"},
            format="json",
        )
        self.assertEqual(approve_response.status_code, status.HTTP_200_OK)

        disburse_response = self.client.post(
            f"/api/loans/{loan_id}/disburse/",
            {"disbursement_amount": "10000.00"},
            format="json",
        )
        self.assertEqual(disburse_response.status_code, status.HTTP_200_OK)

        loan = Loan.objects.get(id=loan_id)
        self.assertEqual(loan.status, "ACTIVE")
        self.assertEqual(str(loan.amount_approved), "11000.00")
        self.assertEqual(str(loan.amount_disbursed), "10000.00")

    def test_reject_loan_from_pending(self):
        loan_id = self._create_loan()
        reject_response = self.client.post(
            f"/api/loans/{loan_id}/reject/",
            {"rejection_reason": "Insufficient documented income history."},
            format="json",
        )
        self.assertEqual(reject_response.status_code, status.HTTP_200_OK)

        loan = Loan.objects.get(id=loan_id)
        self.assertEqual(loan.status, "REJECTED")
