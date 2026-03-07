from django.utils import timezone
from django.db.models import Sum, Count, Avg
from datetime import timedelta
from ..models import Transaction
from django.contrib.auth.models import User

class DashBoard:
    def __self__(self):
        self.now = timezone.now()
        self.today = self.now.today()
        self.last_week = self.today - timedelta(days=7)
        self.last_months = self.today - timedelta(days=30)
        self.prev_month_start = self.last_month - timedelta(days=30)
        self.prev_month_end = self.last_month - timedelta(days=1)
        
    # KPI Methods
    
    def get_total_sales(self):
        """Get total sales for last 30 days"""
        return Transaction.objects.filter(
            transaction_date__gte=self.last_month
        ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    