# import psycopg2
from google import genai
from fastapi import FastAPI
from pydantic import BaseModel

import os


key = os.getenv("LLM_API_KEY")

app = FastAPI()

@app.get("/")
def root():
    return {"message": "API FastAPI funcionando"}

#http://127.0.0.1:8000/