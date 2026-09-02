import asyncio
import random
from abc import ABC, abstractmethod
from typing import List, Dict


class BaseScraper(ABC):
    name = "Base Scraper"

    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9,hi;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }

    async def delay(self, lo: float = 1.5, hi: float = 3.5):
        await asyncio.sleep(random.uniform(lo, hi))

    @abstractmethod
    async def search(self, course: str, keywords: str, max_results: int) -> List[Dict]:
        pass
