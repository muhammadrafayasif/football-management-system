from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import FRONTEND_URL
from routes import persons, players, agents, clubs, managers, sponsors, competitions, contracts, transfers, relationships

app = FastAPI(
    title="Football Management System API",
    description="REST API for managing football transfers, contracts, and teams",
    version="1.0.0"
)

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(persons.router)
app.include_router(players.router)
app.include_router(agents.router)
app.include_router(clubs.router)
app.include_router(managers.router)
app.include_router(sponsors.router)
app.include_router(competitions.router)
app.include_router(contracts.router)
app.include_router(transfers.router)
app.include_router(relationships.router)

@app.get("/")
async def root():
    return {
        "message": "Football Management System API",
        "version": "1.0.0",
        "docs": "/docs",
        "openapi": "/openapi.json"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    from config import BACKEND_PORT
    uvicorn.run(app, host="0.0.0.0", port=BACKEND_PORT)
