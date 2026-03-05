from django.urls import path
from . import views

app_name = 'mall_management_system'

urlpatterns = [
    path('', views.index, name="index"),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('stores/', views.stores, name='stores'),
    path('sales/', views.sales, name='sales'),
    path('customers/', views.customers, name='customers'),
    path('inventory/', views.inventory, name='inventory'),
    #api
    path('api/stores/create/', views.create_store, name='create_store'),
    path('api/stores/<str:store_id>/', views.get_store_details, name='store_details'),
    
    # Transaction APIS
    path('api/transactions/create/', views.create_transaction, name='create_transaction'),
    path('api/transactions/', views.get_transactions, name='get_transactions'),
     path('api/transactions/clear/', views.clear_transactions, name='clear_transactions'),
    
    
]
