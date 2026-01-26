# backend/apps/core/views.py
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
import logging

logger = logging.getLogger(__name__)


def health_check(request):
    """Health check endpoint."""
    return JsonResponse({"status": "ok", "service": "Super Legit Advance API"})


def error_400(request, exception=None):
    """400 Bad Request error handler."""
    logger.warning(f"400 Bad Request: {exception}")
    
    if request.headers.get('Accept') == 'application/json':
        return JsonResponse({
            'error': 'Bad Request',
            'message': 'The server cannot process the request due to a client error.',
            'status_code': 400
        }, status=400)
    
    return render(request, 'errors/400.html', status=400)


def error_403(request, exception=None):
    """403 Forbidden error handler."""
    logger.warning(f"403 Forbidden: {exception}")
    
    if request.headers.get('Accept') == 'application/json':
        return JsonResponse({
            'error': 'Forbidden',
            'message': 'You do not have permission to access this resource.',
            'status_code': 403
        }, status=403)
    
    return render(request, 'errors/403.html', status=403)


def error_404(request, exception=None):
    """404 Not Found error handler."""
    logger.warning(f"404 Not Found: {request.path}")
    
    if request.headers.get('Accept') == 'application/json':
        return JsonResponse({
            'error': 'Not Found',
            'message': 'The requested resource could not be found.',
            'path': request.path,
            'status_code': 404
        }, status=404)
    
    return render(request, 'errors/404.html', status=404)


def error_500(request):
    """500 Internal Server Error handler."""
    logger.error("500 Internal Server Error")
    
    if request.headers.get('Accept') == 'application/json':
        return JsonResponse({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred on the server.',
            'status_code': 500
        }, status=500)
    
    return render(request, 'errors/500.html', status=500)


# API Error handlers
class ErrorHandlersAPI(APIView):
    """API error handlers."""
    
    @staticmethod
    def handle_400(exception=None):
        return Response({
            'error': 'Bad Request',
            'message': str(exception) if exception else 'Invalid request parameters.',
            'status_code': 400
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @staticmethod
    def handle_401(exception=None):
        return Response({
            'error': 'Unauthorized',
            'message': 'Authentication credentials were not provided or are invalid.',
            'status_code': 401
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    @staticmethod
    def handle_403(exception=None):
        return Response({
            'error': 'Forbidden',
            'message': 'You do not have permission to perform this action.',
            'status_code': 403
        }, status=status.HTTP_403_FORBIDDEN)
    
    @staticmethod
    def handle_404(exception=None):
        return Response({
            'error': 'Not Found',
            'message': 'The requested resource could not be found.',
            'status_code': 404
        }, status=status.HTTP_404_NOT_FOUND)
    
    @staticmethod
    def handle_500(exception=None):
        return Response({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred. Our team has been notified.',
            'status_code': 500
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Custom exception handler for DRF
def custom_exception_handler(exc, context):
    """
    Custom exception handler for Django REST Framework.
    Returns custom error responses.
    """
    from rest_framework.views import exception_handler
    
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Add custom error format
        response.data = {
            'error': response.status_text,
            'message': str(exc) if str(exc) else 'An error occurred',
            'status_code': response.status_code,
            'details': response.data if isinstance(response.data, dict) else {}
        }
    
    return response


@api_view(['GET'])
def api_root(request):
    """API root endpoint that lists all available endpoints."""
    return Response({
        'message': 'Welcome to Super Legit Advance API',
        'version': 'v1',
        'documentation': {
            'swagger': '/api/docs/',
            'redoc': '/api/redoc/',
        },
        'authentication': {
            'token_obtain': '/api/auth/token/',
            'token_refresh': '/api/auth/token/refresh/',
            'token_verify': '/api/auth/token/verify/',
        },
        'endpoints': {
            'health': '/api/health/',
            'users': '/api/users/',
            'customers': '/api/customers/',
            'loans': '/api/loans/',
            'repayments': '/api/repayments/',
            'mpesa': '/api/mpesa/',
            'notifications': '/api/notifications/',
            'reports': '/api/reports/',
            'audit': '/api/audit/',
        },
        'status': 'operational'
    })


# Maintenance mode view
def maintenance_mode(request):
    """Maintenance mode page."""
    return render(request, 'errors/maintenance.html', status=503)