import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Printer, Eye, Lock } from "lucide-react";
import { VVPATState } from "../types";

interface VVPATUnitProps {
  vvpatState: VVPATState;
}

export const VVPATUnit: React.FC<VVPATUnitProps> = ({ vvpatState }) => {
  const { candidate, isVisible, isPrinting, isDropping } = vvpatState;

  // Generate a mock unique election hash for the barcode/audit trail
  const getAuditHash = () => {
    if (!candidate) return "000000";
    const name = candidate.name || "";
    const serial = candidate.serialNumber ?? 0;
    const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `TX-${sum}-${100 + serial}`;
  };

  return (
    <div className="w-full max-w-md bg-neutral-200 border-4 border-neutral-300 rounded-2xl shadow-2xl p-6 relative select-none flex flex-col h-[530px]">
      {/* Physical details - Screws */}
      <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 rounded-full bg-neutral-400 border border-neutral-500 shadow-inner flex items-center justify-center text-[6px] font-bold text-neutral-600">+</div>
      <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 rounded-full bg-neutral-400 border border-neutral-500 shadow-inner flex items-center justify-center text-[6px] font-bold text-neutral-600">+</div>

      {/* Printer Unit Header */}
      <div className="border-b-2 border-neutral-400 pb-2.5 mb-4 text-center">
        <div className="flex items-center justify-center gap-2 text-neutral-700">
          <Printer className="w-5 h-5 text-neutral-500 shrink-0" />
          <span className="text-sm font-black tracking-widest font-mono uppercase">VVPAT AUDIT UNIT</span>
        </div>
        <p className="text-[10px] text-neutral-500 font-mono mt-0.5">PRINTER MODEL: VP-705-MAX</p>
      </div>

      {/* Main glass viewing screen */}
      <div className="flex-1 bg-zinc-950 border-4 border-neutral-400 rounded-xl p-4 relative overflow-hidden flex flex-col items-center shadow-inner">
        {/* Viewport glare effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-20 rounded-lg" />
        
        {/* Glass reflection streak */}
        <div className="absolute -inset-y-12 left-1/4 w-16 bg-white/5 -rotate-12 pointer-events-none z-20" />

        {/* Viewport Header */}
        <div className="absolute top-1.5 left-3 right-3 flex justify-between items-center z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase text-neutral-400 bg-neutral-900/90 px-2 py-0.5 rounded border border-neutral-800">
            <Eye className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>Audit Glass Window</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${isPrinting ? "bg-amber-500 glow-orange animate-pulse" : "bg-neutral-800"}`} />
            <span className="text-[8px] font-mono text-neutral-400 uppercase">Print Status</span>
          </div>
        </div>

        {/* Paper receipt slip container */}
        <div className="w-full h-full flex flex-col justify-start pt-5 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {isVisible && candidate && (
              <motion.div
                key={candidate.id}
                initial={{ y: -300, opacity: 0.9 }}
                animate={
                  isDropping
                    ? { y: 300, opacity: 0, scale: 0.95 }
                    : { y: 0, opacity: 1 }
                }
                exit={{ y: 300, opacity: 0 }}
                transition={{
                  y: { type: "spring", stiffness: 100, damping: 20 },
                  opacity: { duration: 0.15 }
                }}
                className="w-full bg-stone-100 text-stone-900 border-x-2 border-stone-300 p-4.5 shadow-md rounded-sm font-mono flex flex-col items-center text-center relative max-h-[270px]"
                style={{
                  boxShadow: "0 6px 12px -2px rgba(0,0,0,0.4), 0 3px 6px -2px rgba(0,0,0,0.2)",
                }}
              >
                {/* Torn paper edge effect at the top and bottom */}
                <div className="absolute -top-1 left-0 right-0 h-1.5 bg-[linear-gradient(45deg,transparent_33.333%,#f5f5f4_33.333%,#f5f5f4_66.667%,transparent_66.667%),linear-gradient(-45deg,transparent_33.333%,#f5f5f4_33.333%,#f5f5f4_66.667%,transparent_66.667%)] bg-[size:6px_6px]" />

                {/* Receipt Header */}
                <div className="text-[10px] font-black tracking-widest uppercase border-b border-stone-400 border-dashed w-full pb-1.5 mb-3 text-stone-700">
                  VVPAT PAPER AUDIT SLIP
                </div>

                {/* Receipt Details */}
                <div className="w-full flex flex-col gap-2 text-[11px] items-start text-left mb-3">
                  {candidate.category && (
                    <div className="flex justify-between w-full border-b border-stone-200 pb-1">
                      <span className="text-stone-500 font-bold">POST:</span>
                      <span className="font-black text-stone-950 text-xs uppercase truncate max-w-[150px]">{candidate.category}</span>
                    </div>
                  )}
                  <div className="flex justify-between w-full border-b border-stone-200 pb-1">
                    <span className="text-stone-500 font-bold">CANDIDATE NO:</span>
                    <span className="font-extrabold text-stone-950 text-xs">{String(candidate.serialNumber ?? 0).padStart(2, "0")}</span>
                  </div>
                  <div className="flex justify-between w-full items-baseline border-b border-stone-200 pb-1">
                    <span className="text-stone-500 font-bold">NAME:</span>
                    <span className="font-black text-stone-950 text-xs sm:text-sm truncate max-w-[180px]">{candidate.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between w-full items-center">
                    <span className="text-stone-500 font-bold">SYMBOL:</span>
                    <div className="w-16 h-16 bg-white border border-stone-300 rounded-lg flex items-center justify-center p-1 shadow-xs overflow-hidden">
                      {candidate.symbol && typeof candidate.symbol === "string" && candidate.symbol.startsWith("data:") ? (
                        <img 
                          src={candidate.symbol} 
                          alt="Symbol" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-4xl leading-none select-none">{candidate.symbol || "—"}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mock Barcode */}
                <div className="w-full flex flex-col items-center justify-center border-t border-stone-400 border-dashed pt-2.5 mt-auto">
                  <div className="h-6 bg-stone-900 w-4/5 flex items-end justify-between px-2 text-[6px] text-white overflow-hidden mb-1">
                    {/* Visual Barcode line segments */}
                    <div className="w-2 h-full bg-stone-900 border-l border-white" />
                    <div className="w-1 h-full bg-stone-900 border-l-2 border-white" />
                    <div className="w-0.5 h-full bg-stone-900 border-l border-white" />
                    <div className="w-3 h-full bg-stone-900 border-l-4 border-white" />
                    <div className="w-1.5 h-full bg-stone-900 border-l-2 border-white" />
                    <div className="w-2 h-full bg-stone-900 border-l border-white" />
                    <div className="w-0.5 h-full bg-stone-900 border-l-2 border-white" />
                    <div className="w-3 h-full bg-stone-900 border-l border-white" />
                  </div>
                  <span className="text-[8px] text-stone-600 uppercase font-black tracking-wider">
                    {getAuditHash()}
                  </span>
                </div>

                {/* Torn paper edge bottom */}
                <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-[linear-gradient(45deg,transparent_33.333%,#f5f5f4_33.333%,#f5f5f4_66.667%,transparent_66.667%),linear-gradient(-45deg,transparent_33.333%,#f5f5f4_33.333%,#f5f5f4_66.667%,transparent_66.667%)] bg-[size:6px_6px] rotate-180" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state when no slip is printing */}
          {!isVisible && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <span className="text-xs text-zinc-500 font-mono tracking-widest uppercase font-black">
                Awaiting Ballot
              </span>
              <p className="text-[10px] text-zinc-600 font-mono max-w-[180px] mt-2 leading-relaxed">
                Your paper audit slip will print here for 1.5 seconds before entering the sealed ballot box.
              </p>
            </div>
          )}
        </div>

        {/* Lower Ballot Slip Drop Slot visual guard */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-neutral-900 to-transparent border-t border-neutral-800/80 z-10" />
      </div>

      {/* Audit Box Lock Visual */}
      <div className="mt-4 bg-neutral-800 text-neutral-400 rounded-lg p-2.5 flex items-center justify-between border border-neutral-700 text-[10px] font-mono uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-bold">SEALED BALLOT BOX</span>
        </div>
        <span className="text-emerald-500 font-extrabold">SECURED</span>
      </div>
    </div>
  );
};
