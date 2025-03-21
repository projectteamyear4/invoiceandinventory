from django.urls import path
from .views import register, get_user, login

urlpatterns = [
    path('api/register/', register, name='register'),
    path('api/login/', login, name='login'),
]