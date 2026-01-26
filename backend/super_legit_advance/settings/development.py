# backend/super_legit_advance/settings/development.py
"""
Development settings for super_legit_advance project.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-dev-key-!@#$%^&*()change-in-production'

# Allow all hosts for development
ALLOWED_HOSTS = ['*']

# CORS settings for development
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]

# Database - Using SQLite for development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Email settings for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Cache settings for development
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}

# Celery settings for development
CELERY_TASK_ALWAYS_EAGER = True  # Run tasks synchronously
CELERY_TASK_EAGER_PROPAGATES = True

# Security - Disable for development
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Static files served by Django in development
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# REST Framework browsable API
REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = (
    'rest_framework.renderers.JSONRenderer',
    'rest_framework.renderers.BrowsableAPIRenderer',
)

# JWT settings for development
SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(hours=24)
SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'] = timedelta(days=7)

# M-Pesa sandbox settings
MPESA_ENVIRONMENT = 'sandbox'
MPESA_SHORTCODE = '174379'  # Sandbox shortcode

# Africa's Talking sandbox settings
AFRICASTALKING_USERNAME = 'sandbox'

# Debug toolbar (if installed)
try:
    import debug_toolbar
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
    INTERNAL_IPS = ['127.0.0.1', 'localhost']
except ImportError:
    pass

# Django extensions (if installed)
try:
    import django_extensions
    if 'django_extensions' not in INSTALLED_APPS:
        INSTALLED_APPS += ['django_extensions']
except ImportError:
    pass

# ==================================================
# CLEANED UP LOGGING CONFIGURATION FOR DEVELOPMENT
# ==================================================

# Disable DEBUG logging for Django
LOGGING['loggers']['django']['level'] = 'INFO'  # Changed from DEBUG to INFO
LOGGING['loggers']['django']['handlers'] = ['console']  # Only console, not file

# Disable SQL logging in development (this causes most noise)
LOGGING['loggers']['django.db.backends'] = {
    'handlers': ['console'],
    'level': 'ERROR',  # Changed from DEBUG to ERROR
    'propagate': False,
}

# Disable Django server debug messages
LOGGING['loggers']['django.server'] = {
    'handlers': ['console'],
    'level': 'INFO',  # Changed from DEBUG to INFO
    'propagate': False,
}

# Keep our app logging at INFO level
LOGGING['loggers']['apps'] = {
    'handlers': ['console'],
    'level': 'INFO',
    'propagate': False,
}

# Reduce verbosity of other loggers
LOGGING['loggers']['django.utils.autoreload'] = {
    'handlers': ['console'],
    'level': 'WARNING',  # Reduced from DEBUG
    'propagate': False,
}

LOGGING['loggers']['watchfiles'] = {
    'handlers': ['console'],
    'level': 'WARNING',  # Reduced from INFO
    'propagate': False,
}

# Add this to suppress specific warning messages
import warnings
warnings.filterwarnings('ignore', category=UserWarning, module='africastalking')

# ==================================================

if __name__ == '__main__' or True:
    print("=" * 50)
    print("Development settings loaded")
    print(f"DEBUG: {DEBUG}")
    print(f"DATABASE: {DATABASES['default']['ENGINE']} ({DATABASES['default']['NAME']})")  # Fixed this line
    print(f"ALLOWED_HOSTS: {ALLOWED_HOSTS}")
    print("=" * 50)