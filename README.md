# Farmer Credit Identity API

Portable, verifiable credit identities for smallholder farmers enabling transparent access to formal financial services while maintaining data sovereignty.

## Product Vision

Empower farmers with portable, verifiable credit identities that they own and control, enabling transparent access to formal financial services while maintaining data sovereignty.

## Target Audience

- **Smallholder Farmers**: Seeking formal credit access with verifiable credit history
- **FPO Administrators**: Managing member verification and credit profiles
- **Rural Lenders**: Evaluating creditworthiness of agricultural borrowers

## Core Features

- **Farmer Management**: Complete CRUD operations for farmer profiles
- **Credit Profiles**: Verifiable credit history and scoring system
- **Transaction Tracking**: Loan and repayment history management
- **Data Sovereignty**: Farmers own and control their credit data

## Technology Stack

- **Backend Framework**: FastAPI (Python)
- **Database**: SQLAlchemy ORM with SQLite (development) / PostgreSQL (production)
- **API Documentation**: Auto-generated OpenAPI/Swagger
- **Architecture**: Modular Monolith with clear separation of concerns

## Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Virtual environment (recommended)

## Installation

### 1. Clone the Repository

```bash
cd /app/user_workspace/team_006/269d7cde-b0ae-4c93-b158-212a57aea804
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 4. Configure Environment Variables

```bash
cp ../.env.example .env
# Edit .env file with your configuration
```

## Running the Application

### Development Mode

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

### Production Mode

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### Health Check
- `GET /` - Root health check
- `GET /health` - Detailed health status

### Farmers
- `POST /api/v1/farmers` - Create new farmer
- `GET /api/v1/farmers` - List all farmers (paginated)
- `GET /api/v1/farmers/{farmer_id}` - Get specific farmer
- `PUT /api/v1/farmers/{farmer_id}` - Update farmer
- `DELETE /api/v1/farmers/{farmer_id}` - Delete farmer

### Credit Profiles
- `POST /api/v1/credit-profiles` - Create credit profile
- `GET /api/v1/credit-profiles` - List all credit profiles (paginated)
- `GET /api/v1/credit-profiles/{profile_id}` - Get specific profile
- `GET /api/v1/credit-profiles/farmer/{farmer_id}` - Get profile by farmer
- `PUT /api/v1/credit-profiles/{profile_id}` - Update credit profile
- `DELETE /api/v1/credit-profiles/{profile_id}` - Delete credit profile

## Database Schema

### Farmers Table
- `id`: Primary key
- `farmer_id`: Unique farmer identifier
- `name`: Farmer's full name
- `phone_number`: Contact number (unique)
- `email`: Email address (optional, unique)
- `location`: Geographic location
- `fpo_id`: Farmer Producer Organization ID
- `is_active`: Account status
- `created_at`, `updated_at`: Timestamps

### Credit Profiles Table
- `id`: Primary key
- `farmer_id`: Foreign key to Farmers
- `credit_score`: Numerical credit score (0-1000)
- `total_loans`: Total number of loans taken
- `active_loans`: Currently active loans
- `repayment_rate`: Percentage of on-time repayments
- `total_borrowed`: Total amount borrowed
- `total_repaid`: Total amount repaid
- `default_count`: Number of defaults
- `verification_status`: pending/verified/rejected
- `verified_by`: Verifier identifier
- `verified_at`: Verification timestamp
- `created_at`, `updated_at`: Timestamps

### Transactions Table
- `id`: Primary key
- `farmer_id`: Foreign key to Farmers
- `transaction_type`: loan/repayment/default
- `amount`: Transaction amount
- `description`: Transaction details
- `lender_name`: Name of lending institution
- `transaction_date`: Date of transaction
- `created_at`: Timestamp

## Architecture Overview

### Modular Monolith Structure

```
backend/
├── main.py              # Application entry point
├── config.py            # Configuration management
├── database.py          # Database connection and session
├── models.py            # SQLAlchemy ORM models
├── schemas.py           # Pydantic validation schemas
├── routers/             # API route handlers
│   ├── __init__.py
│   ├── farmers.py       # Farmer endpoints
│   └── credit_profiles.py  # Credit profile endpoints
└── requirements.txt     # Python dependencies
```

### Key Design Principles

1. **Separation of Concerns**: Clear boundaries between routes, models, and schemas
2. **Data Validation**: Pydantic schemas for request/response validation
3. **Error Handling**: Comprehensive exception handling with meaningful messages
4. **Logging**: Structured logging for debugging and monitoring
5. **Security**: Input validation, SQL injection prevention via ORM

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | Farmer Credit Identity API |
| `APP_VERSION` | Application version | 1.0.0 |
| `DEBUG` | Debug mode | False |
| `DATABASE_URL` | Database connection string | sqlite:///./farmer_credit.db |
| `SECRET_KEY` | Secret key for security | (must be changed) |
| `ALGORITHM` | JWT algorithm | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration | 30 |
| `ALLOWED_ORIGINS` | CORS allowed origins | localhost:3000,localhost:8000 |

## Example API Usage

### Create a Farmer

```bash
curl -X POST "http://localhost:8000/api/v1/farmers" \
  -H "Content-Type: application/json" \
  -d '{
    "farmer_id": "FRM001",
    "name": "John Doe",
    "phone_number": "+1234567890",
    "email": "john@example.com",
    "location": "Village A, District B",
    "fpo_id": "FPO001"
  }'
```

### Get Farmer's Credit Profile

```bash
curl -X GET "http://localhost:8000/api/v1/credit-profiles/farmer/1"
```

### Update Credit Profile

```bash
curl -X PUT "http://localhost:8000/api/v1/credit-profiles/1" \
  -H "Content-Type: application/json" \
  -d '{
    "credit_score": 750,
    "verification_status": "verified",
    "verified_by": "admin@fpo.org"
  }'
```

## Development Guidelines

### Adding New Features

1. Define models in `models.py`
2. Create Pydantic schemas in `schemas.py`
3. Implement routes in `routers/`
4. Update this README with new endpoints

### Code Style

- Follow PEP 8 guidelines
- Use type hints
- Add docstrings to functions
- Keep functions focused and small

## Troubleshooting

### Database Issues

If you encounter database errors:
```bash
# Delete the database file and restart
rm backend/farmer_credit.db
# Restart the application to recreate tables
```

### Port Already in Use

```bash
# Find and kill the process using port 8000
lsof -ti:8000 | xargs kill -9
```

## Future Enhancements

- Authentication and authorization (JWT)
- Role-based access control
- Transaction history endpoints
- Credit score calculation algorithms
- Data export capabilities
- Mobile app integration
- Blockchain integration for immutable records

## License

Proprietary - All rights reserved

## Support

For issues and questions, please contact the development team.
