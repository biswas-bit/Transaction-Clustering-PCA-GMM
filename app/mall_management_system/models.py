from django.db import models
from djongo import models as djongo_models

class Store(models.Model):
    # Basic Information
    store_id = djongo_models.CharField(max_length=50, unique=True)
    name = djongo_models.CharField(max_length=200, verbose_name="Store Name")
    
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
    
    category = djongo_models.CharField(
        max_length=50, 
        choices=CATEGORY_CHOICES,
        verbose_name="Category"
    )
    
    location = djongo_models.CharField(
        max_length=50, 
        choices=LOCATION_CHOICES,
        verbose_name="Location"
    )
    
    # Store Details
    size = djongo_models.IntegerField(
        verbose_name="Store Size (sq. ft.)",
        help_text="Store size in square feet"
    )
    
    monthly_rent = djongo_models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Monthly Rent (₹)",
        help_text="Monthly rent in Indian Rupees"
    )
    
    manager = djongo_models.CharField(
        max_length=200,
        verbose_name="Store Manager"
    )
    
    description = djongo_models.TextField(
        verbose_name="Store Description",
        blank=True,
        help_text="Brief description of the store, products/services offered..."
    )
    
    contact_info = djongo_models.CharField(
        max_length=200,
        verbose_name="Contact Information",
        help_text="Phone number or email"
    )
    
    operating_hours = djongo_models.CharField(
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
    
    status = djongo_models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name="Status"
    )
    
    # Timestamps
    created_at = djongo_models.DateTimeField(auto_now_add=True)
    updated_at = djongo_models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            djongo_models.Index(fields=['store_id']),
            djongo_models.Index(fields=['category']),
            djongo_models.Index(fields=['location']),
            djongo_models.Index(fields=['status'])
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