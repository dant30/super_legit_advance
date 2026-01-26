# backend/apps/reports/utils.py
"""
Utility functions for reporting module.
"""

from datetime import datetime, timedelta, date
from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum, Count, Q, Avg, F
from django.db.models.functions import TruncMonth, TruncWeek, TruncDay


def calculate_loan_performance(start_date=None, end_date=None):
    """
    Calculate loan performance metrics.
    
    Args:
        start_date: Start date for period
        end_date: End date for period
        
    Returns:
        dict: Loan performance metrics
    """
    from apps.loans.models import Loan
    from apps.repayments.models import Repayment
    
    # Default to last 30 days
    if not end_date:
        end_date = timezone.now().date()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    # Loans in period
    loans_in_period = Loan.objects.filter(
        created_at__date__gte=start_date,
        created_at__date__lte=end_date
    )
    
    # Performance metrics
    total_loans = loans_in_period.count()
    approved_loans = loans_in_period.filter(status__in=['APPROVED', 'ACTIVE']).count()
    disbursed_loans = loans_in_period.filter(status='ACTIVE').count()
    defaulted_loans = loans_in_period.filter(status='DEFAULTED').count()
    
    # Calculate rates
    approval_rate = (approved_loans / total_loans * 100) if total_loans > 0 else 0
    disbursement_rate = (disbursed_loans / approved_loans * 100) if approved_loans > 0 else 0
    default_rate = (defaulted_loans / disbursed_loans * 100) if disbursed_loans > 0 else 0
    
    # Average loan size
    avg_loan_size = loans_in_period.filter(
        status__in=['APPROVED', 'ACTIVE']
    ).aggregate(avg=Avg('amount_approved'))['avg'] or 0
    
    return {
        'total_loans': total_loans,
        'approved_loans': approved_loans,
        'disbursed_loans': disbursed_loans,
        'defaulted_loans': defaulted_loans,
        'approval_rate': approval_rate,
        'disbursement_rate': disbursement_rate,
        'default_rate': default_rate,
        'avg_loan_size': float(avg_loan_size),
    }


def calculate_collection_efficiency(start_date=None, end_date=None):
    """
    Calculate collection efficiency metrics.
    
    Args:
        start_date: Start date for period
        end_date: End date for period
        
    Returns:
        dict: Collection efficiency metrics
    """
    from apps.repayments.models import Repayment
    from apps.loans.models import Loan
    
    # Default to last 30 days
    if not end_date:
        end_date = timezone.now().date()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    # Payments in period
    payments = Repayment.objects.filter(
        payment_date__gte=start_date,
        payment_date__lte=end_date,
        status='COMPLETED'
    )
    
    # Collection metrics
    total_due = Loan.objects.filter(
        status='ACTIVE'
    ).aggregate(total=Sum('monthly_installment'))['total'] or 0
    
    total_collected = payments.aggregate(total=Sum('amount'))['total'] or 0
    
    # On-time payments
    on_time_payments = payments.filter(is_on_time=True).count()
    total_payments = payments.count()
    
    # Calculate rates
    collection_rate = (total_collected / total_due * 100) if total_due > 0 else 0
    on_time_rate = (on_time_payments / total_payments * 100) if total_payments > 0 else 0
    
    # Average collection days
    avg_collection_days = payments.aggregate(
        avg=Avg(F('payment_date') - F('due_date'))
    )['avg'] or timedelta(days=0)
    
    return {
        'total_due': float(total_due),
        'total_collected': float(total_collected),
        'collection_rate': collection_rate,
        'on_time_payments': on_time_payments,
        'on_time_rate': on_time_rate,
        'avg_collection_days': avg_collection_days.days,
    }


def calculate_portfolio_at_risk(as_of_date=None):
    """
    Calculate portfolio at risk (PAR) metrics.
    
    Args:
        as_of_date: Date for PAR calculation (default: today)
        
    Returns:
        dict: PAR metrics
    """
    from apps.loans.models import Loan
    
    if not as_of_date:
        as_of_date = timezone.now().date()
    
    # Active loans
    active_loans = Loan.objects.filter(status='ACTIVE')
    total_portfolio = active_loans.aggregate(total=Sum('outstanding_balance'))['total'] or 0
    
    # PAR by days overdue
    par_1_30 = active_loans.filter(
        due_date__lt=as_of_date,
        due_date__gte=as_of_date - timedelta(days=30)
    ).aggregate(total=Sum('outstanding_balance'))['total'] or 0
    
    par_31_60 = active_loans.filter(
        due_date__lt=as_of_date - timedelta(days=30),
        due_date__gte=as_of_date - timedelta(days=60)
    ).aggregate(total=Sum('outstanding_balance'))['total'] or 0
    
    par_61_90 = active_loans.filter(
        due_date__lt=as_of_date - timedelta(days=60),
        due_date__gte=as_of_date - timedelta(days=90)
    ).aggregate(total=Sum('outstanding_balance'))['total'] or 0
    
    par_90_plus = active_loans.filter(
        due_date__lt=as_of_date - timedelta(days=90)
    ).aggregate(total=Sum('outstanding_balance'))['total'] or 0
    
    # Total PAR
    total_par = par_1_30 + par_31_60 + par_61_90 + par_90_plus
    
    # PAR ratios
    par_ratio = (total_par / total_portfolio * 100) if total_portfolio > 0 else 0
    par_1_30_ratio = (par_1_30 / total_portfolio * 100) if total_portfolio > 0 else 0
    par_31_60_ratio = (par_31_60 / total_portfolio * 100) if total_portfolio > 0 else 0
    par_61_90_ratio = (par_61_90 / total_portfolio * 100) if total_portfolio > 0 else 0
    par_90_plus_ratio = (par_90_plus / total_portfolio * 100) if total_portfolio > 0 else 0
    
    return {
        'total_portfolio': float(total_portfolio),
        'total_par': float(total_par),
        'par_ratio': par_ratio,
        'par_1_30': float(par_1_30),
        'par_1_30_ratio': par_1_30_ratio,
        'par_31_60': float(par_31_60),
        'par_31_60_ratio': par_31_60_ratio,
        'par_61_90': float(par_61_90),
        'par_61_90_ratio': par_61_90_ratio,
        'par_90_plus': float(par_90_plus),
        'par_90_plus_ratio': par_90_plus_ratio,
        'as_of_date': as_of_date,
    }


def generate_summary_statistics(period='monthly', reference_date=None):
    """
    Calculate summary statistics for a period.
    """
    if reference_date is None:
        reference_date = timezone.now().date()
    
    # Determine date range based on period
    if period == 'daily':
        start_date = reference_date
        end_date = reference_date
    elif period == 'weekly':
        start_date = reference_date - timedelta(days=reference_date.weekday())
        end_date = start_date + timedelta(days=6)
    elif period == 'monthly':
        start_date = date(reference_date.year, reference_date.month, 1)
        if reference_date.month == 12:
            end_date = date(reference_date.year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(reference_date.year, reference_date.month + 1, 1) - timedelta(days=1)
    elif period == 'quarterly':
        quarter = (reference_date.month - 1) // 3 + 1
        start_month = (quarter - 1) * 3 + 1
        start_date = date(reference_date.year, start_month, 1)
        if quarter == 4:
            end_date = date(reference_date.year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(reference_date.year, start_month + 3, 1) - timedelta(days=1)
    elif period == 'yearly':
        start_date = date(reference_date.year, 1, 1)
        end_date = date(reference_date.year, 12, 31)
    else:
        raise ValueError(f"Invalid period: {period}")
    
    from apps.loans.models import Loan
    from apps.repayments.models import Repayment
    from apps.customers.models import Customer
    
    loans_summary = Loan.objects.filter(
        created_at__date__gte=start_date,
        created_at__date__lte=end_date
    ).aggregate(
        total_loans=Count('id'),
        approved_loans=Count('id', filter=Q(status__in=['APPROVED', 'ACTIVE'])),
        disbursed_loans=Count('id', filter=Q(status='ACTIVE')),
        total_approved=Sum('amount_approved', filter=Q(status__in=['APPROVED', 'ACTIVE'])),
        total_disbursed=Sum('amount_disbursed', filter=Q(status='ACTIVE')),
    )
    
    return {
        'period': period,
        'start_date': start_date,
        'end_date': end_date,
        'loans': loans_summary,
    }


def calculate_revenue_metrics(start_date=None, end_date=None):
    """
    Calculate revenue metrics.
    
    Args:
        start_date: Start date for period
        end_date: End date for period
        
    Returns:
        dict: Revenue metrics
    """
    from apps.loans.models import Loan
    from apps.repayments.models import Repayment
    
    # Default to last 30 days
    if not end_date:
        end_date = timezone.now().date()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    # Interest revenue
    interest_revenue = Loan.objects.filter(
        status='ACTIVE',
        created_at__date__gte=start_date,
        created_at__date__lte=end_date
    ).aggregate(total=Sum('total_interest'))['total'] or 0
    
    # Fee revenue
    fee_revenue = Loan.objects.filter(
        created_at__date__gte=start_date,
        created_at__date__lte=end_date
    ).aggregate(total=Sum('processing_fee'))['total'] or 0
    
    # Penalty revenue
    penalty_revenue = Repayment.objects.filter(
        created_at__date__gte=start_date,
        created_at__date__lte=end_date,
        penalty_amount__gt=0
    ).aggregate(total=Sum('penalty_amount'))['total'] or 0
    
    # Total revenue
    total_revenue = interest_revenue + fee_revenue + penalty_revenue
    
    # Write-offs
    write_offs = Loan.objects.filter(
        status='DEFAULTED',
        updated_at__date__gte=start_date,
        updated_at__date__lte=end_date
    ).aggregate(total=Sum('outstanding_balance'))['total'] or 0
    
    # Net revenue
    net_revenue = total_revenue - write_offs
    
    return {
        'interest_revenue': float(interest_revenue),
        'fee_revenue': float(fee_revenue),
        'penalty_revenue': float(penalty_revenue),
        'total_revenue': float(total_revenue),
        'write_offs': float(write_offs),
        'net_revenue': float(net_revenue),
        'profit_margin': (net_revenue / total_revenue * 100) if total_revenue > 0 else 0,
    }


def generate_trend_data(metric='loans', days=90):
    """
    Generate trend data for a specific metric.
    
    Args:
        metric: 'loans', 'payments', 'customers', 'revenue'
        days: Number of days to look back
        
    Returns:
        list: Trend data points
    """
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=days)
    
    from apps.loans.models import Loan
    from apps.repayments.models import Repayment
    from apps.customers.models import Customer
    from apps.mpesa.models import Payment
    
    trend_data = []
    
    if metric == 'loans':
        data = Loan.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        ).annotate(
            day=TruncDay('created_at')
        ).values('day').annotate(
            count=Count('id'),
            amount=Sum('amount_approved')
        ).order_by('day')
        
        for item in data:
            trend_data.append({
                'date': item['day'].date(),
                'count': item['count'],
                'amount': float(item['amount'] or 0),
            })
    
    elif metric == 'payments':
        data = Payment.objects.filter(
            payment_date__gte=start_date,
            payment_date__lte=end_date,
            status='COMPLETED'
        ).annotate(
            day=TruncDay('payment_date')
        ).values('day').annotate(
            count=Count('id'),
            amount=Sum('amount')
        ).order_by('day')
        
        for item in data:
            trend_data.append({
                'date': item['day'].date(),
                'count': item['count'],
                'amount': float(item['amount'] or 0),
            })
    
    elif metric == 'customers':
        data = Customer.objects.filter(
            registration_date__gte=start_date,
            registration_date__lte=end_date
        ).annotate(
            day=TruncDay('registration_date')
        ).values('day').annotate(
            count=Count('id')
        ).order_by('day')
        
        for item in data:
            trend_data.append({
                'date': item['day'].date(),
                'count': item['count'],
                'amount': 0,
            })
    
    elif metric == 'revenue':
        # Combine interest, fees, and penalties
        loan_data = Loan.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        ).annotate(
            day=TruncDay('created_at')
        ).values('day').annotate(
            interest=Sum('total_interest'),
            fees=Sum('processing_fee')
        ).order_by('day')
        
        payment_data = Repayment.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
            penalty_amount__gt=0
        ).annotate(
            day=TruncDay('created_at')
        ).values('day').annotate(
            penalties=Sum('penalty_amount')
        ).order_by('day')
        
        # Merge data
        data_dict = {}
        
        for item in loan_data:
            date_key = item['day'].date()
            if date_key not in data_dict:
                data_dict[date_key] = {'interest': 0, 'fees': 0, 'penalties': 0}
            data_dict[date_key]['interest'] = float(item['interest'] or 0)
            data_dict[date_key]['fees'] = float(item['fees'] or 0)
        
        for item in payment_data:
            date_key = item['day'].date()
            if date_key not in data_dict:
                data_dict[date_key] = {'interest': 0, 'fees': 0, 'penalties': 0}
            data_dict[date_key]['penalties'] = float(item['penalties'] or 0)
        
        # Convert to list
        for date_key, values in sorted(data_dict.items()):
            total = values['interest'] + values['fees'] + values['penalties']
            trend_data.append({
                'date': date_key,
                'count': 0,
                'amount': total,
                'breakdown': values,
            })
    
    return trend_data


def format_currency(amount, currency='KES'):
    """
    Format currency amount.
    
    Args:
        amount: Amount to format
        currency: Currency code
        
    Returns:
        str: Formatted currency string
    """
    if amount is None:
        amount = 0
    
    return f"{currency} {amount:,.2f}"


def format_percentage(value, decimals=2):
    """
    Format percentage value.
    
    Args:
        value: Percentage value (0-100)
        decimals: Number of decimal places
        
    Returns:
        str: Formatted percentage string
    """
    if value is None:
        value = 0
    
    return f"{value:.{decimals}f}%"


def get_report_periods():
    """
    Get available report periods.
    
    Returns:
        list: Available report periods
    """
    return [
        {'value': 'today', 'label': 'Today'},
        {'value': 'yesterday', 'label': 'Yesterday'},
        {'value': 'this_week', 'label': 'This Week'},
        {'value': 'last_week', 'label': 'Last Week'},
        {'value': 'this_month', 'label': 'This Month'},
        {'value': 'last_month', 'label': 'Last Month'},
        {'value': 'this_quarter', 'label': 'This Quarter'},
        {'value': 'last_quarter', 'label': 'Last Quarter'},
        {'value': 'this_year', 'label': 'This Year'},
        {'value': 'last_year', 'label': 'Last Year'},
        {'value': 'last_7_days', 'label': 'Last 7 Days'},
        {'value': 'last_30_days', 'label': 'Last 30 Days'},
        {'value': 'last_90_days', 'label': 'Last 90 Days'},
        {'value': 'last_365_days', 'label': 'Last 365 Days'},
        {'value': 'custom', 'label': 'Custom Range'},
    ]


def validate_report_parameters(parameters, report_type):
    """
    Validate report parameters.
    
    Args:
        parameters: Report parameters dict
        report_type: Type of report
        
    Returns:
        tuple: (is_valid, error_message)
    """
    # Common validations
    if 'start_date' in parameters and 'end_date' in parameters:
        try:
            start_date = datetime.strptime(parameters['start_date'], '%Y-%m-%d').date()
            end_date = datetime.strptime(parameters['end_date'], '%Y-%m-%d').date()
            
            if start_date > end_date:
                return False, "Start date cannot be after end date."
            
            if (end_date - start_date).days > 365 * 5:  # 5 years max
                return False, "Date range cannot exceed 5 years."
        
        except ValueError:
            return False, "Invalid date format. Use YYYY-MM-DD."
    
    # Report-specific validations
    if report_type == 'loans_summary':
        if 'loan_status' in parameters:
            valid_statuses = ['PENDING', 'APPROVED', 'ACTIVE', 'OVERDUE', 'DEFAULTED', 'CLOSED']
            if parameters['loan_status'] not in valid_statuses:
                return False, f"Invalid loan status. Must be one of: {', '.join(valid_statuses)}"
    
    elif report_type == 'payments_detailed':
        if 'payment_method' in parameters:
            valid_methods = ['MPESA', 'BANK', 'CASH', 'CHEQUE']
            if parameters['payment_method'] not in valid_methods:
                return False, f"Invalid payment method. Must be one of: {', '.join(valid_methods)}"
    
    elif report_type == 'customers_portfolio':
        if 'risk_level' in parameters:
            valid_levels = ['LOW', 'MEDIUM', 'HIGH']
            if parameters['risk_level'] not in valid_levels:
                return False, f"Invalid risk level. Must be one of: {', '.join(valid_levels)}"
    
    return True, None