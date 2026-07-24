"""Wallet Management - RGS API Compliant"""

from typing import Dict
from datetime import datetime
import uuid

class Wallet:
    def __init__(self, initial_balance: float = 1000.0):
        self.wallet_id = str(uuid.uuid4())
        self.balance = initial_balance
        self.transactions: list = []
        self.created_at = datetime.utcnow()
        self._add_transaction("initial", initial_balance, initial_balance)
    
    def _add_transaction(self, txn_type: str, amount: float, balance_after: float):
        self.transactions.append({
            "id": str(uuid.uuid4()),
            "type": txn_type,
            "amount": amount,
            "balance_after": balance_after,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    def deposit(self, amount: float) -> Dict:
        if amount <= 0:
            raise ValueError("Amount must be positive")
        self.balance += amount
        self._add_transaction("deposit", amount, self.balance)
        return {
            "transaction_id": self.transactions[-1]["id"],
            "amount": amount,
            "new_balance": self.balance,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def withdraw(self, amount: float) -> Dict:
        if amount <= 0:
            raise ValueError("Amount must be positive")
        if amount > self.balance:
            raise ValueError(f"Insufficient balance")
        self.balance -= amount
        self._add_transaction("withdraw", amount, self.balance)
        return {
            "transaction_id": self.transactions[-1]["id"],
            "amount": amount,
            "new_balance": self.balance,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def place_bet(self, amount: float) -> Dict:
        if amount <= 0:
            raise ValueError("Bet must be positive")
        if amount > self.balance:
            raise ValueError("Insufficient balance for bet")
        self.balance -= amount
        self._add_transaction("bet", amount, self.balance)
        return {"transaction_id": self.transactions[-1]["id"], "amount": amount, "new_balance": self.balance}
    
    def add_winnings(self, amount: float) -> Dict:
        if amount < 0:
            raise ValueError("Winnings cannot be negative")
        self.balance += amount
        self._add_transaction("win", amount, self.balance)
        return {"transaction_id": self.transactions[-1]["id"], "amount": amount, "new_balance": self.balance}
    
    def get_balance(self) -> float:
        return self.balance
    
    def get_transactions(self, limit: int = 100) -> list:
        return self.transactions[-limit:]
    
    def to_dict(self) -> Dict:
        return {
            "wallet_id": self.wallet_id,
            "balance": self.balance,
            "transaction_count": len(self.transactions),
            "created_at": self.created_at.isoformat()
        }