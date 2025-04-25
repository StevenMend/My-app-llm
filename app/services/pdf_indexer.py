
import os
from langchain_community.document_loaders import UnstructuredPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores.pgvector import PGVector
from langchain.embeddings import HuggingFaceEmbeddings

def process_and_index_pdf(session_id: str, path: str):
    print(f"Processing PDF for session {session_id}: {path}")
    
    loader = UnstructuredPDFLoader(path)
    docs = loader.load()
    
    
    filename = os.path.basename(path)

    for i, doc in enumerate(docs):
         doc.metadata["filename"] = filename
         doc.metadata["session_id"] = session_id
         doc.metadata["source"] = path
         doc.metadata["page_number"] = i + 1

    print(f"Uploaded documents: {len(docs)}")


    text_splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=50)
    chunks = text_splitter.split_documents(docs)

    print(f"Chunks generated: {len(chunks)}")

    
    for i, chunk in enumerate(chunks):
        chunk.metadata["chunk_id"] = i

    
    embeddings = HuggingFaceEmbeddings(
        model_name="intfloat/e5-large-v2",
        encode_kwargs={"normalize_embeddings": True}
    )

    
    postgres_url = os.getenv("POSTGRES_URL")
    vector_store = PGVector(
        collection_name="pdf_vectors_v3",
        connection_string=postgres_url,
        embedding_function=embeddings,
        pre_delete_collection=False,
        create_extension=False
    )

    vector_store.add_documents(chunks)
    print(f"Vectorized PDF stored in session {session_id}")
import time
start_time = time.time()
elapsed = time.time() - start_time
print(f"⏱ Total execution time: {elapsed:.2f} seconds")