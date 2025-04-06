# api/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from decimal import Decimal
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
        print(f"Creating purchase with validated_data: {validated_data}")  # Debug
        purchase = Purchase.objects.create(**validated_data)
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

# Updated ProductVariantSerializer with logging
class ProductVariantSerializer(serializers.ModelSerializer):
    purchases = PurchaseSerializer(source='purchase_set', many=True, read_only=True)
    stock = serializers.IntegerField(source='stock_quantity')  # Rename stock_quantity to stock
    purchase_price = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = ['id', 'product', 'size', 'color', 'stock', 'purchase_price', 'selling_price', 'purchases']

    def get_purchase_price(self, obj):
        latest_purchase = obj.purchase_set.order_by('-purchase_date').first()
        return latest_purchase.purchase_price if latest_purchase else 0.00

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        logger.info(f"Serializing ProductVariant {instance.id}: {representation}")
        return representation

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

# DeliveryMethod serializer
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
        read_only_fields = ['delivery_method_id']

    def validate_estimated_delivery_time(self, value):
        if value and value.total_seconds() < 0:
            raise serializers.ValidationError("Estimated delivery time cannot be negative.")
        return value

# Customer serializer
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

# InvoiceItem serializer
class InvoiceItemSerializer(serializers.ModelSerializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )
    variant_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all(), source='variant', write_only=True, allow_null=True
    )

    class Meta:
        model = InvoiceItem
        fields = ['id', 'product', 'product_id', 'variant', 'variant_id', 'quantity', 'unit_price', 'discount_percentage', 'total_price']
        read_only_fields = ['id', 'total_price']

    def validate(self, data):
        logger.info(f"Validating InvoiceItem: {data}")
        quantity = data.get('quantity')
        unit_price = data.get('unit_price')
        discount_percentage = data.get('discount_percentage', 0.0)

        if quantity <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        if unit_price < 0:
            raise serializers.ValidationError("Unit price cannot be negative.")
        if discount_percentage < 0 or discount_percentage > 100:
            raise serializers.ValidationError("Discount percentage must be between 0 and 100.")

        return data

# Invoice serializer
class InvoiceSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), source='customer', write_only=True
    )
    delivery_method = DeliveryMethodSerializer(allow_null=True, required=False)
    delivery_method_id = serializers.PrimaryKeyRelatedField(
        queryset=DeliveryMethod.objects.all(), source='delivery_method', write_only=True, allow_null=True, required=False
    )
    items = InvoiceItemSerializer(many=True)
    date = serializers.DateTimeField(format='%Y-%m-%d')
    due_date = serializers.DateTimeField(format='%Y-%m-%d')
    subtotal = serializers.SerializerMethodField()
    tax = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    total_in_riel = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'type', 'status', 'date', 'due_date', 'customer', 'customer_id',
            'delivery_method', 'delivery_method_id', 'notes', 'payment_method',
            'shipping_cost', 'overall_discount', 'deduct_tax', 'subtotal', 'tax',
            'total', 'total_in_riel', 'items'
        ]
        read_only_fields = ['id', 'subtotal', 'tax', 'total', 'total_in_riel']

    def get_subtotal(self, obj):
        return float(obj.subtotal) if obj.subtotal is not None else 0.0

    def get_tax(self, obj):
        return float(obj.tax) if obj.tax is not None else 0.0

    def get_total(self, obj):
        return float(obj.total) if obj.total is not None else 0.0

    def get_total_in_riel(self, obj):
        return float(obj.total_in_riel) if obj.total_in_riel is not None else 0.0

    def validate(self, data):
        request_method = self.context.get('request').method if 'request' in self.context else 'Unknown'
        logger.info(f"Validating invoice with method: {request_method}, data: {data}")
        if request_method == 'POST':
            items = data.get('items', [])
            if not items:
                logger.error("Validation failed: At least one item required for POST")
                raise serializers.ValidationError("At least one item is required to create an invoice.")
            for item in items:
                variant = item.get('variant')
                quantity = item.get('quantity')
                if variant:
                    available_stock = variant.stock_quantity
                    if available_stock < quantity:
                        raise serializers.ValidationError(
                            f"Insufficient stock for variant {variant}. "
                            f"Requested: {quantity}, Available: {available_stock}"
                        )
        elif request_method == 'PATCH':
            logger.info("PATCH request: Only validating status field")
            if 'status' not in data:
                logger.warning("No status field provided in PATCH request")
        return data

    def validate_status(self, value):
        valid_statuses = [choice[0] for choice in Invoice.STATUS_CHOICES]
        logger.info(f"Validating status: {value}, allowed: {valid_statuses}")
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Invalid status. Must be one of: {valid_statuses}")
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        customer = validated_data.pop('customer')
        delivery_method = validated_data.pop('delivery_method', None)

        invoice = Invoice.objects.create(
            customer=customer,
            delivery_method=delivery_method,
            **validated_data
        )

        for item_data in items_data:
            if item_data is None:
                continue
            product = item_data.pop('product')
            variant = item_data.pop('variant', None)
            quantity = Decimal(str(item_data['quantity']))
            unit_price = Decimal(str(item_data['unit_price']))
            discount_percentage = Decimal(str(item_data.get('discount_percentage', '0.0')))
            total_price = (quantity * unit_price) * (1 - discount_percentage / Decimal('100'))

            # Reduce stock if variant exists
            if variant:
                if variant.stock_quantity < quantity:
                    raise serializers.ValidationError(
                        f"Insufficient stock for variant {variant}. "
                        f"Requested: {quantity}, Available: {variant.stock_quantity}"
                    )
                variant.stock_quantity -= int(quantity)
                variant.save()

                # Create a StockMovement entry for the stock reduction
                StockMovement.objects.create(
                    product=product,
                    product_variant=variant,
                    movement_type='OUT',
                    quantity=int(quantity),
                    invoice_item=None,  # Will be set after creating the InvoiceItem
                    warehouse=None,
                    shelf=None,
                )

            invoice_item = InvoiceItem.objects.create(
                invoice=invoice,
                product=product,
                variant=variant,
                total_price=total_price,
                **item_data
            )

            # Update the StockMovement with the invoice_item reference
            if variant:
                StockMovement.objects.filter(
                    product=product,
                    product_variant=variant,
                    movement_type='OUT',
                    invoice_item__isnull=True
                ).update(invoice_item=invoice_item)

        # Calculate totals
        invoice.subtotal = sum(item.total_price for item in invoice.items.all())
        invoice.tax = invoice.subtotal * Decimal('0.1') if not invoice.deduct_tax else Decimal('0.0')
        invoice.total = invoice.subtotal + invoice.tax + invoice.shipping_cost - invoice.overall_discount
        invoice.total_in_riel = invoice.total * Decimal('4100')  # Example exchange rate
        invoice.save()

        return invoice

    def update(self, instance, validated_data):
        logger.info(f"Updating invoice {instance.id} with validated_data: {validated_data}")
        if 'status' in validated_data:
            new_status = validated_data['status']
            logger.info(f"Changing status of invoice {instance.id} from {instance.status} to {new_status}")
            instance.status = new_status
        else:
            logger.warning(f"No status field in validated_data for invoice {instance.id}")

        try:
            instance.save()
            logger.info(f"Invoice {instance.id} after update: status={instance.status}")
        except Exception as e:
            logger.error(f"Failed to save invoice {instance.id}: {str(e)}", exc_info=True)
            raise serializers.ValidationError(f"Error saving invoice: {str(e)}")

        return instance