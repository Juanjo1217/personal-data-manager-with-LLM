from django.db import models
from .validators import validar_solo_letras, validar_solo_numeros
from django.contrib.auth.models import AbstractUser

class Usuario(AbstractUser):
    # Tus campos personalizados aquí
    GENERO_OPCIONES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('NB', 'No binario'),
        ('NR', 'Prefiero no reportar')
    ]
    
    DOCUMENTO_OPCIONES = [
        ('TI', 'Tarjeta de identidad'),
        ('CC', 'Cédula')
    ]
    
    # Elimina los campos que ya vienen en AbstractUser (como first_name, last_name, email, etc.)
    segundo_nombre = models.CharField(max_length=30, blank=True, validators=[validar_solo_letras])
    fecha_nacimiento = models.DateField()
    genero = models.CharField(max_length=2, choices=GENERO_OPCIONES)
    celular = models.CharField(max_length=10, validators=[validar_solo_numeros])
    numero_documento = models.CharField(max_length=10, unique=True, validators=[validar_solo_numeros])
    tipo_documento = models.CharField(max_length=2, choices=DOCUMENTO_OPCIONES)
    foto = models.URLField(blank=True)
    
    # Elimina el campo contraseña porque AbstractUser ya lo incluye
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"