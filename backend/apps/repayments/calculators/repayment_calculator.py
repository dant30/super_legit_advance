# backend/apps/repayments/calculators/repayment_calculator.py
from decimal import Decimal, ROUND_HALF_UP
from datetime import date, timedelta
from django.utils import timezone
from django.db.models import Sum
from apps.loans.models import Loan
from apps.repayments.models import Repayment, RepaymentSchedule


class RepaymentCalculator:
    """
    Calculator for repayment-related calculations including:
    - Installment amounts
    - Interest calculations
    - Penalty calculations
    - Schedule generation
    """
    
    def __init__(self, loan):
        """
        Initialize calculator with a loan.
        
        Args:
            loan (Loan): The loan to calculate repayments for
        """
        self.loan = loan
        self.interest_rate = Decimal(str(loan.interest_rate))
        self.loan_amount = loan.amount_approved or loan.amount_applied
        self.loan_period = loan.loan_period_months
        self.start_date = loan.disbursement_date or loan.approval_date or timezone.now().date()
    
    def calculate_monthly_installment(self):
        """
        Calculate monthly installment amount using the formula:
        EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
        
        Where:
        P = Principal loan amount
        R = Monthly interest rate (annual rate / 12 / 100)
        N = Loan tenure in months
        
        Returns:
            Decimal: Monthly installment amount
        """
        if self.loan_amount <= 0 or self.loan_period <= 0:
            return Decimal('0.00')
        
        # Convert annual interest rate to monthly decimal
        monthly_rate = self.interest_rate / Decimal('12.0') / Decimal('100.0')
        
        # Calculate (1+R)^N
        power_base = Decimal('1.0') + monthly_rate
        power_result = power_base ** self.loan_period
        
        # Calculate EMI using the formula
        if power_result == Decimal('1.0'):
            # Handle edge case where rate is 0
            emi = self.loan_amount / Decimal(str(self.loan_period))
        else:
            emi = (self.loan_amount * monthly_rate * power_result) / (power_result - Decimal('1.0'))
        
        # Round to 2 decimal places
        return emi.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def calculate_total_interest(self):
        """
        Calculate total interest payable over loan period.
        
        Returns:
            Decimal: Total interest amount
        """
        monthly_installment = self.calculate_monthly_installment()
        total_payment = monthly_installment * self.loan_period
        total_interest = total_payment - self.loan_amount
        
        return max(total_interest, Decimal('0.00')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def calculate_interest_for_period(self, principal_balance, days_in_period=30):
        """
        Calculate interest for a specific period.
        
        Args:
            principal_balance (Decimal): Outstanding principal balance
            days_in_period (int): Number of days in the period (default: 30)
        
        Returns:
            Decimal: Interest amount for the period
        """
        if principal_balance <= 0:
            return Decimal('0.00')
        
        # Daily interest rate
        daily_rate = self.interest_rate / Decimal('365.0') / Decimal('100.0')
        
        # Calculate interest
        interest = principal_balance * daily_rate * Decimal(str(days_in_period))
        
        return interest.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def generate_schedule(self, start_date=None):
        """
        Generate repayment schedule for the loan.
        
        Args:
            start_date (date): Start date for the schedule (default: loan disbursement date)
        
        Returns:
            list: List of schedule items with installment details
        """
        if start_date is None:
            start_date = self.start_date
        
        schedule = []
        remaining_principal = self.loan_amount
        monthly_installment = self.calculate_monthly_installment()
        
        for i in range(1, self.loan_period + 1):
            # Calculate due date (monthly from start date)
            due_date = start_date + timedelta(days=30 * i)
            
            # Calculate interest for this period
            interest_amount = self.calculate_interest_for_period(remaining_principal)
            
            # Calculate principal portion
            principal_amount = monthly_installment - interest_amount
            
            # Adjust last installment to account for rounding differences
            if i == self.loan_period:
                principal_amount = remaining_principal
                monthly_installment = principal_amount + interest_amount
            
            # Ensure principal doesn't exceed remaining balance
            principal_amount = min(principal_amount, remaining_principal)
            
            # Update remaining principal
            remaining_principal -= principal_amount
            
            # Add to schedule
            schedule.append({
                'installment_number': i,
                'due_date': due_date,
                'principal_amount': principal_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                'interest_amount': interest_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                'total_amount': monthly_installment.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                'remaining_principal': remaining_principal.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            })
            
            # Stop if principal is paid off
            if remaining_principal <= Decimal('0.00'):
                break
        
        return schedule
    
    def calculate_outstanding_balance(self, as_of_date=None):
        """
        Calculate outstanding balance as of a specific date.
        
        Args:
            as_of_date (date): Date to calculate balance as of (default: today)
        
        Returns:
            dict: Dictionary with principal, interest, and total outstanding
        """
        if as_of_date is None:
            as_of_date = timezone.now().date()
        
        # Get all repayments for this loan
        repayments = Repayment.objects.filter(
            loan=self.loan,
            status__in=['COMPLETED', 'PARTIAL', 'WAIVED']
        )
        
        # Calculate total paid
        total_paid = repayments.aggregate(
            total=Sum('amount_paid')
        )['total'] or Decimal('0.00')
        
        # Calculate total principal paid
        principal_paid = repayments.aggregate(
            total=Sum('principal_amount')
        )['total'] or Decimal('0.00')
        
        # Calculate total interest paid
        interest_paid = repayments.aggregate(
            total=Sum('interest_amount')
        )['total'] or Decimal('0.00')
        
        # Calculate outstanding principal
        outstanding_principal = self.loan_amount - principal_paid
        
        # Calculate interest accrued up to as_of_date
        if self.start_date and as_of_date > self.start_date:
            days_elapsed = (as_of_date - self.start_date).days
            interest_accrued = self.calculate_interest_for_period(
                outstanding_principal,
                days_elapsed
            )
        else:
            interest_accrued = Decimal('0.00')
        
        # Calculate outstanding interest (accrued - paid)
        outstanding_interest = max(interest_accrued - interest_paid, Decimal('0.00'))
        
        # Get penalties
        penalties = self.loan.penalties.filter(
            status__in=['APPLIED', 'PENDING']
        ).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        penalty_paid = self.loan.penalties.filter(
            status='PAID'
        ).aggregate(
            total=Sum('amount_paid')
        )['total'] or Decimal('0.00')
        
        outstanding_penalty = penalties - penalty_paid
        
        # Calculate total outstanding
        total_outstanding = outstanding_principal + outstanding_interest + outstanding_penalty
        
        return {
            'principal': outstanding_principal.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'interest': outstanding_interest.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'penalty': outstanding_penalty.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'total': total_outstanding.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'total_paid': total_paid.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'principal_paid': principal_paid.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'interest_paid': interest_paid.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
        }
    
    def calculate_penalty(self, overdue_days, overdue_amount, penalty_rate=None):
        """
        Calculate penalty for overdue payment.
        
        Args:
            overdue_days (int): Number of days overdue
            overdue_amount (Decimal): Overdue amount
            penalty_rate (Decimal): Penalty rate (default: from settings or 5%)
        
        Returns:
            Decimal: Penalty amount
        """
        if penalty_rate is None:
            # Default penalty rate: 5% per month or as configured
            penalty_rate = Decimal('5.0')
        
        if overdue_days <= 0 or overdue_amount <= 0:
            return Decimal('0.00')
        
        # Calculate daily penalty rate
        daily_rate = penalty_rate / Decimal('30.0') / Decimal('100.0')
        
        # Calculate penalty
        penalty = overdue_amount * daily_rate * Decimal(str(overdue_days))
        
        # Cap penalty at reasonable amount (e.g., not more than overdue amount)
        penalty = min(penalty, overdue_amount)
        
        return penalty.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def calculate_early_repayment_savings(self, repayment_amount, repayment_date):
        """
        Calculate savings from early repayment.
        
        Args:
            repayment_amount (Decimal): Amount being repaid early
            repayment_date (date): Date of early repayment
        
        Returns:
            dict: Dictionary with interest saved and new schedule
        """
        if repayment_date <= self.start_date:
            return {
                'interest_saved': Decimal('0.00'),
                'new_monthly_installment': self.calculate_monthly_installment(),
                'months_reduced': 0,
            }
        
        # Calculate days from start to early repayment
        days_elapsed = (repayment_date - self.start_date).days
        
        # Calculate interest accrued so far
        interest_accrued = self.calculate_interest_for_period(
            self.loan_amount,
            days_elapsed
        )
        
        # Calculate remaining principal after early repayment
        # (Assuming repayment goes entirely to principal)
        remaining_principal = self.loan_amount - repayment_amount
        
        if remaining_principal <= 0:
            # Loan fully repaid
            return {
                'interest_saved': self.calculate_total_interest() - interest_accrued,
                'new_monthly_installment': Decimal('0.00'),
                'months_reduced': self.loan_period,
            }
        
        # Calculate new loan period (approximate)
        # This is a simplified calculation
        new_monthly_installment = self.calculate_monthly_installment()
        if new_monthly_installment > 0:
            approximate_months = remaining_principal / new_monthly_installment
            months_reduced = max(self.loan_period - int(approximate_months), 0)
        else:
            months_reduced = 0
        
        # Calculate interest that would have been paid on the repaid amount
        remaining_months = self.loan_period - (days_elapsed // 30)
        future_interest_on_repaid = self.calculate_interest_for_period(
            repayment_amount,
            30 * remaining_months
        )
        
        return {
            'interest_saved': future_interest_on_repaid.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'new_monthly_installment': new_monthly_installment.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'months_reduced': months_reduced,
            'remaining_principal': remaining_principal.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
        }
    
    def calculate_debt_service_ratio(self, customer_monthly_income):
        """
        Calculate debt service ratio for the customer.
        
        Args:
            customer_monthly_income (Decimal): Customer's monthly income
        
        Returns:
            dict: Dictionary with DSR and affordability assessment
        """
        if customer_monthly_income <= 0:
            return {
                'dsr': Decimal('0.00'),
                'affordability': 'Not Assessable',
                'recommendation': 'Income information required',
            }
        
        monthly_installment = self.calculate_monthly_installment()
        dsr = (monthly_installment / customer_monthly_income) * Decimal('100.0')
        
        # Determine affordability
        if dsr <= 30:
            affordability = 'Good'
            recommendation = 'Loan is affordable'
        elif dsr <= 50:
            affordability = 'Moderate'
            recommendation = 'Loan may be affordable with careful budgeting'
        elif dsr <= 70:
            affordability = 'Risky'
            recommendation = 'Loan may cause financial strain'
        else:
            affordability = 'Very Risky'
            recommendation = 'Loan is likely unaffordable'
        
        return {
            'dsr': dsr.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'affordability': affordability,
            'recommendation': recommendation,
            'monthly_installment': monthly_installment.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
            'monthly_income': customer_monthly_income.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
        }
    
    def generate_amortization_table(self):
        """
        Generate a detailed amortization table.
        
        Returns:
            list: List of amortization schedule rows
        """
        schedule = self.generate_schedule()
        amortization_table = []
        
        opening_balance = self.loan_amount
        
        for installment in schedule:
            closing_balance = installment['remaining_principal']
            
            amortization_table.append({
                'installment': installment['installment_number'],
                'due_date': installment['due_date'],
                'opening_balance': opening_balance,
                'payment': installment['total_amount'],
                'principal': installment['principal_amount'],
                'interest': installment['interest_amount'],
                'closing_balance': closing_balance,
            })
            
            opening_balance = closing_balance
        
        return amortization_table
    
    @staticmethod
    def calculate_total_collections(repayments):
        """
        Calculate total collections from a queryset of repayments.
        
        Args:
            repayments: Queryset of Repayment objects
        
        Returns:
            dict: Dictionary with total collections breakdown
        """
        totals = repayments.aggregate(
            total_amount=Sum('amount_paid'),
            principal=Sum('principal_amount'),
            interest=Sum('interest_amount'),
            penalty=Sum('penalty_amount'),
            fees=Sum('fee_amount'),
            count=Count('id'),
        )
        
        # Handle None values
        for key in totals:
            if totals[key] is None:
                totals[key] = Decimal('0.00')
        
        return totals
    
    @staticmethod
    def get_overdue_summary(repayments):
        """
        Get summary of overdue repayments.
        
        Args:
            repayments: Queryset of Repayment objects
        
        Returns:
            dict: Dictionary with overdue summary
        """
        overdue = repayments.filter(status='OVERDUE')
        
        summary = overdue.aggregate(
            count=Count('id'),
            total_due=Sum('amount_due'),
            total_outstanding=Sum('amount_outstanding'),
            avg_days_overdue=Avg('days_overdue'),
            max_days_overdue=Max('days_overdue'),
        )
        
        # Handle None values
        for key in summary:
            if summary[key] is None:
                if key == 'count':
                    summary[key] = 0
                else:
                    summary[key] = Decimal('0.00')
        
        # Add breakdown by days overdue ranges
        breakdown = {
            '1_7_days': overdue.filter(days_overdue__range=(1, 7)).count(),
            '8_30_days': overdue.filter(days_overdue__range=(8, 30)).count(),
            '31_90_days': overdue.filter(days_overdue__range=(31, 90)).count(),
            '91_plus_days': overdue.filter(days_overdue__gt=90).count(),
        }
        
        summary['breakdown'] = breakdown
        
        return summary