# api/migrations/0007_product_barcode.py
from django.db import migrations, models
import random

def generate_numeric_barcode():
    return ''.join([str(random.randint(0, 9)) for _ in range(12)])

def generate_barcodes(apps, schema_editor):
    Product = apps.get_model('api', 'Product')  # Adjust 'api' to your app name
    for product in Product.objects.filter(barcode__isnull=True):
        # Ensure uniqueness by checking existing barcodes
        while True:
            barcode = generate_numeric_barcode()
            if not Product.objects.filter(barcode=barcode).exists():
                product.barcode = barcode
                product.save()
                break

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0006_shelf'),  # Matches your file
    ]

    operations = [
        # Step 1: Add the field as nullable to avoid immediate constraints
        migrations.AddField(
            model_name='product',
            name='barcode',
            field=models.CharField(
                max_length=12,  # Changed to 12 for numeric barcode
                null=True,     # Temporarily nullable
                blank=True,
                editable=False,
            ),
        ),
        # Step 2: Populate numeric barcodes for existing rows
        migrations.RunPython(generate_barcodes, reverse_code=migrations.RunPython.noop),
        # Step 3: Alter the field to enforce uniqueness and set the numeric default
        migrations.AlterField(
            model_name='product',
            name='barcode',
            field=models.CharField(
                default=generate_numeric_barcode,  # Numeric barcode generator
                editable=False,
                max_length=12,
                unique=True,
            ),
        ),
    ]