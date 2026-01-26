# backend/apps/audit/middleware.py

import time
import json
from django.utils.deprecation import MiddlewareMixin
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from apps.audit.models import AuditLog

User = get_user_model()


class AuditMiddleware(MiddlewareMixin):
    """
    Middleware to automatically log requests and responses.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.audit_enabled = True
    
    def process_request(self, request):
        """Process request and start timer."""
        # Skip logging for certain paths
        if self._should_skip_logging(request):
            request._audit_skip = True
            return
        
        # Start timer
        request._audit_start_time = time.time()
        
        # Store request data for logging
        request._audit_data = {
            'method': request.method,
            'path': request.path,
            'user': request.user if request.user.is_authenticated else None,
            'ip': self._get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'session_key': request.session.session_key if hasattr(request, 'session') else '',
        }
        
        # For POST/PUT/PATCH requests, store request body (excluding sensitive data)
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                # Get request body as dictionary
                if hasattr(request, 'data'):  # DRF request
                    body = dict(request.data)
                else:
                    body = dict(request.POST)
                
                # Redact sensitive information
                body = self._redact_sensitive_data(body)
                request._audit_data['request_body'] = body
            except:
                request._audit_data['request_body'] = {}
    
    def process_response(self, request, response):
        """Process response and create audit log."""
        # Skip if logging was disabled for this request
        if getattr(request, '_audit_skip', False):
            return response
        
        # Skip if no audit data was stored
        if not hasattr(request, '_audit_data'):
            return response
        
        try:
            # Calculate duration
            start_time = getattr(request, '_audit_start_time', time.time())
            duration = time.time() - start_time
            
            # Get audit data
            audit_data = request._audit_data
            
            # Determine action type based on request
            action = self._determine_action(request, response)
            
            # Determine severity based on response status
            severity = self._determine_severity(response.status_code)
            
            # Determine status
            status = 'SUCCESS' if 200 <= response.status_code < 400 else 'FAILURE'
            
            # Try to determine model and object from request
            model_name, object_id, object_repr = self._extract_object_info(request, response)
            
            # Create audit log
            AuditLog.objects.create(
                action=action,
                severity=severity,
                status=status,
                user=audit_data['user'],
                user_ip=audit_data['ip'],
                user_agent=audit_data['user_agent'],
                model_name=model_name,
                object_id=object_id,
                object_repr=object_repr,
                request_method=audit_data['method'],
                request_path=audit_data['path'],
                request_params=audit_data.get('request_body'),
                response_status=response.status_code,
                duration=duration,
                session_key=audit_data['session_key'],
                module=self._extract_module(request.path),
                feature=self._extract_feature(request.path, action),
                tags=self._extract_tags(request, response),
            )
            
        except Exception as e:
            # Log the error but don't break the response
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to create audit log: {str(e)}")
        
        return response
    
    def process_exception(self, request, exception):
        """Process exceptions and log them."""
        if getattr(request, '_audit_skip', False):
            return
        
        try:
            # Calculate duration
            start_time = getattr(request, '_audit_start_time', time.time())
            duration = time.time() - start_time
            
            # Get audit data
            audit_data = getattr(request, '_audit_data', {})
            
            # Determine action
            action = self._determine_action(request, None)
            
            # Log the exception
            AuditLog.objects.create(
                action=action,
                severity='HIGH',
                status='FAILURE',
                user=audit_data.get('user'),
                user_ip=audit_data.get('ip'),
                user_agent=audit_data.get('user_agent'),
                model_name=self._extract_model_from_path(request.path),
                request_method=audit_data.get('method'),
                request_path=audit_data.get('path'),
                request_params=audit_data.get('request_body'),
                response_status=500,
                duration=duration,
                error_message=str(exception),
                session_key=audit_data.get('session_key'),
                module=self._extract_module(request.path),
                feature=self._extract_feature(request.path, action),
                tags=['exception', 'error'],
            )
            
        except Exception as e:
            # Don't let audit logging break exception handling
            pass
        
        return None
    
    def _should_skip_logging(self, request):
        """Determine if logging should be skipped for this request."""
        # Skip health checks and static files
        skip_paths = [
            '/health/',
            '/static/',
            '/media/',
            '/favicon.ico',
            '/robots.txt',
        ]
        
        if any(request.path.startswith(path) for path in skip_paths):
            return True
        
        # Skip OPTIONS requests (CORS preflight)
        if request.method == 'OPTIONS':
            return True
        
        # Skip admin interface if configured
        if request.path.startswith('/admin/') and not self.audit_enabled:
            return True
        
        return False
    
    def _get_client_ip(self, request):
        """Extract client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def _redact_sensitive_data(self, data):
        """Redact sensitive information from data."""
        if not isinstance(data, dict):
            return data
        
        redacted_data = data.copy()
        sensitive_fields = [
            'password', 'token', 'secret', 'key',
            'authorization', 'bearer', 'api_key',
            'credit_card', 'cvv', 'expiry',
            'ssn', 'national_id', 'passport',
        ]
        
        for field in list(redacted_data.keys()):
            field_lower = field.lower()
            if any(sensitive in field_lower for sensitive in sensitive_fields):
                redacted_data[field] = '***REDACTED***'
        
        return redacted_data
    
    def _determine_action(self, request, response):
        """Determine action type based on request and response."""
        method = request.method
        
        # Map HTTP methods to audit actions
        method_action_map = {
            'GET': 'VIEW',
            'POST': 'CREATE',
            'PUT': 'UPDATE',
            'PATCH': 'UPDATE',
            'DELETE': 'DELETE',
        }
        
        # Special cases
        if request.path.endswith('/login/'):
            return 'LOGIN'
        elif request.path.endswith('/logout/'):
            return 'LOGOUT'
        elif request.path.endswith('/export/'):
            return 'EXPORT'
        elif request.path.endswith('/import/'):
            return 'IMPORT'
        
        # Default to method mapping
        return method_action_map.get(method, 'OTHER')
    
    def _determine_severity(self, status_code):
        """Determine severity based on response status."""
        if status_code >= 500:
            return 'HIGH'
        elif status_code >= 400:
            return 'MEDIUM'
        else:
            return 'INFO'
    
    def _extract_object_info(self, request, response):
        """Extract model and object information from request."""
        # Try to extract from URL pattern
        path_parts = request.path.strip('/').split('/')
        
        if len(path_parts) >= 2:
            # Common pattern: /api/<model>/<id>/
            if path_parts[0] == 'api' and len(path_parts) >= 3:
                model_name = path_parts[1].rstrip('s').title()  # Convert plural to singular
                object_id = path_parts[2] if path_parts[2].isdigit() else None
                
                # Try to get object representation from response
                object_repr = None
                if response and hasattr(response, 'data'):
                    try:
                        data = response.data
                        if isinstance(data, dict):
                            # Look for common representation fields
                            for field in ['name', 'title', 'username', 'email', 'full_name']:
                                if field in data:
                                    object_repr = str(data[field])
                                    break
                    except:
                        pass
                
                return model_name, object_id, object_repr
        
        return None, None, None
    
    def _extract_model_from_path(self, path):
        """Extract model name from path."""
        path_parts = path.strip('/').split('/')
        
        if len(path_parts) >= 2 and path_parts[0] == 'api':
            model_name = path_parts[1].rstrip('s').title()
            return model_name
        
        return None
    
    def _extract_module(self, path):
        """Extract module name from path."""
        path_parts = path.strip('/').split('/')
        
        if len(path_parts) >= 2 and path_parts[0] == 'api':
            return path_parts[1]
        
        return 'system'
    
    def _extract_feature(self, path, action):
        """Extract feature name from path and action."""
        path_parts = path.strip('/').split('/')
        
        if len(path_parts) >= 3 and path_parts[0] == 'api':
            feature = path_parts[2]
            return f"{feature}_{action.lower()}"
        
        return f"unknown_{action.lower()}"
    
    def _extract_tags(self, request, response):
        """Extract tags for the audit log."""
        tags = []
        
        # Add HTTP method tag
        tags.append(request.method.lower())
        
        # Add status tag
        if response:
            if 200 <= response.status_code < 300:
                tags.append('success')
            elif 400 <= response.status_code < 500:
                tags.append('client_error')
            elif response.status_code >= 500:
                tags.append('server_error')
        
        # Add authentication tag
        if request.user.is_authenticated:
            tags.append('authenticated')
            if request.user.is_staff:
                tags.append('staff')
            if request.user.is_superuser:
                tags.append('admin')
        else:
            tags.append('anonymous')
        
        return tags


class AuditLoggingMixin:
    """
    Mixin to add audit logging capabilities to views.
    """
    
    def audit_log(self, action, model_name=None, object_id=None, 
                  object_repr=None, changes=None, severity='INFO', 
                  status='SUCCESS', module=None, feature=None, tags=None):
        """
        Create an audit log entry.
        
        Usage in views:
            self.audit_log(
                action='CREATE',
                model_name='Customer',
                object_id=customer.id,
                object_repr=str(customer),
                changes={'field': 'value'},
                module='customers',
                feature='customer_creation',
                tags=['creation', 'customer']
            )
        """
        request = self.request if hasattr(self, 'request') else None
        
        audit_data = {
            'action': action,
            'severity': severity,
            'status': status,
            'model_name': model_name,
            'object_id': object_id,
            'object_repr': object_repr,
            'changes': changes,
            'module': module or self._get_module_name(),
            'feature': feature or self._get_feature_name(),
            'tags': tags or [],
        }
        
        if request:
            audit_data['request'] = request
        
        return AuditLog.log_action(**audit_data)
    
    def _get_module_name(self):
        """Get module name from view."""
        if hasattr(self, 'module_name'):
            return self.module_name
        
        # Try to extract from class name
        class_name = self.__class__.__name__
        if 'View' in class_name:
            return class_name.replace('View', '').lower()
        
        return 'unknown'
    
    def _get_feature_name(self):
        """Get feature name from view."""
        if hasattr(self, 'feature_name'):
            return self.feature_name
        
        # Try to extract from class name
        class_name = self.__class__.__name__
        if 'View' in class_name:
            return class_name.lower()
        
        return 'unknown'


class SensitiveDataFilter:
    """
    Utility class to filter sensitive data from audit logs.
    """
    
    SENSITIVE_FIELDS = [
        'password', 'token', 'secret', 'key',
        'authorization', 'bearer', 'api_key',
        'credit_card', 'cvv', 'expiry_date',
        'ssn', 'national_id', 'passport_number',
        'bank_account', 'bank_routing',
        'phone_number', 'email',  # Consider PII
    ]
    
    @classmethod
    def filter_data(cls, data):
        """Filter sensitive data from dictionary."""
        if not isinstance(data, dict):
            return data
        
        filtered_data = {}
        
        for key, value in data.items():
            key_lower = key.lower()
            
            # Check if key contains sensitive information
            is_sensitive = any(sensitive in key_lower for sensitive in cls.SENSITIVE_FIELDS)
            
            if is_sensitive:
                filtered_data[key] = '***REDACTED***'
            elif isinstance(value, dict):
                filtered_data[key] = cls.filter_data(value)
            elif isinstance(value, list):
                filtered_data[key] = [cls.filter_data(item) if isinstance(item, dict) else item for item in value]
            else:
                filtered_data[key] = value
        
        return filtered_data