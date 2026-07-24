# Installation Guide

## Prerequisites
- Python 3.8+
- pip

## Setup

1. **Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Run server:**
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

3. **Access API docs:**
http://localhost:8000/docs

## Testing

```bash
# Health check
curl http://localhost:8000/health

# Initialize wallet
curl -X POST http://localhost:8000/api/wallet/init

# Execute spin
curl -X POST http://localhost:8000/api/game/spin/{session_id} \
  -H "Content-Type: application/json" \
  -d '{"bet": 1.0}'
```

## Production Deployment

### Using Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 backend.main:app
```

### Using Docker
```bash
docker build -t stake-engine-game .
docker run -p 8000:8000 stake-engine-game
```
