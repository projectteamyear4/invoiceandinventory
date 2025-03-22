from django.urls import path
from .views import register, get_user, login
from . import views
urlpatterns = [
    path('api/register/', register, name='register'),
    path('api/login/', login, name='login'),
    path('api/suppliers/create/', views.create_supplier, name='create_supplier'),
    path('api/suppliers/', views.list_suppliers, name='list_suppliers'),
    path('api/suppliers/<int:pk>/', views.supplier_detail, name='supplier_detail'),
    path('api/categories/', views.category_list_create, name='category_list_create'),
    path('api/categories/<int:pk>/', views.category_detail, name='category_detail'),
    path('api/products/', views.product_list_create, name='product_list_create'),
    path('api/products/<int:pk>/', views.product_detail, name='product_detail'),
    path('api/variants/', views.variant_list_create, name='variant_list_create'),
    path('api/variants/<int:pk>/', views.variant_detail, name='variant_detail'),
    path('api/warehouses/', views.warehouse_list_create, name='warehouse_list_create'),
    path('api/warehouses/<int:pk>/', views.warehouse_detail, name='warehouse_detail'),
    path('api/shelves/', views.shelf_list_create, name='shelf_list_create'),
    path('api/shelves/<int:pk>/', views.shelf_detail, name='shelf_detail'),
]