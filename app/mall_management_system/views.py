from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Avg
from django.views.decorators.csrf import csrf_exempt
from .models import Store

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

def get_store_details(request, store_id):
    """API endpoint to get store details"""
    try:
        store = Store.objects.get(store_id=store_id)
        return JsonResponse({
            'success': True,
            'store': {
                'id': store.store_id,
                'name': store.name,
                'category': store.category,
                'category_display': store.get_category_display(),
                'location': store.location,
                'location_display': store.get_location_display(),
                'status': store.status,
                'status_display': store.get_status_display(),
                'size': store.size,
                'monthly_rent': str(store.monthly_rent),
                'manager': store.manager,
                'contact_info': store.contact_info,
                'operating_hours': store.operating_hours,
                'description': store.description,
                'created_at': store.created_at.strftime('%Y-%m-%d %H:%M') if store.created_at else None,
            }
        })
    except Store.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Store not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
def create_store(request):
    """API endpoint to create a new store"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
    
    try:
        import json
        data = json.loads(request.body)
        
        store = Store.objects.create(
            name=data.get('name'),
            category=data.get('category'),
            location=data.get('location'),
            status=data.get('status', 'active'),
            size=data.get('size'),
            monthly_rent=data.get('monthly_rent'),
            manager=data.get('manager'),
            contact_info=data.get('contact_info'),
            description=data.get('description', ''),
            operating_hours=data.get('operating_hours', '10:00 AM - 9:00 PM'),
        )
        
        return JsonResponse({
            'success': True,
            'store': {
                'id': store.store_id,
                'name': store.name,
            }
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

