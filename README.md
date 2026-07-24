# 🎰 Golden Dragon Deluxe - Stake Engine Slot Game

**Production Ready | Fully Compliant | Ready to Upload**

A complete, production-ready slot game built to Stake Engine specifications.

## Quick Start

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API Docs: **http://localhost:8000/docs**

## Features

✅ **RGS Wallet API** - Full wallet state management  
✅ **Math Engine** - Fair game logic with 96% RTP  
✅ **5×3 Reels** - 25 Paylines, 10 Symbols  
✅ **Game State Tracking** - Complete session history  
✅ **Compliance Ready** - All guidelines met  

## Game Specs

- **Reels**: 5 × **Rows**: 3 × **Paylines**: 25
- **RTP**: 96% | **Volatility**: High
- **Min Bet**: $0.10 | **Max Bet**: $100.00
- **Win Detection**: 2+ consecutive matching symbols
- **Symbols**: 10 types (Cherry, Lemon, Orange, Grapes, Melon, Bell, Seven, Diamond, Wild, Scatter)

## API Endpoints

### Wallet
- `POST /api/wallet/init` - Initialize wallet
- `GET /api/wallet/balance/{session_id}` - Get balance
- `POST /api/wallet/deposit/{session_id}` - Deposit funds
- `POST /api/wallet/withdraw/{session_id}` - Withdraw funds

### Game
- `GET /api/game/info` - Game information
- `GET /api/game/fairness` - Fairness verification
- `POST /api/game/spin/{session_id}` - Execute spin
- `GET /api/game/session/{session_id}` - Session history
- `POST /api/game/reset/{session_id}` - Reset game

## Testing

```bash
# Initialize wallet
curl -X POST http://localhost:8000/api/wallet/init

# Execute spin (replace {session_id})
curl -X POST http://localhost:8000/api/game/spin/{session_id} \
  -H "Content-Type: application/json" \
  -d '{"bet": 1.0}'
```

## Documentation

- `API_REFERENCE.md` - Full API documentation
- `COMPLIANCE_CHECKLIST.md` - Compliance verification
- `INSTALL.md` - Detailed installation
- `SUBMISSION_READY.md` - Upload package

## Compliance

✅ RGS Wallet API  
✅ Math Engine (96% RTP)  
✅ Game State Tracking  
✅ Session Replay  
✅ Fairness Verification  
✅ Complete Documentation  

## Deployment

### Docker
```bash
docker build -t stake-engine-game .
docker run -p 8000:8000 stake-engine-game
```

### Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 backend.main:app
```

## Status

✅ **PRODUCTION READY** - Ready for immediate upload to Stake Engine

---

**Built for Stake Engine** | v1.0.0 | 2024