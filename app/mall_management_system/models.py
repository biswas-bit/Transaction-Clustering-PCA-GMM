from django.db import models
from django.contrib.auth.models import User

class store(models.Model):
    _id = models.ObjectField()
    store_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
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
    location = models.CharField(max_length=100, choices=[
        ('ground_floor', 'Ground Floor'),
        ('first_floor', 'First Floor'),
        ('second_floor', 'Second Floor'),
        ('third_floor', 'Third Floor'),
        ('food_court', 'Food Court'),
        ('entertainment_zone', 'Entertainment Zone')
    ])
    
    owner = models.CharField(ma_length=200)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=15)
    opening_hours = models.JSONField(default=dict)  # e.g., {"Monday": "9am-9pm", "Tuesday": "9am-9pm", ...}
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'Under Maintenance')
    ], default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['store_id']),
            models.index(fields=['category']),
            models.Index(fields=['loaction'])
        ]
    def __str__(self):
        return f"{self.name}({self.store_id})"
    
    
