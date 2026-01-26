# backend/apps/core/utils/exceptions.py
"""
Custom exception handlers for REST API.
"""

import logging
from django.core.exceptions import PermissionDenied, ValidationError
from django.http import Http404
from rest_framework import exceptions, status
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF that returns consistent error responses.
    
    Args:
        exc: The exception that was raised
        context: Dictionary containing the view and request
    
    Returns:
        Response: Formatted error response
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Get the view and request from context
    view = context.get('view')
    request = context.get('request')
    
    # Log the exception
    logger.error(
        f"Exception in {view.__class__.__name__ if view else 'unknown view'}: "
        f"{type(exc).__name__}: {str(exc)}",
        exc_info=True,
        extra={
            'view': view.__class__.__name__ if view else None,
            'request_path': request.path if request else None,
            'user': request.user.email if request and request.user.is_authenticated else 'anonymous',
        }
    )
    
    # If response is None, handle non-DRF exceptions
    if response is None:
        if isinstance(exc, Http404):
            response_data = {
                'error': {
                    'code': 'not_found',
                    'message': 'The requested resource was not found.',
                    'details': str(exc)
                }
            }
            return Response(response_data, status=status.HTTP_404_NOT_FOUND)
        
        elif isinstance(exc, PermissionDenied):
            response_data = {
                'error': {
                    'code': 'permission_denied',
                    'message': 'You do not have permission to perform this action.',
                    'details': str(exc)
                }
            }
            return Response(response_data, status=status.HTTP_403_FORBIDDEN)
        
        elif isinstance(exc, ValidationError):
            response_data = {
                'error': {
                    'code': 'validation_error',
                    'message': 'Validation error occurred.',
                    'details': exc.messages if hasattr(exc, 'messages') else str(exc)
                }
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle any other unexpected exception
        response_data = {
            'error': {
                'code': 'server_error',
                'message': 'An unexpected error occurred on the server.',
                'details': str(exc) if str(exc) else 'No details available'
            }
        }
        return Response(response_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Customize the response for DRF exceptions
    error_code = getattr(exc, 'code', None)
    error_details = getattr(exc, 'detail', None)
    
    if isinstance(error_details, list):
        # If details is a list, format it properly
        details = error_details
    elif isinstance(error_details, dict):
        # If details is a dict, preserve it
        details = error_details
    else:
        # If details is a string, wrap it in a list
        details = [str(error_details)] if error_details else ['An error occurred']
    
    # Standardize the response format
    response_data = {
        'error': {
            'code': error_code or 'api_error',
            'message': exc.__class__.__name__.replace('API', '').replace('Exception', '').replace('_', ' ').title(),
            'details': details
        }
    }
    
    # Add additional context for certain error types
    if isinstance(exc, exceptions.AuthenticationFailed):
        response_data['error']['code'] = 'authentication_failed'
        response_data['error']['message'] = 'Authentication failed. Please check your credentials.'
        response_data['error']['hint'] = 'Check your username and password, or try refreshing your token.'
    
    elif isinstance(exc, exceptions.NotAuthenticated):
        response_data['error']['code'] = 'not_authenticated'
        response_data['error']['message'] = 'Authentication credentials were not provided.'
        response_data['error']['hint'] = 'Include your authentication token in the Authorization header.'
    
    elif isinstance(exc, exceptions.PermissionDenied):
        response_data['error']['code'] = 'permission_denied'
        response_data['error']['message'] = 'You do not have permission to perform this action.'
        response_data['error']['hint'] = 'Contact your administrator for access to this resource.'
    
    elif isinstance(exc, exceptions.NotFound):
        response_data['error']['code'] = 'not_found'
        response_data['error']['message'] = 'The requested resource was not found.'
        response_data['error']['hint'] = 'Check the resource ID or query parameters.'
    
    elif isinstance(exc, exceptions.MethodNotAllowed):
        response_data['error']['code'] = 'method_not_allowed'
        response_data['error']['message'] = f'Method {request.method} not allowed.'
        response_data['error']['hint'] = 'Check the allowed methods for this endpoint.'
    
    elif isinstance(exc, exceptions.NotAcceptable):
        response_data['error']['code'] = 'not_acceptable'
        response_data['error']['message'] = 'Could not satisfy the request Accept header.'
        response_data['error']['hint'] = 'Check the Accept header in your request.'
    
    elif isinstance(exc, exceptions.UnsupportedMediaType):
        response_data['error']['code'] = 'unsupported_media_type'
        response_data['error']['message'] = 'Unsupported media type in request.'
        response_data['error']['hint'] = 'Check the Content-Type header in your request.'
    
    elif isinstance(exc, exceptions.Throttled):
        response_data['error']['code'] = 'throttled'
        response_data['error']['message'] = 'Request was throttled.'
        response_data['error']['hint'] = f'Try again in {exc.wait} seconds.'
        response_data['error']['retry_after'] = exc.wait
    
    elif isinstance(exc, exceptions.ValidationError):
        response_data['error']['code'] = 'validation_error'
        response_data['error']['message'] = 'Validation error occurred.'
        response_data['error']['hint'] = 'Check your input data for errors.'
        
        # Format validation errors more cleanly
        if isinstance(details, dict):
            formatted_details = []
            for field, field_errors in details.items():
                if isinstance(field_errors, list):
                    for error in field_errors:
                        formatted_details.append(f'{field}: {error}')
                else:
                    formatted_details.append(f'{field}: {field_errors}')
            response_data['error']['details'] = formatted_details
    
    # Add request ID for tracking
    if request and hasattr(request, 'id'):
        response_data['request_id'] = request.id
    
    # Add timestamp
    from django.utils import timezone
    response_data['timestamp'] = timezone.now().isoformat()
    
    # Add path for debugging
    if request:
        response_data['path'] = request.path
    
    # Replace the original response data with our formatted data
    response.data = response_data
    
    return response


class BaseAPIException(Exception):
    """Base class for all API exceptions."""
    default_code = 'api_error'
    default_message = 'An API error occurred.'
    status_code = status.HTTP_400_BAD_REQUEST
    
    def __init__(self, message=None, code=None, details=None, **kwargs):
        self.message = message or self.default_message
        self.code = code or self.default_code
        self.details = details
        self.extra = kwargs
        super().__init__(self.message)


class BadRequestException(BaseAPIException):
    """400 Bad Request"""
    default_code = 'bad_request'
    default_message = 'Bad request.'
    status_code = status.HTTP_400_BAD_REQUEST


class UnauthorizedException(BaseAPIException):
    """401 Unauthorized"""
    default_code = 'unauthorized'
    default_message = 'Authentication required.'
    status_code = status.HTTP_401_UNAUTHORIZED


class ForbiddenException(BaseAPIException):
    """403 Forbidden"""
    default_code = 'forbidden'
    default_message = 'Access forbidden.'
    status_code = status.HTTP_403_FORBIDDEN


class NotFoundException(BaseAPIException):
    """404 Not Found"""
    default_code = 'not_found'
    default_message = 'Resource not found.'
    status_code = status.HTTP_404_NOT_FOUND


class ConflictException(BaseAPIException):
    """409 Conflict"""
    default_code = 'conflict'
    default_message = 'Resource conflict.'
    status_code = status.HTTP_409_CONFLICT


class ValidationException(BaseAPIException):
    """422 Unprocessable Entity"""
    default_code = 'validation_error'
    default_message = 'Validation failed.'
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY


class TooManyRequestsException(BaseAPIException):
    """429 Too Many Requests"""
    default_code = 'too_many_requests'
    default_message = 'Too many requests.'
    status_code = status.HTTP_429_TOO_MANY_REQUESTS


class ServerException(BaseAPIException):
    """500 Internal Server Error"""
    default_code = 'server_error'
    default_message = 'Internal server error.'
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR


class ServiceUnavailableException(BaseAPIException):
    """503 Service Unavailable"""
    default_code = 'service_unavailable'
    default_message = 'Service temporarily unavailable.'
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE


# Utility function to raise appropriate exceptions
def raise_validation_error(field, message, code=None):
    """Raise a validation error for a specific field."""
    raise ValidationException(
        details={field: [message]},
        code=code or f'validation_error_{field}'
    )


def raise_not_found(resource_name, identifier):
    """Raise a not found exception."""
    raise NotFoundException(
        message=f'{resource_name} with identifier {identifier} not found.',
        details={'resource': resource_name, 'identifier': identifier}
    )


def raise_forbidden(action, resource_name):
    """Raise a forbidden exception."""
    raise ForbiddenException(
        message=f'You are not allowed to {action} {resource_name}.',
        details={'action': action, 'resource': resource_name}
    )