from django.contrib.auth.models import User
from rest_framework import serializers
from django.db import models
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Supplier,Product, ProductVariant, Category, Warehouse, Shelf

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
        # Add custom claims if needed
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

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'product', 'size', 'color', 'stock_quantity', 'purchase_price', 'selling_price']

class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)  # Nested category
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )  # For writing category ID

    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'category_id', 'description', 'brand','image_url', 'created_at', 'variants']
        
# Corrected WarehouseSerializer (standalone)
class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'location', 'owner', 'contact_person', 'contact_number','capacity', 'created_at']
        
class ShelfSerializer(serializers.ModelSerializer):
    warehouse = serializers.PrimaryKeyRelatedField(queryset=Warehouse.objects.all())

    class Meta:
        model = Shelf
        fields = ['id', 'warehouse', 'shelf_name', 'section', 'capacity', 'created_at']

    def validate(self, data):
        warehouse = data.get('warehouse')
        capacity = data.get('capacity')
        if warehouse and capacity:
            total_shelf_capacity = (
                warehouse.shelves.exclude(id=self.instance.id if self.instance else None)
                .aggregate(models.Sum('capacity'))['capacity__sum'] or 0
            )
            if total_shelf_capacity + capacity > warehouse.capacity:
                raise serializers.ValidationError(
                    f"Total shelf capacity ({total_shelf_capacity + capacity}) exceeds warehouse capacity ({warehouse.capacity})."
                )
        return data