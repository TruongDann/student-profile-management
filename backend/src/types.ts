export interface StudentProfile {
  id: string;
  collaboratorName: string;
  studentName: string;
  studentPhone: string;
  notes: string;
  photos: Photo[];
  timestamp: number;
  status: "pending" | "approved" | "rejected";
}

export interface Photo {
  id: string;
  data: string;
  createdAt: number;
}

export interface ExtractedData {
  studentName?: string;
  studentPhone?: string;
}
