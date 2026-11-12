"""
Praktika GR - Automated Test Suite
Verifies:
1. Strict CSP & Zero External CDN requests
2. Tab Switching (expenses, assembly, notices)
3. P.D. 1985 Heating Allocation & Expense Totals
4. Quorum Meter & General Assembly Minutes Generation
5. Notice Slips (Ειδοποιητήρια) Rendering
6. Mobile Responsiveness @ 390px (0 horizontal overflow)
7. SEO Files (sitemap.xml, robots.txt, GSC verification)
"""

import http.server
import socketserver
import threading
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

DIST_DIR = Path(__file__).parent / "dist"
PORT = 8998

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)

    def log_message(self, format, *args):
        pass

def start_server():
    httpd = socketserver.TCPServer(("", PORT), Handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd

def test_seo_files():
    print("🧪 [Test 1/6] Verifying Static Files & SEO...")
    assert (DIST_DIR / "index.html").exists(), "index.html missing"
    assert (DIST_DIR / "styles.css").exists(), "styles.css missing"
    assert (DIST_DIR / "engine.js").exists(), "engine.js missing"
    assert (DIST_DIR / "app.js").exists(), "app.js missing"
    assert (DIST_DIR / "sitemap.xml").exists(), "sitemap.xml missing"
    assert (DIST_DIR / "robots.txt").exists(), "robots.txt missing"
    assert (DIST_DIR / "googlecddcb0945a7b4e49.html").exists(), "GSC verification file missing"

    index_html = (DIST_DIR / "index.html").read_text(encoding="utf-8")
    assert "cdn.tailwindcss.com" not in index_html, "Tailwind CDN must be removed"
    assert "unpkg.com" not in index_html, "unpkg CDN must be removed"
    assert "fonts.googleapis.com" not in index_html, "Google Fonts CDN must be removed"
    assert "Content-Security-Policy" in index_html, "CSP meta tag must be present"
    assert "Π.Δ. 27.9/7.11.1985" in index_html, "P.D. 1985 reference must be present"
    print("   -> PASS: Zero external CDNs, Strict CSP, All SEO files present.")

def test_e2e_playwright():
    httpd = start_server()
    time.sleep(0.5)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            permissions=["clipboard-read", "clipboard-write"]
        )
        page = context.new_page()

        # Track external network requests
        external_requests = []
        page.on("request", lambda req: external_requests.append(req.url) if not req.url.startswith(f"http://localhost:{PORT}") and not req.url.startswith("data:") else None)

        print("🧪 [Test 2/6] Verifying Strict CSP & Zero Network Leaks...")
        page.goto(f"http://localhost:{PORT}/index.html")
        page.wait_for_load_state("networkidle")
        assert len(external_requests) == 0, f"External requests detected: {external_requests}"
        print("   -> PASS: 0 external network requests during initial page load.")

        print("🧪 [Test 3/6] Verifying P.D. 1985 Expenses Calculation & Table...")
        # Check Totals
        sum_general = page.locator("#sumGeneral").inner_text()
        sum_elevator = page.locator("#sumElevator").inner_text()
        sum_heating = page.locator("#sumHeating").inner_text()
        sum_grand = page.locator("#sumGrandTotal").inner_text()

        assert "220.00" in sum_general, f"Expected 220.00 €, got {sum_general}"
        assert "140.00" in sum_elevator, f"Expected 140.00 €, got {sum_elevator}"
        assert "780.00" in sum_heating, f"Expected 780.00 €, got {sum_heating}"
        assert "1,240.00" in sum_grand or "1240.00" in sum_grand, f"Expected 1240.00 €, got {sum_grand}"

        rows = page.locator("#expensesTableBody tr").all()
        assert len(rows) == 8, f"Expected 8 apartment rows, got {len(rows)}"
        print(f"   -> PASS: Totals verified (General: {sum_general}, Elevator: {sum_elevator}, Heating: {sum_heating}, Grand: {sum_grand}). 8 rows rendered.")

        print("🧪 [Test 4/6] Verifying Tab 2: General Assembly & Quorum Meter...")
        page.click("#tabBtn-assembly")
        page.wait_for_timeout(200)

        # Quorum check
        quorum_display = page.locator("#quorumMilliemesDisplay").inner_text()
        assert "830" in quorum_display, f"Expected 830 milliemes, got {quorum_display}"
        assert page.locator("#quorumStatusBadge").is_visible(), "Quorum status badge should be visible"
        assert "ΝΟΜΙΜΗ ΑΠΑΡΤΙΑ" in page.locator("#quorumStatusBadge").inner_text(), "Expected legal quorum"

        minutes_text = page.locator("#assemblyMinutesOutput").inner_text()
        assert "ΠΡΑΚΤΙΚΟ ΓΕΝΙΚΗΣ ΣΥΝΕΛΕΥΣΗΣ" in minutes_text, "Minutes document should have title"
        assert "830 / 1000" in minutes_text, "Minutes should cite 830 milliemes"
        assert "Ρήτρα Απαλλαγής Διαχειριστή" in minutes_text, "Discharge clause must be present"

        # Toggle an attendee present checkbox to verify reactivity
        first_checkbox = page.locator("#assemblyAttendanceBody input[type='checkbox']").first
        first_checkbox.click()
        page.wait_for_timeout(200)
        new_quorum = page.locator("#quorumMilliemesDisplay").inner_text()
        assert "830" not in new_quorum, "Quorum should reactively change upon toggling attendee"
        first_checkbox.click() # restore
        page.wait_for_timeout(100)
        print("   -> PASS: Assembly Tab verified (Quorum meter reactive, Minutes contain discharge clause).")

        print("🧪 [Test 5/6] Verifying Tab 3: Notice Slips (Ειδοποιητήρια)...")
        page.click("#tabBtn-notices")
        page.wait_for_timeout(200)

        notice_text = page.locator("#expenseNoticeOutput").inner_text()
        assert "ΕΙΔΟΠΟΙΗΤΗΡΙΟ ΠΛΗΡΩΜΗΣ ΚΟΙΝΟΧΡΗΣΤΩΝ" in notice_text, "Notice should have title"
        assert "27.9/7.11.1985" in notice_text, "Notice should cite P.D. 1985"

        # Test Pro Modal
        page.click("button:has-text('Pro Άδεια 25€')")
        page.wait_for_timeout(200)
        modal = page.locator("#proModal")
        assert modal.is_visible(), "Pro modal should be visible"
        page.keyboard.press("Escape")
        page.wait_for_timeout(200)
        assert not modal.is_visible(), "Pro modal should close on Escape"
        print("   -> PASS: Notice slips rendered, Pro modal 25€ verified.")

        print("🧪 [Test 6/6] Verifying Mobile Responsiveness @ 390px (Zero Horizontal Scroll)...")
        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(300)

        # Check across all 3 tabs
        for tab in ['expenses', 'assembly', 'notices']:
            page.click(f"#tabBtn-{tab}")
            page.wait_for_timeout(200)
            scroll_width = page.evaluate("document.documentElement.scrollWidth")
            client_width = page.evaluate("document.documentElement.clientWidth")
            diff = scroll_width - client_width
            assert diff <= 0, f"Horizontal scroll on tab {tab}! scrollWidth={scroll_width}, clientWidth={client_width}"

        print(f"   -> PASS: Mobile 390px viewport perfectly responsive across all 3 tabs (diff=0px).")

        browser.close()

    httpd.shutdown()
    print("\n✨ ALL 6 TEST SUITES PASSED WITH 100% SUCCESS RATE! ✨\n")

if __name__ == "__main__":
    test_seo_files()
    test_e2e_playwright()
