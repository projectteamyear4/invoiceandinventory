from django.urls import path
from .views import register, get_user, login
from . import views
urlpatterns = [
    path('api/register/', register, name='register'),
    path('api/login/', login, name='login'),
    path('api/suppliers/create/', views.create_supplier, name='create_supplier'),
    path('api/suppliers/', views.list_suppliers, name='list_suppliers'),
]