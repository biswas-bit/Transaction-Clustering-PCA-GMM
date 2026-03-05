from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Transaction, Store

class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model"""
    
    formatted_time = serializers.ReadOnlyField()
    formatted_date = serializers.ReadOnlyField()
    store_name = serializers.CharField(source='store.name', read_only=True)
    customer_username = serializers.CharField(source='customer.username', read_only=True)
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'transaction_id',
            'product_name',
            'quantity',
            'unit_price',
            'category',
            'total_amount',
            'transaction_time',
            'transaction_date',
            'transaction_datetime',
            'hour',
            'day_of_week',
            'day_name',
            'month',
            'month_name',
            'year',
            'week_of_year',
            'is_weekend',
            'formatted_time',
            'formatted_date',
            'store',
            'store_name',
            'customer',
            'customer_username',
            'customer_email',
            'created_at',
        ]
        read_only_fields = [
            'transaction_id',
            'total_amount',
            'transaction_time',
            'transaction_date',
            'transaction_datetime',
            'hour',
            'day_of_week',
            'day_name',
            'month',
            'month_name',
            'year',
            'week_of_year',
            'is_weekend',
            'created_at',
            'store_name',
            'customer_username',
            'customer_email',
        ]

class TransactionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating transactions"""
    
    # Accept store ID and customer ID as integers
    store = serializers.PrimaryKeyRelatedField(
        queryset=Store.objects.all(),
        required=False,
        allow_null=True
    )
    customer = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Transaction
        fields = [
            'product_name',
            'quantity',
            'unit_price',
            'category',
            'store',
            'customer',
        ]
    
    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1")
        return value
    
    def validate_unit_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Unit price must be greater than 0")
        return value