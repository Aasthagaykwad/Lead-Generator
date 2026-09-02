import re
from typing import List, Dict


class LeadFilter:
    """Scores leads based on relevance to Nagpur IT course pitching."""

    NAGPUR_KEYWORDS = [
        "nagpur", "wardha", "amravati", "gondia", "bhandara", "chandrapur",
        "yavatmal", "akola", "vidarbha", "nagpur university", "rtmnu",
        "maharashtra", "vidarbha region"
    ]

    COLLEGE_KEYWORDS = [
        "rtmnu", "rcoem", "ycce", "vit nagpur", "priyadarshini", "kdk",
        "g.h. raisoni", "raisoni", "hislop", "laxminarayan", "shivaji science",
        "datta meghe", "kits ramtek", "nagpur university", "college",
        "university", "institute", "btech", "b.tech", "b.e", "be ",
        "mca", "bca", "bsc", "b.sc", "mba", "engineering",
        "student", "pursuing", "fresher", "graduate", "undergrad",
        "1st year", "2nd year", "3rd year", "final year", "sem"
    ]

    INTEREST_KEYWORDS = [
        "python", "java", "data analysis", "data analytics", "analytics",
        "programming", "coding", "software", "it ", "information technology",
        "computer science", "tech", "learning", "course", "training",
        "skill development", "web development", "machine learning", "ai",
        "artificial intelligence", "placement", "job", "career", "internship",
        "fresher", "looking for job", "open to work", "upskill", "certification"
    ]

    def filter_and_score(self, leads: List[Dict]) -> List[Dict]:
        scored = []
        for lead in leads:
            lead["score"] = self.calculate_score(lead)
            if lead["score"] >= 15:
                scored.append(lead)
        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored

    def calculate_score(self, lead: Dict) -> int:
        score = 0
        text = " ".join([
            str(lead.get("name", "")),
            str(lead.get("college", "")),
            str(lead.get("notes", "")),
            str(lead.get("course_interest", "")),
            str(lead.get("location", "")),
        ]).lower()

        # Location match (Nagpur/nearby) — highest weight
        for kw in self.NAGPUR_KEYWORDS:
            if kw in text:
                score += 20
                break

        # Has usable contact info
        if lead.get("phone") and self.is_valid_phone(lead["phone"]):
            score += 15
        if lead.get("email"):
            score += 8
        if lead.get("linkedin_url"):
            score += 8
        if lead.get("instagram_url"):
            score += 8

        # Is a student / college related
        for kw in self.COLLEGE_KEYWORDS:
            if kw in text:
                score += 12
                break

        # Shows interest in IT / courses
        count = sum(1 for kw in self.INTEREST_KEYWORDS if kw in text)
        score += min(count * 4, 20)

        # Has a real name
        name = lead.get("name", "")
        if name and name not in ("Unknown", "Student", "") and len(name) > 3:
            score += 5

        return score

    def is_valid_phone(self, phone: str) -> bool:
        digits = re.sub(r"\D", "", phone)
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        return len(digits) == 10 and digits[0] in "6789"

    def clean_phone(self, phone: str) -> str:
        digits = re.sub(r"\D", "", phone)
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        return digits if len(digits) == 10 else phone
