### 1. Estructura del Proyecto

Primero, asegúrate de que tu proyecto tenga una estructura de carpetas adecuada. Por ejemplo:

```
/mi-proyecto
|-- /contenedores
|   |-- /modulo-postgresql
|   |   |-- Dockerfile
|   |   |-- init.sql
|   |   |-- docker-compose.yml
|-- /otros-modulos
```

### 2. Crear el Dockerfile

Dentro de la carpeta `modulo-postgresql`, crea un archivo llamado `Dockerfile` con el siguiente contenido:

```dockerfile
# Usar la imagen oficial de PostgreSQL
FROM postgres:latest

# Copiar el script de inicialización (opcional)
COPY init.sql /docker-entrypoint-initdb.d/

# Exponer el puerto por defecto de PostgreSQL
EXPOSE 5432
```

### 3. Crear el Script de Inicialización (opcional)

Si deseas inicializar la base de datos con algunas tablas o datos, crea un archivo llamado `init.sql` en la misma carpeta. Por ejemplo:

```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL
);
```

### 4. Crear el archivo docker-compose.yml

Crea un archivo llamado `docker-compose.yml` en la carpeta `modulo-postgresql` para definir el servicio de PostgreSQL:

```yaml
version: '3.8'

services:
  postgres:
    build: .
    image: mi-postgres:latest
    environment:
      POSTGRES_USER: mi_usuario
      POSTGRES_PASSWORD: mi_contraseña
      POSTGRES_DB: mi_base_de_datos
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### 5. Construir y Ejecutar el Contenedor

Navega a la carpeta `modulo-postgresql` en tu terminal y ejecuta los siguientes comandos:

```bash
# Construir la imagen
docker-compose build

# Iniciar el contenedor
docker-compose up
```

### 6. Acceder a PostgreSQL

Una vez que el contenedor esté en funcionamiento, puedes acceder a PostgreSQL utilizando un cliente de base de datos como `psql`, DBeaver, o cualquier otro cliente que prefieras. Conéctate usando las credenciales que definiste en el archivo `docker-compose.yml`.

### 7. Detener el Contenedor

Para detener el contenedor, puedes usar:

```bash
docker-compose down
```

### Notas Adicionales

- Asegúrate de tener Docker y Docker Compose instalados en tu máquina.
- Puedes personalizar el archivo `docker-compose.yml` según tus necesidades, como agregar más servicios o configuraciones.
- Si necesitas conectarte a la base de datos desde otro contenedor, asegúrate de que ambos contenedores estén en la misma red de Docker.

Con estos pasos, deberías tener un módulo de contenedor con PostgreSQL funcionando en tu proyecto. ¡Buena suerte!