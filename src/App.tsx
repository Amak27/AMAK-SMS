/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  School, 
  Users, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  PlusCircle, 
  Home, 
  Settings, 
  LogOut, 
  Loader2,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { Student, Subject, SchoolSettings, SystemUser } from "./types";
import Dashboard from "./components/Dashboard";
import StudentRoster from "./components/StudentRoster";
import MarksEntry from "./components/MarksEntry";
import CommentsPanel from "./components/CommentsPanel";
import ReportCardView from "./components/ReportCardView";
import LoginPage from "./components/LoginPage";
import SchoolSettingsComponent from "./components/SchoolSettings";

export default function App() {
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation: "dashboard" | "students" | "admissions" | "marks" | "comments" | "report" | "settings"
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const refreshSchoolSettings = async () => {
    try {
      const settingsRes = await fetch("/api/settings");
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }
    } catch (err) {
      console.error("Failed to fetch settings from API:", err);
    }
  };

  useEffect(() => {
    // Check if user is already logged in (retrieve from sessionStorage for smooth session caching)
    const storedUser = sessionStorage.getItem("academix_user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        sessionStorage.removeItem("academix_user");
      }
    }

    // Load student database and subject structures
    const loadSchoolDatabase = async () => {
      try {
        const studRes = await fetch("/api/students");
        const studData = await studRes.json();
        setStudents(studData);

        const subRes = await fetch("/api/subjects");
        const subData = await subRes.json();
        setSubjects(subData);

        await refreshSchoolSettings();

        if (studData.length > 0) {
          setSelectedStudentId(studData[0].id);
        }
      } catch (err) {
        console.error("Failed to sync School ERP records on init:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSchoolDatabase();
  }, []);

  const handleLogin = (user: SystemUser) => {
    setCurrentUser(user);
    sessionStorage.setItem("academix_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem("academix_user");
    setActiveTab("dashboard");
  };

  const refreshStudentsList = async () => {
    try {
      const studRes = await fetch("/api/students");
      const studData = await studRes.json();
      setStudents(studData);
    } catch (err) {
      console.error("Error refreshing students:", err);
    }
  };

  const handleAddStudent = async (studentPayload: Omit<Student, "id">) => {
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentPayload)
      });
      if (res.ok) {
        const added = await res.json();
        await refreshStudentsList();
        setSelectedStudentId(added.id);
        setActiveTab("students");
      }
    } catch (err) {
      console.error("Error adding student record:", err);
    }
  };

  const handleUpdateStudent = async (id: string, payload: Student) => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await refreshStudentsList();
        setActiveTab("students");
      }
    } catch (err) {
      console.error("Error updating student record:", err);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await refreshStudentsList();
        // Adjust selected student pointer if deleted
        if (selectedStudentId === id) {
          setSelectedStudentId(students.length > 0 ? students[0].id : "");
        }
      }
    } catch (err) {
      console.error("Error deleting student profile:", err);
    }
  };

  if (loading) {
    return (
      <div id="loading-spinner-screen" className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-blue-400 gap-4">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <p className="text-sm font-semibold tracking-wider font-mono">Boothing School ERP Database...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 antialiased font-sans">
      {/* Top Main navigation bar */}
      <header className="bg-white text-slate-900 shadow-sm border-b border-slate-200 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white ring-2 ring-blue-300/30 shrink-0">
              <School size={22} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900 truncate max-w-xs sm:max-w-md uppercase">
                {settings?.schoolName || "Academix School ERP"}
              </h1>
              <span className="text-[10px] text-blue-600 font-mono tracking-wider">Uganda School Management Portal</span>
            </div>
          </div>

          {/* User Profile and Stats banner */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden md:flex items-center gap-4 font-mono text-[11px] text-slate-500 select-none border-r pr-4 border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span>Active Pupils: <strong className="text-slate-800 font-bold">{students.length}</strong></span>
              </div>
              <div>
                <span>Session: <strong className="text-slate-800 font-bold">{settings?.termName || "TERM 2"}, {settings?.academicYear || 2024}</strong></span>
              </div>
            </div>

            {/* Profile Info & Logout */}
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900">{currentUser?.name || "Academic Officer"}</p>
                <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded-full font-mono border border-blue-100 uppercase">
                  {currentUser?.role || "Staff"}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-lg transition-all cursor-pointer border border-transparent hover:border-red-100"
                title="Logout from ERP Workspace"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar Panel */}
        <aside className="w-full lg:w-64 shrink-0 space-y-2 no-print">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider px-3 mb-2 font-mono">Main Operations</p>
            
            <button 
              id="nav-dash"
              onClick={() => setActiveTab("dashboard")}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer
                ${activeTab === "dashboard" ? "bg-blue-600/10 text-blue-600 border-l-2 border-blue-500 font-bold" : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"}`}
            >
              <Home size={16} />
              Administrative Dashboard
            </button>

            <button 
              id="nav-roster"
              onClick={() => setActiveTab("students")}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer
                ${activeTab === "students" || activeTab === "admissions" ? "bg-blue-600/10 text-blue-600 border-l-2 border-blue-500 font-bold" : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"}`}
            >
              <Users size={16} />
              Pupil Registry Directory
            </button>

            <button 
              id="nav-marks"
              onClick={() => setActiveTab("marks")}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer
                ${activeTab === "marks" ? "bg-blue-600/10 text-blue-600 border-l-2 border-blue-500 font-bold" : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"}`}
            >
              <BookOpen size={16} />
              Term-wise Marks Entry
            </button>

            <button 
              id="nav-comments"
              onClick={() => setActiveTab("comments")}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer
                ${activeTab === "comments" ? "bg-blue-600/10 text-blue-600 border-l-2 border-blue-500 font-bold" : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"}`}
            >
              <MessageSquare size={16} />
              Teacher Comments (AI)
            </button>

            <button 
              id="nav-report"
              onClick={() => setActiveTab("report")}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer
                ${activeTab === "report" ? "bg-blue-600/10 text-blue-600 border-l-2 border-blue-500 font-bold" : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"}`}
            >
              <FileText size={16} />
              Generate Report Card
            </button>

            <button 
              id="nav-settings"
              onClick={() => setActiveTab("settings")}
              className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer
                ${activeTab === "settings" ? "bg-blue-600/10 text-blue-600 border-l-2 border-blue-500 font-bold" : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"}`}
            >
              <Settings size={16} />
              School ERP Settings
            </button>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 shadow-none">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs select-none">
              <Sparkles size={14} className="text-blue-650" />
              <span>Gemini AI Connected</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Comment Generator agent is active and listening securely on server-side requests. Key features enabled automatically!
            </p>
          </div>
        </aside>

        {/* Dynamic Display Panel */}
        <main className="flex-1 min-w-0">
          {activeTab === "dashboard" && (
            <Dashboard 
              students={students} 
              onNavigate={(view) => setActiveTab(view)}
              onSelectStudent={(id) => setSelectedStudentId(id)}
            />
          )}

          {(activeTab === "students" || activeTab === "admissions") && (
            <StudentRoster 
              students={students}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              currentViewTab={activeTab}
            />
          )}

          {activeTab === "marks" && (
            <MarksEntry 
              students={students}
              subjects={subjects}
              onMarksSaved={refreshStudentsList}
            />
          )}

          {activeTab === "comments" && (
            <CommentsPanel 
              students={students}
              onCommentsUpdated={refreshStudentsList}
            />
          )}

          {activeTab === "report" && (
            <ReportCardView 
              students={students}
              selectedStudentId={selectedStudentId}
              onSelectStudent={setSelectedStudentId}
              settings={settings || undefined}
            />
          )}

          {activeTab === "settings" && (
            <SchoolSettingsComponent 
              user={currentUser}
              onSettingsSaved={refreshSchoolSettings}
            />
          )}
        </main>

      </div>
    </div>
  );
}
