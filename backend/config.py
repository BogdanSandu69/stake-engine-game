"""Game Configuration - Stake Engine Compliant"""

from enum import Enum
from typing import Dict, List
from dataclasses import dataclass

class GameMode(str, Enum):
    NORMAL = "normal"
    FREE_SPINS = "free_spins"
    BONUS = "bonus"

class Symbol(str, Enum):
    CHERRY = "cherry"
    LEMON = "lemon"
    ORANGE = "orange"
    GRAPES = "grapes"
    MELON = "melon"
    BELL = "bell"
    SEVEN = "seven"
    DIAMOND = "diamond"
    WILD = "wild"
    SCATTER = "scatter"

@dataclass
class SymbolConfig:
    name: Symbol
    payout: int
    frequency: float
    is_wild: bool = False
    triggers_free_spins: bool = False
    free_spins_count: int = 0

GAME_CONFIG = {
    "name": "Golden Dragon Deluxe",
    "version": "1.0.0",
    "reels": 5,
    "rows": 3,
    "paylines": 25,
    "rtp": 0.96,
    "volatility": "high",
    "min_bet": 0.10,
    "max_bet": 100.00,
    "default_bet": 1.00,
}

SYMBOL_CONFIG: Dict[Symbol, SymbolConfig] = {
    Symbol.CHERRY: SymbolConfig(Symbol.CHERRY, payout=10, frequency=0.12),
    Symbol.LEMON: SymbolConfig(Symbol.LEMON, payout=15, frequency=0.12),
    Symbol.ORANGE: SymbolConfig(Symbol.ORANGE, payout=20, frequency=0.11),
    Symbol.GRAPES: SymbolConfig(Symbol.GRAPES, payout=25, frequency=0.10),
    Symbol.MELON: SymbolConfig(Symbol.MELON, payout=50, frequency=0.10),
    Symbol.BELL: SymbolConfig(Symbol.BELL, payout=75, frequency=0.10),
    Symbol.SEVEN: SymbolConfig(Symbol.SEVEN, payout=150, frequency=0.10),
    Symbol.DIAMOND: SymbolConfig(Symbol.DIAMOND, payout=250, frequency=0.08),
    Symbol.WILD: SymbolConfig(Symbol.WILD, payout=500, frequency=0.06, is_wild=True),
    Symbol.SCATTER: SymbolConfig(Symbol.SCATTER, payout=100, frequency=0.11, triggers_free_spins=True, free_spins_count=10),
}

PAYLINES = [
    [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [2, 2, 2, 2, 2],
    [0, 1, 1, 1, 0], [2, 1, 1, 1, 2], [0, 0, 1, 0, 0],
    [2, 2, 1, 2, 2], [0, 1, 0, 1, 0], [2, 1, 2, 1, 2],
    [1, 0, 0, 0, 1], [1, 2, 2, 2, 1], [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2], [0, 0, 0, 1, 1], [2, 2, 2, 1, 1],
    [1, 1, 0, 0, 0], [1, 1, 2, 2, 2], [0, 1, 1, 0, 1],
    [2, 1, 1, 2, 1], [1, 0, 1, 2, 1], [1, 2, 1, 0, 1],
    [0, 0, 2, 2, 2], [2, 2, 0, 0, 0], [0, 2, 1, 0, 2],
    [2, 0, 1, 2, 0],
]

WIN_THRESHOLDS = {2: 0.5, 3: 1.0, 4: 1.5, 5: 2.0}

total_frequency = sum(config.frequency for config in SYMBOL_CONFIG.values())
assert 0.99 <= total_frequency <= 1.01, f"Frequencies must sum to 1.0"