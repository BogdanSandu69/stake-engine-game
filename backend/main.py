"""FastAPI Application - Stake Engine Compliant Slot Game"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uuid

from config import GAME_CONFIG, SYMBOL_CONFIG, Symbol
from models import SpinRequest, GameStatus, DepositRequest, WithdrawRequest
from wallet import Wallet
from math_engine import math_engine

app = FastAPI(
    title="Golden Dragon Deluxe - Stake Engine",
    description="Production-ready slot game API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

wallets = {}
sessions = {}
spins_history = {}

def get_or_create_wallet(session_id: str) -> Wallet:
    if session_id not in wallets:
        wallets[session_id] = Wallet()
        sessions[session_id] = {"created_at": datetime.utcnow().isoformat(), "total_wagered": 0.0, "total_won": 0.0}
        spins_history[session_id] = []
    return wallets[session_id]

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Golden Dragon Deluxe", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/game/info")
async def game_info():
    return {"status": "success", "game": GAME_CONFIG, "symbols": [s.value for s in Symbol]}

@app.get("/api/game/fairness")
async def game_fairness():
    return math_engine.verify_fairness()

@app.post("/api/wallet/init")
async def wallet_init(session_id: str = None):
    if not session_id:
        session_id = str(uuid.uuid4())
    wallet = get_or_create_wallet(session_id)
    return {"status": "success", "session_id": session_id, "wallet_id": wallet.wallet_id, "balance": wallet.get_balance(), "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/wallet/balance/{session_id}")
async def get_balance(session_id: str):
    wallet = get_or_create_wallet(session_id)
    return {"status": "success", "balance": wallet.get_balance(), "currency": "USD", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/wallet/deposit/{session_id}")
async def deposit(session_id: str, req: DepositRequest):
    try:
        wallet = get_or_create_wallet(session_id)
        result = wallet.deposit(req.amount)
        return {"status": "success", "transaction_id": result["transaction_id"], "amount": result["amount"], "new_balance": result["new_balance"], "timestamp": result["timestamp"]}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/wallet/withdraw/{session_id}")
async def withdraw(session_id: str, req: WithdrawRequest):
    try:
        wallet = get_or_create_wallet(session_id)
        result = wallet.withdraw(req.amount)
        return {"status": "success", "transaction_id": result["transaction_id"], "amount": result["amount"], "new_balance": result["new_balance"]}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/game/spin/{session_id}")
async def spin(session_id: str, req: SpinRequest):
    try:
        if req.bet < GAME_CONFIG["min_bet"] or req.bet > GAME_CONFIG["max_bet"]:
            raise HTTPException(status_code=400, detail="Invalid bet")
        
        wallet = get_or_create_wallet(session_id)
        if wallet.get_balance() < req.bet:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        wallet.place_bet(req.bet)
        sessions[session_id]["total_wagered"] += req.bet
        
        board = math_engine.generate_board()
        wins, total_payout = math_engine.check_wins(board, req.bet)
        
        if total_payout > 0:
            wallet.add_winnings(total_payout)
            sessions[session_id]["total_won"] += total_payout
            game_status = GameStatus.WIN
        else:
            game_status = GameStatus.LOSS
        
        spin_id = str(uuid.uuid4())
        spins_history[session_id].append({"spin_id": spin_id, "timestamp": datetime.utcnow().isoformat(), "bet": req.bet, "win": total_payout, "reels": board, "status": game_status})
        
        session_rtp = (sessions[session_id]["total_won"] / sessions[session_id]["total_wagered"] if sessions[session_id]["total_wagered"] > 0 else 0.0)
        
        return {"status": "success", "session_id": session_id, "spin_id": spin_id, "reels": board, "wins": wins, "total_win": total_payout, "new_balance": wallet.get_balance(), "multiplier": (total_payout / req.bet) if req.bet > 0 else 1.0, "session_rtp": round(session_rtp, 4), "timestamp": datetime.utcnow().isoformat()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/game/session/{session_id}")
async def get_session_history(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    wallet = wallets[session_id]
    session_data = sessions[session_id]
    spins = spins_history[session_id]
    total_wagered = session_data["total_wagered"]
    total_won = session_data["total_won"]
    rtp = (total_won / total_wagered) if total_wagered > 0 else 0.0
    
    return {"status": "success", "session_id": session_id, "total_spins": len(spins), "total_wagered": total_wagered, "total_won": total_won, "rtp": round(rtp, 4), "history": spins}

@app.post("/api/game/reset/{session_id}")
async def reset_game(session_id: str):
    if session_id in wallets: del wallets[session_id]
    if session_id in sessions: del sessions[session_id]
    if session_id in spins_history: del spins_history[session_id]
    wallet = get_or_create_wallet(session_id)
    return {"status": "success", "message": "Session reset", "new_balance": wallet.get_balance()}

if __name__ == "__main__":
    import uvicorn
    print("\n🎰 GOLDEN DRAGON DELUXE - Stake Engine\nv1.0.0\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)