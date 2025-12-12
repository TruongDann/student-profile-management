import React, { useState, useEffect } from "react";
import { StudentProfile } from "./types";
import { getProfiles } from "./services/storageService";
import CollaboratorView from "./views/CollaboratorView";
import AdminView from "./views/AdminView";

const App: React.FC = () => {
  const [view, setView] = useState<"ctv" | "admin">("ctv");
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load data whenever refreshKey changes
  useEffect(() => {
    const loadData = async () => {
      const data = await getProfiles();
      setProfiles(data);
    };
    loadData();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-yellow-400 flex items-center justify-center text-slate-900 font-extrabold text-xl shadow-sm shadow-yellow-200">
              H
            </div>
            <h1 className="font-bold text-lg tracking-tight text-slate-800">
              Hồ Sơ <span className="text-yellow-600">Pro</span>
            </h1>
          </div>

          <nav className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setView("ctv")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === "ctv"
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Cộng Tác Viên
            </button>
            <button
              onClick={() => {
                setView("admin");
                handleRefresh();
              }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === "admin"
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Quản Trị
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {view === "ctv" ? (
          <CollaboratorView onSuccess={handleRefresh} />
        ) : (
          <AdminView profiles={profiles} onUpdate={handleRefresh} />
        )}
      </main>

      {/* Simple Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Hệ thống quản lý hồ sơ học viên</p>
      </footer>
    </div>
  );
};

export default App;
