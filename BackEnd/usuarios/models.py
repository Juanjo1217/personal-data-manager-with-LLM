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
    
    # Campos personalizados - algunos opcionales para facilitar creación de superusuarios
    segundo_nombre = models.CharField(max_length=30, blank=True, validators=[validar_solo_letras])
    fecha_nacimiento = models.DateField(null=True, blank=True)  # Opcional
    genero = models.CharField(max_length=2, choices=GENERO_OPCIONES, blank=True)  # Opcional
    celular = models.CharField(max_length=10, validators=[validar_solo_numeros], blank=True)  # Opcional
    numero_documento = models.CharField(max_length=10, unique=True, validators=[validar_solo_numeros], null=True, blank=True)  # Opcional
    tipo_documento = models.CharField(max_length=2, choices=DOCUMENTO_OPCIONES, blank=True)  # Opcional
    foto = models.URLField(blank=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}" if self.first_name or self.last_name else self.username
    
    def save(self, *args, **kwargs):
        # Hashear la contraseña si se está modificando
        if self.password and not self.password.startswith(('pbkdf2_sha256$', 'bcrypt$')):
            self.set_password(self.password)
        super().save(*args, **kwargs)