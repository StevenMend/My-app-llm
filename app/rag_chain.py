import os
from operator import itemgetter
from typing import TypedDict

from dotenv import load_dotenv
from langchain_community.vectorstores.pgvector import PGVector
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import OpenAIEmbeddings
from langchain_core.runnables import RunnableParallel, RunnableLambda, RunnablePassthrough
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import SQLChatMessageHistory
from langchain.prompts import PromptTemplate
from langchain_core.messages import get_buffer_string
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain_core.runnables.config import RunnableConfig
from langchain_core.runnables import RunnableMap
import time

start = time.time()

load_dotenv()

embeddings = HuggingFaceEmbeddings(
    model_name="intfloat/e5-large-v2",
    encode_kwargs={
        "normalize_embeddings": True,
        "batch_size": 16
    }
)

postgres_url = os.getenv("POSTGRES_URL")
vector_store = PGVector(
    collection_name="pdf_vectors_v3",
    connection_string=postgres_url,
    embedding_function=embeddings,
    pre_delete_collection=False,
    create_extension=False
)

llm = ChatOpenAI(
    model="gpt-3.5-turbo",
    temperature=0,
    streaming=True,
    max_retries=2,
    timeout=60,
)

template = """
You are an expert assistant in PDF document comprehension and general knowledge.

When answering, prioritize the provided context and document content.
If sufficient information cannot be found in the context, the document, or your own knowledge, respond clearly that you cannot answer.

- Do not invent facts.
- Be clear, concise, and helpful.

--------------------
{context}

Question: {question}
"""

ANSWER_PROMPT = ChatPromptTemplate.from_template(template)

class RagInput(TypedDict):
    question: str
    chat_history: list

class RagConfig(TypedDict):
    session_id: str

def get_multiquery_retriever(session_id: str):
    return MultiQueryRetriever.from_llm(
        retriever=vector_store.as_retriever(search_kwargs={
            "k": 2,
            "score_threshold": 0.85,
            "return_source_documents": True,
            "filter": {"session_id": session_id}
        }),
        llm=llm,
    )

def format_with_references(output: dict):

    answer = output.get("answer")
    if hasattr(answer, "content"):
        answer_text = answer.content
    elif isinstance(answer, str):
        answer_text = answer
    elif hasattr(answer, "text"):
        answer_text = answer.text
    else:
        answer_text = str(answer)

    ref_groups = {}
    docs = output.get("docs", [])

    for doc in docs:
        filename = doc.metadata.get("filename", "unknown.pdf")
        if filename not in ref_groups:
            ref_groups[filename] = []
        ref_groups[filename].append(doc.metadata)

    if not ref_groups:
        return {
            "answer": answer_text,
            "references": []
        }

    dominant_filename = max(ref_groups, key=lambda k: len(ref_groups[k]))
    dominant_refs = ref_groups[dominant_filename]

    print(f"References of the dominant document: {dominant_filename}")
    for i, ref in enumerate(dominant_refs):
        print(f"[{i+1}] {ref.get('source')} | Página: {ref.get('page_number')} | chunk_id: {ref.get('chunk_id')}")

    return {
    "answer": answer_text,
    "references": []
}


old_chain = (
    RunnableMap({
        "question": itemgetter("question"),
        "context": RunnableLambda(
            lambda x, config: get_multiquery_retriever(
                config["configurable"]["session_id"]
            ).invoke(x["question"])
        ),
    }) |
    RunnableLambda(lambda x: {
        "question": x["question"],
        "context": x["context"],
        "docs": x["context"]
    }) |
    RunnableMap({
        "answer": ANSWER_PROMPT | llm,
        "docs": itemgetter("docs")
    }) |
    RunnableLambda(format_with_references)
).with_types(input_type=RagInput)

get_session_history = lambda session_id: SQLChatMessageHistory(
    connection_string=postgres_url,
    session_id=session_id
)

template_with_history = """
Given the following conversation history and a follow-up question,
rewrite the question so that it can stand alone, without requiring prior context,
while preserving its original language
History of the conversation:
{chat_history}
Follow-up question: {question}
Independent question:
"""

standalone_question_prompt = PromptTemplate.from_template(template_with_history)

standalone_question_mini_chain = (
    RunnableParallel(
        question=RunnablePassthrough(),
        chat_history=lambda x: get_buffer_string(x["chat_history"])
    )
    | standalone_question_prompt
    | llm
    | (lambda msg: {"question": msg.content})
)

final_chain = (
    RunnableWithMessageHistory(
        runnable=standalone_question_mini_chain | old_chain,
        input_messages_key="question",
        history_messages_key="chat_history",
        output_messages_key="answer",
        get_session_history=get_session_history,
        configurable_fields=["session_id"]
    )
    .with_types(input_type=RagInput)
)

print(f"⏱ Total LangChain Time: {time.time() - start:.2f}s")