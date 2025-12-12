export interface StudentProfile {
  id: string;
  collaboratorName: string; // Tên cộng tác viên
  studentName: string;
  studentPhone: string; // Số điện thoại học viên
  notes: string;
  photos: Photo[];
  timestamp: number; // Unix timestamp
  status: 'pending' | 'approved' | 'rejected';
}

export interface Photo {
  id: string;
  data: string; // Base64 string
  createdAt: number;
}

export interface ExtractedData {
  studentName?: string;
  studentPhone?: string;
}