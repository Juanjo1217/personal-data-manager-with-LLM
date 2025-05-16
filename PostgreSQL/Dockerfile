FROM postgres:latest

# Copiar el script de inicialización (opcional)
COPY init.sql /docker-entrypoint-initdb.d/

# Exponer el puerto por defecto de PostgreSQL
EXPOSE 5432

# Usa variables de entorno para configuración (se recomienda usar un archivo .env)
# Ejemplo: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB