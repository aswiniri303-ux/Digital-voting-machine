import React from "react";
import { 
  Star, BookOpen, Laptop, Sprout, Trophy, Vote, CheckCircle2, ShieldAlert,
  Flame, Rocket, Heart, Palette, Shield, Zap, Compass, Check
} from "lucide-react";
import { Candidate } from "../types";
import { playMechanicalClick } from "../utils/audio";

interface BallotingUnitProps {
  candidates: Candidate[];
  voterSessionVotes?: Record<string, string>; // Map of Category -> Candidate ID
  onVote: (candidate: Candidate) => void;
  isMachineEnabled: boolean; // Enabled by officer or auto-pilot
  isBusy: boolean; // Currently playing beep/recording vote
  votedCandidateId: string | null; // Currently glowing red LED
  pollingStationName?: string;
  isPollStarted: boolean;
  isPollClosed: boolean;
  onSubmit?: () => void;
  currentCategoryIndex: number;
  setCurrentCategoryIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const BallotingUnit: React.FC<BallotingUnitProps> = ({
  candidates,
  voterSessionVotes = {},
  onVote,
  isMachineEnabled,
  isBusy,
  votedCandidateId,
  pollingStationName = "POLLING STATION NO. 4A",
  isPollStarted,
  isPollClosed,
  onSubmit,
  currentCategoryIndex,
  setCurrentCategoryIndex,
}) => {
  // Group candidates by category
  const categories = React.useMemo(() => {
    const map: Record<string, Candidate[]> = {};
    candidates.forEach(c => {
      const cat = c.category || "General Candidates";
      if (!map[cat]) map[cat] = [];
      map[cat].push(c);
    });
    return map;
  }, [candidates]);

  const categoryKeys = React.useMemo(() => Object.keys(categories), [categories]);
  const totalCategoriesCount = categoryKeys.length;
  const completedCategoriesCount = React.useMemo(() => {
    return Object.keys(voterSessionVotes).length;
  }, [voterSessionVotes]);

  const handleVoteClick = (candidate: Candidate) => {
    if (!isMachineEnabled || isBusy || isPollClosed) return;
    
    const cat = candidate.category || "General Candidates";
    // If already voted for this category, don't allow double voting inside category
    if (voterSessionVotes[cat]) return;

    playMechanicalClick();
    onVote(candidate);
  };

  const currentCategory = categoryKeys[currentCategoryIndex];
  const isCategoryCompleted = currentCategory ? !!voterSessionVotes[currentCategory] : false;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-neutral-200/80 p-6 relative select-none flex flex-col justify-between">
      {/* Top Header Panel */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-[#055085] font-sans">
          Digital Voting System
        </h2>
        {totalCategoriesCount > 0 && (
          <div className="mt-1 text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
            Category {currentCategoryIndex + 1} of {totalCategoriesCount}
          </div>
        )}
      </div>

      {/* Category step bubbles / progress indicator */}
      {totalCategoriesCount > 1 && (
        <div className="mb-6 flex items-center justify-center gap-1.5 px-4 overflow-x-auto py-1">
          {categoryKeys.map((key, index) => {
            const isVoted = !!voterSessionVotes[key];
            const isActive = index === currentCategoryIndex;
            const isUnlocked = index <= completedCategoriesCount;
            return (
              <button
                key={key}
                type="button"
                disabled={!isUnlocked}
                onClick={() => {
                  playMechanicalClick();
                  setCurrentCategoryIndex(index);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isActive 
                    ? "w-8 bg-[#055085] cursor-default" 
                    : !isUnlocked
                    ? "w-2.5 bg-neutral-150 cursor-not-allowed opacity-40"
                    : isVoted 
                    ? "w-2.5 bg-emerald-500 cursor-pointer" 
                    : "w-2.5 bg-neutral-200 hover:bg-neutral-300 cursor-pointer"
                }`}
                title={`Category ${index + 1}: ${key}`}
              />
            );
          })}
        </div>
      )}

      {/* Categories Balloting Panel Container (No Scroll) */}
      <div className="flex-1 p-2 flex flex-col gap-4">
        {candidates.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-neutral-50 rounded-2xl border border-neutral-300 border-dashed my-auto py-12">
            <ShieldAlert className="w-12 h-12 text-amber-500 mb-3 animate-pulse shrink-0" />
            <h4 className="font-extrabold text-neutral-800 text-sm font-mono uppercase tracking-wide">
              No Registered Candidates
            </h4>
            <p className="text-xs text-neutral-500 mt-2 max-w-xs leading-relaxed">
              The Election Commission hasn't registered a candidate roster. Open the <strong className="text-neutral-700 font-bold">Admin Console</strong> to register candidates or load standard presets.
            </p>
          </div>
        ) : (
          (() => {
            const category = currentCategory;
            if (!category) return null;
            const categoryCandidates = categories[category] || [];
            const selectedCandidateIdForCategory = voterSessionVotes[category];

            return (
              <div key={category} className="space-y-4">
                {/* Category Title */}
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-lg font-black text-[#055085] font-sans">
                    {category}
                  </h3>
                  {isCategoryCompleted && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Voted</span>
                    </span>
                  )}
                </div>

                {/* Candidate Rows Container */}
                <div className="border border-neutral-200 bg-neutral-50/50 rounded-2xl overflow-y-auto max-h-[350px] sm:max-h-[440px] shadow-sm divide-y divide-neutral-100 pr-1">
                  {categoryCandidates.map((candidate) => {
                    const isSelected = selectedCandidateIdForCategory === candidate.id;
                    const isAnyVotedInCategory = isCategoryCompleted;
                    const isGlowLed = votedCandidateId === candidate.id;
                    const isDisabled = !isMachineEnabled || isBusy || (isAnyVotedInCategory && !isSelected);

                    return (
                      <div
                        key={candidate.id}
                        className={`flex items-center justify-between p-4 transition-all duration-200 ${
                          isSelected
                            ? "bg-blue-50/80 border-l-4 border-l-[#055085]"
                            : isAnyVotedInCategory
                            ? "opacity-50 grayscale-[20%]"
                            : "hover:bg-neutral-50"
                        }`}
                      >
                        {/* Left Side: Candidate Symbol image/box */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="sm:w-28 sm:h-28 w-20 h-20 shrink-0 flex items-center justify-center bg-white border-2 border-neutral-200 rounded-2xl p-2.5 shadow-md overflow-hidden hover:border-[#055085]/40 transition-colors">
                            {candidate.symbol && candidate.symbol.startsWith("data:") ? (
                              <img 
                                src={candidate.symbol} 
                                alt="Symbol" 
                                className="w-full h-full object-contain scale-105"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="sm:text-5xl text-4xl leading-none select-none drop-shadow-sm">{candidate.symbol}</span>
                            )}
                          </div>

                          {/* Candidate Info */}
                          <div className="truncate">
                            <h4 className="font-extrabold text-neutral-800 text-sm sm:text-base leading-snug">
                              {candidate.name}
                            </h4>
                            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mt-0.5">
                              {candidate.classGroup || "Class Candidate"}
                            </p>
                          </div>
                        </div>

                        {/* Right Side: Glow LED + Vote Button */}
                        <div className="flex items-center gap-4 shrink-0">
                          {/* Active voter LED confirmation light */}
                          {isGlowLed && (
                            <div className="w-3 h-3 rounded-full bg-red-600 glow-red animate-pulse" />
                          )}

                          {/* Action Button */}
                          <button
                            id={`btn-vote-${candidate.id}`}
                            disabled={isDisabled}
                            onClick={() => handleVoteClick(candidate)}
                            className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${
                              isSelected
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/10 cursor-default"
                                : isAnyVotedInCategory
                                ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                                : !isMachineEnabled || isBusy
                                ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                                : "bg-[#055085] hover:bg-[#033c66] text-white shadow-md shadow-blue-500/10"
                            }`}
                          >
                            {isSelected ? "Voted ✓" : "Vote"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()
        )}
      </div>





      {/* Block Overlay for inactive state */}
      {!isMachineEnabled && !isBusy && (
        <div className="absolute inset-0 bg-neutral-900/10 backdrop-blur-[0.5px] rounded-3xl flex items-center justify-center z-10 p-6">
          <div className="bg-white/95 text-neutral-800 rounded-2xl px-6 py-5 shadow-xl border border-neutral-200 max-w-xs text-center flex flex-col items-center gap-3">
            <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center shadow-inner animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              {!isPollStarted ? (
                <>
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-800 font-display">
                    Polls Not Started
                  </h4>
                  <p className="text-[11px] text-neutral-600 mt-1 leading-normal">
                    The electronic voting unit is offline. The administrator must click <strong className="text-neutral-700">"Start Polling"</strong> in the Admin Console to begin.
                  </p>
                </>
              ) : isPollClosed ? (
                <>
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-red-800 font-display">
                    Voting Closed
                  </h4>
                  <p className="text-[11px] text-neutral-600 mt-1 leading-normal">
                    The student election polls are officially closed and sealed. Thank you for voting! Standings can be viewed in results.
                  </p>
                </>
              ) : (
                <>
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-800 font-display">
                    Machine Standby
                  </h4>
                  <p className="text-[11px] text-neutral-600 mt-1 leading-normal">
                    The voting unit is resetting or standby. Please wait for the ready green light to glow before casting your ballot.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
