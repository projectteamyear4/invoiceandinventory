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
        read_only_fields = ['delivery_method_id']  # Add this

    def validate_estimated_delivery_time(self, value):
        if value and value.total_seconds() < 0:
            raise serializers.ValidationError("Estimated delivery time cannot be negative.")
        return value
#Customer serializer
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
    customer = serializers.PrimaryKeyRelatedField(queryset=Customer.objects.all())  # Expect a customer ID
    delivery_method = DeliveryMethodSerializer(allow_null=True, required=False)
    items = InvoiceItemSerializer(many=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'type', 'status', 'date', 'due_date', 'customer', 'delivery_method',
            'notes', 'payment_method', 'shipping_cost', 'overall_discount', 'deduct_tax',
            'subtotal', 'tax', 'total', 'total_in_riel', 'items'
        ]
        read_only_fields = ['id', 'subtotal', 'tax', 'total', 'total_in_riel']  # Make these read-only

    def validate(self, data):
        # Ensure the items list is not empty
        if not data.get('items'):
            raise serializers.ValidationError({"items": "An invoice must have at least one item."})
        
        # Validate overall_discount
        overall_discount = data.get('overall_discount', 0)
        if overall_discount < 0 or overall_discount > 100:
            raise serializers.ValidationError({"overall_discount": "Overall discount must be between 0 and 100."})

        return data

    def create(self, validated_data):
        delivery_method_data = validated_data.pop('delivery_method', None)
        items_data = validated_data.pop('items')

        # Create DeliveryMethod if provided
        delivery_method = None
        if delivery_method_data:
            delivery_method = DeliveryMethod.objects.create(**delivery_method_data)

        # Create the Invoice without subtotal, tax, total, and total_in_riel for now
        invoice = Invoice.objects.create(
            delivery_method=delivery_method,
            **validated_data
        )

        # Create InvoiceItems and calculate subtotal
        subtotal = 0
        for item_data in items_data:
            product_id = item_data.pop('product_id')
            variant_id = item_data.pop('variant_id', None)
            product = Product.objects.get(id=product_id)
            variant = ProductVariant.objects.get(id=variant_id) if variant_id else None

            # Calculate total_price for the item
            quantity = item_data['quantity']
            unit_price = item_data['unit_price']
            discount_percentage = item_data.get('discount_percentage', 0)
            total_price = quantity * unit_price * (1 - discount_percentage / 100)

            # Create the InvoiceItem
            invoice_item = InvoiceItem.objects.create(
                invoice=invoice,
                product=product,
                variant=variant,
                total_price=total_price,  # Set the calculated total_price
                **item_data
            )
            subtotal += total_price

        # Calculate overall discount, tax, and totals
        overall_discount = validated_data.get('overall_discount', 0)
        discount_amount = subtotal * (overall_discount / 100)
        discounted_subtotal = subtotal - discount_amount

        shipping_cost = validated_data.get('shipping_cost', 0)
        tax_rate = 0.10  # 10% tax rate (adjust as needed, possibly from settings)
        tax = 0 if validated_data.get('deduct_tax', False) else discounted_subtotal * tax_rate
        total = discounted_subtotal + shipping_cost + tax

        exchange_rate_khr = 4000  # Adjust as needed, possibly from settings
        total_in_riel = total * exchange_rate_khr

        # Update the invoice with calculated fields
        invoice.subtotal = subtotal
        invoice.tax = tax
        invoice.total = total
        invoice.total_in_riel = total_in_riel
        invoice.save()

        return invoice

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['customer'] = CustomerSerializer(instance.customer).data
        return representation