/**
 * Praktika GR - Building Management & General Assembly Minutes Engine v1.0
 * 100% Client-Side, Zero Marginal Cost Greek Apartment Building Manager
 * Standards & Law Ref:
 * - Π.Δ. 27.9/7.11.1985 (ΦΕΚ 631 Δ') - Κατανομή Δαπανών Κεντρικής & Αυτόνομης Θέρμανσης
 * - Ν. 3741/1929 "Περί της ιδιοκτησίας κατ' ορόφους" & Αστικός Κώδικας Άρθρα 1002, 1117
 * - Ν. 4495/2017 (Πλειοψηφίες ενεργειακής αναβάθμισης & ανελκυστήρα)
 */

// Sample Datasets for 1-Click Verification
const SAMPLE_BUILDINGS = {
  standard_8_apt: {
    name: "Πολυκατοικία 8 Διαμερισμάτων (Αυτόνομη Θέρμανση)",
    description: "Τυπική αθηναϊκή πολυκατοικία με 8 διαμερίσματα, αυτόνομη θέρμανση πετρελαίου/αερίου με ωρομετρητές, ανελκυστήρα και αποθεματικό ταμείο.",
    buildingInfo: {
      address: "Ιπποκράτους 124, 11472, Αθήνα",
      managerName: "Γεώργιος Παπαδόπουλος (Διαμ. Α2)",
      period: "Νοέμβριος 2026",
      reserveFundGoal: 1500, // Στόχος αποθεματικού
      currentReserve: 850
    },
    apartments: [
      { id: "ισογειο", name: "Ισόγειο Κατάστημα (ΙΣ-1)", owner: "Ελένη Δημητρίου", milliemesTotal: 120, milliemesElevator: 0, milliemesHeating: 0, heatingHours: 0, heatingCoeffFi: 0.20 },
      { id: "α1", name: "Διαμέρισμα Α1 (1ος)", owner: "Νικόλαος Κωνσταντίνου", milliemesTotal: 110, milliemesElevator: 80, milliemesHeating: 130, heatingHours: 25, heatingCoeffFi: 0.25 },
      { id: "α2", name: "Διαμέρισμα Α2 (1ος)", owner: "Γεώργιος Παπαδόπουλος", milliemesTotal: 115, milliemesElevator: 85, milliemesHeating: 135, heatingHours: 32, heatingCoeffFi: 0.25 },
      { id: "β1", name: "Διαμέρισμα Β1 (2ος)", owner: "Μαρία Αλεξίου", milliemesTotal: 125, milliemesElevator: 120, milliemesHeating: 140, heatingHours: 40, heatingCoeffFi: 0.25 },
      { id: "β2", name: "Διαμέρισμα Β2 (2ος)", owner: "Ιωάννης Σταματίου", milliemesTotal: 130, milliemesElevator: 125, milliemesHeating: 145, heatingHours: 18, heatingCoeffFi: 0.25 },
      { id: "γ1", name: "Διαμέρισμα Γ1 (3ος)", owner: "Κωνσταντίνος Λεβέντης", milliemesTotal: 130, milliemesElevator: 180, milliemesHeating: 145, heatingHours: 55, heatingCoeffFi: 0.30 },
      { id: "γ2", name: "Διαμέρισμα Γ2 (3ος)", owner: "Σοφία Οικονόμου", milliemesTotal: 135, milliemesElevator: 190, milliemesHeating: 150, heatingHours: 48, heatingCoeffFi: 0.30 },
      { id: "δ1", name: "Ρετιρέ Δ1 (4ος)", owner: "Ανδρέας Βασιλείου", milliemesTotal: 135, milliemesElevator: 220, milliemesHeating: 155, heatingHours: 62, heatingCoeffFi: 0.35 }
    ],
    expenses: {
      general: 220, // Καθαριότητα, ΔΕΗ κοινοχρήστων, ΕΥΔΑΠ
      elevator: 140, // Συντήρηση ανελκυστήρα & πιστοποιητικό
      heatingTotal: 780, // Συνολικό κόστος καυσίμου θέρμανσης
      heatingFixedPercentage: 30, // Πάγιο θέρμανσης % (Π.Δ. 1985 default 30% ή βάσει μελέτης)
      reserveContribution: 100, // Μηνιαία εισφορά αποθεματικού
      fuelOpeningEur: 0,
      fuelPurchasesEur: 0,
      fuelClosingEur: 0
    }
  },

  annual_assembly: {
    name: "Τακτική Ετήσια Γενική Συνέλευση (Εκλογή Διαχειριστή)",
    description: "Πλήρης φάκελος σύγκλησης: Πρόσκληση, υπολογισμός απαρτίας 650/1000, ψηφοφορία για νέο διαχειριστή και ρήτρα απαλλαγής απερχόμενου.",
    assemblyInfo: {
      buildingAddress: "Σόλωνος 88, 10680, Αθήνα",
      date: "15 Νοεμβρίου 2026",
      time: "19:30",
      location: "Είσοδος Πολυκατοικίας",
      outgoingManager: "Δημήτριος Μανώλης",
      candidateManager: "Αικατερίνη Ζέρβα",
      agendaTopics: [
        "Οικονομικός απολογισμός διαχειριστικής περιόδου 2025-2026 & έγκριση εσόδων-εξόδων.",
        "Απαλλαγή απερχόμενου διαχειριστή από κάθε ευθύνη και παράδοση ταμείου/βιβλίων.",
        "Εκλογή νέου διαχειριστή για την περίοδο 2026-2027.",
        "Καθορισμός μηνιαίας εισφοράς αποθεματικού ταμείου για έκτακτες ανάγκες."
      ],
      attendance: [
        { apt: "Α1", owner: "Χρήστος Γεωργίου", milliemes: 150, present: true, vote: "FOR" },
        { apt: "Α2", owner: "Δημήτριος Μανώλης", milliemes: 160, present: true, vote: "FOR" },
        { apt: "Β1", owner: "Αικατερίνη Ζέρβα", milliemes: 180, present: true, vote: "FOR" },
        { apt: "Β2", owner: "Σπυρίδων Νικολάου", milliemes: 170, present: false, vote: "ABSENT" },
        { apt: "Γ1", owner: "Παναγιώτα Ράλλη", milliemes: 170, present: true, vote: "FOR" },
        { apt: "Δ1", owner: "Μιχαήλ Θεοδώρου", milliemes: 170, present: true, vote: "ABSTAIN" }
      ]
    }
  }
};

class PraktikaEngine {
  constructor() {
    this.pdLaw = "Π.Δ. 27.9/7.11.1985 (ΦΕΚ 631 Δ')";
  }

  _safeNum(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  roundCents(v) {
    return Math.round((this._safeNum(v, 0) + Number.EPSILON) * 100) / 100;
  }

  /**
   * Optional Oil/Fuel Tank Inventory Calculator:
   * Period Heating Consumed (€) = max(0, Opening Stock + New Refill Purchases - Closing Stock)
   */
  computeHeatingFuelConsumed(openingEur, purchasesEur, closingEur) {
    const open = Math.max(0, this._safeNum(openingEur, 0));
    const buy = Math.max(0, this._safeNum(purchasesEur, 0));
    const close = Math.max(0, this._safeNum(closingEur, 0));
    return Math.max(0, this.roundCents(open + buy - close));
  }

  /**
   * 1. Calculate Common & Heating Expenses
   * Implements exact formula of Presidential Decree 1985 for autonomous heating with hours/meters:
   * - Total Heating = Fixed (Πάγιο) + Consumption (Κατανάλωση)
   * - Fixed Portion = Total Heating * (fi_percent / 100)
   *   Distributed by milliemes of heating (or thermal study milliemes)
   * - Variable Portion = Total Heating * (1 - fi_percent / 100)
   *   Distributed by recorded hours/units: (apt_hours * apt_thermal_coeff) / sum(all_hours * coeff)
   */
  calculateExpenses(buildingData) {
    const apts = (buildingData && Array.isArray(buildingData.apartments)) ? buildingData.apartments : [];
    const exp = (buildingData && buildingData.expenses) ? buildingData.expenses : {};

    const totalMilliemes = apts.reduce((sum, a) => sum + Math.max(0, this._safeNum(a.milliemesTotal, 0)), 0);
    const totalElevatorMilliemes = apts.reduce((sum, a) => sum + Math.max(0, this._safeNum(a.milliemesElevator, 0)), 0);
    const totalHeatingMilliemes = apts.reduce((sum, a) => sum + Math.max(0, this._safeNum(a.milliemesHeating, 0)), 0);
    const activeHeatingMilliemes = apts.reduce((sum, a) => {
      const st = a.heatingStatus || "active";
      return st === "disconnected" ? sum : sum + Math.max(0, this._safeNum(a.milliemesHeating, 0));
    }, 0);

    const generalExp = Math.max(0, this._safeNum(exp.general, 0));
    const elevatorExp = Math.max(0, this._safeNum(exp.elevator, 0));
    const heatingTotal = Math.max(0, this._safeNum(exp.heatingTotal, 0));
    const reserveExp = Math.max(0, this._safeNum(exp.reserveContribution, 0));

    // Heating Decomposition according to P.D. 1985 (millimes remain strictly unaltered)
    const rawPct = this._safeNum(exp.heatingFixedPercentage, 30);
    const fixedPercent = Math.min(100, Math.max(0, rawPct)) / 100;
    const heatingFixedPool = heatingTotal * fixedPercent;
    const heatingVariablePool = heatingTotal * (1 - fixedPercent);

    // Sum of weighted hours: Σ(εi * hi), excluding vacant and N. 4495/2017 disconnected units
    let totalWeightedHours = 0;
    apts.forEach(a => {
      const st = a.heatingStatus || "active";
      if (st === "disconnected" || st === "vacant") return;
      const hours = Math.max(0, this._safeNum(a.heatingHours, 0));
      const coeff = Math.max(0, this._safeNum(a.heatingCoeffFi, 1.0));
      totalWeightedHours += (hours * coeff);
    });

    const rawRows = apts.map((apt, idx) => {
      const st = (apt.heatingStatus === "vacant" || apt.heatingStatus === "disconnected") ? apt.heatingStatus : "active";
      const mTot = Math.max(0, this._safeNum(apt.milliemesTotal, 0));
      const mElev = Math.max(0, this._safeNum(apt.milliemesElevator, 0));
      const mHeat = Math.max(0, this._safeNum(apt.milliemesHeating, 0));
      const hours = (st === "disconnected" || st === "vacant") ? 0 : Math.max(0, this._safeNum(apt.heatingHours, 0));
      const coeff = Math.max(0, this._safeNum(apt.heatingCoeffFi, 1.0));
      const priorBalance = this.roundCents(this._safeNum(apt.priorBalance, 0));

      const generalExact = totalMilliemes > 0 ? (generalExp * (mTot / totalMilliemes)) : 0;
      const reserveExact = totalMilliemes > 0 ? (reserveExp * (mTot / totalMilliemes)) : 0;
      const elevatorExact = totalElevatorMilliemes > 0 ? (elevatorExp * (mElev / totalElevatorMilliemes)) : 0;
      const heatingFixedExact = (st !== "disconnected" && activeHeatingMilliemes > 0) ? (heatingFixedPool * (mHeat / activeHeatingMilliemes)) : 0;
      const aptWeightedHours = hours * coeff;
      const heatingVariableExact = (st === "active" && totalWeightedHours > 0) ? (heatingVariablePool * (aptWeightedHours / totalWeightedHours)) : 0;

      const exactMonthly = generalExact + reserveExact + elevatorExact + heatingFixedExact + heatingVariableExact;
      const exactCents = Math.max(0, exactMonthly * 100);
      const floorCents = Math.floor(exactCents + 1e-9);

      const generalShare = this.roundCents(generalExact);
      const reserveShare = this.roundCents(reserveExact);
      const elevatorShare = this.roundCents(elevatorExact);
      const heatingFixedShare = this.roundCents(heatingFixedExact);
      const heatingVariableShare = this.roundCents(heatingVariableExact);

      return {
        idx,
        id: apt.id,
        name: apt.name,
        owner: apt.owner,
        heatingStatus: st,
        milliemesTotal: mTot,
        milliemesElevator: mElev,
        milliemesHeating: mHeat,
        heatingHours: hours,
        priorBalance,
        generalShare,
        reserveShare,
        elevatorShare,
        heatingFixedShare,
        heatingVariableShare,
        exactMonthly,
        floorCents,
        remainder: exactCents - floorCents
      };
    });

    // Hamilton / Largest-Remainder cent reconciliation against active distributed EUR total
    const activePoolSum =
      (totalMilliemes > 0 ? (generalExp + reserveExp) : 0) +
      (totalElevatorMilliemes > 0 ? elevatorExp : 0) +
      (activeHeatingMilliemes > 0 ? heatingFixedPool : 0) +
      (totalWeightedHours > 0 ? heatingVariablePool : 0);
    const targetCents = Math.round((activePoolSum + Number.EPSILON) * 100);
    const floorSum = rawRows.reduce((s, r) => s + r.floorCents, 0);
    const deficit = targetCents - floorSum;
    const allocatedCents = rawRows.map(r => r.floorCents);

    if (rawRows.length > 0 && deficit > 0) {
      const order = [...rawRows].sort((a, b) =>
        (b.remainder - a.remainder) ||
        (b.milliemesTotal - a.milliemesTotal) ||
        (a.idx - b.idx)
      );
      for (let k = 0; k < deficit; k++) {
        allocatedCents[order[k % order.length].idx] += 1;
      }
    } else if (rawRows.length > 0 && deficit < 0) {
      const order = [...rawRows].sort((a, b) =>
        (a.remainder - b.remainder) ||
        (a.idx - b.idx)
      );
      for (let k = 0; k < Math.abs(deficit); k++) {
        const targetIdx = order[k % order.length].idx;
        if (allocatedCents[targetIdx] > 0) allocatedCents[targetIdx] -= 1;
      }
    }

    const breakdown = rawRows.map((r, idx) => {
      const monthlyTotal = this.roundCents(allocatedCents[idx] / 100);
      const displayedSum = this.roundCents(
        r.generalShare + r.reserveShare + r.elevatorShare + r.heatingFixedShare + r.heatingVariableShare
      );
      const roundingAdjustment = this.roundCents(monthlyTotal - displayedSum);
      const heatingTotalShare = this.roundCents(r.heatingFixedShare + r.heatingVariableShare);
      const totalToPay = this.roundCents(monthlyTotal + r.priorBalance);
      const ownerShare = (r.heatingStatus === "vacant")
        ? monthlyTotal
        : Math.min(monthlyTotal, this.roundCents(r.reserveShare));
      const tenantShare = this.roundCents(monthlyTotal - ownerShare);

      return {
        id: r.id,
        name: r.name,
        owner: r.owner,
        heatingStatus: r.heatingStatus,
        milliemesTotal: r.milliemesTotal,
        milliemesElevator: r.milliemesElevator,
        milliemesHeating: r.milliemesHeating,
        heatingHours: r.heatingHours,
        generalShare: r.generalShare,
        elevatorShare: r.elevatorShare,
        heatingFixedShare: r.heatingFixedShare,
        heatingVariableShare: r.heatingVariableShare,
        heatingTotalShare,
        reserveShare: r.reserveShare,
        ownerShare,
        tenantShare,
        roundingAdjustment,
        monthlyTotal,
        priorBalance: r.priorBalance,
        totalToPay
      };
    });

    const sumMonthlyCalculated = this.roundCents(breakdown.reduce((sum, b) => sum + b.monthlyTotal, 0));
    const totalPriorBalance = this.roundCents(breakdown.reduce((sum, b) => sum + b.priorBalance, 0));
    const sumRoundingAdjustments = this.roundCents(breakdown.reduce((sum, b) => sum + b.roundingAdjustment, 0));
    const sumTotalCalculated = this.roundCents(breakdown.reduce((sum, b) => sum + b.totalToPay, 0));
    const milliemesValid = Math.abs(totalMilliemes - 1000) < 0.01;
    const elevatorValid = Math.abs(totalElevatorMilliemes - 1000) < 0.01;
    const heatingMilliemesValid = Math.abs(totalHeatingMilliemes - 1000) < 0.01;

    return {
      buildingInfo: buildingData.buildingInfo || {},
      totals: {
        totalMilliemes,
        totalElevatorMilliemes,
        totalHeatingMilliemes,
        milliemesValid,
        elevatorValid,
        heatingMilliemesValid,
        totalWeightedHours: Math.round(totalWeightedHours * 100) / 100,
        generalExp,
        elevatorExp,
        heatingTotal,
        heatingFixedPool: this.roundCents(heatingFixedPool),
        heatingVariablePool: this.roundCents(heatingVariablePool),
        reserveExp,
        grandTotal: this.roundCents(generalExp + elevatorExp + heatingTotal + reserveExp),
        sumMonthlyCalculated,
        totalPriorBalance,
        sumRoundingAdjustments,
        sumTotalCalculated
      },
      breakdown
    };
  }

  /**
   * 2. Quorum & Voting Calculator for General Assembly
   */
  evaluateQuorum(assemblyData) {
    const attendance = assemblyData.attendance || [];
    let presentMilliemes = 0;
    let votesFor = 0;
    let votesAgainst = 0;
    let votesAbstain = 0;

    attendance.forEach(a => {
      const m = Number(a.milliemes) || 0;
      if (a.present) {
        presentMilliemes += m;
        if (a.vote === "FOR") votesFor += m;
        else if (a.vote === "AGAINST") votesAgainst += m;
        else votesAbstain += m;
      }
    });

    // Standard Greek Quorum Rules:
    // First assembly: >= 501/1000
    // Major decisions (e.g. autonomy, renovation N. 4495/2017): >= 501 or 651/1000
    const hasQuorum501 = presentMilliemes >= 501;
    const hasQuorum651 = presentMilliemes >= 651;

    let quorumStatus = "ΕΠΙΤΕΥΧΘΗΚΕ ΑΠΑΡΤΙΑ";
    if (!hasQuorum501) {
      quorumStatus = "ΑΠΟΥΣΙΑ ΑΠΑΡΤΙΑΣ (Ματαίωση ή Επαναληπτική Συνέλευση)";
    }

    return {
      totalPresentMilliemes: presentMilliemes,
      hasQuorum501,
      hasQuorum651,
      quorumStatus,
      votesFor,
      votesAgainst,
      votesAbstain,
      decisionApproved: hasQuorum501 && (votesFor > (presentMilliemes / 2))
    };
  }

  /**
   * 3. Generate Official General Assembly Minutes (Πρακτικό Γ.Σ.)
   */
  generateAssemblyMinutes(assemblyData) {
    const evalQuorum = this.evaluateQuorum(assemblyData);
    const dateStr = assemblyData.date || new Date().toLocaleDateString("el-GR");

    let doc = `# ΠΡΑΚΤΙΚΟ ΓΕΝΙΚΗΣ ΣΥΝΕΛΕΥΣΗΣ ΣΥΝΙΔΙΟΚΤΗΤΩΝ\n\n`;
    doc += `> **Πολυκατοικία επί της οδού:** ${assemblyData.buildingAddress}\n`;
    doc += `> **Ημερομηνία & Ώρα:** ${dateStr}, ώρα ${assemblyData.time || "19:00"}\n`;
    doc += `> **Τόπος Συνεδρίασης:** ${assemblyData.location || "Είσοδος / Πυλωτή Πολυκατοικίας"}\n`;
    doc += `> **Ισχύουσα Νομοθετική Βάση:** 19 Νοεμβρίου 2026 (Ν. 3741/1929, Αστικός Κώδικας 1002, 1117)\n\n`;

    doc += `## 1. Διαπίστωση Απαρτίας Συνιδιοκτησίας\n\n`;
    doc += `Σήμερα, οι συνιδιοκτήτες της ως άνω πολυκατοικίας συνήλθαν σε Γενική Συνέλευση κατόπιν νομίμου προσκλήσεως.\n`;
    doc += `Κατά την έναρξη της συνεδρίασης διαπιστώθηκε η παρουσία συνιδιοκτητών που εκπροσωπούν **${evalQuorum.totalPresentMilliemes} / 1000 χιλιοστά** της όλης συνιδιοκτησίας.\n\n`;

    if (evalQuorum.hasQuorum501) {
      doc += `[ΝΟΜΙΜΗ ΑΠΑΡΤΙΑ] **Διαπίστωση:** Υφίσταται η κατά νόμο και κανονισμό απαιτούμενη νόμιμη απαρτία (>500/1000) και η Γενική Συνέλευση προχωρά εγκύρως στη λήψη αποφάσεων.\n\n`;
    } else {
      doc += `[ΑΠΟΥΣΙΑ ΑΠΑΡΤΙΑΣ] **Διαπίστωση:** ΔΕΝ επετεύχθη η απαιτούμενη απαρτία (συγκεντρώθηκαν μόνο ${evalQuorum.totalPresentMilliemes}/1000). Η συνέλευση κηρύσσεται ματαιωθείσα και ορίζεται επαναληπτική σύμφωνα με τον Κανονισμό.\n\n`;
    }

    doc += `## 2. Θέματα Ημερήσιας Διάταξης & Αποφάσεις\n\n`;
    const topics = assemblyData.agendaTopics || [];
    topics.forEach((top, idx) => {
      doc += `### Θέμα ${idx + 1}ο: ${top}\n`;
      doc += `- **Συζήτηση:** Αναπτύχθηκε διεξοδική συζήτηση μεταξύ των παρόντων συνιδιοκτητών επί των οικονομικών στοιχείων και των τεχνικών προτάσεων.\n`;
      doc += `- **Ψηφοφορία:** Υπέρ: ${evalQuorum.votesFor} χιλιοστά | Κατά: ${evalQuorum.votesAgainst} χιλιοστά | Λευκά/Αποχή: ${evalQuorum.votesAbstain} χιλιοστά.\n`;
      doc += `- **Απόφαση:** ${evalQuorum.decisionApproved ? "Εγκρίνεται κατά πλειοψηφία." : "Απορρίπτεται λόγω μη συγκέντρωσης απαιτούμενης πλειοψηφίας."}\n\n`;
    });

    doc += `## 3. Ρήτρα Απαλλαγής Διαχειριστή & Παράδοση Ταμείου\n\n`;
    doc += `Η Γενική Συνέλευση, αφού έλεγξε τα παραστατικά πληρωμών, τους λογαριασμούς κοινής ωφελείας (ΔΕΗ, ΕΥΔΑΠ, Φυσικό Αέριο/Πετρέλαιο), τα αποδεικτικά είσπραξης και το παραδιδόμενο υπόλοιπο του Αποθεματικού Ταμείου, **απαλλάσσει ρητά τον απερχόμενο διαχειριστή ${assemblyData.outgoingManager || "[Όνομα Διαχειριστή]"} από πάσα διαχειριστική και οικονομική ευθύνη αποκλειστικά για την εγκριθείσα διαχειριστική περίοδο**.\n\n`;

    doc += `## 4. Υπογραφές Παρόντων Συνιδιοκτητών\n\n`;
    doc += `| Διαμέρισμα | Ονοματεπώνυμο Συνιδιοκτήτη | Χιλιοστά | Υπογραφή |\n`;
    doc += `|:---|:---|:---:|:---:|\n`;
    (assemblyData.attendance || []).forEach(a => {
      if (a.present) {
        doc += `| ${a.apt} | ${a.owner} | ${a.milliemes}‰ | .............................. |\n`;
      }
    });

    doc += `\n---\n*Σημείωση: Το παρόν αποτελεί τεχνικό οργανωτικό πρότυπο πρακτικού συνταχθέν σύμφωνα με τον Ν. 3741/1929 και τον κανονισμό της πολυκατοικίας και δεν υποκαθιστά εξατομικευμένη νομική συμβουλή.*`;
    return doc;
  }

  /**
   * 4. Generate Clean Printable Expense Notice (Ειδοποιητήριο Κοινοχρήστων)
   */
  generateExpenseNoticeMarkdown(calcResult, aptId) {
    const item = calcResult.breakdown.find(b => b.id === aptId) || calcResult.breakdown[0];
    const bInfo = calcResult.buildingInfo || {};
    const totals = calcResult.totals || {};
    const statusMap = {
      active: "Ενεργή Θέρμανση",
      vacant: "Κενό Διαμέρισμα (Ιδιοκτήτης)",
      disconnected: "Αποσυνδεδεμένο (Ν. 4495/2017 αρ. 127)"
    };
    const heatLabel = statusMap[item.heatingStatus] || statusMap.active;

    let md = `# ΕΙΔΟΠΟΙΗΤΗΡΙΟ ΠΛΗΡΩΜΗΣ ΚΟΙΝΟΧΡΗΣΤΩΝ ΔΑΠΑΝΩΝ\n\n`;
    md += `> **Πολυκατοικία:** ${bInfo.address || "Κεντρική Πολυκατοικία"}  \n`;
    md += `> **Μήνας/Περίοδος:** ${bInfo.period || "Τρέχων Μήνας"}  \n`;
    md += `> **Διαμέρισμα:** **${item.name}** | **Ιδιοκτήτης/Ένοικος:** ${item.owner}  \n`;
    md += `> **Χιλιοστά Συνιδιοκτησίας:** **${item.milliemesTotal} / 1000** | Ανελκυστήρα: ${item.milliemesElevator}‰ | Θέρμανσης: ${item.milliemesHeating}‰ | **Θέρμανση:** ${heatLabel}  \n\n`;

    md += `## Ανάλυση Δαπανών Πολυκατοικίας & Αναλογία Διαμερίσματος\n\n`;
    md += `| Κατηγορία Δαπάνης | Συνολικό Κόστος Πολυκατοικίας | Μέθοδος Κατανομής | Ποσό Διαμερίσματος (€) |\n`;
    md += `|:---|---:|:---|---:|\n`;
    md += `| **Γενικά Κοινόχρηστα** (Καθαριότητα, ΔΕΗ, ΕΥΔΑΠ) | ${totals.generalExp.toFixed(2)} € | Χιλιοστά Συνιδιοκτησίας (${item.milliemesTotal}‰) | **${item.generalShare.toFixed(2)} €** |\n`;
    md += `| **Συντήρηση Ανελκυστήρα** | ${totals.elevatorExp.toFixed(2)} € | Χιλιοστά Ανελκυστήρα (${item.milliemesElevator}‰) | **${item.elevatorShare.toFixed(2)} €** |\n`;
    md += `| **Πάγιο Θέρμανσης (Π.Δ. 1985)** | ${totals.heatingFixedPool.toFixed(2)} € | Χιλιοστά Θέρμανσης (${item.milliemesHeating}‰) | **${item.heatingFixedShare.toFixed(2)} €** |\n`;
    md += `| **Ωρομέτρηση Θέρμανσης** (${item.heatingHours} ώρες) | ${totals.heatingVariablePool.toFixed(2)} € | Κατανάλωση / Ωρομετρητής | **${item.heatingVariableShare.toFixed(2)} €** |\n`;
    if (item.reserveShare > 0) {
      md += `| **Εισφορά Αποθεματικού Ταμείου** | ${totals.reserveExp.toFixed(2)} € | Χιλιοστά Συνιδιοκτησίας (${item.milliemesTotal}‰) | **${item.reserveShare.toFixed(2)} €** |\n`;
    }
    if (Math.abs(item.roundingAdjustment || 0) >= 0.005) {
      const signR = item.roundingAdjustment > 0 ? '+' : '';
      md += `| **Εξίσωση Στρογγυλοποίησης (€)** | — | Μέθοδος Μεγ. Υπολοίπου | **${signR}${item.roundingAdjustment.toFixed(2)} €** |\n`;
    }
    if (Math.abs(item.priorBalance || 0) >= 0.005) {
      const signP = item.priorBalance > 0 ? '+' : '';
      md += `| **Προηγούμενο Υπόλοιπο (Οφειλή / Πίστωση)** | — | Μεταφορά Προηγ. Περιόδου | **${signP}${item.priorBalance.toFixed(2)} €** |\n`;
    }
    md += `| **Μερίδιο Ενοίκου (Λειτουργικά Μήνα)** | — | Εκτός Αποθεματικού / Κενού | **${item.tenantShare.toFixed(2)} €** |\n`;
    md += `| **Μερίδιο Ιδιοκτήτη (Αποθεματικό / Κενό)** | — | Πάγια & Ιδιοκτησιακά | **${item.ownerShare.toFixed(2)} €** |\n`;
    md += `| **ΣΥΝΟΛΙΚΟ ΠΛΗΡΩΤΕΟ ΠΟΣΟ** | **${totals.grandTotal.toFixed(2)} €** | | **${item.totalToPay.toFixed(2)} €** |\n\n`;

    md += `**Παρακαλούμε για την εξόφληση έως:** [Ημερομηνία Εξόφλησης]\n`;
    md += `**Διαχειριστής:** ${bInfo.managerName || "[Όνομα Διαχειριστή]"}\n`;
    md += `\n---\n*Σημείωση: Ο υπολογισμός της θέρμανσης διενεργείται βάσει του Προεδρικού Διατάγματος 27.9/7.11.1985 (ΦΕΚ 631 Δ').*`;
    return md;
  }
}

// Global instance & exports
if (typeof window !== "undefined") {
  window.praktikaEngine = new PraktikaEngine();
  window.SAMPLE_BUILDINGS = SAMPLE_BUILDINGS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { PraktikaEngine, SAMPLE_BUILDINGS };
}
