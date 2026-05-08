from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase


class AuthAPITests(APITestCase):
    def setUp(self):
        self.register_url = "/api/auth/register/"
        self.login_url = "/api/auth/login/"
        self.me_url = "/api/auth/me/"
        self.refresh_url = "/api/auth/refresh/"
        self.logout_url = "/api/auth/logout/"

    def test_register_creates_user_and_sets_auth_cookies(self):
        payload = {
            "username": "alice",
            "email": "alice@example.com",
            "password": "strongpass123",
        }

        response = self.client.post(self.register_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="alice").exists())
        self.assertIn("access_token", response.cookies)
        self.assertIn("refresh_token", response.cookies)

    def test_login_sets_auth_cookies(self):
        User.objects.create_user(username="alice", password="strongpass123")

        response = self.client.post(
            self.login_url,
            {"username": "alice", "password": "strongpass123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["detail"], "Login successful")
        self.assertIn("access_token", response.cookies)
        self.assertIn("refresh_token", response.cookies)

    def test_me_requires_authentication(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_current_user_when_authenticated_with_cookie(self):
        User.objects.create_user(username="alice", password="strongpass123")
        self.client.post(
            self.login_url,
            {"username": "alice", "password": "strongpass123"},
            format="json",
        )

        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "alice")

    def test_refresh_requires_refresh_cookie(self):
        response = self.client.post(self.refresh_url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_rotates_access_cookie(self):
        User.objects.create_user(username="alice", password="strongpass123")
        self.client.post(
            self.login_url,
            {"username": "alice", "password": "strongpass123"},
            format="json",
        )

        response = self.client.post(self.refresh_url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["detail"], "Token refreshed")
        self.assertIn("access_token", response.cookies)

    def test_logout_clears_auth_cookies(self):
        User.objects.create_user(username="alice", password="strongpass123")
        self.client.post(
            self.login_url,
            {"username": "alice", "password": "strongpass123"},
            format="json",
        )

        response = self.client.post(self.logout_url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access_token", response.cookies)
        self.assertIn("refresh_token", response.cookies)
