"""Math Engine - Stake Engine Compliant Game Logic"""

import random
from typing import List, Tuple, Dict
from datetime import datetime
from config import Symbol, SymbolConfig, SYMBOL_CONFIG, PAYLINES, WIN_THRESHOLDS, GAME_CONFIG

class MathEngine:
    def __init__(self, seed: int = None):
        if seed:
            random.seed(seed)
        self.symbols = [s.value for s in Symbol]
        self.symbol_config = SYMBOL_CONFIG
    
    def generate_board(self) -> List[List[str]]:
        reels = GAME_CONFIG["reels"]
        rows = GAME_CONFIG["rows"]
        board = []
        for reel in range(reels):
            reel_symbols = []
            for row in range(rows):
                symbol = self._weighted_random_symbol()
                reel_symbols.append(symbol)
            board.append(reel_symbols)
        return board
    
    def _weighted_random_symbol(self) -> str:
        symbols = list(self.symbol_config.keys())
        weights = [self.symbol_config[s].frequency for s in symbols]
        return random.choices(symbols, weights=weights, k=1)[0].value
    
    def check_wins(self, board: List[List[str]], bet: float) -> Tuple[List[Dict], float]:
        wins = []
        total_payout = 0.0
        
        for line_idx, payline in enumerate(PAYLINES):
            line_symbols = [board[reel][payline[reel]] for reel in range(len(payline))]
            win = self._check_line_win(line_symbols, bet, line_idx)
            if win:
                wins.append(win)
                total_payout += win["payout"]
        
        return wins, total_payout
    
    def _check_line_win(self, line: List[str], bet: float, line_idx: int):
        if not line or line[0] == Symbol.SCATTER.value:
            return None
        
        matching_count = 1
        for i in range(1, len(line)):
            if line[i] == line[0]:
                matching_count += 1
            else:
                break
        
        if matching_count >= 2:
            symbol = line[0]
            symbol_config = self.symbol_config.get(Symbol(symbol))
            
            if symbol_config:
                multiplier = WIN_THRESHOLDS.get(matching_count, 2.0)
                payout = symbol_config.payout * multiplier * bet
                
                return {
                    "line": line_idx,
                    "symbol": symbol,
                    "matches": matching_count,
                    "multiplier": multiplier,
                    "payout": payout
                }
        return None
    
    def calculate_rtp(self, spins: int = 100000) -> float:
        total_wagered = 0.0
        total_won = 0.0
        bet = GAME_CONFIG["default_bet"]
        
        for _ in range(spins):
            board = self.generate_board()
            wins, payout = self.check_wins(board, bet)
            total_wagered += bet
            total_won += payout
        
        return total_won / total_wagered if total_wagered > 0 else 0.0
    
    def verify_fairness(self) -> Dict:
        return {
            "version": GAME_CONFIG["version"],
            "rtp_target": GAME_CONFIG["rtp"],
            "rtp_simulated": round(self.calculate_rtp(10000), 4),
            "symbols_count": len(SYMBOL_CONFIG),
            "paylines": GAME_CONFIG["paylines"],
            "reels": GAME_CONFIG["reels"],
            "rows": GAME_CONFIG["rows"],
            "volatility": GAME_CONFIG["volatility"],
            "min_bet": GAME_CONFIG["min_bet"],
            "max_bet": GAME_CONFIG["max_bet"],
            "timestamp": datetime.utcnow().isoformat()
        }

math_engine = MathEngine()