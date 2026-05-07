from django.urls import path

from .views import LoginView, logout_view, me_view, refresh_view, register_view

urlpatterns = [
    path("register/", register_view, name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", refresh_view, name="token-refresh"),
    path("logout/", logout_view, name="logout"),
    path("me/", me_view, name="me"),
]
