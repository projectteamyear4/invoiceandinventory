from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import InvoiceItem, StockMovement, get_current_stock

@receiver(post_save, sender=InvoiceItem)
def create_stock_movement_from_invoice_item(sender, instance, created, **kwargs):
    if created and instance.invoice.status in ['PENDING', 'PAID']:
        warehouse = None  # Customize if needed
        shelf = None      # Customize if needed
        current_stock = get_current_stock(
            product=instance.product,
            variant=instance.variant,
            warehouse=warehouse,
            shelf=shelf
        )
        if current_stock < instance.quantity:
            raise ValueError(
                f"Insufficient stock for {instance.product.name} "
                f"(Variant: {instance.variant if instance.variant else 'None'}): "
                f"{current_stock} available, {instance.quantity} requested"
            )
        StockMovement.objects.create(
            product=instance.product,
            product_variant=instance.variant,
            warehouse=warehouse,
            shelf=shelf,
            movement_type='OUT',
            quantity=instance.quantity,
            purchase=None
        )