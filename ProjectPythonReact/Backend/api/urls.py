# inventory/urls.py
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
    path('api/shelves/', views.shelf_list_create, name='shelf_list_create'),
    path('api/shelves/<int:pk>/', views.shelf_detail, name='shelf_detail'),
    path('api/warehouses/', views.warehouse_list_create, name='warehouse_list_create'),
    path('api/warehouses/<int:pk>/', views.warehouse_detail, name='warehouse_detail'),
    path('api/purchases/', views.purchase_list, name='purchase_list'),  # Fixed view name
    path('api/purchases/bulk/', views.purchase_bulk_create, name='purchase_bulk_create'),
    path('api/purchases/<int:pk>/', views.purchase_detail, name='purchase_detail'),
    path('api/stock-movements/', views.stock_movement_list, name='stock_movement_list'),
    path('api/stock-movements/<int:pk>/', views.stock_movement_detail, name='stock_movement_detail'),
    path('api/customers/', views.customer_list_create, name='customer_list_create'),  # Add this
    path('api/customers/<int:pk>/', views.customer_detail, name='customer_detail'),  # Add this
    path('api/delivery-methods/', views.delivery_method_list_create, name='delivery_method_list_create'),
    path('api/delivery-methods/<int:pk>/', views.delivery_method_detail, name='delivery_method_detail'),
    path('api/invoices/', views.invoice_list_create, name='invoice_list_create'),
    path('api/invoices/<int:pk>/', views.invoice_detail, name='invoice_detail'),
    path('api/invoices/list/', views.invoice_list, name='invoice-list'),
    # Invoice Item (New)
    path('api/invoice-items/<int:pk>/', views.invoice_item_detail, name='invoice_item_detail'),
    path('api/purchases/bulk/', views.BulkPurchaseCreateView.as_view(), name='bulk-purchase-create'),
]