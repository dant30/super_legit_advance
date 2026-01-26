# backend/apps/core/utils/db_utils.py
"""
Database utility functions for handling database-specific operations.
"""
from django.db.models import F, Case, When, Value
from django.db.models.functions import TruncMonth, TruncWeek, TruncDay, TruncYear
from django.conf import settings
from datetime import datetime, timedelta


def get_db_backend():
    """Get the current database backend."""
    return settings.DATABASES['default']['ENGINE'].split('.')[-1]


def trunc_month_sqlite(date_field):
    """
    Truncate date to month for SQLite compatibility.
    Returns YYYY-MM-01 format.
    """
    from django.db.models import CharField, F
    from django.db.models.functions import Substr, Concat
    from django.db.models import Value
    
    return Concat(
        Substr(F(date_field), 1, 7),
        Value('-01'),
        output_field=CharField()
    )


def get_truncated_date(date_field, period='month'):
    """
    Get database-agnostic date truncation.
    
    Args:
        date_field: Field name to truncate
        period: 'day', 'week', 'month', 'year'
    
    Returns:
        Appropriate truncation function for the database
    """
    db_backend = get_db_backend()
    
    if db_backend == 'sqlite3':
        # SQLite doesn't have native date truncation
        # Use alternative approach with strftime or extract year/month
        if period == 'month':
            return TruncMonth(date_field)
        elif period == 'week':
            return TruncWeek(date_field)
        elif period == 'day':
            return TruncDay(date_field)
        elif period == 'year':
            return TruncYear(date_field)
    else:
        # PostgreSQL and other databases support direct truncation
        if period == 'month':
            return TruncMonth(date_field)
        elif period == 'week':
            return TruncWeek(date_field)
        elif period == 'day':
            return TruncDay(date_field)
        elif period == 'year':
            return TruncYear(date_field)
    
    return TruncMonth(date_field)  # Default


def group_by_period(queryset, date_field, period='month'):
    """
    Group queryset by period in a database-agnostic way.
    
    Args:
        queryset: Django queryset
        date_field: Field name to group by
        period: 'day', 'week', 'month', 'year'
    
    Returns:
        Annotated queryset grouped by period
    """
    from django.db.models import Value
    from django.db.models.functions import Trunc
    
    db_backend = get_db_backend()
    
    if db_backend == 'sqlite3':
        # For SQLite, use TruncMonth which converts to DATE
        if period == 'month':
            trunc_func = TruncMonth(date_field)
        elif period == 'week':
            trunc_func = TruncWeek(date_field)
        elif period == 'day':
            trunc_func = TruncDay(date_field)
        elif period == 'year':
            trunc_func = TruncYear(date_field)
        else:
            trunc_func = TruncMonth(date_field)
    else:
        # For PostgreSQL
        if period == 'month':
            trunc_func = TruncMonth(date_field)
        elif period == 'week':
            trunc_func = TruncWeek(date_field)
        elif period == 'day':
            trunc_func = TruncDay(date_field)
        elif period == 'year':
            trunc_func = TruncYear(date_field)
        else:
            trunc_func = TruncMonth(date_field)
    
    return queryset.annotate(period=trunc_func).values('period')