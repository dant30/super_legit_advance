from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from apps.notifications.models import Notification


User = get_user_model()


class NotificationLifecycleAPITestCase(APITestCase):
    def setUp(self):
        self.staff_user = User.objects.create_user(
            email="staff-notifications@test.com",
            phone_number="+254700330001",
            password="TestPass123!",
            role="admin",
            is_staff=True,
            is_active=True,
        )
        self.client.force_authenticate(user=self.staff_user)

    def _create_notification(self, suffix=1):
        payload = {
            "notification_type": "SYSTEM_ALERT",
            "channel": "IN_APP",
            "priority": "MEDIUM",
            "title": f"Lifecycle Notification {suffix}",
            "message": "Lifecycle test message",
            "recipient": str(self.staff_user.id),
            "recipient_name": "Lifecycle Staff",
            "recipient_phone": "+254700330001",
            "recipient_email": "staff-notifications@test.com",
        }
        response = self.client.post("/api/notifications/notifications/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        if isinstance(response.data, dict) and response.data.get("id"):
            return response.data["id"]
        return Notification.objects.latest("created_at").id

    def test_notification_lifecycle_create_list_send_mark_read_mark_all_read_delete(self):
        notification_id = self._create_notification(1)

        list_response = self.client.get("/api/notifications/notifications/?ordering=-created_at")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(list_response.data.get("count", 0), 1)

        detail_response = self.client.get(f"/api/notifications/notifications/{notification_id}/")
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.data["status"], "PENDING")

        send_response = self.client.post(f"/api/notifications/notifications/{notification_id}/send/", {}, format="json")
        self.assertEqual(send_response.status_code, status.HTTP_200_OK)

        mark_read_response = self.client.patch(
            f"/api/notifications/notifications/{notification_id}/mark-read/",
            {},
            format="json",
        )
        self.assertEqual(mark_read_response.status_code, status.HTTP_200_OK)
        self.assertEqual(mark_read_response.data["status"], "READ")

        self._create_notification(2)
        mark_all_response = self.client.post("/api/notifications/notifications/mark-all-read/", {}, format="json")
        self.assertEqual(mark_all_response.status_code, status.HTTP_200_OK)
        self.assertIn("marked_read", mark_all_response.data)

        stats_response = self.client.get("/api/notifications/stats/?days=7")
        self.assertEqual(stats_response.status_code, status.HTTP_200_OK)
        self.assertIn("overall", stats_response.data)
        self.assertIn("delivery_rate", stats_response.data["overall"])

        delete_response = self.client.delete(f"/api/notifications/notifications/{notification_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
