from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import RegisterSerializer


class LoginView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = TokenObtainPairSerializer.get_token(user)
        return Response(
            {
                "user": {"id": user.id, "username": user.username, "email": user.email},
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def me_view(request):
    return Response(
        {"id": request.user.id, "username": request.user.username, "email": request.user.email}
    )
