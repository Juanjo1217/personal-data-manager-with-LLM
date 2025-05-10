from django.core.exceptions import ValidationError
import re

def validar_solo_letras(value):
    if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$', value):
        raise ValidationError('Este campo solo puede contener letras.')

def validar_solo_numeros(value):
    if not value.isdigit():
        raise ValidationError('Este campo solo puede contener números.')