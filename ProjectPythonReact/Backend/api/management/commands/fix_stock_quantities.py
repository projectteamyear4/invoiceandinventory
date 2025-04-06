# api/management/commands/fix_stock_quantities.py
from django.core.management.base import BaseCommand
from api.models import ProductVariant, StockMovement
from django.db.models import Sum

class Command(BaseCommand):
    help = 'Fixes stock quantities in ProductVariant based on StockMovement entries'

    def handle(self, *args, **kwargs):
        variants = ProductVariant.objects.all()
        for variant in variants:
            # Calculate stock from StockMovement
            in_stock = StockMovement.objects.filter(
                product_variant=variant,
                movement_type='IN'
            ).aggregate(total=Sum('quantity'))['total'] or 0
            out_stock = StockMovement.objects.filter(
                product_variant=variant,
                movement_type='OUT'
            ).aggregate(total=Sum('quantity'))['total'] or 0
            correct_stock = in_stock - out_stock

            if variant.stock_quantity != correct_stock:
                self.stdout.write(self.style.WARNING(
                    f"Variant {variant.id} stock_quantity={variant.stock_quantity}, should be {correct_stock}"
                ))
                variant.stock_quantity = correct_stock
                variant.save()
                self.stdout.write(self.style.SUCCESS(
                    f"Updated variant {variant.id} stock_quantity to {correct_stock}"
                ))
            else:
                self.stdout.write(self.style.SUCCESS(
                    f"Variant {variant.id} stock_quantity is correct: {correct_stock}"
                ))