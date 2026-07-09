from django.db import models

from django.contrib.auth.models import AbstractUser

class User(AbstractUser):

    "modelo de usuário personalizado"
    "utiliza os campos do abstract user mas pode ser personalizado"
    "futuramente"

    pass

# Create your models here.
