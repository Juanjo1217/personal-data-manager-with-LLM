# import psycopg2
from google import genai
import requests
import os

api_key = os.getenv("OPENAI_API_KEY")


def consultar_django(nombre):
    url = "http://api_crud:8000/api/buscar/"
    payload = {"nombre": nombre}
    response = requests.post(url, json=payload)
    return response.json()


client = genai.Client(api_key=api_key)


def interact_with_agent(prompt):
    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=prompt
    )
    return response

prompt = "Genera una consulta SQL para obtener todos los registros de la tabla 'Usuarios'"
response = interact_with_agent(prompt)
print(response.text)