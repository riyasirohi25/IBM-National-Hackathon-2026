from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import evidence, conflicts, score, attestations, consent, lender, fpo, farmers, auth
import auth_model  # noqa: F401 — ensure User table is created

Base.metadata.create_all(bind=engine)


app = FastAPI(title="Krishi Pramaan Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(farmers.router)
app.include_router(evidence.router)
app.include_router(conflicts.router)
app.include_router(score.router)
app.include_router(attestations.router)
app.include_router(consent.router)
app.include_router(lender.router)
app.include_router(fpo.router)
app.include_router(auth.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
