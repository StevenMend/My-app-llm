from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Depends
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from langserve import add_routes
from starlette.staticfiles import StaticFiles
from dotenv import load_dotenv
from uuid import UUID, uuid4
from sqlalchemy.orm import Session
import os
import shutil
import subprocess

from app.auth import routes as auth_routes
from app.database import engine, get_db
from app.models import Base, SessionDocument
from app.services.pdf_indexer import process_and_index_pdf
from app.rag_chain import final_chain
from app.audio import routes as audio_routes
from app.auth.dependencies import get_current_user
from app.models import ChatSession, User


app = FastAPI()
os.environ["TOKENIZERS_PARALLELISM"] = "false"


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://frontend-production-77dd.up.railway.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)


app.include_router(auth_routes.router, prefix="/auth", tags=["auth"])


app.include_router(audio_routes.router, tags=["voice"])

add_routes(app, final_chain, path="/rag")

os.makedirs("./pdf-documents", exist_ok=True)
app.mount("/rag/static", StaticFiles(directory="./pdf-documents"), name="static")

@app.get("/")
async def redirect_root_to_docs():
    return RedirectResponse("/docs")


@app.post("/upload", tags=["PDFs"])
async def upload_pdf(
    session_id: UUID = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),  
):
    session = db.query(ChatSession).filter_by(session_id=str(session_id), user_id=user.id).first()
    if not session:
        raise HTTPException(status_code=403, detail="Invalid session_id or access denied")

    try:
        save_dir = f"./pdf-documents/{session_id}"
        os.makedirs(save_dir, exist_ok=True)
        save_path = os.path.join(save_dir, file.filename)
        print(">>> Guardando archivo en:", save_path)

        with open(save_path, "wb") as f:
            f.write(await file.read())

        print(">>> Archivo guardado correctamente:", save_path)

        
        print(">>> Verificando contenido de carpeta:", save_dir)
        try:
            archivos = os.listdir(save_dir)
            print(">>> Archivos actuales:", archivos)
        except Exception as e:
            print(">>> Error al listar archivos:", e)

        doc = SessionDocument(
            id=uuid4(),
            session_id=session_id,
            filename=file.filename,
            path=save_path,
        )
        db.add(doc)
        db.commit()

        try:
            process_and_index_pdf(str(session_id), save_path)
        except Exception as e:
            print(">>> Error en process_and_index_pdf:", e)
            raise HTTPException(status_code=500, detail=f"PDF indexing failed: {str(e)}")

        return {"message": "File uploaded and processed", "filename": file.filename}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))