from rest_framework import Serializers
from .models import Transaction

class TransactionSerializers(Serializers.ModelSerializers):
    """ Read Only Searilizers for Transaction Data"""
    formatted_time = Serializers.ReadOnlyField()
    formatted_date = Serializers.ReadOnlyField()
    
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
        ]
        
