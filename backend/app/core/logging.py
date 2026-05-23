"""
Centralized logging configuration for the Clinical Trial API.

Usage in any module::

    from app.core.logging import get_logger
    logger = get_logger(__name__)

This keeps all format/level decisions in one place, so changing the
output format or adding a file handler only requires editing this file.
"""
import logging
import os
import sys

# ---------------------------------------------------------------------------
# Log level — override with LOG_LEVEL env var (DEBUG | INFO | WARNING | ERROR)
# ---------------------------------------------------------------------------
_LOG_LEVEL_NAME = os.getenv("LOG_LEVEL", "INFO").upper()
_LOG_LEVEL = getattr(logging, _LOG_LEVEL_NAME, logging.INFO)

# ---------------------------------------------------------------------------
# Format
# Produces lines like:
#   2026-05-23 19:10:42,381 | INFO     | app.routers.auth     | User researcher@clintrack.com logged in
# ---------------------------------------------------------------------------
_FORMATTER = logging.Formatter(
    fmt="%(asctime)s | %(levelname)-8s | %(name)-30s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# ---------------------------------------------------------------------------
# Root handler — write everything to stdout (captured by Docker / gunicorn)
# ---------------------------------------------------------------------------
_handler = logging.StreamHandler(sys.stdout)
_handler.setFormatter(_FORMATTER)


def configure_logging() -> None:
    """
    Configure the root logger once at application startup.

    Call this from ``main.py`` before creating the FastAPI app so that all
    subsequent ``getLogger(__name__)`` calls inherit the same format and level.
    SQLAlchemy's verbose engine logger is silenced to WARNING to avoid
    printing every SQL statement in non-debug mode.
    """
    root = logging.getLogger()
    # Avoid adding duplicate handlers if called more than once (e.g. in tests)
    if root.handlers:
        return

    root.setLevel(_LOG_LEVEL)
    root.addHandler(_handler)

    # SQLAlchemy logs every SQL at INFO — too noisy in non-DEBUG mode
    sa_level = logging.DEBUG if _LOG_LEVEL == logging.DEBUG else logging.WARNING
    logging.getLogger("sqlalchemy.engine").setLevel(sa_level)


def get_logger(name: str) -> logging.Logger:
    """
    Return a named logger.  Always call ``configure_logging()`` first.

    Example::

        logger = get_logger(__name__)
        logger.info("Participant %s created", participant_id)
    """
    return logging.getLogger(name)
