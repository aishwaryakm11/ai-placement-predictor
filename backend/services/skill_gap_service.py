"""
Skill gap and roadmap generation service.

Responsible for:
  - compute_skill_gap()  — which required skills is the student missing?
  - generate_roadmap()   — phased upskilling plan grouped by skill tier.
  - compute_role_scores()— benchmark-match score for every target role.
"""

import sys
from pathlib import Path

_backend_dir = Path(__file__).resolve().parent.parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

import json
from functools import lru_cache

from config import ROLE_BENCHMARKS_JSON, PHASE_TIMELINE_WEEKS
from utils.constants import TIER_PHASE_LABEL


# ─── Benchmark loader ─────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _load_benchmarks() -> dict:
    if not ROLE_BENCHMARKS_JSON.exists():
        raise FileNotFoundError(
            f"Role benchmarks not found at {ROLE_BENCHMARKS_JSON}."
        )
    with open(ROLE_BENCHMARKS_JSON, "r") as f:
        return json.load(f)


def get_benchmarks() -> dict:
    return _load_benchmarks()


# ─── Skill gap ────────────────────────────────────────────────────────────────

def compute_skill_gap(student_skills: list[str], target_role: str) -> list[str]:
    """
    Return sorted list of required skills the student is missing.

    Args:
        student_skills: Combined list of known_languages + certifications.
        target_role:    One of the four valid roles.

    Returns:
        Sorted list of missing skill names.
    """
    benchmarks = get_benchmarks()
    if target_role not in benchmarks:
        raise ValueError(f"Unknown target role: {target_role!r}")

    required = set(benchmarks[target_role]["required_skills"])
    have = set(student_skills)
    missing = required - have
    return sorted(missing)


# ─── Roadmap ──────────────────────────────────────────────────────────────────

def generate_roadmap(missing_skills: list[str], target_role: str) -> list[dict]:
    """
    Group missing skills by skill tier and produce a phased roadmap.

    Args:
        missing_skills: Output of compute_skill_gap().
        target_role:    One of the four valid roles.

    Returns:
        List of phase dicts ordered foundational -> intermediate -> advanced.
    """
    if not missing_skills:
        return []

    benchmarks = get_benchmarks()
    skill_tiers: dict = benchmarks[target_role].get("skill_tiers", {})

    # Group skills by tier
    tier_to_skills: dict[str, list[str]] = {
        "foundational": [],
        "intermediate": [],
        "advanced": [],
    }
    for skill in missing_skills:
        tier = skill_tiers.get(skill, "intermediate")   # default to intermediate
        tier_to_skills[tier].append(skill)

    roadmap = []
    for tier in ("foundational", "intermediate", "advanced"):
        skills = tier_to_skills[tier]
        if not skills:
            continue
        phase_label = TIER_PHASE_LABEL[tier]
        weeks = PHASE_TIMELINE_WEEKS[tier]
        roadmap.append(
            {
                "phase": phase_label,
                "skills": sorted(skills),
                "estimated_weeks": weeks,
                "recommended_action": (
                    f"Complete a guided project or certification covering: "
                    + ", ".join(sorted(skills))
                ),
            }
        )
    return roadmap


# ─── Role scoring ─────────────────────────────────────────────────────────────

def compute_role_scores(
    known_languages: list[str],
    certifications: list[str],
    cgpa: float,
    projects_count: int,
    aptitude_score: float,
) -> dict[str, float]:
    """
    Calculate a benchmark-match score (0–100) for every target role.

    Scoring components:
      - skills_score    (40 pts): fraction of required skills possessed
      - cgpa_score      (20 pts): CGPA >= min_cgpa earns full points; partial otherwise
      - projects_score  (20 pts): projects_count >= min_projects earns full points
      - aptitude_score  (20 pts): aptitude_score >= min_aptitude earns full points

    Args:
        known_languages:  List of language strings.
        certifications:   List of certification strings.
        cgpa:             Student CGPA.
        projects_count:   Number of completed projects.
        aptitude_score:   Aptitude test score (0-100).

    Returns:
        Dict mapping role_name -> percentage score (rounded to 1 decimal).
    """
    benchmarks = get_benchmarks()
    student_skills = set(known_languages + certifications)

    scores: dict[str, float] = {}
    for role, bench in benchmarks.items():
        required = bench["required_skills"]
        min_cgpa = bench["min_cgpa"]
        min_projects = bench["min_projects"]
        min_apt = bench["min_aptitude_score"]

        # Skills match (40%)
        if required:
            skills_score = (len(student_skills & set(required)) / len(required)) * 40
        else:
            skills_score = 40.0

        # CGPA (20%) — partial credit
        cgpa_score = min(cgpa / min_cgpa, 1.0) * 20 if min_cgpa > 0 else 20.0

        # Projects (20%) — partial credit (cap at 1.0)
        if min_projects > 0:
            proj_score = min(projects_count / min_projects, 1.0) * 20
        else:
            proj_score = 20.0

        # Aptitude (20%) — partial credit
        if min_apt > 0:
            apt_score = min(aptitude_score / min_apt, 1.0) * 20
        else:
            apt_score = 20.0

        total = skills_score + cgpa_score + proj_score + apt_score
        scores[role] = round(float(total), 1)

    return scores
