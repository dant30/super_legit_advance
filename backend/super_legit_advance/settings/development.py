# backend/super_legit_advance/settings/development.py
"""
Development settings - Override base settings for local development.
"""

from .base import *

# ============================================================================
# DEVELOPMENT OVERRIDES
# ============================================================================

# Security - Permissive for local development
DEBUG = True
ALLOWED_HOSTS = ['*']
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# CORS - Allow all origins during development
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]

# ============================================================================
# DATABASE
# ============================================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ============================================================================
# CACHE & CELERY
# ============================================================================
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}

CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# ============================================================================
# EMAIL
# ============================================================================
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# ============================================================================
# EXTERNAL SERVICES (Sandbox)
# ============================================================================
MPESA_ENVIRONMENT = 'sandbox'
MPESA_SHORTCODE = '174379'  # Sandbox shortcode
AFRICASTALKING_USERNAME = 'sandbox'

# ============================================================================
# REST FRAMEWORK & JWT
# ============================================================================
REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = (
    'rest_framework.renderers.JSONRenderer',
    'rest_framework.renderers.BrowsableAPIRenderer',
)

SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'] = timedelta(hours=24)
SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'] = timedelta(days=7)

# ============================================================================
# DEBUGGING TOOLS
# ============================================================================
try:
    import debug_toolbar
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE.insert(0, 'debug_toolbar.middleware.DebugToolbarMiddleware')
    INTERNAL_IPS = ['127.0.0.1', 'localhost']
except ImportError:
    pass

try:
    import django_extensions
    if 'django_extensions' not in INSTALLED_APPS:
        INSTALLED_APPS += ['django_extensions']
except ImportError:
    pass

# ============================================================================
# LOGGING (Minimal noise for development)
# ============================================================================
LOGGING['loggers']['django']['level'] = 'INFO'
LOGGING['loggers']['django']['handlers'] = ['console']

LOGGING['loggers']['django.db.backends'] = {
    'handlers': ['console'],
    'level': 'ERROR',
    'propagate': False,
}

LOGGING['loggers']['django.server'] = {
    'handlers': ['console'],
    'level': 'INFO',
    'propagate': False,
}

LOGGING['loggers']['apps'] = {
    'handlers': ['console'],
    'level': 'INFO',
    'propagate': False,
}

# Suppress warnings
import warnings
warnings.filterwarnings('ignore', category=UserWarning, module='africastalking')

# ============================================================================
# STARTUP MESSAGE
# ============================================================================
if __name__ == '__main__' or True:
    print("=" * 60)
    print("✓ Development settings loaded")
    print(f"  DEBUG: {DEBUG}")
    print(f"  DATABASE: {DATABASES['default']['ENGINE']}")
    print(f"  CORS_ALLOW_ALL_ORIGINS: {CORS_ALLOW_ALL_ORIGINS}")
    print("=" * 60)