# backend/apps/core/mixins/api_mixins.py
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.viewsets import GenericViewSet
from rest_framework.mixins import (
    ListModelMixin,
    CreateModelMixin,
    RetrieveModelMixin,
    UpdateModelMixin,
    DestroyModelMixin
)
from django.core.cache import cache
from django.db import transaction
import logging

logger = logging.getLogger(__name__)


class StandardPagination(PageNumberPagination):
    """
    Standard pagination for API endpoints.
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        # Check if pagination was actually applied (page attribute exists)
        if hasattr(self, 'page') and self.page is not None:
            return Response({
                'success': True,
                'data': data,
                'pagination': {
                    'total': self.page.paginator.count,
                    'count': len(data),
                    'per_page': self.get_page_size(self.request),
                    'current_page': self.page.number,
                    'total_pages': self.page.paginator.num_pages,
                    'next': self.get_next_link(),
                    'previous': self.get_previous_link(),
                }
            })
        # Fallback if pagination wasn't applied
        return Response({
            'success': True,
            'data': data,
            'pagination': {
                'total': len(data),
                'count': len(data),
                'per_page': self.page_size,
                'current_page': 1,
                'total_pages': 1,
                'next': None,
                'previous': None,
            }
        })


class PaginationMixin:
    """
    Mixin for pagination support in views.
    """
    pagination_class = StandardPagination
    page_size = 20
    max_page_size = 100
    
    def get_paginated_response(self, data):
        """
        Return a paginated response using the pagination class.
        """
        if self.pagination_class:
            paginator = self.pagination_class()
            # Only call get_paginated_response if pagination was applied
            if hasattr(self, 'paginator') and self.paginator:
                return paginator.get_paginated_response(data)
        return Response(data)


class APIResponseMixin:
    """
    Standard API response format with consistent structure.
    """
    
    def success(self, data=None, message="Success", status_code=status.HTTP_200_OK, **kwargs):
        """
        Standard success response.
        """
        response_data = {
            "success": True,
            "message": message,
            "data": data,
            "timestamp": self._get_timestamp(),
        }
        response_data.update(kwargs)
        
        return Response(response_data, status=status_code)
    
    def error(self, message="Error", errors=None, status_code=status.HTTP_400_BAD_REQUEST, **kwargs):
        """
        Standard error response.
        """
        response_data = {
            "success": False,
            "message": message,
            "errors": errors or {},
            "timestamp": self._get_timestamp(),
        }
        response_data.update(kwargs)
        
        logger.error(f"API Error: {message}", extra={
            'errors': errors,
            'status_code': status_code,
            'view': self.__class__.__name__,
            'user': self.request.user.id if hasattr(self.request, 'user') else None
        })
        
        return Response(response_data, status=status_code)
    
    def created(self, data=None, message="Created successfully"):
        """
        Created (201) response.
        """
        return self.success(data, message, status_code=status.HTTP_201_CREATED)
    
    def no_content(self, message="No content"):
        """
        No content (204) response.
        """
        return self.success(None, message, status_code=status.HTTP_204_NO_CONTENT)
    
    def forbidden(self, message="Forbidden"):
        """
        Forbidden (403) response.
        """
        return self.error(message, status_code=status.HTTP_403_FORBIDDEN)
    
    def not_found(self, message="Resource not found"):
        """
        Not found (404) response.
        """
        return self.error(message, status_code=status.HTTP_404_NOT_FOUND)
    
    def validation_error(self, errors, message="Validation failed"):
        """
        Validation error (400) response.
        """
        return self.error(message, errors, status_code=status.HTTP_400_BAD_REQUEST)
    
    def server_error(self, message="Internal server error"):
        """
        Server error (500) response.
        """
        return self.error(message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_timestamp(self):
        """
        Get current timestamp in ISO format.
        """
        from django.utils import timezone
        return timezone.now().isoformat()


class CacheMixin:
    """
    Mixin for caching view responses.
    """
    cache_timeout = 300  # 5 minutes
    cache_prefix = "api"
    
    def get_cache_key(self):
        """
        Generate cache key based on request.
        """
        from django.core.cache.utils import make_template_fragment_key
        
        path = self.request.get_full_path()
        user_id = self.request.user.id if self.request.user.is_authenticated else 'anonymous'
        key_parts = [self.cache_prefix, self.__class__.__name__, path, user_id]
        
        return make_template_fragment_key("_".join(str(part) for part in key_parts))
    
    def get_cached_response(self):
        """
        Get cached response if available.
        """
        cache_key = self.get_cache_key()
        cached = cache.get(cache_key)
        if not cached:
            return None

        # Reconstruct a DRF Response from cached serializable payload
        try:
            return Response(
                data=cached.get('data'),
                status=cached.get('status_code', status.HTTP_200_OK),
                headers=cached.get('headers', {})
            )
        except Exception:
            # Fallback: return raw data wrapped in Response
            return Response(cached.get('data'))
    
    def cache_response(self, response):
        """
        Cache the response as a serializable payload instead of the Response object.
        """
        cache_key = self.get_cache_key()

        # Try to collect headers safely
        try:
            headers = dict(response.items()) if hasattr(response, 'items') else {}
        except Exception:
            headers = {}

        # Attempt to render using the view's renderers when available (safer than calling response.render())
        try:
            if hasattr(self, 'get_renderers') and hasattr(self, 'request'):
                renderers = self.get_renderers() or []
                renderer_context = {'request': getattr(self, 'request', None), 'response': response}
                if renderers:
                    try:
                        # Use first renderer to produce a content-type header if possible
                        renderer = renderers[0]
                        # render output is bytes; we don't need it for caching payload, but rendering may set media type
                        _ = renderer.render(getattr(response, 'data', None), renderer_context)
                        headers.setdefault('Content-Type', getattr(renderer, 'media_type', headers.get('Content-Type')))
                    except Exception:
                        # Don't fail caching if rendering isn't possible in this context
                        logger.debug("Renderer render failed during cache_response; proceeding without rendering", exc_info=True)
        except Exception:
            logger.debug("Failed to determine renderer for cache_response", exc_info=True)

        payload = {
            'data': getattr(response, 'data', None),
            'status_code': getattr(response, 'status_code', status.HTTP_200_OK),
            'headers': headers,
        }

        cache.set(cache_key, payload, self.cache_timeout)
        return response
    
    def invalidate_cache(self):
        """
        Invalidate cache for this view.
        """
        cache_key = self.get_cache_key()
        cache.delete(cache_key)


class AtomicTransactionMixin:
    """
    Mixin to wrap view methods in atomic transactions.
    """
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @transaction.atomic
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @transaction.atomic
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)


class AuditLogMixin:
    """
    Mixin for audit logging of CRUD operations.
    """
    
    def perform_create(self, serializer):
        """
        Log creation.
        """
        instance = serializer.save()
        self._log_audit('create', instance)
        return instance
    
    def perform_update(self, serializer):
        """
        Log update.
        """
        old_instance = self.get_object()
        instance = serializer.save()
        self._log_audit('update', instance, old_instance)
        return instance
    
    def perform_destroy(self, instance):
        """
        Log deletion.
        """
        self._log_audit('delete', instance)
        super().perform_destroy(instance)
    
    def _log_audit(self, action, instance, old_instance=None):
        """
        Create audit log entry.
        """
        from apps.audit.models import AuditLog
        
        try:
            AuditLog.objects.create(
                user=self.request.user if self.request.user.is_authenticated else None,
                action=action,
                model_name=instance._meta.model_name,
                model_id=str(instance.pk),
                old_value=self._serialize_instance(old_instance) if old_instance else None,
                new_value=self._serialize_instance(instance),
                ip_address=self._get_client_ip(),
                user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            )
        except Exception as e:
            logger.error(f"Failed to create audit log: {e}")
    
    def _serialize_instance(self, instance):
        """
        Serialize instance for audit log.
        """
        if hasattr(instance, 'to_audit_dict'):
            return instance.to_audit_dict()
        return str(instance)
    
    def _get_client_ip(self):
        """
        Get client IP address.
        """
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip


class AuditMixin(AuditLogMixin):
    """
    Mixin for audit logging of CRUD operations.
    """
    
    def perform_create(self, serializer):
        """
        Log creation.
        """
        instance = serializer.save()
        self._log_audit('create', instance)
        return instance
    
    def perform_update(self, serializer):
        """
        Log update.
        """
        old_instance = self.get_object()
        instance = serializer.save()
        self._log_audit('update', instance, old_instance)
        return instance
    
    def perform_destroy(self, instance):
        """
        Log deletion.
        """
        self._log_audit('delete', instance)
        super().perform_destroy(instance)
    
    def _log_audit(self, action, instance, old_instance=None):
        """
        Create audit log entry.
        """
        from apps.audit.models import AuditLog
        
        try:
            AuditLog.objects.create(
                user=self.request.user if self.request.user.is_authenticated else None,
                action=action,
                model_name=instance._meta.model_name,
                model_id=str(instance.pk),
                old_value=self._serialize_instance(old_instance) if old_instance else None,
                new_value=self._serialize_instance(instance),
                ip_address=self._get_client_ip(),
                user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            )
        except Exception as e:
            logger.error(f"Failed to create audit log: {e}")
    
    def _serialize_instance(self, instance):
        """
        Serialize instance for audit log.
        """
        if hasattr(instance, 'to_audit_dict'):
            return instance.to_audit_dict()
        
        # Basic serialization
        return str(instance)
    
    def _get_client_ip(self):
        """
        Get client IP address.
        """
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip


class FilterMixin:
    """
    Mixin for advanced filtering.
    """
    filter_fields = []
    search_fields = []
    ordering_fields = ['created_at', 'updated_at']
    
    def get_queryset(self):
        """
        Apply filters to queryset.
        """
        queryset = super().get_queryset()
        
        # Apply field filters
        for field in self.filter_fields:
            value = self.request.query_params.get(field)
            if value is not None:
                queryset = queryset.filter(**{field: value})
        
        # Apply search
        search = self.request.query_params.get('search')
        if search and self.search_fields:
            from django.db.models import Q
            
            q_objects = Q()
            for field in self.search_fields:
                q_objects |= Q(**{f"{field}__icontains": search})
            queryset = queryset.filter(q_objects)
        
        # Apply ordering
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering.lstrip('-') in self.ordering_fields:
            queryset = queryset.order_by(ordering)
        
        return queryset


class StandardViewSet(
    APIResponseMixin,
    CacheMixin,
    AtomicTransactionMixin,
    AuditLogMixin,
    FilterMixin,
    ListModelMixin,
    CreateModelMixin,
    RetrieveModelMixin,
    UpdateModelMixin,
    DestroyModelMixin,
    GenericViewSet
):
    """
    Standard viewset with all mixins included.
    """
    pagination_class = StandardPagination
    
    def list(self, request, *args, **kwargs):
        """
        Override list to use cached response if available.
        """
        # Try to get cached response
        cached_response = self.get_cached_response()
        if cached_response and request.method == 'GET':
            return cached_response
        
        response = super().list(request, *args, **kwargs)
        
        # Cache the response
        if request.method == 'GET':
            self.cache_response(response)
        
        return response
    
    def get_serializer_context(self):
        """
        Add request to serializer context.
        """
        context = super().get_serializer_context()
        context.update({
            'request': self.request,
            'view': self,
        })
        return context
    
    def handle_exception(self, exc):
        """
        Handle exceptions with standard format.
        """
        import traceback
        
        # Log the exception
        logger.error(
            f"Exception in {self.__class__.__name__}: {exc}",
            exc_info=True,
            extra={
                'user': self.request.user.id if hasattr(self.request, 'user') else None,
                'path': self.request.path,
                'method': self.request.method,
            }
        )
        
        # Handle specific exceptions
        if isinstance(exc, (ValueError, KeyError, AttributeError)):
            return self.validation_error(
                errors={'detail': str(exc)},
                message="Invalid request data"
            )
        
        # Call parent handler for other exceptions
        return super().handle_exception(exc)


class ReadOnlyViewSet(
    APIResponseMixin,
    CacheMixin,
    FilterMixin,
    ListModelMixin,
    RetrieveModelMixin,
    GenericViewSet
):
    """
    Read-only viewset.
    """
    pagination_class = StandardPagination


class ModelViewSet(StandardViewSet):
    """
    Alias for StandardViewSet for backward compatibility.
    """
    pass