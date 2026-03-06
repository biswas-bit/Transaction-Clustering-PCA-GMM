from django.contrib import admin
from .models import Store, Transaction

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
    
    # Fields that should be read-only (auto-generated)
    readonly_fields = ('transaction_id', 'total_amount', 'transaction_time', 'transaction_date', 
                      'transaction_datetime', 'hour', 'day_of_week', 'day_name',
                      'month', 'month_name', 'year', 'week_of_year', 'is_weekend')
    
    # Fields to exclude from the form completely (optional)
    exclude = ()  # Empty tuple means include all fields
    
    fieldsets = (
        ('Transaction Info', {
            'fields': ('transaction_id', 'product_name', 'category', 'quantity', 
                      'unit_price', 'total_amount', 'store_id', 'customer_id')
        }),
        ('Date & Time', {
            'fields': ('transaction_datetime', 'transaction_date', 'transaction_time'),
            'classes': ('collapse',),
            'description': 'Auto-captured timestamp'
        }),
        ('ML Features (Auto-generated)', {
            'fields': ('hour', 'day_of_week', 'day_name', 'month', 'month_name', 
                      'year', 'week_of_year', 'is_weekend'),
            'classes': ('collapse',),
            'description': 'These fields are automatically generated from the transaction time'
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        """Make all auto-generated fields readonly"""
        if obj:  # Editing existing object
            return self.readonly_fields
        return self.readonly_fields  # Same for new objects