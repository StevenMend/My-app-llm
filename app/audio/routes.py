import os
import requests
from fastapi import APIRouter, UploadFile, File
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    contents = await file.read()

    with open("temp_audio.webm", "wb") as f:
        f.write(contents)

    with open("temp_audio.webm", "rb") as audio_file:
        response = requests.post(
            "https://api.openai.com/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            files={"file": ("audio.webm", audio_file, "audio/webm")},
            data={"model": "whisper-1", "response_format": "text"},
        )

    return {"text": response.text}
