from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from config import FRONTEND_URL, API_PASSWORD
from routes import persons, players, agents, clubs, managers, sponsors, competitions, contracts, transfers, relationships

app = FastAPI(
    title="Football Management System API",
    description="REST API for managing football transfers, contracts, and teams",
    version="1.0.0"
)


@app.middleware("http")
async def require_api_password(request: Request, call_next):
    # Allow health and root and docs endpoints without password for convenience
    allowed_paths = {"/", "/health", "/docs", "/openapi.json", "/redoc", "/favicon.ico"}
    if request.url.path in allowed_paths:
        return await call_next(request)

    # Allow CORS preflight through
    if request.method == "OPTIONS":
        return await call_next(request)

    # If no API_PASSWORD configured, skip check (developer convenience)
    if not API_PASSWORD:
        return await call_next(request)

    header_pw = request.headers.get("x-api-password") or request.headers.get("X-API-PASSWORD")
    if header_pw != API_PASSWORD:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"detail": "Invalid API password"})

    return await call_next(request)

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
