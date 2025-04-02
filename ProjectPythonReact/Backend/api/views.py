from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .serializers import RegisterSerializer, UserDetailSerializer, LoginSerializer
from django.contrib.auth.models import User
from rest_framework import viewsets
from .models import Supplier, Product, ProductVariant, Category, Warehouse,Shelf,Purchase,StockMovement,Customer,DeliveryMethod,Invoice,InvoiceItem
from .serializers import SupplierSerializer, ProductSerializer, ProductVariantSerializer, CategorySerializer, WarehouseSerializer,ShelfSerializer,PurchaseSerializer,StockMovementSerializer,StockMovementSerializer,CustomerSerializer,DeliveryMethodSerializer,InvoiceSerializer, InvoiceItemSerializer
import logging

logger = logging.getLogger(__name__)
@api_view(['POST'])
@permission_classes([])  # Allow anyone
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'User registered successfully!'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        serializer = UserDetailSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([])  # Allow anyone
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Supplier Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_supplier(request):
    serializer = SupplierSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_suppliers(request):
    suppliers = Supplier.objects.all()
    serializer = SupplierSerializer(suppliers, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def supplier_detail(request, pk):
    try:
        supplier = Supplier.objects.get(pk=pk)
    except Supplier.DoesNotExist:
        return Response({'detail': 'Supplier not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = SupplierSerializer(supplier)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PATCH':
        serializer = SupplierSerializer(supplier, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        supplier.delete()
        return Response({'detail': 'Supplier deleted'}, status=status.HTTP_204_NO_CONTENT)

# Category Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def category_list_create(request):
    if request.method == 'GET':
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def category_detail(request, pk):
    try:
        category = Category.objects.get(pk=pk)
    except Category.DoesNotExist:
        return Response({'detail': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CategorySerializer(category)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PATCH':
        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        category.delete()
        return Response({'detail': 'Category deleted'}, status=status.HTTP_204_NO_CONTENT)

# Product Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def product_list_create(request):
    if request.method == 'GET':
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        serializer = ProductSerializer(product, data=request.data, partial=True)  # Changed to partial=True
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        product.delete()
        return Response({'detail': 'Product deleted'}, status=status.HTTP_204_NO_CONTENT)

# Product Variant Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def variant_list_create(request):
    if request.method == 'GET':
        variants = ProductVariant.objects.all()
        serializer = ProductVariantSerializer(variants, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = ProductVariantSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])  # Changed PATCH to PUT
@permission_classes([IsAuthenticated])
def variant_detail(request, pk):
    try:
        variant = ProductVariant.objects.get(pk=pk)
    except ProductVariant.DoesNotExist:
        return Response({'detail': 'Variant not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProductVariantSerializer(variant)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':  # Changed to PUT
        serializer = ProductVariantSerializer(variant, data=request.data, partial=True)  # Added partial=True
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        variant.delete()
        return Response({'detail': 'Variant deleted'}, status=status.HTTP_204_NO_CONTENT)

# Warehouse Views (unchanged, just for reference)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def warehouse_list_create(request):
    if request.method == 'GET':
        warehouses = Warehouse.objects.all()
        serializer = WarehouseSerializer(warehouses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = WarehouseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def warehouse_detail(request, pk):
    try:
        warehouse = Warehouse.objects.get(pk=pk)
    except Warehouse.DoesNotExist:
        return Response({'detail': 'Warehouse not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = WarehouseSerializer(warehouse)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        serializer = WarehouseSerializer(warehouse, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        warehouse.delete()
        return Response({'detail': 'Warehouse deleted'}, status=status.HTTP_204_NO_CONTENT)
#shef views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def shelf_list_create(request):
    if request.method == 'GET':
        shelves = Shelf.objects.all()
        serializer = ShelfSerializer(shelves, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = ShelfSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def shelf_detail(request, pk):
    try:
        shelf = Shelf.objects.get(pk=pk)
    except Shelf.DoesNotExist:
        return Response({'detail': 'Shelf not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ShelfSerializer(shelf)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        serializer = ShelfSerializer(shelf, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        shelf.delete()
        return Response({'detail': 'Shelf deleted'}, status=status.HTTP_204_NO_CONTENT)
    #purchase views
@api_view(['GET', 'POST'])
def purchase_list(request):
    if request.method == 'GET':
        purchases = Purchase.objects.all()
        serializer = PurchaseSerializer(purchases, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = PurchaseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def purchase_bulk_create(request):
    if request.method == 'POST':
        serializer = PurchaseSerializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def purchase_detail(request, pk):
    try:
        purchase = Purchase.objects.get(pk=pk)
    except Purchase.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = PurchaseSerializer(purchase)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = PurchaseSerializer(purchase, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        purchase.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
@api_view(['GET'])
def stock_movement_list(request):
    movements = StockMovement.objects.all()
    serializer = StockMovementSerializer(movements, many=True)
    return Response(serializer.data)
@api_view(['GET', 'PATCH'])
def stock_movement_detail(request, pk):
    try:
        movement = StockMovement.objects.get(pk=pk)
    except StockMovement.DoesNotExist:
        return Response({'error': 'Stock movement not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = StockMovementSerializer(movement)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = StockMovementSerializer(movement, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    # Customer Views (New)
# Customer Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def customer_list_create(request):
    if request.method == 'GET':
        customers = Customer.objects.all()
        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def customer_detail(request, pk):
    try:
        customer = Customer.objects.get(pk=pk)
    except Customer.DoesNotExist:
        return Response({'detail': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = CustomerSerializer(customer)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        serializer = CustomerSerializer(customer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        customer.delete()
        return Response({'detail': 'Customer deleted'}, status=status.HTTP_204_NO_CONTENT)
    # Delivery Method Views (New)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def delivery_method_list_create(request):
    if request.method == 'GET':
        delivery_methods = DeliveryMethod.objects.all()
        serializer = DeliveryMethodSerializer(delivery_methods, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = DeliveryMethodSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def delivery_method_detail(request, pk):
    try:
        delivery_method = DeliveryMethod.objects.get(pk=pk)
    except DeliveryMethod.DoesNotExist:
        return Response({'detail': 'Delivery method not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = DeliveryMethodSerializer(delivery_method)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        serializer = DeliveryMethodSerializer(delivery_method, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        delivery_method.delete()
        return Response({'detail': 'Delivery method deleted'}, status=status.HTTP_204_NO_CONTENT)
# Invoice Views (New)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def invoice_list_create(request):
    if request.method == 'GET':
        invoices = Invoice.objects.all()
        serializer = InvoiceSerializer(invoices, many=True)
        logger.info(f"User {request.user.username} retrieved list of invoices")
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = InvoiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"User {request.user.username} created invoice {serializer.data.get('id')}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.error(f"User {request.user.username} failed to create invoice: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# InvoiceItem Views (New)
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def invoice_item_detail(request, pk):
    try:
        invoice_item = InvoiceItem.objects.get(pk=pk)
    except InvoiceItem.DoesNotExist:
        logger.error(f"User {request.user.username} attempted to access non-existent invoice item {pk}")
        return Response({'detail': 'Invoice item not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = InvoiceItemSerializer(invoice_item)
        logger.info(f"User {request.user.username} retrieved invoice item {pk}")
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PUT':
        serializer = InvoiceItemSerializer(invoice_item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"User {request.user.username} updated invoice item {pk}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.error(f"User {request.user.username} failed to update invoice item {pk}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        invoice_item.delete()
        logger.info(f"User {request.user.username} deleted invoice item {pk}")
        return Response({'detail': 'Invoice item deleted'}, status=status.HTTP_204_NO_CONTENT)
# Invoice Views (New)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def invoice_list(request):
    if request.method == 'GET':
        try:
            invoices = Invoice.objects.all()
            logger.debug(f"Queried invoices: {invoices.count()} found")
            serializer = InvoiceSerializer(invoices, many=True)
            logger.info(f"User {request.user.username} retrieved list of invoices")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"User {request.user.username} encountered an error while retrieving invoices: {str(e)}", exc_info=True)
            return Response({'detail': f'Error retrieving invoices: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'POST':
        try:
            serializer = InvoiceSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                logger.info(f"User {request.user.username} created a new invoice with ID {serializer.data['id']}")
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            logger.error(f"User {request.user.username} failed to create invoice: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"User {request.user.username} encountered an error while creating invoice: {str(e)}", exc_info=True)
            return Response({'detail': f'Error creating invoice: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def invoice_detail(request, pk):
    try:
        invoice = Invoice.objects.get(pk=pk)
    except Invoice.DoesNotExist:
        logger.error(f"User {request.user.username} attempted to access non-existent invoice {pk}")
        return Response({'detail': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = InvoiceSerializer(invoice)
        logger.info(f"User {request.user.username} retrieved invoice {pk}")
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'PATCH':
        logger.info(f"PATCH request for invoice {pk} with data: {request.data}")
        serializer = InvoiceSerializer(invoice, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            logger.info(f"User {request.user.username} updated status of invoice {pk} to {request.data.get('status')}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.error(f"User {request.user.username} failed to patch invoice {pk}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# InvoiceViewSet (New)
class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    def perform_update(self, serializer):
        try:
        
            serializer.save()
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
