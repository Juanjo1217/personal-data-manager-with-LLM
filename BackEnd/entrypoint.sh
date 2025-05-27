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

# Crear 50 usuarios adicionales
echo "Creando usuarios adicionales..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
from datetime import date
import random

User = get_user_model()

# Lista de nombres y apellidos colombianos
nombres_masculinos = [
    'Carlos', 'Juan', 'Diego', 'Andrés', 'Miguel', 'Luis', 'José', 'David', 'Daniel', 'Santiago',
    'Alejandro', 'Felipe', 'Sebastián', 'Gabriel', 'Ricardo', 'Fernando', 'Javier', 'Oscar', 'Camilo', 'Nicolás'
]

nombres_femeninos = [
    'María', 'Ana', 'Carolina', 'Paola', 'Claudia', 'Laura', 'Natalia', 'Adriana', 'Valentina', 'Isabella',
    'Gabriela', 'Juliana', 'Andrea', 'Camila', 'Diana', 'Sara', 'Alejandra', 'Daniela', 'Sofía', 'Paula'
]

apellidos = [
    'García', 'Rodríguez', 'López', 'Martínez', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores',
    'Rivera', 'Gómez', 'Díaz', 'Reyes', 'Morales', 'Cruz', 'Ortiz', 'Gutiérrez', 'Ruiz', 'Hernández',
    'Jiménez', 'Mendoza', 'Castro', 'Vargas', 'Ramos', 'Romero', 'Herrera', 'Medina', 'Aguilar', 'Castillo'
]

# Prefijos de celular colombianos
prefijos_celular = ['300', '301', '310', '311', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321']

# Crear 50 usuarios
for i in range(1, 51):
    # Elegir género aleatoriamente
    genero = random.choice(['M', 'F'])
    
    # Elegir nombre según el género
    if genero == 'M':
        nombre = random.choice(nombres_masculinos)
        email_prefix = nombre.lower()
    else:
        nombre = random.choice(nombres_femeninos)
        email_prefix = nombre.lower()
    
    # Elegir apellidos
    apellido1 = random.choice(apellidos)
    apellido2 = random.choice(apellidos)
    
    # Generar username único
    username = f'{email_prefix.lower()}.{apellido1.lower()}{i}'
    
    # Generar email
    email = f'{username}@correo.com'
    
    # Generar fecha de nacimiento (entre 1980 y 2000)
    año = random.randint(1980, 2000)
    mes = random.randint(1, 12)
    día = random.randint(1, 28)  # Usar 28 para evitar problemas con febrero
    fecha_nacimiento = date(año, mes, día)
    
    # Generar número de celular
    prefijo = random.choice(prefijos_celular)
    numero_celular = prefijo + str(random.randint(1000000, 9999999))
    
    # Generar número de documento (cédula colombiana)
    numero_documento = str(random.randint(10000000, 99999999))
    
    # Verificar si ya existe el usuario
    if not User.objects.filter(username=username).exists():
        try:
            User.objects.create_user(
                username=username,
                email=email,
                password='usuario123',
                first_name=nombre,
                last_name=f'{apellido1} {apellido2}',
                fecha_nacimiento=fecha_nacimiento,
                genero=genero,
                celular=numero_celular,
                numero_documento=numero_documento,
                tipo_documento='CC'
            )
            print(f'Usuario {i}: {username} creado exitosamente')
        except Exception as e:
            print(f'Error creando usuario {username}: {e}')
    else:
        print(f'Usuario {username} ya existe')

print('Creación de usuarios completada')
"

# Iniciar servidor
echo "Iniciando servidor Django..."
python manage.py runserver 0.0.0.0:8000