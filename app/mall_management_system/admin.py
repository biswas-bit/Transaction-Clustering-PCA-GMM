from django.contrib import admin
from . models import *

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'store_id', 'category', 'location', 'status', 'created_at')
    list_filter = ('category', 'location', 'status')
    search_fields = ('name', 'store_id', 'owner')
    ordering = ('-created_at',)
    
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'product_name', 'category', 'quantity', 'total_amount', 'transaction_datetime')
    list_filter = ('category', 'transaction_date', 'hour', 'day_of_week', 'month')
    search_fields = ('transaction_id', 'product_name', 'category')
    ordering = ('-created_at',)
    readonly_fields = ('transaction_id', 'total_amount', 'hour', 'day_of_week', 'day_name', 
                      'month', 'month_name', 'year', 'week_of_year', 'is_weekend')
    
