import psycopg2
from google import genai
from fastapi import FastAPI
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import re
load_dotenv()

key = os.getenv("LLM_API_KEY")

if key is None:
    raise ValueError("API key not found. Please set the LLM_API_KEY environment variable.")

client = genai.Client(api_key=key)

# Configuración de conexión a PostgreSQL
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_NAME = os.getenv("POSTGRES_DB", "mi_base_de_datos")
DB_USER = os.getenv("POSTGRES_USER", "mi_usuario")
DB_PASS = os.getenv("POSTGRES_PASSWORD", "mi_contraseña")

def run_query(query: str):
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )
    cur = conn.cursor()
    cur.execute(query)
    result = cur.fetchall()
    columns = [desc[0] for desc in cur.description]
    cur.close()
    conn.close()
    return columns, result

def get_db_schema():
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )
    cur = conn.cursor()
    cur.execute("""
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    schema = {}
    for table, column in rows:
        schema.setdefault(table, []).append(column)
    return schema

class Item(BaseModel):
    prompt: str

app = FastAPI()

@app.get("/")
def root():
    return {"message": "API FastAPI funcionando"}

@app.post("/llm")
def llmRequest(message: Item):
    # Obtener el esquema de la base de datos
    schema = get_db_schema()
    print("Esquema de la base de datos:", schema)
    schema_str = "\n".join([f"Tabla: {table}, Columnas: {', '.join(cols)}" for table, cols in schema.items()])

    # Incluir el esquema en el prompt
    sql_prompt = (
        f"Base de datos:\n{schema_str}\n"
        f"Genera una consulta SQL de PostgreSQL para la siguiente petición: '{message.prompt}'. "
        "Solo responde con la consulta SQL."
    )
    sql_query = client.models.generate_content(
        model="gemini-2.0-flash", contents=sql_prompt
    ).text.strip()

    # Limpiar el SQL generado por el LLM
    sql_query = re.sub(r"^```sql|^```|```$", "", sql_query, flags=re.MULTILINE).strip()

    # Verificar que la consulta sea un SELECT
    if not sql_query.strip().lower().startswith("select"):
        return {"error": "Este espacio es solo para consultas"}

    try:
        columns, result = run_query(sql_query)
    except Exception as e:
        return {"error": f"Error ejecutando la consulta: {str(e)}", "sql_query": sql_query}

    print(result)
    explanation_prompt = (
        f"si la peticion fue {message.prompt} y el resultado fue {result}"
        "parafrasea este resultado en lenguaje natural de forma breve."
    )
    explanation = client.models.generate_content(
        model="gemini-2.0-flash", contents=explanation_prompt
    ).text.strip()

    return {
        "sql_query": sql_query,
        "result": result,
        "columns": columns,
        "explanation": explanation
    }
    

#http://127.0.0.1:8000/