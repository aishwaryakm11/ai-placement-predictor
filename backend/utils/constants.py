"""Application-wide constants."""

# Feature human-readable labels for SHAP explanations
FEATURE_LABELS = {
    "cgpa": "CGPA",
    "backlogs": "backlogs",
    "projects_count": "project experience",
    "internships_count": "internships",
    "open_source_contributions": "open-source contributions",
    "aptitude_score": "aptitude performance",
    "soft_skill_rating": "soft skills / communication",
    "hackathons_attended": "hackathon participation",
    "leadership_roles": "leadership experience",
    "num_certifications": "certifications",
    "num_languages": "language/framework breadth",
    "tenth_pct": "10th percentage",
    "twelfth_pct": "12th percentage",
}

# Skill-tier phase labels
TIER_PHASE_LABEL = {
    "foundational": "Foundational",
    "intermediate": "Intermediate",
    "advanced": "Advanced",
}
