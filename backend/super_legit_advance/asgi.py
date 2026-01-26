# backend/super_legit_advance/asgi.py
"""
ASGI config for super_legit_advance project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'super_legit_advance.settings')

# Initialize Django
django.setup()

# Import after Django setup to avoid AppRegistryNotReady
try:
    from apps.notifications.routing import websocket_urlpatterns
    HAS_CHANNELS = True
except ImportError:
    HAS_CHANNELS = False
    websocket_urlpatterns = []

# Get the ASGI application
django_asgi_app = get_asgi_application()

# Define the ASGI application
if HAS_CHANNELS:
    application = ProtocolTypeRouter({
        "http": django_asgi_app,
        "websocket": AllowedHostsOriginValidator(
            AuthMiddlewareStack(
                URLRouter(
                    websocket_urlpatterns
                )
            )
        ),
    })
else:
    application = django_asgi_app

# Optional: Add lifespan protocol for startup/shutdown events
async def app(scope, receive, send):
    if scope['type'] == 'lifespan':
        while True:
            message = await receive()
            if message['type'] == 'lifespan.startup':
                # Perform startup tasks
                print("ASGI application starting up...")
                await send({'type': 'lifespan.startup.complete'})
            elif message['type'] == 'lifespan.shutdown':
                # Perform shutdown tasks
                print("ASGI application shutting down...")
                await send({'type': 'lifespan.shutdown.complete'})
                break
    else:
        await application(scope, receive, send)

# For compatibility with older ASGI servers
default_application = application