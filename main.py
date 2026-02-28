from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from auth import router as auth_router
from research import router as research_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ResearchPilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(research_router)


@app.get("/")
def root():
    return {"message": "ResearchPilot API is running 🚀"}