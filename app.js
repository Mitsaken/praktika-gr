/**
 * Praktika GR - Building Management & General Assembly Minutes Controller
 * 100% Client-Side, Zero External CDN Dependencies, Strict CSP Compliant
 */

(function () {
  'use strict';

  // State
  let currentBuildingData = null;
  let currentAssemblyData = null;
  let lastCalcResult = null;
  let activeTab = 'expenses';

  // SVG Icons Helper (Zero External CDN)
  const ICONS = {
    check: '<svg class="icon icon-sm text-emerald" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    copy: '<svg class="icon icon-sm" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>'
  };

  // Robust Clipboard Helper
  function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopyTextToClipboard(text));
    }
    return fallbackCopyTextToClipboard(text);
  }

  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((resolve, reject) => {
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        successful ? resolve() : reject(new Error('execCommand failed'));
      } catch (err) {
        document.body.removeChild(textArea);
        reject(err);
      }
    });
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    if (window.SAMPLE_BUILDINGS) {
      currentBuildingData = JSON.parse(JSON.stringify(window.SAMPLE_BUILDINGS.standard_8_apt));
      currentAssemblyData = JSON.parse(JSON.stringify(window.SAMPLE_BUILDINGS.annual_assembly.assemblyInfo));
    }
    window.calculateAndRenderExpenses();
    window.initAssemblyTab();
    window.initNoticesTab();

    // Restore Theme
    try {
      if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light');
      }
    } catch (e) {}

    // Modal click outside & escape
    const proModal = document.getElementById('proModal');
    if (proModal) {
      proModal.addEventListener('click', (e) => {
        if (e.target === proModal) window.closeProModal();
      });
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') window.closeProModal();
    });
  });

  // Switch Navigation Tabs
  window.switchTab = function (tabId) {
    activeTab = tabId;
    const tabs = ['expenses', 'assembly', 'notices'];
    tabs.forEach(t => {
      const btn = document.getElementById(`tabBtn-${t}`);
      const content = document.getElementById(`tabContent-${t}`);
      if (btn) {
        if (t === tabId) {
          btn.className = "tab-btn active";
        } else {
          btn.className = "tab-btn";
        }
      }
      if (content) {
        if (t === tabId) {
          content.classList.remove('hidden');
          content.classList.add('flex');
        } else {
          content.classList.add('hidden');
          content.classList.remove('flex');
        }
      }
    });
  };

  // 1. Calculate & Render Expenses
  window.calculateAndRenderExpenses = function () {
    if (!window.praktikaEngine || !currentBuildingData) return;
    lastCalcResult = window.praktikaEngine.calculateExpenses(currentBuildingData);
    const totals = lastCalcResult.totals;

    const elGen = document.getElementById('sumGeneral');
    const elElev = document.getElementById('sumElevator');
    const elHeat = document.getElementById('sumHeating');
    const elGrand = document.getElementById('sumGrandTotal');

    if (elGen) elGen.innerText = `${totals.generalExp.toFixed(2)} €`;
    if (elElev) elElev.innerText = `${totals.elevatorExp.toFixed(2)} €`;
    if (elHeat) elHeat.innerText = `${totals.heatingTotal.toFixed(2)} €`;
    if (elGrand) elGrand.innerText = `${totals.grandTotal.toFixed(2)} €`;

    const tbody = document.getElementById('expensesTableBody');
    if (tbody) {
      tbody.innerHTML = '';
      lastCalcResult.breakdown.forEach((item) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="padding: 0.75rem 1rem;">
            <strong style="color: var(--text-main); display: block;">${item.name}</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">${item.owner}</span>
          </td>
          <td style="padding: 0.75rem 0.75rem; font-family: var(--font-mono);">${item.milliemesTotal}‰</td>
          <td style="padding: 0.75rem 0.75rem; font-family: var(--font-mono); color: var(--blue-light); font-weight: 600;">${item.heatingHours} h</td>
          <td style="padding: 0.75rem 0.75rem; font-family: var(--font-mono);">${item.generalShare.toFixed(2)} €</td>
          <td style="padding: 0.75rem 0.75rem; font-family: var(--font-mono);">${item.elevatorShare.toFixed(2)} €</td>
          <td style="padding: 0.75rem 0.75rem; font-family: var(--font-mono);">${item.heatingFixedShare.toFixed(2)} €</td>
          <td style="padding: 0.75rem 0.75rem; font-family: var(--font-mono);">${item.heatingVariableShare.toFixed(2)} €</td>
          <td style="padding: 0.75rem 1rem; font-family: var(--font-mono); font-weight: 700; text-align: right; color: var(--emerald); font-size: 0.9375rem;">${item.totalToPay.toFixed(2)} €</td>
        `;
        tbody.appendChild(tr);
      });
    }

    window.initNoticesTab();
  };

  // Load Preset
  window.loadExpensePreset = function (presetKey) {
    if (!window.SAMPLE_BUILDINGS || !window.SAMPLE_BUILDINGS[presetKey]) return;
    currentBuildingData = JSON.parse(JSON.stringify(window.SAMPLE_BUILDINGS[presetKey]));
    window.calculateAndRenderExpenses();
  };

  // Export Expenses Markdown
  window.exportExpensesMarkdown = function () {
    if (!lastCalcResult) return;
    let md = `# Πίνακας Κοινοχρήστων & Αυτόνομης Θέρμανσης (Π.Δ. 1985)\n\n`;
    md += `> **Πολυκατοικία:** ${lastCalcResult.buildingInfo.address}  \n`;
    md += `> **Μήνας/Περίοδος:** ${lastCalcResult.buildingInfo.period}  \n`;
    md += `> **Συνολική Δαπάνη Πολυκατοικίας:** ${lastCalcResult.totals.grandTotal.toFixed(2)} €  \n\n`;
    md += `| Διαμέρισμα | Ιδιοκτήτης | Χιλιοστά | Ώρες | Γενικά | Ασανσέρ | Πάγιο Θέρμ. | Ωρομέτρηση | Σύνολο |\n`;
    md += `|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n`;
    lastCalcResult.breakdown.forEach(b => {
      md += `| ${b.name} | ${b.owner} | ${b.milliemesTotal}‰ | ${b.heatingHours}h | ${b.generalShare.toFixed(2)}€ | ${b.elevatorShare.toFixed(2)}€ | ${b.heatingFixedShare.toFixed(2)}€ | ${b.heatingVariableShare.toFixed(2)}€ | **${b.totalToPay.toFixed(2)}€** |\n`;
    });
    md += `\n---\n*Υπολογισμός βάσει του Π.Δ. 27.9/7.11.1985 (ΦΕΚ 631 Δ'). Πρακτικά GR.*`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `koinochrista-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 2. Assembly Tab Logic
  window.initAssemblyTab = function () {
    if (!currentAssemblyData) return;
    const tbody = document.getElementById('assemblyAttendanceBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    currentAssemblyData.attendance.forEach((att, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding: 0.625rem 0.75rem; font-weight: 700; color: var(--text-main);">${att.apt}</td>
        <td style="padding: 0.625rem 0.75rem; color: var(--text-secondary);">${att.owner}</td>
        <td style="padding: 0.625rem 0.5rem; font-family: var(--font-mono); color: var(--text-muted);">${att.milliemes}‰</td>
        <td style="padding: 0.625rem 0.5rem; text-align: center;">
          <input type="checkbox" ${att.present ? 'checked' : ''} onchange="window.togglePresent(${idx})" style="cursor: pointer;">
        </td>
        <td style="padding: 0.625rem 0.75rem;">
          <select onchange="window.updateVote(${idx}, this.value)" style="background: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-main); border-radius: var(--radius-sm); padding: 0.25rem 0.5rem; font-size: 0.75rem;">
            <option value="FOR" ${att.vote === 'FOR' ? 'selected' : ''}>Υπέρ</option>
            <option value="AGAINST" ${att.vote === 'AGAINST' ? 'selected' : ''}>Κατά</option>
            <option value="ABSTAIN" ${att.vote === 'ABSTAIN' ? 'selected' : ''}>Λευκό</option>
          </select>
        </td>
      `;
      tbody.appendChild(tr);
    });

    window.renderAssemblyMinutes();
  };

  window.togglePresent = function (idx) {
    if (currentAssemblyData && currentAssemblyData.attendance[idx]) {
      currentAssemblyData.attendance[idx].present = !currentAssemblyData.attendance[idx].present;
      window.renderAssemblyMinutes();
    }
  };

  window.updateVote = function (idx, val) {
    if (currentAssemblyData && currentAssemblyData.attendance[idx]) {
      currentAssemblyData.attendance[idx].vote = val;
      window.renderAssemblyMinutes();
    }
  };

  window.renderAssemblyMinutes = function () {
    if (!window.praktikaEngine || !currentAssemblyData) return;
    const evalQuorum = window.praktikaEngine.evaluateQuorum(currentAssemblyData);
    
    const elDisplay = document.getElementById('quorumMilliemesDisplay');
    const elBadge = document.getElementById('quorumStatusBadge');

    if (elDisplay) {
      elDisplay.innerText = `${evalQuorum.totalPresentMilliemes} / 1000`;
    }

    if (elBadge) {
      if (evalQuorum.hasQuorum501) {
        elBadge.innerText = `✅ ΝΟΜΙΜΗ ΑΠΑΡΤΙΑ (${evalQuorum.totalPresentMilliemes}‰)`;
        elBadge.className = "text-xs font-semibold text-emerald block";
      } else {
        elBadge.innerText = `❌ ΑΠΟΥΣΙΑ ΑΠΑΡΤΙΑΣ (${evalQuorum.totalPresentMilliemes}‰ < 501‰)`;
        elBadge.className = "text-xs font-semibold text-rose block";
      }
    }

    const minutesMd = window.praktikaEngine.generateAssemblyMinutes(currentAssemblyData);
    const outputEl = document.getElementById('assemblyMinutesOutput');
    if (outputEl) {
      outputEl.innerText = minutesMd;
    }
  };

  window.copyAssemblyMinutes = function () {
    const outputEl = document.getElementById('assemblyMinutesOutput');
    if (!outputEl) return;
    copyTextToClipboard(outputEl.innerText).then(() => {
      const btn = document.getElementById('copyMinutesBtnText');
      if (btn) {
        btn.innerText = 'Αντιγράφηκε!';
        setTimeout(() => { btn.innerText = 'Αντιγραφή'; }, 2000);
      }
    });
  };

  // 3. Notices Tab Logic
  window.initNoticesTab = function () {
    const select = document.getElementById('noticeAptSelect');
    if (!select || !lastCalcResult || !lastCalcResult.breakdown) return;
    select.innerHTML = '';
    lastCalcResult.breakdown.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.innerText = `${b.name} (${b.owner}) - ${b.totalToPay.toFixed(2)} €`;
      select.appendChild(opt);
    });
    window.renderExpenseNotice();
  };

  window.renderExpenseNotice = function () {
    const select = document.getElementById('noticeAptSelect');
    if (!select || !lastCalcResult) return;
    const aptId = select.value || (lastCalcResult.breakdown[0] && lastCalcResult.breakdown[0].id);
    const md = window.praktikaEngine.generateExpenseNoticeMarkdown(lastCalcResult, aptId);
    const el = document.getElementById('expenseNoticeOutput');
    if (el) el.innerText = md;
  };

  window.copyNoticeMarkdown = function () {
    const el = document.getElementById('expenseNoticeOutput');
    if (!el) return;
    copyTextToClipboard(el.innerText).then(() => {
      const btn = document.getElementById('copyNoticeBtnText');
      if (btn) {
        btn.innerText = 'Αντιγράφηκε!';
        setTimeout(() => { btn.innerText = 'Αντιγραφή Markdown'; }, 2000);
      }
    });
  };

  // Pro Modal
  window.openProModal = function () {
    const m = document.getElementById('proModal');
    if (m) {
      m.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeProModal = function () {
    const m = document.getElementById('proModal');
    if (m) {
      m.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };

  // Theme Toggle
  window.toggleTheme = function () {
    const isLight = document.body.classList.toggle('light');
    try {
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    } catch (e) {}
  };

})();
