from django.db import models
import uuid
import random
from django.core.exceptions import ValidationError
#Supplier model
class Supplier(models.Model):
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField(null=True, blank=True)
    address = models.TextField()
    country = models.CharField(max_length=100)

    def __str__(self):
        return self.name
#Category, Product, ProductVariant models
class Category(models.Model):
    name = models.CharField(max_length=50, unique=True, null=False)

    def __str__(self):
        return self.name
def generate_sequential_barcode():
    last_product = Product.objects.order_by('-id').first()
    last_id = int(last_product.barcode[1:]) if last_product and last_product.barcode else 0
    return f"P{str(last_id + 1).zfill(11)}"  # e.g., P00000000001
class Product(models.Model):
    name = models.CharField(max_length=100, null=False)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    description = models.TextField(blank=True, null=True)
    brand = models.CharField(max_length=50, blank=True, null=True)
    image_url = models.URLField(max_length=200, blank=True, null=True)
    barcode = models.CharField(max_length=12, unique=True, default=generate_sequential_barcode, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size = models.CharField(max_length=20, blank=True, null=True)
    color = models.CharField(max_length=30, blank=True, null=True)
    stock_quantity = models.IntegerField(default=0)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    def __str__(self):
        return f"{self.product.name} - {self.size or 'No Size'} - {self.color or 'No Color'}"
    
# warehouse model
class Warehouse(models.Model):
    name = models.CharField(max_length=100, null=False)
    location = models.CharField(max_length=255, null=False)
    owner = models.CharField(max_length=100, null=True, blank=True)
    contact_person = models.CharField(max_length=100, null=True, blank=True)
    contact_number = models.CharField(max_length=20, null=True, blank=True)
    capacity = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # Added capacity
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'warehouse'
#shelf model
class Shelf(models.Model):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='shelves')
    shelf_name = models.CharField(max_length=50, null=False)
    section = models.CharField(max_length=50, null=True, blank=True)
    capacity = models.DecimalField(max_digits=10, decimal_places=2, null=False)  # New field
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.shelf_name} ({self.warehouse.name})"

    def clean(self):
        # Validate that shelf capacity doesn't exceed warehouse capacity
        if self.warehouse and self.capacity:
            if self.capacity > self.warehouse.capacity:
                raise ValidationError(f"Shelf capacity ({self.capacity}) cannot exceed warehouse capacity ({self.warehouse.capacity}).")
            # Check total capacity of all shelves in the warehouse
            total_shelf_capacity = self.warehouse.shelves.exclude(id=self.id).aggregate(models.Sum('capacity'))['capacity__sum'] or 0
            if total_shelf_capacity + self.capacity > self.warehouse.capacity:
                raise ValidationError(f"Total shelf capacity ({total_shelf_capacity + self.capacity}) exceeds warehouse capacity ({self.warehouse.capacity}).")

    def save(self, *args, **kwargs):
        self.clean()  # Run validation before saving
        super().save(*args, **kwargs)

    class Meta:
        db_table = 'shelf'
#purchase model
class Purchase(models.Model):
    id = models.AutoField(primary_key=True)
    supplier = models.ForeignKey('Supplier', on_delete=models.CASCADE)
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    product_variant = models.ForeignKey('ProductVariant', on_delete=models.CASCADE, null=True, blank=True)
    batch_number = models.CharField(max_length=50)
    quantity = models.IntegerField()
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_date = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)  # New field for total

    def __str__(self):
        return f"Purchase {self.id} - {self.product.name} ({self.batch_number})"

    def save(self, *args, **kwargs):
        # Calculate total as quantity * purchase_price
        self.total = self.quantity * self.purchase_price
        super().save(*args, **kwargs)

#stock model
class StockMovement(models.Model):
    MOVEMENT_TYPES = (
        ('IN', 'In'),
        ('OUT', 'Out'),
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    shelf = models.ForeignKey(Shelf, on_delete=models.CASCADE)
    movement_type = models.CharField(max_length=3, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()
    movement_date = models.DateTimeField(auto_now_add=True)
    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.movement_type} - {self.product.name} - {self.quantity}"