# api/signals.py (hypothetical)
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Purchase, ProductVariant

@receiver(post_save, sender=Purchase)
def reset_stock(sender, instance, created, **kwargs):
    if created and instance.product_variant:
        instance.product_variant.stock_quantity = 0  # This would cause the issue
        instance.product_variant.save()