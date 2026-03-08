# services/dashboard_service.py
from django.utils import timezone
from django.db.models import Sum, Count, Avg
from datetime import timedelta
from .models import Transaction
from django.contrib.auth.models import User

class DashboardService:
    """Service class to handle all dashboard data calculations"""
    
    def __init__(self):
        self.now = timezone.now()
        self.today = self.now.date()
        self.last_week = self.today - timedelta(days=7)
        self.last_month = self.today - timedelta(days=30)
        self.prev_month_start = self.last_month - timedelta(days=30)
        self.prev_month_end = self.last_month - timedelta(days=1)
    
    # ============================================================
    # KPI Methods
    # ============================================================
    
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
        sales_change = round(self.get_sales_change_percentage(), 1)
        visitors_change = round(self.get_visitors_change_percentage(), 1)
        
        return {
            'total_sales': self._format_currency(total_sales),        # ✅ formatted for display
            'total_sales_raw': total_sales,
            'total_visitors': self._format_number(total_visitors),     # ✅ formatted for display
            'total_visitors_raw': total_visitors,
            'total_transactions': self.get_total_transactions(),
            'conversion_rate': round(self.get_conversion_rate(), 1),
            'profit_margin': 24.6,
            'sales_change': sales_change,
            'visitors_change': visitors_change,
            'sales_change_direction': 'positive' if sales_change >= 0 else 'negative',    # ✅ added
            'visitors_change_direction': 'positive' if visitors_change >= 0 else 'negative',  # ✅ added
        }
    
    # ============================================================
    # Chart Data Methods
    # ============================================================
    
    def get_weekly_sales_data(self):
        """Get sales data for last 7 days"""
        data = []
        labels = []
        for i in range(6, -1, -1):
            day = self.today - timedelta(days=i)
            day_sales = Transaction.objects.filter(
                transaction_date=day
            ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            data.append(float(day_sales))
            labels.append(day.strftime('%a'))
        return {'labels': labels, 'data': data}
    
    def get_last_week_sales_data(self):
        """Get sales data for the week before last"""
        data = []
        for i in range(6, -1, -1):
            day = self.last_week - timedelta(days=i)
            day_sales = Transaction.objects.filter(
                transaction_date=day
            ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            data.append(float(day_sales))
        return data
    
    def get_category_data(self):
        """Get sales distribution by category"""
        category_data = Transaction.objects.values('category').annotate(
            total=Sum('total_amount')
        ).order_by('-total')
        
        labels = []
        data = []
        categories = []
        
        for item in category_data:
            if item['category']:
                category_display = dict(Transaction.CATEGORY_CHOICES).get(item['category'], item['category'])
                labels.append(category_display)
                data.append(float(item['total']))
                categories.append(item['category'])
        
        colors = self._get_category_colors(categories)
        
        return {
            'labels': labels,
            'data': data,
            'colors': colors
        }
    
    def get_hourly_data(self):
        """Get hourly sales data for today (used as heatmap)"""
        data = []
        labels = []
        
        for hour in range(10, 22, 2):  # 10AM to 8PM
            hour_start = self.now.replace(hour=hour, minute=0, second=0, microsecond=0)
            hour_end = hour_start + timedelta(hours=2)
            
            hour_sales = Transaction.objects.filter(
                transaction_datetime__range=[hour_start, hour_end]
            ).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
            
            data.append(float(hour_sales))
            # ✅ Fixed label logic — was showing wrong PM labels
            if hour == 12:
                label = "12:00 PM"
            elif hour < 12:
                label = f"{hour}:00 AM"
            else:
                label = f"{hour - 12}:00 PM"
            labels.append(label)
        
        return {'labels': labels, 'data': data}
    
    def get_visitors_per_day(self):
        """Get visitors per day for last 7 days"""
        data = []
        for i in range(6, -1, -1):
            day = self.today - timedelta(days=i)
            day_visitors = Transaction.objects.filter(
                transaction_date=day
            ).aggregate(Sum('quantity'))['quantity__sum'] or 0
            data.append(day_visitors)
        return data
    
    def get_all_chart_data(self):
        """Get all chart data in one dictionary"""
        weekly = self.get_weekly_sales_data()
        category = self.get_category_data()
        hourly = self.get_hourly_data()
        
        return {
            'weekly_labels': weekly['labels'],
            'weekly_current_data': weekly['data'],                      # ✅ renamed from weekly_sales_data
            'weekly_last_week_data': self.get_last_week_sales_data(),
            'category_labels': category['labels'],
            'category_data': category['data'],
            'category_colors': category['colors'],
            'visitor_labels': weekly['labels'],
            'visitor_data': self.get_visitors_per_day(),
            'heatmap_labels': hourly['labels'],                         # ✅ added
            'heatmap_data': hourly['data'],                             # ✅ added
        }
    
    # ============================================================
    # Recent Transactions
    # ============================================================
    
    def get_recent_transactions(self, limit=5):
        """Get recent transactions formatted for the template"""
        transactions = Transaction.objects.select_related(
            'store_id', 'customer_id'
        ).order_by('-created_at')[:limit]
        
        # ✅ Return a list of dicts matching what the template expects
        result = []
        for t in transactions:
            result.append({
                'customer_name': t.customer_id.get_full_name() or t.customer_id.username,
                'store_name': t.store_id.name if t.store_id else '—',
                'amount_formatted': self._format_currency(t.total_amount),
                'time': t.transaction_datetime.strftime('%d %b, %H:%M'),
                'status': 'completed',  # or derive from a status field if you add one
            })
        return result
    
    # ============================================================
    # Helper Methods
    # ============================================================
    
    def _format_currency(self, value):
        """Format currency values"""
        value = float(value)
        if value >= 100000:
            return f"₹{value/100000:.2f}L"
        elif value >= 1000:
            return f"₹{value/1000:.1f}K"
        return f"₹{value:,.0f}"
    
    def _format_number(self, value):
        """Format large numbers"""
        if value >= 1000:
            return f"{value/1000:.1f}K"
        return str(value)
    
    def _get_category_colors(self, categories):
        """Get colors for categories"""
        color_map = {
            'electronics': '#2563eb',
            'fashion': '#f59e0b',
            'food': '#10b981',
            'beauty': '#ef4444',
            'sports': '#8b5cf6',
            'home': '#64748b',
            'entertainment': '#ec4899',
            'books': '#14b8a6',
            'jewelry': '#f97316',
            'other': '#6b7280'
        }
        return [color_map.get(cat, '#6b7280') for cat in categories]


class SalesService:
    """Service class for sales analytics"""
    
    def __init__(self):
        self.now = timezone.now()
        self.today = self.now.date()
    
    def get_monthly_sales(self):
        return Transaction.objects.filter(
            transaction_date__month=self.now.month,
            transaction_date__year=self.now.year
        ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    def get_weekly_sales(self):
        week_start = self.today - timedelta(days=self.today.weekday())
        return Transaction.objects.filter(
            transaction_date__gte=week_start
        ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    def get_daily_sales(self):
        return Transaction.objects.filter(
            transaction_date=self.today
        ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    def get_all_sales_data(self):
        monthly = self.get_monthly_sales()
        weekly = self.get_weekly_sales()
        daily = self.get_daily_sales()
        
        return {
            'monthly_sales': monthly,
            'monthly_sales_formatted': f"₹{monthly:,.0f}",
            'weekly_sales': weekly,
            'weekly_sales_formatted': f"₹{weekly:,.0f}",
            'daily_sales': daily,
            'daily_sales_formatted': f"₹{daily:,.0f}",
            'month_name': self.now.strftime('%B'),
        }


class CustomerService:
    """Service class for customer analytics"""
    
    def get_total_customers(self):
        return User.objects.filter(is_active=True).count()
    
    def get_active_today(self):
        return Transaction.objects.filter(
            transaction_date=timezone.now().date()
        ).values('customer_id').distinct().count()
    
    def get_all_customer_data(self):
        return {
            'total_customers': self.get_total_customers(),
            'active_today': self.get_active_today(),
        }