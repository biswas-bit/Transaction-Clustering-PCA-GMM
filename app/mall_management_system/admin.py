from django.contrib import admin
from . models import *

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'store_id', 'category', 'location', 'status', 'created_at')
    list_filter = ('category', 'location', 'status')
    search_fields = ('name', 'store_id', 'owner')
    ordering = ('-created_at',)