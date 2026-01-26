from django.urls import path
from . import views

app_name = 'mall_management_system'

urlpatterns = [
    path ('',views.index, name="index"),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('stores/', views.stores, name='stores'),
]
