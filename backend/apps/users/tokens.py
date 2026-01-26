# backend/apps/users/tokens.py
"""
Custom tokens for user authentication.
"""
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils import six


class EmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    """
    Token generator for email verification.
    """
    def _make_hash_value(self, user, timestamp):
        return (
            six.text_type(user.pk) + six.text_type(timestamp) + 
            six.text_type(user.email_verified)
        )


class PasswordResetTokenGenerator(PasswordResetTokenGenerator):
    """
    Token generator for password reset.
    """
    def _make_hash_value(self, user, timestamp):
        return (
            six.text_type(user.pk) + six.text_type(timestamp) +
            six.text_type(user.last_password_change)
        )


# Create token instances
email_verification_token = EmailVerificationTokenGenerator()
password_reset_token = PasswordResetTokenGenerator()