# Football Management System - Backend API

FastAPI-based REST API for managing football clubs, players, agents, contracts, and transfers. Integrates directly with Supabase PostgreSQL database.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip/poetry

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Add your Supabase API key:
     ```
     SUPABASE_URL=https://shwmohsrckknfwuhzdxb.supabase.co
     SUPABASE_API_KEY=your_api_key_here
     BACKEND_PORT=8000
     FRONTEND_URL=http://localhost:5173
     ```

3. **Run the server:**
   ```bash
   python main.py
   ```
   or
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```

4. **Access API documentation:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## 📋 Project Structure

```
backend/
├── main.py                 # FastAPI app initialization & CORS setup
├── config.py               # Environment variables & Supabase config
├── requirements.txt        # Python dependencies
├── .env.example            # Environment template
├── models/                 # Pydantic models for request/response validation
│   ├── person.py
│   ├── player.py
│   ├── agent.py
│   ├── club.py
│   ├── manager.py
│   ├── sponsor.py
│   ├── competition.py
│   ├── contract.py
│   └── transfer.py
├── routes/                 # API endpoint handlers
│   ├── persons.py
│   ├── players.py
│   ├── agents.py
│   ├── clubs.py
│   ├── managers.py
│   ├── sponsors.py
│   ├── competitions.py
│   ├── contracts.py
│   ├── transfers.py
│   └── relationships.py
├── services/               # Business logic layer
│   └── supabase_service.py # Supabase REST API wrapper
└── utils/                  # Helper utilities
    ├── validators.py       # Data validation functions
    └── errors.py           # Error handling
```

## 📚 API Endpoints

### Persons
- `GET /api/persons` - List all persons
- `GET /api/persons/{person_id}` - Get person by ID
- `POST /api/persons` - Create new person
- `PATCH /api/persons/{person_id}` - Update person
- `DELETE /api/persons/{person_id}` - Delete person

### Players
- `GET /api/players` - List all players
- `GET /api/players?club_id=1` - Filter by club
- `GET /api/players/{player_id}` - Get player by ID
- `POST /api/players` - Create new player (creates Person + Player)
- `PATCH /api/players/{player_id}` - Update player attributes
- `DELETE /api/players/{player_id}` - Delete player

### Agents
- `GET /api/agents` - List all agents
- `GET /api/agents/{agent_id}` - Get agent by ID
- `POST /api/agents` - Create new agent
- `PATCH /api/agents/{agent_id}` - Update agent
- `DELETE /api/agents/{agent_id}` - Delete agent
- `GET /api/agents/{agent_id}/clients` - Get people represented by agent

### Clubs
- `GET /api/clubs` - List all clubs
- `GET /api/clubs/{club_id}` - Get club by ID
- `POST /api/clubs` - Create new club
- `PATCH /api/clubs/{club_id}` - Update club
- `DELETE /api/clubs/{club_id}` - Delete club
- `GET /api/clubs/{club_id}/squad` - Get players in club

### Managers
- `GET /api/managers` - List all managers
- `GET /api/managers/{manager_id}` - Get manager by ID
- `POST /api/managers` - Create new manager
- `PATCH /api/managers/{manager_id}` - Update manager
- `DELETE /api/managers/{manager_id}` - Delete manager

### Contracts
- `GET /api/contracts` - List all contracts
- `GET /api/contracts?status=Active` - Filter by status
- `GET /api/contracts/{contract_id}` - Get contract by ID
- `POST /api/contracts/employment` - Create employment contract
- `POST /api/contracts/sponsorship` - Create sponsorship contract
- `PATCH /api/contracts/{contract_id}` - Update contract status
- `DELETE /api/contracts/{contract_id}` - Delete contract
- `GET /api/contracts/person/{person_id}` - Get contracts for person

### Transfers
- `GET /api/transfers` - List all transfers
- `GET /api/transfers/{transfer_id}` - Get transfer by ID
- `POST /api/transfers` - Execute transfer
- `DELETE /api/transfers/{transfer_id}` - Delete transfer
- `GET /api/transfers/player/{player_id}/history` - Get player transfer history

### Relationships
- `POST /api/agent-represents` - Assign agent to person
- `DELETE /api/agent-represents/{agent_id}/{person_id}` - Remove agent assignment
- `POST /api/club-competition` - Add club to competition
- `POST /api/sponsor-club` - Create sponsor partnership

## 🔐 Authentication & Authorization

Currently, the API has **no authentication**. All endpoints are publicly accessible. For production, consider adding:
- JWT token-based auth
- Supabase Auth integration
- API key validation

## 📝 Example Requests

### Create a Player
```bash
curl -X POST http://localhost:8000/api/players \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1995-06-15",
    "nationality": "English",
    "email": "john@example.com",
    "phoneNumber": "+441234567890",
    "primaryPosition": "FWD",
    "preferredFoot": "Right",
    "marketValue": "50000000",
    "jerseyNumber": 9,
    "height": "1.85",
    "weight": "82"
  }'
```

### Create a Club
```bash
curl -X POST http://localhost:8000/api/clubs \
  -H "Content-Type: application/json" \
  -d '{
    "clubName": "New City FC",
    "stadiumName": "New Stadium",
    "stadiumCapacity": 60000,
    "city": "London",
    "country": "England",
    "transferBudget": "100000000",
    "yearFounded": 2020
  }'
```

### Sign Employment Contract
```bash
curl -X POST http://localhost:8000/api/contracts/employment \
  -H "Content-Type: application/json" \
  -d '{
    "personId": 1,
    "clubId": 1,
    "startDate": "2024-01-01",
    "endDate": "2027-12-31",
    "signingDate": "2023-12-20",
    "contractStatus": "Active",
    "weeklySalary": 50000,
    "releaseClause": 100000000
  }'
```

## 🗄️ Database Schema

The API directly uses the Supabase PostgreSQL schema defined in `migration.sql`:

### Core Tables
- **Person** - Base information for players, managers, agents
- **Player** - Extends Person with position, foot, market value
- **Agent** - Agent information and commission rates
- **Club** - Club information, budget, facilities
- **Manager** - Extends Person with coaching license and club assignment
- **Sponsor** - Sponsorship companies
- **Competition** - Leagues, cups, tournaments

### Contract Tables
- **Contract** - Base contract table
- **EmploymentContract** - Player-club contracts with salary terms
- **SponsorshipContract** - Sponsor deals with payment terms

### Transfer & Relations
- **Transfer** - Player transfers between clubs
- **AgentPersonRepresents** - Agent-person relationships
- **CompetitionClubParticipation** - Club-competition memberships
- **SponsorClubPartnership** - Sponsor-club partnerships

## 🛠️ Development

### Run Tests
```bash
pytest
```

### Lint Code
```bash
flake8 .
black .
```

### Format Code
```bash
black . --line-length 100
```

## 📦 Dependencies

- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **pydantic** - Data validation
- **httpx** - Async HTTP client for Supabase REST API
- **python-dotenv** - Environment variable management
- **email-validator** - Email validation

## 🚨 Error Handling

The API returns standard HTTP status codes:
- **200** - Success
- **201** - Created
- **204** - No Content
- **400** - Bad Request (validation error)
- **404** - Not Found
- **409** - Conflict (duplicate entry)
- **500** - Server Error

Error responses include a `detail` field:
```json
{
  "detail": "Record not found"
}
```

## 🔄 Data Validation

All endpoints validate input using Pydantic models:
- Email format validation
- Date range validation (endDate > startDate)
- Numeric constraints (salary > 0, jersey number 1-99, etc.)
- Enum validation (positions, contract statuses, transfer types)

## 🌐 CORS Configuration

CORS is enabled for:
- Frontend: `http://localhost:5173`
- Frontend dev: `http://localhost:5174`
- Custom origins via `FRONTEND_URL` environment variable

## 📖 Additional Notes

1. **Supabase Integration**: Directly uses Supabase REST API via `httpx` client. No SDK dependency.
2. **Async Operations**: All database calls are async for better performance.
3. **ID Generation**: Database uses GENERATED ALWAYS AS IDENTITY for primary keys.
4. **Cascading Deletes**: Person deletion cascades to Player, Manager, and related records.
5. **NULL Fields**: Optional fields (e.g., `sellingClubId` for free transfers) default to NULL.

## 🐛 Troubleshooting

### "email-validator is not installed"
```bash
pip install email-validator
```

### "SUPABASE_API_KEY is empty"
Add your API key to `.env` file

### "Port 8000 already in use"
Change port in `.env` or kill existing process:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Unix
lsof -i :8000
kill -9 <PID>
```

### "CORS error from frontend"
Ensure `FRONTEND_URL` in `.env` matches frontend origin

## 📞 Support

For issues with:
- **API Logic**: Check route handlers in `routes/` folder
- **Database**: Check `services/supabase_service.py` and Supabase schema
- **Validation**: Check models in `models/` folder
- **Configuration**: Check `config.py` and `.env` file
