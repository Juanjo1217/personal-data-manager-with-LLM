from django.core.exceptions import ValidationError
import re

def validar_solo_letras(value):
    if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$', value):
        raise ValidationError('Este campo solo puede contener letras.')

def validar_solo_numeros(value):
    if not value.isdigit():
        raise ValidationError('Este campo solo puede contener números.')

def validar_tamano_archivo(value):
    limit = 2 * 1024 * 1024  # 2MB
    if value.size > limit:
        raise ValidationError('El archivo no puede ser mayor a 2MB.')