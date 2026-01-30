from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from datetime import datetime, timedelta
import random
import json
from django.views.decorators.csrf import csrf_exempt
from . models import *
from django.db import models as django_models

def index(request):
    return render(request, 'index.html')

def dashboard(request):
    return render(request, 'dashboard/dashboard.html')

def stores(request):
    """Main stores view"""
    stores_list = store.objects.all()
    total_stores = stores_list.count()
    open_stores = stores_list.filter(status='active').count()
    closed_stores = stores_list.filter(status='inactive').count()
    
    # Calculate average revenue from all stores (using sample data)
    avg_revenue = 820000  # This would be calculated from actual revenue data
    occupancy_rate = round((total_stores / 60) * 100, 1) if total_stores > 0 else 0  # Assuming 60 max capacity
    avg_rating = 4.2  # This would be calculated from actual ratings
    
    context = {
        'stores': stores_list,
        'stats': {
            'total_stores': total_stores,
            'open_stores': open_stores,
            'closed_stores': closed_stores,
            'avg_revenue': avg_revenue,
            'occupancy_rate': occupancy_rate,
            'avg_rating': avg_rating
        }
    }
    
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
        if category and category != 'all':
            stores_qs = stores_qs.filter(category=category)
        
        if status_filter and status_filter != 'all':
            stores_qs = stores_qs.filter(status=status_filter)
        
        if search:
            stores_qs = stores_qs.filter(
                django_models.Q(name__icontains=search) |
                django_models.Q(store_id__icontains=search) |
                django_models.Q(location__icontains=search) |
                django_models.Q(owner__icontains=search)
            )
        
        # Build stores data
        stores_data = []
        for store_obj in stores_qs:
            # Generate sample data for demonstration (in production, this would come from related models)
            store_data = {
                'id': store_obj.store_id,
                'name': store_obj.name,
                'category': store_obj.category,
                'location': store_obj.location,
                'location_display': store_obj.get_location_display(),
                'size': random.randint(600, 5000),  # Sample data - would be in a related model
                'monthlyRent': random.randint(35000, 250000),  # Sample data
                'manager': store_obj.owner,
                'contact': store_obj.contact_email,
                'description': f"{store_obj.name} - {store_obj.get_category_display()} store",
                'hours': store_obj.opening_hours.get('Monday', '10:00 AM - 9:00 PM') if store_obj.opening_hours else '10:00 AM - 9:00 PM',
                'status': 'open' if store_obj.status == 'active' else 'closed' if store_obj.status == 'inactive' else 'maintenance',
                'revenue': random.randint(300000, 5000000),  # Sample data
                'rating': round(random.uniform(3.5, 5.0), 1),
                'leaseEnd': (datetime.now() + timedelta(days=random.randint(30, 365))).strftime('%Y-%m-%d'),
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
            
            # Generate new store ID
            last_store = store.objects.order_by('-store_id').first()
            if last_store and last_store.store_id.startswith('ST'):
                try:
                    last_num = int(last_store.store_id[2:])
                    new_id = f"ST{last_num + 1:03d}"
                except:
                    new_id = f"ST{store.objects.count() + 1:03d}"
            else:
                new_id = "ST001"
            
            # Map location from frontend format to model format
            location_mapping = {
                'GF-North': 'ground_floor',
                'GF-South': 'ground_floor',
                'GF-East': 'ground_floor',
                'GF-West': 'ground_floor',
                '1F-North': 'first_floor',
                '1F-South': 'first_floor',
                '1F-East': 'first_floor',
                '1F-West': 'first_floor',
                '2F-North': 'second_floor',
                '2F-South': 'second_floor',
                '2F-East': 'second_floor',
                '2F-West': 'second_floor'
            }
            
            location_code = location_mapping.get(data.get('location'), 'ground_floor')
            
            # Create opening hours
            opening_hours = {
                'Monday': data.get('hours', '10:00 AM - 9:00 PM'),
                'Tuesday': data.get('hours', '10:00 AM - 9:00 PM'),
                'Wednesday': data.get('hours', '10:00 AM - 9:00 PM'),
                'Thursday': data.get('hours', '10:00 AM - 9:00 PM'),
                'Friday': data.get('hours', '10:00 AM - 10:00 PM'),
                'Saturday': data.get('hours', '10:00 AM - 10:00 PM'),
                'Sunday': data.get('hours', '11:00 AM - 8:00 PM')
            }
            
            # Create new store
            new_store = store.objects.create(
                store_id=new_id,
                name=data.get('name'),
                category=data.get('category'),
                location=location_code,
                owner=data.get('manager'),
                contact_email=data.get('contact', f"{new_id.lower()}@store.com"),
                contact_phone=data.get('phone', ''),
                opening_hours=opening_hours,
                status='active'
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Store created successfully',
                'store_id': new_store.store_id,
                'store': {
                    'id': new_store.store_id,
                    'name': new_store.name,
                    'category': new_store.category,
                    'location': data.get('location'),
                    'manager': new_store.owner,
                    'contact': new_store.contact_email
                }
            })
        
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=400)
    
    return JsonResponse({'success': False, 'error': 'Invalid method'}, status=405)

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
                'location': store_obj.location,
                'location_display': store_obj.get_location_display(),
                'owner': store_obj.owner,
                'contact_email': store_obj.contact_email,
                'contact_phone': store_obj.contact_phone,
                'opening_hours': store_obj.opening_hours,
                'status': 'open' if store_obj.status == 'active' else 'closed' if store_obj.status == 'inactive' else 'maintenance',
                'status_display': store_obj.get_status_display(),
                'created_at': store_obj.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'updated_at': store_obj.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            }
            
            # Add sample performance data (in production, this would come from related models)
            performance_data = {
                'size': random.randint(600, 5000),
                'monthlyRent': random.randint(35000, 250000),
                'revenue': random.randint(300000, 5000000),
                'rating': round(random.uniform(3.5, 5.0), 1),
                'performance': random.choice(['low', 'medium', 'high', 'very-high']),
                'leaseEnd': (datetime.now() + timedelta(days=random.randint(30, 365))).strftime('%Y-%m-%d')
            }
            
            return JsonResponse({
                'success': True,
                'store': {**store_data, **performance_data}
            })
        
        elif request.method == 'PUT':
            # Update store
            data = json.loads(request.body)
            
            # Map location if provided
            if 'location' in data:
                location_mapping = {
                    'GF-North': 'ground_floor',
                    'GF-South': 'ground_floor',
                    'GF-East': 'ground_floor',
                    'GF-West': 'ground_floor',
                    '1F-North': 'first_floor',
                    '1F-South': 'first_floor',
                    '1F-East': 'first_floor',
                    '1F-West': 'first_floor',
                    '2F-North': 'second_floor',
                    '2F-South': 'second_floor',
                    '2F-East': 'second_floor',
                    '2F-West': 'second_floor'
                }
                store_obj.location = location_mapping.get(data.get('location'), store_obj.location)
            
            store_obj.name = data.get('name', store_obj.name)
            store_obj.category = data.get('category', store_obj.category)
            store_obj.owner = data.get('manager', store_obj.owner)
            store_obj.contact_email = data.get('contact', store_obj.contact_email)
            
            if 'status' in data:
                # Map frontend status to model status
                status_mapping = {
                    'open': 'active',
                    'closed': 'inactive',
                    'maintenance': 'maintenance'
                }
                store_obj.status = status_mapping.get(data.get('status'), store_obj.status)
            
            store_obj.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Store updated successfully',
                'store': {
                    'id': store_obj.store_id,
                    'name': store_obj.name
                }
            })
        
        elif request.method == 'DELETE':
            # Delete store
            store_name = store_obj.name
            store_obj.delete()
            return JsonResponse({
                'success': True,
                'message': f'Store "{store_name}" deleted successfully'
            })
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)

    return JsonResponse({'success': False, 'error': 'Invalid method'}, status=405)

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
    
    # Calculate revenue by category (sample data - in production this would be calculated from actual sales)
    revenue_multipliers = {
        'electronics': 2.5,
        'fashion': 1.8,
        'food': 1.2,
        'entertainment': 3.0,
        'beauty': 1.5,
        'home': 1.3,
        'sports': 1.6,
        'books': 0.8,
        'other': 1.0
    }
    
    category_revenue = {}
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

    

def api_top_stores(request):
    """API endpoint for top performing stores"""
    # Get all stores with sample revenue data
    stores_list = store.objects.all()
    top_stores = []
    
    for store_obj in stores_list:
        # In production, revenue would come from a related Sales model
        revenue = random.randint(300000, 5000000)
        top_stores.append({
            'id': store_obj.store_id,
            'name': store_obj.name,
            'category': store_obj.get_category_display(),
            'revenue': revenue,
            'rating': round(random.uniform(3.5, 5.0), 1)
        })
    
    # Sort by revenue and take top 5
    top_stores.sort(key=lambda x: x['revenue'], reverse=True)
    top_stores = top_stores[:5]
    
    return JsonResponse({
        'success': True,
        'top_stores': top_stores
    })
    
def api_lease_timeline(request):
    """API endpoint for lease expiry timeline"""
    stores_list = store.objects.all()
    lease_timeline = []
    
    for store_obj in stores_list:
        # Generate random lease end dates for demo (in production, this would come from a Lease model)
        days_until_lease = random.randint(15, 365)
        lease_end = datetime.now() + timedelta(days=days_until_lease)
        
        lease_timeline.append({
            'id': store_obj.store_id,
            'name': store_obj.name,
            'lease_end': lease_end.strftime('%Y-%m-%d'),
            'days_until': days_until_lease
        })
    
    # Sort by lease end date
    lease_timeline.sort(key=lambda x: x['days_until'])
    
    return JsonResponse({
        'success': True,
        'lease_timeline': lease_timeline[:5]  # Top 5 closest expiries
    })

def sales(request):
    return render(request, 'sales/sales.html')

def customers(request):
    return render(request, 'Customers/customers.html')

def inventory(request):
    return render(request, 'inventory/inventory.html')

