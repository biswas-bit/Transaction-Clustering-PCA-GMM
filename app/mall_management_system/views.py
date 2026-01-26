from django.shortcuts import render,HttpResponse


def index(request):
    return render(request, 'index.html')

def dashboard(request):
    return render(request, 'dashboard/dashboard.html')

def stores(request):
    return render(request, 'stores/stores.html')

def sales(request):
    return render(request, 'sales/sales.html')

