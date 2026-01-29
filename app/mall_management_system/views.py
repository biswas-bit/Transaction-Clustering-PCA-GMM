from django.shortcuts import render,HttpResponse
from . models import store

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

def sales(request):
    return render(request, 'sales/sales.html')

def customers(request):
    return render(request, 'Customers/customers.html')

def inventory(request):
    return render(request, 'inventory/inventory.html')

