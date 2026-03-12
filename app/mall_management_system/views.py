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
import json
from .dashboard_services import DashboardService, CustomerService
import numpy as np
from rest_framework import status


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
    """Home/Index view with transaction entry and real-time data"""
    from django.utils import timezone
    
    service = DashboardService()
    
    context = {
        'current_day': service.now.day,
        'current_month': service.now.strftime('%B'),
        'current_year': service.now.year,
        'current_weekday': service.now.strftime('%A'),
        'date_range': f"{service.now.strftime('%B')} {service.now.year}",
    }
    
    return render(request, 'index.html', context)

def dashboard(request):
    """Dashboard view with all real data"""
    
    service = DashboardService()
    kpis_data = service.get_all_kpis()
    chart_data = service.get_all_chart_data()
    
    recent_transactions = service.get_recent_transactions(limit=5)
    context = {
        'kpis_data': kpis_data,
        'recent_transactions': recent_transactions,
        'current_day': service.now.day,
        'current_month': service.now.strftime('%B'),
        'current_year': service.now.year,
        'current_weekday': service.now.strftime('%A'),
        'date_range': f"{service.now.strftime('%B')} {service.now.year}",
        
       
        
        'weekly_labels':        json.dumps(chart_data.get('weekly_labels', ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])),
        'weekly_current_data':  json.dumps(chart_data.get('weekly_current_data', [0,0,0,0,0,0,0])),
        'weekly_last_week_data':json.dumps(chart_data.get('weekly_last_week_data', [0,0,0,0,0,0,0])),
        'category_labels':      json.dumps(chart_data.get('category_labels', [])),
        'category_data':        json.dumps(chart_data.get('category_data', [])),
        'category_colors':      json.dumps(chart_data.get('category_colors', [])),
        'visitor_labels':       json.dumps(chart_data.get('visitor_labels', ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])),
        'visitor_data':         json.dumps(chart_data.get('visitor_data', [0,0,0,0,0,0,0])),
        'heatmap_labels':       json.dumps(chart_data.get('heatmap_labels', ['10AM','12PM','2PM','4PM','6PM','8PM'])),
        'heatmap_data':         json.dumps(chart_data.get('heatmap_data', [0,0,0,0,0,0])),
    }
    
    return render(request, 'dashboard/dashboard.html', context)

def stores(request):
    """Main stores view"""
    service = DashboardService()
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
        },
        'current_day': service.now.day,
        'current_month': service.now.strftime('%B'),
        'current_year': service.now.year,
        'current_weekday': service.now.strftime('%A'),
        'date_range': f"{service.now.strftime('%B')} {service.now.year}",
    }
    
    
    return render(request, 'stores/stores.html', context)

def sales(request):
    """Sales view with date context"""
    service = DashboardService()
    context = {
        'current_day': service.now.day,
        'current_month': service.now.strftime('%B'),
        'current_year': service.now.year,
        'current_weekday': service.now.strftime('%A'),
        'date_range': f"{service.now.strftime('%B')} {service.now.year}",
    }
    return render(request, 'sales/sales.html', context)

# ==============================================================
# ML Prediction Api
#===============================================================

@api_view(['POST'])
def predict_customer_segment(request):
    """
    API endpoint to predict customer segment from transaction features.
    
    POST /api/customers/predict-segment/
    Body: {
        "quantity": 3,
        "unit_price": 499.99,
        "hour": 14,
        "day_of_week": 2
    }
    Returns: {
        "success": true,
        "cluster": 1,
        "segment": "Regular",
        "probabilities": {"New": 0.1, "Regular": 0.6, "Loyal": 0.2, "VIP": 0.1}
    }
    """
    try:
        data = request.data 
        required_fields = ['quantity', 'unit_price', 'hour', 'day_of_week'] 
        missing = [f for f in required_fields if f not in data]
        if missing:
            return Response({
                'success':False,
                'error': f"missing required fields : {','.join(missing)}",
            }, status = status.HTTP_400_BAD_REQUEST)
            
        # vector
        features = [
            float(data.get('quantity',0) or 0),
            float(data.get('unit_price',0) or 0),
            float(data.get('hour', 0) or 0),
            float(data.get('day_of_week', 0) or 0),
        ]
        from models import Segmenter
        segmenter = Segmenter('app/models/Customer_Segmentation_v1.pkl')
        cluster = segmenter.get_cluster(features)
        proba_raw = segmenter.get_probabilities(features)
        segment_names = {0:'Premium Retail',1:'Standard Retail',2:'Growth Retail',3:'wholesale'}
        segment = segment_names.get(int(cluster), 'Premium Retail')
        
        print(cluster)
        print(proba_raw)
        
        # format proba
        probabilities = {}
        if proba_raw is not None:
            for i, p in enumerate(proba_raw[0] if hasattr(proba_raw[0],'__iter__') else proba_raw):
                 probabilities[segment_names.get(i, f'Cluster {i}')] = round(float(p), 4)
                 
        return Response({
            'success':       True,
            'cluster':       int(cluster),
            'segment':       segment,
            'probabilities': probabilities,
            'features_used': {
                'quantity':    features[0],
                'unit_price':  features[1],
                'hour':        features[2],
                'day_of_week': features[3],
            }
        }, status=status.HTTP_200_OK)
        
        
    except FileNotFoundError:
          return Response({
            'success': False,
            'error': 'ML model file not found. Please ensure the model is trained and saved.'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    except Exception as e:
        return Response({
            'success': False,
            'error':   str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
#===================================================================
# segment Distribution
#===================================================================
@api_view(['GET'])
def get_segment_distribution(request):
    """
    API endpoint to get segment distribution for all transactions.
    
    GET /api/customers/segment-distribution/
    Returns: {
        "success": true,
        "segments": {
            "labels": ["New", "Regular", "Loyal", "VIP"],
            "values": [120, 340, 85, 22],
            "colors": ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6"],
            "percentages": {"New": 21.0, "Regular": 59.6, "Loyal": 14.9, "VIP": 3.9}
        },
        "total_processed": 567,
        "model_used": true
    }
    """
    try:
        from .models import Transaction
        from django.db.models import Count, Sum
        
        # Define the segment names and colors that match your frontend
        segment_order = ['New', 'Regular', 'Loyal', 'VIP']
        segment_colors = {
            'New': '#2563eb',
            'Regular': '#10b981', 
            'Loyal': '#f59e0b',
            'VIP': '#8b5cf6'
        }
        
        segment_counts = {'New': 0, 'Regular': 0, 'Loyal': 0, 'VIP': 0}
        model_used = False
        total_processed = 0

        # Try ML model first (if available)
        try:
            from models import Segmenter
            segmenter = Segmenter('app/models/Customer_Segmentation_v1.pkl')
            segment_names = {0: 'New', 1: 'Regular', 2: 'Loyal', 3: 'VIP'}
            
            data = list(Transaction.objects.values('quantity', 'unit_price', 'hour', 'day_of_week'))

            if data:
                model_used = True
                for item in data:
                    try:
                        features = [
                            float(item.get('quantity', 0) or 0),
                            float(item.get('unit_price', 0) or 0),
                            float(item.get('hour', 0) or 0),
                            float(item.get('day_of_week', 0) or 0),
                        ]
                        cluster = segmenter.get_cluster(features)
                        segment = segment_names.get(int(cluster), 'New')
                        segment_counts[segment] = segment_counts.get(segment, 0) + 1
                        total_processed += 1
                    except Exception as e:
                        print(f"Error processing item: {e}")
                        pass

        except Exception as e:
            # Fallback: use heuristic segmentation if model unavailable
            print(f'ML model unavailable, using heuristic: {e}')
            
            # Get customer transaction stats
            customer_stats = (
                Transaction.objects
                .values('customer_id')
                .annotate(
                    txn_count=Count('id'),
                    total_spend=Sum('total_amount')
                )
            )
            
            for c in customer_stats:
                txn_count = c['txn_count']
                total_spend = float(c['total_spend'] or 0)
                
                if txn_count >= 10 or total_spend >= 50000:
                    segment_counts['VIP'] += 1
                elif txn_count >= 5 or total_spend >= 20000:
                    segment_counts['Loyal'] += 1
                elif txn_count >= 2:
                    segment_counts['Regular'] += 1
                else:
                    segment_counts['New'] += 1
                total_processed += 1

        # Calculate percentages
        total = sum(segment_counts.values()) or 1
        percentages = {k: round((v / total) * 100, 1) for k, v in segment_counts.items()}

        # Prepare response in the format expected by frontend
        response_data = {
            'success': True,
            'segments': {
                'labels': segment_order,
                'values': [segment_counts[label] for label in segment_order],
                'colors': [segment_colors[label] for label in segment_order],
                'percentages': percentages,
            },
            'total_processed': total_processed,
            'model_used': model_used,
        }
        
        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

def customers(request):
    """Customers view with customer analytics data"""

    service = CustomerService()

    customer_data    = service.get_all_customer_data()
    recent_customers = service.get_recent_customers(limit=10)
    acquisition_data = service.get_acquisition_data()

    # Static fallback segment data — chart is populated via JS API call
    fallback_segments = {
        'labels': ['New', 'Regular', 'Loyal', 'VIP'],
        'values': [0, 0, 0, 0],
        'colors': ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'],
    }

    context = {
        'total_customers':            customer_data['total_customers'],
        'active_today':               customer_data['active_today'],
        'new_customers_today':        customer_data['new_customers_today'],
        'loyal_customers':            customer_data['loyal_customers'],
        'customer_growth':            customer_data['customer_growth'],
        'avg_customer_spend':         customer_data['avg_customer_spend'],
        'avg_customer_spend_formatted': f"₹{customer_data['avg_customer_spend']:,.0f}",
        'repeat_rate':                customer_data['repeat_rate'],
        'satisfaction_score':         customer_data['satisfaction_score'],
        'recent_customers':           recent_customers,

        # Acquisition chart
        'acquisition_dates':  json.dumps(acquisition_data['dates']),
        'acquisition_counts': json.dumps(acquisition_data['counts']),

        # Segment chart — loaded async via JS; pass fallback so chart renders immediately
        'segment_labels': json.dumps(fallback_segments['labels']),
        'segment_values': json.dumps(fallback_segments['values']),
        'segment_colors': json.dumps(fallback_segments['colors']),

        # Date context
        'current_day':     timezone.now().day,
        'current_month':   timezone.now().strftime('%B'),
        'current_year':    timezone.now().year,
        'current_weekday': timezone.now().strftime('%A'),
        'date_range':      f"{timezone.now().strftime('%B')} {timezone.now().year}",
    }

    return render(request, 'Customers/customers.html', context)

def inventory(request):
    """Inventory view with date context"""
    service = DashboardService()
    context = {
        'current_day': service.now.day,
        'current_month': service.now.strftime('%B'),
        'current_year': service.now.year,
        'current_weekday': service.now.strftime('%A'),
        'date_range': f"{service.now.strftime('%B')} {service.now.year}",
    }
    return render(request, 'inventory/inventory.html', context)

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
        from django.db.models.functions import ExtractHour
        from datetime import timedelta

        today = timezone.now().date()
        last_week = today - timedelta(days=7)

        # Hourly distribution for today
        hourly_data = Transaction.objects.filter(
            transaction_date=today
        ).values('hour') .annotate(
            count=Count('id'),
            total=Sum('total_amount')
        ).order_by('hour')

        # Category distribution
        category_data = Transaction.objects.values('category').annotate(
            count=Count('id'),
            total=Sum('total_amount')
        ).order_by('-total')

        # Weekly trend
        weekly_data = Transaction.objects.filter(
            transaction_date__gte=last_week
        ).values('transaction_date').annotate(
            count=Count('id'),                  # ✅ added count for richer data
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