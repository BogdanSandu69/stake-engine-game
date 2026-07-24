"""Pydantic models for request/response validation"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum

class GameStatus(str, Enum):
    IDLE = "idle"
    SPINNING = "spinning"
    WIN = "win"
    LOSS = "loss"

class SpinRequest(BaseModel):
    bet: float = Field(gt=0, le=100, description="Bet amount")

class SpinResult(BaseModel):
    status: str = "success"
    session_id: str
    spin_id: str
    reels: List[List[str]]
    wins: List[Dict]
    total_win: float
    new_balance: float
    multiplier: float = 1.0
    timestamp: datetime

class DepositRequest(BaseModel):
    amount: float = Field(gt=0, description="Amount to deposit")

class WithdrawRequest(BaseModel):
    amount: float = Field(gt=0, description="Amount to withdraw")