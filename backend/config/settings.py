from pathlib import Path

from decouple import config
from django.core.exceptions import ImproperlyConfigured


BASE_DIR = Path(__file__).resolve().parent.parent


def config_list(name, default=""):
    """
    Converte uma variável de ambiente separada por vírgulas
    em uma lista de valores.
    """
    raw_value = config(name, default=default)

    return [
        item.strip()
        for item in raw_value.split(",")
        if item.strip()
    ]


LOCAL_DEVELOPMENT_SECRET_KEY = (
    "django-insecure-local-development-only"
)

SECRET_KEY = config(
    "DJANGO_SECRET_KEY",
    default=LOCAL_DEVELOPMENT_SECRET_KEY,
)

DEBUG = config(
    "DJANGO_DEBUG",
    default=True,
    cast=bool,
)

if not DEBUG and SECRET_KEY == LOCAL_DEVELOPMENT_SECRET_KEY:
    raise ImproperlyConfigured(
        "Defina DJANGO_SECRET_KEY no ambiente de produção."
    )


ALLOWED_HOSTS = config_list(
    "DJANGO_ALLOWED_HOSTS",
    default="localhost,127.0.0.1",
)


INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "tasks",
    "users",
    "categories",
    "django_filters",
    "integrations",
    "drf_spectacular",
    "corsheaders",
]


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF = "config.urls"


TEMPLATES = [
    {
        "BACKEND": (
            "django.template.backends.django.DjangoTemplates"
        ),
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                (
                    "django.template.context_processors."
                    "request"
                ),
                (
                    "django.contrib.auth.context_processors."
                    "auth"
                ),
                (
                    "django.contrib.messages.context_processors."
                    "messages"
                ),
            ],
        },
    },
]


WSGI_APPLICATION = "config.wsgi.application"


database_path = Path(
    config(
        "SQLITE_PATH",
        default=str(BASE_DIR / "db.sqlite3"),
    )
)

database_path.parent.mkdir(
    parents=True,
    exist_ok=True,
)


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": database_path,
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]


LANGUAGE_CODE = "pt-br"

TIME_ZONE = "America/Fortaleza"

USE_I18N = True

USE_TZ = True


STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"


STORAGES = {
    "default": {
        "BACKEND": (
            "django.core.files.storage.FileSystemStorage"
        ),
    },
    "staticfiles": {
        "BACKEND": (
            "whitenoise.storage."
            "CompressedManifestStaticFilesStorage"
        ),
    },
}


REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        (
            "rest_framework_simplejwt.authentication."
            "JWTAuthentication"
        ),
    ),
    "DEFAULT_SCHEMA_CLASS": (
        "drf_spectacular.openapi.AutoSchema"
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ),
    "DEFAULT_PAGINATION_CLASS": (
        "rest_framework.pagination.PageNumberPagination"
    ),
    "PAGE_SIZE": 8,
}


AUTH_USER_MODEL = "users.User"


SPECTACULAR_SETTINGS = {
    "TITLE": "TasksHub API",
    "DESCRIPTION": (
        "API para gerenciamento de tarefas, categorias, "
        "compartilhamento entre usuários e consulta de "
        "feriados."
    ),
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}


CORS_ALLOWED_ORIGINS = config_list(
    "CORS_ALLOWED_ORIGINS",
    default=(
        "http://localhost:5173,"
        "http://127.0.0.1:5173"
    ),
)


CSRF_TRUSTED_ORIGINS = config_list(
    "CSRF_TRUSTED_ORIGINS",
)


SECURE_PROXY_SSL_HEADER = (
    "HTTP_X_FORWARDED_PROTO",
    "https",
)

SECURE_SSL_REDIRECT = config(
    "DJANGO_SECURE_SSL_REDIRECT",
    default=False,
    cast=bool,
)

SESSION_COOKIE_SECURE = not DEBUG

CSRF_COOKIE_SECURE = not DEBUG


DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"