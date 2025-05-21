import psycopg2
from google import genai
from fastapi import FastAPI
from pydantic import BaseModel
import os
from dotenv import load_dotenv
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

class Item(BaseModel):
    prompt: str

app = FastAPI()

@app.get("/")
def root():
    return {"message": "API FastAPI funcionando"}

@app.post("/llm")
def llmRequest(message: Item):
    # 1. Pedir al LLM que genere una consulta SQL
    sql_prompt = f"Genera una consulta SQL para la siguiente petición: '{message.prompt}'. Solo responde con la consulta SQL."
    sql_query = client.models.generate_content(
        model="gemini-2.0-flash", contents=sql_prompt
    ).text.strip()

    # 2. Ejecutar la consulta SQL
    try:
        columns, result = run_query(sql_query)
    except Exception as e:
        return {"error": f"Error ejecutando la consulta: {str(e)}", "sql_query": sql_query}

    # 3. Pedir al LLM que explique el resultado en lenguaje natural
    explanation_prompt = (
        f"El resultado de la consulta '{sql_query}' es: {result} (columnas: {columns}). "
        "Explica este resultado en lenguaje natural para un usuario no técnico."
    )
    explanation = client.models.generate_content(
        model="gemini-2.0-flash", contents=explanation_prompt
    ).text.strip()

    return explanation
    

#http://127.0.0.1:8000/