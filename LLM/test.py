import os
from dotenv import load_dotenv

load_dotenv(".env")


key = os.getenv("LLM_API_KEY")

print(f"{key}")