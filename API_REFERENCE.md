# API Reference - Golden Dragon Deluxe

## Base URL
`http://localhost:8000`

## Endpoints

### Health

**GET /health**
```bash
curl http://localhost:8000/health
```

Response:
```json
{"status": "ok", "service": "Golden Dragon Deluxe"}
```

### Game Info

**GET /api/game/info**
```bash
curl http://localhost:8000/api/game/info
```

Response:
```json
{
  "status": "success",
  "game": {
    "name": "Golden Dragon Deluxe",
    "reels": 5,
    "rows": 3,
    "paylines": 25,
    "rtp": 0.96,
    "volatility": "high"
  }
}
```

### Fairness

**GET /api/game/fairness**

Verify RTP through simulation.

### Wallet Init

**POST /api/wallet/init**
```bash
curl -X POST http://localhost:8000/api/wallet/init
```

Response:
```json
{"status": "success", "session_id": "uuid", "wallet_id": "uuid", "balance": 1000.0}
```

### Get Balance

**GET /api/wallet/balance/{session_id}**
```bash
curl http://localhost:8000/api/wallet/balance/{session_id}
```

### Deposit

**POST /api/wallet/deposit/{session_id}**
```bash
curl -X POST http://localhost:8000/api/wallet/deposit/{session_id} \
  -H "Content-Type: application/json" \
  -d '{"amount": 100.0}'
```

### Withdraw

**POST /api/wallet/withdraw/{session_id}**
```bash
curl -X POST http://localhost:8000/api/wallet/withdraw/{session_id} \
  -H "Content-Type: application/json" \
  -d '{"amount": 50.0}'
```

### Execute Spin

**POST /api/game/spin/{session_id}**
```bash
curl -X POST http://localhost:8000/api/game/spin/{session_id} \
  -H "Content-Type: application/json" \
  -d '{"bet": 1.0}'
```

Response:
```json
{
  "status": "success",
  "spin_id": "uuid",
  "reels": [["cherry", "bell", "diamond"], ...],
  "wins": [{"line": 0, "symbol": "cherry", "matches": 3, "payout": 30.0}],
  "total_win": 30.0,
  "new_balance": 1029.0
}
```

### Session History

**GET /api/game/session/{session_id}**
```bash
curl http://localhost:8000/api/game/session/{session_id}
```

### Reset Game

**POST /api/game/reset/{session_id}**
```bash
curl -X POST http://localhost:8000/api/game/reset/{session_id}
```
