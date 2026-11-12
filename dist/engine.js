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
      reserveContribution: 100 // Μηνιαία εισφορά αποθεματικού
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
    const apts = buildingData.apartments || [];
    const exp = buildingData.expenses || {};

    const totalMilliemes = apts.reduce((sum, a) => sum + (Number(a.milliemesTotal) || 0), 0);
    const totalElevatorMilliemes = apts.reduce((sum, a) => sum + (Number(a.milliemesElevator) || 0), 0);
    const totalHeatingMilliemes = apts.reduce((sum, a) => sum + (Number(a.milliemesHeating) || 0), 0);

    const generalExp = Number(exp.general) || 0;
    const elevatorExp = Number(exp.elevator) || 0;
    const heatingTotal = Number(exp.heatingTotal) || 0;
    const reserveExp = Number(exp.reserveContribution) || 0;

    // Heating Decomposition according to P.D. 1985
    const fixedPercent = (Number(exp.heatingFixedPercentage) || 30) / 100;
    const heatingFixedPool = heatingTotal * fixedPercent;
    const heatingVariablePool = heatingTotal * (1 - fixedPercent);

    // Sum of weighted hours: Σ(εi * hi)
    let totalWeightedHours = 0;
    apts.forEach(a => {
      const hours = Number(a.heatingHours) || 0;
      const coeff = Number(a.heatingCoeffFi) || 1.0;
      totalWeightedHours += (hours * coeff);
    });

    const breakdown = apts.map(apt => {
      const mTot = Number(apt.milliemesTotal) || 0;
      const mElev = Number(apt.milliemesElevator) || 0;
      const mHeat = Number(apt.milliemesHeating) || 0;
      const hours = Number(apt.heatingHours) || 0;
      const coeff = Number(apt.heatingCoeffFi) || 1.0;

      // 1. General share = (generalExp + reserveExp) * (mTot / totalMilliemes)
      const generalShare = totalMilliemes > 0 ? (generalExp * (mTot / totalMilliemes)) : 0;
      const reserveShare = totalMilliemes > 0 ? (reserveExp * (mTot / totalMilliemes)) : 0;

      // 2. Elevator share = elevatorExp * (mElev / totalElevatorMilliemes)
      const elevatorShare = totalElevatorMilliemes > 0 ? (elevatorExp * (mElev / totalElevatorMilliemes)) : 0;

      // 3. Heating Fixed share (Πάγιο Θέρμανσης)
      const heatingFixedShare = totalHeatingMilliemes > 0 ? (heatingFixedPool * (mHeat / totalHeatingMilliemes)) : 0;

      // 4. Heating Variable share (Ωρομέτρηση)
      const aptWeightedHours = hours * coeff;
      const heatingVariableShare = totalWeightedHours > 0 ? (heatingVariablePool * (aptWeightedHours / totalWeightedHours)) : 0;

      const heatingTotalShare = heatingFixedShare + heatingVariableShare;
      const totalToPay = generalShare + elevatorShare + heatingTotalShare + reserveShare;

      return {
        id: apt.id,
        name: apt.name,
        owner: apt.owner,
        milliemesTotal: mTot,
        milliemesElevator: mElev,
        milliemesHeating: mHeat,
        heatingHours: hours,
        generalShare: Math.round(generalShare * 100) / 100,
        elevatorShare: Math.round(elevatorShare * 100) / 100,
        heatingFixedShare: Math.round(heatingFixedShare * 100) / 100,
        heatingVariableShare: Math.round(heatingVariableShare * 100) / 100,
        heatingTotalShare: Math.round(heatingTotalShare * 100) / 100,
        reserveShare: Math.round(reserveShare * 100) / 100,
        totalToPay: Math.round(totalToPay * 100) / 100
      };
    });

    const sumTotalCalculated = breakdown.reduce((sum, b) => sum + b.totalToPay, 0);

    return {
      buildingInfo: buildingData.buildingInfo,
      totals: {
        totalMilliemes,
        totalElevatorMilliemes,
        generalExp,
        elevatorExp,
        heatingTotal,
        heatingFixedPool: Math.round(heatingFixedPool * 100) / 100,
        heatingVariablePool: Math.round(heatingVariablePool * 100) / 100,
        reserveExp,
        grandTotal: Math.round((generalExp + elevatorExp + heatingTotal + reserveExp) * 100) / 100,
        sumTotalCalculated: Math.round(sumTotalCalculated * 100) / 100
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
    doc += `> **Ισχύουσα Νομοθετική Βάση:** 12 Νοεμβρίου 2026 (Ν. 3741/1929, Αστικός Κώδικας 1002, 1117)\n\n`;

    doc += `## 1. Διαπίστωση Απαρτίας Συνιδιοκτησίας\n\n`;
    doc += `Σήμερα, οι συνιδιοκτήτες της ως άνω πολυκατοικίας συνήλθαν σε Γενική Συνέλευση κατόπιν νομίμου προσκλήσεως.\n`;
    doc += `Κατά την έναρξη της συνεδρίασης διαπιστώθηκε η παρουσία συνιδιοκτητών που εκπροσωπούν **${evalQuorum.totalPresentMilliemes} / 1000 χιλιοστά** της όλης συνιδιοκτησίας.\n\n`;

    if (evalQuorum.hasQuorum501) {
      doc += `✅ **Διαπίστωση:** Υφίσταται η κατά νόμο και κανονισμό απαιτούμενη νόμιμη απαρτία (>500/1000) και η Γενική Συνέλευση προχωρά εγκύρως στη λήψη αποφάσεων.\n\n`;
    } else {
      doc += `❌ **Διαπίστωση:** ΔΕΝ επετεύχθη η απαιτούμενη απαρτία (συγκεντρώθηκαν μόνο ${evalQuorum.totalPresentMilliemes}/1000). Η συνέλευση κηρύσσεται ματαιωθείσα και ορίζεται επαναληπτική σύμφωνα με τον Κανονισμό.\n\n`;
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

    doc += `\n---\n*Σημείωση: Το παρόν αποτελεί τεχνικό οργανωτικό πρότυπο πρακτικού συνταχθέν σύμφωνα με τον Ν. 3741/1929 και το καταστατικό της πολυκατοικίας και δεν υποκαθιστά εξατομικευμένη νομική συμβουλή δικηγόρου.*`;
    return doc;
  }

  /**
   * 4. Generate Clean Printable Expense Notice (Ειδοποιητήριο Κοινοχρήστων)
   */
  generateExpenseNoticeMarkdown(calcResult, aptId) {
    const item = calcResult.breakdown.find(b => b.id === aptId) || calcResult.breakdown[0];
    const bInfo = calcResult.buildingInfo || {};
    const totals = calcResult.totals || {};

    let md = `# ΕΙΔΟΠΟΙΗΤΗΡΙΟ ΠΛΗΡΩΜΗΣ ΚΟΙΝΟΧΡΗΣΤΩΝ ΔΑΠΑΝΩΝ\n\n`;
    md += `> **Πολυκατοικία:** ${bInfo.address || "Κεντρική Πολυκατοικία"}  \n`;
    md += `> **Μήνας/Περίοδος:** ${bInfo.period || "Τρέχων Μήνας"}  \n`;
    md += `> **Διαμέρισμα:** **${item.name}** | **Ιδιοκτήτης/Ένοικος:** ${item.owner}  \n`;
    md += `> **Χιλιοστά Συνιδιοκτησίας:** **${item.milliemesTotal} / 1000** | Ανελκυστήρα: ${item.milliemesElevator}‰ | Θέρμανσης: ${item.milliemesHeating}‰  \n\n`;

    md += `## 📊 Ανάλυση Δαπανών Πολυκατοικίας & Αναλογία Διαμερίσματος\n\n`;
    md += `| Κατηγορία Δαπάνης | Συνολικό Κόστος Πολυκατοικίας | Μέθοδος Κατανομής | Ποσό Διαμερίσματος (€) |\n`;
    md += `|:---|:---:|:---|:---:|\n`;
    md += `| **Γενικά Κοινόχρηστα** (Καθαριότητα, ΔΕΗ, ΕΥΔΑΠ) | ${totals.generalExp} € | Χιλιοστά Συνιδιοκτησίας (${item.milliemesTotal}‰) | **${item.generalShare} €** |\n`;
    md += `| **Συντήρηση Ανελκυστήρα** | ${totals.elevatorExp} € | Χιλιοστά Ανελκυστήρα (${item.milliemesElevator}‰) | **${item.elevatorShare} €** |\n`;
    md += `| **Πάγιο Θέρμανσης (Π.Δ. 1985)** | ${totals.heatingFixedPool} € | Χιλιοστά Θέρμανσης (${item.milliemesHeating}‰) | **${item.heatingFixedShare} €** |\n`;
    md += `| **Ωρομέτρηση Θέρμανσης** (${item.heatingHours} ώρες) | ${totals.heatingVariablePool} € | Κατανάλωση / Ωρομετρητής | **${item.heatingVariableShare} €** |\n`;
    if (item.reserveShare > 0) {
      md += `| **Εισφορά Αποθεματικού Ταμείου** | ${totals.reserveExp} € | Χιλιοστά Συνιδιοκτησίας (${item.milliemesTotal}‰) | **${item.reserveShare} €** |\n`;
    }
    md += `|:---|:---:|:---|:---:|\n`;
    md += `| **ΣΥΝΟΛΙΚΟ ΠΛΗΡΩΤΕΟ ΠΟΣΟ** | **${totals.grandTotal} €** | | <span style="font-size:1.2em; font-weight:bold; color:#059669;">${item.totalToPay} €</span> |\n\n`;

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
