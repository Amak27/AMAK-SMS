/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  PlusCircle, 
  Edit3, 
  FileText, 
  Compass, 
  MapPin, 
  Clock, 
  Sparkles,
  School
} from "lucide-react";
import { Student, SchoolStats } from "../types";

interface DashboardProps {
  students: Student[];
  onNavigate: (view: string) => void;
  onSelectStudent: (id: string) => void;
}

export default function Dashboard({ students, onNavigate, onSelectStudent }: DashboardProps) {
  const [stats, setStats] = useState<SchoolStats>({
    totalStudents: 0,
    nurseryCount: 0,
    primaryCount: 0,
    secondaryCount: 0,
    unebPassRate: 0,
    levelAverages: { nursery: 0, primary: 0, secondary: 0 }
  });

  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    // Current GMT formatting
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString("en-GB", { 
        timeZone: "UTC", 
        hour12: false, 
        weekday: 'short', 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }) + " UTC");
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch stats
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error fetching stats:", err));
  }, [students]);

  // Filter 5 most recently registered students
  const recentStudents = [...students].reverse().slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-6 -translate-y-6">
          <School size={280} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 backdrop-blur-md text-blue-200 text-xs font-mono mb-4 ring-1 ring-blue-400/25">
            <Clock size={12} />
            <span>{currentTime || "Active Session"}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-semibold tracking-tight leading-tight">
            Sharebility Academy Management Portal
          </h1>
          <p className="mt-2 text-slate-350 text-sm md:text-base leading-relaxed">
            Welcome back, System Admin. Streamline pupil admissions, bulk-record mid/end term grades, and instantly draft high-quality report cards backed by advanced UNEB calculations and Gemini AI.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button 
              id="dash-btn-admission"
              onClick={() => onNavigate("admissions")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-all rounded-lg text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-blue-950/20 cursor-pointer"
            >
              <PlusCircle size={16} />
              New Student Admission
            </button>
            <button 
              id="dash-btn-marks"
              onClick={() => onNavigate("marks")}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-all rounded-lg text-white ring-1 ring-white/20 font-medium text-sm flex items-center gap-2 cursor-pointer"
            >
              <Edit3 size={16} />
              Record Subject Marks
            </button>
          </div>
        </div>
      </div>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Students Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Total Enrollment</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{stats.totalStudents || students.length}</p>
          </div>
        </div>

        {/* Nursery Active Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3 bg-pink-50 text-pink-600 rounded-xl">
            <Compass size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Nursery Center</p>
            <p className="text-2xl font-semibold text-slate-950 mt-1">{(stats.nurseryCount ?? 0)} Pupils</p>
          </div>
        </div>

        {/* Primary Classes Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Primary Section</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{(stats.primaryCount ?? 0)} Learners</p>
          </div>
        </div>

        {/* O-Level Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">O-Level Sec</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{(stats.oLevelCount ?? 0)} Scholars</p>
          </div>
        </div>

        {/* A-Level Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">A-Level Sec</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{(stats.aLevelCount ?? 0)} Candidates</p>
          </div>
        </div>
      </div>

      {/* Interactive Visual Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curricular Division Performance Gauge */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              UNEB Target Indicators
            </h2>
            <p className="text-xs text-slate-405 mt-1">Classroom grading objectives & average parameters</p>
          </div>

          <div className="my-6 flex justify-center py-4">
            {/* SVG Progress Circle for Target Goal */}
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="10" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="#2563EB" strokeWidth="10" fill="none"
                  strokeDasharray={`${251 * 0.95}`} strokeDashoffset={`${251 * (1 - 0.88)}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold tracking-tight text-slate-900">88.5%</span>
                <span className="text-[10px] text-blue-600 font-semibold px-2.5 py-1 rounded-full bg-blue-50/70 border border-blue-100/50 mt-1">Passing Grade</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Nursery Average Progress</span>
              <span className="font-semibold text-slate-900">A (Achieved)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-pink-500 h-full rounded-full" style={{ width: "92%" }}></div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Primary Center Pass Rate (Div 1 & 2)</span>
              <span className="font-semibold text-slate-900">84%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: "84%" }}></div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">O-Level Secondary division target pass rate</span>
              <span className="font-semibold text-slate-900">78%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: "78%" }}></div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">A-Level Subsidiary target pass rate</span>
              <span className="font-semibold text-slate-900">82%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-teal-500 h-full rounded-full" style={{ width: "82%" }}></div>
            </div>
          </div>
        </div>

        {/* Recently Registered Students list */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                Recently Enrolled Learners
              </h2>
              <p className="text-xs text-slate-405">Quick-view profile registers and card generation</p>
            </div>
            <button 
              onClick={() => onNavigate("students")}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              See All Students
            </button>
          </div>

          <div className="divide-y divide-slate-100 overflow-hidden">
            {recentStudents.map((student) => (
              <div 
                key={student.id} 
                className="py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:bg-slate-50/50 px-2 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold select-none
                    ${student.level === "Nursery" ? "bg-pink-50 text-pink-700 border border-pink-100/50" : 
                      student.level === "Primary" ? "bg-indigo-50 text-indigo-700 border border-indigo-100/50" : "bg-amber-50 text-amber-700 border border-amber-100/50"}`}
                  >
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800">{student.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>ID: {student.id}</span>
                      <span>•</span>
                      <span>{student.className} {student.stream}</span>
                      <span>•</span>
                      <span className="capitalize">{student.gender}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium font-mono border
                    ${student.level === "Nursery" ? "bg-pink-50/55 border-pink-100 text-pink-600" : 
                      student.level === "Primary" ? "bg-indigo-50/55 border-indigo-100 text-indigo-600" : 
                      "bg-amber-50/55 border-amber-100 text-amber-600"}`}
                  >
                    {student.level}
                  </span>
                  
                  <button 
                    onClick={() => {
                      onSelectStudent(student.id);
                      onNavigate("report");
                    }}
                    className="p-1 text-slate-450 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all text-[11px] font-medium flex items-center gap-1.5 px-2.5 border border-slate-200/80 cursor-pointer"
                  >
                    <FileText size={12} />
                    Report Card
                  </button>
                </div>
              </div>
            ))}

            {students.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400">No students found. Register some to begin operations.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Guidelines block */}
      <div className="bg-slate-50 rounded-2xl border border-slate-205 p-6 shadow-none">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-450 mb-3">Academic Calculations and Grading Methodology</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
          <div>
            <h4 className="font-semibold text-slate-800 mb-1 flex items-center gap-1 select-none">
              <span className="text-pink-650 font-bold">1.</span> Nursery Center Grading
            </h4>
            <p className="text-[11px]">
              Assessed on 5 key child developmental matrices. No rigid numeric exams; progress is indicated as:
            </p>
            <div className="flex gap-2 mt-2 font-mono text-[9px]">
              <span className="px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded">A - Achieved</span>
              <span className="px-1.5 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded">D - Developing</span>
              <span className="px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">B - Beginning</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 mb-1 flex items-center gap-1 select-none">
              <span className="text-indigo-650 font-bold">2.</span> Primary UNEB Standard
            </h4>
            <p className="text-[11px]">
              Calculates statistical average of Beginning (BOT), Mid term (MOT), and End of term (EOT) to determine subject score (100%). Computes Division 1-4 and aggregates securely (D1=1 to F9=9). English & Math failure pushes candidates to poorer divisions automatically.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 mb-1 flex items-center gap-1 select-none">
              <span className="text-amber-65d text-amber-600 font-bold">3.</span> Secondary Curriculum
            </h4>
            <p className="text-[11px]">
              Sorts all subjects taken, determines Best 8 subjects (including compulsory English and Mathematics). Sums sub-grades to form aggregates (8 to 72 points) and classifies into divisions based on academic quality.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
