export interface Candidate {
  id: string;
  serialNumber: number;
  name: string;
  symbol: string; // Emoji symbol or character
  iconName: string; // Lucide icon lookup string
  color: string; // Theme color for candidate
  category?: string; // Optional category (e.g. "Head Boy")
  classGroup?: string; // Optional class group (e.g. "XII A")
}

export interface VoteRecord {
  id: string;
  candidateId: string;
  timestamp: string;
  voterIndex: number;
}

export interface ElectionStats {
  totalVotes: number;
  candidateVotes: Record<string, number>;
  winnerId: string | null;
}

export interface VVPATState {
  candidate: Candidate | null;
  isVisible: boolean;
  isPrinting: boolean;
  isDropping: boolean;
}

export interface ElectionConfig {
  title: string;
  institution: string;
  adminPin: string;
}
