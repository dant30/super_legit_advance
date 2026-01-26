# backend/apps/loans/calculators/loan_calculator.py
from decimal import Decimal, ROUND_HALF_UP
from datetime import date
from dateutil.relativedelta import relativedelta
from django.utils import timezone


class LoanCalculator:
    """
    Comprehensive loan calculator for various interest types and repayment frequencies.
    """
    
    def __init__(self, principal, interest_rate, term_months, 
                 interest_type='REDUCING_BALANCE', repayment_frequency='MONTHLY',
                 processing_fee=Decimal('0.00'), late_penalty_rate=Decimal('5.00')):
        """
        Initialize the loan calculator.
        
        Args:
            principal (Decimal): Loan principal amount
            interest_rate (Decimal): Annual interest rate percentage
            term_months (int): Loan term in months
            interest_type (str): Type of interest calculation
                - 'FIXED': Fixed interest throughout the term
                - 'REDUCING_BALANCE': Interest calculated on outstanding balance
                - 'FLAT_RATE': Flat interest rate
            repayment_frequency (str): Frequency of repayments
                - 'DAILY': Daily repayments
                - 'WEEKLY': Weekly repayments
                - 'BIWEEKLY': Bi-weekly repayments
                - 'MONTHLY': Monthly repayments (default)
                - 'QUARTERLY': Quarterly repayments
                - 'BIANNUAL': Bi-annual repayments
                - 'ANNUAL': Annual repayments
                - 'BULLET': Single bullet payment at maturity
            processing_fee (Decimal): Processing fee amount
            late_penalty_rate (Decimal): Late payment penalty rate percentage
        """
        self.principal = Decimal(str(principal))
        self.interest_rate = Decimal(str(interest_rate))
        self.term_months = int(term_months)
        self.interest_type = interest_type.upper()
        self.repayment_frequency = repayment_frequency.upper()
        self.processing_fee = Decimal(str(processing_fee))
        self.late_penalty_rate = Decimal(str(late_penalty_rate))
        
        # Validate inputs
        self._validate_inputs()
        
        # Calculate derived values
        self._calculate_derived_values()
    
    def _validate_inputs(self):
        """Validate calculator inputs."""
        if self.principal <= 0:
            raise ValueError("Principal amount must be greater than 0.")
        
        if self.interest_rate < 0:
            raise ValueError("Interest rate cannot be negative.")
        
        if self.term_months <= 0:
            raise ValueError("Loan term must be greater than 0 months.")
        
        if self.interest_type not in ['FIXED', 'REDUCING_BALANCE', 'FLAT_RATE']:
            raise ValueError("Interest type must be 'FIXED', 'REDUCING_BALANCE', or 'FLAT_RATE'.")
        
        valid_frequencies = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 
                            'QUARTERLY', 'BIANNUAL', 'ANNUAL', 'BULLET']
        if self.repayment_frequency not in valid_frequencies:
            raise ValueError(f"Repayment frequency must be one of: {valid_frequencies}")
    
    def _calculate_derived_values(self):
        """Calculate derived values based on inputs."""
        # Calculate number of payments based on frequency
        if self.repayment_frequency == 'DAILY':
            self.payments_per_year = 365
        elif self.repayment_frequency == 'WEEKLY':
            self.payments_per_year = 52
        elif self.repayment_frequency == 'BIWEEKLY':
            self.payments_per_year = 26
        elif self.repayment_frequency == 'MONTHLY':
            self.payments_per_year = 12
        elif self.repayment_frequency == 'QUARTERLY':
            self.payments_per_year = 4
        elif self.repayment_frequency == 'BIANNUAL':
            self.payments_per_year = 2
        elif self.repayment_frequency == 'ANNUAL':
            self.payments_per_year = 1
        else:  # BULLET
            self.payments_per_year = 1
        
        # Calculate total number of payments
        self.total_payments = (self.term_months * self.payments_per_year) // 12
        
        # For bullet payment, only one payment at the end
        if self.repayment_frequency == 'BULLET':
            self.total_payments = 1
        
        # Calculate periodic interest rate
        self.periodic_interest_rate = self.interest_rate / (self.payments_per_year * 100)
    
    def calculate(self):
        """
        Calculate loan terms and returns comprehensive results.
        
        Returns:
            dict: Dictionary containing all calculated values
        """
        results = {}
        
        # Calculate total interest
        results['total_interest'] = self._calculate_total_interest()
        
        # Calculate total amount due
        results['total_amount_due'] = self.principal + results['total_interest']
        
        # Calculate installment amount
        results['installment_amount'] = self._calculate_installment_amount(results['total_amount_due'])
        
        # Calculate net disbursement (principal minus processing fee)
        results['net_disbursement'] = self.principal - self.processing_fee
        
        # Calculate effective interest rate
        results['effective_interest_rate'] = self._calculate_effective_interest_rate()
        
        # Calculate total cost of credit
        results['total_cost_of_credit'] = results['total_interest'] + self.processing_fee
        
        # Calculate APR (Annual Percentage Rate)
        results['apr'] = self._calculate_apr()
        
        # Calculate payment schedule summary
        results['payment_schedule'] = {
            'total_payments': self.total_payments,
            'repayment_frequency': self.repayment_frequency,
            'installment_amount': results['installment_amount'],
            'total_interest': results['total_interest'],
            'total_amount_due': results['total_amount_due'],
        }
        
        # Round all decimal values to 2 decimal places
        for key, value in results.items():
            if isinstance(value, Decimal):
                results[key] = value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        return results
    
    def _calculate_total_interest(self):
        """Calculate total interest based on interest type."""
        if self.interest_type == 'FIXED':
            # Fixed interest: Total interest = Principal * Annual Rate * Years
            years = Decimal(str(self.term_months)) / Decimal('12')
            return self.principal * (self.interest_rate / Decimal('100')) * years
        
        elif self.interest_type == 'FLAT_RATE':
            # Flat rate: Same as fixed interest
            years = Decimal(str(self.term_months)) / Decimal('12')
            return self.principal * (self.interest_rate / Decimal('100')) * years
        
        else:  # REDUCING_BALANCE
            # Reducing balance: More complex calculation
            if self.repayment_frequency == 'BULLET':
                # For bullet payment, interest compounds annually
                years = Decimal(str(self.term_months)) / Decimal('12')
                total_amount = self.principal * ((1 + (self.interest_rate / Decimal('100'))) ** years)
                return total_amount - self.principal
            else:
                # Use amortization formula for regular payments
                # Total interest = (Installment * Total Payments) - Principal
                # But we need to calculate installment first
                installment = self._calculate_amortized_installment()
                total_payments = Decimal(str(self.total_payments))
                return (installment * total_payments) - self.principal
    
    def _calculate_installment_amount(self, total_amount_due):
        """Calculate installment (equal payment) amount."""
        if self.repayment_frequency == 'BULLET':
            # Bullet payment: Full amount at maturity
            return total_amount_due
        elif self.total_payments > 0:
            # Equal installments
            return total_amount_due / Decimal(str(self.total_payments))
        else:
            return Decimal('0.00')
    
    def _calculate_amortized_installment(self):
        """
        Calculate amortized installment for reducing balance loans.
        
        Uses the formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
        Where:
            P = principal
            r = periodic interest rate
            n = total number of payments
        """
        if self.periodic_interest_rate == 0:
            # No interest, equal principal payments
            return self.principal / Decimal(str(self.total_payments))
        
        r = self.periodic_interest_rate
        n = Decimal(str(self.total_payments))
        
        # Calculate (1 + r)^n
        one_plus_r_pow_n = (1 + r) ** n
        
        # Calculate installment
        installment = self.principal * r * one_plus_r_pow_n / (one_plus_r_pow_n - 1)
        
        return installment
    
    def _calculate_effective_interest_rate(self):
        """
        Calculate effective interest rate considering compounding.
        """
        if self.interest_type == 'REDUCING_BALANCE' and self.repayment_frequency != 'BULLET':
            # For reducing balance with regular payments, effective rate = nominal rate
            return self.interest_rate
        else:
            # For other cases, calculate effective annual rate
            nominal_rate = self.interest_rate / Decimal('100')
            compounding_periods = self.payments_per_year
            
            if compounding_periods > 0:
                effective_rate = ((1 + nominal_rate / compounding_periods) ** compounding_periods - 1) * 100
                return effective_rate
            else:
                return self.interest_rate
    
    def _calculate_apr(self):
        """
        Calculate Annual Percentage Rate (APR) including fees.
        
        APR is a more accurate measure of loan cost as it includes fees.
        """
        total_cost = self._calculate_total_interest() + self.processing_fee
        years = Decimal(str(self.term_months)) / Decimal('12')
        
        if years > 0 and self.principal > 0:
            # Simple APR calculation: (Total Cost / Principal) / Years * 100
            apr = (total_cost / self.principal) / years * 100
            return apr
        else:
            return Decimal('0.00')
    
    def amortization_schedule(self, start_date=None):
        """
        Generate amortization schedule for the loan.
        
        Args:
            start_date (date, optional): Start date for the loan. Defaults to today.
        
        Returns:
            list: List of dictionaries representing each payment period
        """
        if start_date is None:
            start_date = timezone.now().date()
        
        schedule = []
        
        if self.interest_type == 'REDUCING_BALANCE' and self.repayment_frequency != 'BULLET':
            # Generate detailed amortization schedule for reducing balance
            schedule = self._generate_reducing_balance_schedule(start_date)
        else:
            # Generate simple schedule for fixed/flat rate loans
            schedule = self._generate_simple_schedule(start_date)
        
        return schedule
    
    def _generate_reducing_balance_schedule(self, start_date):
        """Generate amortization schedule for reducing balance loans."""
        schedule = []
        
        # Calculate periodic installment
        installment = self._calculate_amortized_installment()
        
        # Initialize running balance
        balance = self.principal
        
        # Calculate due dates
        due_dates = self._calculate_due_dates(start_date)
        
        for i in range(self.total_payments):
            # Calculate interest for this period
            interest = balance * self.periodic_interest_rate
            
            # Calculate principal portion
            principal_portion = installment - interest
            
            # Ensure principal doesn't exceed remaining balance
            if principal_portion > balance:
                principal_portion = balance
                installment = principal_portion + interest
            
            # Update balance
            balance -= principal_portion
            
            # Create schedule entry
            entry = {
                'period': i + 1,
                'due_date': due_dates[i] if i < len(due_dates) else None,
                'installment': installment.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                'principal': principal_portion.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                'interest': interest.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                'remaining_balance': balance.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP) if balance > 0 else Decimal('0.00'),
            }
            
            schedule.append(entry)
            
            # Stop if balance is zero
            if balance <= 0:
                break
        
        return schedule
    
    def _generate_simple_schedule(self, start_date):
        """Generate simple payment schedule for fixed/flat rate loans."""
        schedule = []
        
        # Calculate total amount due and installment
        calculations = self.calculate()
        total_amount_due = calculations['total_amount_due']
        installment = calculations['installment_amount']
        
        # Calculate due dates
        due_dates = self._calculate_due_dates(start_date)
        
        # For bullet payment, single entry
        if self.repayment_frequency == 'BULLET':
            entry = {
                'period': 1,
                'due_date': due_dates[0] if due_dates else None,
                'installment': total_amount_due.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                'principal': self.principal.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                'interest': (total_amount_due - self.principal).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                'remaining_balance': Decimal('0.00'),
            }
            schedule.append(entry)
            return schedule
        
        # For regular payments, equal installments
        remaining_balance = total_amount_due
        
        for i in range(self.total_payments):
            # Calculate principal and interest portions
            if self.interest_type in ['FIXED', 'FLAT_RATE']:
                # For fixed/flat rate, interest is evenly distributed
                interest_per_period = (total_amount_due - self.principal) / Decimal(str(self.total_payments))
                principal_per_period = installment - interest_per_period
            else:
                # Equal principal payments
                principal_per_period = self.principal / Decimal(str(self.total_payments))
                interest_per_period = installment - principal_per_period
            
            # Update remaining balance
            remaining_balance -= installment
            
            # Create schedule entry
            entry = {
                'period': i + 1,
                'due_date': due_dates[i] if i < len(due_dates) else None,
                'installment': installment.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                'principal': principal_per_period.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                'interest': interest_per_period.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                'remaining_balance': remaining_balance.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP) if remaining_balance > 0 else Decimal('0.00'),
            }
            
            schedule.append(entry)
        
        return schedule
    
    def _calculate_due_dates(self, start_date):
        """Calculate due dates based on repayment frequency."""
        due_dates = []
        current_date = start_date
        
        for i in range(self.total_payments):
            if self.repayment_frequency == 'DAILY':
                due_date = current_date + relativedelta(days=i+1)
            elif self.repayment_frequency == 'WEEKLY':
                due_date = current_date + relativedelta(weeks=i+1)
            elif self.repayment_frequency == 'BIWEEKLY':
                due_date = current_date + relativedelta(weeks=(i+1)*2)
            elif self.repayment_frequency == 'MONTHLY':
                due_date = current_date + relativedelta(months=i+1)
            elif self.repayment_frequency == 'QUARTERLY':
                due_date = current_date + relativedelta(months=(i+1)*3)
            elif self.repayment_frequency == 'BIANNUAL':
                due_date = current_date + relativedelta(months=(i+1)*6)
            elif self.repayment_frequency == 'ANNUAL':
                due_date = current_date + relativedelta(years=i+1)
            else:  # BULLET
                due_date = current_date + relativedelta(months=self.term_months)
            
            due_dates.append(due_date)
            
            # For bullet payment, only one date
            if self.repayment_frequency == 'BULLET':
                break
        
        return due_dates
    
    def calculate_late_payment_penalty(self, overdue_days, overdue_amount):
        """
        Calculate late payment penalty.
        
        Args:
            overdue_days (int): Number of days overdue
            overdue_amount (Decimal): Overdue amount
        
        Returns:
            Decimal: Penalty amount
        """
        if overdue_days <= 0 or overdue_amount <= 0:
            return Decimal('0.00')
        
        # Calculate penalty as percentage per day
        penalty_rate_per_day = self.late_penalty_rate / Decimal('36500')  # Convert annual rate to daily rate
        
        penalty = overdue_amount * penalty_rate_per_day * Decimal(str(overdue_days))
        
        # Round to 2 decimal places
        return penalty.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    def calculate_prepayment(self, remaining_balance, prepayment_amount, prepayment_date, original_maturity_date):
        """
        Calculate prepayment effects.
        
        Args:
            remaining_balance (Decimal): Current outstanding balance
            prepayment_amount (Decimal): Amount to prepay
            prepayment_date (date): Date of prepayment
            original_maturity_date (date): Original loan maturity date
        
        Returns:
            dict: Prepayment calculation results
        """
        if prepayment_amount <= 0 or prepayment_amount > remaining_balance:
            raise ValueError("Prepayment amount must be between 0 and remaining balance.")
        
        results = {}
        
        # Calculate interest savings
        days_remaining = (original_maturity_date - prepayment_date).days
        if days_remaining > 0:
            # Simple interest savings calculation
            daily_interest_rate = self.interest_rate / Decimal('36500')
            interest_savings = prepayment_amount * daily_interest_rate * Decimal(str(days_remaining))
        else:
            interest_savings = Decimal('0.00')
        
        # Calculate new balance
        new_balance = remaining_balance - prepayment_amount
        
        # Calculate new installment if continuing payments
        if new_balance > 0:
            # Recalculate remaining term in months
            months_remaining = days_remaining / 30.0  # Approximate
            if months_remaining > 0:
                # Create new calculator for remaining balance
                new_calc = LoanCalculator(
                    principal=new_balance,
                    interest_rate=self.interest_rate,
                    term_months=int(months_remaining),
                    interest_type=self.interest_type,
                    repayment_frequency=self.repayment_frequency
                )
                new_schedule = new_calc.calculate()
                new_installment = new_schedule['installment_amount']
            else:
                new_installment = new_balance
        else:
            new_installment = Decimal('0.00')
        
        results.update({
            'prepayment_amount': prepayment_amount,
            'interest_savings': interest_savings,
            'new_balance': new_balance,
            'new_installment': new_installment,
            'total_savings': interest_savings,
        })
        
        # Round all values
        for key, value in results.items():
            if isinstance(value, Decimal):
                results[key] = value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        
        return results
    
    def compare_scenarios(self, scenarios):
        """
        Compare multiple loan scenarios.
        
        Args:
            scenarios (list): List of dictionaries with different loan parameters
        
        Returns:
            list: Comparison results for each scenario
        """
        comparisons = []
        
        for i, scenario in enumerate(scenarios):
            try:
                # Create calculator for this scenario
                calc = LoanCalculator(
                    principal=scenario.get('principal', self.principal),
                    interest_rate=scenario.get('interest_rate', self.interest_rate),
                    term_months=scenario.get('term_months', self.term_months),
                    interest_type=scenario.get('interest_type', self.interest_type),
                    repayment_frequency=scenario.get('repayment_frequency', self.repayment_frequency),
                    processing_fee=scenario.get('processing_fee', self.processing_fee),
                )
                
                # Calculate results
                results = calc.calculate()
                
                # Add scenario info
                comparison = {
                    'scenario_id': i + 1,
                    'scenario_name': scenario.get('name', f'Scenario {i+1}'),
                    'principal': calc.principal,
                    'interest_rate': calc.interest_rate,
                    'term_months': calc.term_months,
                    'interest_type': calc.interest_type,
                    'repayment_frequency': calc.repayment_frequency,
                    **results
                }
                
                comparisons.append(comparison)
                
            except Exception as e:
                # Skip invalid scenarios
                print(f"Error in scenario {i+1}: {str(e)}")
                continue
        
        return comparisons
    
    def get_summary(self):
        """
        Get a human-readable summary of the loan calculation.
        
        Returns:
            str: Formatted summary string
        """
        calculations = self.calculate()
        
        summary_lines = [
            "=" * 60,
            "LOAN CALCULATION SUMMARY",
            "=" * 60,
            f"Principal Amount:          KES {self.principal:,.2f}",
            f"Interest Rate:             {self.interest_rate}% per annum",
            f"Loan Term:                 {self.term_months} months",
            f"Interest Type:             {self.interest_type}",
            f"Repayment Frequency:       {self.repayment_frequency}",
            "-" * 60,
            f"Processing Fee:            KES {self.processing_fee:,.2f}",
            f"Net Disbursement:          KES {calculations['net_disbursement']:,.2f}",
            "-" * 60,
            f"Total Interest:            KES {calculations['total_interest']:,.2f}",
            f"Total Amount Due:          KES {calculations['total_amount_due']:,.2f}",
            f"Installment Amount:        KES {calculations['installment_amount']:,.2f}",
            f"Number of Payments:        {self.total_payments}",
            "-" * 60,
            f"Effective Interest Rate:   {calculations['effective_interest_rate']:.2f}%",
            f"APR (incl. fees):          {calculations['apr']:.2f}%",
            f"Total Cost of Credit:      KES {calculations['total_cost_of_credit']:,.2f}",
            "=" * 60,
        ]
        
        return "\n".join(summary_lines)