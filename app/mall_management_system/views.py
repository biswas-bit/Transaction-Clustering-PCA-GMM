from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from datetime import datetime, timedelta
import random
import json
from django.views.decorators.csrf import csrf_exempt
from . models import *
from django.db import models as django_models
from django.db.models import Avg, Count, Sum, Q

def index(request):
    return render(request, 'index.html')

def dashboard(request):
    return render(request, 'dashboard/dashboard.html')

def stores(request):
    """Main stores view"""
    stores_list = Store.objects.all()
    total_stores = stores_list.count()
    print("total_stores:", total_stores)
    print(stores_list)
    # Get real statistics
    active_stores = stores_list.filter(status='active').count()
    inactive_stores = stores_list.filter(status='inactive').count()
    maintenance_stores = stores_list.filter(status='maintenance').count()
    
    # Calculate averages from actual data
    avg_size = stores_list.aggregate(avg_size=Avg('size'))['avg_size'] or 0
    avg_rent = stores_list.aggregate(avg_rent=Avg('monthly_rent'))['avg_rent'] or 0
    
    context = {
        'stores': stores_list,
        'stats': {
            'total_stores': total_stores,
            'active_stores': active_stores,
            'inactive_stores': inactive_stores,
            'maintenance_stores': maintenance_stores,
            'avg_size': round(avg_size, 2) if avg_size else 0,
            'avg_rent': round(avg_rent, 2) if avg_rent else 0,
            'occupancy_rate': round((total_stores / 60) * 100, 1) if total_stores > 0 else 0  # Assuming 60 max capacity
        }
    }
    
    return render(request, 'stores/stores.html', context)

def sales(request):
    return render(request, 'sales/sales.html')

def customers(request):
    return render(request, 'Customers/customers.html')

def inventory(request):
    return render(request, 'inventory/inventory.html')

