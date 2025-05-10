# import psycopg2
from google import genai

# # Configuración de la conexión a la base de datos PostgreSQL
# db_config = {
#     'dbname': 'Test',
#     'user': 'postgres',
#     'password': '',
#     'host': 'localhost',
#     'port': '5432'
# }

# # Conectar a la base de datos PostgreSQL
# try:
#     conn = psycopg2.connect(**db_config)
#     print("Conexión a la base de datos exitosa")
# except Exception as e:
#     print(f"Error al conectar a la base de datos: {e}")

# cursor = conn.cursor()

# # Ejemplo de consulta a la base de datos
# query = "SELECT * FROM Usuarios "
# cursor.execute(query)

# # Obtener los resultados de la consulta
# results = cursor.fetchall()
# for row in results:
#     print(row)


# # Cerrar la conexión
# cursor.close()
# conn.close()

client = genai.Client(api_key="AIzaSyBshm6u1lCQCHBhFLY8-3HBD-2iEv2KG8Y")


def interact_with_agent(prompt):
    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=prompt
    )
    return response

prompt = "Genera una consulta SQL para obtener todos los registros de la tabla 'Usuarios'"
response = interact_with_agent(prompt)
print(response.text)