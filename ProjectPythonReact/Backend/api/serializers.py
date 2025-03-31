from django.contrib.auth.models import User
from rest_framework import serializers
from django.db import models
from django.db.models import Sum
from rest_framework import viewsets
from datetime import datetime
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Supplier, Product, ProductVariant, Category, Warehouse, Shelf, Purchase, StockMovement, Customer, DeliveryMethod, Invoice, InvoiceItem

# Existing RegisterSerializer
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True, validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': "Passwords do not match!"})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

# Existing UserDetailSerializer
class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

# New LoginSerializer
class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        refresh = self.get_token(self.user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        data['user'] = UserDetailSerializer(self.user).data
        return data

# Corrected SupplierSerializer (standalone)
class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact_person', 'phone', 'email', 'address', 'country']

# Corrected CategorySerializer (standalone)
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

# Purchase order serializer
class PurchaseSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_variant_info = serializers.CharField(source='product_variant.__str__', read_only=True)

    class Meta:
        model = Purchase
        fields = [
            'id', 'supplier', 'supplier_name', 'product', 'product_name',
            'product_variant', 'product_variant_info', 'batch_number',
            'quantity', 'purchase_price', 'purchase_date', 'total'
        ]

    def create(self, validated_data):
        # Create the purchase
        purchase = Purchase.objects.create(**validated_data)

        # Create a stock movement entry with warehouse and shelf as null
        StockMovement.objects.create(
            product=purchase.product,
            product_variant=purchase.product_variant,
            warehouse=None,  # Set to null
            shelf=None,     # Set to null
            movement_type='IN',
            quantity=purchase.quantity,
            purchase=purchase
        )
        return purchase

class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    variant_info = serializers.CharField(source='product_variant.__str__', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    shelf_name = serializers.CharField(source='shelf.shelf_name', read_only=True, allow_null=True)

    class Meta:
        model = StockMovement
        fields = [
            'id', 'product', 'product_name', 'product_variant', 'variant_info',
            'warehouse', 'warehouse_name', 'shelf', 'shelf_name', 'movement_type',
            'quantity', 'movement_date', 'purchase'
        ]

# Updated ProductVariantSerializer
class ProductVariantSerializer(serializers.ModelSerializer):
    purchases = PurchaseSerializer(source='purchase_set', many=True, read_only=True)
    stock_quantity = serializers.SerializerMethodField()
    purchase_price = serializers.SerializerMethodField()
   

    class Meta:
        model = ProductVariant
        fields = ['id', 'product', 'size', 'color', 'stock_quantity', 'purchase_price', 'selling_price', 'purchases']

    def get_stock_quantity(self, obj):
        purchases = obj.purchase_set.all()
        total_quantity = purchases.aggregate(total=models.Sum('quantity'))['total'] or 0
        return total_quantity

    def get_purchase_price(self, obj):
        latest_purchase = obj.purchase_set.order_by('-purchase_date').first()
        return latest_purchase.purchase_price if latest_purchase else 0.00


# Updated ProductSerializer
class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )

    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'category_id', 'description', 'brand', 'image_url', 'barcode', 'created_at', 'variants']

# Corrected WarehouseSerializer (standalone)
# Updated WarehouseSerializer
class WarehouseSerializer(serializers.ModelSerializer):
    shelf_count = serializers.SerializerMethodField()
    total_quantity = serializers.SerializerMethodField()

    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'location', 'owner', 'contact_person', 'contact_number', 'capacity', 'created_at', 'shelf_count', 'total_quantity']

    def get_shelf_count(self, obj):
        return obj.shelves.count()

    def get_total_quantity(self, obj):
        # Sum the quantities of stock movements where movement_type='IN' for this warehouse
        total = StockMovement.objects.filter(
            warehouse=obj,
            movement_type='IN'
        ).aggregate(total_quantity=Sum('quantity'))['total_quantity'] or 0
        return total

# Updated ShelfSerializer
class ShelfSerializer(serializers.ModelSerializer):
    warehouse = serializers.PrimaryKeyRelatedField(queryset=Warehouse.objects.all())
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    total_quantity = serializers.SerializerMethodField()

    class Meta:
        model = Shelf
        fields = ['id', 'warehouse', 'warehouse_name', 'shelf_name', 'section', 'capacity', 'created_at', 'total_quantity']

    def get_total_quantity(self, obj):
        # Sum the quantities of stock movements where movement_type='IN' for this shelf
        total = StockMovement.objects.filter(
            shelf=obj,
            movement_type='IN'
        ).aggregate(total_quantity=Sum('quantity'))['total_quantity'] or 0
        return total

    def validate(self, data):
        warehouse = data.get('warehouse')
        capacity = data.get('capacity')
        if warehouse and capacity:
            total_shelf_capacity = (
                warehouse.shelves.exclude(id=self.instance.id if self.instance else None)
                .aggregate(total=Sum('capacity'))['total'] or 0
            )
            if total_shelf_capacity + capacity > warehouse.capacity:
                raise serializers.ValidationError(
                    f"Total shelf capacity ({total_shelf_capacity + capacity}) exceeds warehouse capacity ({warehouse.capacity})."
                )
        return data
class ShelfViewSet(viewsets.ModelViewSet):
    queryset = Shelf.objects.all()
    serializer_class = ShelfSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        warehouse_id = self.request.query_params.get('warehouse', None)
        print(f"Filtering shelves for warehouse_id: {warehouse_id}")  # Debug
        if warehouse_id:
            try:
                warehouse_id = int(warehouse_id)  # Ensure it's an integer
                queryset = queryset.filter(warehouse_id=warehouse_id)
            except (ValueError, TypeError):
                print(f"Invalid warehouse_id: {warehouse_id}")
        return queryset
# Get the product
class DeliveryMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryMethod
        fields = [
            'delivery_method_id',
            'delivery_name',
            'car_number',
            'delivery_number',
            'estimated_delivery_time',
            'is_active',
        ]

    def validate_estimated_delivery_time(self, value):
        if value and value.total_seconds() < 0:
            raise serializers.ValidationError("Estimated delivery time cannot be negative.")
        return value
#Customer serializer
# CustomerSerializer
class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'customer_id', 'first_name', 'last_name', 'email', 'phone_number', 'phone_number2',
            'address', 'city', 'country', 'order_history', 'status', 'registration_date'
        ]
        read_only_fields = ['customer_id', 'order_history', 'registration_date']

    def validate(self, data):
        if not data.get('first_name'):
            raise serializers.ValidationError({"first_name": "This field cannot be blank."})
        return data
    # InvoiceSerializer
    # InvoiceItemSerializer
class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['id', 'product_id', 'variant_id', 'quantity', 'unit_price', 'discount_percentage', 'total_price']
        read_only_fields = ['id', 'total_price']
class InvoiceSerializer(serializers.ModelSerializer):
    customer = serializers.DictField()  # Use DictField to accept raw customer data
    delivery_method = DeliveryMethodSerializer(allow_null=True, required=False)
    items = InvoiceItemSerializer(many=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'type', 'status', 'date', 'due_date', 'customer', 'delivery_method',
            'notes', 'payment_method', 'shipping_cost', 'overall_discount', 'deduct_tax',
            'subtotal', 'tax', 'total', 'total_in_riel', 'items'
        ]
        read_only_fields = ['id']

    def validate_customer(self, customer_data):
        serializer = CustomerSerializer(data=customer_data)
        serializer.is_valid(raise_exception=True)
        return customer_data

    def validate(self, data):
        customer_data = data.get('customer')
        if customer_data:
            data['customer'] = self.validate_customer(customer_data)
        return data

    def create(self, validated_data):
        customer_data = validated_data.pop('customer')
        delivery_method_data = validated_data.pop('delivery_method', None)
        items_data = validated_data.pop('items')

        email = customer_data.get('email')
        customer = None
        if email:
            try:
                customer = Customer.objects.get(email__iexact=email)
                for key, value in customer_data.items():
                    if value:
                        setattr(customer, key, value)
                customer.save()
            except Customer.DoesNotExist:
                customer = Customer.objects.create(**customer_data)
        else:
            customer = Customer.objects.create(**customer_data)

        delivery_method = None
        if delivery_method_data:
            delivery_method = DeliveryMethod.objects.create(**delivery_method_data)

        invoice = Invoice.objects.create(
            customer=customer,
            delivery_method=delivery_method,
            **validated_data
        )

        for item_data in items_data:
            product_id = item_data.pop('product_id')
            variant_id = item_data.pop('variant_id', None)
            product = Product.objects.get(id=product_id)
            variant = ProductVariant.objects.get(id=variant_id) if variant_id else None
            InvoiceItem.objects.create(
                invoice=invoice,
                product=product,
                variant=variant,
                **item_data
            )

        return invoice

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['customer'] = CustomerSerializer(instance.customer).data
        return representation
