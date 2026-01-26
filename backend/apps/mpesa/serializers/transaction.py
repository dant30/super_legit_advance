# backend/apps/mpesa/serializers/transaction.py
from rest_framework import serializers
from apps.mpesa.models import MpesaTransaction


class MpesaTransactionSerializer(serializers.ModelSerializer):
    """Serializer for M-Pesa transaction."""
    
    payment_reference = serializers.CharField(
        source='payment.payment_reference',
        read_only=True
    )
    
    customer_name = serializers.CharField(
        source='payment.customer.full_name',
        read_only=True
    )
    
    loan_number = serializers.CharField(
        source='payment.loan.loan_number',
        read_only=True
    )
    
    formatted_amount = serializers.CharField(read_only=True)
    formatted_balance = serializers.CharField(read_only=True)
    formatted_transaction_date = serializers.CharField(read_only=True)
    
    is_reversed = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = MpesaTransaction
        fields = [
            'id',
            'transaction_id',
            'mpesa_receipt_number',
            
            # Payment reference
            'payment', 'payment_reference',
            
            # Customer details
            'customer_name',
            
            # Loan details
            'loan_number',
            
            # Transaction details
            'amount', 'formatted_amount',
            'phone_number',
            'transaction_date', 'formatted_transaction_date',
            'transaction_type',
            'account_reference',
            'transaction_description',
            
            # Balance
            'balance', 'formatted_balance',
            
            # Status
            'status',
            'is_reversed',
            
            # M-Pesa details
            'conversation_id',
            'originator_conversation_id',
            
            # Reversal information
            'original_transaction_id',
            'reversal_reason',
            'reversed_at',
            
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'transaction_id',
            'mpesa_receipt_number',
            
            # Payment reference
            'payment', 'payment_reference',
            
            # Customer details
            'customer_name',
            
            # Loan details
            'loan_number',
            
            # Transaction details
            'amount', 'formatted_amount',
            'phone_number',
            'transaction_date', 'formatted_transaction_date',
            'transaction_type',
            'account_reference',
            'transaction_description',
            
            # Balance
            'balance', 'formatted_balance',
            
            # Status
            'status',
            'is_reversed',
            
            # M-Pesa details
            'conversation_id',
            'originator_conversation_id',
            
            # Reversal information
            'original_transaction_id',
            'reversal_reason',
            'reversed_at',
            
            'created_at',
            'updated_at',
        ]