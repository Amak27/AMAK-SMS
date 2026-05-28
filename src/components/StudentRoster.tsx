/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Search, 
  UserPlus, 
  Trash2, 
  Edit, 
  Filter, 
  ChevronRight, 
  X,
  CreditCard,
  Hash,
  Cake,
  FolderOpen
} from "lucide-react";
import { Student, Level } from "../types";

interface StudentRosterProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, "id">) => void;
  onUpdateStudent: (id: string, student: Student) => void;
  onDeleteStudent: (id: string) => void;
  currentViewTab: string; // "admissions" or "students"
}

export default function StudentRoster({ 
  students, 
  onAddStudent, 
  onUpdateStudent, 
  onDeleteStudent,
  currentViewTab
}: StudentRosterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("All");
  const [genderFilter, setGenderFilter] = useState<string>("All");

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(currentViewTab === "admissions");
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [level, setLevel] = useState<Level>("Primary");
  const [className, setClassName] = useState("P4"); // Default
  const [stream, setStream] = useState("E");
  const [payCode, setPayCode] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [parentEmail, setParentEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // Sync form state if the tab represents admissions
  React.useEffect(() => {
    if (currentViewTab === "admissions") {
      setIsFormOpen(true);
      setEditingStudentId(null);
      resetForm();
    }
  }, [currentViewTab]);

  const resetForm = () => {
    setName("");
    setAge("");
    setLevel("Primary");
    setClassName("P4");
    setStream("E");
    setPayCode("");
    setGender("Male");
    setParentEmail("");
    setPhotoUrl("");
  };

  const handleEditClick = (student: Student) => {
    setEditingStudentId(student.id);
    setName(student.name);
    setAge(student.age);
    setLevel(student.level);
    setClassName(student.className);
    setStream(student.stream);
    setPayCode(student.payCode);
    setGender(student.gender);
    setParentEmail(student.parentEmail || "");
    setPhotoUrl(student.photoUrl || "");
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age || !className.trim() || !stream.trim() || !payCode.trim()) {
      alert("Please fill in all details accurately.");
      return;
    }

    const payload = {
      name,
      age: Number(age),
      level,
      className,
      stream: stream.toUpperCase(),
      payCode,
      gender,
      registeredYear: new Date().getFullYear(),
      parentEmail,
      photoUrl
    };

    if (editingStudentId) {
      onUpdateStudent(editingStudentId, { ...payload, id: editingStudentId });
      setEditingStudentId(null);
    } else {
      onAddStudent(payload);
    }
    
    resetForm();
    setIsFormOpen(false);
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.payCode.includes(searchQuery);
    const matchesLevel = levelFilter === "All" || student.level === levelFilter;
    const matchesGender = genderFilter === "All" || student.gender === genderFilter;
    return matchesSearch && matchesLevel && matchesGender;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search and action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex-1 flex flex-wrap gap-2 items-center">
          {/* Search box */}
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              id="roster-search"
              type="text" 
              placeholder="Search Student name, ID, or Pay Code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-201 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500/80 transition-all font-mono shadow-inner"
            />
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
            <Filter size={14} className="text-slate-400" />
            <select 
              id="filter-level"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-transparent focus:outline-none font-medium text-slate-700 cursor-pointer"
            >
              <option value="All">All Curriculum Levels</option>
              <option value="Nursery">Nursery Section</option>
              <option value="Primary">Primary Section</option>
              <option value="O-Level">O-Level Secondary</option>
              <option value="A-Level">A-Level Secondary</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
            <select 
              id="filter-gender"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="bg-transparent focus:outline-none font-medium text-slate-700 cursor-pointer"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        <button 
          id="btn-admission"
          onClick={() => {
            setEditingStudentId(null);
            resetForm();
            setIsFormOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all self-start md:self-auto cursor-pointer shadow-sm shadow-blue-900/15"
        >
          <UserPlus size={16} />
          New Admission
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Admitted list */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Student Register Directory</h2>
            <span className="text-xs text-blue-600 font-mono font-semibold px-2.5 py-1 rounded-full bg-blue-50/70 border border-blue-100/50">
              {filteredStudents.length} Students matching
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-6">ID / LIN</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Level & Class</th>
                  <th className="py-3 px-4">Pay Code</th>
                  <th className="py-3 px-4 font-normal">Age / Gender</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-medium text-indigo-600">{student.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-gray-950">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/60 overflow-hidden flex items-center justify-center shrink-0">
                          {student.photoUrl ? (
                            <img src={student.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                              {student.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span>{student.name}</span>
                          {student.parentEmail && (
                            <span className="text-[10px] text-slate-400 font-normal font-mono">{student.parentEmail}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border
                          ${student.level === "Nursery" ? "bg-pink-50 border-pink-100 text-pink-700" : 
                            student.level === "Primary" ? "bg-indigo-50 border-indigo-100 text-indigo-700" : 
                            "bg-amber-50 border-amber-100 text-amber-700"}`}
                        >
                          {student.level}
                        </span>
                        <span className="font-medium text-gray-700">{student.className} {student.stream}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">{student.payCode}</td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono">
                      {student.age} yrs / <span className="text-[10px] py-0.5 px-1 bg-gray-150 rounded">{student.gender.charAt(0)}</span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          id={`btn-edit-${student.id}`}
                          onClick={() => handleEditClick(student)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900 transition-all"
                          title="Edit Student Account"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          id={`btn-delete-${student.id}`}
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${student.name}? Doing so clears their marks and comments permanently.`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 transition-all"
                          title="Delete Student"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      No matching student profiles found in the registry directory.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admission Form / Editor Panel */}
        {isFormOpen && (
          <div className="bg-white rounded-2xl border border-slate-205 p-6 shadow-md space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 id="form-heading" className="text-sm font-semibold text-slate-900">
                {editingStudentId ? `Update Profile: ${editingStudentId}` : "New Admission Registration"}
              </h2>
              <button 
                id="btn-close-form"
                onClick={() => setIsFormOpen(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-900 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Photo Upload Widget */}
              <div className="flex flex-col items-center justify-center space-y-1.5 border-b border-slate-100 pb-3">
                <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center group overflow-hidden shadow-inner">
                  {photoUrl ? (
                    <>
                      <img 
                        src={photoUrl} 
                        alt="Student snapshot" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl("")}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-2">
                      <span className="text-[9px] text-slate-400 font-bold block">No Portrait</span>
                      <span className="text-[7px] text-blue-500 block font-mono mt-0.5">Upload</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (file.size > 800 * 1024) {
                          alert("Student photo must be smaller than 800KB for system efficiency.");
                          return;
                        }
                        const r = new FileReader();
                        r.onload = (evt) => {
                          if (evt.target?.result) {
                            setPhotoUrl(evt.target.result as string);
                          }
                        };
                        r.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-[9px] text-slate-400">Click to upload student portrait image</p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Scholar Full Name</label>
                <input 
                  id="student-name-input"
                  type="text" 
                  required
                  placeholder="e.g. Kaiden Binokugumisiriza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Age */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Age (Years)</label>
                  <div className="relative">
                    <Cake className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input 
                      id="student-age-input"
                      type="number" 
                      required
                      min={2}
                      max={25}
                      placeholder="9"
                      value={age}
                      onChange={(e) => setAge(e.target.value !== "" ? Number(e.target.value) : "")}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all font-mono font-medium"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                  <select 
                    id="student-gender-input"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as "Male" | "Female")}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all font-medium cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              {/* Curriculum Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Admitted Curriculum Level</label>
                <select 
                  id="student-level-input"
                  value={level}
                  onChange={(e) => {
                    const lev = e.target.value as Level;
                    setLevel(lev);
                    // Match default class for this level
                    if (lev === "Nursery") setClassName("Baby Class");
                    else if (lev === "Primary") setClassName("P4");
                    else if (lev === "O-Level") setClassName("S2");
                    else setClassName("S5");
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all font-medium cursor-pointer"
                >
                  <option value="Nursery">Nursery Section (Developmental)</option>
                  <option value="Primary">Primary Section (Standard UNEB)</option>
                  <option value="O-Level">O-Level Secondary (Best 8 Comp)</option>
                  <option value="A-Level">A-Level Secondary (UNEB Principles)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Class */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Class</label>
                  <input 
                    id="student-class-input"
                    type="text" 
                    required
                    placeholder="e.g. P4E"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all font-medium"
                  />
                </div>

                {/* Stream */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stream</label>
                  <input 
                    id="student-stream-input"
                    type="text" 
                    required
                    placeholder="e.g. E"
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all font-mono font-medium uppercase"
                  />
                </div>
              </div>

              {/* Pay Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">School Pay Code (LIN)</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input 
                      id="student-pay-input"
                      type="text" 
                      required
                      placeholder="e.g. 1002244540"
                      value={payCode}
                      onChange={(e) => setPayCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all font-mono font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Parent Email (Notification)</label>
                  <input 
                    id="student-email-input"
                    type="email" 
                    placeholder="e.g. parent@gmail.com"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <button 
                id="btn-register-submit"
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 transition-all font-semibold rounded-lg text-white shadow-sm shadow-blue-900/15 cursor-pointer"
              >
                {editingStudentId ? "Update Student Profile" : "Register Pupil Admission"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
