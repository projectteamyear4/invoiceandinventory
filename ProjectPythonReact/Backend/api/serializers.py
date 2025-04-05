from django.contrib.auth.models import User
from rest_framework import serializers
from decimal import Decimal
from django.db import models
from django.db.models import Sum
from rest_framework import viewsets
from django.utils import timezone
import logging
from .utils import get_current_stock
from django.db import transaction
from datetime import datetime
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Supplier, Product, ProductVariant, Category, Warehouse, Shelf, Purchase, StockMovement, Customer, DeliveryMethod, Invoice, InvoiceItem
logger = logging.getLogger(__name__)
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

    # def get_stock_quantity(self, obj):
    #     purchases = obj.purchase_set.all()
    #     total_quantity = purchases.aggregate(total=models.Sum('quantity'))['total'] or 0
    #     return total_quantity

    # def get_purchase_price(self, obj):
    #     latest_purchase = obj.purchase_set.order_by('-purchase_date').first()
    #     return latest_purchase.purchase_price if latest_purchase else 0.00
    def get_stock_quantity(self, obj):
        stock = get_current_stock(obj.product, variant=obj)
        print(f"Stock for variant {obj.id} ({obj.size}/{obj.color}): {stock}")  # Debug log
        return stock

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

class InvoiceItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(write_only=True)
    variant_id = serializers.IntegerField(write_only=True, allow_null=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    variant_size = serializers.CharField(source='variant.size', read_only=True, allow_null=True)
    variant_color = serializers.CharField(source='variant.color', read_only=True, allow_null=True)
    quantity = serializers.IntegerField(min_value=0)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, default=0, required=False)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = InvoiceItem
        fields = [
            'id', 'product_id', 'variant_id', 'product_name', 'variant_size',
            'variant_color', 'quantity', 'unit_price', 'discount_percentage', 'total_price'
        ]
class InvoiceSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), source='customer', write_only=True
    )
    delivery_method = DeliveryMethodSerializer(read_only=True, allow_null=True)
    delivery_method_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )
    items = InvoiceItemSerializer(many=True)
    date = serializers.DateTimeField(format='%Y-%m-%d')  # Matches DateTimeField in the model
    due_date = serializers.DateTimeField(format='%Y-%m-%d')  # Matches DateTimeField in the model

    class Meta:
        model = Invoice
        fields = [
            'id', 'type', 'status', 'date', 'due_date', 'customer', 'customer_id',
            'delivery_method', 'delivery_method_id', 'notes', 'payment_method',
            'shipping_cost', 'overall_discount', 'deduct_tax', 'subtotal', 'tax',
            'total', 'total_in_riel', 'items'
        ]
        read_only_fields = ['id', 'subtotal', 'tax', 'total', 'total_in_riel']

    def validate(self, data):
        request_method = self.context.get('request').method if 'request' in self.context else 'Unknown'
        logger.info(f"Validating invoice with method: {request_method}, data: {data}")
        if request_method == 'POST':
            items = data.get('items', [])
            if not items:
                logger.error("Validation failed: At least one item required for POST")
                raise serializers.ValidationError("At least one item is required to create an invoice.")

            # Validate stock availability for each item
            for item in items:
                variant_id = item.get('variant_id')
                quantity = item.get('quantity')
                if variant_id:  # Only check stock for items with a variant
                    try:
                        variant = ProductVariant.objects.get(id=variant_id)
                        if variant.stock_quantity < quantity:
                            raise serializers.ValidationError(
                                f"Insufficient stock for variant ID {variant_id}. "
                                f"Requested: {quantity}, Available: {variant.stock_quantity}"
                            )
                    except ProductVariant.DoesNotExist:
                        raise serializers.ValidationError(f"Variant ID {variant_id} does not exist.")
        elif request_method == 'PATCH':
            logger.info("Skipping items validation for PATCH, only status editable")
        return data

    def validate_delivery_method_id(self, value):
        if value is not None and not DeliveryMethod.objects.filter(delivery_method_id=value).exists():
            raise serializers.ValidationError("Delivery method does not exist.")
        return value

    def create(self, validated_data):
        with transaction.atomic():  # Ensure all operations succeed or fail together
            # Remove items, customer, and delivery_method_id from validated_data
            items_data = validated_data.pop('items', [])
            customer = validated_data.pop('customer')
            delivery_method_id = validated_data.pop('delivery_method_id', None)

            # Set delivery_method based on delivery_method_id
            delivery_method = None
            if delivery_method_id is not None:
                delivery_method = DeliveryMethod.objects.get(delivery_method_id=delivery_method_id)

            # Create the invoice
            invoice = Invoice.objects.create(
                customer=customer,
                delivery_method=delivery_method,
                **validated_data
            )

            # Calculate subtotal and create invoice items
            subtotal = Decimal('0.0')
            for item_data in items_data:
                if item_data is None:
                    continue
                product_id = item_data.pop('product_id')
                variant_id = item_data.pop('variant_id', None)
                product = Product.objects.get(id=product_id)
                variant = ProductVariant.objects.get(id=variant_id) if variant_id else None

                quantity = Decimal(str(item_data['quantity']))
                unit_price = Decimal(str(item_data['unit_price']))
                discount_percentage = Decimal(str(item_data.get('discount_percentage', '0.0')))
                total_price = (quantity * unit_price) * (1 - discount_percentage / Decimal('100'))
                subtotal += total_price

                # Update stock quantity if there's a variant
                if variant:
                    variant.stock_quantity -= int(quantity)  # Subtract the purchased quantity
                    if variant.stock_quantity < 0:
                        raise serializers.ValidationError(
                            f"Stock quantity for variant ID {variant.id} cannot be negative. "
                            f"Current stock: {variant.stock_quantity + int(quantity)}, Requested: {quantity}"
                        )
                    variant.save()

                # Create the invoice item
                InvoiceItem.objects.create(
                    invoice=invoice,
                    product=product,
                    variant=variant,
                    total_price=total_price,
                    **item_data
                )

            # Calculate totals
            invoice.subtotal = subtotal
            overall_discount_amount = invoice.subtotal * (invoice.overall_discount / Decimal('100'))
            discounted_subtotal = invoice.subtotal - overall_discount_amount
            invoice.tax = discounted_subtotal * Decimal('0.1') if not invoice.deduct_tax else Decimal('0.0')
            invoice.total = discounted_subtotal + invoice.shipping_cost + invoice.tax
            invoice.total_in_riel = invoice.total * Decimal('4100')
            invoice.save()

            return invoice

    def update(self, instance, validated_data):
        logger.info(f"Updating invoice {instance.id} with validated_data: {validated_data}")
        # Only allow status updates via PATCH
        if 'status' in validated_data:
            new_status = validated_data['status']
            if new_status == 'CANCELLED' and instance.status != 'CANCELLED':
                # Restore stock for all items in the invoice
                for item in instance.invoiceitem_set.all():
                    if item.variant:
                        item.variant.stock_quantity += item.quantity
                        item.variant.save()
            instance.status = new_status
        instance.save()
        return instance