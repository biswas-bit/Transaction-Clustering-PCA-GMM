from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Avg
from django.views.decorators.csrf import csrf_exempt
from .models import Store, Transaction
from django.db.models import Sum, Avg, Count
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import TransactionCreateSerializer, TransactionSerializer
from django.utils import timezone

# Try to import Decimal128 for MongoDB compatibility
# This will only be used when running with MongoDB (djongo)
try:
    from bson.decimal128 import Decimal128
    DECIMAL128_AVAILABLE = True
except ImportError:
    Decimal128 = None
    DECIMAL128_AVAILABLE = False


def convert_decimal128(value):
    """
    Convert MongoDB Decimal128 to Python float.
    This handles the 'conversion from Decimal128 to Decimal is not supported' error.
    Works with both SQLite and MongoDB backends.
    """
    if value is None:
        return 0
    if DECIMAL128_AVAILABLE and isinstance(value, Decimal128):
        # Convert Decimal128 to string, then to float
        return float(str(value))
    # Handle Python's Decimal type
    from decimal import Decimal
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (int, float)):
        return value
    return value

def index(request):
    return render(request, 'index.html')

def dashboard(request):
    return render(request, 'dashboard/dashboard.html')

def stores(request):
    """Main stores view"""
    stores_list = Store.objects.all()
    total_stores = stores_list.count()
    # Get real statistics
    active_stores = stores_list.filter(status='active').count()
    inactive_stores = stores_list.filter(status='inactive').count()
    maintenance_stores = stores_list.filter(status='maintenance').count()
    
    # Calculate averages from actual data
    # Use convert_decimal128 to handle MongoDB Decimal128 type
    avg_size_result = stores_list.aggregate(avg_size=Avg('size'))['avg_size']
    avg_rent_result = stores_list.aggregate(avg_rent=Avg('monthly_rent'))['avg_rent']
    
    # Convert Decimal128 to float if needed (for MongoDB compatibility)
    avg_size = convert_decimal128(avg_size_result)
    avg_rent = convert_decimal128(avg_rent_result)
    
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
        
        # Convert monthly_rent to handle MongoDB Decimal128 type
        monthly_rent_value = convert_decimal128(store.monthly_rent)
        
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
                'monthly_rent': str(monthly_rent_value),
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
        print("executed here")
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)
    
    try:
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
        print("print executed in last")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
@api_view(['POST'])
def create_transaction(request):
    """ API endpoint to create a new transaction """
    if request.method == 'POST':
        try:
            # Create mutable copy of request data
            data = request.data.copy()
            
            # Check authentication
            if not request.user.is_authenticated:
                return Response({
                    'success': False,
                    'error': 'Authentication required'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # ✅ Set a default store if none provided
            if 'store_id' not in data or not data.get('store_id'):
                # Get first store or create a default one
                default_store = Store.objects.first()
                if default_store:
                    data['store_id'] = default_store.id
                else:
                    return Response({
                        'success': False,
                        'error': 'No store available. Please create a store first.'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = TransactionCreateSerializer(data=data)
            
            if serializer.is_valid():
                # Pass customer_id during save
                transaction = serializer.save(customer_id=request.user)
                
                response_serializer = TransactionSerializer(transaction)
                return Response({
                    'success': True,
                    'transaction': response_serializer.data
                }, status=status.HTTP_201_CREATED)
                
            else:
                print("Serializer errors:", serializer.errors)
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print("Exception:", str(e))
            import traceback
            traceback.print_exc()
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'success': False,
        'error': 'Method not allowed'
    }, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    
@api_view(['GET'])
def get_transactions(request):
    """API endpoint to get recent transactions"""
    try:
        # Get latest 50 transactions
        transactions = Transaction.objects.all()[:50]
        serializer = TransactionSerializer(transactions, many=True)
        
        # Calculate summary stats
        today = timezone.now().date()
        today_transactions = Transaction.objects.filter(transaction_date=today)
        
        today_total = today_transactions.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        today_count = today_transactions.count()
        avg_transaction = today_transactions.aggregate(Avg('total_amount'))['total_amount__avg'] or 0
        
        return Response({
            'success': True,
            'transactions': serializer.data,
            'summary': {
                'today_total': float(today_total),
                'today_count': today_count,
                'avg_transaction': float(avg_transaction)
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            

@api_view(['DELETE'])
def clear_transactions(request):
    """ Endpoint to Clear all transactions """
    try:
        count = Transaction.objects.all().delete()[0]
        return Response({
            'success': True,
            'message': f'{count} transactions cleared'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

@api_view(['GET'])
def get_analytics(request):
    """API endpoint to get transaction analytics for charts"""
    try:
        from django.db.models.functions import ExtractHour, ExtractWeekDay
        
        # Hourly distribution for today
        today = timezone.now().date()
        hourly_data = Transaction.objects.filter(
            transaction_date=today
        ).annotate(
            hour=ExtractHour('transaction_datetime')
        ).values('hour').annotate(
            count=Count('id'),
            total=Sum('total_amount')
        ).order_by('hour')
        
        # Category distribution
        category_data = Transaction.objects.values('category').annotate(
            count=Count('id'),
            total=Sum('total_amount')
        ).order_by('-total')
        
        # Weekly trend
        from datetime import timedelta
        last_week = today - timedelta(days=7)
        weekly_data = Transaction.objects.filter(
            transaction_date__gte=last_week
        ).values('transaction_date').annotate(
            total=Sum('total_amount')
        ).order_by('transaction_date')
        
        return Response({
            'success': True,
            'analytics': {
                'hourly': list(hourly_data),
                'categories': list(category_data),
                'weekly': list(weekly_data)
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            