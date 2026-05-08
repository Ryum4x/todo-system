from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .models import Todo


class TodoAPITests(APITestCase):
    def setUp(self):
        self.todos_url = "/api/todos/"
        self.login_url = "/api/auth/login/"

        self.user = User.objects.create_user(username="alice", password="strongpass123")
        self.other_user = User.objects.create_user(username="bob", password="strongpass123")

        self.client = APIClient()
        self.client.post(
            self.login_url,
            {"username": "alice", "password": "strongpass123"},
            format="json",
        )

    def test_create_todo(self):
        response = self.client.post(
            self.todos_url,
            {"title": "Buy milk", "description": "2 liters", "completed": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Todo.objects.count(), 1)
        self.assertEqual(Todo.objects.first().owner, self.user)

    def test_list_returns_only_current_user_todos(self):
        Todo.objects.create(owner=self.user, title="Mine")
        Todo.objects.create(owner=self.other_user, title="Not mine")

        response = self.client.get(self.todos_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Mine")

    def test_search_filters_by_title(self):
        Todo.objects.create(owner=self.user, title="Write docs")
        Todo.objects.create(owner=self.user, title="Buy groceries")

        response = self.client.get(self.todos_url, {"search": "write"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "Write docs")

    def test_pagination_returns_page_sized_results(self):
        for idx in range(12):
            Todo.objects.create(owner=self.user, title=f"Task {idx}")

        response = self.client.get(self.todos_url, {"page": 1})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 12)
        self.assertEqual(len(response.data["results"]), 10)
        self.assertIsNotNone(response.data["next"])

    def test_update_patch_and_delete_todo(self):
        todo = Todo.objects.create(owner=self.user, title="Old", description="", completed=False)

        update_response = self.client.put(
            f"{self.todos_url}{todo.id}/",
            {"title": "Updated", "description": "new", "completed": True},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        patch_response = self.client.patch(
            f"{self.todos_url}{todo.id}/",
            {"completed": False},
            format="json",
        )
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)

        delete_response = self.client.delete(f"{self.todos_url}{todo.id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Todo.objects.filter(id=todo.id).exists())

    def test_cannot_access_another_users_todo(self):
        others_todo = Todo.objects.create(owner=self.other_user, title="Secret")

        response = self.client.get(f"{self.todos_url}{others_todo.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
