"""
Praktika GR — Automated Zero-AI Ledger & E2E Test Suite
"""

import http.server
import re
import socketserver
import threading
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

DIST_DIR = Path(__file__).parent / "dist"
PORT = 8998
EMOJI_RE = re.compile(r"[\U0001F300-\U0001FAFF\u2600-\u27BF]")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIST_DIR), **kwargs)

    def log_message(self, format, *args):
        pass


def start_server():
    class ReusableTCP(socketserver.TCPServer):
        allow_reuse_address = True

    httpd = ReusableTCP(("127.0.0.1", PORT), Handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd


def test_static_and_design_lint():
    print("[Test 1/6] Verifying Static Files, Zero-AI Lint & Strict CSP...")
    for fname in ["index.html", "styles.css", "engine.js", "app.js", "privacy.html", "sitemap.xml", "robots.txt", "_headers", "googlecddcb0945a7b4e49.html"]:
        assert (DIST_DIR / fname).exists(), f"{fname} missing"

    font_bytes = sum(f.stat().st_size for f in (DIST_DIR / "assets" / "fonts").glob("*.woff2"))
    assert 10000 < font_bytes <= 150000, f"Font payload budget exceeded: {font_bytes} B"

    index_html = (DIST_DIR / "index.html").read_text(encoding="utf-8")
    styles_css = (DIST_DIR / "styles.css").read_text(encoding="utf-8")
    for bad in ["cdn.tailwindcss.com", "unpkg.com", "fonts.googleapis.com", "unsafe-inline", "onclick=", "onchange=", 'style="', "payhip.com", "25€", "v1.0", "animate-pulse", "backdrop-blur"]:
        assert bad not in index_html, f"Forbidden token in index.html: {bad}"
    assert "linear-gradient" not in styles_css, "Gradients forbidden in Zero-AI CSS"
    assert "@page" in styles_css and "A4" in styles_css, "@page A4 print rule missing"
    assert not EMOJI_RE.search(index_html), "Emojis forbidden in index.html"
    assert "Π.Δ. 27.9/7.11.1985" in index_html
    assert "1.000‰" in index_html or "1000‰" in index_html
    print(f"   -> PASS: Ledger lint clean, {font_bytes:,}B self-hosted WOFF2, strict CSP (0 unsafe-inline).")


def test_e2e_playwright():
    httpd = start_server()
    time.sleep(0.3)

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={"width": 1280, "height": 800}, permissions=["clipboard-read", "clipboard-write"])
            page = context.new_page()
            console_errs = []
            page.on("pageerror", lambda e: console_errs.append(str(e)))
            page.on("console", lambda m: console_errs.append(m.text) if m.type == "error" else None)

            external_requests = []
            page.on("request", lambda req: external_requests.append(req.url) if not req.url.startswith(f"http://127.0.0.1:{PORT}") and not req.url.startswith("data:") else None)

            print("[Test 2/6] Verifying Strict CSP, Self-Hosted Font & Zero Network Leaks...")
            page.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="networkidle")
            assert len(external_requests) == 0, f"External requests detected: {external_requests}"
            bg = page.evaluate("getComputedStyle(document.body).backgroundColor")
            assert bg == "rgb(240, 239, 234)", f"Expected #F0EFEA ledger paper bg, got {bg}"
            loaded_fonts = page.evaluate("[...document.fonts].filter(f => f.status === 'loaded').map(f => f.family)")
            assert any("IBM Plex Sans" in f for f in loaded_fonts), f"Self-hosted Plex not loaded: {loaded_fonts}"
            print(f"   -> PASS: 0 external leaks, loaded fonts={loaded_fonts}, paper bg={bg}.")

            print("[Test 3/6] Verifying P.D. 1985 Expenses Calculation, 1000‰ Check & Ledger Table...")
            sum_gen = page.locator("#sumGeneral").inner_text()
            sum_elev = page.locator("#sumElevator").inner_text()
            sum_heat = page.locator("#sumHeating").inner_text()
            sum_grand = page.locator("#sumGrandTotal").inner_text()
            assert "220.00" in sum_gen
            assert "140.00" in sum_elev
            assert "780.00" in sum_heat
            assert "1,240.00" in sum_grand or "1240.00" in sum_grand
            assert "1000‰" in page.locator("#milliemesCheckText").inner_text()
            assert len(page.locator("#expensesTableBody tr").all()) == 8
            assert len(page.locator("#expensesTableFoot tr").all()) == 1
            print(f"   -> PASS: Totals & 1000‰ check verified (Grand: {sum_grand}, 8 ledger rows + double total row).")

            print("[Test 4/6] Verifying Tab 2: General Assembly & Quorum Meter...")
            page.click("#tabBtn-assembly")
            page.wait_for_timeout(150)
            assert "830" in page.locator("#quorumMilliemesDisplay").inner_text()
            assert "ΝΟΜΙΜΗ ΑΠΑΡΤΙΑ" in page.locator("#quorumStatusBadge").inner_text()
            minutes_text = page.locator("#assemblyMinutesOutput").inner_text()
            assert "ΠΡΑΚΤΙΚΟ ΓΕΝΙΚΗΣ ΣΥΝΕΛΕΥΣΗΣ" in minutes_text
            assert "Ρήτρα Απαλλαγής Διαχειριστή" in minutes_text
            assert not EMOJI_RE.search(minutes_text), "Emojis found in Assembly Minutes output!"

            first_cb = page.locator("#assemblyAttendanceBody input[type='checkbox']").first
            first_cb.click()
            page.wait_for_timeout(150)
            assert "830" not in page.locator("#quorumMilliemesDisplay").inner_text()
            first_cb.click()
            page.wait_for_timeout(100)
            print("   -> PASS: Quorum meter reactive & emoji-free Minutes verified.")

            print("[Test 5/6] Verifying Tab 3 Notices & Static Waitlist GDPR Guard...")
            page.click("#tabBtn-notices")
            page.wait_for_timeout(150)
            notice_text = page.locator("#expenseNoticeOutput").inner_text()
            assert "ΕΙΔΟΠΟΙΗΤΗΡΙΟ ΠΛΗΡΩΜΗΣ ΚΟΙΝΟΧΡΗΣΤΩΝ" in notice_text
            assert "27.9/7.11.1985" in notice_text
            assert not EMOJI_RE.search(notice_text), "Emojis found in Expense Notice output!"

            consent_cb = page.locator("#proWaitlistConsent")
            assert page.locator("#proWaitlistAdvice").count() == 1
            assert consent_cb.count() == 1 and not consent_cb.is_checked(), "Consent checkbox must start unchecked"
            page.locator("#proWaitlistEmail").fill("admin@polykatoikia.gr")
            page.locator("#proWaitlistBtn").click()
            assert "συγκατάθεσ" in page.locator("#proWaitlistMsg").inner_text().lower()
            assert len(external_requests) == 0
            print("   -> PASS: Notice slips & static GDPR Waitlist guard verified.")

            print("[Test 6/7] Verifying Cent Rounding Parity, Prior Balance, Fuel Tank & LocalStorage...")
            rounding_ok = page.evaluate("""() => {
              const e = window.praktikaEngine;
              const b = JSON.parse(JSON.stringify(window.SAMPLE_BUILDINGS.standard_8_apt));
              b.expenses = { general: 100.01, elevator: 33.37, heatingTotal: 199.99, heatingFixedPercentage: 30, reserveContribution: 17.77 };
              const res = e.calculateExpenses(b);
              const sumMonthly = Math.round(res.breakdown.reduce((s, x) => s + x.monthlyTotal, 0) * 100) / 100;
              const milSum = res.breakdown.reduce((s, x) => s + x.milliemesTotal, 0);
              const fuel = e.computeHeatingFuelConsumed(400, 550, 250);
              b.apartments[0].priorBalance = 50;
              b.apartments[1].priorBalance = -20;
              const res2 = e.calculateExpenses(b);
              const notice = e.generateExpenseNoticeMarkdown(res2, b.apartments[0].id);

              // Verify N.4495/2017 disconnected & vacant heating statuses + tenant/owner split
              const bDisc = JSON.parse(JSON.stringify(window.SAMPLE_BUILDINGS.standard_8_apt));
              bDisc.apartments[2].heatingStatus = 'disconnected';
              bDisc.apartments[3].heatingStatus = 'vacant';
              const resDisc = e.calculateExpenses(bDisc);
              const discRow = resDisc.breakdown[2];
              const vacRow = resDisc.breakdown[3];
              const splitExact = resDisc.breakdown.every(x => Math.round((x.ownerShare + x.tenantShare - x.monthlyTotal) * 100) === 0);
              const discSumExact = Math.round(resDisc.breakdown.reduce((s, x) => s + x.monthlyTotal, 0) * 100) / 100 === resDisc.totals.grandTotal;
              return {
                sumMonthly,
                grandTotal: res.totals.grandTotal,
                milSum,
                fuel,
                priorTotal: res2.totals.sumTotalCalculated,
                expectedPrior: Math.round((res2.totals.grandTotal + 30) * 100) / 100,
                noticeHasPrior: notice.includes('Προηγούμενο Υπόλοιπο'),
                discZeroHeat: discRow.heatingFixedShare === 0 && discRow.heatingVariableShare === 0,
                vacZeroVarOwnerAll: vacRow.heatingVariableShare === 0 && vacRow.tenantShare === 0 && vacRow.ownerShare === vacRow.monthlyTotal,
                splitExact,
                discSumExact
              };
            }""")
            assert rounding_ok["sumMonthly"] == rounding_ok["grandTotal"], f"Cent parity failed: {rounding_ok}"
            assert rounding_ok["milSum"] == 1000, "Milliemes must stay strictly untouched"
            assert rounding_ok["fuel"] == 700.0, f"Fuel calc mismatch: {rounding_ok['fuel']}"
            assert rounding_ok["priorTotal"] == rounding_ok["expectedPrior"], f"Prior balance mismatch: {rounding_ok}"
            assert rounding_ok["noticeHasPrior"], "Notice Markdown missing prior balance row"
            assert rounding_ok["discZeroHeat"], f"Disconnected apt must pay 0 heating: {rounding_ok}"
            assert rounding_ok["vacZeroVarOwnerAll"], f"Vacant apt must pay 0 variable heat & 100% ownerShare: {rounding_ok}"
            assert rounding_ok["splitExact"], f"Tenant+Owner split != monthlyTotal: {rounding_ok}"
            assert rounding_ok["discSumExact"], f"Disconnected grandTotal cent parity failed: {rounding_ok}"
            body_txt = page.inner_text("body")
            assert "Οδηγός IRIS" not in body_txt and "QR IRIS" not in body_txt, "Misleading 'QR IRIS' claim still present"

            # UI interaction: switch back to expenses tab, test fuel tank + prior balance + localStorage + JSON export + clear
            page.click("#tabBtn-expenses")
            page.wait_for_timeout(120)
            page.locator("#inputFuelOpening").fill("400")
            page.locator("#inputFuelPurchases").fill("550")
            page.locator("#inputFuelClosing").fill("250")
            page.locator("#applyFuelCalcBtn").click()
            page.wait_for_timeout(120)
            assert page.locator("#inputHeating").input_value() == "700.00"
            assert "700.00" in page.locator("#sumHeating").inner_text()

            page.locator("#expensesTableBody input[data-apt-prior]").first.fill("45")
            page.locator("#expensesTableBody input[data-apt-prior]").first.dispatch_event("change")
            page.wait_for_timeout(120)
            saved_ls = page.evaluate("localStorage.getItem('cl_p5_v1')")
            assert saved_ls and '"priorBalance":45' in saved_ls.replace(" ", ""), "localStorage failed to persist"
            with page.expect_download() as dl_info:
                page.locator("#exportJsonBtn").click()
            dl = dl_info.value
            assert dl.suggested_filename.startswith("praktika-gr-data-") and dl.suggested_filename.endswith(".json")
            page.reload(wait_until="networkidle")
            assert float(page.locator("#inputHeating").input_value()) == 700.0, "Reload did not restore fuel heatingTotal"
            assert "45" in page.locator("#expensesTableBody input[data-apt-prior]").first.input_value()
            page.locator("#clearStorageBtn").click()
            page.wait_for_timeout(120)
            assert page.locator("#inputHeating").input_value() == "780", "Clear did not restore preset 780"
            assert page.evaluate("localStorage.getItem('cl_p5_v1')") is None, "Clear did not remove cl_p5_v1"

            # Ensure 0 .style. DOM mutations in app.js
            app_js_src = (DIST_DIR / "app.js").read_text(encoding="utf-8")
            assert ".style." not in app_js_src, "Forbidden .style. property mutation found in app.js"
            print("   -> PASS: Cent rounding parity, untouched ‰, prior balance, fuel inventory, JSON/localStorage & 0 .style. verified.")

            print("[Test 7/7] Verifying Mobile 390px & 320px Zero Horizontal Overflow...")
            for width in (390, 320):
                page.set_viewport_size({"width": width, "height": 844})
                for tab in ("expenses", "assembly", "notices"):
                    page.click(f"#tabBtn-{tab}")
                    page.wait_for_timeout(120)
                    diff = page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
                    assert diff <= 0, f"Horizontal overflow @ {width}px on tab {tab}: {diff}px"
            assert not console_errs, f"Console/CSP errors: {console_errs}"
            print("   -> PASS: 390px & 320px viewports clean across all 3 tabs (0px overflow, 0 CSP errors).")

            browser.close()
    finally:
        httpd.shutdown()
    print("\nALL 7 P5 ZERO-AI LEDGER TEST SUITES PASSED!")


if __name__ == "__main__":
    test_static_and_design_lint()
    test_e2e_playwright()
