from django.db import models
from django.utils import timezone
import uuid
from django.contrib.auth.models import User

class Store(models.Model):
    # Primary Key
    id = models.AutoField(primary_key=True)
    
    # Basic Information
    store_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200, verbose_name="Store Name")
    
    # Category and Location
    CATEGORY_CHOICES = [
        ('electronics', 'Electronics'),
        ('fashion', 'Fashion & Apparel'),
        ('food', 'Food & Beverage'),
        ('home', 'Home & Living'),
        ('beauty', 'Beauty & Cosmetics'),
        ('sports', 'Sports & Fitness'),
        ('entertainment', 'Entertainment'),
        ('books', 'Books & Stationery'),
        ('jewelry', 'Jewelry & Accessories'),
        ('other', 'Other')
    ]
    
    LOCATION_CHOICES = [
        ('GF-N', 'Ground Floor - North Wing'),
        ('GF-S', 'Ground Floor - South Wing'),
        ('GF-E', 'Ground Floor - East Wing'),
        ('GF-W', 'Ground Floor - West Wing'),
        ('1F-N', 'First Floor - North Wing'),
        ('1F-S', 'First Floor - South Wing'),
        ('1F-E', 'First Floor - East Wing'),
        ('1F-W', 'First Floor - West Wing'),
        ('2F-N', 'Second Floor - North Wing'),
        ('2F-S', 'Second Floor - South Wing'),
        ('2F-E', 'Second Floor - East Wing'),
        ('2F-W', 'Second Floor - West Wing'),
    ]
    
    category = models.CharField(
        max_length=50, 
        choices=CATEGORY_CHOICES,
        verbose_name="Category"
    )
    
    location = models.CharField(
        max_length=50, 
        choices=LOCATION_CHOICES,
        verbose_name="Location"
    )
    
    # Store Details
    size = models.IntegerField(
        verbose_name="Store Size (sq. ft.)",
        help_text="Store size in square feet"
    )
    
    monthly_rent = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Monthly Rent (₹)",
        help_text="Monthly rent in Indian Rupees"
    )
    
    manager = models.CharField(
        max_length=200,
        verbose_name="Store Manager"
    )
    
    description = models.TextField(
        verbose_name="Store Description",
        blank=True,
        help_text="Brief description of the store, products/services offered..."
    )
    
    contact_info = models.CharField(
        max_length=200,
        verbose_name="Contact Information",
        help_text="Phone number or email"
    )
    
    operating_hours = models.CharField(
        max_length=100,
        default="10:00 AM - 9:00 PM",
        verbose_name="Operating Hours"
    )
    
    # Status
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'Under Maintenance')
    ]
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name="Status"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['store_id']),
            models.Index(fields=['category']),
            models.Index(fields=['location']),
            models.Index(fields=['status'])
        ]
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.store_id})"
    
    def save(self, *args, **kwargs):
        # Auto-generate store ID if not provided
        if not self.store_id:
            last_store = Store.objects.order_by('store_id').last()
            if last_store:
                last_num = int(last_store.store_id[2:])
                self.store_id = f"ST{last_num + 1:03d}"
            else:
                self.store_id = "ST001"
        
        # Ensure contact_info is stored properly
        if not self.contact_info:
            self.contact_info = "Not provided"
        
        super().save(*args, **kwargs)
    
    def get_category_display(self):
        """Get the display name for category"""
        return dict(self.CATEGORY_CHOICES).get(self.category, self.category)
    
    def get_location_display(self):
        """Get the display name for location"""
        return dict(self.LOCATION_CHOICES).get(self.location, self.location)
    
    def get_status_display(self):
        """Get the display name for status"""
        return dict(self.STATUS_CHOICES).get(self.status, self.status)
    
    

class Transaction(models.Model):
    """Model for store transactions with ML features"""
    
    CATEGORY_CHOICES = [
        ('electronics', 'Electronics'),
        ('fashion', 'Fashion'),
        ('food', 'Food & Beverage'),
        ('beauty', 'Beauty'),
        ('sports', 'Sports'),
        ('home', 'Home & Living'),
        ('entertainment', 'Entertainment'),
        ('books', 'Books & Stationery'),
        ('other', 'Other'),
    ]
    
    # Basic transaction fields
    transaction_id = models.CharField(max_length=50, unique=True, editable=False)
    product_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    
    # Auto-calculated fields
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, editable=False)
    
    # ML Features - Auto-captured time data
    transaction_time = models.TimeField(auto_now_add=True)
    transaction_date = models.DateField(auto_now_add=True)
    transaction_datetime = models.DateTimeField(auto_now_add=True)
    
    # ML Feature fields (derived from datetime)
    hour = models.IntegerField(editable=False)  # 0-23
    day_of_week = models.IntegerField(editable=False)  # 0=Monday, 6=Sunday
    day_name = models.CharField(max_length=10, editable=False)  # Monday, Tuesday, etc.
    month = models.IntegerField(editable=False)  # 1-12
    month_name = models.CharField(max_length=10, editable=False)  # January, February, etc.
    year = models.IntegerField(editable=False)
    week_of_year = models.IntegerField(editable=False)  # 1-53
    is_weekend = models.BooleanField(default=False, editable=False)
    
    
    store_id =models.ForeignKey(Store, on_delete=models.CASCADE)  
    customer_id = models.ForeignKey(User, on_delete=models.CASCADE)  
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['category']),
            models.Index(fields=['hour']),
            models.Index(fields=['day_of_week']),
            models.Index(fields=['month']),
        ]
    
    def save(self, *args, **kwargs):
        """Override save to auto-calculate fields"""
        
        # Generate transaction ID if not set
        if not self.transaction_id:
            self.transaction_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"
        
        # Calculate total amount
        if self.quantity and self.unit_price:
            self.total_amount = self.quantity * self.unit_price
        
        # Set ML feature fields based on current time if this is a new transaction
        if not self.pk:  
            now = timezone.now()
            self.transaction_datetime = now
            self.transaction_date = now.date()
            self.transaction_time = now.time()
            
            # Extract ML features
            self.hour = now.hour
            self.day_of_week = now.weekday()  # 0 = Monday
            self.day_name = now.strftime('%A')
            self.month = now.month
            self.month_name = now.strftime('%B')
            self.year = now.year
            self.week_of_year = now.isocalendar()[1]
            self.is_weekend = self.day_of_week >= 5  # 5 = Saturday, 6 = Sunday
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.transaction_id} - {self.product_name} - ₹{self.total_amount}"

    @property
    def formatted_time(self):
        """Return formatted time string"""
        return self.transaction_time.strftime('%H:%M:%S')
    
    @property
    def formatted_date(self):
        """Return formatted date string"""
        return self.transaction_date.strftime('%d %b %Y')