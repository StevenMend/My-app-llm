# import os
# from dotenv import load_dotenv
# from langchain_community.document_loaders import DirectoryLoader, UnstructuredPDFLoader
# from langchain_community.vectorstores.pgvector import PGVector
# from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain.embeddings import HuggingFaceEmbeddings
# import time
# start_time = time.time()
# load_dotenv()


# pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../pdf-documents"))


# loader = DirectoryLoader(
#     path=pdf_path,
#     glob="**/*.pdf",
#     use_multithreading=True,
#     show_progress=True,
#     max_concurrency=10,
#     loader_cls=UnstructuredPDFLoader,
# )
# docs_nested = loader.load()
# docs = [doc for sublist in docs_nested for doc in (sublist if isinstance(sublist, list) else [sublist])]

# for doc in docs:
#     filename = os.path.basename(doc.metadata.get("source", "unknown.pdf"))
#     doc.metadata["filename"] = filename
#     doc.metadata["source"] = filename  # compatibilidad con LangChain references

# embeddings = HuggingFaceEmbeddings(
#     model_name="intfloat/e5-large-v2",
#     encode_kwargs={"normalize_embeddings": True, "batch_size": 16}
# )
# text_splitter = RecursiveCharacterTextSplitter(
#     chunk_size=500,
#     chunk_overlap=50
# )
# chunks = text_splitter.split_documents(docs)


# for chunk in chunks:
#     filename = chunk.metadata.get("filename", "unknown.pdf")
#     chunk.metadata["filename"] = filename
#     chunk.metadata["source"] = filename
#     chunk.metadata["chunk_id"] = f"{filename}_{chunks.index(chunk)}"

# postgres_url = os.getenv("POSTGRES_URL")

# vector_store = PGVector(
#     collection_name="pdf_vectors_v3",
#     connection_string=postgres_url,
#     embedding_function=embeddings,
#     pre_delete_collection=True,
#     create_extension=False
# )


# print(f"🔢 Total de chunks a cargar: {len(chunks)}")
# print("🚀 Cargando documentos al vector store...")
# vector_store.add_documents(chunks)
# print("✅ Carga completada.")
# elapsed = time.time() - start_time
# print(f"⏱ Tiempo total de ejecución: {elapsed:.2f} segundos")