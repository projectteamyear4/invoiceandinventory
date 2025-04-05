# api/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Purchase, InvoiceItem, StockMovement, Invoice
from .utils import get_current_stock

@receiver(post_save, sender=Purchase)
def create_stock_movement_for_purchase(sender, instance, created, **kwargs):
    if created:
        StockMovement.objects.create(
            product=instance.product,
            product_variant=instance.product_variant,
            movement_type='IN',
            quantity=instance.quantity,
            movement_date=instance.purchase_date,
            purchase=instance
        )
        print(f"Created StockMovement for Purchase {instance.id}: IN {instance.quantity} units")

@receiver(post_save, sender=InvoiceItem)
def create_stock_movement_from_invoice_item(sender, instance, created, **kwargs):
    if created and instance.invoice.status in ['PENDING', 'PAID']:
        warehouse = None
        shelf = None
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
            purchase=None,
            invoice_item=instance
        )
        print(f"Created StockMovement for InvoiceItem {instance.id}: OUT {instance.quantity} units")

@receiver(post_save, sender=Invoice)
def handle_invoice_status_change(sender, instance, created, **kwargs):
    if not created:  # Only handle updates
        if instance.status in ['PENDING', 'PAID']:
            for item in instance.invoiceitem_set.all():
                if not StockMovement.objects.filter(invoice_item=item, movement_type='OUT').exists():
                    warehouse = None
                    shelf = None
                    current_stock = get_current_stock(
                        product=item.product,
                        variant=item.variant,
                        warehouse=warehouse,
                        shelf=shelf
                    )
                    if current_stock < item.quantity:
                        print(
                            f"Warning: Insufficient stock for {item.product.name} "
                            f"(Variant: {item.variant if item.variant else 'None'}) "
                            f"when updating invoice status: {current_stock} available, "
                            f"{item.quantity} requested"
                        )
                        continue
                    StockMovement.objects.create(
                        product=item.product,
                        product_variant=item.variant,
                        warehouse=warehouse,
                        shelf=shelf,
                        movement_type='OUT',
                        quantity=item.quantity,
                        purchase=None,
                        invoice_item=item
                    )
                    print(f"Created StockMovement for InvoiceItem {item.id}: OUT {item.quantity} units due to invoice status change")

@receiver(post_delete, sender=Invoice)
def restore_stock_on_delete(sender, instance, **kwargs):
    for item in instance.invoiceitem_set.all():
        if item.variant:
            StockMovement.objects.create(
                product=item.product,
                product_variant=item.variant,
                warehouse=None,
                shelf=None,
                movement_type='IN',
                quantity=item.quantity,
                purchase=None,
                invoice_item=None
            )
            print(f"Restored stock for variant {item.variant.id}: {item.quantity} units")

@receiver(post_delete, sender=InvoiceItem)
def restore_stock_on_invoice_item_delete(sender, instance, **kwargs):
    if instance.variant and instance.invoice.status in ['PENDING', 'PAID']:
        stock_movement = StockMovement.objects.filter(invoice_item=instance, movement_type='OUT').first()
        if stock_movement:
            StockMovement.objects.create(
                product=instance.product,
                product_variant=instance.variant,
                warehouse=None,
                shelf=None,
                movement_type='IN',
                quantity=instance.quantity,
                purchase=None,
                invoice_item=None
            )
            print(f"Restored stock for InvoiceItem {instance.id}: IN {instance.quantity} units due to deletion")