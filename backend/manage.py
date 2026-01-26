# backend/manage.py
#!/usr/bin/env python
"""
Django's command-line utility for administrative tasks.
Enhanced environment handling with safe defaults.
"""

import os
import sys
from pathlib import Path
import logging
import warnings


def resolve_settings_module(argv: list[str]) -> None:
    """
    Resolve DJANGO_SETTINGS_MODULE based on CLI arguments.
    Supports:
      --env=development|production|testing
      --production / -prod
      --testing / -test
    """

    default_settings = "super_legit_advance.settings.development"
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", default_settings)

    for arg in list(argv):
        if arg.startswith("--env="):
            env = arg.split("=", 1)[1]
            os.environ["DJANGO_SETTINGS_MODULE"] = (
                f"super_legit_advance.settings.{env}"
            )
            argv.remove(arg)
            break

        if arg in ("--production", "-prod"):
            os.environ["DJANGO_SETTINGS_MODULE"] = (
                "super_legit_advance.settings.production"
            )
            argv.remove(arg)
            break

        if arg in ("--testing", "-test"):
            os.environ["DJANGO_SETTINGS_MODULE"] = (
                "super_legit_advance.settings.testing"
            )
            argv.remove(arg)
            break


def setup_python_path() -> Path:
    """
    Ensure project root is on PYTHONPATH.
    """
    project_root = Path(__file__).resolve().parent
    sys.path.insert(0, str(project_root))
    return project_root


def configure_runtime() -> None:
    """
    Configure warnings and logging for manage.py execution.
    """
    warnings.filterwarnings("ignore", category=UserWarning)

    logging.basicConfig(
        level=logging.WARNING,
        format="%(levelname)s %(name)s: %(message)s",
    )


def print_startup_banner(project_root: Path) -> None:
    """
    Print clean startup info for runserver only.
    """
    if "runserver" not in sys.argv:
        return

    settings_module = os.environ.get("DJANGO_SETTINGS_MODULE", "not set")

    print("=" * 60)
    print("🚀 Django Management Command")
    print(f"📦 Project root : {project_root}")
    print(f"⚙️  Settings     : {settings_module}")
    print("=" * 60)

    # Late import (safe after settings resolution)
    from django.conf import settings

    if settings.DEBUG:
        print("🟢 DEBUG mode enabled")
        print(f"🗄️  Database     : {settings.DATABASES['default']['ENGINE']}")
        print(f"📁 Static URL   : {settings.STATIC_URL}")
        print("-" * 60)

    if "production" in settings_module:
        print("⚠️  WARNING:")
        print("   You are running the development server")
        print("   with PRODUCTION settings.")
        print("   This is NOT recommended.")
        print("-" * 60)


def main() -> None:
    """Run administrative tasks."""

    project_root = setup_python_path()
    resolve_settings_module(sys.argv)
    configure_runtime()

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH? Did you activate the venv?"
        ) from exc

    print_startup_banner(project_root)

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
