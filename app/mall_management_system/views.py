from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from datetime import datetime, timedelta
import random
import json
from django.views.decorators.csrf import csrf_exempt
from . models import *

def index(request):
    return render(request, 'index.html')

def dashboard(request):
    return render(request, 'dashboard/dashboard.html')

def stores(request):
    """ main stores view """
    
    stores_list = store.objects.all()
    total_stores = stores_list.count()
    open_stores = stores_list.filter(status='active').count()
    closed_stores = stores_list.filter(status='inactive').count()
    
    avg_revenue = 82000  # place holder value
    occupancy_rate = (open_stores / total_stores) * 100 if total_stores > 0 else 0
    avg_rating = 4.2 # place holder value
    
    
    context = {'stores': stores_list,
               'stats':{
                   'total_stores': total_stores,
                    'open_stores': open_stores,
                    'closed_stores': closed_stores,
                    'avg_revenue':avg_revenue,
                    'occupancy_rate':occupancy_rate,
                    'avg_rating':avg_rating
               }}
    
    return render(request, 'stores/stores.html', context)

@csrf_exempt
def api_stores(request):
    """API endpoint for stores data"""
    if request.method == 'GET':
        # Get query parameters
        category = request.GET.get('category', 'all')
        status_filter = request.GET.get('status', 'all')
        search = request.GET.get('search', '')
        
        # Start with all stores
        stores_qs = store.objects.all()
        
        # Apply filters
        if category != 'all':
            stores_qs = stores_qs.filter(category=category)
        
        if status_filter != 'all':
            stores_qs = stores_qs.filter(status=status_filter)
        
        if search:
            stores_qs = stores_qs.filter(
                models.Q(name__icontains=search) |
                models.Q(store_id__icontains=search) |
                models.Q(location__icontains=search) |
                models.Q(owner__icontains=search)
            )
        
        
        stores_data = []
        for store_obj in stores_qs:
            # Generate sample data for demonstration
            store_data = {
                'id': store_obj.store_id,
                'name': store_obj.name,
                'category': store_obj.category,
                'location': store_obj.get_location_display(),
                'location_code': store_obj.location,
                'size': random.randint(600, 5000),  # Sample data
                'monthly_rent': random.randint(35000, 250000),  # Sample data
                'manager': store_obj.owner,  # Using owner as manager for demo
                'contact': store_obj.contact_email,
                'description': f"{store_obj.name} - {store_obj.category} store",
                'hours': "10:00 AM - 9:00 PM",  # Default hours
                'status': store_obj.status,
                'revenue': random.randint(300000, 5000000),  # Sample data
                'rating': round(random.uniform(3.5, 5.0), 1),
                'lease_end': (datetime.now() + timedelta(days=random.randint(30, 365))).strftime('%Y-%m-%d'),
                'performance': random.choice(['low', 'medium', 'high', 'very-high'])
            }
            stores_data.append(store_data)
        
        return JsonResponse({
            'success': True,
            'stores': stores_data,
            'count': len(stores_data)
        })
    
    elif request.method == 'POST':
        # Create new store
        try:
            data = json.loads(request.body)
            
            
            last_store = store.objects.order_by('-store_id').first()
            if last_store:
                last_num = int(last_store.store_id[2:])
                new_id = f"ST{last_num + 1:03d}"
            else:
                new_id = "ST001"
            
        
            new_store = store.objects.create(
                store_id=new_id,
                name=data.get('name'),
                category=data.get('category'),
                location=data.get('location'),
                owner=data.get('manager'),
                contact_email=data.get('contact'),
                contact_phone=data.get('contact', ''),
                opening_hours={
                    'Monday': '10:00 AM - 9:00 PM',
                    'Tuesday': '10:00 AM - 9:00 PM',
                    'Wednesday': '10:00 AM - 9:00 PM',
                    'Thursday': '10:00 AM - 9:00 PM',
                    'Friday': '10:00 AM - 10:00 PM',
                    'Saturday': '10:00 AM - 10:00 PM',
                    'Sunday': '11:00 AM - 8:00 PM'
                },
                status='active'
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Store created successfully',
                'store_id': new_store.store_id
            })
        
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=400)
    
    return JsonResponse({'success': False, 'error': 'Invalid method'})


def sales(request):
    return render(request, 'sales/sales.html')

def customers(request):
    return render(request, 'Customers/customers.html')

def inventory(request):
    return render(request, 'inventory/inventory.html')

