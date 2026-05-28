/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  CheckCircle, 
  Filter, 
  BookOpen, 
  Users, 
  Sparkles, 
  Save, 
  TrendingUp, 
  AlertTriangle 
} from "lucide-react";
import { Student, Subject, Level } from "../types";

interface MarksEntryProps {
  students: Student[];
  subjects: Subject[];
  onMarksSaved: () => void;
}

export default function MarksEntry({ students, subjects, onMarksSaved }: MarksEntryProps) {
  const [level, setLevel] = useState<Level>("Primary");
  const [selectedClass, setSelectedClass] = useState("P4");
  const [selectedStream, setSelectedStream] = useState("E");
  
  // Active subject codes list
  const filteredSubjects = subjects.filter(sub => sub.level === level);
  const [subjectCode, setSubjectCode] = useState<string>("");

  useEffect(() => {
    if (filteredSubjects.length > 0) {
      setSubjectCode(filteredSubjects[0].code);
    } else {
      setSubjectCode("");
    }
  }, [level, subjects]);

  // Students in selected Class & Stream
  const classStudents = students.filter(
    s => s.level === level && 
         s.className.toLowerCase() === selectedClass.toLowerCase() && 
         s.stream.toLowerCase() === selectedStream.toLowerCase()
  );

  // Buffer state while entering grades: { [studentId]: { bot, mot, eot } }
  const [localMarks, setLocalMarks] = useState<{ [studentId: string]: { bot: string | number; mot: string | number; eot: string | number } }>({});
  const [allMarksData, setAllMarksData] = useState<any[]>([]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch all existing database marks to pre-populate inputs dynamically
  const fetchAllMarks = () => {
    fetch("/api/marks")
      .then(res => res.json())
      .then(data => {
        setAllMarksData(data);
      })
      .catch(err => console.error("Error fetching database marks:", err));
  };

  useEffect(() => {
    fetchAllMarks();
  }, [students]);

  // Re-build buffer state when Class, Stream, Subject, or global marks data updates
  useEffect(() => {
    const buffer: typeof localMarks = {};
    classStudents.forEach(student => {
      const match = allMarksData.find(
        m => m.studentId === student.id && m.subjectCode === subjectCode
      );
      if (match) {
        buffer[student.id] = {
          bot: match.marks.bot === "" ? "" : match.marks.bot,
          mot: match.marks.mot === "" ? "" : match.marks.mot,
          eot: match.marks.eot === "" ? "" : match.marks.eot,
        };
      } else {
        buffer[student.id] = { bot: "", mot: "", eot: "" };
      }
    });
    setLocalMarks(buffer);
  }, [selectedClass, selectedStream, subjectCode, allMarksData, level]);

  const handleScoreChange = (studentId: string, field: "bot" | "mot" | "eot", val: string) => {
    let numericVal: number | "" = "";
    if (val !== "") {
      const parsed = parseInt(val);
      if (isNaN(parsed) || parsed < 0 || parsed > 100) return; // boundary safeguard
      numericVal = parsed;
    }

    setLocalMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: numericVal
      }
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Loop over class students and persist their subject marks
      for (const student of classStudents) {
        const scores = localMarks[student.id] || { bot: "", mot: "", eot: "" };
        await fetch("/api/marks/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: student.id,
            subjectMarks: {
              [subjectCode]: scores
            }
          })
        });
      }

      onMarksSaved();
      fetchAllMarks();
      setMessage({ type: "success", text: "Successfully saved academic scores for the class." });
    } catch (err) {
      console.error("Failed to save marks:", err);
      setMessage({ type: "error", text: "Error trying to update marks on the server." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // Compute stats of entered marks on the fly
  const calculateAggregateStats = () => {
    let sum = 0;
    let count = 0;
    let high = -1;
    let low = 101;

    (Object.values(localMarks) as Array<{ bot: string | number; mot: string | number; eot: string | number }>).forEach(scores => {
      const vals = [scores.bot, scores.mot, scores.eot].filter(v => v !== "" && v !== undefined && v !== null) as number[];
      if (vals.length > 0) {
        // Average score
        const avg = vals.reduce((a, b) => a + Number(b), 0) / vals.length;
        sum += avg;
        count++;
        if (avg > high) high = avg;
        if (avg < low) low = avg;
      }
    });

    return {
      average: count > 0 ? Math.round((sum / count) * 10) / 10 : 0,
      activePupilsCount: count,
      highestScore: high === -1 ? "-" : Math.round(high * 10) / 10,
      lowestScore: low === 101 ? "-" : Math.round(low * 10) / 10,
    };
  };

  const classStats = calculateAggregateStats();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Parameter Selection panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-205 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 select-none">
          <Filter size={18} className="text-blue-600" />
          Marks Recorder Selection
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium">
          {/* Level */}
          <div>
            <label className="block text-slate-400 mb-1">Section Level</label>
            <select 
              id="marks-lvl-select"
              value={level} 
              onChange={(e) => {
                const lev = e.target.value as Level;
                setLevel(lev);
                if (lev === "Nursery") {
                  setSelectedClass("Baby Class");
                  setSelectedStream("A");
                } else if (lev === "Primary") {
                  setSelectedClass("P4");
                  setSelectedStream("E");
                } else if (lev === "O-Level") {
                  setSelectedClass("S2");
                  setSelectedStream("North");
                } else {
                  setSelectedClass("S5");
                  setSelectedStream("Sc");
                }
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-slate-700 cursor-pointer font-semibold"
            >
              <option value="Nursery">Nursery Center</option>
              <option value="Primary">Primary Center</option>
              <option value="O-Level">O-Level Secondary</option>
              <option value="A-Level">A-Level Secondary</option>
            </select>
          </div>

          {/* Class ClassName */}
          <div>
            <label className="block text-slate-400 mb-1">Class</label>
            <input 
              id="marks-class-input"
              type="text" 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)} 
              placeholder="P4"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-slate-700 uppercase font-bold"
            />
          </div>

          {/* Stream */}
          <div>
            <label className="block text-slate-400 mb-1">Stream</label>
            <input 
              id="marks-stream-input"
              type="text" 
              value={selectedStream} 
              onChange={(e) => setSelectedStream(e.target.value)} 
              placeholder="E"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-slate-700 uppercase font-mono font-bold"
            />
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-slate-400 mb-1">Course Subject Choice</label>
            <select 
              id="marks-subject-select"
              value={subjectCode} 
              onChange={(e) => setSubjectCode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-slate-700 text-xs text-ellipsis cursor-pointer font-bold"
            >
              {filteredSubjects.map(sub => (
                <option key={sub.code} value={sub.code}>
                  {sub.code} - {sub.name}
                </option>
              ))}
              {filteredSubjects.length === 0 && (
                <option value="">No subjects resolved</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Main Score Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Class Record sheet grid */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-3 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap gap-2 items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 select-none">
                <BookOpen size={16} className="text-blue-600" />
                Score Sheet: {selectedClass} {selectedStream} ({subjectCode})
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Enter numeric grades from 0 to 100 for exams</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-blue-50/80 text-blue-750 border border-blue-100/50 font-mono font-semibold py-1 px-2.5 rounded-full select-none">
                {classStudents.length} Students Admitted
              </span>
            </div>
          </div>

          {message && (
            <div className={`p-4 mx-6 mt-4 rounded-xl flex items-center gap-2 border 
              ${message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-800"}`}
            >
              <CheckCircle size={16} />
              <p className="text-xs font-semibold">{message.text}</p>
            </div>
          )}

          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-6">ID / LIN</th>
                  <th className="py-3 px-4">Learner Full Name</th>
                  <th className="py-3 px-4 text-center">BOT (Exam 1)</th>
                  <th className="py-3 px-4 text-center">MOT (Exam 2)</th>
                  <th className="py-3 px-4 text-center">EOT (Exam 3)</th>
                  <th className="py-3 px-6 text-right">Computed Average</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {classStudents.map((student) => {
                  const score = localMarks[student.id] || { bot: "", mot: "", eot: "" };
                  const validScoreVals = [score.bot, score.mot, score.eot].filter(v => v !== "" && v !== null && v !== undefined) as number[];
                  const computedAvg = validScoreVals.length > 0 
                    ? Math.round((validScoreVals.reduce((a, b) => a + Number(b), 0) / validScoreVals.length) * 10) / 10 
                    : "-";

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3 px-6 font-mono text-slate-500">{student.id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{student.name}</td>
                      
                      {/* BOT */}
                      <td className="py-3 px-4 text-center">
                        <input 
                          id={`score-bot-${student.id}`}
                          type="text" 
                          placeholder="-"
                          value={score.bot}
                          onChange={(e) => handleScoreChange(student.id, "bot", e.target.value)}
                          className="w-16 px-2 py-1 border border-slate-200 bg-slate-50/70 focus:bg-white text-center font-mono rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>

                      {/* MOT */}
                      <td className="py-3 px-4 text-center">
                        <input 
                          id={`score-mot-${student.id}`}
                          type="text" 
                          placeholder="-"
                          value={score.mot}
                          onChange={(e) => handleScoreChange(student.id, "mot", e.target.value)}
                          className="w-16 px-2 py-1 border border-slate-200 bg-slate-50/70 focus:bg-white text-center font-mono rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>

                      {/* EOT */}
                      <td className="py-3 px-4 text-center">
                        <input 
                          id={`score-eot-${student.id}`}
                          type="text" 
                          placeholder="-"
                          value={score.eot}
                          onChange={(e) => handleScoreChange(student.id, "eot", e.target.value)}
                          className="w-16 px-2 py-1 border border-slate-200 bg-slate-50/70 focus:bg-white text-center font-mono rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>

                      <td className="py-3 px-6 text-right font-mono font-bold text-blue-600">
                        {computedAvg}
                      </td>
                    </tr>
                  );
                })}

                {classStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-14 text-slate-400">
                      No active students found in Class: {selectedClass} Stream: {selectedStream} inside current Section level. Try editing Student level or admission class details.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {classStudents.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button 
                id="btn-save-marksheet"
                onClick={handleSaveAll}
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-2 shadow-sm shadow-blue-900/15 cursor-pointer"
              >
                <Save size={16} />
                {saving ? "Saving Grades..." : "Save Class Marks"}
              </button>
            </div>
          )}
        </div>

        {/* Real-time stats card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 select-none">
            <TrendingUp size={16} className="text-blue-600" />
            Class Performance Stats
          </h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Real-time diagnostics calculated from the active scores entered above. Perfect to audit class distribution instantly!
          </p>

          <div className="space-y-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-500 block">Class Average Mark</span>
              <span className="text-xl font-bold font-mono text-slate-900">{classStats.average}%</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500 block text-[10px]">High Grade Score</span>
                <span className="text-sm font-bold font-mono text-indigo-600">{classStats.highestScore}%</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Low Grade Score</span>
                <span className="text-sm font-bold font-mono text-rose-600">{classStats.lowestScore}%</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block">Active Record Submissions</span>
              <span className="text-xs font-mono font-semibold text-slate-900">
                {classStats.activePupilsCount} out of {classStudents.length} pupils
              </span>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-2 text-[10px] text-amber-800 leading-relaxed">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-amber-600" />
              <span>
                Make sure to click <strong>"Save Class Marks"</strong> to write buffered results to the permanent server state. Unsaved inputs will be lost if tabs are changed!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
