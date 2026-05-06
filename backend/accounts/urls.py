from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import LoginView, me_view, register_view

urlpatterns = [
    path("register/", register_view, name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", me_view, name="me"),
]
