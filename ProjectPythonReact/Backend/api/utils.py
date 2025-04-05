# api/utils.py
from django.db.models import Sum, Q
from .models import StockMovement

def get_current_stock(product, variant=None, warehouse=None, shelf=None):
    filters = {'product': product}
    if variant:
        filters['product_variant'] = variant
    if warehouse:
        filters['warehouse'] = warehouse
    if shelf:
        filters['shelf'] = shelf

    movements = StockMovement.objects.filter(**filters).aggregate(
        total_in=Sum('quantity', filter=Q(movement_type='IN')) or 0,
        total_out=Sum('quantity', filter=Q(movement_type='OUT')) or 0
    )
    
    total_in = movements['total_in'] if movements['total_in'] is not None else 0
    total_out = movements['total_out'] if movements['total_out'] is not None else 0
    
    return max(total_in - total_out, 0)