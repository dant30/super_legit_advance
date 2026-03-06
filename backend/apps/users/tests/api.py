from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.users.models import StaffProfile


User = get_user_model()


class StaffProfileLifecycleAPITestCase(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            email="admin-staff@test.com",
            phone_number="+254700440001",
            password="TestPass123!",
            role="admin",
            is_staff=True,
            is_active=True,
        )
        self.client.force_authenticate(user=self.admin_user)

        self.staff_user = User.objects.create_user(
            email="staff-member@test.com",
            phone_number="+254700440002",
            password="TestPass123!",
            role="staff",
            is_staff=True,
            is_active=True,
        )
        self.supervisor_user = User.objects.create_user(
            email="supervisor@test.com",
            phone_number="+254700440003",
            password="TestPass123!",
            role="admin",
            is_staff=True,
            is_active=True,
        )

        # Signals auto-create staff profiles for staff users; remove so create lifecycle
        # validates the explicit API contract.
        StaffProfile.objects.filter(user=self.staff_user).delete()
        StaffProfile.objects.filter(user=self.supervisor_user).delete()

    def test_staff_profile_lifecycle_create_retrieve_update_assign_supervisor_performance_delete(self):
        create_payload = {
            "user_id": str(self.staff_user.id),
            "employee_id": "EMP-STAFF-001",
            "department": "Operations",
            "position": "Loan officer",
            "hire_date": "2026-03-01",
            "employment_type": "full_time",
            "office_location": "HQ",
            "work_phone": "+254700440010",
            "work_email": "staff.member@company.test",
            "approval_tier": "junior",
            "permissions": {"export_reports": True},
            "work_schedule": {"mon": "08:00-17:00"},
            "emergency_contact_name": "Jane Contact",
            "emergency_contact_phone": "+254700440020",
            "emergency_contact_relationship": "Sibling",
            "notes": "Lifecycle staff profile",
        }
        create_response = self.client.post("/api/users/staff-profiles/", create_payload, format="json")
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        response_data = create_response.data or {}
        if "id" in response_data:
            profile_id = response_data["id"]
        elif isinstance(response_data.get("data"), dict) and "id" in response_data["data"]:
            profile_id = response_data["data"]["id"]
        elif isinstance(response_data.get("staff_profile"), dict) and "id" in response_data["staff_profile"]:
            profile_id = response_data["staff_profile"]["id"]
        else:
            profile_id = str(StaffProfile.objects.get(user=self.staff_user).id)

        list_response = self.client.get("/api/users/staff-profiles/")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        list_data = list_response.data or {}
        if isinstance(list_data.get("results"), list):
            self.assertGreaterEqual(len(list_data["results"]), 1)
        elif isinstance(list_data.get("data"), dict) and isinstance(list_data["data"].get("results"), list):
            self.assertGreaterEqual(len(list_data["data"]["results"]), 1)
        else:
            self.assertTrue(bool(list_data))

        detail_response = self.client.get(f"/api/users/staff-profiles/{profile_id}/")
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["employee_id"], "EMP-STAFF-001")

        update_response = self.client.patch(
            f"/api/users/staff-profiles/{profile_id}/",
            {
                "department": "Risk",
                "position": "Senior officer",
                "can_approve_loans": True,
                "max_loan_approval_amount": "150000.00",
            },
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["department"], "Risk")
        self.assertTrue(update_response.data["can_approve_loans"])

        assign_response = self.client.post(
            f"/api/users/staff-profiles/{profile_id}/assign-supervisor/",
            {"supervisor_id": str(self.supervisor_user.id)},
            format="json",
        )
        self.assertEqual(assign_response.status_code, status.HTTP_200_OK)
        assign_data = assign_response.data.get("data", assign_response.data)
        self.assertEqual(str(assign_data["supervisor"]), str(self.supervisor_user.id))

        performance_response = self.client.post(
            f"/api/users/staff-profiles/{profile_id}/update-performance/",
            {"rating": "4.7", "review_date": "2026-03-06"},
            format="json",
        )
        self.assertEqual(performance_response.status_code, status.HTTP_200_OK)
        performance_data = performance_response.data.get("data", performance_response.data)
        self.assertEqual(str(performance_data["performance_rating"]), "4.70")

        stats_response = self.client.get("/api/users/staff-profiles/stats/")
        self.assertEqual(stats_response.status_code, status.HTTP_200_OK)
        stats_data = stats_response.data.get("data", stats_response.data)
        self.assertIn("total_staff", stats_data)

        delete_response = self.client.delete(f"/api/users/staff-profiles/{profile_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
