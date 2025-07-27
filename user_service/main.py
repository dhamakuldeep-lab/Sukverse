from fastapi import FastAPI
from .app.database import Base, engine
from .app.routes.base import router as user_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="User Management Service")
app.include_router(user_router)

@app.get("/ping-db")
def ping_db():
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "✅ user db reachable"}
