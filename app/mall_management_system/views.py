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

@csrf_exempt
def api_store_detail(request, store_id):
    """API endpoint for individual store"""
    try:
        store_obj = get_object_or_404(store, store_id=store_id)
        
        if request.method == 'GET':
            # Get store details
            store_data = {
                'id': store_obj.store_id,
                'name': store_obj.name,
                'category': store_obj.category,
                'category_display': store_obj.get_category_display(),
                'location': store_obj.get_location_display(),
                'location_code': store_obj.location,
                'owner': store_obj.owner,
                'contact_email': store_obj.contact_email,
                'contact_phone': store_obj.contact_phone,
                'opening_hours': store_obj.opening_hours,
                'status': store_obj.status,
                'status_display': store_obj.get_status_display(),
                'created_at': store_obj.created_at.strftime('%Y-%m-%d'),
                'updated_at': store_obj.updated_at.strftime('%Y-%m-%d')
            }
            
            # Add sample performance data
            performance_data = {
                'size': random.randint(600, 5000),
                'monthly_rent': random.randint(35000, 250000),
                'revenue': random.randint(300000, 5000000),
                'rating': round(random.uniform(3.5, 5.0), 1),
                'performance': random.choice(['low', 'medium', 'high', 'very-high']),
                'lease_end': (datetime.now() + timedelta(days=random.randint(30, 365))).strftime('%Y-%m-%d')
            }
            
            return JsonResponse({
                'success': True,
                'store': {**store_data, **performance_data}
            })
        
        elif request.method == 'PUT':
            # Update store
            data = json.loads(request.body)
            
            store_obj.name = data.get('name', store_obj.name)
            store_obj.category = data.get('category', store_obj.category)
            store_obj.location = data.get('location', store_obj.location)
            store_obj.owner = data.get('manager', store_obj.owner)
            store_obj.contact_email = data.get('contact', store_obj.contact_email)
            store_obj.status = data.get('status', store_obj.status)
            store_obj.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Store updated successfully'
            })
        
        elif request.method == 'DELETE':
            # Delete store
            store_obj.delete()
            return JsonResponse({
                'success': True,
                'message': 'Store deleted successfully'
            })
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


def api_store_stats(request):
    """API endpoint for store statistics"""
    total_stores = store.objects.count()
    open_stores = store.objects.filter(status='active').count()
    closed_stores = store.objects.filter(status='inactive').count()
    maintenance_stores = store.objects.filter(status='maintenance').count()
    
    # Category distribution
    categories = {}
    for cat_code, cat_name in store._meta.get_field('category').choices:
        count = store.objects.filter(category=cat_code).count()
        if count > 0:
            categories[cat_name] = count
    
    # Calculate revenue by category (sample data)
    category_revenue = {}
    revenue_multipliers = {
        'electronics': 2.5,
        'fashion': 1.8,
        'food': 1.2,
        'entertainment': 3.0,
        'beauty': 1.5,
        'home': 1.3,
        'sports': 1.6,
        'books': 0.8,
        'jewelry': 2.2
    }
    
    for cat_code, cat_name in store._meta.get_field('category').choices:
        count = store.objects.filter(category=cat_code).count()
        multiplier = revenue_multipliers.get(cat_code, 1.0)
        category_revenue[cat_name] = count * 500000 * multiplier  # Base 5L per store
    
    return JsonResponse({
        'success': True,
        'stats': {
            'total_stores': total_stores,
            'open_stores': open_stores,
            'closed_stores': closed_stores,
            'maintenance_stores': maintenance_stores,
            'occupancy_rate': int((total_stores / 60) * 100),  # 60 max capacity
            'avg_revenue': 820000,
            'avg_rating': 4.2,
            'categories': categories,
            'category_revenue': category_revenue
        }
    })
    

def sales(request):
    return render(request, 'sales/sales.html')

def customers(request):
    return render(request, 'Customers/customers.html')

def inventory(request):
    return render(request, 'inventory/inventory.html')

