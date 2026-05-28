/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Printer, 
  User, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  FileText, 
  Sparkles,
  Award,
  Calendar,
  Layers,
  Check,
  AlertCircle,
  GraduationCap
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Student, ReportCardCalculation, ReportCardComments, Level, SchoolSettings } from "../types";
import { CREST_PRESETS, STAMP_PRESETS } from "./SchoolSettings";
import { Mail, Send } from "lucide-react";

interface ReportCardViewProps {
  students: Student[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  settings?: SchoolSettings;
}

export default function ReportCardView({ students, selectedStudentId, onSelectStudent, settings }: ReportCardViewProps) {
  const [report, setReport] = useState<ReportCardCalculation | null>(null);
  const [comments, setComments] = useState<ReportCardComments | null>(null);
  
  // Nursery evaluation progress state
  const [nurseryEval, setNurseryEval] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [term, setTerm] = useState("TERM 2");
  const [year, setYear] = useState(2024);

  // O-Level specific sub-report template toggle
  const [activeOLevelSubReport, setActiveOLevelSubReport] = useState<string>("end-of-term");

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const triggerEmailModal = () => {
    if (!selectedStudent) return;
    setRecipientEmail(selectedStudent.parentEmail || "parent@gmail.com");
    setEmailSubject(`Academic Report Card for ${selectedStudent.name} - ${term} ${year}`);
    setEmailBody(`Dear Parent/Guardian,\n\nPlease find attached the official report card details for ${selectedStudent.name} for the assessment period of ${term} ${year}.\n\nSchool official comments: "${comments?.headTeacher?.text || 'Determined to Excel.'}"\n\nKind regards,\nSchool Administration.`);
    setIsEmailModalOpen(true);
    setEmailSuccess(false);
  };

  const handleDownloadPDF = async (student: Student) => {
    if (!printAreaRef.current) return;
    
    setLoading(true);
    try {
      const element = printAreaRef.current;
      
      // Compute high-resolution canvas capture
      const canvas = await html2canvas(element, {
        scale: 2.2, // Clean, legible vectors without huge memory load
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      
      // Standard portrait A4 document setup
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Calculate layout scaling
      const imgWidth = pdfWidth;
      const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;
      
      // Single A4 sheet fitting or continuous flow if overflow
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pdfHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pdfHeight;
      }
      
      const slugifiedName = student.name.replace(/\s+/g, "_");
      const reportSlug = activeOLevelSubReport.toUpperCase().replace(/\s+/g, "_");
      const documentTitle = `${slugifiedName}_OLevel_${reportSlug}_Report_${term.replace(/\s+/g, "_")}_${year}.pdf`;
      
      pdf.save(documentTitle);
    } catch (err) {
      console.error("Failed to compile or download report PDF document:", err);
      alert("Encountered canvas allocation error compiling high-resolution PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!recipientEmail.trim()) {
      alert("Please provide a valid recipient email address.");
      return;
    }
    setSendingEmail(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          studentName: selectedStudent?.name,
          recipient: recipientEmail,
          subject: emailSubject,
          body: emailBody,
          stampUrl: settings?.stampUrl,
        })
      });
      const data = await res.json();
      if (data.success) {
        setEmailSuccess(true);
      } else {
        alert("Server returned error when dispatching mail broadcast: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Network timeout or SMTP dispatch error.");
    } finally {
      setSendingEmail(false);
    }
  };

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Sync term and year dynamically from school settings on mount/change
  useEffect(() => {
    if (settings) {
      setTerm(settings.termName || "TERM 2");
      setYear(settings.academicYear || 2024);
    }
  }, [settings]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // High fidelity vector logo or image crest rendering
  const renderLogoEmblem = (fallbackIcon: React.ReactNode) => {
    if (!settings || !settings.showLogo) {
      return (
        <div className="w-14 h-14 bg-gradient-to-tr from-indigo-950 to-indigo-800 text-white flex items-center justify-center font-bold tracking-tight rounded-xl ring-2 ring-indigo-200 shrink-0 print:w-12 print:h-12">
          {fallbackIcon}
        </div>
      );
    }
    
    if (!settings.logoUrl) {
      return (
        <div className="w-14 h-14 bg-gradient-to-tr from-indigo-950 to-indigo-800 text-white flex items-center justify-center font-bold tracking-tight rounded-xl ring-2 ring-indigo-200 shrink-0 print:w-12 print:h-12">
          {fallbackIcon}
        </div>
      );
    }

    if (settings.logoUrl.startsWith("crest-")) {
      const preset = CREST_PRESETS.find(p => p.id === settings.logoUrl);
      if (preset) {
        return (
          <div 
            className="w-14 h-14 shrink-0 flex items-center justify-center print:w-12 print:h-12 text-blue-800"
            dangerouslySetInnerHTML={{ __html: preset.svg }} 
          />
        );
      }
    }

    return (
      <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl p-1 shrink-0 flex items-center justify-center shadow-sm print:w-12 print:h-12">
        <img 
          src={settings.logoUrl} 
          alt="School Badge" 
          className="max-w-full max-h-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  };

  // Sync default student if none selected
  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      onSelectStudent(students[0].id);
    }
  }, [students, selectedStudentId]);

  // Load calculated database contents
  useEffect(() => {
    if (!selectedStudentId) return;
    setLoading(true);

    const loadData = async () => {
      try {
        // 1. Fetch calculated Report matrix
        const reportRes = await fetch(`/api/reports/${selectedStudentId}/${term}/${year}`);
        const reportData = await reportRes.json();
        if (!reportData.error) {
          setReport(reportData);
        }

        // 2. Fetch comments texts
        const comRes = await fetch(`/api/comments/${selectedStudentId}`);
        const comData = await comRes.json();
        setComments(comData);

        // 3. If nursery level student, fetch special evaluation checkpoints
        if (selectedStudent?.level === "Nursery") {
          const nurseryRes = await fetch(`/api/nursery-evaluations/${selectedStudentId}`);
          const nurseryData = await nurseryRes.json();
          setNurseryEval(nurseryData);
        } else {
          setNurseryEval(null);
        }
      } catch (err) {
        console.error("Error loading report card requirements", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedStudentId, term, year]);

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Quick inject style to ensure exact printable dimensions
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body { background: white; color: black; padding: 0; margin: 0; font-size: 11px; }
        .no-print { display: none !important; }
        .print-shadow { box-shadow: none !important; border: none !important; }
        .print-border-thick { border: 2px solid #000 !important; }
        .print-blue-border { border: 2.5px solid #1e40af !important; }
        .print-bg-green { background-color: #047857 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; color: white !important; }
        .print-bg-gray { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .table-borders th, .table-borders td { border: 1px solid #000 !important; }
      }
    `;
    document.head.appendChild(style);
    
    window.print();
    
    // Clean style up after operations
    style.remove();
  };

  const handlePrevStudent = () => {
    const idx = students.findIndex(s => s.id === selectedStudentId);
    if (idx > 0) {
      onSelectStudent(students[idx - 1].id);
    }
  };

  const handleNextStudent = () => {
    const idx = students.findIndex(s => s.id === selectedStudentId);
    if (idx !== -1 && idx < students.length - 1) {
      onSelectStudent(students[idx + 1].id);
    }
  };

  if (!selectedStudent) {
    return (
      <div className="text-center py-20 text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <AlertCircle size={32} className="mx-auto text-slate-300 mb-2 animate-bounce" />
        <p className="text-sm">Please register or select student to visualize template report cards.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Bar panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-3">
          {/* Student Selector */}
          <div className="flex items-center gap-1">
            <button 
              id="report-btn-prev"
              onClick={handlePrevStudent}
              disabled={students.findIndex(s => s.id === selectedStudentId) === 0}
              className="p-1 px-2.5 bg-slate-50 border border-slate-250 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-all font-semibold cursor-pointer text-slate-700"
            >
              &larr; Prev
            </button>
            <select 
              id="report-student-select"
              value={selectedStudentId}
              onChange={(e) => onSelectStudent(e.target.value)}
              className="px-3 py-1.5 border border-slate-250 rounded-xl text-xs font-bold text-slate-700 bg-slate-50/55 focus:outline-none cursor-pointer"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.className} {s.stream})</option>
              ))}
            </select>
            <button 
              id="report-btn-next"
              onClick={handleNextStudent}
              disabled={students.findIndex(s => s.id === selectedStudentId) === students.length - 1}
              className="p-1 px-2.5 bg-slate-50 border border-slate-250 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-all font-semibold cursor-pointer text-slate-700"
            >
              Next &rarr;
            </button>
          </div>

          <span className="text-slate-200">|</span>

          {/* Term Setting */}
          <select 
            id="report-term-select"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-250 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 cursor-pointer"
          >
            <option value="TERM 1">TERM 1</option>
            <option value="TERM 2">TERM 2</option>
            <option value="TERM 3">TERM 3</option>
          </select>

          {/* Year Setting */}
          <select 
            id="report-year-select"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-2.5 py-1.5 border border-slate-250 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 font-mono cursor-pointer"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Print Report */}
          <button 
            id="btn-print-report"
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 font-semibold text-xs text-white rounded-lg flex items-center justify-center gap-2 shadow-sm shadow-blue-900/15 transition-all cursor-pointer active:scale-[0.98]"
            title="Print Report Card of selected pupil"
          >
            <Printer size={14} />
            Print Report
          </button>

          {/* Download offline PDF document */}
          <button 
            id="btn-download-report"
            onClick={() => handleDownloadPDF(selectedStudent)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-semibold text-xs text-slate-700 border border-slate-250 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
            title="Download official high-fidelity academic Report Card document in Adobe PDF format"
          >
            <Download size={14} />
            Download PDF
          </button>

          {/* Email Report direct to parent */}
          <button 
            id="btn-email-report"
            onClick={triggerEmailModal}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 font-semibold text-xs text-white rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.98]"
            title="Securely email report card documents directly to parent contact"
          >
            <Mail size={14} />
            Email Parent
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white border border-slate-200/80 rounded-2xl shadow-sm text-slate-400 font-medium">
          Loading report card from academic servers...
        </div>
      ) : (
        /* Report printable scope */
        <div 
          ref={printAreaRef}
          className="bg-white overflow-hidden p-4 md:p-8 rounded-2xl border border-slate-200 shadow-lg text-xs text-slate-900 mx-auto select-none print:shadow-none print:border-none print:p-0 font-sans print-shadow"
          style={{ maxWidth: "800px" }}
        >
          {/* CURRICULUM LEVEL CHANGER SELECTOR */}
          {selectedStudent.level === "Primary" && report && comments && (
            /* ========================================================
               PRIMARY REPORT CARD TEMPLATE (REPLICA OF ATTACHED PDF)
               ======================================================== */
            <div className="space-y-4 print-border-thick">
              {/* Header section */}
              <div className="flex justify-between items-center border-b-2 border-red-650 pb-2 flex-col sm:flex-row text-center sm:text-left gap-4">
                <div className="flex items-center gap-4 flex-col sm:flex-row">
                  {/* Sharebility Crest and Title */}
                  <div className="flex items-center gap-3">
                    {renderLogoEmblem(<Award size={32} />)}
                    <div>
                      <h1 className="text-lg font-black tracking-wider text-gray-950 font-sans uppercase leading-tight">
                        {settings?.schoolName || "SHAREBILITY UGANDA"}
                      </h1>
                      <p className="text-[10px] font-extrabold tracking-widest text-emerald-800 uppercase font-sans">
                        PRIMARY SCHOOL SECTION {settings?.motto ? `| "${settings.motto}"` : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[9.5px] sm:text-right font-semibold text-gray-500 space-y-0.5">
                  <p>{settings?.address || "P. O. Box, 212 Kampala"}  |  {settings?.website || "www.sharebility.net"}</p>
                  <p>{settings?.email || "info@sharebility.net"}  |  Tel: {settings?.phone || "+256 776960740"}</p>
                </div>
              </div>

              {/* Title tag */}
              <div className="bg-gray-100 py-1.5 text-center rounded-md font-sans border border-gray-200 select-none print-bg-gray">
                <h2 className="text-sm font-extrabold tracking-widest text-gray-950 uppercase">
                  LEARNER'S ASSESSMENT REPORT {term}, {year}
                </h2>
              </div>

              {/* Personal Details Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 pb-3 border-b border-gray-150">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">LIN / ID No.</span>
                  <p className="font-extrabold text-indigo-700 font-mono text-sm border-b border-dashed border-gray-300 pb-0.5 mt-0.5">
                    {selectedStudent.id}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Class & Stream</span>
                  <p className="font-extrabold text-gray-900 border-b border-dashed border-gray-300 pb-0.5 mt-0.5">
                    {selectedStudent.className}{selectedStudent.stream}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">School Pay Code</span>
                  <p className="font-extrabold text-gray-900 font-mono border-b border-dashed border-gray-300 pb-0.5 mt-0.5">
                    {selectedStudent.payCode}
                  </p>
                </div>
                <div className="row-span-2 hidden sm:flex items-center justify-center">
                  <div className="w-16 h-16 bg-slate-55 rounded-lg border border-slate-250 flex items-center justify-center text-slate-300 overflow-hidden shadow-inner shrink-0" title="Profile Snapshot">
                    {selectedStudent.photoUrl ? (
                      <img 
                        src={selectedStudent.photoUrl} 
                        alt={selectedStudent.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User size={28} className="text-slate-300" />
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Learner Full Name</span>
                  <p className="font-extrabold text-gray-900 text-sm border-b border-dashed border-gray-300 pb-0.5 mt-0.5">
                    {selectedStudent.name}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Age / Gender</span>
                  <p className="font-extrabold text-gray-900 border-b border-dashed border-gray-300 pb-0.5 mt-0.5">
                    {selectedStudent.age} Years / {selectedStudent.gender}
                  </p>
                </div>
              </div>

              {/* Mini Exams Table Assessment ( replica of top matrix ) */}
              <div className="space-y-1.5">
                <h3 className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider">Assessment Periods Summary</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-350 text-center font-sans text-[11px] table-borders">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] text-gray-600 font-semibold print-bg-gray">
                        <th className="py-1 px-2 text-left border border-gray-300">ASSESSMENT</th>
                        {report.subjectDetails.map(d => (
                          <th key={d.subjectCode} className="py-1 px-1 border border-gray-300">{d.subjectCode}</th>
                        ))}
                        <th className="py-1 px-1 border border-gray-300 font-bold">Ttl</th>
                        <th className="py-1 px-1 border border-gray-300 font-bold">Ave</th>
                        <th className="py-1 px-1 border border-gray-300 font-bold">Agg</th>
                        <th className="py-1 px-1 border border-gray-300 font-bold">DIV</th>
                        <th className="py-1 px-1 border border-gray-300 font-bold">POS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* BOT Row */}
                      <tr>
                        <td className="py-1 px-2 text-left font-bold border border-gray-300 text-[10px]">BEG'ING OF TERM</td>
                        {report.subjectDetails.map(d => (
                          <td key={d.subjectCode} className="py-1 border border-gray-300 font-mono">
                            {d.bot !== "" ? d.bot : "-"}
                          </td>
                        ))}
                        <td className="py-1 border border-gray-300 font-bold font-mono">
                          {Math.round(report.subjectDetails.reduce((acc, current) => acc + (Number(current.bot) || 0), 0))}
                        </td>
                        <td className="py-1 border border-gray-300 font-bold font-mono">
                          {(report.subjectDetails.reduce((acc, current) => acc + (Number(current.bot) || 0), 0) / report.subjectDetails.filter(d => d.bot !== "").length || 0).toFixed(1)}
                        </td>
                        <td className="py-1 border border-gray-300 font-mono">-</td>
                        <td className="py-1 border border-gray-300 font-bold">3</td>
                        <td className="py-1 border border-gray-300 font-mono">{report.classPosition}</td>
                      </tr>

                      {/* MOT Row */}
                      <tr>
                        <td className="py-1 px-2 text-left font-bold border border-gray-300 text-[10px]">MID TERM</td>
                        {report.subjectDetails.map(d => (
                          <td key={d.subjectCode} className="py-1 border border-gray-300 font-mono">
                            {d.mot !== "" ? d.mot : "-"}
                          </td>
                        ))}
                        <td className="py-1 border border-gray-300 font-bold font-mono">
                          {Math.round(report.subjectDetails.reduce((acc, current) => acc + (Number(current.mot) || 0), 0))}
                        </td>
                        <td className="py-1 border border-gray-300 font-bold font-mono">
                          {(report.subjectDetails.reduce((acc, current) => acc + (Number(current.mot) || 0), 0) / report.subjectDetails.filter(d => d.mot !== "").length || 0).toFixed(1)}
                        </td>
                        <td className="py-1 border border-gray-300 font-mono">-</td>
                        <td className="py-1 border border-gray-300 font-bold">3</td>
                        <td className="py-1 border border-gray-300 font-mono">{report.classPosition}</td>
                      </tr>

                      {/* EOT Row */}
                      <tr>
                        <td className="py-1 px-2 text-left font-bold border border-gray-300 text-[10px]">END OF TERM</td>
                        {report.subjectDetails.map(d => (
                          <td key={d.subjectCode} className="py-1 border border-gray-300 font-mono">
                            {d.eot !== "" ? d.eot : "-"}
                          </td>
                        ))}
                        <td className="py-1 border border-gray-300 font-bold font-mono">{report.totalMarks}</td>
                        <td className="py-1 border border-gray-300 font-bold font-mono">{report.averageMark}</td>
                        <td className="py-1 border border-gray-300 font-bold font-mono">{report.aggregates}</td>
                        <td className="py-1 border border-gray-300 font-bold text-emerald-600">{report.division.charAt(report.division.length - 1)}</td>
                        <td className="py-1 border border-gray-300 font-mono font-bold">{report.classPosition}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* End of Term Results Subject Specific Matrix */}
              <div className="space-y-1.5">
                <div className="bg-gray-100 py-1 text-center font-bold tracking-widest text-gray-950 uppercase rounded border border-gray-200 print-bg-gray">
                  AVERAGE / END OF TERM RESULTS MATRIX
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-350 text-left font-sans text-[11px] table-borders">
                    <thead>
                      <tr className="bg-gray-50 text-[10px] text-gray-600 font-semibold print-bg-gray">
                        <th className="py-1.5 px-3 border border-gray-300">SUBJECT</th>
                        <th className="py-1.5 px-2 border border-gray-300 text-center">FINAL MARK (100%)</th>
                        <th className="py-1.5 px-2 border border-gray-300 text-center">GRADE</th>
                        <th className="py-1.5 px-2 border border-gray-300 text-center">SUBJ POSN</th>
                        <th className="py-1.5 px-3 border border-gray-300">COMMENT</th>
                        <th className="py-1.5 px-3 border border-gray-300">SUBJECT TEACHER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.subjectDetails.map((sub) => (
                        <tr key={sub.subjectCode} className={sub.finalMark === "" ? "opacity-40" : ""}>
                          <td className="py-1 px-3 font-semibold border border-gray-300">{sub.subjectName}</td>
                          <td className="py-1 px-2 text-center font-mono border border-gray-300 font-bold text-gray-900">{sub.finalMark !== "" ? sub.finalMark : "-"}</td>
                          <td className="py-1 px-2 text-center font-mono border border-gray-300 font-bold text-indigo-700">{sub.grade}</td>
                          <td className="py-1 px-2 text-center font-mono border border-gray-300">{sub.subjectPosition}</td>
                          <td className="py-1 px-3 border border-gray-300 text-gray-700">{sub.comment}</td>
                          <td className="py-1 px-3 border border-gray-300 italic text-gray-600">{sub.teacherName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Green Bar Totals Summary replica */}
              <div className="grid grid-cols-5 gap-0.5 text-center text-[10px] font-sans font-bold uppercase rounded-md overflow-hidden ring-1 ring-emerald-800 text-white select-none shadow">
                <div className="bg-emerald-800 p-2 border-r border-emerald-700 print-bg-green">
                  Total Marks: <span className="block font-extrabold text-sm font-mono mt-0.5">{report.totalMarks}</span>
                </div>
                <div className="bg-emerald-800 p-2 border-r border-emerald-700 print-bg-green">
                  Average: <span className="block font-extrabold text-sm font-mono mt-0.5">{report.averageMark}</span>
                </div>
                <div className="bg-emerald-800 p-2 border-r border-emerald-700 print-bg-green">
                  Position: <span className="block font-extrabold text-sm mt-0.5">{report.classPosition} of {report.totalClassCount}</span>
                </div>
                <div className="bg-emerald-800 p-2 border-r border-emerald-700 print-bg-green">
                  Aggregates: <span className="block font-extrabold text-sm font-mono mt-0.5">{report.aggregates}</span>
                </div>
                <div className="bg-emerald-800 p-2 print-bg-green">
                  Division: <span className="block font-extrabold text-sm mt-0.5">{report.division}</span>
                </div>
              </div>

              {/* Grading Scheme & Divisions reference cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-gray-600 border border-gray-150 p-2.5 rounded-lg bg-gray-50/50 print-bg-gray">
                <div>
                  <span className="font-extrabold text-gray-900 uppercase tracking-wider block mb-1">Grading Schema Reference:</span>
                  <div className="grid grid-cols-3 gap-0.5 font-mono">
                    <span>95+ &bull; D1</span>
                    <span>70-74 &bull; C4</span>
                    <span>50-54 &bull; P8</span>
                    <span>85-94 &bull; D2</span>
                    <span>65-69 &bull; C5</span>
                    <span>0-49 &bull; F9</span>
                    <span>75-84 &bull; C3</span>
                    <span>60-64 &bull; C6</span>
                    <span>55-59 &bull; P7</span>
                  </div>
                </div>
                <div>
                  <span className="font-extrabold text-gray-900 uppercase tracking-wider block mb-1">Divisions Matrix:</span>
                  <p className="font-mono leading-relaxed">
                    Div 1: 4-12 points | Div 2: 13-23 points<br />
                    Div 3: 24-29 points | Div 4: 30-34 points<br />
                    Div U (Unclassified): 35-36 points
                  </p>
                </div>
              </div>

              {/* Double bordered styled Comments Box replicating image */}
              <div className="border-[2.5px] border-indigo-700 p-3.5 space-y-3.5 rounded-lg flex flex-col print-blue-border">
                {/* Academics comment */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-1 pb-2 border-b border-indigo-100">
                  <div className="flex-1">
                    <span className="font-extrabold text-[10px] text-indigo-900 uppercase tracking-wider block mb-0.5">ACADEMICS COMMENT:</span>
                    <p className="italic text-gray-900 leading-normal text-xs font-sans">
                      "{comments.academics.text || "Demonstrates progressive attention and focus. Strive for higher performance next term."}"
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 text-right sm:w-32 italic">
                    Teacher: {comments.academics.teacher || "Were Sam"}
                  </span>
                </div>

                {/* Life skills comment */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-1 pb-2 border-b border-indigo-100">
                  <div className="flex-1">
                    <span className="font-extrabold text-[10px] text-indigo-900 uppercase tracking-wider block mb-0.5">LIFE SKILLS & CLUBS:</span>
                    <p className="italic text-gray-900 leading-normal text-xs font-sans">
                      "{comments.lifeSkills.text || "Very helpful around laboratory duties, participates beautifully in peer assemblies."}"
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 text-right sm:w-32 italic">
                    Teacher: {comments.lifeSkills.teacher || "Lisa Atim"}
                  </span>
                </div>

                {/* House Conduct comment */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-1 pb-2 border-b border-indigo-100">
                  <div className="flex-1">
                    <span className="font-extrabold text-[10px] text-indigo-900 uppercase tracking-wider block mb-0.5">HOUSE & CONDUCT:</span>
                    <p className="italic text-gray-900 leading-normal text-xs font-sans">
                      "{comments.houseConduct.text || "Keeps dormitory materials aligned perfectly and maintains tidy habits."}"
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 text-right sm:w-32 italic">
                    Teacher: {comments.houseConduct.teacher || "Wamboka Peter"}
                  </span>
                </div>

                {/* Head Teacher summary comment */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-1">
                  <div className="flex-1">
                    <span className="font-extrabold text-[10px] text-indigo-900 uppercase tracking-wider block mb-0.5">HEAD TEACHER'S SIGN OFF APPRAISAL:</span>
                    <p className="italic text-gray-900 leading-normal text-xs font-sans font-semibold">
                      "{comments.headTeacher.text || "A promising child who has адаpter nicely to primary learning center routines."}"
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 text-right sm:w-32 italic">
                    {comments.headTeacher.teacher || "Turyaijuka Brichards"}
                  </span>
                </div>
              </div>

              {/* Bottom footnotes, dates and stamp placeholders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-gray-150 items-end">
                <div className="space-y-2 text-[10px]">
                  <p className="text-[9px] uppercase font-mono tracking-wider text-gray-500">Holiday Requirements:</p>
                  <p className="font-bold text-gray-950 font-mono italic leading-relaxed">
                    {comments.requirements}
                  </p>
                  <div className="pt-2">
                    <span className="text-gray-500 block text-[9.5px]">Date of Issue:</span>
                    <span className="font-bold text-gray-955 font-mono text-[10.5px]">
                      {new Date().toLocaleDateString("en-GB", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 font-mono text-[10px]">
                  <div>
                    <span className="text-gray-500 block text-[9.5px]">Term Has ended on:</span>
                    <span className="font-bold text-gray-955 border-b border-gray-400 pb-0.5 block mt-0.5">
                      {settings?.termEndedOn || "2026-08-16"}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="text-gray-500 block text-[9.5px]">Next Term Commences:</span>
                    <span className="font-semibold text-blue-800 border-b border-gray-450 pb-0.5 block mt-0.5">
                      {settings?.nextTermCommences || comments.nextTermBegins}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="text-gray-500 block text-[9.5px]">Next Term Fees Payable:</span>
                    <span className="font-bold text-emerald-700 block mt-0.5 text-xs">{comments.nextTermFees}</span>
                  </div>
                </div>

                {/* School stamp replica box */}
                <div className="flex flex-col items-center justify-center p-2 border border-dashed border-gray-400 rounded-lg bg-gray-50/20 text-center select-none shrink-0 h-28 print-bg-gray relative overflow-hidden">
                  {settings?.showStamp && settings?.stampUrl ? (
                    <div className="flex items-center justify-center w-full h-full p-1">
                      {settings.stampUrl.startsWith("stamp-") ? (
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: STAMP_PRESETS.find(p => p.id === settings.stampUrl)?.svg || "" 
                          }} 
                        />
                      ) : (
                        <img 
                          src={settings.stampUrl} 
                          alt="Official stamp" 
                          className="max-w-full max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  ) : (
                    <>
                      <span className="text-[10px] uppercase tracking-widest text-gray-450 font-bold">SCHOOL STAMP</span>
                      <div className="w-10 h-10 rounded-full border border-dashed border-gray-300 mt-2 flex items-center justify-center text-[8px] text-gray-300 font-bold uppercase rotate-12">
                        OFFICIAL
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* School Motto */}
              <div className="text-center pt-3 border-t border-gray-100 italic text-[10px] font-mono text-gray-400">
                School Motto: "{settings?.motto || "Determined to Excel"}"
              </div>
            </div>
          )}

          {/* NURSERY LEVEL SPECIAL PATH CHANGER */}
          {selectedStudent.level === "Nursery" && nurseryEval && comments && (
            /* ========================================================
               NURSERY LEARNING PROGRESS REPORT TEMPLATE
               ======================================================== */
            <div className="space-y-5 print-border-thick">
              {/* Heading Section */}
              <div className="flex flex-col sm:flex-row justify-between items-center border-b-2 border-pink-500 pb-3 text-center sm:text-left gap-4">
                <div className="flex items-center gap-3">
                  {renderLogoEmblem(<Award size={26} />)}
                  <div>
                    <h1 className="text-base font-black text-pink-600 uppercase leading-none">{settings?.schoolName || "SHAREBILITY NURSERY CENTER"}</h1>
                    <p className="text-[9px] font-mono tracking-wider text-gray-500 uppercase mt-1">Early Childhood Development Progress Record {settings?.motto ? `• "${settings.motto}"` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-[10px] text-gray-450 text-right mt-2 sm:mt-0 font-medium shrink-0">
                    <p>{settings?.address || "Kampala, Uganda"} | Tel: {settings?.phone || "+256 776960740"}</p>
                    <p>{settings?.website || "www.sharebility.net"} | {settings?.email || "info@sharebility.net"}</p>
                  </div>
                  {selectedStudent.photoUrl && (
                    <div className="w-12 h-12 rounded bg-pink-50/50 border border-pink-200 overflow-hidden shadow-sm flex items-center justify-center shrink-0">
                      <img src={selectedStudent.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-pink-50 text-pink-700 py-1.5 text-center rounded border border-pink-100 print-bg-pink">
                <h2 className="text-xs font-bold font-mono tracking-wider">DEVELOPMENTAL REPORT • {term} {year}</h2>
              </div>

              {/* Grid child parameters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-3 border-b border-gray-150">
                <div>
                  <span className="text-[10px] text-gray-500 block">Pupil’s Name</span>
                  <span className="font-bold text-gray-950 text-sm block mt-0.5">{selectedStudent.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">LIN / ID</span>
                  <span className="font-bold text-pink-600 font-mono block mt-0.5">{selectedStudent.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Class & Stream</span>
                  <span className="font-bold text-gray-950 block mt-0.5">{selectedStudent.className} {selectedStudent.stream}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Assessment Age</span>
                  <span className="font-bold text-gray-950 block mt-0.5">{selectedStudent.age} Years</span>
                </div>
              </div>

              {/* Special Skill Categories Block */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-900 border-b border-gray-100 pb-1 uppercase">Growth & Competency Achievements</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {nurseryEval.skillGroups?.map((group: any, idx: number) => (
                    <div key={idx} className="border border-gray-150 rounded-lg overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-3 py-1.5 font-bold text-[10px] text-gray-700 uppercase tracking-wide border-b border-gray-100 print-bg-gray">
                        {group.category}
                      </div>
                      <div className="divide-y divide-gray-50 text-xs">
                        {group.skills.map((skill: any) => (
                          <div key={skill.id} className="p-2.5 flex justify-between items-center bg-white gap-4">
                            <span className="text-gray-750 font-medium">{skill.description}</span>
                            
                            <div className="flex gap-1.5 flex-shrink-0 select-none">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono border
                                ${skill.rating === "A" ? "bg-green-50 border-green-150 text-green-700" : 
                                  skill.rating === "D" ? "bg-yellow-50 border-yellow-150 text-yellow-700" : 
                                  "bg-red-50 border-red-150 text-red-700"}`}
                              >
                                {skill.rating === "A" ? "Achieved" : skill.rating === "D" ? "Developing" : "Beginning"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competency standard ratings key info */}
              <div className="p-3 bg-pink-50/30 border border-pink-100/50 rounded-xl flex flex-wrap gap-4 text-[10px] text-gray-650 justify-between">
                <div>
                  <span className="font-bold text-pink-800 uppercase block mb-1">Learning Achievements Scale:</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span> Achieved (Competency demonstrated)</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span> Developing (Regular support needed)</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span> Beginning (Initial stages of skill)</span>
                  </div>
                </div>
              </div>

              {/* Double bordered styled Teacher remarks */}
              <div className="border-2 border-dashed border-pink-400 p-4 rounded-xl space-y-3.5">
                <div>
                  <span className="font-bold text-[10px] text-pink-700 uppercase tracking-wider block">Academics & Classroom Play remarks:</span>
                  <p className="italic text-gray-900 leading-normal text-xs mt-0.5">
                    "{comments.academics.text || "Liam is highly interactive. Sings rhymes excellently and participates with joy."}"
                  </p>
                  <span className="text-[10px] text-pink-600 font-semibold block mt-1">Teacher: {comments.academics.teacher || "Aunty Prossy"}</span>
                </div>

                <div className="pt-2 border-t border-dashed border-pink-100">
                  <span className="font-bold text-[10px] text-pink-700 uppercase tracking-wider block">Social Habits & Play behavior:</span>
                  <p className="italic text-gray-900 leading-normal text-xs mt-0.5">
                    "{comments.lifeSkills.text || "Very polite child. Shares sandbox accessories readily and clean blocks afterwards."}"
                  </p>
                  <span className="text-[10px] text-pink-600 font-semibold block mt-1">Teacher: {comments.lifeSkills.teacher || "Aunty Sarah"}</span>
                </div>

                <div className="pt-2 border-t border-dashed border-pink-100">
                  <span className="font-bold text-[10px] text-pink-700 uppercase tracking-wider block">Principal Sign-Off summary:</span>
                  <p className="italic text-gray-900 leading-normal text-xs mt-0.5">
                    "{comments.headTeacher.text || "Wonderful adaptive transition of the child into early learning streams."}"
                  </p>
                  <span className="text-[10px] text-pink-600 font-semibold block mt-1">Director: {comments.headTeacher.teacher || "Head Teacher"}</span>
                </div>
                           {/* Nursery footnotes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-gray-150 items-end font-mono text-[10px] text-gray-600">
                <div className="space-y-1.5">
                  <p className="font-bold text-gray-950 uppercase text-[9px]">Holiday requirements:</p>
                  <p className="italic text-gray-800 leading-relaxed">{comments.requirements}</p>
                  <div className="pt-2">
                    <span className="text-gray-500 block text-[9px]">Date of Issue (Printed):</span>
                    <span className="font-bold text-gray-950">{new Date().toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <div>
                    <span className="text-gray-500 block text-[9px]">Term Has Ended on:</span>
                    <span className="font-bold text-gray-955 border-b border-gray-300 pb-0.5 block mt-0.5">
                      {settings?.termEndedOn || "2026-08-16"}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="text-gray-500 block text-[9px]">Next Term Commencement:</span>
                    <span className="font-bold text-gray-955 border-b border-gray-300 pb-0.5 block mt-0.5">
                      {settings?.nextTermCommences || comments.nextTermBegins}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="text-gray-500 block text-[9px]">Next Term Fees Amount:</span>
                    <span className="font-bold text-pink-600 block mt-0.5 text-xs">{comments.nextTermFees}</span>
                  </div>
                </div>

                {/* Stamp block */}
                <div className="flex flex-col items-center justify-center p-2 border border-dashed border-pink-400 rounded-lg bg-pink-50/20 text-center select-none h-24 print-bg-gray relative overflow-hidden">
                  {settings?.showStamp && settings?.stampUrl ? (
                    <div className="flex items-center justify-center w-full h-full p-1">
                      {settings.stampUrl.startsWith("stamp-") ? (
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: STAMP_PRESETS.find(p => p.id === settings.stampUrl)?.svg || "" 
                          }} 
                        />
                      ) : (
                        <img 
                          src={settings.stampUrl} 
                          alt="Official stamp" 
                          className="max-w-full max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  ) : (
                    <>
                      <span className="text-[9px] uppercase tracking-widest text-pink-400 font-bold">Director Stamp</span>
                      <div className="w-8 h-8 rounded-full border border-dashed border-pink-205 mt-1 flex items-center justify-center text-[7px] text-pink-400 font-bold rotate-12">
                        SEAL
                      </div>
                    </>
                  )}
                </div>
              </div>   </div>
            </div>
          )}

          {/* O-LEVEL SECONDARY CURRICULUM SPECIAL ASSESSMENTS (NEW LOWER CURRICULUM) */}
          {selectedStudent.level === "O-Level" && report && comments && (
            /* ========================================================
               O-LEVEL REPORT CARD TEMPLATE (NEW LOWER SECONDARY)
               ======================================================== */
            <div className="space-y-4 print-border-thick">
              {/* Header block logo and names */}
              <div className="flex border-b-2 border-indigo-500 pb-3 justify-between items-center text-center sm:text-left flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3">
                  {renderLogoEmblem(<GraduationCap size={28} />)}
                  <div>
                    <h1 className="text-base font-bold leading-tight text-indigo-900 uppercase">{settings?.schoolName || "SHAREBILITY SECONDARY SCHOOL"}</h1>
                    <p className="text-[9px] font-mono tracking-widest text-slate-500 uppercase mt-1">O-Level New Lower Curriculum Report {settings?.motto ? `• "${settings.motto}"` : ""}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-[9px] text-gray-500 leading-tight border-l-0 sm:border-l sm:pl-3 border-gray-200 text-right shrink-0">
                    <p>{settings?.address || "Campus Box 25, Wakiso, Uganda"}</p>
                    <p>Tel: {settings?.phone || "+256 700 000 000"}</p>
                    <p>Email: {settings?.email || "olevel@sharebility.net"}</p>
                  </div>
                  {selectedStudent.photoUrl && (
                    <div className="w-12 h-12 rounded bg-slate-50 border border-slate-205 overflow-hidden shadow-sm flex items-center justify-center shrink-0">
                      <img src={selectedStudent.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              </div>

              {/* Title tag */}
              <div className="bg-indigo-50 text-indigo-800 py-1.5 text-center font-bold rounded-lg border border-indigo-100 uppercase tracking-wider text-[11px] select-none print-bg-indigo">
                Learner’s Term Performance Summary (Formative 20% & Summative 80%)
              </div>

              {/* Personal indicators grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-3 border-b border-gray-150">
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-mono">LIN / ID</span>
                  <span className="font-bold text-indigo-700 font-mono mt-0.5 block text-sm">{selectedStudent.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-mono">Scholar Full Name</span>
                  <span className="font-bold text-gray-950 mt-0.5 block">{selectedStudent.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-mono">Class Term Stream</span>
                  <span className="font-bold text-gray-950 mt-0.5 block font-mono">{selectedStudent.className} {selectedStudent.stream}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-mono">Pay Code / Fees Bal</span>
                  <span className="font-bold text-gray-950 font-mono mt-0.5 block">{selectedStudent.payCode}</span>
                </div>
              </div>

              {/* O-Level subjects score sheets */}
              <div className="space-y-2">
                <h3 className="text-[11px] font-bold text-gray-900 uppercase">Academic Subjects Learning Record</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-350 text-left font-sans text-[11px] table-borders">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] text-gray-600 font-semibold print-bg-gray">
                        <th className="py-2 px-3 border border-gray-300">SUBJECTS</th>
                        <th className="py-2 px-2 text-center border border-gray-300">BOT (out of 100)</th>
                        <th className="py-2 px-2 text-center border border-gray-300">MOT (out of 100)</th>
                        <th className="py-2 px-2 text-center border border-gray-300">Formative (20%)</th>
                        <th className="py-2 px-2 text-center border border-gray-300">Summative (80%)</th>
                        <th className="py-2 px-2 text-center border border-gray-300 font-bold text-indigo-700">Total (100%)</th>
                        <th className="py-2 px-2 text-center border border-gray-300 font-bold text-indigo-700">Curriculum Grade</th>
                        <th className="py-2 px-2 text-center border border-gray-300">DESCRIPTOR</th>
                        <th className="py-2 px-3 border border-gray-300">SUBJECT TEACHER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.subjectDetails.map((sub) => {
                        // Grade scale descriptors
                        let descriptor = "-";
                        if (sub.grade === "A") descriptor = "Exceptional";
                        else if (sub.grade === "B") descriptor = "Outstanding";
                        else if (sub.grade === "C") descriptor = "Satisfactory";
                        else if (sub.grade === "D") descriptor = "Basic";
                        else if (sub.grade === "E") descriptor = "Elementary";

                        return (
                          <tr key={sub.subjectCode} className={sub.finalMark === "" ? "opacity-40" : ""}>
                            <td className="py-1.5 px-3 font-semibold border border-gray-300 text-gray-900">{sub.subjectName}</td>
                            <td className="py-1.5 px-2 text-center border border-gray-300 font-mono">{sub.bot !== "" ? sub.bot : "-"}</td>
                            <td className="py-1.5 px-2 text-center border border-gray-300 font-mono">{sub.mot !== "" ? sub.mot : "-"}</td>
                            <td className="py-1.5 px-2 text-center border border-gray-300 font-mono font-medium text-slate-600">{sub.formativeScore !== "" ? `${sub.formativeScore}` : "-"}</td>
                            <td className="py-1.5 px-2 text-center border border-gray-300 font-mono font-medium text-slate-600">{sub.summativeScore !== "" ? `${sub.summativeScore}` : "-"}</td>
                            <td className="py-1.5 px-2 text-center border border-gray-300 font-bold font-mono text-gray-950">{sub.finalMark !== "" ? `${sub.finalMark}%` : "-"}</td>
                            <td className="py-1.5 px-2 text-center border border-gray-300 font-bold font-mono text-indigo-700">{sub.grade}</td>
                            <td className="py-1.5 px-2 text-center border border-gray-300 font-medium font-sans text-indigo-850 text-[10px]">{descriptor}</td>
                            <td className="py-1.5 px-3 border border-gray-300 text-gray-650">{sub.teacherName}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* O-Level summaries aggregates banner */}
              <div className="grid grid-cols-4 text-center rounded-lg overflow-hidden border border-indigo-400 font-bold uppercase font-mono text-indigo-950 my-4 shadow-sm">
                <div className="bg-indigo-50/50 p-2.5 border-r border-indigo-100 print-bg-indigo">
                  Total Marks: <span className="block font-bold text-indigo-700 text-sm mt-0.5">{report.totalMarks}</span>
                </div>
                <div className="bg-indigo-50/50 p-2.5 border-r border-indigo-100 print-bg-indigo">
                  Avg Score: <span className="block font-bold text-indigo-700 text-sm mt-0.5">{report.averageMark}%</span>
                </div>
                <div className="bg-indigo-50/50 p-2.5 border-r border-indigo-100 print-bg-indigo">
                  Best 8 Aggregates: <span className="block font-bold text-indigo-700 text-sm mt-0.5">{report.aggregates}</span>
                </div>
                <div className="bg-indigo-50/50 p-2.5 print-bg-indigo">
                  O-Level Division: <span className="block font-bold text-indigo-800 text-sm mt-0.5">{report.division}</span>
                </div>
              </div>

              {/* Comments block double bordered secondary */}
              <div className="border border-indigo-300 p-4 rounded-xl space-y-3 font-sans">
                <div>
                  <span className="font-extrabold text-[10px] text-indigo-800 uppercase block select-none mb-0.5">Academic Progress appraisal:</span>
                  <p className="italic text-gray-900 text-xs text-slate-700">
                    "{comments.academics.text || "Very positive and fast learner. Attains high marks in critical problem areas."}"
                  </p>
                  <span className="text-[10px] text-indigo-700 font-semibold block mt-1">Class Teacher: {comments.academics.teacher || "Mugisha Ronald"}</span>
                </div>

                <div className="pt-2 border-t border-dashed border-indigo-100">
                  <span className="font-extrabold text-[10px] text-indigo-800 uppercase block select-none mb-0.5">Life Skills & Boarding conduct:</span>
                  <p className="italic text-gray-900 text-xs text-slate-700">
                    "{comments.lifeSkills.text || "Very active in class co-curricular setups, obeys general school guidelines."}"
                  </p>
                  <span className="text-[10px] text-indigo-700 font-semibold block mt-1">House Tutor: {comments.lifeSkills.teacher || "Ondoga Sam"}</span>
                </div>

                <div className="pt-2 border-t border-dashed border-indigo-100">
                  <span className="font-extrabold text-[10px] text-indigo-800 uppercase block select-none mb-0.5">Head Teacher Signative directive:</span>
                  <p className="italic text-gray-900 text-xs font-semibold text-slate-900">
                    "{comments.headTeacher.text || "Good performance overall. Focus more on practical physics assignments to scale up targets."}"
                  </p>
                  <span className="text-[10px] text-indigo-700 font-semibold block mt-1">Headmaster: {comments.headTeacher.teacher || "Turyaijuka Brichards"}</span>
                </div>
              </div>

              {/* Footnotes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-gray-150 items-end font-mono text-[10px] text-gray-650">
                <div className="space-y-1.5">
                  <p className="font-bold text-gray-955 uppercase text-[9px]">Term Requirements:</p>
                  <p className="italic leading-relaxed text-gray-800">{comments.requirements}</p>
                  <div className="pt-2">
                    <span className="text-gray-500 block text-[9px]">Date of Issue (Printed):</span>
                    <span className="font-bold text-gray-950">{new Date().toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-left font-mono">
                  <div>
                    <span className="text-gray-500 block text-[9px]">Term Has Ended on:</span>
                    <span className="font-bold text-gray-955 border-b border-gray-300 pb-0.5 block mt-0.5">
                      {settings?.termEndedOn || "2026-08-16"}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="text-gray-500 block text-[9px]">Next Term Commences:</span>
                    <span className="font-semibold text-blue-800 border-b border-gray-300 pb-0.5 block mt-0.5">
                      {settings?.nextTermCommences || comments.nextTermBegins}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="text-gray-500 block text-[9px]">Next Term Fees Amount:</span>
                    <span className="font-bold text-indigo-700 block mt-0.5 text-xs">{comments.nextTermFees}</span>
                  </div>
                </div>

                {/* Stamp block */}
                <div className="flex flex-col items-center justify-center p-2 border border-dashed border-indigo-455 rounded-lg bg-indigo-50/20 text-center select-none h-24 print-bg-gray relative overflow-hidden">
                  {settings?.showStamp && settings?.stampUrl ? (
                    <div className="flex items-center justify-center w-full h-full p-1">
                      {settings.stampUrl.startsWith("stamp-") ? (
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: STAMP_PRESETS.find(p => p.id === settings.stampUrl)?.svg || "" 
                          }} 
                        />
                      ) : (
                        <img 
                          src={settings.stampUrl} 
                          alt="Official stamp" 
                          className="max-w-full max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  ) : (
                    <>
                      <span className="text-[9px] uppercase tracking-widest text-indigo-400 font-bold">OFFICIAL STAMP</span>
                      <div className="w-8 h-8 rounded-full border border-dashed border-indigo-200 mt-1 flex items-center justify-center text-[7px] text-indigo-400 font-bold rotate-12">
                        SEAL
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* A-LEVEL ADVANCED CURRICULUM SPECIAL ASSESSMENTS (UNEB STANDARD ASSESSMENT PRINCIPLES) */}
          {selectedStudent.level === "A-Level" && report && comments && (() => {
            // Group papers by core subjects dynamically for rendering spanned lines
            const groupedSubjects: { [key: string]: typeof report.subjectDetails } = {};
            const subsidiarySubjects: typeof report.subjectDetails = [];

            report.subjectDetails.forEach(d => {
              let nameLower = d.subjectName.toUpperCase();
              let isGP = nameLower.includes("GENERAL PAPER");
              let isICT = nameLower.includes("ICT");
              let isSubMtc = nameLower.includes("SUB MATHEMATICS");
              
              if (isGP || isICT || isSubMtc) {
                subsidiarySubjects.push(d);
              } else {
                let groupName = "OTHER";
                if (nameLower.includes("MATHEMATICS")) groupName = "MATHEMATICS";
                else if (nameLower.includes("PHYSICS")) groupName = "PHYSICS";
                else if (nameLower.includes("CHEMISTRY")) groupName = "CHEMISTRY";
                else if (nameLower.includes("BIOLOGY")) groupName = "BIOLOGY";
                else if (nameLower.includes("HISTORY")) groupName = "HISTORY";
                else if (nameLower.includes("GEOGRAPHY")) groupName = "GEOGRAPHY";
                
                if (!groupedSubjects[groupName]) {
                  groupedSubjects[groupName] = [];
                }
                groupedSubjects[groupName].push(d);
              }
            });

            // Helper to compute statistics on grouped papers
            const getGroupStatistics = (papers: typeof report.subjectDetails) => {
              const activeScores = papers.filter(p => p.finalMark !== "").map(p => Number(p.finalMark));
              if (activeScores.length === 0) return { avg: 0, grade: "-", points: 0 };
              const avg = activeScores.reduce((a, b) => a + b, 0) / activeScores.length;
              
              let grade = "F";
              let points = 0;
              // Modeled from the screenshot mapping scale
              if (avg >= 82) { grade = "A"; points = 6; }
              else if (avg >= 76) { grade = "B"; points = 5; }
              else if (avg >= 66) { grade = "C"; points = 4; }
              else if (avg >= 56) { grade = "D"; points = 3; }
              else if (avg >= 46) { grade = "E"; points = 2; }
              else if (avg >= 35) { grade = "O"; points = 1; }
              else { grade = "F"; points = 0; }
              
              return { avg: Math.round(avg * 10) / 10, grade, points };
            };

            return (
              /* ========================================================
                 A-LEVEL REPORT CARD TEMPLATE (Advanced UNEB Principles)
                 ======================================================== */
              <div className="space-y-4 print-border-thick">
                {/* Header block logo and names */}
                <div className="flex border-b-2 border-teal-500 pb-3 justify-between items-center text-center sm:text-left flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-3">
                    {renderLogoEmblem(<GraduationCap size={28} />)}
                    <div>
                      <h1 className="text-base font-bold leading-tight uppercase text-teal-900">{settings?.schoolName || "SHAREBILITY ADVANCED HIGH SCHOOL"}</h1>
                      <p className="text-[9px] font-mono tracking-widest text-slate-500 uppercase mt-1">A-Level UNEB Advanced Assessment Performance Record {settings?.motto ? `• "${settings.motto}"` : ""}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-[9px] text-gray-500 leading-tight border-l-0 sm:border-l sm:pl-3 border-gray-250 text-right shrink-0">
                      <p>{settings?.address || "Campus Box 25, Wakiso, Uganda"}</p>
                      <p>Tel: {settings?.phone || "+256 700 000 000"} | Web: {settings?.website || "advanced.sharebility.net"}</p>
                    </div>
                    {selectedStudent.photoUrl && (
                      <div className="w-12 h-12 rounded bg-slate-50 border border-slate-250 overflow-hidden shadow-sm flex items-center justify-center shrink-0">
                        <img src={selectedStudent.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Title tag */}
                <div className="bg-teal-50 text-teal-800 py-1.5 text-center font-bold rounded-lg border border-teal-100 uppercase tracking-wider text-[11px] select-none print-bg-teal">
                  A-LEVEL END OF TERM THREE REPORT PERFORMANCE SHEET
                </div>

                {/* Personal indicators grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-3 border-b border-gray-150">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-mono">REG Nº</span>
                    <span className="font-bold text-teal-700 font-mono mt-0.5 block text-sm">{selectedStudent.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-mono">Student Name</span>
                    <span className="font-bold text-gray-950 mt-0.5 block">{selectedStudent.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-mono">Class / Stream</span>
                    <span className="font-bold text-gray-950 mt-0.5 block font-mono">{selectedStudent.className} {selectedStudent.stream}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-mono">Admission Code / Pay Code</span>
                    <span className="font-bold text-gray-950 font-mono mt-0.5 block">{selectedStudent.payCode}</span>
                  </div>
                </div>

                {/* A-Level Academic Tables */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-bold text-teal-900 uppercase tracking-widest font-mono">Principal Core Subjects Section</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-350 text-left font-sans text-[11px] table-borders">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] text-gray-600 font-semibold print-bg-gray">
                            <th className="py-2 px-3 border border-gray-300">SUBJECTS</th>
                            <th className="py-2 px-2 text-center border border-gray-300 w-16">Paper</th>
                            <th className="py-2 px-2 text-center border border-gray-300 w-20">BOT (out of 40)</th>
                            <th className="py-2 px-2 text-center border border-gray-300 w-20">EOT (out of 60)</th>
                            <th className="py-2 px-2 text-center border border-gray-300 w-20 font-bold">TT (out of 100)</th>
                            <th className="py-2 px-2 text-center border border-gray-300 w-24">Paper Grade</th>
                            <th className="py-2 px-3 text-center border border-gray-300 w-24 font-bold text-teal-700">Subject Grade</th>
                            <th className="py-2 px-2 text-center border border-gray-300 w-16 font-bold text-teal-700">Points</th>
                            <th className="py-2 px-3 border border-gray-300">Teacher's Name & Sign Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(groupedSubjects).map((groupName) => {
                            const papers = groupedSubjects[groupName];
                            const stats = getGroupStatistics(papers);

                            return papers.map((paper, paperIdx) => {
                              const paperNum = paper.subjectName.match(/\d+/)?.at(0) || (paperIdx + 1);
                              return (
                                <tr key={paper.subjectCode} className={paper.finalMark === "" ? "opacity-40" : ""}>
                                  {paperIdx === 0 && (
                                    <td rowSpan={papers.length} className="py-1.5 px-3 font-semibold border border-gray-300 text-gray-900 bg-teal-50/5 align-middle">
                                      {groupName}
                                    </td>
                                  )}
                                  <td className="py-1.5 px-2 text-center border border-gray-300 font-mono">{paperNum}</td>
                                  <td className="py-1.5 px-2 text-center border border-gray-300 font-mono">{paper.bot !== "" ? paper.bot : "-"}</td>
                                  <td className="py-1.5 px-2 text-center border border-gray-300 font-mono">{paper.eot !== "" ? paper.eot : "-"}</td>
                                  <td className="py-1.5 px-2 text-center border border-gray-300 font-bold font-mono text-slate-800">{paper.finalMark !== "" ? paper.finalMark : "-"}</td>
                                  <td className="py-1.5 px-2 text-center border border-gray-300 font-bold font-mono text-amber-700 text-[10px]">{paper.grade}</td>
                                  {paperIdx === 0 && (
                                    <td rowSpan={papers.length} className="py-1.5 px-3 text-center border border-gray-300 font-bold font-sans text-teal-700 text-sm bg-teal-50/10 align-middle">
                                      {stats.grade}
                                    </td>
                                  )}
                                  {paperIdx === 0 && (
                                    <td rowSpan={papers.length} className="py-1.5 px-2 text-center border border-gray-300 font-mono font-extrabold text-teal-800 text-sm bg-teal-50/10 align-middle">
                                      {stats.points}
                                    </td>
                                  )}
                                  <td className="py-1.5 px-3 border border-gray-300 text-slate-500 italic text-[10px]">
                                    {paper.comment !== "-" ? `${paper.comment} (Tr. ${paper.teacherName})` : "-"}
                                  </td>
                                </tr>
                              );
                            });
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Subsidiary section */}
                  {subsidiarySubjects.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <h4 className="text-[11px] font-bold text-teal-900 uppercase tracking-widest font-mono">Subsidiary Subjects Section</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-350 text-left font-sans text-[11px] table-borders">
                          <thead>
                            <tr className="bg-slate-50 text-[10px] text-gray-600 font-semibold print-bg-gray">
                              <th className="py-2 px-3 border border-gray-300">SUBSIDIARY SUBJECTS</th>
                              <th className="py-2 px-2 text-center border border-gray-300 w-16">Paper</th>
                              <th className="py-2 px-2 text-center border border-gray-300 w-20">BOT/40</th>
                              <th className="py-2 px-2 text-center border border-gray-300 w-20">EOT/60</th>
                              <th className="py-2 px-2 text-center border border-gray-300 w-20 font-bold">TT/100</th>
                              <th className="py-2 px-2 text-center border border-gray-300 w-24">Grade</th>
                              <th className="py-2 px-3 text-center border border-gray-300 w-24 font-bold text-teal-700">Points Award</th>
                              <th className="py-2 px-3 border border-gray-300">Instructor Name / Subject Direction</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subsidiarySubjects.map((sub) => {
                              const pointsAward = Number(sub.finalMark) >= 35 ? 1 : 0;
                              const textGrade = Number(sub.finalMark) >= 35 ? "Pass" : "F";
                              return (
                                <tr key={sub.subjectCode} className={sub.finalMark === "" ? "opacity-40" : ""}>
                                  <td className="py-1.5 px-3 font-semibold border border-gray-300 text-gray-900">{sub.subjectName}</td>
                                  <td className="py-1.5 px-2 text-center border border-gray-300 font-mono">1</td>
                                  <td className="py-1.5 px-2 text-center border border-gray-300 font-mono">{sub.bot !== "" ? sub.bot : "-"}</td>
                                  <td className="py-1.5 px-2 text-center border border-gray-300 font-mono">{sub.eot !== "" ? sub.eot : "-"}</td>
                                  <td className="py-1.5 px-2 text-center border border-gray-300 font-bold font-mono text-slate-800">{sub.finalMark !== "" ? sub.finalMark : "-"}</td>
                                  <td className="py-1.5 px-2 text-center border border-gray-300 font-bold font-mono text-indigo-700">{textGrade}</td>
                                  <td className="py-1.5 px-3 text-center border border-gray-300 font-mono font-extrabold text-teal-800 text-sm bg-teal-50/5">{pointsAward}</td>
                                  <td className="py-1.5 px-3 border border-gray-300 text-gray-650">{sub.teacherName}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* A-Level Points Summary strip */}
                <div className="grid grid-cols-4 text-center rounded-lg overflow-hidden border border-teal-500 font-bold uppercase font-mono text-teal-950 my-4 shadow-sm">
                  <div className="bg-teal-50/50 p-2.5 border-r border-teal-100 print-bg-teal">
                    Class position: <span className="block font-bold text-teal-700 text-sm mt-0.5">{report.classPosition} of {report.totalClassCount}</span>
                  </div>
                  <div className="bg-teal-50/50 p-2.5 border-r border-teal-100 print-bg-teal">
                    Summative average: <span className="block font-bold text-teal-700 text-sm mt-0.5">{report.averageMark}%</span>
                  </div>
                  <div className="bg-teal-50/50 p-2.5 border-r border-teal-100 print-bg-teal">
                    Advanced aggregates points: <span className="block font-bold text-teal-700 text-lg mt-0.5">{report.aggregates} / 20</span>
                  </div>
                  <div className="bg-teal-50/50 p-2.5 print-bg-teal">
                    Principals passes summary: <span className="block font-bold text-teal-800 text-xs mt-1 lowercase">{report.division}</span>
                  </div>
                </div>

                {/* Comments block double bordered secondary */}
                <div className="border border-teal-300 p-4 rounded-xl space-y-3 font-sans">
                  <div>
                    <span className="font-extrabold text-[10px] text-teal-800 uppercase block select-none mb-0.5">Academic Progress appraisal:</span>
                    <p className="italic text-gray-900 text-xs text-slate-700">
                      "{comments.academics.text || "Maintains high marks in literature and mathematics. Needs specific concentration in lab chemistry modules."}"
                    </p>
                    <span className="text-[10px] text-teal-700 font-semibold block mt-1">Class Teacher: {comments.academics.teacher || "Katusiime Apofia"}</span>
                  </div>

                  <div className="pt-2 border-t border-dashed border-teal-100">
                    <span className="font-extrabold text-[10px] text-teal-800 uppercase block select-none mb-0.5">Life Skills & Boarding conduct:</span>
                    <p className="italic text-gray-900 text-xs text-slate-700">
                      "{comments.lifeSkills.text || "Very active and disciplined player on the school debating team, respects hostel rules."}"
                    </p>
                    <span className="text-[10px] text-teal-700 font-semibold block mt-1">House Tutor: {comments.lifeSkills.teacher || "Emorut George"}</span>
                  </div>

                  <div className="pt-2 border-t border-dashed border-teal-100">
                    <span className="font-extrabold text-[10px] text-teal-800 uppercase block select-none mb-0.5">Head Teacher Signative directive:</span>
                    <p className="italic text-gray-900 text-xs font-semibold text-slate-900">
                      "{comments.headTeacher.text || "Possesses great potential to excel. Maintain strict concentration in revision structures."}"
                    </p>
                    <span className="text-[10px] text-teal-700 font-semibold block mt-1">Headmaster: {comments.headTeacher.teacher || "Turyaijuka Brichards"}</span>
                  </div>
                </div>

                {/* Footnotes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-gray-150 items-end font-mono text-[10px] text-gray-650">
                  <div className="space-y-1.5">
                    <p className="font-bold text-gray-955 uppercase text-[9px]">Term Requirements:</p>
                    <p className="italic leading-relaxed text-gray-800">{comments.requirements}</p>
                    <div className="pt-2">
                      <span className="text-gray-500 block text-[9px]">Date of Issue (Printed):</span>
                      <span className="font-bold text-gray-950">{new Date().toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left font-mono">
                    <div>
                      <span className="text-gray-500 block text-[9px]">Term Has Ended on:</span>
                      <span className="font-bold text-gray-955 border-b border-gray-300 pb-0.5 block mt-0.5">
                        {settings?.termEndedOn || "2026-08-16"}
                      </span>
                    </div>
                    <div className="pt-2">
                      <span className="text-gray-500 block text-[9px]">Next Term Begins:</span>
                      <span className="font-semibold text-teal-800 border-b border-gray-300 pb-0.5 block mt-0.5">
                        {settings?.nextTermCommences || comments.nextTermBegins}
                      </span>
                    </div>
                    <div className="pt-2">
                      <span className="text-gray-500 block text-[9px]">Next Term Fees Amount:</span>
                      <span className="font-bold text-teal-700 block mt-0.5 text-xs">{comments.nextTermFees}</span>
                    </div>
                  </div>

                  {/* Stamp block */}
                  <div className="flex flex-col items-center justify-center p-2 border border-dashed border-teal-400 rounded-lg bg-teal-50/20 text-center select-none h-24 print-bg-gray relative overflow-hidden">
                    {settings?.showStamp && settings?.stampUrl ? (
                      <div className="flex items-center justify-center w-full h-full p-1">
                        {settings.stampUrl.startsWith("stamp-") ? (
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: STAMP_PRESETS.find(p => p.id === settings.stampUrl)?.svg || "" 
                            }} 
                          />
                        ) : (
                          <img 
                            src={settings.stampUrl} 
                            alt="Official stamp" 
                            className="max-w-full max-h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                    ) : (
                      <>
                        <span className="text-[9px] uppercase tracking-widest text-teal-400 font-bold">OFFICIAL STAMP</span>
                        <div className="w-8 h-8 rounded-full border border-dashed border-teal-200 mt-1 flex items-center justify-center text-[7px] text-teal-400 font-bold rotate-12">
                          SEAL
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900 bg-opacity-40 backdrop-blur-xs animate-fade-in no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-205 shadow-2xl p-6 relative overflow-hidden transition-all scale-100 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-905">Email Progress Report</h3>
                  <p className="text-[10px] text-slate-500">Transmit digital report sheet directly to guardians</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEmailModalOpen(false)}
                className="text-slate-400 hover:text-slate-650 font-bold text-sm p-1 rounded-full hover:bg-slate-100 outline-none"
              >
                &times;
              </button>
            </div>

            {emailSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-50 rounded-full border border-emerald-250 flex items-center justify-center text-emerald-605 mx-auto">
                  <Check size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Transmission Success!</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    The official report card for <span className="font-semibold text-slate-800">{selectedStudent.name}</span> has been broadcast to <span className="font-semibold text-teal-650">{recipientEmail}</span>.
                  </p>
                </div>
                <button 
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-xs rounded-xl text-slate-700 cursor-pointer mt-4"
                >
                  Close panel
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">To: Recipient Email Address</label>
                  <input 
                    type="email" 
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Enter parent's email address..."
                    className="w-full px-3 py-2 border border-slate-250 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
                  />
                  {selectedStudent.parentEmail ? (
                    <p className="text-[10px] text-emerald-600 font-mono mt-1">✓ Populated from parent registration profile</p>
                  ) : (
                    <p className="text-[10px] text-amber-600 font-mono mt-1">⚠ No parent email registered. Please type recipient above.</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Subject</label>
                  <input 
                    type="text" 
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-250 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Message Brief</label>
                  <textarea 
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-250 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 border-t justify-end">
                  <button 
                    onClick={() => setIsEmailModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-205 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSendEmail}
                    disabled={sendingEmail}
                    className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-705 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  >
                    {sendingEmail ? (
                      <>Disbursing...</>
                    ) : (
                      <>
                        <Send size={12} />
                        Dispatch Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
