# backend/super_legit_advance/wsgi.py
"""
WSGI config for super_legit_advance project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
import sys
from pathlib import Path

# Add the project root directory to Python path
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from django.core.wsgi import get_wsgi_application

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'super_legit_advance.settings')

# Get the WSGI application
application = get_wsgi_application()

# Optional: WSGI middleware for additional functionality
try:
    # Add WhiteNoise for static files
    from whitenoise import WhiteNoise
    application = WhiteNoise(application, root=str(project_root / 'staticfiles'))
    print("WhiteNoise middleware enabled")
except ImportError:
    print("WhiteNoise not installed, static files will be served by Django")

# Optional: Add Sentry (if installed)
try:
    import sentry_sdk
    from sentry_sdk.integrations.wsgi import SentryWsgiMiddleware
    
    # Check if Sentry DSN is configured
    from django.conf import settings
    if hasattr(settings, 'SENTRY_DSN') and settings.SENTRY_DSN:
        application = SentryWsgiMiddleware(application)
        print("Sentry WSGI middleware enabled")
except ImportError:
    pass

# Optional: Add NewRelic (if installed)
try:
    import newrelic.agent
    newrelic.agent.initialize(str(project_root / 'newrelic.ini'))
    application = newrelic.agent.WSGIApplicationWrapper(application)
    print("NewRelic middleware enabled")
except (ImportError, FileNotFoundError):
    pass

# Optional: Add GZip compression
try:
    from gzipmiddleware import GZipMiddleware
    application = GZipMiddleware(application)
    print("GZip middleware enabled")
except ImportError:
    pass

# Log WSGI application startup
print(f"WSGI application loaded with settings: {os.environ.get('DJANGO_SETTINGS_MODULE')}")
print(f"Project root: {project_root}")