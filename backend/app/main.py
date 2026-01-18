from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.requirements import router as requirements_router
from app.api.travel_system import router as travel_system_router

app = FastAPI(title="Multi-Agent Travel Planner", version="0.1.0")

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    requirements_router, prefix="/api/requirements", tags=["requirements"]
)
app.include_router(
    travel_system_router, prefix="/api/travel-system", tags=["travel-system"]
)


@app.get("/")
async def root():
    return {
        "message": "Multi-Agent Travel Planner API",
        "status": "running",
        "endpoints": {
            "docs": "/docs",
            "travel_system_chat": "/api/travel-system/chat",
        },
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
