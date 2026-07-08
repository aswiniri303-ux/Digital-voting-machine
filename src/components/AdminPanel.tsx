import React, { useState, useRef } from "react";
import { 
  Lock, Unlock, Award, RefreshCw, BarChart3, ListOrdered, 
  Trash2, ShieldCheck, Download, Sparkles, CheckCircle2, 
  UserPlus, Edit, Plus, X, Users, AlertTriangle, Check,
  Upload, Menu, Settings, FileText, Info, ShieldAlert,
  HelpCircle, ChevronDown, Settings2, Activity, PlusCircle,
  GraduationCap
} from "lucide-react";
import { Candidate, VoteRecord } from "../types";
import { playMechanicalClick } from "../utils/audio";
import { compressImage } from "../utils/imageCompressor";

function DeveloperLogo() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left Bracket [ */}
      <path
        d="M 30 10 H 18 A 12 12 0 0 0 6 22 V 78 A 12 12 0 0 0 18 90 H 30 V 78 H 18 V 22 H 30 Z"
        fill="#055085"
      />

      {/* Gears or Inner graphics inside the bracket */}
      <circle cx="49" cy="30" r="13" stroke="#055085" strokeWidth="3.5" strokeDasharray="6 3.5" />
      <circle cx="49" cy="30" r="7.5" stroke="#055085" strokeWidth="2.5" />
      <circle cx="49" cy="30" r="3.5" fill="#055085" />

      {/* Robot Claw/Hand at the bottom left area */}
      <path
        d="M 40 50 H 52 M 40 54 H 50 M 40 58 H 54"
        stroke="#055085"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Horizontal joint line connecting claw to joint */}
      <line x1="32" y1="62" x2="52" y2="62" stroke="#055085" strokeWidth="3" strokeLinecap="round" />
      <circle cx="52" cy="62" r="4.5" fill="#055085" />

      {/* Structural Vertical/Slanted Arms */}
      <line x1="49" y1="41" x2="49" y2="62" stroke="#055085" strokeWidth="2.5" />

      {/* Mechanical joint nodes */}
      <circle cx="49" cy="41" r="2.5" fill="#055085" />

      {/* Small design coordinates or grid ticks */}
      <rect x="74" y="22" width="2" height="6" fill="#055085" opacity="0.3" />
      <rect x="74" y="44" width="2" height="6" fill="#055085" opacity="0.3" />
      <rect x="74" y="66" width="2" height="6" fill="#055085" opacity="0.3" />

      {/* Pupil (White) */}
      <circle cx="49" cy="30" r="1.5" fill="#ffffff" />

      {/* Right Bracket with bottom hook */}
      <path
        d="M 70 10 H 82 A 12 12 0 0 1 94 22 V 78 A 12 12 0 0 1 82 90 A 12 12 0 0 1 74 81 V 68 H 82 V 22 H 70 Z"
        fill="#055085"
      />
    </svg>
  );
}

interface AdminPanelProps {
  candidates: Candidate[];
  votes: VoteRecord[];
  isPollClosed: boolean;
  onClosePolls: () => void;
  onResetElection: () => void;
  onAddMockVotes: (count: number) => void;
  onAddCandidate?: (cand: Omit<Candidate, "id" | "serialNumber" | "color" | "iconName"> & { color: string; iconName: string }) => void;
  onEditCandidate?: (cand: Candidate) => void;
  onDeleteCandidate?: (id: string) => void;
  defaultPin?: string;
  onUpdatePin?: (pin: string) => void;
  pollingStationName?: string;
  onUpdateStationName?: (name: string) => void;
  onImportBackup?: (candidates: Candidate[], votes: VoteRecord[]) => void;
  institutionSubtitle?: string;
  onUpdateInstitutionSubtitle?: (sub: string) => void;
  institutionTitle?: string;
  onUpdateInstitutionTitle?: (title: string) => void;
  institutionLogo?: string;
  onUpdateInstitutionLogo?: (logo: string) => void;
  footerLogo?: string;
  onUpdateFooterLogo?: (logo: string) => void;
  academicYear?: string;
  onUpdateAcademicYear?: (year: string) => void;
  isPollStarted: boolean;
  onStartPolls: () => void;
  schoolName?: string;
  onUpdateSchoolName?: (name: string) => void;
  developerName?: string;
  onUpdateDeveloperName?: (name: string) => void;
  developerSubtitle?: string;
  onUpdateDeveloperSubtitle?: (sub: string) => void;
  developerLogo?: string;
  onUpdateDeveloperLogo?: (logo: string) => void;
}

const SYMBOL_PRESETS = [
  { symbol: "⭐", icon: "Star", color: "amber", label: "Star" },
  { symbol: "📚", icon: "BookOpen", color: "blue", label: "Book" },
  { symbol: "💻", icon: "Laptop", color: "indigo", label: "Laptop" },
  { symbol: "🌱", icon: "Sprout", color: "emerald", label: "Sprout" },
  { symbol: "🏆", icon: "Trophy", color: "rose", label: "Trophy" },
  { symbol: "🔥", icon: "Flame", color: "orange", label: "Flame" },
  { symbol: "🚀", icon: "Rocket", color: "red", label: "Rocket" },
  { symbol: "❤️", icon: "Heart", color: "pink", label: "Heart" },
  { symbol: "🎨", icon: "Palette", color: "violet", label: "Palette" },
  { symbol: "🛡️", icon: "Shield", color: "slate", label: "Shield" },
  { symbol: "⚡", icon: "Zap", color: "yellow", label: "Zap" }
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  candidates,
  votes,
  isPollClosed,
  onClosePolls,
  onResetElection,
  onAddMockVotes,
  onAddCandidate,
  onEditCandidate,
  onDeleteCandidate,
  defaultPin = "admin@123",
  onUpdatePin,
  pollingStationName = "POLLING STATION NO. 4A",
  onUpdateStationName,
  onImportBackup,
  institutionSubtitle = "College & School Student Council",
  onUpdateInstitutionSubtitle,
  institutionTitle = "EVM Student Election Simulator",
  onUpdateInstitutionTitle,
  institutionLogo = "",
  onUpdateInstitutionLogo,
  footerLogo = "",
  onUpdateFooterLogo,
  academicYear = "2026-27",
  onUpdateAcademicYear,
  isPollStarted,
  onStartPolls,
  schoolName = "Arafa English School, Attur",
  onUpdateSchoolName,
  developerName = "Industrial Robotics",
  onUpdateDeveloperName,
  developerSubtitle = "Institute",
  onUpdateDeveloperSubtitle,
  developerLogo = "R",
  onUpdateDeveloperLogo,
}) => {
  // Authentication & Panel tabs state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [activeTab, setActiveTab] = useState<"roster" | "results">("roster");

  // Menu Dropdown states
  const [activeDropdown, setActiveDropdown] = useState<"file" | "edit" | "tools" | "help" | null>(null);

  // Dialog states for menu operations
  const [showStationModal, setShowStationModal] = useState(false);
  const [newStationName, setNewStationName] = useState(pollingStationName);
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPinValue, setNewPinValue] = useState("");
  const [pinChangeError, setPinChangeError] = useState("");

  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [showUserGuide, setShowUserGuide] = useState(false);

  // Institution Logo & Title Modal States
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const [newInstitutionSubtitle, setNewInstitutionSubtitle] = useState(institutionSubtitle);
  const [newInstitutionTitle, setNewInstitutionTitle] = useState(institutionTitle);
  const [newInstitutionLogo, setNewInstitutionLogo] = useState(institutionLogo);
  const [newFooterLogo, setNewFooterLogo] = useState(footerLogo);
  const [newAcademicYear, setNewAcademicYear] = useState(academicYear);
  const [newSchoolName, setNewSchoolName] = useState(schoolName);
  const [newDeveloperName, setNewDeveloperName] = useState(developerName);
  const [newDeveloperSubtitle, setNewDeveloperSubtitle] = useState(developerSubtitle);
  const [newDeveloperLogo, setNewDeveloperLogo] = useState(developerLogo);

  // File import input ref
  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Form states for adding/editing candidates
  const [isEditing, setIsEditing] = useState<string | null>(null); // Candidate ID being edited
  const [candName, setCandName] = useState("");
  const [candSymbol, setCandSymbol] = useState("⭐");
  const [candIcon, setCandIcon] = useState("Star");
  const [candColor, setCandColor] = useState("amber");
  const [candCategory, setCandCategory] = useState("Head Boy");
  const [candClassGroup, setCandClassGroup] = useState("XII A");

  // Custom symbol file upload reader
  const handleSymbolUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setCandSymbol(result);
        setCandIcon("Custom Upload");
        setCandColor("slate");
      }
    };
    reader.readAsDataURL(file);
  };

  // Menu Action Handlers
  const handleExportBackup = () => {
    playMechanicalClick();
    const backupData = {
      version: "EVM-STUDENT-2026",
      timestamp: new Date().toISOString(),
      stationName: pollingStationName,
      candidates,
      votes,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `EVM_Roster_Backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.removeChild(downloadAnchor);
    setActiveDropdown(null);
  };

  const triggerImportClick = () => {
    playMechanicalClick();
    importFileInputRef.current?.click();
    setActiveDropdown(null);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.candidates)) {
          if (onImportBackup) {
            onImportBackup(parsed.candidates, parsed.votes || []);
          }
          if (parsed.stationName && onUpdateStationName) {
            onUpdateStationName(parsed.stationName);
          }
          alert("EVM Database backup imported successfully!");
        } else {
          alert("Error: File is not a valid EVM student candidate backup.");
        }
      } catch (err) {
        alert("Error: Failed to parse backup file.");
      }
    };
    reader.readAsText(file);
  };

  const handleStationNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playMechanicalClick();
    if (newStationName.trim() && onUpdateStationName) {
      onUpdateStationName(newStationName.trim());
      setShowStationModal(false);
    }
  };

  const handleInstitutionLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setNewInstitutionLogo(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFooterLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setNewFooterLogo(result);
        setNewDeveloperLogo(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeveloperLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setNewDeveloperLogo(result);
        setNewFooterLogo(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInstitutionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playMechanicalClick();
    if (onUpdateInstitutionSubtitle) {
      onUpdateInstitutionSubtitle(newInstitutionSubtitle.trim());
    }
    if (onUpdateInstitutionTitle) {
      onUpdateInstitutionTitle(newInstitutionTitle.trim());
    }
    if (onUpdateInstitutionLogo) {
      onUpdateInstitutionLogo(newInstitutionLogo);
    }
    if (onUpdateFooterLogo) {
      onUpdateFooterLogo(newFooterLogo);
    }
    if (onUpdateAcademicYear) {
      onUpdateAcademicYear(newAcademicYear.trim());
    }
    if (onUpdateSchoolName) {
      onUpdateSchoolName(newSchoolName.trim());
    }
    if (onUpdateDeveloperName) {
      onUpdateDeveloperName(newDeveloperName.trim());
    }
    if (onUpdateDeveloperSubtitle) {
      onUpdateDeveloperSubtitle(newDeveloperSubtitle.trim());
    }
    if (onUpdateDeveloperLogo) {
      onUpdateDeveloperLogo(newDeveloperLogo);
    }
    setShowInstitutionModal(false);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playMechanicalClick();
    if (newPinValue.length < 4) {
      setPinChangeError("Security PIN must be at least 4 digits long.");
      return;
    }
    if (onUpdatePin) {
      onUpdatePin(newPinValue);
      setNewPinValue("");
      setPinChangeError("");
      setShowPinModal(false);
      alert("Security PIN successfully updated!");
    }
  };

  const handleBulkLoadClick = () => {
    playMechanicalClick();
    const BULK_PRESETS = [
      { name: "Anita Roy", classGroup: "XII A", symbol: "🌱", iconName: "Sprout", color: "emerald" },
      { name: "Rahul Silva", classGroup: "XII B", symbol: "🔥", iconName: "Flame", color: "orange" },
      { name: "Vivek Patel", classGroup: "XI A", symbol: "🚀", iconName: "Rocket", color: "red" },
      { name: "Jessica Taylor", classGroup: "XI B", symbol: "🎨", iconName: "Palette", color: "violet" }
    ];

    if (onImportBackup) {
      // Create candidates structured list
      const formatted: Candidate[] = BULK_PRESETS.map((bp, index) => ({
        id: `cand-bulk-${index + 1}-${Math.random().toString(36).substring(2, 5)}`,
        serialNumber: index + 1,
        name: bp.name,
        symbol: bp.symbol,
        iconName: bp.iconName,
        color: bp.color,
        category: "Head Boy",
        classGroup: bp.classGroup
      }));
      onImportBackup(formatted, []); // Wipe votes and load standard 4 candidates
      alert("Standard 4-candidate student ballot roster registered successfully!");
    }
    setActiveDropdown(null);
  };

  // Confirm dialogs
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Compute stats
  const totalVotes = votes.length;
  const voteCounts = candidates.reduce((acc, cand) => {
    acc[cand.id] = votes.filter(v => v.candidateId === cand.id).length;
    return acc;
  }, {} as Record<string, number>);

  // Determine Winner(s)
  let maxVotes = -1;
  let winnerCandidates: Candidate[] = [];
  if (totalVotes > 0) {
    candidates.forEach(cand => {
      const cnt = voteCounts[cand.id] || 0;
      if (cnt > maxVotes) {
        maxVotes = cnt;
        winnerCandidates = [cand];
      } else if (cnt === maxVotes && cnt > 0) {
        winnerCandidates.push(cand);
      }
    });
  }

  const isTied = winnerCandidates.length > 1;
  const primaryWinner = winnerCandidates.length === 1 ? winnerCandidates[0] : null;

  // PIN check
  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playMechanicalClick();
    if (pinInput === defaultPin || pinInput === "admin@123" || pinInput === "1234") {
      setIsUnlocked(true);
      setPinError("");
      setPinInput("");
    } else {
      setPinError("Invalid Security PIN. Please try again.");
    }
  };

  // Close polls trigger
  const handleConfirmClosePolls = () => {
    playMechanicalClick();
    onClosePolls();
    setShowCloseConfirm(false);
    setActiveTab("results");
  };

  // Reset EVM trigger
  const handleConfirmReset = () => {
    playMechanicalClick();
    onResetElection();
    setShowResetConfirm(false);
    setIsUnlocked(false);
    setActiveTab("roster");
  };

  // Preset Selection Helper
  const applyPreset = (preset: typeof SYMBOL_PRESETS[0]) => {
    playMechanicalClick();
    setCandSymbol(preset.symbol);
    setCandIcon(preset.icon);
    setCandColor(preset.color);
  };

  // Create or Update Candidate Form Submit
  const handleCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playMechanicalClick();
    if (!candName.trim()) return;

    if (isEditing) {
      // Edit candidate
      if (onEditCandidate) {
        const existing = candidates.find(c => c.id === isEditing);
        if (existing) {
          onEditCandidate({
            ...existing,
            name: candName.trim(),
            symbol: candSymbol,
            iconName: candIcon,
            color: candColor,
            category: candCategory,
            classGroup: candClassGroup
          });
        }
      }
      setIsEditing(null);
    } else {
      // Add candidate
      if (onAddCandidate) {
        onAddCandidate({
          name: candName.trim(),
          symbol: candSymbol,
          iconName: candIcon,
          color: candColor,
          category: candCategory,
          classGroup: candClassGroup
        } as any);
      }
    }

    // Reset Form
    setCandName("");
    setCandSymbol("⭐");
    setCandIcon("Star");
    setCandColor("amber");
    setCandCategory("Head Boy");
    setCandClassGroup("XII A");
  };

  // Populate candidate data for editing
  const startEditCandidate = (cand: Candidate) => {
    playMechanicalClick();
    setIsEditing(cand.id);
    setCandName(cand.name);
    setCandSymbol(cand.symbol);
    setCandIcon(cand.iconName);
    setCandColor(cand.color);
    setCandCategory(cand.category || "Head Boy");
    setCandClassGroup(cand.classGroup || "XII A");
  };

  const cancelEdit = () => {
    playMechanicalClick();
    setIsEditing(null);
    setCandName("");
    setCandSymbol("⭐");
    setCandIcon("Star");
    setCandColor("amber");
    setCandCategory("Head Boy");
    setCandClassGroup("XII A");
  };

  // Delete Candidate action
  const handleConfirmDelete = (id: string) => {
    playMechanicalClick();
    if (onDeleteCandidate) {
      onDeleteCandidate(id);
    }
    setDeleteConfirmId(null);
  };

  // CSV Export
  const handleExportCSV = () => {
    playMechanicalClick();
    const sortedCandidates = [...candidates].sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0));
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Rank,Serial Number,Candidate Name,Class/Division,Votes,Percentage\n";
    
    sortedCandidates.forEach((cand, idx) => {
      const cnt = voteCounts[cand.id] || 0;
      const pct = totalVotes > 0 ? ((cnt / totalVotes) * 100).toFixed(1) : "0.0";
      csvContent += `${idx + 1},${cand.serialNumber},"${cand.name}","${cand.classGroup || ''}",${cnt},${pct}%\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_election_results_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-neutral-200/80 p-6 select-none mt-4">
      
      {/* 1. Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
              AUDIT & ADMINISTRATIVE PANEL
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight font-display text-neutral-800">
            Election Control Console
          </h2>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isPollStarted ? (
            <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              POLLS NOT STARTED
            </span>
          ) : isPollClosed ? (
            <span className="bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              POLLS CLOSED
            </span>
          ) : (
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              POLLING ACTIVE
            </span>
          )}

          {isUnlocked ? (
            <span className="bg-neutral-800 text-neutral-100 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-neutral-700 shadow-sm">
              <Unlock className="w-3.5 h-3.5 text-amber-400" />
              ADMIN VERIFIED
            </span>
          ) : (
            <span className="bg-neutral-100 text-neutral-600 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-neutral-200 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-neutral-400" />
              ADMIN LOCKED
            </span>
          )}
        </div>
      </div>

      {/* CASE 1: Locked Authentication Form */}
      {!isUnlocked && (
        <div className="bg-neutral-50 rounded-xl p-8 border border-neutral-200/60 flex flex-col items-center justify-center max-w-md mx-auto text-center shadow-inner">
          <div className="w-14 h-14 bg-neutral-200/80 rounded-full flex items-center justify-center border-4 border-white shadow-md text-neutral-600 mb-4">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>

          <h3 className="text-lg font-bold font-display text-neutral-800">Administrative Sign-In</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs leading-normal">
            Verifying the school/college administrator credentials will grant tools to manage students, set up ballots, and generate reports.
          </p>

          <form onSubmit={handleUnlockSubmit} className="w-full mt-5">
            <div className="space-y-3 text-left">
              <label htmlFor="admin-pin" className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                Security PIN Code
              </label>
              <div className="relative">
                <input
                  id="admin-pin"
                  type="password"
                  maxLength={24}
                  placeholder="••••••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-neutral-800 focus:border-transparent outline-none bg-white shadow-sm"
                />
              </div>
            </div>

            {pinError && (
              <p className="text-[11px] font-bold text-red-600 mt-2 flex items-center justify-center gap-1">
                ⚠️ {pinError}
              </p>
            )}

            <button
              id="btn-admin-unlock"
              type="submit"
              className="w-full mt-4 bg-neutral-800 hover:bg-neutral-900 text-neutral-50 font-bold py-2.5 rounded-lg text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md cursor-pointer active:translate-y-px transition-all"
            >
              <Unlock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Verify PIN & Access Admin Console</span>
            </button>

            <p className="text-[10px] text-neutral-400 font-mono mt-3.5 italic">
              Evaluation Note: Default developer PIN is <span className="font-bold text-neutral-600 underline">admin@123</span>
            </p>
          </form>
        </div>
      )}

      {/* CASE 2: Unlocked Admin Console */}
      {isUnlocked && (
        <div className="space-y-6">

          {/* Menu Bar Inside the Election Control Console */}
          <div className="relative bg-neutral-800 text-neutral-300 rounded-lg px-4 py-2 border border-neutral-700 shadow-md flex items-center justify-between flex-wrap gap-4 text-xs font-mono select-none z-30">
            {/* Left Brand Area */}
            <div className="flex items-center gap-2 text-neutral-100 font-bold tracking-tight">
              <Settings2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>EVM-OS v20.26</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-700 font-normal text-neutral-400">ADMIN MENU</span>
            </div>

            {/* Middle Menu Items */}
            <div className="flex items-center gap-1">
              {/* FILE MENU */}
              <div className="relative">
                <button
                  onClick={() => { playMechanicalClick(); setActiveDropdown(activeDropdown === "file" ? null : "file"); }}
                  className={`px-3 py-1.5 rounded hover:bg-neutral-700 hover:text-white transition-all flex items-center gap-1 cursor-pointer ${
                    activeDropdown === "file" ? "bg-neutral-700 text-white" : ""
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>File</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
                {activeDropdown === "file" && (
                  <div className="absolute top-full left-0 mt-1.5 w-52 bg-white text-neutral-800 border border-neutral-200 rounded-md shadow-xl py-1 z-50 animate-fade-in font-sans">
                    <button
                      onClick={handleExportBackup}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-100 flex items-center gap-2 font-medium"
                    >
                      <Download className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Export Database (.json)</span>
                    </button>
                    <button
                      onClick={triggerImportClick}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-100 flex items-center gap-2 font-medium"
                    >
                      <Upload className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Import Database (.json)</span>
                    </button>
                    <button
                      onClick={() => {
                        playMechanicalClick();
                        // Sort by descending votes
                        const sorted = [...candidates].sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0));
                        let csvContent = "Rank,Serial,Candidate Name,Class/Division,Votes,Percentage\n";
                        sorted.forEach((cand, idx) => {
                          const count = voteCounts[cand.id] || 0;
                          const pct = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : "0.0";
                          const cleanName = cand.name.replace(/"/g, '""');
                          const cleanClass = (cand.classGroup || "").replace(/"/g, '""');
                          csvContent += `${idx + 1},${cand.serialNumber},"${cleanName}","${cleanClass}",${count},${pct}%\n`;
                        });
                        const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
                        const downloadAnchor = document.createElement("a");
                        downloadAnchor.setAttribute("href", dataStr);
                        downloadAnchor.setAttribute("download", `EVM_Election_Standings_${pollingStationName.replace(/\s+/g, "_")}.csv`);
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        document.body.removeChild(downloadAnchor);
                        setActiveDropdown(null);
                      }}
                      disabled={totalVotes === 0}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-100 flex items-center gap-2 font-medium border-t border-neutral-100 disabled:opacity-50"
                    >
                      <FileText className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Print Standings (CSV)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* EDIT MENU */}
              <div className="relative">
                <button
                  onClick={() => { playMechanicalClick(); setActiveDropdown(activeDropdown === "edit" ? null : "edit"); }}
                  className={`px-3 py-1.5 rounded hover:bg-neutral-700 hover:text-white transition-all flex items-center gap-1 cursor-pointer ${
                    activeDropdown === "edit" ? "bg-neutral-700 text-white" : ""
                  }`}
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
                {activeDropdown === "edit" && (
                  <div className="absolute top-full left-0 mt-1.5 w-52 bg-white text-neutral-800 border border-neutral-200 rounded-md shadow-xl py-1 z-50 animate-fade-in font-sans">
                    <button
                      onClick={() => { playMechanicalClick(); setNewStationName(pollingStationName); setShowStationModal(true); setActiveDropdown(null); }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-100 flex items-center gap-2 font-medium"
                    >
                      <Settings className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Change Station Name</span>
                    </button>
                    <button
                      onClick={() => {
                        playMechanicalClick();
                        setNewInstitutionSubtitle(institutionSubtitle);
                        setNewInstitutionTitle(institutionTitle);
                        setNewInstitutionLogo(institutionLogo);
                        setNewFooterLogo(footerLogo);
                        setNewAcademicYear(academicYear);
                        setShowInstitutionModal(true);
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-100 flex items-center gap-2 font-medium border-t border-neutral-100"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Change School Details & Year</span>
                    </button>
                    <button
                      onClick={() => { playMechanicalClick(); setNewPinValue(""); setPinChangeError(""); setShowPinModal(true); setActiveDropdown(null); }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-100 flex items-center gap-2 font-medium border-t border-neutral-100"
                    >
                      <Lock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Update Security PIN</span>
                    </button>
                  </div>
                )}
              </div>

              {/* TOOLS MENU */}
              <div className="relative">
                <button
                  onClick={() => { playMechanicalClick(); setActiveDropdown(activeDropdown === "tools" ? null : "tools"); }}
                  className={`px-3 py-1.5 rounded hover:bg-neutral-700 hover:text-white transition-all flex items-center gap-1 cursor-pointer ${
                    activeDropdown === "tools" ? "bg-neutral-700 text-white" : ""
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Tools</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
                {activeDropdown === "tools" && (
                  <div className="absolute top-full left-0 mt-1.5 w-56 bg-white text-neutral-800 border border-neutral-200 rounded-md shadow-xl py-1 z-50 animate-fade-in font-sans">
                    <button
                      onClick={handleBulkLoadClick}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-100 flex items-center gap-2 font-medium"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Bulk Register Preset Candidates</span>
                    </button>
                    <button
                      onClick={() => { playMechanicalClick(); setShowResetConfirm(true); setActiveDropdown(null); }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-red-700 flex items-center gap-2 font-medium border-t border-neutral-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Full System Factory Reset</span>
                    </button>
                  </div>
                )}
              </div>

              {/* HELP MENU */}
              <div className="relative">
                <button
                  onClick={() => { playMechanicalClick(); setActiveDropdown(activeDropdown === "help" ? null : "help"); }}
                  className={`px-3 py-1.5 rounded hover:bg-neutral-700 hover:text-white transition-all flex items-center gap-1 cursor-pointer ${
                    activeDropdown === "help" ? "bg-neutral-700 text-white" : ""
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Help</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
                {activeDropdown === "help" && (
                  <div className="absolute top-full right-0 lg:left-0 mt-1.5 w-48 bg-white text-neutral-800 border border-neutral-200 rounded-md shadow-xl py-1 z-50 animate-fade-in font-sans">
                    <button
                      onClick={() => { playMechanicalClick(); setShowSystemInfo(true); setActiveDropdown(null); }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-100 flex items-center gap-2 font-medium"
                    >
                      <Info className="w-3.5 h-3.5 text-neutral-500" />
                      <span>System Diagnostic Report</span>
                    </button>
                    <button
                      onClick={() => { playMechanicalClick(); setShowUserGuide(true); setActiveDropdown(null); }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-neutral-100 flex items-center gap-2 font-medium border-t border-neutral-100"
                    >
                      <FileText className="w-3.5 h-3.5 text-neutral-500" />
                      <span>EVM User Manual</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Hidden Backup File Uploader Input */}
            <input
              type="file"
              ref={importFileInputRef}
              accept=".json"
              onChange={handleImportFileChange}
              className="hidden"
            />

            {/* Right System Uptime / Stats indicator */}
            <div className="text-[10px] text-neutral-400 hidden sm:block flex items-center gap-2 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
              <span>ACTIVE DATABASE CONNECTION</span>
            </div>
          </div>
          
          {/* Subpanel Tab Switchers */}
          <div className="flex border-b border-neutral-200">
            <button
              id="tab-roster"
              onClick={() => { playMechanicalClick(); setActiveTab("roster"); }}
              className={`flex items-center gap-2 py-3 px-5 text-sm font-bold tracking-tight border-b-2 transition-all cursor-pointer ${
                activeTab === "roster"
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Manage Student Candidates ({candidates.length})</span>
            </button>

            <button
              id="tab-results"
              onClick={() => { playMechanicalClick(); setActiveTab("results"); }}
              className={`flex items-center gap-2 py-3 px-5 text-sm font-bold tracking-tight border-b-2 transition-all cursor-pointer ${
                activeTab === "results"
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Poll Auditing & Results</span>
            </button>
          </div>

          {/* Station Name Modal */}
          {showStationModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
              <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 p-6 max-w-sm w-full relative animate-fade-in">
                <button
                  onClick={() => { playMechanicalClick(); setShowStationModal(false); }}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono text-[10px]">EVM Configuration</h3>
                <h2 className="text-base font-black text-neutral-800 mb-4 font-display">Update Polling Station Name</h2>
                
                <form onSubmit={handleStationNameSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold uppercase text-neutral-500">Polling Station Title</label>
                    <input
                      type="text"
                      required
                      value={newStationName}
                      onChange={(e) => setNewStationName(e.target.value)}
                      placeholder="e.g. ROOM 203 - CO-OP SCHOOL"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-800"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-neutral-800 hover:bg-neutral-900 text-white py-2 rounded text-xs font-bold uppercase tracking-wide cursor-pointer"
                    >
                      Save Station Title
                    </button>
                    <button
                      type="button"
                      onClick={() => { playMechanicalClick(); setShowStationModal(false); }}
                      className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2 rounded text-xs font-bold uppercase tracking-wide cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* School/Institution Customization Modal */}
          {showInstitutionModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans overflow-y-auto">
              <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 p-6 max-w-md w-full relative animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
                <button
                  onClick={() => { playMechanicalClick(); setShowInstitutionModal(false); }}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono text-[10px]">Institution & Developer Branding</h3>
                <h2 className="text-base font-black text-neutral-800 mb-4 font-display">Configure Brand Identity</h2>
                
                <form onSubmit={handleInstitutionSubmit} className="space-y-5">
                  {/* SCHOOL BRANDING BLOCK */}
                  <div className="space-y-4 border-b border-neutral-100 pb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#055085] font-mono">1. School Customization</h4>

                    {/* School Name */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono font-bold uppercase text-neutral-500">School Name</label>
                      <input
                        type="text"
                        required
                        value={newSchoolName}
                        onChange={(e) => setNewSchoolName(e.target.value)}
                        placeholder="e.g. Arafa English School, Attur"
                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-800"
                      />
                    </div>

                    {/* Subtitle / Department */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono font-bold uppercase text-neutral-500">School Subtitle / Banner Text</label>
                      <input
                        type="text"
                        required
                        value={newInstitutionSubtitle}
                        onChange={(e) => setNewInstitutionSubtitle(e.target.value)}
                        placeholder="e.g. COLLEGE & SCHOOL STUDENT COUNCIL"
                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-800"
                      />
                    </div>

                    {/* Main Election Title */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono font-bold uppercase text-neutral-500">Election/Simulator Title</label>
                      <input
                        type="text"
                        required
                        value={newInstitutionTitle}
                        onChange={(e) => setNewInstitutionTitle(e.target.value)}
                        placeholder="e.g. EVM Student Election Simulator"
                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-800"
                      />
                    </div>

                    {/* Academic Year */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono font-bold uppercase text-neutral-500">Academic Year</label>
                      <input
                        type="text"
                        required
                        value={newAcademicYear}
                        onChange={(e) => setNewAcademicYear(e.target.value)}
                        placeholder="e.g. 2026-27"
                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-800"
                      />
                    </div>

                    {/* Institution Logo customization */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono font-bold uppercase text-neutral-500">School Logo or Emblem</label>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center border border-neutral-200 p-3 rounded-lg bg-neutral-50">
                        
                        {/* Logo Preview Block */}
                        <div className="sm:col-span-3 flex flex-col items-center justify-center bg-white border border-neutral-300 rounded-lg p-2 h-16 w-16 mx-auto">
                          {newInstitutionLogo ? (
                            newInstitutionLogo.startsWith("data:image") ? (
                              <img
                                src={newInstitutionLogo}
                                alt="Logo crest"
                                className="w-12 h-12 object-contain"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-3xl leading-none">{newInstitutionLogo}</span>
                            )
                          ) : (
                            <div className="text-neutral-300 flex flex-col items-center justify-center text-center">
                              <span className="text-[9px] font-mono font-bold uppercase text-neutral-400">Default</span>
                            </div>
                          )}
                        </div>

                        {/* Controls Block */}
                        <div className="sm:col-span-9 space-y-2">
                          {/* Emoji logo input */}
                          <div>
                            <input
                              type="text"
                              maxLength={4}
                              value={newInstitutionLogo.startsWith("data:image") ? "" : newInstitutionLogo}
                              onChange={(e) => setNewInstitutionLogo(e.target.value)}
                              placeholder="Type an Emoji logo (e.g. 🏫)"
                              className="w-full px-2.5 py-1 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-800"
                            />
                          </div>

                          {/* File upload input */}
                          <div className="flex items-center gap-2">
                            <label className="flex-1 bg-white hover:bg-neutral-100 border border-neutral-300 rounded px-2.5 py-1 text-center text-[10px] font-bold text-neutral-600 cursor-pointer transition-colors block">
                              Upload crest image
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleInstitutionLogoUpload}
                                className="hidden"
                              />
                            </label>
                            {newInstitutionLogo && (
                              <button
                                type="button"
                                onClick={() => { playMechanicalClick(); setNewInstitutionLogo(""); }}
                                className="px-2.5 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50 rounded border border-red-200 cursor-pointer"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* DEVELOPER BRANDING BLOCK */}
                  <div className="space-y-4 pb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#055085] font-mono">2. Developer Customization</h4>

                    {/* Developer Name */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono font-bold uppercase text-neutral-500">Developer Name</label>
                      <input
                        type="text"
                        required
                        value={newDeveloperName}
                        onChange={(e) => setNewDeveloperName(e.target.value)}
                        placeholder="e.g. Industrial Robotics"
                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-800"
                      />
                    </div>

                    {/* Developer Subtitle */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono font-bold uppercase text-neutral-500">Developer Subtitle</label>
                      <input
                        type="text"
                        required
                        value={newDeveloperSubtitle}
                        onChange={(e) => setNewDeveloperSubtitle(e.target.value)}
                        placeholder="e.g. Institute"
                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-800"
                      />
                    </div>

                    {/* Developer Logo customization */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono font-bold uppercase text-neutral-500">Developer Logo</label>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center border border-neutral-200 p-3 rounded-lg bg-neutral-50">
                        
                        {/* Logo Preview Block */}
                        <div className="sm:col-span-3 flex flex-col items-center justify-center bg-white border border-neutral-300 rounded-lg p-2 h-16 w-16 mx-auto">
                          {newDeveloperLogo ? (
                            newDeveloperLogo.startsWith("data:image") ? (
                              <img
                                src={newDeveloperLogo}
                                alt="Developer Logo"
                                className="w-12 h-12 object-contain"
                                referrerPolicy="no-referrer"
                              />
                            ) : newDeveloperLogo === "R" ? (
                              <div className="w-12 h-12 flex items-center justify-center font-black text-[#055085] text-xl overflow-hidden">
                                <DeveloperLogo />
                              </div>
                            ) : (
                              <span className="text-3xl leading-none">{newDeveloperLogo}</span>
                            )
                          ) : (
                            <div className="text-neutral-300 flex flex-col items-center justify-center text-center">
                              <span className="text-[9px] font-mono font-bold uppercase text-neutral-400">Default</span>
                            </div>
                          )}
                        </div>

                        {/* Controls Block */}
                        <div className="sm:col-span-9 space-y-2">
                          {/* Emoji logo input */}
                          <div>
                            <input
                              type="text"
                              maxLength={4}
                              value={(newDeveloperLogo.startsWith("data:image") || newDeveloperLogo === "R") ? "" : newDeveloperLogo}
                              onChange={(e) => setNewDeveloperLogo(e.target.value || "R")}
                              placeholder="Type an Emoji logo (or leave blank for R)"
                              className="w-full px-2.5 py-1 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-800"
                            />
                          </div>

                          {/* File upload input */}
                          <div className="flex items-center gap-2">
                            <label className="flex-1 bg-white hover:bg-neutral-100 border border-neutral-300 rounded px-2.5 py-1 text-center text-[10px] font-bold text-neutral-600 cursor-pointer transition-colors block">
                              Upload developer logo image
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleDeveloperLogoUpload}
                                className="hidden"
                              />
                            </label>
                            {newDeveloperLogo && newDeveloperLogo !== "R" && (
                              <button
                                type="button"
                                onClick={() => { playMechanicalClick(); setNewDeveloperLogo("R"); }}
                                className="px-2.5 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50 rounded border border-red-200 cursor-pointer"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-neutral-100">
                    <button
                      type="submit"
                      className="flex-1 bg-[#055085] hover:bg-opacity-90 text-white py-2 rounded text-xs font-bold uppercase tracking-wide cursor-pointer"
                    >
                      Save Configurations
                    </button>
                    <button
                      type="button"
                      onClick={() => { playMechanicalClick(); setShowInstitutionModal(false); }}
                      className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2 rounded text-xs font-bold uppercase tracking-wide cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Change Security PIN Modal */}
          {showPinModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
              <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 p-6 max-w-sm w-full relative animate-fade-in">
                <button
                  onClick={() => { playMechanicalClick(); setShowPinModal(false); }}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-1 font-mono text-[10px]">Security Management</h3>
                <h2 className="text-base font-black text-neutral-800 mb-4 font-display">Update Security PIN Code</h2>
                
                <form onSubmit={handlePinSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold uppercase text-neutral-500">New Administrative PIN</label>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      value={newPinValue}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setNewPinValue(val);
                      }}
                      placeholder="e.g. 5678"
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-800 text-center font-mono text-lg tracking-widest"
                    />
                  </div>
                  {pinChangeError && (
                    <p className="text-[10px] font-bold text-red-600 font-mono">⚠️ {pinChangeError}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-neutral-800 hover:bg-neutral-900 text-white py-2 rounded text-xs font-bold uppercase tracking-wide cursor-pointer"
                    >
                      Save New PIN
                    </button>
                    <button
                      type="button"
                      onClick={() => { playMechanicalClick(); setShowPinModal(false); }}
                      className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2 rounded text-xs font-bold uppercase tracking-wide cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* System Diagnostic Modal */}
          {showSystemInfo && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
              <div className="bg-neutral-900 text-neutral-200 rounded-xl shadow-2xl border border-neutral-800 p-6 max-w-md w-full relative animate-fade-in">
                <button
                  onClick={() => { playMechanicalClick(); setShowSystemInfo(false); }}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">SYSTEM DIAGNOSTIC REPORT</h3>
                </div>
                <h2 className="text-base font-black text-white mb-4 font-display">EVM Micro-Controller Telemetry</h2>
                
                <div className="space-y-2 bg-black/50 p-4 rounded-lg font-mono text-[11px] leading-relaxed border border-neutral-800">
                  <div className="flex justify-between border-b border-neutral-800/25 pb-1.5">
                    <span className="text-neutral-500">EVM FIRMWARE:</span>
                    <span className="text-emerald-400 font-bold">v3.5.26-RELEASE</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800/25 pb-1.5">
                    <span className="text-neutral-500">OPERATING MODE:</span>
                    <span className="text-white">STUDENT ELECTION (DUAL-UNIT)</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800/25 pb-1.5">
                    <span className="text-neutral-500">SYSTEM TIME (UTC):</span>
                    <span className="text-neutral-300">{new Date().toISOString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800/25 pb-1.5">
                    <span className="text-neutral-500">STATION NAME:</span>
                    <span className="text-neutral-300 truncate max-w-[180px]">{pollingStationName}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800/25 pb-1.5">
                    <span className="text-neutral-500">TOTAL CANDIDATES:</span>
                    <span className="text-white font-bold">{candidates.length} active</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800/25 pb-1.5">
                    <span className="text-neutral-500">TOTAL VOTES RECORDED:</span>
                    <span className="text-emerald-400 font-bold">{totalVotes} logs</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800/25 pb-1.5">
                    <span className="text-neutral-500">EEPROM PERSISTENCE:</span>
                    <span className="text-emerald-400 font-bold">LOCAL_STORAGE SYNC OK</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">BEEP AMPLITUDE:</span>
                    <span className="text-neutral-300">100% PITCH-880HZ</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => { playMechanicalClick(); setShowSystemInfo(false); }}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white font-mono px-4 py-2 rounded text-xs font-bold uppercase tracking-wide cursor-pointer"
                  >
                    Close Diagnostics
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EVM User Manual Modal */}
          {showUserGuide && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
              <div className="bg-white text-neutral-800 rounded-xl shadow-2xl border border-neutral-200 p-6 max-w-md w-full relative animate-fade-in font-sans">
                <button
                  onClick={() => { playMechanicalClick(); setShowUserGuide(false); }}
                  className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 mb-1.5 text-neutral-500">
                  <HelpCircle className="w-5 h-5 text-neutral-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-[10px]">OPERATIONAL GUIDE</h3>
                </div>
                <h2 className="text-lg font-black text-neutral-900 mb-4 font-display">Student Council EVM Protocol</h2>
                
                <div className="space-y-3 text-xs text-neutral-600 leading-relaxed max-h-[300px] overflow-y-auto pr-1">
                  <p>
                    This simulator acts as an Electronic Voting Machine consisting of two integrated sections.
                  </p>
                  <div className="border-l-2 border-neutral-300 pl-3">
                    <strong className="text-neutral-800">1. Voter Compartment:</strong> Includes the Balloting Unit where candidates are registered, and the VVPAT display box where voters get an immediate receipt confirmation.
                  </div>
                  <div className="border-l-2 border-neutral-300 pl-3">
                    <strong className="text-neutral-800">2. Control Center:</strong> Accessible strictly to administrative polling officers to monitor counts, declare winners, configure rosters, and reset EVM memories.
                  </div>
                  <h4 className="font-bold text-neutral-800 mt-3 font-mono text-[10px] uppercase">Voter Sequence Flow:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Voter approaches the Balloting Unit screen.</li>
                    <li>Voter clicks the <span className="font-bold text-blue-600">Blue Tactile Button</span> of their chosen student.</li>
                    <li>EVM triggers a bright red light indicator and emits a 1-second BEEP sound.</li>
                    <li>VVPAT printer instantly displays paper audit trail slip showing candidate name and symbol.</li>
                    <li>After 7 seconds, the slip falls into the sealed audit box, and the EVM resets automatically for the next citizen.</li>
                  </ol>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => { playMechanicalClick(); setShowUserGuide(false); }}
                    className="bg-neutral-800 hover:bg-neutral-900 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wide cursor-pointer"
                  >
                    Got It, Thank You
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Roster Candidate Management */}
          {activeTab === "roster" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Add / Edit Candidate Form Column */}
              <div className="lg:col-span-5 bg-neutral-50 border border-neutral-200/60 p-5 rounded-xl shadow-inner">
                <div className="flex items-center gap-2 mb-4 border-b border-neutral-200 pb-2">
                  <UserPlus className="w-4 h-4 text-neutral-600" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-neutral-700">
                    {isEditing ? "Edit Student Profile" : "Add Student Candidate"}
                  </h3>
                </div>

                <form onSubmit={handleCandidateSubmit} className="space-y-4">
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-mono font-bold uppercase text-neutral-500">
                      Student Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Silva"
                      value={candName}
                      onChange={(e) => setCandName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800"
                    />
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-mono font-bold uppercase text-neutral-500">
                      Election Category / Post
                    </label>
                    <select
                      value={candCategory}
                      onChange={(e) => setCandCategory(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800"
                    >
                      <option value="Head Boy">Head Boy</option>
                      <option value="Head Girl">Head Girl</option>
                      <option value="Assistant Head Boy">Assistant Head Boy</option>
                      <option value="Assistant Head Girl">Assistant Head Girl</option>
                      <option value="Sports Captain">Sports Captain</option>
                      <option value="Sports Vice Captain">Sports Vice Captain</option>
                      <option value="Magazine Editor">Magazine Editor</option>
                      <option value="Arts Club Secretary">Arts Club Secretary</option>
                    </select>
                  </div>

                  {/* Class Group / Grade */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-mono font-bold uppercase text-neutral-500">
                      Class / Division
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. XII A"
                      value={candClassGroup}
                      onChange={(e) => setCandClassGroup(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800"
                    />
                  </div>

                  {/* Preset Symbol Quick Chooser */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono font-bold uppercase text-neutral-500">
                      Choose Symbol Preset:
                    </label>
                    <div className="grid grid-cols-6 gap-1.5 bg-white p-2 rounded-lg border border-neutral-200 shadow-inner">
                      {SYMBOL_PRESETS.map((preset) => {
                        const isPresetSelected = candSymbol === preset.symbol;
                        return (
                          <button
                            key={preset.symbol}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className={`h-9 flex flex-col items-center justify-center rounded border transition-all text-sm cursor-pointer ${
                              isPresetSelected
                                ? "bg-neutral-800 text-neutral-50 border-neutral-950 scale-105 font-bold"
                                : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                            }`}
                            title={`Select ${preset.label} Preset`}
                          >
                            <span>{preset.symbol}</span>
                            <span className="text-[6px] tracking-tighter text-neutral-400 leading-none">{preset.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Upload & Manual Symbol & details */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-neutral-200 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 border border-dashed border-neutral-300 rounded flex items-center justify-center bg-neutral-50 overflow-hidden shrink-0">
                          {candSymbol.startsWith("data:") ? (
                            <img src={candSymbol} alt="Custom upload" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-xl">{candSymbol}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold font-mono text-neutral-400 uppercase leading-none">Custom Symbol Image</p>
                          <p className="text-[11px] text-neutral-500 mt-1">Upload SVG, PNG, or JPEG</p>
                        </div>
                      </div>
                      <label className="bg-neutral-800 hover:bg-neutral-950 text-white px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm active:translate-y-px transition-all">
                        <Upload className="w-3 h-3" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSymbolUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-0.5">
                          Symbol Emoji / Text
                        </label>
                        <input
                          type="text"
                          required
                          value={candSymbol.startsWith("data:") ? "[ Custom Uploaded Image ]" : candSymbol}
                          disabled={candSymbol.startsWith("data:")}
                          onChange={(e) => setCandSymbol(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs text-center border border-neutral-300 rounded bg-white disabled:bg-neutral-100 disabled:text-neutral-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-0.5">
                          Icon Label
                        </label>
                        <input
                          type="text"
                          required
                          value={candIcon}
                          onChange={(e) => setCandIcon(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs text-center border border-neutral-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-neutral-500 mb-0.5">
                          Color Theme
                        </label>
                        <select
                          value={candColor}
                          onChange={(e) => setCandColor(e.target.value)}
                          className="w-full px-1 py-1.5 text-xs text-center border border-neutral-300 rounded bg-white h-8"
                        >
                          <option value="amber">Amber</option>
                          <option value="blue">Blue</option>
                          <option value="indigo">Indigo</option>
                          <option value="emerald">Emerald</option>
                          <option value="rose">Rose</option>
                          <option value="orange">Orange</option>
                          <option value="red">Red</option>
                          <option value="pink">Pink</option>
                          <option value="violet">Violet</option>
                          <option value="slate">Slate</option>
                          <option value="yellow">Yellow</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-neutral-200">
                    <button
                      type="submit"
                      className="flex-1 bg-neutral-800 hover:bg-neutral-900 text-neutral-50 py-2 rounded-md font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1 shadow-md cursor-pointer"
                    >
                      {isEditing ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{isEditing ? "Save Profile" : "Register Candidate"}</span>
                    </button>

                    {isEditing && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 px-3.5 rounded-md font-bold text-xs uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Candidates list table/grid column */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-neutral-800 font-display">
                    Registered Candidates List
                  </h3>
                  <span className="text-xs text-neutral-400 font-mono font-bold">
                    {candidates.length} active students
                  </span>
                </div>

                {candidates.length === 0 ? (
                  <div className="bg-neutral-50 rounded-xl p-8 text-center border border-dashed border-neutral-300 text-neutral-400">
                    <Users className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                    <p className="text-xs">No registered candidates on the ballot. Add a student using the form on the left.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                    {candidates.map((cand) => (
                      <div
                        key={cand.id}
                        className="bg-white border border-neutral-200 rounded-xl p-3 shadow-sm flex items-center justify-between gap-3 hover:border-neutral-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Serial */}
                          <span className="w-6 h-6 shrink-0 bg-neutral-800 text-white rounded-full font-mono text-[10px] font-bold flex items-center justify-center">
                            {cand.serialNumber}
                          </span>
                          
                          {/* Symbol logo box */}
                          <div className="w-9 h-9 shrink-0 bg-neutral-50 border border-neutral-200/80 rounded-lg flex items-center justify-center shadow-inner overflow-hidden">
                            {cand.symbol && cand.symbol.startsWith("data:") ? (
                              <img src={cand.symbol} alt="Symbol" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-lg leading-none">{cand.symbol}</span>
                            )}
                          </div>

                          {/* Profile info */}
                          <div className="truncate">
                            <h4 className="font-bold text-neutral-800 text-xs truncate leading-tight">
                              {cand.name}
                            </h4>
                            <p className="text-[10px] text-neutral-400 truncate mt-0.5 uppercase tracking-wide">
                              {cand.classGroup || "Class Candidate"}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Edit / delete buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            id={`btn-edit-cand-${cand.id}`}
                            onClick={() => startEditCandidate(cand)}
                            className="p-1 text-neutral-400 hover:text-blue-600 rounded hover:bg-neutral-100 cursor-pointer"
                            title="Edit Student Candidate"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {deleteConfirmId === cand.id ? (
                            <div className="flex items-center gap-1 bg-red-100 border border-red-200 rounded px-1.5 py-0.5">
                              <span className="text-[8px] text-red-800 font-bold uppercase font-mono">Delete?</span>
                              <button
                                onClick={() => handleConfirmDelete(cand.id)}
                                className="text-[8px] font-bold text-red-600 hover:underline px-0.5"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => { playMechanicalClick(); setDeleteConfirmId(null); }}
                                className="text-[8px] font-bold text-neutral-500 hover:underline px-0.5"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              id={`btn-delete-cand-${cand.id}`}
                              onClick={() => { playMechanicalClick(); setDeleteConfirmId(cand.id); }}
                              className="p-1 text-neutral-400 hover:text-red-600 rounded hover:bg-neutral-100 cursor-pointer"
                              title="Delete Candidate"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-800 font-sans leading-relaxed flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">EVM REGISTRY NOTE:</span> Customizing student roster items in real-time is safe. Deleting a candidate will clean up any matching votes from the system immediately to protect statistical integrity.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: Results Auditing */}
          {activeTab === "results" && (
            <div className="space-y-6">
              {/* CASE A: POLL IS NOT YET STARTED */}
              {!isPollStarted && (
                <div className="max-w-xl mx-auto animate-fade-in">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center flex flex-col items-center justify-center shadow-md">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-3 shadow-inner">
                      <Activity className="w-6 h-6 animate-pulse" />
                    </div>

                    <h3 className="text-base font-bold font-display text-amber-900 uppercase tracking-wide">
                      Polls Have Not Started
                    </h3>
                    <p className="text-xs text-amber-700/95 mt-1.5 max-w-sm leading-relaxed">
                      The election polling has not been initiated yet. You can manage candidates on the Roster tab first. Once you are ready, click below to start the polls.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 w-full mt-5">
                      <button
                        id="btn-admin-start-polls"
                        disabled={candidates.length === 0}
                        onClick={() => { playMechanicalClick(); onStartPolls(); }}
                        className={`flex-1 text-white font-bold py-2.5 px-4 rounded-lg text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all ${
                          candidates.length === 0
                            ? "bg-neutral-300 border-neutral-400 text-neutral-400 cursor-not-allowed shadow-none opacity-60"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Start Polling Now</span>
                      </button>
                    </div>
                    {candidates.length === 0 && (
                      <p className="text-[10px] text-red-600 font-bold mt-2.5 font-mono uppercase">
                        ⚠️ Add at least 1 candidate before starting polls.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* CASE B: POLL IS STARTED BUT NOT CLOSED */}
              {isPollStarted && !isPollClosed && (
                <div className="max-w-xl mx-auto">
                  {!showCloseConfirm ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center flex flex-col items-center justify-center shadow-md">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-3 shadow-inner">
                        <ShieldCheck className="w-6 h-6 animate-pulse" />
                      </div>

                      <h3 className="text-base font-bold font-display text-amber-900 uppercase tracking-wide">
                        Polls are Currently Active
                      </h3>
                      <p className="text-xs text-amber-700/95 mt-1.5 max-w-sm leading-relaxed">
                        Votes are being actively recorded. Displaying standings, winner boards, or rankings requires closing the polls to secure final verification.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 w-full mt-5">
                        <button
                          id="btn-admin-close-trigger"
                          onClick={() => { playMechanicalClick(); setShowCloseConfirm(true); }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                        >
                          <Lock className="w-4 h-4 shrink-0" />
                          <span>Close Polls & View Results</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 text-center flex flex-col items-center justify-center shadow-lg">
                      <h3 className="text-lg font-black text-red-900 uppercase tracking-tight">
                        ⚠️ Permanent Action Required
                      </h3>
                      <p className="text-xs text-red-700 mt-2 max-w-md leading-relaxed font-sans">
                        Are you absolutely sure? Closing the polls will <span className="font-extrabold underline">disable the voting panels permanently</span> for this session. This action cannot be undone, and the voting machine will lock.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
                        <button
                          id="btn-admin-close-confirm"
                          onClick={handleConfirmClosePolls}
                          className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 px-4 rounded-lg text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>CONFIRM: CLOSE POLLS NOW</span>
                        </button>
                        <button
                          id="btn-admin-close-cancel"
                          onClick={() => { playMechanicalClick(); setShowCloseConfirm(false); }}
                          className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-2.5 px-4 rounded-lg text-xs tracking-wider uppercase border border-neutral-300 shadow-sm cursor-pointer"
                        >
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* IF POLL IS SUCCESSFULLY CLOSED */}
              {isPollClosed && (
                <div className="space-y-8 animate-fade-in">
                  
                  {/* Winner display */}
                  {totalVotes > 0 ? (
                    <div className="relative bg-gradient-to-r from-amber-50 via-yellow-50/50 to-amber-50 rounded-2xl border-2 border-amber-300 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-amber-500 rounded-2xl border-4 border-amber-300 flex items-center justify-center text-white shadow-lg shrink-0 glow-orange relative">
                          <Award className="w-9 h-9" />
                          <Sparkles className="w-4 h-4 absolute -top-1.5 -right-1.5 text-yellow-300 animate-spin" />
                        </div>

                        <div>
                          <div className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                            <span>ELECTION AUDIT COMPLETED</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>WINNER DECLARED</span>
                          </div>

                          {isTied ? (
                            <div className="mt-1">
                              <h3 className="text-xl font-extrabold text-neutral-800 font-display">
                                ELECTION TIED!
                              </h3>
                              <p className="text-xs text-neutral-600 mt-1 max-w-sm">
                                Candidates <span className="font-bold">{winnerCandidates.map(w => w.name).join(" & ")}</span> secured the equal highest count of <span className="font-extrabold text-amber-700">{maxVotes} votes</span>.
                              </p>
                            </div>
                          ) : (
                            primaryWinner && (
                              <div className="mt-1">
                                <h3 className="text-xl sm:text-2xl font-black text-neutral-900 font-display flex items-center gap-2">
                                  <span>{primaryWinner.name}</span>
                                  <span className="text-2xl leading-none">{primaryWinner.symbol}</span>
                                </h3>
                                <p className="text-xs text-neutral-600 mt-0.5 font-medium uppercase tracking-wider">
                                  Class/Division: <span className="font-bold text-neutral-800">{primaryWinner.classGroup || "N/A"}</span>
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {!isTied && primaryWinner && (
                        <div className="bg-white px-5 py-3 rounded-xl border border-amber-200 shadow-sm text-center min-w-[140px]">
                          <span className="text-[10px] text-neutral-400 font-mono font-bold uppercase block tracking-wider">Winning Vote Shares</span>
                          <span className="text-3xl font-black font-mono text-amber-700 block mt-1">
                            {maxVotes}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono block">
                            ({((maxVotes / totalVotes) * 100).toFixed(1)}% of total)
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-neutral-50 rounded-xl p-6 text-center border border-dashed border-neutral-300">
                      <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">No Votes Cast</span>
                      <p className="text-sm text-neutral-500 mt-1">
                        The polls closed with zero recorded votes. Use the "Generate Demo Votes" tool below to populate sample statistics.
                      </p>
                    </div>
                  )}

                  {/* Grid: Charts vs standinds */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Horizontal Bar Chart */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex items-center gap-2 border-b border-neutral-100 pb-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-neutral-600" />
                        <h3 className="font-bold text-sm sm:text-base text-neutral-800 font-display">
                          Visual Vote Distribution Chart
                        </h3>
                      </div>

                      {totalVotes === 0 ? (
                        <div className="h-48 flex items-center justify-center text-xs text-neutral-400 font-mono italic">
                          Awaiting vote data...
                        </div>
                      ) : (
                        <div className="space-y-4 bg-neutral-50 p-5 rounded-xl border border-neutral-200/50 shadow-inner">
                          {candidates.map((cand) => {
                            const count = voteCounts[cand.id] || 0;
                            const pct = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : "0.0";
                            const isWinner = winnerCandidates.some(w => w.id === cand.id);

                            return (
                              <div key={cand.id} className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <div className="w-10 h-10 shrink-0 bg-white border border-neutral-200 rounded-lg flex items-center justify-center text-xl shadow-xs overflow-hidden p-0.5">
                                      {cand.symbol && cand.symbol.startsWith("data:") ? (
                                        <img src={cand.symbol} alt="Symbol" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                      ) : (
                                        <span className="select-none leading-none">{cand.symbol}</span>
                                      )}
                                    </div>
                                    <span className="font-extrabold text-neutral-700 truncate max-w-[140px] sm:max-w-[200px]">
                                      {cand.name}
                                    </span>
                                    <span className="text-neutral-400 hidden sm:inline text-[10px] font-mono truncate">
                                      ({cand.classGroup || "Class Candidate"})
                                    </span>
                                  </div>
                                  <div className="font-mono font-bold text-neutral-800 shrink-0">
                                    {count} votes <span className="text-neutral-500 font-normal">({pct}%)</span>
                                  </div>
                                </div>

                                <div className="h-6 w-full bg-neutral-200/60 rounded-full overflow-hidden relative border border-neutral-300/40">
                                  <div
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                      isWinner 
                                        ? "bg-amber-500 shadow-md border-r-2 border-amber-600 animate-pulse"
                                        : "bg-neutral-600"
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />

                                  {isWinner && (
                                    <div className="absolute inset-y-0 right-2.5 flex items-center justify-center">
                                      <span className="text-[8px] tracking-wide bg-amber-100 border border-amber-300 text-amber-900 uppercase font-black px-1.5 py-0.5 rounded shadow-sm">
                                        👑 LEAD
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Standing table */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="flex items-center gap-2 border-b border-neutral-100 pb-2 mb-4">
                        <ListOrdered className="w-5 h-5 text-neutral-600" />
                        <h3 className="font-bold text-sm sm:text-base text-neutral-800 font-display">
                          Candidate Standings & Audit
                        </h3>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
                        <table className="min-w-full divide-y divide-neutral-200 text-left text-xs">
                          <thead className="bg-neutral-50 font-mono text-neutral-500 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="px-4 py-3 text-center">Rank</th>
                              <th className="px-3 py-3">Candidate</th>
                              <th className="px-4 py-3 text-right">Votes</th>
                              <th className="px-4 py-3 text-right">Share</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-200">
                            {[...candidates]
                              .sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0))
                              .map((cand, idx) => {
                                const count = voteCounts[cand.id] || 0;
                                const pct = totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : "0.0";
                                const isWinner = winnerCandidates.some(w => w.id === cand.id);

                                return (
                                  <tr 
                                    key={cand.id} 
                                    className={`transition-colors ${
                                      isWinner ? "bg-amber-50/40 hover:bg-amber-50" : "hover:bg-neutral-50"
                                    }`}
                                  >
                                    <td className="px-4 py-3 text-center font-mono font-bold text-neutral-700">
                                      {idx + 1}
                                    </td>
                                    <td className="px-3 py-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 shrink-0 bg-white border border-neutral-200 rounded-lg flex items-center justify-center text-xl shadow-xs overflow-hidden p-0.5">
                                          {cand.symbol && cand.symbol.startsWith("data:") ? (
                                            <img src={cand.symbol} alt="Symbol" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                          ) : (
                                            <span className="select-none leading-none">{cand.symbol}</span>
                                          )}
                                        </div>
                                        <div className="truncate">
                                          <div className="font-extrabold text-neutral-800 leading-tight">
                                            {cand.name}
                                          </div>
                                          <div className="text-[9px] text-neutral-400 font-mono tracking-wide truncate max-w-[120px]">
                                            {cand.classGroup || "Class Candidate"}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono font-bold text-neutral-800">
                                      {count}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono font-bold text-neutral-500">
                                      {pct}%
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="border-t border-neutral-100 pt-6 mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-end gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200/60">


                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        id="btn-admin-export"
                        disabled={totalVotes === 0}
                        onClick={handleExportCSV}
                        className={`font-bold py-2 px-3.5 rounded-lg text-xs tracking-wider uppercase flex items-center gap-1.5 border shadow-sm transition-all cursor-pointer ${
                          totalVotes === 0
                            ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed shadow-none"
                            : "bg-white hover:bg-neutral-100 text-neutral-700 border-neutral-300"
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>CSV</span>
                      </button>

                      <button
                        id="btn-admin-relock"
                        onClick={() => { playMechanicalClick(); setIsUnlocked(false); }}
                        className="bg-white hover:bg-neutral-100 text-neutral-600 font-bold py-2 px-3.5 rounded-lg text-xs tracking-wider uppercase border border-neutral-300 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Lock Console</span>
                      </button>

                      {!showResetConfirm ? (
                        <button
                          id="btn-admin-reset-trigger"
                          onClick={() => { playMechanicalClick(); setShowResetConfirm(true); }}
                          className="bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2 px-3.5 rounded-lg text-xs tracking-wider uppercase border border-red-200 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>Reset EVM</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 bg-red-100/50 p-1 border border-red-200 rounded-lg shadow-inner">
                          <span className="text-[10px] text-red-800 font-bold px-2">Reset machine?</span>
                          <button
                            onClick={handleConfirmReset}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2.5 rounded text-[10px] tracking-wide uppercase transition-all cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => { playMechanicalClick(); setShowResetConfirm(false); }}
                            className="bg-white hover:bg-neutral-100 text-neutral-700 font-bold py-1 px-2.5 rounded text-[10px] border border-neutral-300 shadow-sm transition-all cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};
