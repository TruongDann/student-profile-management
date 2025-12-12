import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Card, Button, Input, Toast } from '../components/ui';
import { Photo, StudentProfile } from '../types';
import { saveProfile } from '../services/storageService';
import { extractDataFromImage } from '../services/geminiService';
import { sendNewProfileNotification } from '../services/zaloService';

interface Props {
  onSuccess: () => void;
}

const CollaboratorView: React.FC<Props> = ({ onSuccess }) => {
  const [collaboratorName, setCollaboratorName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem('lastCollaboratorName');
    if (savedName) setCollaboratorName(savedName);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      const newPhotos: Photo[] = [];
      let firstBase64 = '';

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        if (i === 0) firstBase64 = base64;

        newPhotos.push({
          id: uuidv4(),
          data: base64,
          createdAt: Date.now(),
        });
      }

      setPhotos(prev => [...prev, ...newPhotos]);

      // Trigger AI Analysis if name/phone are empty
      if ((!studentName || !studentPhone) && firstBase64) {
        setIsAnalyzing(true);
        try {
          const result = await extractDataFromImage(firstBase64);
          if (result.studentName) setStudentName(result.studentName);
          if (result.studentPhone) setStudentPhone(result.studentPhone);
        } catch (err) {
          console.error("AI Error", err);
        } finally {
          setIsAnalyzing(false);
        }
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collaboratorName || !studentName || !studentPhone || photos.length === 0) {
      alert("Vui lòng điền đủ: Tên CTV, Tên Học Viên, SĐT và tải lên ít nhất 1 ảnh.");
      return;
    }

    setIsSubmitting(true);
    localStorage.setItem('lastCollaboratorName', collaboratorName);

    const newProfile: StudentProfile = {
      id: uuidv4(),
      collaboratorName,
      studentName,
      studentPhone,
      notes,
      photos,
      timestamp: Date.now(),
      status: 'pending'
    };

    await saveProfile(newProfile);
    await sendNewProfileNotification(newProfile);

    setStudentName('');
    setStudentPhone('');
    setNotes('');
    setPhotos([]);
    setIsSubmitting(false);
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    onSuccess();
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-xl mx-auto py-6">
      {showToast && <Toast message="Đã gửi hồ sơ thành công!" />}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Tạo Hồ Sơ Mới</h2>
        <p className="text-slate-500 text-sm mt-1">Điền thông tin và chụp ảnh hồ sơ</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="md:col-span-2">
                <Input 
                  label="Tên Cộng Tác Viên" 
                  placeholder="Nhập tên của bạn" 
                  value={collaboratorName}
                  onChange={(e) => setCollaboratorName(e.target.value)}
                  required
                />
             </div>
             
             <Input 
                label="Tên Học Viên" 
                placeholder="Nguyễn Văn A" 
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
              />
              
              <Input 
                label="Số Điện Thoại" 
                type="tel"
                placeholder="09xx xxx xxx" 
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                required
              />
          </div>

          {/* Upload Section */}
          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">
               Hình ảnh hồ sơ <span className="text-slate-400 font-normal">({photos.length})</span>
             </label>
             
             <input 
                type="file" 
                accept="image/*" 
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {/* Upload Button */}
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-yellow-50 hover:border-yellow-400 transition-all text-slate-500 group"
                >
                  <svg className="w-6 h-6 mb-1 group-hover:text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs font-medium group-hover:text-yellow-600">Thêm ảnh</span>
                </button>

                {/* Photo Previews */}
                {photos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 shadow-sm group">
                    <img src={photo.data} alt="thumb" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-1 right-1 bg-white/90 text-slate-800 rounded-full w-6 h-6 flex items-center justify-center shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              {isAnalyzing && (
                <div className="mt-2 flex items-center gap-2 text-xs text-yellow-700 font-medium bg-yellow-50 py-2 px-3 rounded-md w-fit border border-yellow-100">
                   <svg className="animate-spin w-3 h-3 text-yellow-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Đang quét thông tin từ ảnh...
                </div>
              )}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú</label>
            <textarea 
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-200 outline-none text-sm h-24 resize-none transition-all bg-white"
              placeholder="Ghi chú thêm..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full py-3 text-base shadow-sm font-bold" isLoading={isSubmitting} disabled={photos.length === 0}>
            GỬI HỒ SƠ
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CollaboratorView;