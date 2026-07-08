import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc, getDoc, collection, writeBatch, getDocs } from "firebase/firestore";
import { Candidate, VoteRecord } from "../types";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isPermissionError = errorMessage.toLowerCase().includes("permission") || errorMessage.toLowerCase().includes("denied");

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };

  if (isPermissionError) {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else {
    console.warn('[Firestore Offline/Network Mode] Operation:', operationType, 'Path:', path, 'Details:', errorMessage);
  }
}

import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export interface ElectionConfig {
  isPollStarted: boolean;
  isPollClosed: boolean;
  pollingStationName: string;
  adminPin: string;
  institutionSubtitle: string;
  institutionTitle: string;
  institutionLogo: string;
  footerLogo: string;
  schoolName: string;
  developerName: string;
  developerSubtitle: string;
  academicYear: string;
  candidates: Candidate[];
}

export const defaultConfigDocRef = doc(db, "elections", "global_config");
export const defaultVotesDocRef = doc(db, "elections", "global_votes");

export async function initializeDatabaseIfEmpty(initialCandidates: Candidate[]) {
  try {
    let configSnap;
    try {
      configSnap = await getDoc(defaultConfigDocRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "elections/global_config");
      return;
    }

    if (!configSnap.exists()) {
      const initialConfig: ElectionConfig = {
        isPollStarted: false,
        isPollClosed: false,
        pollingStationName: "POLLING STATION NO. 4A",
        adminPin: "admin@123",
        institutionSubtitle: "College & School Student Council",
        institutionTitle: "DIGITAL VOTING SYSTEM",
        institutionLogo: "",
        footerLogo: "R",
        schoolName: "Arafa English School, Attur",
        developerName: "Industrial Robotics",
        developerSubtitle: "Institute",
        academicYear: "2026-27",
        candidates: initialCandidates
      };
      try {
        await setDoc(defaultConfigDocRef, initialConfig);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "elections/global_config");
      }
    }

    let votesSnap;
    try {
      votesSnap = await getDoc(defaultVotesDocRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "elections/global_votes");
      return;
    }

    if (!votesSnap.exists()) {
      try {
        await setDoc(defaultVotesDocRef, { votes: [] });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "elections/global_votes");
      }
    }
  } catch (error) {
    console.error("Error initializing Firebase database:", error);
  }
}

export async function updateElectionConfig(updatedFields: Partial<ElectionConfig>) {
  try {
    await setDoc(defaultConfigDocRef, updatedFields, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "elections/global_config");
  }
}

export const votesColRef = collection(db, "votes");

export async function addVotesToCollection(newRecords: VoteRecord[]) {
  try {
    const chunkSize = 500;
    for (let i = 0; i < newRecords.length; i += chunkSize) {
      const chunk = newRecords.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((rec) => {
        const docRef = doc(db, "votes", rec.id);
        batch.set(docRef, rec);
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "votes");
  }
}

export async function clearAllVotesCollection() {
  try {
    const snapshot = await getDocs(votesColRef);
    const chunkSize = 500;
    const docs = snapshot.docs;
    for (let i = 0; i < docs.length; i += chunkSize) {
      const chunk = docs.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, "votes");
  }
}

export async function deleteVotesForCandidate(candId: string) {
  try {
    const snapshot = await getDocs(votesColRef);
    const docsToDelete = snapshot.docs.filter((doc) => doc.data().candidateId === candId);
    const chunkSize = 500;
    for (let i = 0; i < docsToDelete.length; i += chunkSize) {
      const chunk = docsToDelete.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, "votes");
  }
}

export async function updateElectionVotes(votes: VoteRecord[]) {
  try {
    await setDoc(defaultVotesDocRef, { votes });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "elections/global_votes");
  }
}
