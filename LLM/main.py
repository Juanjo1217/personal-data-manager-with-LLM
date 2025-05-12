# import psycopg2
from google import genai
from fastapi import FastAPI
from pydantic import BaseModel
import os
from dotenv import load_dotenv
load_dotenv()

load_dotenv(".env")


key = os.getenv("LLM_API_KEY")
if key is None:
    raise ValueError("API key not found. Please set the LLM_API_KEY environment variable.")

print(key)

client = genai.Client(api_key=key)

class Item(BaseModel):
    prompt: str



app = FastAPI()

@app.get("/")
def root():
    return {"message": "API FastAPI funcionando"}


@app.post("/llm")
def llmRequest(message: Item):
    response = client.models.generate_content(
    model="gemini-2.0-flash", contents=message.prompt
    )
    return response.text

#http://127.0.0.1:8000/