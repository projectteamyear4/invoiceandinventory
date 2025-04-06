# api/utils.py
from django.db.models import Sum

def get_current_stock(product, variant=None):
    # Filter stock movements by product
    stock_movements = StockMovement.objects.filter(product=product)

    # If a variant is specified, filter by variant as well
    if variant:
        stock_movements = stock_movements.filter(product_variant=variant)

    # Debug
    print(f"Stock movements for product {product.id}, variant {variant.id if variant else 'None'}: {stock_movements.count()} entries")
    for movement in stock_movements:
        print(f" - {movement.movement_type}: {movement.quantity}")

    # Calculate total stock: IN movements - OUT movements
    in_stock = stock_movements.filter(movement_type='IN').aggregate(total=Sum('quantity'))['total'] or 0
    out_stock = stock_movements.filter(movement_type='OUT').aggregate(total=Sum('quantity'))['total'] or 0

    return in_stock - out_stock