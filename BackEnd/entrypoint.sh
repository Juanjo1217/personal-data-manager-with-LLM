#!/bin/bash

# Esperar a que PostgreSQL esté listo
echo "Esperando a que PostgreSQL esté listo..."
while ! nc -z postgres-container 5432; do
  sleep 1
done
echo "PostgreSQL está listo!"

# Ejecutar migraciones
echo "Ejecutando migraciones..."
python manage.py makemigrations
python manage.py migrate

# Crear superusuario si no existe (opcional)
echo "Creando superusuario..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
from datetime import date
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123',
        first_name='Admin',
        last_name='User',
        fecha_nacimiento=date(1990, 1, 1),
        genero='NR',
        celular='3001234567',
        numero_documento='0000000000',
        tipo_documento='CC'
    )
    print('Superusuario creado')
else:
    print('Superusuario ya existe')
"

# Iniciar servidor
echo "Iniciando servidor Django..."
python manage.py runserver 0.0.0.0:8000