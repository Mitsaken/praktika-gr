"""
Praktika GR - Static Site Generator
Zero External CDN, Self-Hosted WOFF2 Fonts, Strict CSP (0 unsafe-inline), 100% Client-Side
"""

import json
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).parent
DIST = ROOT / "dist"

CONFIG = json.loads((ROOT / "site_config.json").read_text(encoding="utf-8"))
SITE_URL = CONFIG["SITE_URL"]
WAITLIST_ORIGIN = "https://conversionlogic-waitlist.conversionlogic.workers.dev"
GOOGLE_VERIFY = "cddcb0945a7b4e49"


def clean_and_prep_dist():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True, exist_ok=True)


def transform_html(raw_html: str) -> str:
    csp_meta = (
        f'<meta http-equiv="Content-Security-Policy" content="'
        f"default-src 'self'; font-src 'self'; script-src 'self'; style-src 'self'; "
        f"img-src 'self' data:; connect-src 'self' {WAITLIST_ORIGIN}; "
        f"form-action 'self' {WAITLIST_ORIGIN};\">"
    )
    gsc_meta = f'<meta name="google-site-verification" content="{GOOGLE_VERIFY}">'
    canonical_link = f'<link rel="canonical" href="{SITE_URL}/">'
    og_meta = (
        f'<meta property="og:type" content="website">\n'
        f'  <meta property="og:locale" content="el_GR">\n'
        f'  <meta property="og:title" content="Praktika GR — Φύλλο Κοινοχρήστων Π.Δ. 1985 & Πρακτικά Γ.Σ.">\n'
        f'  <meta property="og:description" content="Υπολογισμός κοινοχρήστων & θέρμανσης (Π.Δ. 27.9/7.11.1985) με ισοζύγιο Hamilton, αποσύνδεση Ν. 4495/2017 και πρακτικά Γ.Σ. Ν. 3741/1929.">\n'
        f'  <meta property="og:url" content="{SITE_URL}/">\n'
        f'  <meta name="twitter:card" content="summary">\n'
        f'  <meta name="twitter:title" content="Praktika GR — Φύλλο Κοινοχρήστων & Πρακτικά Γ.Σ.">\n'
        f'  <meta name="twitter:description" content="Κατανομή κοινοχρήστων Π.Δ. 1985, επιμερισμός ενοίκου/ιδιοκτήτη, πρακτικά Γ.Σ. και ειδοποιητήρια A4.">\n'
        f'  <meta property="article:modified_time" content="2026-11-19">'
    )

    json_ld = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SoftwareApplication",
                "name": "Praktika GR — Υπολογισμός Κοινοχρήστων Π.Δ. 1985 & Πρακτικά Γ.Σ. Πολυκατοικίας",
                "operatingSystem": "All modern browsers",
                "applicationCategory": "BusinessApplication",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "EUR",
                },
                "description": "100% δωρεάν εργαλείο κατανομής κοινοχρήστων & αυτόνομης θέρμανσης βάσει Π.Δ. 27.9/7.11.1985 και αυτόματης σύνταξης Πρακτικών Γενικής Συνέλευσης πολυκατοικίας (Ν. 3741/1929).",
                "author": {
                    "@type": "Organization",
                    "name": "Conversionlogic",
                },
            },
            {
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "Πώς υπολογίζεται η κατανομή αυτόνομης θέρμανσης στα κοινόχρηστα πολυκατοικίας;",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Σύμφωνα με το Π.Δ. 27.9/7.11.1985, η δαπάνη θέρμανσης κατανέμεται σε πάγιο ποσοστό βάσει συντελεστών ιδιοκτησίας (fi, εi) και μεταβλητό ποσοστό βάσει ωρών αυτονομίας ή θερμιδομετρητών.",
                        },
                    },
                    {
                        "@type": "Question",
                        "name": "Ποια είναι η νόμιμη απαρτία σε Γενική Συνέλευση πολυκατοικίας;",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Βάσει του Ν. 3741/1929 και των συνήθων κανονισμών πολυκατοικιών, η τακτική απαρτία στην πρώτη σύγκληση απαιτεί την παρουσία ή εκπροσώπηση άνω των 500/1000 χιλιοστών συνιδιοκτησίας (501+ χιλιοστά), εφόσον δεν ορίζεται αυξημένη πλειοψηφία από τον κανονισμό.",
                        },
                    },
                    {
                        "@type": "Question",
                        "name": "Τι ισχύει για αποσύνδεση διαμερίσματος από την κεντρική θέρμανση (Ν. 4495/2017 αρ. 127) και τι QR χρησιμοποιείται στα ειδοποιητήρια;",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Ένα μόνιμα αποσυνδεδεμένο διαμέρισμα κατά τον Ν. 4495/2017 απαλλάσσεται από τις δαπάνες κεντρικής θέρμανσης (πάγιο και κατανάλωση), με το κόστος να ανακατανέμεται στα υπόλοιπα συνδεδεμένα διαμερίσματα. Τα ειδοποιητήρια πληρωμής του πακέτου παράγουν SEPA IBAN QR (πρότυπο EPC069-12), ενώ τυχόν στοιχεία IRIS αναγράφονται σε ξεχωριστή γραμμή κειμένου.",
                        },
                    },
                ],
            },
        ],
    }
    json_ld_script = (
        '<script type="application/ld+json">\n'
        + json.dumps(json_ld, ensure_ascii=False, indent=2)
        + "\n  </script>"
    )

    head_insert = f"\n  {csp_meta}\n  {gsc_meta}\n  {canonical_link}\n  {og_meta}\n  {json_ld_script}"
    return raw_html.replace("<head>", f"<head>{head_insert}", 1)


def generate_privacy_page():
    privacy_html = f"""<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; font-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self';">
  <title>Πολιτική Απορρήτου &amp; Νομική Σημείωση | Praktika GR</title>
  <meta name="description" content="Πολιτική απορρήτου, GDPR συγκατάθεση και νομική σημείωση μη επίσημου εργαλείου για το Praktika GR.">
  <link rel="canonical" href="{SITE_URL}/privacy.html">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="legal-card">
    <h1>Πολιτική Απορρήτου &amp; Νομική Σημείωση</h1>
    <p>Το <strong>Praktika GR</strong> παρέχεται δωρεάν ως ανεξάρτητο, τοπικό τεχνικό εργαλείο διαχείρισης κοινοχρήστων Π.Δ. 27.9/7.11.1985 και σύνταξης Πρακτικών Γενικής Συνέλευσης (Conversionlogic 0€ Validation Mode — χωρίς εμπορικές συναλλαγές ή συνδρομές).</p>
    <h2>1. Μηδενική Διαρροή Δεδομένων</h2>
    <ul>
      <li>Όλοι οι υπολογισμοί κοινοχρήστων, ονομάτων ιδιοκτητών και πρακτικών εκτελούνται <strong>αποκλειστικά στον browser</strong>. Προαιρετική τοπική αποθήκευση προσχεδίου (<code>localStorage</code>) παραμένει μόνο στη συσκευή σας και διαγράφεται άμεσα με το κουμπί «Καθαρισμός Δεδομένων».</li>
      <li>Μηδενικά cookies παρακολούθησης, Google Fonts ή εξωτερικές βιβλιοθήκες.</li>
    </ul>
    <h2>2. Λίστα Αναμονής (GDPR Άρθρο 6 παρ. 1α)</h2>
    <p>Η εγγραφή email στη λίστα αναμονής είναι προαιρετική και ενεργοποιείται μόνο εφόσον επιλέξετε ρητά το πλαίσιο συγκατάθεσης. Διαγραφή οποτεδήποτε κατόπιν αιτήματος.</p>
    <h2>3. Νομικό Πλαίσιο &amp; Αποποίηση Ευθύνης</h2>
    <p>Το εργαλείο δεν υποκαθιστά τον επίσημο κανονισμό οροφοκτησίας της πολυκατοικίας σας ούτε επίσημη νομική γνωμοδότηση. <strong>Τελευταίος Τεχνικός/Νομικός Έλεγχος:</strong> 19/11/2026.</p>
    <a href="/" class="legal-back">&larr; Επιστροφή στο Praktika GR</a>
  </main>
</body>
</html>"""
    (DIST / "privacy.html").write_text(privacy_html, encoding="utf-8")


def generate_sitemap():
    sitemap = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>{SITE_URL}/</loc>
    <lastmod>2026-11-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>{SITE_URL}/privacy.html</loc>
    <lastmod>2026-11-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
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
    (DIST / f"google{GOOGLE_VERIFY}.html").write_text(
        f"google-site-verification: google{GOOGLE_VERIFY}.html", encoding="utf-8"
    )


def generate_headers():
    headers = """/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: geolocation=(), camera=(), microphone=()
"""
    (DIST / "_headers").write_text(headers, encoding="utf-8")


def create_zip():
    zip_path = ROOT / "site.zip"
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for file in sorted(DIST.rglob("*")):
            if file.is_file():
                zipf.write(file, arcname=file.relative_to(DIST).as_posix())
    print(f"Created Cloudflare ZIP: {zip_path} ({zip_path.stat().st_size:,} bytes)")


def build():
    print("Building Praktika GR Zero-AI Accounting Ledger...")
    clean_and_prep_dist()

    shutil.copy2(ROOT / "styles.css", DIST / "styles.css")
    shutil.copy2(ROOT / "engine.js", DIST / "engine.js")
    shutil.copy2(ROOT / "app.js", DIST / "app.js")
    shutil.copytree(ROOT / "assets", DIST / "assets")

    raw_index = (ROOT / "index_template.html").read_text(encoding="utf-8")
    (DIST / "index.html").write_text(transform_html(raw_index), encoding="utf-8")

    generate_privacy_page()
    generate_sitemap()
    generate_robots()
    generate_gsc_verification_file()
    generate_headers()
    create_zip()
    print("Build Complete!")


if __name__ == "__main__":
    build()
