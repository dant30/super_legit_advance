# backend/apps/core/utils/date_utils.py
from datetime import datetime, date, timedelta
from dateutil.relativedelta import relativedelta
from django.utils import timezone
import calendar
from typing import Optional, Tuple


def now() -> datetime:
    """
    Get current time with timezone support.
    """
    return timezone.now()


def today() -> date:
    """
    Get current date.
    """
    return timezone.now().date()


def days_from_now(days: int) -> datetime:
    """
    Get datetime n days from now.
    """
    return now() + timedelta(days=days)


def months_from_now(months: int) -> datetime:
    """
    Get datetime n months from now.
    """
    return now() + relativedelta(months=months)


def years_from_now(years: int) -> datetime:
    """
    Get datetime n years from now.
    """
    return now() + relativedelta(years=years)


def days_ago(days: int) -> datetime:
    """
    Get datetime n days ago.
    """
    return now() - timedelta(days=days)


def months_ago(months: int) -> datetime:
    """
    Get datetime n months ago.
    """
    return now() - relativedelta(months=months)


def format_date(dt: datetime, fmt: str = "%Y-%m-%d") -> Optional[str]:
    """
    Format datetime to string.
    """
    if not dt:
        return None
    return dt.strftime(fmt)


def parse_date(date_str: str, fmt: str = "%Y-%m-%d") -> Optional[date]:
    """
    Parse string to date.
    """
    try:
        return datetime.strptime(date_str, fmt).date()
    except (ValueError, TypeError):
        return None


def get_start_of_day(dt: datetime = None) -> datetime:
    """
    Get start of day (00:00:00).
    """
    if dt is None:
        dt = now()
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)


def get_end_of_day(dt: datetime = None) -> datetime:
    """
    Get end of day (23:59:59).
    """
    if dt is None:
        dt = now()
    return dt.replace(hour=23, minute=59, second=59, microsecond=999999)


def get_start_of_month(dt: datetime = None) -> datetime:
    """
    Get start of month.
    """
    if dt is None:
        dt = now()
    return dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def get_end_of_month(dt: datetime = None) -> datetime:
    """
    Get end of month.
    """
    if dt is None:
        dt = now()
    _, last_day = calendar.monthrange(dt.year, dt.month)
    return dt.replace(day=last_day, hour=23, minute=59, second=59, microsecond=999999)


def get_start_of_year(dt: datetime = None) -> datetime:
    """
    Get start of year.
    """
    if dt is None:
        dt = now()
    return dt.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)


def get_end_of_year(dt: datetime = None) -> datetime:
    """
    Get end of year.
    """
    if dt is None:
        dt = now()
    return dt.replace(month=12, day=31, hour=23, minute=59, second=59, microsecond=999999)


def is_weekend(dt: datetime = None) -> bool:
    """
    Check if date is weekend.
    """
    if dt is None:
        dt = now()
    return dt.weekday() >= 5  # 5 = Saturday, 6 = Sunday


def add_business_days(start_date: datetime, business_days: int) -> datetime:
    """
    Add business days (excluding weekends).
    """
    current_date = start_date
    days_added = 0
    
    while days_added < business_days:
        current_date += timedelta(days=1)
        if not is_weekend(current_date):
            days_added += 1
    
    return current_date


def calculate_age(birth_date: date, as_of_date: date = None) -> int:
    """
    Calculate age in years.
    """
    if as_of_date is None:
        as_of_date = today()
    
    return as_of_date.year - birth_date.year - (
        (as_of_date.month, as_of_date.day) < (birth_date.month, birth_date.day)
    )


def get_date_range(
    start_date: date, 
    end_date: date, 
    include_end: bool = True
) -> list:
    """
    Get list of dates between start and end.
    """
    days = (end_date - start_date).days
    if include_end:
        days += 1
    
    return [start_date + timedelta(days=i) for i in range(days)]


def get_month_range(year: int, month: int) -> Tuple[date, date]:
    """
    Get start and end dates of a month.
    """
    start_date = date(year, month, 1)
    _, last_day = calendar.monthrange(year, month)
    end_date = date(year, month, last_day)
    return start_date, end_date


def format_duration(seconds: int) -> str:
    """
    Format duration in seconds to human readable format.
    """
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    
    parts = []
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    if seconds > 0 or not parts:
        parts.append(f"{seconds}s")
    
    return " ".join(parts)


def get_quarter(dt: datetime = None) -> int:
    """
    Get quarter number (1-4) for a date.
    """
    if dt is None:
        dt = now()
    return (dt.month - 1) // 3 + 1


def get_financial_year(dt: datetime = None, start_month: int = 7) -> str:
    """
    Get financial year string (e.g., "2023/2024").
    """
    if dt is None:
        dt = now()
    
    year = dt.year
    if dt.month >= start_month:
        return f"{year}/{year + 1}"
    else:
        return f"{year - 1}/{year}"


def is_date_in_range(check_date: date, start_date: date, end_date: date) -> bool:
    """
    Check if date is within range (inclusive).
    """
    return start_date <= check_date <= end_date


def get_next_weekday(dt: datetime, weekday: int) -> datetime:
    """
    Get next specific weekday from given date.
    0 = Monday, 1 = Tuesday, ..., 6 = Sunday
    """
    days_ahead = weekday - dt.weekday()
    if days_ahead <= 0:
        days_ahead += 7
    return dt + timedelta(days=days_ahead)


def time_diff_human(start: datetime, end: datetime = None) -> str:
    """
    Get human readable time difference.
    """
    if end is None:
        end = now()
    
    diff = end - start
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return f"{int(seconds)} seconds"
    elif seconds < 3600:
        return f"{int(seconds // 60)} minutes"
    elif seconds < 86400:
        return f"{int(seconds // 3600)} hours"
    elif seconds < 604800:
        days = seconds // 86400
        if days == 1:
            return "1 day"
        return f"{int(days)} days"
    elif seconds < 2592000:  # ~30 days
        weeks = seconds // 604800
        if weeks == 1:
            return "1 week"
        return f"{int(weeks)} weeks"
    elif seconds < 31536000:  # ~365 days
        months = seconds // 2592000
        if months == 1:
            return "1 month"
        return f"{int(months)} months"
    else:
        years = seconds // 31536000
        if years == 1:
            return "1 year"
        return f"{int(years)} years"


# Convenience aliases
now_tz = now
today_date = today
format_dt = format_date