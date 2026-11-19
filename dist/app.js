/**
 * Praktika GR - Accounting Ledger & General Assembly Controller
 * Strict CSP Compliant (Zero inline handlers, Zero external CDNs, Zero emojis)
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'cl_p5_v1';
  let currentBuildingData = null;
  let currentAssemblyData = null;
  let lastCalcResult = null;

  function setStorageStatus(text) {
    const el = document.getElementById('storageStatusNote');
    if (el) el.textContent = text;
  }

  function saveDraftState() {
    try {
      if (!currentBuildingData || !currentAssemblyData) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        v: 1,
        building: currentBuildingData,
        assembly: currentAssemblyData
      }));
    } catch (_) {}
  }

  function tryLoadDraftState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.building || !Array.isArray(parsed.building.apartments) || !parsed.building.expenses || !parsed.assembly || !Array.isArray(parsed.assembly.attendance)) {
        return false;
      }
      currentBuildingData = parsed.building;
      currentAssemblyData = parsed.assembly;
      return true;
    } catch (_) {
      return false;
    }
  }

  function clearDraftState() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    if (window.SAMPLE_BUILDINGS) {
      currentBuildingData = JSON.parse(JSON.stringify(window.SAMPLE_BUILDINGS.standard_8_apt));
      currentAssemblyData = JSON.parse(JSON.stringify(window.SAMPLE_BUILDINGS.annual_assembly.assemblyInfo));
    }
    syncPoolInputsFromData();
    calculateAndRenderExpenses(true);
    initAssemblyTab();
    setStorageStatus('Τα τοπικά δεδομένα καθαρίστηκαν και επανήλθαν οι προεπιλογές.');
  }

  function exportJsonState() {
    readPoolInputsIntoData();
    const payload = {
      app: 'Praktika GR',
      version: 1,
      exportedAt: new Date().toISOString(),
      building: currentBuildingData,
      assembly: currentAssemblyData
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `praktika-gr-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setStorageStatus('Εξήχθη αντίγραφο JSON τοπικά.');
  }

  function importJsonState(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ''));
        if (!parsed || !parsed.building || !Array.isArray(parsed.building.apartments) || !parsed.building.expenses) {
          throw new Error('Μη έγκυρη δομή JSON');
        }
        currentBuildingData = parsed.building;
        if (parsed.assembly && Array.isArray(parsed.assembly.attendance)) {
          currentAssemblyData = parsed.assembly;
        }
        syncPoolInputsFromData();
        calculateAndRenderExpenses();
        initAssemblyTab();
        setStorageStatus('Εισήχθησαν επιτυχώς τα δεδομένα από το αρχείο JSON.');
      } catch (_) {
        setStorageStatus('Σφάλμα: Το αρχείο JSON δεν έχει έγκυρη δομή Praktika GR.');
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopyText(text));
    }
    return fallbackCopyText(text);
  }

  function fallbackCopyText(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.className = 'sr-copy-buffer';
    document.body.appendChild(ta);
    ta.select();
    return new Promise((resolve, reject) => {
      try {
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('Copy failed'));
      } catch (err) {
        document.body.removeChild(ta);
        reject(err);
      }
    });
  }

  function formatEuro(val) {
    return `${Number(val || 0).toFixed(2)} €`;
  }

  function switchTab(tabId) {
    const tabs = ['expenses', 'assembly', 'notices'];
    tabs.forEach((t) => {
      const btn = document.getElementById(`tabBtn-${t}`);
      const content = document.getElementById(`tabContent-${t}`);
      if (btn) btn.classList.toggle('active', t === tabId);
      if (content) content.classList.toggle('hidden', t !== tabId);
    });
  }

  function syncPoolInputsFromData() {
    if (!currentBuildingData || !currentBuildingData.expenses) return;
    const exp = currentBuildingData.expenses;
    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v;
    };
    setVal('inputGeneral', exp.general);
    setVal('inputElevator', exp.elevator);
    setVal('inputHeating', exp.heatingTotal);
    setVal('inputReserve', exp.reserveContribution);
    setVal('inputFuelOpening', exp.fuelOpeningEur ?? 0);
    setVal('inputFuelPurchases', exp.fuelPurchasesEur ?? 0);
    setVal('inputFuelClosing', exp.fuelClosingEur ?? 0);
  }

  function readPoolInputsIntoData() {
    if (!currentBuildingData || !currentBuildingData.expenses) return;
    const numVal = (id, fallback) => {
      const el = document.getElementById(id);
      const parsed = el ? parseFloat(el.value) : NaN;
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
    };
    currentBuildingData.expenses.general = numVal('inputGeneral', 220);
    currentBuildingData.expenses.elevator = numVal('inputElevator', 140);
    currentBuildingData.expenses.heatingTotal = numVal('inputHeating', 780);
    currentBuildingData.expenses.reserveContribution = numVal('inputReserve', 100);
    currentBuildingData.expenses.fuelOpeningEur = numVal('inputFuelOpening', 0);
    currentBuildingData.expenses.fuelPurchasesEur = numVal('inputFuelPurchases', 0);
    currentBuildingData.expenses.fuelClosingEur = numVal('inputFuelClosing', 0);
  }

  function applyFuelInventoryCalculation() {
    if (!window.praktikaEngine || !currentBuildingData || !currentBuildingData.expenses) return;
    readPoolInputsIntoData();
    const exp = currentBuildingData.expenses;
    const consumed = window.praktikaEngine.computeHeatingFuelConsumed(
      exp.fuelOpeningEur,
      exp.fuelPurchasesEur,
      exp.fuelClosingEur
    );
    const heatEl = document.getElementById('inputHeating');
    if (heatEl) heatEl.value = consumed.toFixed(2);
    exp.heatingTotal = consumed;
    calculateAndRenderExpenses();
    setStorageStatus(`Υπολογίστηκε κατανάλωση δεξαμενής ${consumed.toFixed(2)} € και εφαρμόστηκε στη θέρμανση.`);
  }

  function calculateAndRenderExpenses(skipSave = false) {
    if (!window.praktikaEngine || !currentBuildingData) return;
    readPoolInputsIntoData();
    lastCalcResult = window.praktikaEngine.calculateExpenses(currentBuildingData);
    if (skipSave !== true) saveDraftState();
    const t = lastCalcResult.totals;

    document.getElementById('sumGeneral').innerText = formatEuro(t.generalExp);
    document.getElementById('sumElevator').innerText = formatEuro(t.elevatorExp);
    document.getElementById('sumHeating').innerText = formatEuro(t.heatingTotal);
    document.getElementById('sumGrandTotal').innerText = `${t.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

    const resNote = document.getElementById('sumReserveNote');
    if (resNote) resNote.innerText = `+${formatEuro(t.reserveExp)} Αποθεματικό`;

    const strip = document.getElementById('milliemesValidationStrip');
    const checkText = document.getElementById('milliemesCheckText');
    const allValid = t.milliemesValid && t.elevatorValid && t.heatingMilliemesValid;
    if (strip) strip.classList.toggle('is-warn', !allValid);
    if (checkText) {
      checkText.innerText = `Γενικά ${t.totalMilliemes}‰ · Ανελκυστήρα ${t.totalElevatorMilliemes}‰ · Θέρμανσης ${t.totalHeatingMilliemes}‰ ${allValid ? `(Ισοζυγισμένο 1000‰ · Μηνιαίο Άθροισμα = ${t.sumMonthlyCalculated.toFixed(2)} €)` : '(Απαιτείται Ισοζυγισμός 1000‰)'}`;
    }

    const tbody = document.getElementById('expensesTableBody');
    const tfoot = document.getElementById('expensesTableFoot');
    if (tbody) {
      tbody.innerHTML = '';
      let sumHrs = 0;
      let sumGenRes = 0;
      let sumElev = 0;
      let sumHeatFix = 0;
      let sumHeatVar = 0;
      let sumPay = 0;
      let sumTenant = 0;
      let sumOwner = 0;

      lastCalcResult.breakdown.forEach((item, idx) => {
        const genPlusRes = item.generalShare + item.reserveShare;
        sumHrs += item.heatingHours;
        sumGenRes += genPlusRes;
        sumElev += item.elevatorShare;
        sumHeatFix += item.heatingFixedShare;
        sumHeatVar += item.heatingVariableShare;
        sumPay += item.totalToPay;
        sumTenant += item.tenantShare;
        sumOwner += item.ownerShare;

        const tr = document.createElement('tr');
        const tdApt = document.createElement('td');
        const sTitle = document.createElement('span');
        sTitle.className = 'apt-title';
        sTitle.textContent = item.name;
        const sOwner = document.createElement('span');
        sOwner.className = 'apt-owner';
        sOwner.textContent = item.owner;
        const statusSel = document.createElement('select');
        statusSel.className = 'input-select input-select-compact heat-status-select';
        statusSel.setAttribute('aria-label', `Κατάσταση θέρμανσης ${item.name}`);
        [
          ['active', 'Ενεργό'],
          ['vacant', 'Κενό (Ιδιοκτ.)'],
          ['disconnected', 'Αποσυνδεδ. (Ν.4495)']
        ].forEach(([val, lbl]) => {
          const opt = document.createElement('option');
          opt.value = val;
          opt.textContent = lbl;
          if ((item.heatingStatus || 'active') === val) opt.selected = true;
          statusSel.appendChild(opt);
        });
        statusSel.addEventListener('change', () => {
          if (currentBuildingData.apartments[idx]) {
            currentBuildingData.apartments[idx].heatingStatus = statusSel.value;
          }
          calculateAndRenderExpenses();
        });
        tdApt.appendChild(sTitle);
        tdApt.appendChild(sOwner);
        tdApt.appendChild(statusSel);

        const cells = [
          [`${item.milliemesTotal}‰`, 'num'],
          [`${item.heatingHours} h`, 'num'],
          [formatEuro(genPlusRes), 'num'],
          [formatEuro(item.elevatorShare), 'num'],
          [formatEuro(item.heatingFixedShare), 'num'],
          [formatEuro(item.heatingVariableShare), 'num']
        ];

        tr.appendChild(tdApt);
        cells.forEach(([txt, cls]) => {
          const td = document.createElement('td');
          td.className = cls;
          td.textContent = txt;
          tr.appendChild(td);
        });

        const tdPrior = document.createElement('td');
        tdPrior.className = 'num';
        const priorInput = document.createElement('input');
        priorInput.type = 'number';
        priorInput.step = '0.01';
        priorInput.className = 'input-text input-num input-cell-num';
        priorInput.value = Number(item.priorBalance || 0).toFixed(2);
        priorInput.setAttribute('aria-label', `Προηγούμενο υπόλοιπο ${item.name}`);
        priorInput.setAttribute('data-apt-prior', item.id);
        priorInput.addEventListener('change', () => {
          const parsed = parseFloat(priorInput.value);
          if (currentBuildingData.apartments[idx]) {
            currentBuildingData.apartments[idx].priorBalance = Number.isFinite(parsed) ? parsed : 0;
          }
          calculateAndRenderExpenses();
        });
        tdPrior.appendChild(priorInput);
        tr.appendChild(tdPrior);

        const tdPay = document.createElement('td');
        tdPay.className = 'num cell-pay';
        const payMain = document.createElement('span');
        payMain.textContent = formatEuro(item.totalToPay);
        const paySplit = document.createElement('span');
        paySplit.className = 'apt-owner';
        paySplit.textContent = `Έν: ${item.tenantShare.toFixed(2)} / Ιδ: ${item.ownerShare.toFixed(2)}`;
        tdPay.appendChild(payMain);
        tdPay.appendChild(paySplit);
        if (Math.abs(item.roundingAdjustment) >= 0.005) {
          const sign = item.roundingAdjustment > 0 ? '+' : '';
          tdPay.title = `Εξίσωση στρογγυλοποίησης: ${sign}${item.roundingAdjustment.toFixed(2)} €`;
        }
        tr.appendChild(tdPay);

        tbody.appendChild(tr);
      });

      if (tfoot) {
        tfoot.innerHTML = '';
        const trFoot = document.createElement('tr');
        const footCells = [
          [`ΣΥΝΟΛΟ (Έν: ${sumTenant.toFixed(2)}€ / Ιδ: ${sumOwner.toFixed(2)}€)`, ''],
          [`${t.totalMilliemes}‰`, 'num'],
          [`${sumHrs} h`, 'num'],
          [formatEuro(sumGenRes), 'num'],
          [formatEuro(sumElev), 'num'],
          [formatEuro(sumHeatFix), 'num'],
          [formatEuro(sumHeatVar), 'num'],
          [formatEuro(t.totalPriorBalance), 'num'],
          [formatEuro(sumPay), 'num cell-pay']
        ];
        footCells.forEach(([txt, cls]) => {
          const td = document.createElement('td');
          if (cls) td.className = cls;
          td.textContent = txt;
          trFoot.appendChild(td);
        });
        tfoot.appendChild(trFoot);
      }
    }

    initNoticesTab();
  }

  function loadExpensePreset(presetKey) {
    if (!window.SAMPLE_BUILDINGS || !window.SAMPLE_BUILDINGS[presetKey]) return;
    currentBuildingData = JSON.parse(JSON.stringify(window.SAMPLE_BUILDINGS[presetKey]));
    syncPoolInputsFromData();
    calculateAndRenderExpenses();
    setStorageStatus('Φορτώθηκε το πρότυπο 8 διαμερισμάτων.');
  }

  function exportExpensesMarkdown() {
    if (!lastCalcResult) return;
    let md = `# Φύλλο Κατανομής Κοινοχρήστων & Θέρμανσης (Π.Δ. 1985)\n\n`;
    md += `- Πολυκατοικία: ${lastCalcResult.buildingInfo.address}\n`;
    md += `- Περίοδος: ${lastCalcResult.buildingInfo.period}\n`;
    md += `- Έλεγχος Χιλιοστών: ${lastCalcResult.totals.totalMilliemes} / 1000‰\n`;
    md += `- Μηνιαία Δαπάνη (Ακριβές Ισοζύγιο): ${lastCalcResult.totals.sumMonthlyCalculated.toFixed(2)} € (Δαπάνη: ${lastCalcResult.totals.grandTotal.toFixed(2)} €)\n`;
    if (Math.abs(lastCalcResult.totals.totalPriorBalance || 0) >= 0.005) {
      md += `- Προηγούμενα Υπόλοιπα: ${lastCalcResult.totals.totalPriorBalance.toFixed(2)} €\n`;
      md += `- Γενικό Πληρωτέο: ${lastCalcResult.totals.sumTotalCalculated.toFixed(2)} €\n`;
    }
    md += `\n| Διαμέρισμα | Ιδιοκτήτης | Χιλιοστά | Ώρες | Γενικά+Αποθ. | Ασανσέρ | Πάγιο Θέρμ. | Ωρομέτρηση | Στρογγ. | Προηγ. Υπόλ. | Πληρωτέο |\n`;
    md += `|:---|:---|---:|---:|---:|---:|---:|---:|---:|---:|---:|\n`;
    lastCalcResult.breakdown.forEach((b) => {
      const signR = b.roundingAdjustment > 0 ? '+' : '';
      md += `| ${b.name} | ${b.owner} | ${b.milliemesTotal}‰ | ${b.heatingHours}h | ${(b.generalShare + b.reserveShare).toFixed(2)}€ | ${b.elevatorShare.toFixed(2)}€ | ${b.heatingFixedShare.toFixed(2)}€ | ${b.heatingVariableShare.toFixed(2)}€ | ${signR}${b.roundingAdjustment.toFixed(2)}€ | ${b.priorBalance.toFixed(2)}€ | **${b.totalToPay.toFixed(2)}€** |\n`;
    });
    md += `\n---\n*Υπολογισμός βάσει Π.Δ. 27.9/7.11.1985 (ΦΕΚ 631 Δ'). Praktika GR.*\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `koinochrista-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function initAssemblyTab() {
    if (!currentAssemblyData) return;
    const tbody = document.getElementById('assemblyAttendanceBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    currentAssemblyData.attendance.forEach((att, idx) => {
      const tr = document.createElement('tr');

      const tdApt = document.createElement('td');
      tdApt.className = 'cell-bold';
      tdApt.textContent = att.apt;

      const tdOwner = document.createElement('td');
      tdOwner.textContent = att.owner;

      const tdMil = document.createElement('td');
      tdMil.className = 'num';
      tdMil.textContent = `${att.milliemes}‰`;

      const tdPres = document.createElement('td');
      tdPres.className = 'cell-center';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = Boolean(att.present);
      cb.setAttribute('aria-label', `Παρουσία ${att.apt}`);
      cb.addEventListener('change', () => {
        currentAssemblyData.attendance[idx].present = cb.checked;
        saveDraftState();
        renderAssemblyMinutes();
      });
      tdPres.appendChild(cb);

      const tdVote = document.createElement('td');
      const sel = document.createElement('select');
      sel.className = 'input-select input-select-compact';
      sel.setAttribute('aria-label', `Ψήφος ${att.apt}`);
      [
        ['FOR', 'Υπέρ'],
        ['AGAINST', 'Κατά'],
        ['ABSTAIN', 'Λευκό']
      ].forEach(([val, label]) => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = label;
        if (att.vote === val) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', () => {
        currentAssemblyData.attendance[idx].vote = sel.value;
        saveDraftState();
        renderAssemblyMinutes();
      });
      tdVote.appendChild(sel);

      tr.appendChild(tdApt);
      tr.appendChild(tdOwner);
      tr.appendChild(tdMil);
      tr.appendChild(tdPres);
      tr.appendChild(tdVote);
      tbody.appendChild(tr);
    });

    renderAssemblyMinutes();
  }

  function renderAssemblyMinutes() {
    if (!window.praktikaEngine || !currentAssemblyData) return;
    const evalQuorum = window.praktikaEngine.evaluateQuorum(currentAssemblyData);

    const elDisplay = document.getElementById('quorumMilliemesDisplay');
    const elBadge = document.getElementById('quorumStatusBadge');
    const elBox = document.getElementById('quorumBox');

    if (elDisplay) elDisplay.innerText = `${evalQuorum.totalPresentMilliemes} / 1000`;
    if (elBox) elBox.classList.toggle('is-failed', !evalQuorum.hasQuorum501);
    if (elBadge) {
      elBadge.classList.toggle('is-failed', !evalQuorum.hasQuorum501);
      elBadge.innerText = evalQuorum.hasQuorum501
        ? `ΝΟΜΙΜΗ ΑΠΑΡΤΙΑ (${evalQuorum.totalPresentMilliemes}‰)`
        : `ΑΠΟΥΣΙΑ ΑΠΑΡΤΙΑΣ (${evalQuorum.totalPresentMilliemes}‰ < 501‰)`;
    }

    const minutesMd = window.praktikaEngine.generateAssemblyMinutes(currentAssemblyData);
    const out = document.getElementById('assemblyMinutesOutput');
    if (out) out.innerText = minutesMd;
  }

  function initNoticesTab() {
    const select = document.getElementById('noticeAptSelect');
    if (!select || !lastCalcResult || !lastCalcResult.breakdown) return;
    const prev = select.value;
    select.innerHTML = '';
    lastCalcResult.breakdown.forEach((b) => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.innerText = `${b.name} (${b.owner}) — ${b.totalToPay.toFixed(2)} €`;
      select.appendChild(opt);
    });
    if (prev && Array.from(select.options).some((o) => o.value === prev)) {
      select.value = prev;
    }
    renderExpenseNotice();
  }

  function renderExpenseNotice() {
    const select = document.getElementById('noticeAptSelect');
    if (!select || !lastCalcResult) return;
    const aptId = select.value || (lastCalcResult.breakdown[0] && lastCalcResult.breakdown[0].id);
    const md = window.praktikaEngine.generateExpenseNoticeMarkdown(lastCalcResult, aptId);
    const out = document.getElementById('expenseNoticeOutput');
    if (out) out.innerText = md;
  }

  function initWaitlistForm() {
    const wf = document.getElementById('proWaitlistForm');
    if (!wf) return;
    wf.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailEl = document.getElementById('proWaitlistEmail');
      const consentEl = document.getElementById('proWaitlistConsent');
      const msgEl = document.getElementById('proWaitlistMsg');
      if (!emailEl || !emailEl.value.trim()) return;
      if (!consentEl || !consentEl.checked) {
        if (msgEl) msgEl.textContent = 'Απαιτείται η ρητή συγκατάθεσή σας (επιλέξτε το πλαίσιο) πριν την εγγραφή.';
        return;
      }
      const endpoint = (wf.dataset.endpoint || '').trim();
      const project = (wf.dataset.project || 'praktika-gr').trim();
      if (!endpoint) return;
      if (msgEl) msgEl.textContent = 'Αποστολή...';
      try {
        const adviceEl = document.getElementById('proWaitlistAdvice');
        const adviceVal = adviceEl ? adviceEl.value : '';
        const consentText = consentEl.parentElement ? consentEl.parentElement.innerText.trim().slice(0, 300) : '';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            email: emailEl.value.trim(),
            project,
            advice_focus: adviceVal,
            consent: true,
            consent_text: consentText,
            consent_ts: new Date().toISOString()
          })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (msgEl) msgEl.textContent = 'Ευχαριστούμε! Καταχωρηθήκατε επιτυχώς στη λίστα αναμονής.';
        emailEl.value = '';
        consentEl.checked = false;
      } catch (err) {
        if (msgEl) msgEl.textContent = 'Σφάλμα αποστολής. Δοκιμάστε ξανά αργότερα.';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const restored = tryLoadDraftState();
    if (!restored && window.SAMPLE_BUILDINGS) {
      currentBuildingData = JSON.parse(JSON.stringify(window.SAMPLE_BUILDINGS.standard_8_apt));
      currentAssemblyData = JSON.parse(JSON.stringify(window.SAMPLE_BUILDINGS.annual_assembly.assemblyInfo));
    }

    syncPoolInputsFromData();
    calculateAndRenderExpenses(!restored);
    initAssemblyTab();
    initWaitlistForm();
    if (restored) {
      setStorageStatus('Επαναφέρθηκε το αποθηκευμένο τοπικό προσχέδιο (cl_p5_v1).');
    }

    document.getElementById('tabBtn-expenses')?.addEventListener('click', () => switchTab('expenses'));
    document.getElementById('tabBtn-assembly')?.addEventListener('click', () => switchTab('assembly'));
    document.getElementById('tabBtn-notices')?.addEventListener('click', () => switchTab('notices'));

    document.getElementById('presetStandardBtn')?.addEventListener('click', () => loadExpensePreset('standard_8_apt'));
    document.getElementById('recalcBtn')?.addEventListener('click', calculateAndRenderExpenses);
    document.getElementById('applyFuelCalcBtn')?.addEventListener('click', applyFuelInventoryCalculation);
    ['inputGeneral', 'inputElevator', 'inputHeating', 'inputReserve', 'inputFuelOpening', 'inputFuelPurchases', 'inputFuelClosing'].forEach((id) => {
      document.getElementById(id)?.addEventListener('change', calculateAndRenderExpenses);
    });
    document.getElementById('exportExpensesMdBtn')?.addEventListener('click', exportExpensesMarkdown);
    document.getElementById('exportJsonBtn')?.addEventListener('click', exportJsonState);
    document.getElementById('importJsonBtn')?.addEventListener('click', () => {
      document.getElementById('importJsonInput')?.click();
    });
    document.getElementById('importJsonInput')?.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) importJsonState(f);
      e.target.value = '';
    });
    document.getElementById('clearStorageBtn')?.addEventListener('click', clearDraftState);
    document.getElementById('printExpensesBtn')?.addEventListener('click', () => window.print());

    document.getElementById('copyMinutesBtn')?.addEventListener('click', () => {
      const text = document.getElementById('assemblyMinutesOutput')?.innerText || '';
      copyTextToClipboard(text).then(() => {
        const span = document.getElementById('copyMinutesBtnText');
        if (span) {
          span.innerText = 'Αντιγράφηκε!';
          setTimeout(() => { span.innerText = 'Αντιγραφή'; }, 2000);
        }
      });
    });
    document.getElementById('printMinutesBtn')?.addEventListener('click', () => window.print());

    document.getElementById('noticeAptSelect')?.addEventListener('change', renderExpenseNotice);
    document.getElementById('copyNoticeBtn')?.addEventListener('click', () => {
      const text = document.getElementById('expenseNoticeOutput')?.innerText || '';
      copyTextToClipboard(text).then(() => {
        const span = document.getElementById('copyNoticeBtnText');
        if (span) {
          span.innerText = 'Αντιγράφηκε!';
          setTimeout(() => { span.innerText = 'Αντιγραφή Markdown'; }, 2000);
        }
      });
    });
    document.getElementById('printNoticeBtn')?.addEventListener('click', () => window.print());
  });
})();
