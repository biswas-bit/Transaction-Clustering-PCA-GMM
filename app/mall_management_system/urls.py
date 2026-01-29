from django.urls import path
from . import views

app_name = 'mall_management_system'

urlpatterns = [
    path ('',views.index, name="index"),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('stores/', views.stores, name='stores'),
    path('sales/',views.sales, name='sales'),
    path('customers/',views.customers, name='customers'),
    path('inventory/',views.inventory, name='inventory'),
    path('api/stores/', views.api_stores, name='api_stores'),
     path('api/stores/<str:store_id>/', views.api_store_detail, name='api_store_detail'),
    path('api/store-stats/', views.api_store_stats, name='api_store_stats'),
     path('api/top-stores/', views.api_top_stores, name='api_top_stores'),
     path('api/lease-timeline/', views.api_lease_timeline, name='api_lease_timeline'),
    
]
