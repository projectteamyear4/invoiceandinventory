# api/signals.py (hypothetical)
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Purchase, ProductVariant, InvoiceItem, StockMovement

@receiver(post_save, sender=Purchase)
def reset_stock(sender, instance, created, **kwargs):
    if created and instance.product_variant:
        instance.product_variant.stock_quantity = 0  # This would cause the issue
        instance.product_variant.save()
# @receiver(post_save, sender=InvoiceItem)
# def create_stock_movement_for_invoice_item(sender, instance, created, **kwargs):
#     if created:  # Only trigger on creation, not updates
#         # Create a StockMovement entry for the InvoiceItem
#         StockMovement.objects.create(
#             movement_type='OUT',
#             quantity=instance.quantity,
#             invoice_item=instance,
#             product=instance.product,
#             product_variant=instance.variant,
#             purchase=None,  # No purchase associated with an "OUT" movement
#             shelf=None,  # You can add logic to determine the shelf
#             warehouse=None  # You can add logic to determine the warehouse
#         )

#         # Optionally, update the stock in ProductVariant
#         if instance.variant:
#             instance.variant.stock -= instance.quantity
#             instance.variant.save()