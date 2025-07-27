from fastapi import FastAPI
from .app.database import Base, engine
from .app.routes.base import router as analytics_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Analytics Service")
app.include_router(analytics_router)

@app.get("/ping-db")
def ping_db():
    from sqlalchemy import text
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "✅ analytics db reachable"}
