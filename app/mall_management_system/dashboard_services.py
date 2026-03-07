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
    
    def get_total_visitors(self):
        """Get total visitors (quantity sum) for last 30 days"""
        return Transaction.objects.filter(
            transaction_date__gte=self.last_month
        ).aggregate(Sum('quantity'))['quantity__sum'] or 0
        
    
    def get_total_transactions(self):
        """Get total transaction count for last 30 days"""
        return Transaction.objects.filter(
            transaction_date__gte=self.last_month
        ).count()
        
    def get_conversion_rate(self):
        """Calculate conversion rate (transactions/visitors * 100)"""
        visitors = self.get_total_visitors()
        transactions = self.get_total_transactions()
        return (transactions / visitors * 100) if visitors > 0 else 0
    
    def get_prev_month_sales(self):
        """Get sales for previous month"""
        return Transaction.objects.filter(
            transaction_date__range=[self.prev_month_start, self.prev_month_end]
        ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        
    def get_prev_month_visitors(self):
        """Get visitors for previous month"""
        return Transaction.objects.filter(
            transaction_date__range=[self.prev_month_start, self.prev_month_end]
        ).aggregate(Sum('quantity'))['quantity__sum'] or 0
        
    def get_sales_change_percentage(self):
        """Calculate sales change percentage vs previous month"""
        current = self.get_total_sales()
        previous = self.get_prev_month_sales()
        return ((current - previous) / previous * 100) if previous > 0 else 0
    
    def get_visitors_change_percentage(self):
        """Calculate visitors change percentage vs previous month"""
        current = self.get_total_visitors()
        previous = self.get_prev_month_visitors()
        return ((current - previous) / previous * 100) if previous > 0 else 0
    
    def get_all_kpis(self):
        """Get all KPI data in one dictionary"""
        total_sales = self.get_total_sales()
        total_visitors = self.get_total_visitors()
        
        return {
            'total_sales': total_sales,
            'total_sales_formatted': self._format_currency(total_sales),
            'total_visitors': total_visitors,
            'total_visitors_formatted': self._format_number(total_visitors),
            'total_transactions': self.get_total_transactions(),
            'conversion_rate': round(self.get_conversion_rate(), 1),
            'profit_margin': 24.6,  # This could come from a settings or calculation
            'sales_change': round(self.get_sales_change_percentage(), 1),
            'visitors_change': round(self.get_visitors_change_percentage(), 1),
        }