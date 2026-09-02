import re
import requests
from bs4 import BeautifulSoup
from typing import List, Dict
from .base_scraper import BaseScraper


class GoogleScraper(BaseScraper):
    name = "Google Search"

    SEARCH_URL = "https://www.google.com/search"

    QUERIES = [
        'site:linkedin.com/in "Nagpur" "student" ("B.Tech" OR "BCA" OR "MCA" OR "Computer" OR "IT")',
        'site:linkedin.com/in "Nagpur" "fresher" ("B.Tech" OR "Software" OR "Developer")',
        'site:instagram.com "Nagpur" "student" (BCA OR MCA OR B.Tech OR Engineering)',
        '"Nagpur" college student interested contact (BCA OR MCA OR B.Tech)',
        'RTMNU student Nagpur "looking for" (internship OR placement OR training)',
        '"Nagpur" engineering student internship 2024 OR 2025',
        'site:linkedin.com/in "Nagpur" "pursuing" (engineering OR computer science OR IT)',
        '"Nagpur" "student" phone email course training placement',
        'YCCE OR RCOEM "Nagpur" student training (IT OR Computer OR Software)',
    ]

    async def search(self, course: str, keywords: str, max_results: int = 20) -> List[Dict]:
        leads = []
        queries = list(self.QUERIES)
        if keywords:
            queries.append(f'"{keywords}" Nagpur student IT placement')

        for query in queries[:5]:
            try:
                results = self._scrape_google(query, num=10)
                leads.extend(results)
                await self.delay(2.0, 5.0)
            except Exception as e:
                print(f"[GoogleScraper] Error: {e}")

        # Deduplicate by LinkedIn URL or phone
        seen = set()
        unique = []
        for lead in leads:
            key = lead.get("linkedin_url") or lead.get("phone") or lead.get("name")
            if key and key not in seen:
                seen.add(key)
                unique.append(lead)

        return unique[:max_results]

    def _scrape_google(self, query: str, num: int = 10) -> List[Dict]:
        leads = []
        params = {"q": query, "num": num, "hl": "en", "gl": "in"}

        try:
            resp = requests.get(self.SEARCH_URL, params=params, headers=self.HEADERS, timeout=12)
            if resp.status_code != 200:
                return leads

            soup = BeautifulSoup(resp.text, "lxml")

            # Each search result block
            for block in soup.select("div.g, div[data-hveid]"):
                try:
                    title_el = block.find("h3")
                    link_el = block.find("a", href=True)
                    snippet_el = block.find("div", {"data-sncf": True}) or block.find("span", class_=re.compile(r"st|aCOpRe|lyLwlc"))

                    title = title_el.get_text(strip=True) if title_el else ""
                    link = link_el["href"] if link_el else ""
                    snippet = snippet_el.get_text(strip=True) if snippet_el else ""
                    full_text = f"{title} {snippet}"

                    if not title:
                        continue

                    # Extract structured lead data
                    name = self._extract_name(title, snippet)
                    phones = self._extract_phones(full_text)
                    email = self._extract_email(full_text)
                    college = self._extract_college(full_text)
                    is_linkedin = "linkedin.com" in link
                    
                    ig_match = re.search(r"instagram\.com/([a-zA-Z0-9_.]+)", full_text)
                    instagram_url = f"https://instagram.com/{ig_match.group(1)}" if ig_match else ("" if not "instagram.com" in link else link)

                    # Only keep if has some meaningful data
                    if not (name or phones or email or is_linkedin or instagram_url):
                        continue

                    lead = {
                        "name": name or "Nagpur Student",
                        "phone": phones[0] if phones else "",
                        "email": email,
                        "college": college,
                        "linkedin_url": link if is_linkedin else "",
                        "instagram_url": instagram_url,
                        "location": "Nagpur",
                        "source": "Google Search",
                        "notes": snippet[:250],
                        "course_interest": self._extract_course_interest(full_text),
                        "status": "new",
                    }
                    leads.append(lead)

                except Exception:
                    continue

        except Exception as e:
            print(f"[GoogleScraper] Request failed: {e}")

        return leads

    # ── Extractors ────────────────────────────────────────────────────────────

    def _extract_name(self, title: str, snippet: str) -> str:
        # LinkedIn title format: "Name - Title at Company | LinkedIn"
        m = re.match(r"^([A-Z][a-z]+(?: [A-Z][a-z]+){1,3})\s*[-–|]", title)
        if m:
            return m.group(1).strip()

        # Generic capitalized name in title
        m = re.search(r"\b([A-Z][a-z]{2,} [A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,})?)\b", title)
        if m:
            return m.group(1)
        return ""

    def _extract_phones(self, text: str) -> List[str]:
        # Indian mobile numbers: start with 6-9, 10 digits
        raw = re.findall(r"(?<!\d)([6-9]\d{9})(?!\d)", re.sub(r"[\s\-()]", "", text))
        return list(set(raw))

    def _extract_email(self, text: str) -> str:
        m = re.search(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text)
        return m.group(0) if m else ""

    def _extract_college(self, text: str) -> str:
        mapping = {
            "rtmnu": "RTMNU Nagpur", "rcoem": "RCOEM Nagpur",
            "ycce": "YCCE Nagpur", "vit nagpur": "VIT Nagpur",
            "priyadarshini": "Priyadarshini College Nagpur",
            "g.h. raisoni": "G.H. Raisoni Nagpur", "raisoni": "G.H. Raisoni Nagpur",
            "kdk": "KDK College Nagpur", "hislop": "Hislop College Nagpur",
            "laxminarayan": "Laxminarayan Institute Nagpur",
            "datta meghe": "Datta Meghe Institute Nagpur",
            "kits": "KITS Ramtek Nagpur", "aise": "AISE Nagpur",
            "nagpur university": "Nagpur University",
            "shivaji science": "Shivaji Science College Nagpur",
        }
        tl = text.lower()
        for key, college in mapping.items():
            if key in tl:
                return college
        if "nagpur" in tl:
            return "Nagpur"
        return ""

    def _extract_course_interest(self, text: str) -> str:
        courses = {
            "python": "Python", "java": "Java", "data anal": "Data Analytics",
            "machine learning": "Machine Learning", "web dev": "Web Development",
            "mim": "MIM", "mba": "MBA", "software": "Software Development",
            "full stack": "Full Stack Development", "ai ": "AI/ML",
        }
        tl = text.lower()
        for key, course in courses.items():
            if key in tl:
                return course
        return "IT Courses"
