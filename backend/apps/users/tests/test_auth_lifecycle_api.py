from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class AuthLifecycleAPITestCase(APITestCase):
    def setUp(self):
        self.password = "TestPass123!"
        self.user = User.objects.create_user(
            email="auth-lifecycle@test.com",
            phone_number="+254700550001",
            password=self.password,
            role="admin",
            is_staff=True,
            is_active=True,
            is_verified=True,
            email_verified=True,
            phone_verified=True,
        )

    def test_login_me_change_password_logout_and_refresh_lifecycle(self):
        login_response = self.client.post(
            "/api/users/auth/login/",
            {"email": self.user.email, "password": self.password},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_response.data)
        self.assertIn("refresh", login_response.data)
        self.assertIn("user", login_response.data)

        access = login_response.data["access"]
        refresh = login_response.data["refresh"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        me_response = self.client.get("/api/users/users/me/")
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertTrue(me_response.data.get("success"))
        self.assertEqual(str(me_response.data["data"]["id"]), str(self.user.id))

        change_response = self.client.post(
            "/api/users/users/change-password/",
            {
                "current_password": self.password,
                "new_password": "NewTestPass123!",
                "confirm_new_password": "NewTestPass123!",
            },
            format="json",
        )
        self.assertEqual(change_response.status_code, status.HTTP_200_OK)
        self.assertTrue(change_response.data.get("success"))

        old_login_response = self.client.post(
            "/api/users/auth/login/",
            {"email": self.user.email, "password": self.password},
            format="json",
        )
        self.assertEqual(old_login_response.status_code, status.HTTP_401_UNAUTHORIZED)

        new_login_response = self.client.post(
            "/api/users/auth/login/",
            {"email": self.user.email, "password": "NewTestPass123!"},
            format="json",
        )
        self.assertEqual(new_login_response.status_code, status.HTTP_200_OK)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {new_login_response.data['access']}")
        logout_response = self.client.post(
            "/api/users/auth/logout/",
            {"refresh": refresh},
            format="json",
        )
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)
        self.assertTrue(logout_response.data.get("success"))

        refresh_response = self.client.post(
            "/api/auth/token/refresh/",
            {"refresh": refresh},
            format="json",
        )
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_invalid_login_returns_401_not_500(self):
        invalid_login_response = self.client.post(
            "/api/users/auth/login/",
            {"email": self.user.email, "password": "WrongPass123!"},
            format="json",
        )
        self.assertEqual(invalid_login_response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotEqual(invalid_login_response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    def test_public_auth_recovery_endpoints_are_accessible_without_auth(self):
        self.client.credentials()

        request_reset_response = self.client.post(
            "/api/users/auth/password-reset/",
            {"email": self.user.email},
            format="json",
        )
        self.assertEqual(request_reset_response.status_code, status.HTTP_200_OK)
        self.assertTrue(request_reset_response.data.get("success"))

        request_reset_unknown_response = self.client.post(
            "/api/users/auth/password-reset/",
            {"email": "unknown-user@test.com"},
            format="json",
        )
        self.assertEqual(request_reset_unknown_response.status_code, status.HTTP_200_OK)
        self.assertTrue(request_reset_unknown_response.data.get("success"))

        resend_response = self.client.post(
            "/api/users/auth/resend-verification/",
            {"email": self.user.email},
            format="json",
        )
        self.assertEqual(resend_response.status_code, status.HTTP_200_OK)
        self.assertTrue(resend_response.data.get("success"))

        verify_invalid_response = self.client.post(
            "/api/users/auth/verify-email/",
            {"uid": "invalid", "token": "invalid"},
            format="json",
        )
        self.assertEqual(verify_invalid_response.status_code, status.HTTP_400_BAD_REQUEST)

        reset_confirm_invalid_response = self.client.post(
            "/api/users/auth/password-reset-confirm/",
            {
                "uid": "invalid",
                "token": "invalid",
                "new_password": "AnotherPass123!",
                "confirm_new_password": "AnotherPass123!",
            },
            format="json",
        )
        self.assertEqual(reset_confirm_invalid_response.status_code, status.HTTP_400_BAD_REQUEST)
