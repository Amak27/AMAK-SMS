/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Save, 
  User, 
  TrendingUp, 
  FileText, 
  Search, 
  Smile, 
  Compass, 
  ShieldAlert,
  GraduationCap
} from "lucide-react";
import { Student } from "../types";

interface CommentsPanelProps {
  students: Student[];
  onCommentsUpdated: () => void;
}

export default function CommentsPanel({ students, onCommentsUpdated }: CommentsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Target Student calculations summaries
  const [acAverage, setAcAverage] = useState<number | null>(null);
  const [acDivision, setAcDivision] = useState("");
  const [acTotalMarks, setAcTotalMarks] = useState(0);
  const [subjectDetails, setSubjectDetails] = useState<any[]>([]);

  // Comments form
  const [academicsText, setAcademicsText] = useState("");
  const [academicsTeacher, setAcademicsTeacher] = useState("");

  const [lifeSkillsText, setLifeSkillsText] = useState("");
  const [lifeSkillsTeacher, setLifeSkillsTeacher] = useState("");

  const [houseConductText, setHouseConductText] = useState("");
  const [houseConductTeacher, setHouseConductTeacher] = useState("");

  const [headTeacherText, setHeadTeacherText] = useState("");
  const [headTeacherTeacher, setHeadTeacherTeacher] = useState("");

  const [requirements, setRequirements] = useState("Broom, Ream, Uniform, Box file, 12 books,...");
  const [nextTermBegins, setNextTermBegins] = useState("2024-09-02");
  const [nextTermFees, setNextTermFees] = useState("Shs 450,000");

  const [loading, setLoading] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Set default student if list loaded
  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  // Load calculated student marks summary and current comments
  useEffect(() => {
    if (!selectedStudentId) return;

    setLoading(true);
    // 1. Fetch academic summaries
    fetch(`/api/reports/${selectedStudentId}/TERM 2/2024`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setAcAverage(data.averageMark);
          setAcDivision(data.division);
          setAcTotalMarks(data.totalMarks);
          setSubjectDetails(data.subjectDetails || []);
        }
      })
      .catch(err => console.error("Error setting report details", err));

    // 2. Fetch comments profiles
    fetch(`/api/comments/${selectedStudentId}`)
      .then(res => res.json())
      .then(com => {
        setAcademicsText(com.academics.text || "");
        setAcademicsTeacher(com.academics.teacher || "Were Sam");

        setLifeSkillsText(com.lifeSkills.text || "");
        setLifeSkillsTeacher(com.lifeSkills.teacher || "Lisa Atim");

        setHouseConductText(com.houseConduct.text || "");
        setHouseConductTeacher(com.houseConduct.teacher || "Wamboka Peter");

        setHeadTeacherText(com.headTeacher.text || "");
        setHeadTeacherTeacher(com.headTeacher.teacher || "Turyaijuka Brichards");

        setRequirements(com.requirements || "Broom, Ream, Uniform, Box file, 12 books,...");
        setNextTermBegins(com.nextTermBegins || "2024-09-02");
        setNextTermFees(com.nextTermFees || "Shs 450,050");
        setLoading(false);
      })
      .catch(err => {
        console.error("Error setting comments details", err);
        setLoading(false);
      });
  }, [selectedStudentId]);

  const handleGenerateAIComments = async () => {
    if (!selectedStudent) return;
    setDrafting(true);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/comments/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: selectedStudent.name,
          level: selectedStudent.level,
          className: selectedStudent.className,
          age: selectedStudent.age,
          gender: selectedStudent.gender,
          subjectDetails: subjectDetails
        })
      });

      const data = await response.json();
      if (response.ok) {
        setAcademicsText(data.academics);
        setLifeSkillsText(data.lifeSkills);
        setHouseConductText(data.houseConduct);
        setHeadTeacherText(data.headTeacher);
        setStatusMessage({ type: "success", text: "Successfully compiled and drafted student remarks using Gemini AI!" });
      } else {
        throw new Error(data.error || "Gemini AI server errored");
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ 
        type: "error", 
        text: err?.message || "Failed to make call. Check if your GEMINI_API_KEY is defined in the Secrets panel." 
      });
    } finally {
      setDrafting(false);
    }
  };

  const handleSaveComments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          term: "TERM 2",
          year: 2024,
          academics: { text: academicsText, teacher: academicsTeacher },
          lifeSkills: { text: lifeSkillsText, teacher: lifeSkillsTeacher },
          houseConduct: { text: houseConductText, teacher: houseConductTeacher },
          headTeacher: { text: headTeacherText, teacher: headTeacherTeacher },
          requirements,
          nextTermBegins,
          nextTermFees
        })
      });

      if (response.ok) {
        setStatusMessage({ type: "success", text: "Permanent teacher comments card successfully updated." });
        onCommentsUpdated();
      } else {
        throw new Error("Server error saving comments card");
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Something went wrong" });
    } finally {
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
      {/* Student List Sidebar selector */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 select-none">
            <User size={16} className="text-blue-600" />
            Class Selector
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Select child to write comments</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input 
            id="comments-search"
            type="text" 
            placeholder="Search student profile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono shadow-inner"
          />
        </div>

        {/* List of students */}
        <div className="max-h-[350px] overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden">
          {filteredStudents.map((stud) => (
            <button 
              key={stud.id}
              onClick={() => setSelectedStudentId(stud.id)}
              className={`w-full text-left py-2.5 px-3 text-xs flex items-center justify-between transition-all font-medium cursor-pointer
                ${selectedStudentId === stud.id ? "bg-blue-50 text-blue-950 border-l-4 border-blue-600" : "hover:bg-slate-50/50 text-slate-700"}`}
            >
              <div>
                <p className="font-semibold">{stud.name}</p>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{stud.id} • {stud.className} {stud.stream}</span>
              </div>
              <span className="capitalize text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{stud.level}</span>
            </button>
          ))}
          {filteredStudents.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400">No matching student accounts in register.</div>
          )}
        </div>
      </div>

      {/* Primary Comments Editor */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm lg:col-span-2 space-y-6">
        {selectedStudent ? (
          <>
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 select-none">
                  <FileText className="text-blue-600" size={18} />
                  Teacher Comment Card: {selectedStudent.name}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                  <span>Class: {selectedStudent.className} {selectedStudent.stream}</span>
                  <span>•</span>
                  <span>ID: {selectedStudent.id}</span>
                  <span>•</span>
                  <span>Level: {selectedStudent.level}</span>
                </div>
              </div>

              {/* Status block summary */}
              {!loading && acAverage !== null && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] block uppercase text-slate-400 font-mono">AVG Score</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">{acAverage}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] block uppercase text-slate-400 font-mono">UNEB grade</span>
                    <span className="font-bold text-blue-600 font-mono text-xs px-2.5 py-1 bg-blue-50/80 rounded-full border border-blue-100/50">{acDivision}</span>
                  </div>
                </div>
              )}
            </div>

            {statusMessage && (
              <div className={`p-4 rounded-xl flex gap-2 border text-xs font-semibold
                ${statusMessage.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-850" : "bg-rose-50 border-rose-100 text-rose-850"}`}
              >
                {statusMessage.type === "success" ? <TrendingUp size={16} /> : <ShieldAlert size={16} />}
                <p>{statusMessage.text}</p>
              </div>
            )}

            {/* AI Generator button */}
            <div className="bg-gradient-to-br from-indigo-50/40 via-blue-50/30 to-blue-100/10 p-5 rounded-2xl border border-blue-100/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-950 flex items-center gap-1.5 select-none">
                  <Sparkles size={14} className="text-blue-600 animate-pulse" />
                  Gemini AI Comments Drafts Engine
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Analyze pupil grades for key subjects and draft outstanding, culturally context-rich primary comments natively matching local metrics instantly.
                </p>
              </div>
              <button 
                id="btn-generate-comments"
                disabled={drafting || loading}
                onClick={handleGenerateAIComments}
                className="py-2.5 px-4 bg-blue-600 font-semibold text-xs text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all flex-shrink-0 disabled:opacity-40 cursor-pointer shadow-sm shadow-blue-900/15"
              >
                <Sparkles size={14} />
                {drafting ? "Drafting with AI..." : "Draft Complete Comments"}
              </button>
            </div>

            {/* Forms section */}
            <form onSubmit={handleSaveComments} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Academic Comments */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-slate-50/80 px-2 py-1.5 rounded-lg border border-slate-200/60">
                    <label className="font-semibold text-slate-700">Academics Comment Card</label>
                    <input 
                      id="acad-teacher-input"
                      type="text" 
                      placeholder="Teacher Name"
                      value={academicsTeacher}
                      onChange={(e) => setAcademicsTeacher(e.target.value)}
                      className="text-[10px] w-28 bg-transparent border-b border-slate-200 focus:outline-none focus:border-blue-500 text-center font-bold"
                    />
                  </div>
                  <textarea 
                    id="acad-comment-input"
                    rows={3} 
                    value={academicsText}
                    onChange={(e) => setAcademicsText(e.target.value)}
                    placeholder="Describe marks progress and exam performance highlights..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all leading-relaxed"
                  />
                </div>

                {/* 2. Extra curricular comments */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-slate-50/80 px-2 py-1.5 rounded-lg border border-slate-200/60">
                    <label className="font-semibold text-slate-700">Life Skills / Clubs</label>
                    <input 
                      id="life-teacher-input"
                      type="text" 
                      placeholder="Teacher Name"
                      value={lifeSkillsTeacher}
                      onChange={(e) => setLifeSkillsTeacher(e.target.value)}
                      className="text-[10px] w-28 bg-transparent border-b border-slate-200 focus:outline-none focus:border-blue-500 text-center font-bold"
                    />
                  </div>
                  <textarea 
                    id="life-comment-input"
                    rows={3} 
                    value={lifeSkillsText}
                    onChange={(e) => setLifeSkillsText(e.target.value)}
                    placeholder="Co-curricular behaviors, sports, football interest and clubs activity..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all leading-relaxed"
                  />
                </div>

                {/* 3. House Conduct comments */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-slate-50/80 px-2 py-1.5 rounded-lg border border-slate-200/60">
                    <label className="font-semibold text-slate-700">House Conduct / Dorm</label>
                    <input 
                      id="house-teacher-input"
                      type="text" 
                      placeholder="Teacher Name"
                      value={houseConductTeacher}
                      onChange={(e) => setHouseConductTeacher(e.target.value)}
                      className="text-[10px] w-28 bg-transparent border-b border-slate-200 focus:outline-none focus:border-blue-500 text-center font-bold"
                    />
                  </div>
                  <textarea 
                    id="house-comment-input"
                    rows={3} 
                    value={houseConductText}
                    onChange={(e) => setHouseConductText(e.target.value)}
                    placeholder="Cleanliness, obedience to schedules, dorm hygiene, group integration..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all leading-relaxed"
                  />
                </div>

                {/* 4. Head Teacher Summary comment */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-slate-50/80 px-2 py-1.5 rounded-lg border border-slate-200/60">
                    <label className="font-semibold text-slate-700">Head Teacher Appraisal</label>
                    <input 
                      id="head-teacher-input"
                      type="text" 
                      placeholder="Principal Name"
                      value={headTeacherTeacher}
                      onChange={(e) => setHeadTeacherTeacher(e.target.value)}
                      className="text-[10px] w-28 bg-transparent border-b border-slate-200 focus:outline-none focus:border-blue-500 text-center font-bold"
                    />
                  </div>
                  <textarea 
                    id="head-comment-input"
                    rows={3} 
                    value={headTeacherText}
                    onChange={(e) => setHeadTeacherText(e.target.value)}
                    placeholder="Concluding leadership statement and holiday guidance..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all leading-relaxed"
                  />
                </div>
              </div>

              {/* Requirements, next term fee settings */}
              <div className="pt-4 border-t border-slate-150 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Holiday Requirements</label>
                  <input 
                    id="req-input"
                    type="text" 
                    value={requirements} 
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Broom, Ream or books..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Next Term Commences</label>
                  <input 
                    id="begins-input"
                    type="date" 
                    value={nextTermBegins} 
                    onChange={(e) => setNextTermBegins(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Next Term Fees Amount</label>
                  <input 
                    id="fees-input"
                    type="text" 
                    value={nextTermFees} 
                    onChange={(e) => setNextTermFees(e.target.value)}
                    placeholder="e.g. Shs 450,000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end font-semibold pt-4">
                <button 
                  id="btn-save-comments-form"
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 shadow-sm shadow-blue-900/15 cursor-pointer"
                >
                  <Save size={16} />
                  Save Comments Card
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-20 text-slate-400">
            Please select students from the sidebar to review comments parameters.
          </div>
        )}
      </div>
    </div>
  );
}
