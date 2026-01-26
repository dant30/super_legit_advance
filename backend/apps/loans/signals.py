# backend/apps/loans/signals.py
"""
Signal handlers for loan management.
"""

from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.db import transaction
from django.utils import timezone

from .models import Loan, LoanApplication, Collateral
from apps.repayments.models import RepaymentSchedule
from apps.core.models.audit_log import AuditLog


@receiver(post_save, sender=Loan)
def handle_loan_status_change(sender, instance, created, **kwargs):
    """Handle loan status changes."""
    if not created:
        # Update related records when loan status changes
        if instance.status == 'COMPLETED':
            # Release all collateral when loan is completed
            instance.collateral.filter(status='ACTIVE').update(
                status='RELEASED',
                release_date=timezone.now().date(),
                updated_by=instance.updated_by or instance.created_by
            )
        
        elif instance.status == 'DEFAULTED':
            # Mark collateral for foreclosure when loan is defaulted
            instance.collateral.filter(status='ACTIVE').update(
                status='FORECLOSED',
                updated_by=instance.updated_by or instance.created_by
            )


@receiver(pre_save, sender=Loan)
def validate_loan_before_save(sender, instance, **kwargs):
    """Validate loan before saving."""
    # Ensure loan number is unique
    if instance.loan_number and Loan.objects.filter(
        loan_number=instance.loan_number
    ).exclude(pk=instance.pk).exists():
        raise ValueError(f"Loan number {instance.loan_number} already exists.")


@receiver(post_save, sender=LoanApplication)
def handle_application_approval(sender, instance, created, **kwargs):
    """Handle application approval."""
    if not created and instance.is_approved and not instance.loan:
        # Create loan if application is approved and no loan exists
        try:
            instance.create_loan()
        except Exception as e:
            # Log error but don't crash
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error creating loan from application {instance.id}: {str(e)}")


@receiver(post_delete, sender=Collateral)
def log_collateral_deletion(sender, instance, **kwargs):
    """Log collateral deletion."""
    AuditLog.objects.create(
        action='DELETE',
        model_name='Collateral',
        object_id=instance.id,
        user=instance.updated_by or instance.created_by,
        changes=f"Deleted collateral for loan {instance.loan.loan_number}"
    )