export type ComplaintStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  type: string;
  description: string;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  timestamp: any; // Firestore Timestamp
  status: ComplaintStatus;
  evidenceUrl?: string;
  isPanicMode: boolean;
  referenceId: string;
  assignedOfficerId?: string;
  officerName?: string;
  officerRank?: string;
  officerPhone?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
  bio?: string;
  memberSince: any;
  role: 'CITIZEN' | 'OFFICER' | 'ADMIN';
  preferredLanguage?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
