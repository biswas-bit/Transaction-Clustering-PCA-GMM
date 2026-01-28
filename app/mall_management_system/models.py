from django.db import models
from djongo import models as djongo_models
from django.contrib.auth.models import User

class store(models.Model):
    _id = djongo_models.ObjectIdField()
    store_id = djongo_models.CharField(max_length=50, unique=True)
    name = djongo_models.CharField(max_length=200)
    category = models.CharField(max_length=100, choices=[
        ('electronics', 'Electronics'),
        ('fashion', 'Fashion & Apparel'),
        ('food', 'Food & Beverage'),
        ('home', 'Home & Living'),
        ('beauty', 'Beauty & Cosmetics'),
        ('sports', 'Sports & Fitness'),
        ('entertainment', 'Entertainment'),
        ('books', 'Books & Stationery'),
        ('other', 'Other')
    ])
    location = djongo_models.CharField(max_length=100, choices=[
        ('ground_floor', 'Ground Floor'),
        ('first_floor', 'First Floor'),
        ('second_floor', 'Second Floor'),
        ('third_floor', 'Third Floor'),
        ('food_court', 'Food Court'),
        ('entertainment_zone', 'Entertainment Zone')
    ])
    
    owner = djongo_models.CharField(max_length=200)
    contact_email = djongo_models.EmailField()
    contact_phone = djongo_models.CharField(max_length=15)
    opening_hours = djongo_models.JSONField(default=dict)  # e.g., {"Monday": "9am-9pm", "Tuesday": "9am-9pm", ...}
    status = djongo_models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'Under Maintenance')
    ], default='active')
    created_at = djongo_models.DateTimeField(auto_now_add=True)
    updated_at = djongo_models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            djongo_models.Index(fields=['store_id']),
            djongo_models.Index(fields=['category']),
            djongo_models.Index(fields=['location'])
        ]
    def __str__(self):
        return f"{self.name}({self.store_id})"
    
    
