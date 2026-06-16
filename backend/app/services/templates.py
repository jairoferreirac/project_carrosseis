TEMPLATES: list[dict] = [
    {
        "slug": "minimal-dark",
        "name": "Minimal dark",
        "config": {
            "background": "#111827",
            "accent": "#38bdf8",
            "text": "#ffffff",
            "muted": "#cbd5e1",
            "font": "Inter",
            "radius": 0,
        },
    },
    {
        "slug": "clean-white",
        "name": "Clean white",
        "config": {
            "background": "#f8fafc",
            "accent": "#2563eb",
            "text": "#111827",
            "muted": "#475569",
            "font": "Inter",
            "radius": 0,
        },
    },
    {
        "slug": "tech-gradient",
        "name": "Tech gradient",
        "config": {
            "background": "linear-gradient(135deg, #0f172a, #0e7490)",
            "accent": "#a7f3d0",
            "text": "#ffffff",
            "muted": "#d1fae5",
            "font": "Space Grotesk",
            "radius": 8,
        },
    },
    {
        "slug": "corporate",
        "name": "Corporate",
        "config": {
            "background": "#e5e7eb",
            "accent": "#1d4ed8",
            "text": "#0f172a",
            "muted": "#334155",
            "font": "Arial",
            "radius": 4,
        },
    },
    {
        "slug": "creator-style",
        "name": "Creator style",
        "config": {
            "background": "#fff7ed",
            "accent": "#f97316",
            "text": "#1f2937",
            "muted": "#7c2d12",
            "font": "Poppins",
            "radius": 8,
        },
    },
]


def get_template(slug: str) -> dict:
    return next((template for template in TEMPLATES if template["slug"] == slug), TEMPLATES[0])
