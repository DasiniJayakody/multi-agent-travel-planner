from fastapi import FastAPI
from app.api.requirements import router as requirements_router

app = FastAPI(title="Multi-Agent Travel Planner", version="0.1.0")

app.include_router(requirements_router, prefix="/requirements", tags=["requirements"])


@app.get("/")
async def root():
    return {"message": "Multi-Agent Travel Planner API"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8585)
