from django.db import models
from django.contrib.auth.hashers import make_password  # Para hashing de contraseñas
from .validators import validar_solo_letras, validar_solo_numeros

class Usuario(models.Model):
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
    
    primer_nombre = models.CharField(max_length=30, validators=[validar_solo_letras])
    segundo_nombre = models.CharField(max_length=30, blank=True, validators=[validar_solo_letras])
    apellidos = models.CharField(max_length=60, validators=[validar_solo_letras])
    fecha_nacimiento = models.DateField()
    genero = models.CharField(max_length=2, choices=GENERO_OPCIONES)
    correo = models.EmailField(unique=True)
    celular = models.CharField(max_length=10, validators=[validar_solo_numeros])
    numero_documento = models.CharField(max_length=10, unique=True, validators=[validar_solo_numeros])
    tipo_documento = models.CharField(max_length=2, choices=DOCUMENTO_OPCIONES)
    foto = models.URLField(blank=True)
    contraseña = models.CharField(max_length=128)  # Longitud para hash SHA-256
    
    def save(self, *args, **kwargs):
        # Hashear la contraseña antes de guardar
        if self.contraseña and not self.contraseña.startswith(('pbkdf2_sha256$', 'bcrypt$')):
            self.contraseña = make_password(self.contraseña)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.primer_nombre} {self.apellidos}"