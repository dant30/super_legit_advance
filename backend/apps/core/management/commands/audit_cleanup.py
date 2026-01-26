# backend/apps/core/management/commands/audit_cleanup.py

# audit_cleanup.py
from django.core.management.base import BaseCommand
from apps.audit.models import AuditLog

class Command(BaseCommand):
    help = 'Cleanup old audit logs'
    
    def handle(self, *args, **options):
        deleted = AuditLog.cleanup_old_logs()
        self.stdout.write(f"Deleted {deleted} old audit logs")
        
        archived = AuditLog.archive_old_logs()
        self.stdout.write(f"Archived {archived} audit logs")