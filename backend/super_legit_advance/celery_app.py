import os

from celery import Celery


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "super_legit_advance.settings.production")

app = Celery("super_legit_advance")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


@app.task(bind=True)
def debug_task(self):
    print(f"Celery debug task request: {self.request!r}")
