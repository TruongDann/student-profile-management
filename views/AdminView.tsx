import React, { useState, useMemo } from "react";
import { StudentProfile } from "../types";
import { Button, Toast } from "../components/ui";
import {
  deletePhoto,
  deleteProfile,
  clearAllData,
} from "../services/storageService";
import { sendDailyReport } from "../services/zaloService";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

interface Props {
  profiles: StudentProfile[];
  onUpdate: () => void;
}

// Helper: Get Initials for Avatar
const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const AdminView: React.FC<Props> = ({ profiles, onUpdate }) => {
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(
    null
  );
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // --- Filter State ---
  const [filterType, setFilterType] = useState<"day" | "month" | "year">("day");
  const [filterDate, setFilterDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [activeTab, setActiveTab] = useState<"list" | "stats">("list");

  // --- Logic ---
  const filteredProfiles = useMemo(() => {
    const dateObj = new Date(filterDate);
    if (isNaN(dateObj.getTime())) return [];

    let start = 0;
    let end = 0;

    if (filterType === "day") {
      start = new Date(dateObj).setHours(0, 0, 0, 0);
      end = new Date(dateObj).setHours(23, 59, 59, 999);
    } else if (filterType === "month") {
      const y = dateObj.getFullYear();
      const m = dateObj.getMonth();
      start = new Date(y, m, 1).getTime();
      end = new Date(y, m + 1, 0, 23, 59, 59, 999).getTime();
    } else {
      // year
      const y = dateObj.getFullYear();
      start = new Date(y, 0, 1).getTime();
      end = new Date(y, 11, 31, 23, 59, 59, 999).getTime();
    }

    return profiles.filter((p) => p.timestamp >= start && p.timestamp <= end);
  }, [profiles, filterDate, filterType]);

  const ctvStats = useMemo(() => {
    const stats: Record<string, { count: number; lastTime: number }> = {};
    filteredProfiles.forEach((p) => {
      const name = p.collaboratorName;
      if (!stats[name]) {
        stats[name] = { count: 0, lastTime: p.timestamp };
      }
      stats[name].count += 1;
      stats[name].lastTime = Math.max(stats[name].lastTime, p.timestamp);
    });
    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [filteredProfiles]);

  const chartData = useMemo(
    () => ({
      labels: ctvStats.map((s) => s.name),
      datasets: [
        {
          label: "Hồ sơ",
          data: ctvStats.map((s) => s.count),
          backgroundColor: "#475569",
          borderRadius: 4,
          barThickness: 30,
        },
      ],
    }),
    [ctvStats]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        ticks: { stepSize: 1 },
      },
      x: { grid: { display: false } },
    },
  };

  // --- Handlers ---
  const handleTypeChange = (newType: "day" | "month" | "year") => {
    setFilterType(newType);
    const now = new Date();
    if (newType === "day") setFilterDate(now.toISOString().split("T")[0]);
    if (newType === "month")
      setFilterDate(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
      );
    if (newType === "year") setFilterDate(`${now.getFullYear()}-01-01`);
  };

  const handleDeletePhoto = async (
    pId: string,
    photoId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc muốn xóa ẢNH này không?")) {
      await deletePhoto(pId, photoId);
      if (selectedProfile && selectedProfile.id === pId) {
        setSelectedProfile({
          ...selectedProfile,
          photos: selectedProfile.photos.filter((p) => p.id !== photoId),
        });
      }
      onUpdate();
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (confirm("Xóa toàn bộ hồ sơ này (bao gồm tất cả ảnh và thông tin)?")) {
      await deleteProfile(id);
      setSelectedProfile(null);
      onUpdate();
    }
  };

  const handleClearAll = async () => {
    if (
      confirm(
        "CẢNH BÁO: Hành động này sẽ xóa toàn bộ dữ liệu trong bộ nhớ.\nBạn có chắc chắn không?"
      )
    ) {
      await clearAllData();
      onUpdate();
      setSelectedProfile(null);
    }
  };

  const handleDailyReport = async () => {
    if (filteredProfiles.length === 0) {
      alert("Không có dữ liệu trong khoảng thời gian này.");
      return;
    }
    setIsSendingReport(true);
    await sendDailyReport(filteredProfiles);
    setIsSendingReport(false);
    setToastMsg("Đã gửi báo cáo Zalo");
    setTimeout(() => setToastMsg(""), 3000);
  };

  const downloadData = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(profiles));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `backup_hoso_${filterType}_${filterDate}.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const getEmptyMessage = () => {
    if (filterType === "day")
      return `Không có dữ liệu ngày ${new Date(filterDate).toLocaleDateString(
        "vi-VN"
      )}`;
    if (filterType === "month")
      return `Không có dữ liệu tháng ${
        new Date(filterDate).getMonth() + 1
      }/${new Date(filterDate).getFullYear()}`;
    return `Không có dữ liệu năm ${new Date(filterDate).getFullYear()}`;
  };

  // --- Icons ---
  const IconUser = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
  const IconPhone = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
  const IconClock = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
  const IconTrash = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
  const IconDownload = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
  const IconBack = () => (
    <svg
      className="w-6 h-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  );

  return (
    // Use 100dvh for better mobile browser support (address bar handling)
    <div className="h-[calc(100vh-140px)] md:h-[calc(100dvh-140px)] min-h-[500px] flex flex-col gap-4">
      {toastMsg && <Toast message={toastMsg} />}

      {/* --- Toolbar --- */}
      {/* Optimized for mobile wrapping */}
      <div className="bg-white px-3 md:px-5 py-3 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-0 border border-slate-300 rounded-md px-1 py-1 bg-white hover:border-slate-400 transition-colors flex-1 sm:flex-none">
            <div className="pl-2 pr-1 text-slate-500">
              <IconClock />
            </div>

            <select
              value={filterType}
              onChange={(e) => handleTypeChange(e.target.value as any)}
              className="bg-transparent text-slate-700 font-bold text-xs uppercase outline-none cursor-pointer border-r border-slate-200 pr-2 mr-2 py-1"
            >
              <option value="day">Ngày</option>
              <option value="month">Tháng</option>
              <option value="year">Năm</option>
            </select>

            {filterType === "day" && (
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent text-slate-700 font-medium text-sm outline-none cursor-pointer py-0.5 w-full sm:w-auto"
              />
            )}
            {filterType === "month" && (
              <input
                type="month"
                value={filterDate.substring(0, 7)}
                onChange={(e) => setFilterDate(e.target.value + "-01")}
                className="bg-transparent text-slate-700 font-medium text-sm outline-none cursor-pointer py-0.5 w-full sm:w-auto"
              />
            )}
            {filterType === "year" && (
              <select
                value={new Date(filterDate).getFullYear()}
                onChange={(e) => setFilterDate(`${e.target.value}-01-01`)}
                className="bg-transparent text-slate-700 font-medium text-sm outline-none cursor-pointer py-0.5 pr-1 w-full sm:w-auto"
              >
                {Array.from(
                  { length: 5 },
                  (_, i) => new Date().getFullYear() - i
                ).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex bg-slate-100 p-1 rounded-md self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-1.5 text-xs font-semibold rounded transition-all ${
                activeTab === "list"
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Danh Sách
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-4 py-1.5 text-xs font-semibold rounded transition-all ${
                activeTab === "stats"
                  ? "bg-white shadow-sm text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Thống Kê
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button
            variant="secondary"
            onClick={downloadData}
            className="px-3 py-2 text-xs h-9 font-medium text-slate-600"
          >
            Backup JSON
          </Button>
          <Button
            variant="zalo"
            onClick={handleDailyReport}
            isLoading={isSendingReport}
            className="px-3 py-2 text-xs h-9"
          >
            Gửi Báo Cáo
          </Button>
          <Button
            variant="danger"
            onClick={handleClearAll}
            className="px-3 py-2 text-xs h-9 w-9 p-0 flex items-center justify-center"
            title="Xóa toàn bộ dữ liệu"
          >
            <IconTrash />
          </Button>
        </div>
      </div>

      {/* --- CONTENT --- */}
      {activeTab === "list" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden min-h-0">
          {/* LIST COLUMN (4 cols) */}
          {/* Mobile Logic: Hide if profile selected, Show if no profile selected */}
          <div
            className={`lg:col-span-4 bg-white rounded-lg border border-slate-200 flex flex-col overflow-hidden shadow-sm ${
              selectedProfile ? "hidden lg:flex" : "flex"
            }`}
          >
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Hồ sơ
              </span>
              <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {filteredProfiles.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredProfiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                  <p className="text-sm">{getEmptyMessage()}</p>
                </div>
              ) : (
                filteredProfiles.map((profile) => {
                  const active = selectedProfile?.id === profile.id;
                  return (
                    <div
                      key={profile.id}
                      onClick={() => setSelectedProfile(profile)}
                      className={`group relative p-3 rounded-md border-l-[3px] transition-all cursor-pointer flex gap-3 items-center ${
                        active
                          ? "bg-slate-100 border-slate-600 shadow-none"
                          : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${
                          active ? "bg-slate-600" : "bg-slate-300"
                        }`}
                      >
                        {getInitials(profile.studentName)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-sm font-semibold truncate ${
                            active ? "text-slate-900" : "text-slate-700"
                          }`}
                        >
                          {profile.studentName}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-slate-500 mt-0.5">
                          <span className="truncate">
                            {profile.collaboratorName}
                          </span>
                          <span className="text-[10px] bg-slate-100 px-1 rounded">
                            {new Date(profile.timestamp).toLocaleDateString(
                              "vi-VN",
                              { day: "2-digit", month: "2-digit" }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* DETAIL COLUMN (8 cols) */}
          {/* Mobile Logic: Show if profile selected, Hide if no profile selected */}
          <div
            className={`lg:col-span-8 bg-white rounded-lg border border-slate-200 flex flex-col overflow-hidden shadow-sm relative ${
              selectedProfile ? "flex" : "hidden lg:flex"
            }`}
          >
            {selectedProfile ? (
              <>
                {/* Header with Mobile Back Button */}
                <div className="px-4 py-4 md:px-6 md:py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2">
                      {/* Back Button for Mobile */}
                      <button
                        onClick={() => setSelectedProfile(null)}
                        className="lg:hidden -ml-2 p-1.5 text-slate-500 hover:bg-slate-50 rounded-full mr-1"
                      >
                        <IconBack />
                      </button>

                      <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight truncate">
                        {selectedProfile.studentName}
                      </h1>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-3 text-sm text-slate-600 pl-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">
                          <IconPhone />
                        </span>
                        <span className="font-medium">
                          {selectedProfile.studentPhone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">
                          <IconUser />
                        </span>
                        <span>
                          CTV:{" "}
                          <span className="font-medium">
                            {selectedProfile.collaboratorName}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <span>
                          {new Date(selectedProfile.timestamp).toLocaleString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteProfile(selectedProfile.id)}
                    className="w-full md:w-auto justify-center text-rose-500 hover:text-rose-700 text-xs font-bold border border-rose-200 hover:bg-rose-50 px-3 py-2 rounded transition-colors flex items-center gap-2"
                  >
                    <IconTrash /> Xóa Hồ Sơ
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-white p-4 md:p-6 custom-scrollbar">
                  {selectedProfile.notes && (
                    <div className="mb-6">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Ghi chú
                      </h4>
                      <div className="bg-slate-50 p-4 rounded text-slate-700 text-sm leading-relaxed border border-slate-100">
                        {selectedProfile.notes}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Hình ảnh hồ sơ ({selectedProfile.photos.length})
                    </h4>

                    {selectedProfile.photos.length === 0 ? (
                      <div className="h-32 flex items-center justify-center border border-dashed border-slate-300 rounded text-slate-400 text-sm">
                        Không có hình ảnh
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {selectedProfile.photos.map((photo) => (
                          <div
                            key={photo.id}
                            className="group relative aspect-[3/4] bg-slate-100 rounded overflow-hidden border border-slate-200"
                          >
                            <img
                              src={photo.data}
                              alt="doc"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-2 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-3 backdrop-blur-sm">
                              <a
                                href={photo.data}
                                download={`hoso_${selectedProfile.studentName}.jpg`}
                                className="text-white hover:text-blue-300 transition-colors"
                                title="Tải ảnh"
                              >
                                <IconDownload />
                              </a>
                              <button
                                onClick={(e) =>
                                  handleDeletePhoto(
                                    selectedProfile.id,
                                    photo.id,
                                    e
                                  )
                                }
                                className="text-white hover:text-rose-300 transition-colors"
                                title="Xóa ảnh"
                              >
                                <IconTrash />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                <p className="text-sm font-medium">
                  Chọn hồ sơ để xem chi tiết
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- STATS DASHBOARD --- */}
      {activeTab === "stats" && (
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto min-h-0">
          {/* Simple Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 shrink-0">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                Tổng Hồ Sơ
              </p>
              <p className="text-3xl font-bold text-slate-800">
                {filteredProfiles.length}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {filterType === "day"
                  ? "Trong ngày"
                  : filterType === "month"
                  ? "Trong tháng"
                  : "Trong năm"}
              </p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                CTV Hoạt Động
              </p>
              <p className="text-3xl font-bold text-slate-800">
                {ctvStats.length}
              </p>
            </div>
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                Dẫn đầu
              </p>
              <p className="text-xl font-bold text-slate-800 truncate">
                {ctvStats[0]?.name || "---"}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {ctvStats[0] ? `${ctvStats[0].count} hồ sơ` : ""}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
            {/* Chart */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col h-80 lg:h-auto">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-6">
                Biểu Đồ Năng Suất
              </h3>
              <div className="flex-1 w-full h-full relative">
                {ctvStats.length > 0 ? (
                  <Bar data={chartData} options={chartOptions} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                    {getEmptyMessage()}
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden h-80 lg:h-auto">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Bảng Xếp Hạng
                </h3>
              </div>

              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 w-16 text-center">#</th>
                      <th className="px-6 py-3">Cộng Tác Viên</th>
                      <th className="px-6 py-3 text-right">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ctvStats.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-12 text-center text-slate-400"
                        >
                          {getEmptyMessage()}
                        </td>
                      </tr>
                    ) : (
                      ctvStats.map((stat, idx) => (
                        <tr
                          key={stat.name}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-3 text-center text-slate-400 font-mono text-xs">
                            {idx + 1}
                          </td>
                          <td className="px-6 py-3 font-medium text-slate-700">
                            {stat.name}
                          </td>
                          <td className="px-6 py-3 text-right">
                            <span className="font-bold text-slate-900">
                              {stat.count}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
