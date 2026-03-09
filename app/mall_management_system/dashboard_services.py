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
        """Get all customer data in one dictionary"""
        return {
            'total_customers': self.get_total_customers(),
            'active_today': self.get_active_today(),

            'new_customers_today': self.get_new_customers_today(),
            'loyal_customers': self.get_loyal_customers(),
            'customer_growth': self.get_customer_growth_percentage(),
            'avg_customer_spend': self.get_avg_customer_spend(),
            'repeat_rate': self.get_repeat_rate(),
            'satisfaction_score': 4.8,  
        }
    
    def get_new_customers_today(self):
        """Get customers who made their first transaction today"""
        today = timezone.now().date()
        # Get users who have their first transaction today
        from django.db.models import Min
        first_transactions = Transaction.objects.values('customer_id').annotate(
            first_date=Min('transaction_date')
        ).filter(first_date=today)
        return first_transactions.count()
    
    def get_loyal_customers(self):
        """Get customers with 5+ transactions"""
        from django.db.models import Count
        return Transaction.objects.values('customer_id').annotate(
            count=Count('id')
        ).filter(count__gte=5).count()
    
    def get_customer_growth_percentage(self):
        """Calculate customer growth percentage vs last month"""
        from datetime import timedelta
        today = timezone.now().date()
        last_month = today - timedelta(days=30)
        prev_month = last_month - timedelta(days=30)
        
        current_month_customers = Transaction.objects.filter(
            transaction_date__gte=last_month
        ).values('customer_id').distinct().count()
        
        prev_month_customers = Transaction.objects.filter(
            transaction_date__range=[prev_month, last_month]
        ).values('customer_id').distinct().count()
        
        if prev_month_customers > 0:
            growth = ((current_month_customers - prev_month_customers) / prev_month_customers) * 100
            return round(growth, 1)
        return 0
    
    def get_avg_customer_spend(self):
        """Get average spend per customer"""
        from django.db.models import Avg, Sum
        customer_spends = Transaction.objects.values('customer_id').annotate(
            total_spend=Sum('total_amount')
        ).aggregate(avg_spend=Avg('total_spend'))['avg_spend']
        
        if customer_spends:
            return round(float(customer_spends), 2)
        return 0
    
    def get_repeat_rate(self):
        """Calculate percentage of customers with multiple transactions"""
        total_customers = self.get_total_customers()
        if total_customers == 0:
            return 0
        
        from django.db.models import Count
        repeat_customers = Transaction.objects.values('customer_id').annotate(
            count=Count('id')
        ).filter(count__gte=2).count()
        
        return round((repeat_customers / total_customers) * 100, 1)
    
    def get_recent_customers(self, limit=10):
        """Get recent customers with their transaction data"""
        from django.db.models import Sum, Count, Max
        
        recent = Transaction.objects.values(
            'customer_id__id', 
            'customer_id__username',
            'customer_id__email',
            'customer_id__first_name',
            'customer_id__last_name'
        ).annotate(
            total_spend=Sum('total_amount'),
            visit_count=Count('id'),
            last_visit=Max('transaction_datetime')
        ).order_by('-last_visit')[:limit]
        
        customers_list = []
        for c in recent:
            # Determine segment based on visit count
            if c['visit_count'] >= 10:
                segment = 'vip'
                segment_display = 'VIP'
            elif c['visit_count'] >= 5:
                segment = 'loyal'
                segment_display = 'Loyal'
            elif c['visit_count'] >= 2:
                segment = 'regular'
                segment_display = 'Regular'
            else:
                segment = 'new'
                segment_display = 'New'
            
            # Format name
            first_name = c.get('customer_id__first_name', '')
            last_name = c.get('customer_id__last_name', '')
            if first_name or last_name:
                name = f"{first_name} {last_name}".strip()
            else:
                name = c.get('customer_id__username', 'Unknown')
            
            customers_list.append({
                'id': c['customer_id__id'],
                'name': name,
                'email': c.get('customer_id__email', ''),
                'segment': segment,
                'segment_display': segment_display,
                'total_spend': float(c['total_spend']) if c['total_spend'] else 0,
                'total_spend_formatted': f"₹{float(c['total_spend']):,.0f}" if c['total_spend'] else '₹0',
                'visit_count': c['visit_count'],
                'last_visit': c['last_visit'].strftime('%d %b %Y, %I:%M %p') if c['last_visit'] else 'Never',
            })
        
        return customers_list
    
    def get_acquisition_data(self):
        """Get customer acquisition trend for the last 30 days"""
        from datetime import timedelta
        from django.db.models import Count
        
        today = timezone.now().date()
        dates = []
        counts = []
        
        for i in range(29, -1, -1):
            day = today - timedelta(days=i)
            
            # Get unique customers per day
            day_customers = Transaction.objects.filter(
                transaction_date=day
            ).values('customer_id').distinct().count()
            
            dates.append(day.strftime('%Y-%m-%d'))
            counts.append(day_customers)
        
        return {
            'dates': dates,
            'counts': counts,
        }
    
    def get_segment_data(self): # this is currently just static later i will integrate with our trained model
        """Get customer segment distribution"""
        from django.db.models import Count
        
        # Get customer counts by segment
        segment_counts = Transaction.objects.values(
            'customer_id'
        ).annotate(
            visit_count=Count('id')
        )
        
        # Count customers in each segment
        new_count = 0
        regular_count = 0
        loyal_count = 0
        vip_count = 0
        
        for c in segment_counts:
            if c['visit_count'] >= 10:
                vip_count += 1
            elif c['visit_count'] >= 5:
                loyal_count += 1
            elif c['visit_count'] >= 2:
                regular_count += 1
            else:
                new_count += 1
        
        # If no transaction data, provide default distribution
        if segment_counts.count() == 0:
            new_count = 10
            regular_count = 15
            loyal_count = 8
            vip_count = 2
        
        return {
            'labels': ['New', 'Regular', 'Loyal', 'VIP'],
            'values': [new_count, regular_count, loyal_count, vip_count],
            'colors': ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'],
        }
