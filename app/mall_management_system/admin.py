from django.contrib import admin
from .models import *

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'store_id', 'category', 'location', 'status', 'monthly_rent', 'manager', 'created_at')
    list_filter = ('category', 'location', 'status')
    search_fields = ('name', 'store_id', 'manager')
    ordering = ('-created_at',)
    list_per_page = 20
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'status')
        }),
        ('Location & Size', {
            'fields': ('location', 'size')
        }),
        ('Financial', {
            'fields': ('monthly_rent',)
        }),
        ('Contact', {
            'fields': ('manager', 'contact_info')
        }),
        ('Other', {
            'fields': ('description', 'operating_hours'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'product_name', 'category', 'quantity', 'total_amount', 'transaction_datetime')
    list_filter = ('category', 'day_of_week', 'month', 'year', 'is_weekend')
    search_fields = ('transaction_id', 'product_name', 'category')
    ordering = ('-created_at',)
    list_per_page = 25
    date_hierarchy = 'transaction_date'
    
    readonly_fields = ('transaction_id', 'total_amount', 'hour', 'day_of_week', 'day_name',
                      'month', 'month_name', 'year', 'week_of_year', 'is_weekend')
    
    fieldsets = (
        ('Transaction Info', {
            'fields': ('transaction_id', 'product_name', 'category', 'quantity', 'total_amount')
        }),
        ('Date & Time', {
            'fields': ('transaction_date', 'transaction_datetime', 'hour', 'day_of_week', 
                      'day_name', 'month', 'month_name', 'year', 'week_of_year', 'is_weekend')
        }),
    )