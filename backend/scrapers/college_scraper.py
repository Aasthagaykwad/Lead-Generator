import re
import requests
from bs4 import BeautifulSoup
from typing import List, Dict
from .base_scraper import BaseScraper


NAGPUR_COLLEGES = [
    {
        "name": "RTMNU Nagpur",
        "url": "https://nagpuruniversity.ac.in/",
        "placement_url": "https://nagpuruniversity.ac.in/placement/",
    },
    {
        "name": "RCOEM Nagpur",
        "url": "https://raisoni.net/",
        "placement_url": "https://raisoni.net/training-placement/",
    },
    {
        "name": "YCCE Nagpur",
        "url": "http://ycce.edu/",
        "placement_url": "http://ycce.edu/placements.php",
    },
    {
        "name": "VIT Nagpur",
        "url": "https://viit.ac.in/",
        "placement_url": "https://viit.ac.in/placement/",
    },
    {
        "name": "G.H. Raisoni Nagpur",
        "url": "https://raisoni.net/",
        "placement_url": "https://raisoni.net/",
    },
    {
        "name": "KDK College Nagpur",
        "url": "https://kdkce.edu.in/",
        "placement_url": "https://kdkce.edu.in/",
    },
    {
        "name": "Priyadarshini Nagpur",
        "url": "https://pcce.ac.in/",
        "placement_url": "https://pcce.ac.in/",
    },
    {
        "name": "Hislop College Nagpur",
        "url": "https://hislopcollege.ac.in/",
        "placement_url": "https://hislopcollege.ac.in/",
    },
    {
        "name": "Shivaji Science College Nagpur",
        "url": "https://shivajisc.ac.in/",
        "placement_url": "https://shivajisc.ac.in/",
    },
    {
        "name": "Laxminarayan Institute Nagpur",
        "url": "https://lnct.ac.in/",
        "placement_url": "https://lnct.ac.in/",
    },
]


class CollegeScraper(BaseScraper):
    name = "Nagpur College Sites"

    async def search(self, course: str, keywords: str, max_results: int = 20) -> List[Dict]:
        leads = []

        for college in NAGPUR_COLLEGES[:6]:
            try:
                college_leads = await self._scrape_college(college, course)
                leads.extend(college_leads)
                await self.delay(1.5, 3.0)
            except Exception as e:
                print(f"[CollegeScraper] {college['name']}: {e}")

        # Also search Google for college student contacts
        google_leads = await self._google_college_search(course)
        leads.extend(google_leads)

        return leads[:max_results]

    async def _scrape_college(self, college: Dict, course: str) -> List[Dict]:
        leads = []

        for url_key in ["placement_url", "url"]:
            try:
                resp = requests.get(college[url_key], headers=self.HEADERS, timeout=10)
                if resp.status_code != 200:
                    continue

                soup = BeautifulSoup(resp.text, "lxml")
                text = soup.get_text(" ", strip=True)

                # Extract any phone numbers from the page
                phones = re.findall(r"(?<!\d)([6-9]\d{9})(?!\d)", re.sub(r"[\s\-()]", "", text))
                emails = re.findall(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text)

                # Try to find student names from placement list tables
                names = self._extract_student_names(soup)

                if names:
                    for i, name in enumerate(names[:5]):
                        lead = {
                            "name": name,
                            "phone": phones[i] if i < len(phones) else "",
                            "email": emails[i] if i < len(emails) else "",
                            "college": college["name"],
                            "linkedin_url": "",
                            "location": "Nagpur",
                            "source": f"College – {college['name']}",
                            "notes": f"Student/alumni from {college['name']} placement page",
                            "course_interest": course,
                            "status": "new",
                        }
                        leads.append(lead)
                else:
                    # Fallback: create a lead representing this college
                    leads.append({
                        "name": f"Student – {college['name']}",
                        "phone": phones[0] if phones else "",
                        "email": emails[0] if emails else "",
                        "college": college["name"],
                        "linkedin_url": "",
                        "location": "Nagpur",
                        "source": f"College – {college['name']}",
                        "notes": f"From {college['name']} – potential {course} candidate",
                        "course_interest": course,
                        "status": "new",
                    })

                break  # Only need one successful fetch per college

            except Exception as e:
                print(f"[CollegeScraper] {college['name']} {url_key}: {e}")

        return leads

    def _extract_student_names(self, soup: BeautifulSoup) -> List[str]:
        """Try to extract student names from tables or lists on placement pages."""
        names = []

        # Look for table cells that might contain names
        for td in soup.select("table td, .student-name, [class*='name']"):
            text = td.get_text(strip=True)
            # Basic name pattern: 2-3 capitalized words
            if re.match(r"^[A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,}){1,2}$", text):
                names.append(text)
            if len(names) >= 10:
                break

        return names

    async def _google_college_search(self, course: str) -> List[Dict]:
        """Search Google specifically for Nagpur college student contact info."""
        leads = []
        queries = [
            f'"Nagpur" "student" contact email site:edu.in',
            f'RTMNU OR YCCE OR RCOEM Nagpur student 2024 2025 placement (IT OR Computer)',
        ]

        for query in queries[:1]:
            try:
                resp = requests.get(
                    "https://www.google.com/search",
                    params={"q": query, "num": 10, "gl": "in"},
                    headers=self.HEADERS,
                    timeout=12,
                )
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "lxml")
                    for block in soup.select("div.g")[:5]:
                        title_el = block.find("h3")
                        snippet_el = block.find("span", class_=re.compile("st|lyLwlc"))
                        if not title_el:
                            continue
                        full = f"{title_el.get_text()} {snippet_el.get_text() if snippet_el else ''}"
                        phones = re.findall(r"(?<!\d)([6-9]\d{9})(?!\d)", re.sub(r"[\s\-()]", "", full))
                        if phones:
                            leads.append({
                                "name": "Nagpur College Student",
                                "phone": phones[0],
                                "email": "",
                                "college": "Nagpur",
                                "linkedin_url": "",
                                "location": "Nagpur",
                                "source": "Google – College Search",
                                "notes": full[:200],
                                "course_interest": course,
                                "status": "new",
                            })
                await self.delay(2, 4)
            except Exception as e:
                print(f"[CollegeScraper Google] {e}")

        return leads
