import React, { useState, useEffect } from "react";
import { 
  Vote, GraduationCap, Calendar, Settings, X, ShieldAlert, Cpu, CheckCircle2, Lock,
  Menu, ChevronRight, Award, ArrowLeft, BarChart3, ListOrdered, Sparkles, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Candidate, VoteRecord, VVPATState } from "./types";
import { BallotingUnit } from "./components/BallotingUnit";
import { VVPATUnit } from "./components/VVPATUnit";
import { AdminPanel } from "./components/AdminPanel";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { playEVMBeep, playMechanicalClick, playCategoryBeep } from "./utils/audio";
import { DEFAULT_CANDIDATES } from "./utils/candidates";
import { onSnapshot } from "firebase/firestore";
import { defaultConfigDocRef, defaultVotesDocRef, votesColRef, addVotesToCollection, clearAllVotesCollection, deleteVotesForCandidate, initializeDatabaseIfEmpty, updateElectionConfig, updateElectionVotes, handleFirestoreError, OperationType } from "./lib/firebase";

function DeveloperLogo() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left Bracket [ */}
      <path
        d="M 30 10 H 18 A 12 12 0 0 0 6 22 V 78 A 12 12 0 0 0 18 90 H 30 V 78 H 18 V 22 H 30 Z"
        fill="#055085"
      />

      {/* R Stem */}
      <rect x="32" y="10" width="12" height="80" fill="#0ea5e9" />

      {/* R Left Arm */}
      <path
        d="M 32 44 H 21 A 6 6 0 0 0 21 56 H 32 Z"
        fill="#0ea5e9"
      />

      {/* R Loop */}
      <path
        d="M 44 10 H 51 A 15 15 0 0 1 66 25 V 52 H 44 Z"
        fill="#0ea5e9"
      />

      {/* R Diagonal Leg */}
      <polygon
        points="44,52 56,52 70,90 58,90"
        fill="#0ea5e9"
      />

      {/* R Loop Hole (Capsule) */}
      <rect x="44" y="21" width="10" height="18" rx="5" fill="#ffffff" />

      {/* Eye (Dark Blue) */}
      <circle cx="49" cy="30" r="4.5" fill="#055085" />

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

export default function App() {
  // --- Dynamic Candidates State ---
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    const saved = localStorage.getItem("evm_student_candidates_2026_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_CANDIDATES;
  });

  const [votes, setVotes] = useState<VoteRecord[]>(() => {
    const saved = localStorage.getItem("evm_student_votes_2026_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });
  
  const [isPollClosed, setIsPollClosed] = useState<boolean>(() => {
    const saved = localStorage.getItem("evm_poll_closed_2026");
    return saved ? JSON.parse(saved) : false;
  });

  // --- Multi-Screen View Router state ---
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "voting" | "results">("welcome");

  // --- Grouping and stats Helpers ---
  const categoriesList = React.useMemo(() => {
    const set = new Set<string>();
    candidates.forEach(c => set.add(c.category || "General Candidates"));
    return Array.from(set);
  }, [candidates]);

  const candidatesByCategory = React.useMemo(() => {
    const map: Record<string, Candidate[]> = {};
    candidates.forEach(c => {
      const cat = c.category || "General Candidates";
      if (!map[cat]) map[cat] = [];
      map[cat].push(c);
    });
    return map;
  }, [candidates]);
  
  // --- Active Voter Session votes: Map of Category -> Candidate ID ---
  const [voterSessionVotes, setVoterSessionVotes] = useState<Record<string, string>>({});
  const [showBallotSuccessOverlay, setShowBallotSuccessOverlay] = useState<boolean>(false);

  // --- Dynamic Admin/Station States ---
  const [pollingStationName, setPollingStationName] = useState<string>(() => {
    return localStorage.getItem("evm_station_name_2026") || "POLLING STATION NO. 4A";
  });

  const [adminPin, setAdminPin] = useState<string>(() => {
    const saved = localStorage.getItem("evm_admin_pin_2026");
    if (saved === "1234") return "admin@123";
    return saved || "admin@123";
  });

  const [institutionSubtitle, setInstitutionSubtitle] = useState<string>(() => {
    return localStorage.getItem("evm_institution_subtitle_2026") || "College & School Student Council";
  });

  const [institutionTitle, setInstitutionTitle] = useState<string>(() => {
    return localStorage.getItem("evm_institution_title_2026") || "EVM Student Election Simulator";
  });

  const [institutionLogo, setInstitutionLogo] = useState<string>(() => {
    return localStorage.getItem("evm_institution_logo_2026") || "";
  });

  const [footerLogo, setFooterLogo] = useState<string>(() => {
    return localStorage.getItem("evm_footer_logo_2026") || "R";
  });

  const [schoolName, setSchoolName] = useState<string>(() => {
    return localStorage.getItem("evm_school_name_2026") || "Arafa English School, Attur";
  });
  const displaySchoolName = schoolName === "Arafa English School, Attur" ? "" : schoolName;

  const [developerName, setDeveloperName] = useState<string>(() => {
    return localStorage.getItem("evm_developer_name_2026") || "Industrial Robotics";
  });

  const [developerSubtitle, setDeveloperSubtitle] = useState<string>(() => {
    return localStorage.getItem("evm_developer_subtitle_2026") || "Institute";
  });

  const [academicYear, setAcademicYear] = useState<string>(() => {
    return localStorage.getItem("evm_academic_year_2026") || "2026-27";
  });

  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [showPollNotStartedAlert, setShowPollNotStartedAlert] = useState<boolean>(false);

  // --- Hardware state ---
  const [isPollStarted, setIsPollStarted] = useState<boolean>(() => {
    const saved = localStorage.getItem("evm_poll_started_2026_v2");
    return saved ? JSON.parse(saved) : false;
  });
  const [isBallotActive, setIsBallotActive] = useState<boolean>(false); // Enabled once polls start
  const [isBusy, setIsBusy] = useState<boolean>(false); // Recording state
  const [votedCandidateId, setVotedCandidateId] = useState<string | null>(null); // Glow LED
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number>(0);

  // Reset category index when the voting session is cleared
  const completedCategoriesCount = Object.keys(voterSessionVotes).length;
  useEffect(() => {
    if (completedCategoriesCount === 0) {
      setCurrentCategoryIndex(0);
    }
  }, [completedCategoriesCount]);

  // Adjust active index if it goes out of bounds
  useEffect(() => {
    if (currentCategoryIndex >= categoriesList.length && categoriesList.length > 0) {
      setCurrentCategoryIndex(categoriesList.length - 1);
    }
  }, [categoriesList, currentCategoryIndex]);

  // --- VVPAT state ---
  const [vvpatState, setVvpatState] = useState<VVPATState>({
    candidate: null,
    isVisible: false,
    isPrinting: false,
    isDropping: false,
  });

  // --- Firebase Real-time Synchronization ---
  useEffect(() => {
    // Initialize DB with default candidates if it's empty
    initializeDatabaseIfEmpty(DEFAULT_CANDIDATES);

    // Subscribe to config doc
    const unsubConfig = onSnapshot(defaultConfigDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        
        if (data.isPollStarted !== undefined) setIsPollStarted(data.isPollStarted);
        if (data.isPollClosed !== undefined) setIsPollClosed(data.isPollClosed);
        if (data.pollingStationName !== undefined) setPollingStationName(data.pollingStationName);
        if (data.adminPin !== undefined) {
          if (data.adminPin === "1234") {
            setAdminPin("admin@123");
            updateElectionConfig({ adminPin: "admin@123" });
          } else {
            setAdminPin(data.adminPin);
          }
        }
        if (data.institutionSubtitle !== undefined) setInstitutionSubtitle(data.institutionSubtitle);
        if (data.institutionTitle !== undefined) setInstitutionTitle(data.institutionTitle);
        if (data.institutionLogo !== undefined) setInstitutionLogo(data.institutionLogo);
        if (data.footerLogo !== undefined) setFooterLogo(data.footerLogo);
        if (data.schoolName !== undefined) setSchoolName(data.schoolName);
        if (data.developerName !== undefined) setDeveloperName(data.developerName);
        if (data.developerSubtitle !== undefined) setDeveloperSubtitle(data.developerSubtitle);
        if (data.academicYear !== undefined) setAcademicYear(data.academicYear);
        if (data.candidates !== undefined) setCandidates(data.candidates);
      }
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, "elections/global_config");
      } catch (e) {
        console.warn("[Firestore fallback] config subscription failed. Operating in Offline/LocalStorage mode.");
      }
    });

    // Subscribe to votes collection for real-time multi-system sync
    const unsubVotes = onSnapshot(votesColRef, (snapshot) => {
      const fetchedVotes: VoteRecord[] = [];
      snapshot.forEach((doc) => {
        fetchedVotes.push({
          id: doc.id,
          ...doc.data()
        } as VoteRecord);
      });
      setVotes(fetchedVotes);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, "votes");
      } catch (e) {
        console.warn("[Firestore fallback] votes subscription failed. Operating in Offline/LocalStorage mode.");
      }
    });

    return () => {
      unsubConfig();
      unsubVotes();
    };
  }, []);

  // --- Sync storage ---
  useEffect(() => {
    localStorage.setItem("evm_student_candidates_2026_v2", JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem("evm_student_votes_2026_v2", JSON.stringify(votes));
  }, [votes]);

  useEffect(() => {
    localStorage.setItem("evm_poll_started_2026_v2", JSON.stringify(isPollStarted));
  }, [isPollStarted]);

  useEffect(() => {
    localStorage.setItem("evm_poll_closed_2026", JSON.stringify(isPollClosed));
    if (isPollClosed || !isPollStarted) {
      setIsBallotActive(false);
    } else {
      setIsBallotActive(true);
    }
  }, [isPollClosed, isPollStarted]);

  useEffect(() => {
    localStorage.setItem("evm_station_name_2026", pollingStationName);
  }, [pollingStationName]);

  useEffect(() => {
    localStorage.setItem("evm_admin_pin_2026", adminPin);
  }, [adminPin]);

  useEffect(() => {
    localStorage.setItem("evm_institution_subtitle_2026", institutionSubtitle);
  }, [institutionSubtitle]);

  useEffect(() => {
    localStorage.setItem("evm_institution_title_2026", institutionTitle);
  }, [institutionTitle]);

  useEffect(() => {
    localStorage.setItem("evm_institution_logo_2026", institutionLogo);
  }, [institutionLogo]);

  useEffect(() => {
    localStorage.setItem("evm_footer_logo_2026", footerLogo);
  }, [footerLogo]);

  useEffect(() => {
    localStorage.setItem("evm_school_name_2026", schoolName);
  }, [schoolName]);

  useEffect(() => {
    localStorage.setItem("evm_developer_name_2026", developerName);
  }, [developerName]);

  useEffect(() => {
    localStorage.setItem("evm_developer_subtitle_2026", developerSubtitle);
  }, [developerSubtitle]);

  useEffect(() => {
    localStorage.setItem("evm_academic_year_2026", academicYear);
  }, [academicYear]);

  // --- Grouping and stats Helpers ---

  const voteCounts = React.useMemo(() => {
    return candidates.reduce((acc, cand) => {
      acc[cand.id] = votes.filter(v => v.candidateId === cand.id).length;
      return acc;
    }, {} as Record<string, number>);
  }, [candidates, votes]);

  const totalVotersCount = React.useMemo(() => {
    return Array.from(new Set(votes.map(v => v.voterIndex))).length;
  }, [votes]);

  const isSessionVotedInAllCategories = React.useMemo(() => {
    if (categoriesList.length === 0) return false;
    return categoriesList.every(cat => !!voterSessionVotes[cat]);
  }, [voterSessionVotes, categoriesList]);

  // --- Core Voting Action (Category-by-category) ---
  const handleVoteCast = (candidate: Candidate) => {
    if (isPollClosed || isBusy || !isBallotActive) return;

    const cat = candidate.category || "General Candidates";
    if (voterSessionVotes[cat]) return; // Block double votes inside category

    // 1. Lit LED indicator & freeze other inputs
    setVotedCandidateId(candidate.id);
    setIsBusy(true);

    // 2. Play subtle mechanical clicking confirmation and category beep
    playMechanicalClick();
    playCategoryBeep();

    // 3. Register chosen candidate locally
    setVoterSessionVotes(prev => ({
      ...prev,
      [cat]: candidate.id
    }));

    // 4. Print VVPAT slip
    setVvpatState({
      candidate,
      isVisible: true,
      isPrinting: true,
      isDropping: false,
    });

    // 5. Trigger VVPAT slip falling sequence
    const dropTimer = setTimeout(() => {
      setVvpatState(prev => ({
        ...prev,
        isPrinting: false,
        isDropping: true,
      }));
    }, 1500);

    // 6. Complete voter action, clear VVPAT and unlock busy state
    const resetTimer = setTimeout(() => {
      setVotedCandidateId(null);
      setIsBusy(false);
      setVvpatState({
        candidate: null,
        isVisible: false,
        isPrinting: false,
        isDropping: false,
      });
    }, 2200);

    return () => {
      clearTimeout(dropTimer);
      clearTimeout(resetTimer);
    };
  };

  // --- Final secure ballot cast trigger ---
  const handleFinalBallotSubmit = () => {
    if (isBusy || Object.keys(voterSessionVotes).length === 0) return;

    setIsBusy(true);
    // Play loud 1-second EVM Piezo Beep
    playEVMBeep();

    // Append all session votes to permanent store
    // Assign a globally unique voter index using a precise timestamp and random number to support simultaneous multi-system voting without index conflicts
    const nextVoterIndex = Date.now() * 1000 + Math.floor(Math.random() * 1000);
    const newRecords: VoteRecord[] = Object.values(voterSessionVotes).map((candId, idx) => ({
      id: `vt-${Math.random().toString(36).substring(2, 11)}-${idx}`,
      candidateId: candId as string,
      timestamp: new Date().toISOString(),
      voterIndex: nextVoterIndex
    }));

    // Optimistically update local state while Firestore writes in the background
    const updatedVotes = [...votes, ...newRecords];
    setVotes(updatedVotes);
    addVotesToCollection(newRecords);

    // Show Thank You success screen
    setShowBallotSuccessOverlay(true);

    // Reset session after 3.5 seconds
    setTimeout(() => {
      setShowBallotSuccessOverlay(false);
      setVoterSessionVotes({});
      setCurrentScreen("voting");
      setIsBusy(false);
    }, 3500);
  };

  // --- Admin operations ---
  const handleStartPolls = () => {
    setIsPollStarted(true);
    setIsBallotActive(true);
    updateElectionConfig({ isPollStarted: true, isPollClosed: false });
  };

  const handleClosePolls = () => {
    setIsPollClosed(true);
    setIsBallotActive(false);
    updateElectionConfig({ isPollClosed: true });
  };

  const handleResetElection = () => {
    setVotes([]);
    setVoterSessionVotes({});
    setIsPollClosed(false);
    setIsPollStarted(false);
    setIsBallotActive(false);
    setIsBusy(false);
    setVotedCandidateId(null);
    setVvpatState({
      candidate: null,
      isVisible: false,
      isPrinting: false,
      isDropping: false,
    });
    clearAllVotesCollection();
    updateElectionConfig({ isPollStarted: false, isPollClosed: false });
  };

  const handleAddMockVotes = (count: number) => {
    if (candidates.length === 0) return;
    const mockRecords: VoteRecord[] = [];
    const now = new Date();

    let addedCount = 0;
    const startingVoterIndex = votes.length > 0 ? Math.max(...votes.map(v => v.voterIndex)) + 1 : 1;

    for (let i = 0; i < count; i++) {
      const currentVoterIdx = startingVoterIndex + i;

      // For this simulated voter, pick a random candidate in EACH category
      categoriesList.forEach((cat, categoryIndex) => {
        const catCands = candidatesByCategory[cat];
        if (catCands && catCands.length > 0) {
          const randomCand = catCands[Math.floor(Math.random() * catCands.length)];

          mockRecords.push({
            id: `vt-mock-${Math.random().toString(36).substring(2, 11)}-${categoryIndex}`,
            candidateId: randomCand.id,
            timestamp: new Date(now.getTime() - addedCount * 60000).toISOString(),
            voterIndex: currentVoterIdx
          });
        }
      });

      addedCount++;
    }

    if (mockRecords.length > 0) {
      const updatedVotes = [...votes, ...mockRecords];
      setVotes(updatedVotes);
      addVotesToCollection(mockRecords);
    }
  };

  // --- Candidate CRUD triggers from Admin Panel ---
  const handleRegisterCandidate = (newCand: any) => {
    const nextSerial = candidates.length > 0 ? Math.max(...candidates.map(c => c.serialNumber)) + 1 : 1;
    const created: Candidate = {
      id: `cand-${Math.random().toString(36).substring(2, 9)}`,
      serialNumber: nextSerial,
      name: newCand.name,
      symbol: newCand.symbol,
      iconName: newCand.iconName,
      color: newCand.color,
      category: newCand.category || "Head Boy",
      classGroup: newCand.classGroup || "XII A"
    };
    const updatedCandidates = [...candidates, created];
    setCandidates(updatedCandidates);
    updateElectionConfig({ candidates: updatedCandidates });
  };

  const handleEditCandidate = (updatedCand: Candidate) => {
    const updatedCandidates = candidates.map(c => c.id === updatedCand.id ? updatedCand : c);
    setCandidates(updatedCandidates);
    updateElectionConfig({ candidates: updatedCandidates });
  };

  const handleDeleteCandidate = (candId: string) => {
    const filtered = candidates.filter(c => c.id !== candId);
    const updatedCandidates = filtered.map((c, idx) => ({
      ...c,
      serialNumber: idx + 1
    }));
    const updatedVotes = votes.filter(v => v.candidateId !== candId);
    
    setCandidates(updatedCandidates);
    setVotes(updatedVotes);
    updateElectionConfig({ candidates: updatedCandidates });
    deleteVotesForCandidate(candId);
  };

  const handleImportBackupData = async (importedCandidates: Candidate[], importedVotes: VoteRecord[]) => {
    setCandidates(importedCandidates);
    setVotes(importedVotes);
    setIsPollClosed(false);
    setIsPollStarted(true);
    setIsBallotActive(true);
    setIsBusy(false);
    setVotedCandidateId(null);
    setVvpatState({
      candidate: null,
      isVisible: false,
      isPrinting: false,
      isDropping: false,
    });
    updateElectionConfig({
      candidates: importedCandidates,
      isPollClosed: false,
      isPollStarted: true
    });
    await clearAllVotesCollection();
    if (importedVotes.length > 0) {
      await addVotesToCollection(importedVotes);
    }
  };

  const handleUpdatePin = (val: string) => {
    setAdminPin(val);
    updateElectionConfig({ adminPin: val });
  };
  const handleUpdateStationName = (val: string) => {
    setPollingStationName(val);
    updateElectionConfig({ pollingStationName: val });
  };
  const handleUpdateInstitutionSubtitle = (val: string) => {
    setInstitutionSubtitle(val);
    updateElectionConfig({ institutionSubtitle: val });
  };
  const handleUpdateInstitutionTitle = (val: string) => {
    setInstitutionTitle(val);
    updateElectionConfig({ institutionTitle: val });
  };
  const handleUpdateInstitutionLogo = (val: string) => {
    setInstitutionLogo(val);
    updateElectionConfig({ institutionLogo: val });
  };
  const handleUpdateFooterLogo = (val: string) => {
    setFooterLogo(val);
    updateElectionConfig({ footerLogo: val });
  };
  const handleUpdateAcademicYear = (val: string) => {
    setAcademicYear(val);
    updateElectionConfig({ academicYear: val });
  };
  const handleUpdateSchoolName = (val: string) => {
    setSchoolName(val);
    updateElectionConfig({ schoolName: val });
  };
  const handleUpdateDeveloperName = (val: string) => {
    setDeveloperName(val);
    updateElectionConfig({ developerName: val });
  };
  const handleUpdateDeveloperSubtitle = (val: string) => {
    setDeveloperSubtitle(val);
    updateElectionConfig({ developerSubtitle: val });
  };
  const handleUpdateDeveloperLogo = (val: string) => {
    setFooterLogo(val);
    updateElectionConfig({ footerLogo: val });
  };

  // Helper to open admin sidebar
  const handleOpenAdminPanel = () => {
    playMechanicalClick();
    setIsMenuOpen(false);
    setIsAdminSidebarOpen(true);
  };

  const handleStartVotingClick = () => {
    playMechanicalClick();
    if (!isPollStarted) {
      setShowPollNotStartedAlert(true);
      return;
    }
    setCurrentScreen("voting");
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#055085] via-[#0b72a6] to-[#043355] text-neutral-800 font-sans flex flex-col justify-between relative overflow-hidden">
      
      {/* Background visual geometric grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Main Content Router Block */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto flex flex-col justify-center items-center px-4 py-8 relative z-10">
        
        {/* VIEW 1: WELCOME / STARTING SCREEN (IMAGE 3) */}
        {currentScreen === "welcome" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-white rounded-3xl p-8 sm:p-11 shadow-2xl relative border border-white/20 text-center flex flex-col items-center justify-between min-h-[500px]"
          >
            {/* Hamburger Menu in top right of white card */}
            <div className="absolute top-6 right-6">
              <button
                id="btn-hamburger"
                onClick={() => { playMechanicalClick(); setIsMenuOpen(!isMenuOpen); }}
                className="p-2.5 rounded-full text-[#055085] hover:bg-neutral-100 transition-all border border-neutral-100"
                title="System Menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Tidy hamburger menu dropdown list */}
              <AnimatePresence>
                {isMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-20" 
                      onClick={() => setIsMenuOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-2xl shadow-xl z-30 overflow-hidden py-1.5 text-left"
                    >
                      <button
                        onClick={() => { playMechanicalClick(); setIsMenuOpen(false); setCurrentScreen("results"); }}
                        className="w-full px-4 py-2.5 hover:bg-neutral-50 text-[#055085] font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                      >
                        <BarChart3 className="w-4 h-4 text-emerald-600" />
                        <span>Live Results</span>
                      </button>
                      <button
                        onClick={handleOpenAdminPanel}
                        className="w-full px-4 py-2.5 hover:bg-neutral-50 text-[#055085] font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-t border-neutral-100"
                      >
                        <Settings className="w-4 h-4 text-blue-500" />
                        <span>Admin Console</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* School Crest SVG Seal */}
            <div className="mb-6">
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center bg-white rounded-full border-2 border-neutral-200 shadow-md">
                {institutionLogo ? (
                  institutionLogo.startsWith("data:image") ? (
                    <img
                      src={institutionLogo}
                      alt="School Logo"
                      className="w-20 h-20 object-contain rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="text-4xl select-none">{institutionLogo}</div>
                  )
                ) : (
                  <svg viewBox="0 0 100 100" className="w-24 h-24">
                    {/* Outer circles */}
                    <circle cx="50" cy="50" r="46" fill="none" stroke="#055085" strokeWidth="2" />
                    <circle cx="50" cy="50" r="41" fill="none" stroke="#055085" strokeWidth="1" strokeDasharray="2,2" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#055085" strokeWidth="1.5" />
                    
                    {/* Circular Text: Dynamic School Name */}
                    <path id="textPath" d="M 50 12 A 38 38 0 1 1 49.9 12" fill="none" />
                    <text className="font-sans text-[5.5px] font-black uppercase tracking-widest" fill="#055085">
                     <textPath href="#textPath" startOffset="50%" textAnchor="middle">
                        {displaySchoolName ? `${displaySchoolName} •` : ""}
                      </textPath>
                    </text>

                    {/* Center Seal Icon (Open book with star) */}
                    <g transform="translate(34, 38) scale(0.32)">
                      {/* Book pages */}
                      <path d="M10 30 Q 25 15, 45 30 Q 65 15, 80 30 L 80 80 Q 65 65, 45 80 Q 25 65, 10 80 Z" fill="#055085" />
                      <path d="M45 30 L 45 80" stroke="white" strokeWidth="3" />
                      {/* Star above book */}
                      <polygon points="45,5 48,12 56,12 50,17 52,24 45,20 38,24 40,17 34,12 42,12" fill="#d97706" />
                    </g>
                  </svg>
                )}
              </div>
            </div>

            {/* Title Block */}
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl sm:text-2xl font-black text-[#055085] tracking-widest uppercase">
                {institutionSubtitle || "WELCOME"}
              </h3>
              <p className="text-sm font-semibold text-neutral-400 uppercase tracking-widest">
                TO
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#055085] tracking-tight leading-none uppercase">
                {institutionTitle || "DIGITAL VOTING SYSTEM"}
              </h1>
              {displaySchoolName && (
                <p className="text-sm sm:text-base font-black text-[#055085] uppercase tracking-widest pt-3">
                  powered by {displaySchoolName}
                </p>
              )}
            </div>

            {/* Action Trigger Button */}
            <div className="my-8 w-full max-w-xs">
              <button
                id="btn-start-voting"
                onClick={handleStartVotingClick}
                className="w-full bg-[#055085] hover:bg-[#033c66] text-white py-3.5 px-8 rounded-2xl font-black uppercase tracking-wider text-sm transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 hover:translate-y-[-1px] cursor-pointer"
              >
                <span>START VOTING</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Developed By branding logo */}
            <div className="flex flex-col items-center justify-center border-t border-neutral-100 pt-6 w-full max-w-xs select-none">
              <span className="text-xs sm:text-sm text-[#055085] uppercase tracking-widest font-black mb-2">
                Developed By
              </span>
              <div className="flex items-center justify-center">
                <div className="w-20 h-20 flex items-center justify-center font-black text-[#055085] text-4xl overflow-hidden">
                  {footerLogo ? (
                    footerLogo.startsWith("data:image") ? (
                       <img src={footerLogo} alt="Dev Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    ) : footerLogo === "R" ? (
                      <DeveloperLogo />
                    ) : (
                      <span className="text-3xl">{footerLogo}</span>
                    )
                  ) : (
                    <DeveloperLogo />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Poll Not Started Alert Modal */}
        {showPollNotStartedAlert && (
          <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
            <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 max-w-sm w-full relative animate-fade-in text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-4 border border-amber-200 shadow-inner">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1 font-mono">EVM Security Lock</h3>
              <h2 className="text-lg font-black text-neutral-800 mb-2 font-display uppercase tracking-tight">Polling Has Not Started</h2>
              <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
                The digital voting panels are currently secured. Please ask the Election Commissioner to start the polling session in the Admin Console.
              </p>
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => {
                    playMechanicalClick();
                    setShowPollNotStartedAlert(false);
                    setIsAdminSidebarOpen(true);
                  }}
                  className="w-full bg-[#055085] hover:bg-[#033c66] text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md font-sans"
                >
                  Open Admin Console
                </button>
                <button
                  onClick={() => {
                    playMechanicalClick();
                    setShowPollNotStartedAlert(false);
                  }}
                  className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer font-sans"
                >
                  Close Alert
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ACTIVE SECURED BALLOTING INTERFACE (IMAGE 2) */}
        {currentScreen === "voting" && (
          <ErrorBoundary fallbackTitle="Secured Balloting Unit Error">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex flex-col lg:flex-row gap-6 items-start justify-center max-w-7xl px-2 sm:px-4"
            >
              {/* Left/Center: Digital Ballot Listing */}
              <div className="flex-1 flex flex-col justify-start w-full">
                <div className="flex justify-between items-center mb-4 text-white">
                  <button
                    onClick={() => { playMechanicalClick(); setCurrentScreen("welcome"); }}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider hover:text-blue-200 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Exit Session</span>
                  </button>
                </div>              {/* Renders the pristine category lists */}
                <BallotingUnit
                  candidates={candidates}
                  voterSessionVotes={voterSessionVotes}
                  onVote={handleVoteCast}
                  isMachineEnabled={isBallotActive}
                  isBusy={isBusy}
                  votedCandidateId={votedCandidateId}
                  pollingStationName={pollingStationName}
                  isPollStarted={isPollStarted}
                  isPollClosed={isPollClosed}
                  onSubmit={handleFinalBallotSubmit}
                  currentCategoryIndex={currentCategoryIndex}
                  setCurrentCategoryIndex={setCurrentCategoryIndex}
                />
              </div>
   
              {/* Right: VVPAT Audit Printer Panel */}
              <div className="w-full lg:w-[350px] shrink-0 flex flex-col items-center justify-start lg:pt-8 gap-4">
                <div className="w-full flex flex-col items-center">
                  <div className="text-center mb-2 text-white/80 font-mono text-[10px] uppercase tracking-widest font-black flex items-center gap-1.5 justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    <span>VVPAT AUDIT COMPARTMENT</span>
                  </div>
                  <VVPATUnit vvpatState={vvpatState} />
                </div>

                {/* Next Category or Submit Button placed directly under VVPAT unit (outside) */}
                {candidates.length > 0 && (
                  <div className="w-full">
                    {currentCategoryIndex < categoriesList.length - 1 ? (
                      (() => {
                        const currentCategoryName = categoriesList[currentCategoryIndex];
                        const isCategoryCompleted = currentCategoryName ? !!voterSessionVotes[currentCategoryName] : false;
                        return (
                          <button
                            type="button"
                            disabled={!isCategoryCompleted || isBusy}
                            onClick={() => {
                              playMechanicalClick();
                              setCurrentCategoryIndex(prev => Math.min(categoriesList.length - 1, prev + 1));
                            }}
                            className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 border shadow-lg ${
                              isCategoryCompleted && !isBusy
                                ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-400 hover:scale-[1.01] active:scale-95"
                                : "bg-neutral-800 text-neutral-500 cursor-not-allowed border-neutral-700"
                            }`}
                          >
                            <span>Next Category</span>
                            <span className="font-sans font-black">→</span>
                          </button>
                        );
                      })()
                    ) : (
                      (() => {
                        const currentCategoryName = categoriesList[currentCategoryIndex];
                        const isCategoryCompleted = currentCategoryName ? !!voterSessionVotes[currentCategoryName] : false;
                        return (
                          <button
                            type="button"
                            disabled={!isCategoryCompleted || isBusy}
                            onClick={() => {
                              playMechanicalClick();
                              handleFinalBallotSubmit();
                            }}
                            className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 border shadow-lg ${
                              isCategoryCompleted && !isBusy
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 hover:scale-[1.01] active:scale-95 shadow-lg shadow-emerald-950/20"
                                : "bg-neutral-800 text-neutral-500 cursor-not-allowed border-neutral-700"
                            }`}
                          >
                            <span>Submit Ballot</span>
                            <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                          </button>
                        );
                      })()
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </ErrorBoundary>
        )}

        {/* VIEW 3: LIVE VOTING RESULTS SCREEN (IMAGE 1) */}
        {currentScreen === "results" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-neutral-50 z-50 overflow-y-auto flex flex-col justify-start p-6 sm:p-10 md:p-12 text-neutral-800"
          >
            <div className="w-full max-w-7xl mx-auto flex flex-col justify-start">
              {/* Header block */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 pb-6 mb-6 gap-4">
                <div className="text-left">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#055085] font-sans">
                    Live Voting Results
                  </h1>
                  {displaySchoolName && (
                    <p className="text-xs font-bold text-[#055085]/60 uppercase tracking-widest mt-1">
                      {displaySchoolName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    id="btn-back-home"
                    onClick={() => { playMechanicalClick(); setCurrentScreen("voting"); }}
                    className="bg-[#055085] hover:bg-[#033c66] text-white font-extrabold text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Back to Voting Machine
                  </button>
                </div>
              </div>

              {/* Tally cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-[#055085]/5 border border-[#055085]/10 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#055085]/10 text-[#055085] rounded-xl flex items-center justify-center shrink-0">
                    <Vote className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#055085]/70 uppercase tracking-widest block">Total Ballots Cast</span>
                    <span className="text-2xl font-black font-mono text-[#055085]">{totalVotersCount}</span>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700/80 uppercase tracking-widest block">Active Positions</span>
                    <span className="text-2xl font-black font-mono text-emerald-800">{categoriesList.length}</span>
                  </div>
                </div>
              </div>

              {/* Categories and candidates roster standings */}
              {categoriesList.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-dashed border-neutral-200 text-center text-neutral-400">
                  <AlertCircle className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                  <p className="text-xs">No registered candidates or categories present in the active ballot memory.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoriesList.map((cat) => {
                    const catCands = [...(candidatesByCategory[cat] || [])].sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0));
                    return (
                      <div key={cat} className="border border-neutral-200 bg-white rounded-2xl p-4 shadow-sm">
                        <h3 className="text-sm sm:text-base font-extrabold text-[#055085] mb-3 border-b border-neutral-100 pb-1.5 uppercase">
                          {cat}
                        </h3>
                        
                        <div className="space-y-2.5">
                          {catCands.map((cand, idx) => {
                            const votesCount = voteCounts[cand.id] || 0;
                            return (
                              <div key={cand.id} className="flex items-center justify-between gap-4 py-2 border-b border-neutral-50 last:border-0">
                                <div className="flex items-center gap-3.5 min-w-0">
                                  <span className="text-neutral-400 font-mono font-bold w-5 text-sm">{idx + 1}.</span>
                                  <div className="w-20 h-20 shrink-0 bg-white border-2 border-neutral-200 rounded-2xl flex items-center justify-center text-5xl shadow-md overflow-hidden p-1">
                                    {cand.symbol && cand.symbol.startsWith("data:") ? (
                                      <img src={cand.symbol} alt="Symbol" className="w-full h-full object-contain scale-105" referrerPolicy="no-referrer" />
                                    ) : (
                                      <span className="select-none leading-none">{cand.symbol}</span>
                                    )}
                                  </div>
                                  <div className="truncate">
                                    <span className="font-extrabold text-neutral-800 text-sm sm:text-base leading-tight block truncate">
                                      {cand.name}
                                    </span>
                                    <span className="text-[10px] sm:text-xs text-neutral-400 block truncate font-medium">
                                      {cand.classGroup || "Class Candidate"}
                                    </span>
                                  </div>
                                </div>

                                <span className="bg-[#22c55e] text-white px-4 py-1.5 rounded-full text-base sm:text-lg font-black font-mono shadow-md border border-emerald-400/20 shrink-0 min-w-[55px] text-center">
                                  {votesCount}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

      </div>

      {/* FOOTER AREA */}
      <footer className="w-full max-w-4xl mx-auto text-center px-4 py-6 relative z-10 select-none">
        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest font-sans">
          © 2026 Student Election Commission {displaySchoolName ? `• ${displaySchoolName}` : ""}
        </p>
      </footer>

      {/* SYSTEM-WIDE SIDEBAR DRAWERS & DIALOGS */}

      {/* 1. Administrative Sidebar overlay */}
      <AnimatePresence>
        {isAdminSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdminSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
            />

            {/* Sidebar drawer container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 w-full h-full bg-neutral-100 z-50 shadow-2xl overflow-y-auto flex flex-col"
            >
              {/* Header inside Sidebar */}
              <div className="bg-neutral-900 text-white p-5 flex items-center justify-between border-b border-neutral-800">
                <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-neutral-800 rounded-lg flex items-center justify-center text-blue-400 border border-neutral-700 shadow-inner">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider font-mono text-neutral-400 leading-none">
                        Administrative Control Center
                      </p>
                      <h2 className="text-base font-black tracking-tight font-display text-white mt-1">
                        EVM Election Audit & Config Panel
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAdminSidebarOpen(false)}
                    className="w-8 h-8 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all flex items-center justify-center cursor-pointer border border-neutral-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="p-6 flex-1 w-full max-w-7xl mx-auto">
                <AdminPanel
                  candidates={candidates}
                  votes={votes}
                  isPollClosed={isPollClosed}
                  isPollStarted={isPollStarted}
                  onStartPolls={handleStartPolls}
                  onClosePolls={handleClosePolls}
                  onResetElection={handleResetElection}
                  onAddMockVotes={handleAddMockVotes}
                  onAddCandidate={handleRegisterCandidate}
                  onEditCandidate={handleEditCandidate}
                  onDeleteCandidate={handleDeleteCandidate}
                  defaultPin={adminPin}
                  onUpdatePin={handleUpdatePin}
                  pollingStationName={pollingStationName}
                  onUpdateStationName={handleUpdateStationName}
                  onImportBackup={handleImportBackupData}
                  institutionSubtitle={institutionSubtitle}
                  onUpdateInstitutionSubtitle={handleUpdateInstitutionSubtitle}
                  institutionTitle={institutionTitle}
                  onUpdateInstitutionTitle={handleUpdateInstitutionTitle}
                  institutionLogo={institutionLogo}
                  onUpdateInstitutionLogo={handleUpdateInstitutionLogo}
                  footerLogo={footerLogo}
                  onUpdateFooterLogo={handleUpdateFooterLogo}
                  academicYear={academicYear}
                  onUpdateAcademicYear={handleUpdateAcademicYear}
                  schoolName={schoolName}
                  onUpdateSchoolName={handleUpdateSchoolName}
                  developerName={developerName}
                  onUpdateDeveloperName={handleUpdateDeveloperName}
                  developerSubtitle={developerSubtitle}
                  onUpdateDeveloperSubtitle={handleUpdateDeveloperSubtitle}
                  developerLogo={footerLogo}
                  onUpdateDeveloperLogo={handleUpdateDeveloperLogo}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. Full-Screen Vote Cast Complete Celebration Overlay */}
      <AnimatePresence>
        {showBallotSuccessOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#055085] text-white flex flex-col justify-center items-center z-50 p-6 text-center select-none"
          >
            {/* Visual glow element */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#055085] via-[#0b72a6] to-[#043355] opacity-95" />
            
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="relative z-10 max-w-md mx-auto space-y-6 flex flex-col items-center"
            >
              {/* Checkmark block */}
              <div className="w-24 h-24 bg-white/10 text-emerald-400 rounded-full flex items-center justify-center shadow-lg border border-white/20 relative">
                <CheckCircle2 className="w-14 h-14" />
                <Sparkles className="w-6 h-6 absolute -top-1 -right-1 text-yellow-300 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-black uppercase tracking-wider text-emerald-400">
                  THANK YOU!
                </h1>
                <p className="text-sm font-semibold text-neutral-300 uppercase tracking-widest">
                  YOUR SECURE E-BALLOT HAS BEEN CAST
                </p>
                <div className="h-[2px] w-12 bg-white/25 mx-auto my-3" />
                <p className="text-xs text-neutral-300 max-w-sm leading-relaxed">
                  Your votes in all {Object.keys(voterSessionVotes).length} student council categories have been processed and recorded successfully in the secure EVM memory module.
                </p>
              </div>

              <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider pt-6">
                Please step away from the secure compartment for the next voter.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
