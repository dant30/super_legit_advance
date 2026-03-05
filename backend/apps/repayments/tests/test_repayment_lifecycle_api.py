from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.customers.models import Customer
from apps.loans.models import Loan
from apps.repayments.models import Repayment


User = get_user_model()


class RepaymentLifecycleAPITestCase(APITestCase):
    def setUp(self):
        self.staff_user = User.objects.create_user(
            email="staff-repayments@test.com",
            phone_number="+254700220001",
            password="TestPass123!",
            role="admin",
            is_staff=True,
            is_active=True,
        )
        self.client.force_authenticate(user=self.staff_user)

        self.customer = Customer.objects.create(
            first_name="Rehema",
            last_name="Njeri",
            date_of_birth=date(1990, 4, 2),
            gender="F",
            marital_status="SINGLE",
            id_type="NATIONAL_ID",
            id_number="91030001",
            phone_number="+254711300001",
            physical_address="Nairobi West",
            county="Nairobi",
            sub_county="Langata",
            status=Customer.STATUS_ACTIVE,
            credit_score=Decimal("710.00"),
            created_by=self.staff_user,
            updated_by=self.staff_user,
        )

        self.loan = Loan.objects.create(
            customer=self.customer,
            loan_type="BUSINESS",
            purpose="BUSINESS_CAPITAL",
            purpose_description="Working capital",
            amount_requested=Decimal("25000.00"),
            amount_approved=Decimal("25000.00"),
            amount_disbursed=Decimal("25000.00"),
            term_months=12,
            interest_rate=Decimal("12.00"),
            interest_type="FIXED",
            repayment_frequency="MONTHLY",
            status="ACTIVE",
            start_date=date.today() - timedelta(days=7),
            maturity_date=date.today() + timedelta(days=330),
            total_interest=Decimal("3000.00"),
            total_amount_due=Decimal("28000.00"),
            amount_paid=Decimal("0.00"),
            outstanding_balance=Decimal("28000.00"),
            installment_amount=Decimal("2333.33"),
            created_by=self.staff_user,
            updated_by=self.staff_user,
        )

    def _create_repayment(self, suffix=1):
        payload = {
            "loan": str(self.loan.id),
            "amount_due": "2500.00",
            "principal_amount": "2000.00",
            "interest_amount": "400.00",
            "penalty_amount": "50.00",
            "fee_amount": "50.00",
            "payment_method": "MPESA",
            "repayment_type": "FULL",
            "due_date": str(date.today() + timedelta(days=10 + suffix)),
            "scheduled_date": str(date.today() + timedelta(days=8 + suffix)),
            "payment_reference": f"REF-{suffix}",
            "notes": "Lifecycle repayment test",
        }
        response = self.client.post("/api/repayments/create/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response_data = response.data or {}
        if "id" in response_data:
            return response_data["id"]
        if isinstance(response_data.get("repayment"), dict) and "id" in response_data["repayment"]:
            return response_data["repayment"]["id"]
        return Repayment.objects.latest("created_at").id

    def test_repayment_lifecycle_create_retrieve_update_process_waive_cancel(self):
        repayment_id = self._create_repayment(1)

        detail_response = self.client.get(f"/api/repayments/{repayment_id}/")
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["status"], Repayment.STATUS_PENDING)

        update_response = self.client.patch(
            f"/api/repayments/{repayment_id}/",
            {"notes": "Updated notes from lifecycle test"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        process_response = self.client.post(
            f"/api/repayments/{repayment_id}/process/",
            {"amount": "1000.00", "payment_method": "CASH", "reference": "PROC-1"},
            format="json",
        )
        self.assertEqual(process_response.status_code, status.HTTP_200_OK)
        self.assertIn("repayment", process_response.data)

        processed = Repayment.objects.get(id=repayment_id)
        self.assertEqual(processed.status, Repayment.STATUS_PARTIAL)
        self.assertEqual(str(processed.amount_paid), "1000.00")

        waived_id = self._create_repayment(2)
        waive_response = self.client.post(
            f"/api/repayments/{waived_id}/waive/",
            {"amount": "200.00", "reason": "Promotional waiver"},
            format="json",
        )
        self.assertEqual(waive_response.status_code, status.HTTP_200_OK)
        self.assertIn("repayment", waive_response.data)

        cancelled_id = self._create_repayment(3)
        cancel_response = self.client.post(
            f"/api/repayments/{cancelled_id}/cancel/",
            {"reason": "Customer requested reversal"},
            format="json",
        )
        self.assertEqual(cancel_response.status_code, status.HTTP_200_OK)

        cancelled = Repayment.objects.get(id=cancelled_id)
        self.assertEqual(cancelled.status, Repayment.STATUS_CANCELLED)

        by_customer = self.client.get(f"/api/repayments/customer/{self.customer.id}/")
        self.assertEqual(by_customer.status_code, status.HTTP_200_OK)

        by_loan = self.client.get(f"/api/repayments/loan/{self.loan.id}/")
        self.assertEqual(by_loan.status_code, status.HTTP_200_OK)
