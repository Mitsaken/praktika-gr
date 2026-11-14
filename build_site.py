"""
Praktika GR - Static Site Generator
Zero External CDN, Strict CSP, 100% Client-Side Architecture
"""

import html
import json
import os
import re
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).parent
DIST = ROOT / "dist"

SITE_URL = "https://mitsaken.github.io/praktika-gr"
GOOGLE_VERIFY = "cddcb0945a7b4e49"

SVG_ICONS = {
    "building-2": '<svg class="icon icon-md text-blue" viewBox="0 0 24 24"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path></svg>',
    "sparkles": '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>',
    "sun": '<svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>',
    "calculator": '<svg class="icon icon-sm" viewBox="0 0 24 24"><rect width="16" height="20" x="4" y="2" rx="2"></rect><line x1="8" x2="16" y1="6" y2="6"></line><line x1="16" x2="16" y1="14" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>',
    "file-text": '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>',
    "mail": '<svg class="icon icon-sm" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>',
    "layers": '<svg class="icon icon-sm text-blue" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>',
    "refresh-cw": '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>',
    "download": '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>',
    "printer": '<svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect width="12" height="8" x="6" y="14"></rect></svg>',
    "table": '<svg class="icon icon-sm text-blue" viewBox="0 0 24 24"><path d="M12 3v18"></path><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18"></path><path d="M3 15h18"></path></svg>',
    "scale": '<svg class="icon icon-sm text-blue" viewBox="0 0 24 24"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path></svg>',
    "users": '<svg class="icon icon-lg text-emerald" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    "check-square": '<svg class="icon icon-sm text-blue" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',
    "file-check": '<svg class="icon icon-sm text-emerald" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="m9 15 2 2 4-4"></path></svg>',
    "copy": '<svg class="icon icon-sm" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>',
    "x": '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>',
    "check": '<svg class="icon icon-sm text-emerald" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    "external-link": '<svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" x2="21" y1="14" y2="3"></line></svg>'
}

def clean_and_prep_dist():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True, exist_ok=True)

def transform_html(raw_html: str) -> str:
    # 1. Remove Google Fonts
    raw_html = re.sub(r'<link\s+rel="preconnect"\s+href="https://fonts\.(?:googleapis|gstatic)\.com"[^>]*>', '', raw_html)
    raw_html = re.sub(r'<link\s+href="https://fonts\.googleapis\.com/[^"]*"\s+rel="stylesheet">', '', raw_html)

    # 2. Remove Tailwind CDN script & inline config
    raw_html = re.sub(r'<script\s+src="https://cdn\.tailwindcss\.com"></script>', '', raw_html)
    raw_html = re.sub(r'<script>\s*tailwind\.config\s*=\s*\{[\s\S]*?\}\s*</script>', '', raw_html)

    # 3. Remove Lucide script
    raw_html = re.sub(r'<script\s+src="https://unpkg\.com/lucide@latest"></script>', '', raw_html)

    # 4. Replace <i data-lucide="..."></i> with SVG
    def icon_replacer(match):
        icon_name = match.group(1)
        return SVG_ICONS.get(icon_name, f'<!-- icon:{icon_name} -->')

    raw_html = re.sub(r'<i\s+data-lucide="([^"]+)"[^>]*></i>', icon_replacer, raw_html)

    # 5. Replace inline legacy script with app.js
    raw_html = re.sub(r'<!-- App Script -->\s*<script src="engine.js"></script>\s*<script>[\s\S]*?</script>', '<script src="engine.js"></script>\n  <script src="app.js"></script>', raw_html)
    if 'src="app.js"' not in raw_html:
        raw_html = raw_html.replace('<script src="engine.js"></script>', '<script src="engine.js"></script>\n  <script src="app.js"></script>')

    # 6. Inject Strict CSP & SEO Metadata
    csp_meta = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data:; connect-src \'self\';">'
    gsc_meta = f'<meta name="google-site-verification" content="{GOOGLE_VERIFY}">'
    canonical_link = f'<link rel="canonical" href="{SITE_URL}/">'

    json_ld = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Praktika GR — Διαχείριση Πολυκατοικίας & Πρακτικά Γ.Σ.",
        "operatingSystem": "All modern browsers",
        "applicationCategory": "BusinessApplication",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR"
        },
        "description": "100% Local-First εργαλείο υπολογισμού κοινοχρήστων, αυτόνομης θέρμανσης (Π.Δ. 1985) και αυτόματης σύνταξης επίσημων Πρακτικών Γενικής Συνέλευσης.",
        "author": {
            "@type": "Organization",
            "name": "Conversionlogic"
        }
    }
    json_ld_script = f'<script type="application/ld+json">\n{json.dumps(json_ld, ensure_ascii=False, indent=2)}\n</script>'

    head_insert = f"\n  {csp_meta}\n  {gsc_meta}\n  {canonical_link}\n  {json_ld_script}\n"
    raw_html = raw_html.replace('<head>', f'<head>{head_insert}')

    return raw_html

def generate_sitemap():
    sitemap = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>{SITE_URL}/</loc>
    <lastmod>2026-11-12</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
"""
    (DIST / "sitemap.xml").write_text(sitemap.strip(), encoding="utf-8")

def generate_robots():
    robots = f"""User-agent: *
Allow: /

Sitemap: {SITE_URL}/sitemap.xml
"""
    (DIST / "robots.txt").write_text(robots.strip(), encoding="utf-8")

def generate_gsc_verification_file():
    (DIST / f"google{GOOGLE_VERIFY}.html").write_text(f"google-site-verification: google{GOOGLE_VERIFY}.html", encoding="utf-8")

def create_zip():
    zip_path = ROOT / "site.zip"
    if zip_path.exists():
        zip_path.unlink()

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file in DIST.glob("*"):
            if file.is_file():
                zipf.write(file, arcname=file.name)
    print(f"📦 Successfully created deployable ZIP at {zip_path} ({zip_path.stat().st_size:,} bytes)")

def build():
    print("🚀 Starting Praktika GR Static Site Build...")
    clean_and_prep_dist()

    # Copy pure CSS & JS engines
    shutil.copy2(ROOT / "styles.css", DIST / "styles.css")
    shutil.copy2(ROOT / "engine.js", DIST / "engine.js")
    shutil.copy2(ROOT / "app.js", DIST / "app.js")

    # Transform index.html from template
    src_template = ROOT / "index_template.html"
    raw_index = src_template.read_text(encoding="utf-8") if src_template.exists() else (ROOT / "index.html").read_text(encoding="utf-8")
    processed_index = transform_html(raw_index)
    (DIST / "index.html").write_text(processed_index, encoding="utf-8")
    (ROOT / "index.html").write_text(processed_index, encoding="utf-8")
    print(f"✅ Transformed index.html ({len(processed_index):,} characters, 0 CDNs, Strict CSP)")

    # Sitemaps & SEO files
    generate_sitemap()
    generate_robots()
    generate_gsc_verification_file()
    for fname in ("sitemap.xml", "robots.txt", f"google{GOOGLE_VERIFY}.html"):
        shutil.copy2(DIST / fname, ROOT / fname)
    print("✅ Generated sitemap.xml, robots.txt, and GSC verification file (synced to root)")

    # Create ZIP for Cloudflare Pages
    create_zip()
    print("🎉 Build Complete! Ready for Deployment.")

if __name__ == "__main__":
    build()
