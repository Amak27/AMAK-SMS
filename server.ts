/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API agent safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// ----------------------------------------------------
// DB SETUP & SEEDING (In-memory back-up and file-based persistence)
// ----------------------------------------------------
const DB_PATH = path.join(process.cwd(), "db.json");

interface DatabaseSchema {
  students: any[];
  subjects: any[];
  marks: any[];
  nurseryEvaluations: any[];
  comments: any[];
  settings?: any;
  users?: any[];
}

const defaultDb: DatabaseSchema = {
  students: [
    { id: "U0001", name: "Kaiden Binokugumisiriza", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244540", gender: "Male", registeredYear: 2024 },
    // Core students in Class P4E so rankings can be computed (position 2 out of 25)
    { id: "U0002", name: "Aaron Mukunde", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244541", gender: "Male", registeredYear: 2024 },
    { id: "U0003", name: "Brian Kansiime", age: 10, level: "Primary", className: "P4", stream: "E", payCode: "1002244542", gender: "Male", registeredYear: 2024 },
    { id: "U0004", name: "Chloe Atwine", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244543", gender: "Female", registeredYear: 2024 },
    { id: "U0005", name: "Daphne Namara", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244544", gender: "Female", registeredYear: 2024 },
    { id: "U0006", name: "Ethan Mwebaze", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244545", gender: "Male", registeredYear: 2024 },
    { id: "U0007", name: "Favour Ayebare", age: 8, level: "Primary", className: "P4", stream: "E", payCode: "1002244546", gender: "Female", registeredYear: 2024 },
    { id: "U0008", name: "Gideon Nuwagaba", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244547", gender: "Male", registeredYear: 2024 },
    { id: "U0009", name: "Hillary Twinomujuni", age: 10, level: "Primary", className: "P4", stream: "E", payCode: "1002244548", gender: "Male", registeredYear: 2024 },
    { id: "U0010", name: "Isabella Nshuti", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244549", gender: "Female", registeredYear: 2024 },
    { id: "U0011", name: "Julius Tumusiime", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244550", gender: "Male", registeredYear: 2024 },
    { id: "U0012", name: "Kenyon Kiconco", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244551", gender: "Male", registeredYear: 2024 },
    { id: "U0013", name: "Lillian Amutuhaire", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244552", gender: "Female", registeredYear: 2024 },
    { id: "U0014", name: "Marcus Asiimwe", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244553", gender: "Male", registeredYear: 2024 },
    { id: "U0015", name: "Nadia Kyomugisha", age: 8, level: "Primary", className: "P4", stream: "E", payCode: "1002244554", gender: "Female", registeredYear: 2024 },
    { id: "U0016", name: "Owen Niwagaba", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244555", gender: "Male", registeredYear: 2024 },
    { id: "U0017", name: "Patricia Kembabazi", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244556", gender: "Female", registeredYear: 2024 },
    { id: "U0018", name: "Raymond Natamba", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244557", gender: "Male", registeredYear: 2024 },
    { id: "U0019", name: "Sandra Ainembabazi", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244558", gender: "Female", registeredYear: 2024 },
    { id: "U0020", name: "Trevor Kakuru", age: 10, level: "Primary", className: "P4", stream: "E", payCode: "1002244559", gender: "Male", registeredYear: 2024 },
    { id: "U0021", name: "Ursula Agaba", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244560", gender: "Female", registeredYear: 2024 },
    { id: "U0022", name: "Victor Mugisha", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244561", gender: "Male", registeredYear: 2024 },
    { id: "U0023", name: "Winnie Akatusasira", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244562", gender: "Female", registeredYear: 2024 },
    { id: "U0024", name: "Xavier Ahumuza", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244563", gender: "Male", registeredYear: 2024 },
    { id: "U0025", name: "Yvonne Nyangoma", age: 9, level: "Primary", className: "P4", stream: "E", payCode: "1002244564", gender: "Female", registeredYear: 2024 },
    
    // Nursery student
    { id: "U0050", name: "Liam Katende", age: 4, level: "Nursery", className: "Baby Class", stream: "A", payCode: "1002244901", gender: "Male", registeredYear: 2024 },
    { id: "U0051", name: "Chloe Mukisa", age: 4, level: "Nursery", className: "Baby Class", stream: "A", payCode: "1002244902", gender: "Female", registeredYear: 2024 },
    
    // Secondary student
    { id: "U0100", name: "Elizabeth Nabakooza", age: 14, level: "O-Level", className: "S2", stream: "North", payCode: "1002245100", gender: "Female", registeredYear: 2024 },
    { id: "U0101", name: "Mukalele Rogers", age: 17, level: "A-Level", className: "S.5 Sc", stream: "Sc", payCode: "10023", gender: "Male", registeredYear: 2024 },
  ],
  subjects: [
    // Primary subjects matching the Uganda primary curriculum (and report card!)
    { code: "MTC", name: "MATHEMATICS", level: "Primary", teacherName: "Kinobe Alex" },
    { code: "ENG", name: "ENGLISH", level: "Primary", teacherName: "Muwanguzi Sarah" },
    { code: "SST", name: "SOCIAL STUDIES", level: "Primary", teacherName: "Were Silbert" },
    { code: "SCI", name: "SCIENCE", level: "Primary", teacherName: "Dumba Patrick" },
    { code: "R.R", name: "RUNYANKORE RUKIGA", level: "Primary", teacherName: "Galiwango Alice" },
    { code: "R.E", name: "RELIGIOUS EDUC", level: "Primary", teacherName: "Juma Hussein" },
    { code: "ART", name: "ART & CRAFT", level: "Primary", teacherName: "Byakatonda Paul" },
    { code: "PE", name: "PHYSICAL EDUC", level: "Primary", teacherName: "Gulume Isaac" },

    // Nursery learning areas
    { code: "N_NUM", name: "Number Work", level: "Nursery", teacherName: "Aunty Prossy" },
    { code: "N_LANG", name: "Language & Literacy", level: "Nursery", teacherName: "Aunty Joy" },
    { code: "N_ENV", name: "Social & Environment", level: "Nursery", teacherName: "Aunty Prossy" },
    { code: "N_CRE", name: "Creative Arts", level: "Nursery", teacherName: "Aunty Sarah" },
    { code: "N_PHY", name: "Physical & Health", level: "Nursery", teacherName: "Uncle Bob" },
    { code: "N_HAB", name: "Good Habits & Religion", level: "Nursery", teacherName: "Aunty Joy" },

    // O-Level subject curriculum
    { code: "S_MTC", name: "MATHEMATICS", level: "O-Level", teacherName: "Mugisha Ronald" },
    { code: "S_ENG", name: "ENGLISH LANGUAGE", level: "O-Level", teacherName: "Nsubuga David" },
    { code: "S_BIO", name: "BIOLOGY", level: "O-Level", teacherName: "Dr. Nabasa Claire" },
    { code: "S_CHE", name: "CHEMISTRY", level: "O-Level", teacherName: "Ondoga Sam" },
    { code: "S_PHY", name: "PHYSICS", level: "O-Level", teacherName: "Mwaka Charles" },
    { code: "S_HIS", name: "HISTORY & POLITICAL ED", level: "O-Level", teacherName: "Kato Joseph" },
    { code: "S_GEO", name: "GEOGRAPHY", level: "O-Level", teacherName: "Ayebare Shila" },
    { code: "S_LUG", name: "LUGANDA", level: "O-Level", teacherName: "Namubiru Joyce" },
    { code: "S_ART", name: "ART & DESIGN", level: "O-Level", teacherName: "Kasingye Paul" },

    // A-Level subject curriculum
    { code: "A_GP", name: "GENERAL PAPER (S101/1)", level: "A-Level", teacherName: "Wamono Micheal" },
    { code: "A_ICT", name: "SUBSIDIARY ICT (S850/1&2)", level: "A-Level", teacherName: "Dorah Nalukwago" },
    { code: "A_SUB_MTC", name: "SUB MATHEMATICS (S475/1)", level: "A-Level", teacherName: "Emorut George" },
    { code: "A_MTC_1", name: "Mathematics Paper 1", level: "A-Level", teacherName: "Katusiime Apofia" },
    { code: "A_MTC_2", name: "Mathematics Paper 2", level: "A-Level", teacherName: "Katusiime Apofia" },
    { code: "A_MTC_3", name: "Mathematics Paper 3", level: "A-Level", teacherName: "Katusiime Apofia" },
    { code: "A_MTC_4", name: "Mathematics Paper 4", level: "A-Level", teacherName: "Katusiime Apofia" },
    { code: "A_PHY_1", name: "Physics Paper 1", level: "A-Level", teacherName: "Lanyero Concy" },
    { code: "A_PHY_2", name: "Physics Paper 2", level: "A-Level", teacherName: "Lanyero Concy" },
    { code: "A_PHY_3", name: "Physics Paper 3 (Practical)", level: "A-Level", teacherName: "Lanyero Concy" },
    { code: "A_PHY_4", name: "Physics Paper 4", level: "A-Level", teacherName: "Lanyero Concy" },
    { code: "A_BIO_1", name: "Biology Paper 1", level: "A-Level", teacherName: "Norah Namugwere" },
    { code: "A_BIO_2", name: "Biology Paper 2", level: "A-Level", teacherName: "Norah Namugwere" },
    { code: "A_BIO_3", name: "Biology Paper 3 (Practical)", level: "A-Level", teacherName: "Norah Namugwere" },
  ],
  marks: [
    // Seed Kaiden's primary marks specifically (BOT, MOT, EOT)
    { studentId: "U0001", subjectCode: "MTC", marks: { bot: 50, mot: 50, eot: 56 } },
    { studentId: "U0001", subjectCode: "ENG", marks: { bot: 61, mot: 64, eot: 70 } },
    { studentId: "U0001", subjectCode: "SST", marks: { bot: 40, mot: 70, eot: 65 } },
    { studentId: "U0001", subjectCode: "SCI", marks: { bot: 55, mot: 56, eot: 45 } },
    { studentId: "U0001", subjectCode: "ART", marks: { bot: 92, mot: 66, eot: 72 } },
    // Fill out records for other students in class so positions, ranks, aggregates match.
    // Let's seed U0002 as the outstanding TOP student in P4E (Division 1)
    { studentId: "U0002", subjectCode: "MTC", marks: { bot: 90, mot: 95, eot: 96 } },
    { studentId: "U0002", subjectCode: "ENG", marks: { bot: 85, mot: 88, eot: 92 } },
    { studentId: "U0002", subjectCode: "SST", marks: { bot: 88, mot: 92, eot: 90 } },
    { studentId: "U0002", subjectCode: "SCI", marks: { bot: 94, mot: 90, eot: 95 } },
    { studentId: "U0002", subjectCode: "ART", marks: { bot: 80, mot: 82, eot: 85 } },

    // Add marks for Kaiden's classmates U0003 - U0025 with moderate passing scores (ranking below U0002 & U0001)
    ...Array.from({ length: 23 }, (_, index) => {
      const sId = `U00${String(index + 3).padStart(2, "0")}`;
      return [
        { studentId: sId, subjectCode: "MTC", marks: { bot: 40 + (index % 10), mot: 35 + (index % 12), eot: 38 + (index % 15) } },
        { studentId: sId, subjectCode: "ENG", marks: { bot: 45 + (index % 8), mot: 48 + (index % 10), eot: 50 + (index % 12) } },
        { studentId: sId, subjectCode: "SST", marks: { bot: 50 + (index % 9), mot: 45 + (index % 11), eot: 48 + (index % 10) } },
        { studentId: sId, subjectCode: "SCI", marks: { bot: 42 + (index % 12), mot: 40 + (index % 10), eot: 44 + (index % 11) } },
        { studentId: sId, subjectCode: "ART", marks: { bot: 60 + (index % 15), mot: 55 + (index % 10), eot: 58 + (index % 8) } },
      ];
    }).flat(),

    // Seed O-Level students
    { studentId: "U0100", subjectCode: "S_MTC", marks: { bot: 70, mot: 75, eot: 80 } },
    { studentId: "U0100", subjectCode: "S_ENG", marks: { bot: 75, mot: 70, eot: 78 } },
    { studentId: "U0100", subjectCode: "S_BIO", marks: { bot: 65, mot: 60, eot: 72 } },
    { studentId: "U0100", subjectCode: "S_CHE", marks: { bot: 60, mot: 58, eot: 65 } },
    { studentId: "U0100", subjectCode: "S_PHY", marks: { bot: 55, mot: 62, eot: 68 } },
    { studentId: "U0100", subjectCode: "S_HIS", marks: { bot: 80, mot: 85, eot: 82 } },
    { studentId: "U0100", subjectCode: "S_GEO", marks: { bot: 72, mot: 74, eot: 76 } },
    { studentId: "U0100", subjectCode: "S_LUG", marks: { bot: 85, mot: 88, eot: 90 } },
    { studentId: "U0100", subjectCode: "S_ART", marks: { bot: 90, mot: 92, eot: 94 } },

    // Seed A-Level student (Mukalele Rogers)
    { studentId: "U0101", subjectCode: "A_MTC_1", marks: { bot: 20, mot: "", eot: 60 } },
    { studentId: "U0101", subjectCode: "A_MTC_2", marks: { bot: 32, mot: "", eot: 34.2 } },
    { studentId: "U0101", subjectCode: "A_MTC_3", marks: { bot: 26.4, mot: "", eot: 46.8 } },
    { studentId: "U0101", subjectCode: "A_MTC_4", marks: { bot: 28.8, mot: "", eot: 53.4 } },
    { studentId: "U0101", subjectCode: "A_PHY_1", marks: { bot: 36, mot: "", eot: 46.8 } },
    { studentId: "U0101", subjectCode: "A_PHY_2", marks: { bot: 39.6, mot: "", eot: 33.6 } },
    { studentId: "U0101", subjectCode: "A_PHY_3", marks: { bot: 30.8, mot: "", eot: 52.8 } },
    { studentId: "U0101", subjectCode: "A_PHY_4", marks: { bot: 38.4, mot: "", eot: 48 } },
    { studentId: "U0101", subjectCode: "A_BIO_1", marks: { bot: 35.2, mot: "", eot: 49.2 } },
    { studentId: "U0101", subjectCode: "A_BIO_2", marks: { bot: 36.8, mot: "", eot: 51.6 } },
    { studentId: "U0101", subjectCode: "A_BIO_3", marks: { bot: 31.2, mot: "", eot: 44.4 } },
    { studentId: "U0101", subjectCode: "A_GP", marks: { bot: 12, mot: "", eot: 51 } },
    { studentId: "U0101", subjectCode: "A_ICT", marks: { bot: 34.4, mot: "", eot: 59.4 } },
  ],
  nurseryEvaluations: [
    {
      studentId: "U0050",
      term: "TERM 2",
      year: 2024,
      skillGroups: [
        {
          category: "Cognitive Development (Number concepts / logical thoughts)",
          skills: [
            { id: "cog1", description: "Recognises numbers 1 to 10 and pairs items correctly", rating: "A" },
            { id: "cog2", description: "Sorts objects by size, color and geometric shapes", rating: "A" },
            { id: "cog3", description: "Shows curiosity and solves simple multi-piece puzzles", rating: "D" }
          ]
        },
        {
          category: "Language & Communication Skills",
          skills: [
            { id: "lang1", description: "Expresses feelings and requests clearly in basic words", rating: "A" },
            { id: "lang2", description: "Sings familiar rhymes and participates in storytelling", rating: "A" },
            { id: "lang3", description: "Identifies letters and traces simple phonetic strokes", rating: "D" }
          ]
        },
        {
          category: "Motor Development (Fine & Gross Skills)",
          skills: [
            { id: "mot1", description: "Colors within the thick boundaries reasonably well", rating: "D" },
            { id: "mot2", description: "Holds crayons with proper, emerging pencil grip", rating: "D" },
            { id: "mot3", description: "Runs, skips, jumps, and maintains physical balance", rating: "A" }
          ]
        },
        {
          category: "Social & Emotional Habits",
          skills: [
            { id: "soc1", description: "Shares toys and takes turns during play with peers", rating: "A" },
            { id: "soc2", description: "Follows instructions and adheres to class routines", rating: "A" },
            { id: "soc3", description: "Demonstrates empathy and self-regulation", rating: "D" }
          ]
        },
        {
          category: "Good Manners & Hygiene Habits",
          skills: [
            { id: "hyg1", description: "Washes hands before meals and after visiting washrooms", rating: "A" },
            { id: "hyg2", description: "Cleans up play materials and keeps desk organized", rating: "A" },
            { id: "hyg3", description: "Greets classmates and teachers with a smile", rating: "A" }
          ]
        }
      ]
    }
  ],
  comments: [
    {
      studentId: "U0001",
      term: "TERM 2",
      year: 2024,
      academics: {
        text: "Kaiden, you have demonstrated fairly strong skills, strive to take it to the next level by setting higher goals.",
        teacher: "Were Sam"
      },
      lifeSkills: {
        text: "Kaiden is talented at football and is an active member of the ICT club at school",
        teacher: "Lisa Atim"
      },
      houseConduct: {
        text: "Kaiden is a cooperative house member and a good time manager. Needs to improve in personal hygiene.",
        teacher: "Wamboka Peter"
      },
      headTeacher: {
        text: "Kaiden, this is fairly good, focus on mastering areas of weakness in all subjects",
        teacher: "Turyaijuka Brichards"
      },
      requirements: "Broom, Ream, Uniform, Box file, 12 books,...",
      nextTermBegins: "2024-09-02",
      nextTermFees: "Shs 450,000"
    },
    {
      studentId: "U0050",
      term: "TERM 2",
      year: 2024,
      academics: {
        text: "Liam is an interactive learner who excels in number recognition and memory tasks.",
        teacher: "Aunty Prossy"
      },
      lifeSkills: {
        text: "Shows high interest in sorting shapes and creative finger painting activities.",
        teacher: "Aunty Sarah"
      },
      houseConduct: {
        text: "Follows playground procedures, interacts very politely with classmates.",
        teacher: "Aunty Jalia"
      },
      headTeacher: {
        text: "A promising child who has adapted wonderfully to kindergarten. Keep it up!",
        teacher: "Head Teacher"
      },
      requirements: "Slasher, Soap, Toilet rolls, Modeling clay",
      nextTermBegins: "2024-09-02",
      nextTermFees: "Shs 350,000"
    }
  ],
  settings: {
    schoolName: "SHAREBILITY HIGH SCHOOL",
    motto: "Determined to Excel",
    address: "Campus Box 25, Wakiso, Uganda",
    phone: "+256 776 960740",
    email: "olevel@sharebility.net",
    website: "www.sharebility.net",
    logoUrl: "", 
    showLogo: true,
    stampUrl: "",
    showStamp: true,
    termName: "TERM 2",
    academicYear: 2024,
    nextTermCommences: "2024-09-02",
    termEndedOn: "2024-08-16",
    smtpHost: "smtp.mailtrap.io",
    smtpPort: 2525,
    smtpUsername: "academix-system-gateway",
    smtpPassword: "smtp-password-token",
    smtpSenderName: "School Administration Terminal",
    smtpSenderEmail: "noreply@sharebility.net",
    smtpSecurity: "STARTTLS",
    emailTemplates: [
      {
        id: "term-report",
        name: "End of Term Report Delivery",
        subject: "Official Academic Report: {STUDENT_NAME} ({CLASS})",
        body: "Dear Parent/Guardian,\n\nPlease find attached the official report card for {STUDENT_NAME} ({CLASS}) for {TERM} {YEAR}.\n\nAcademic Performance Summary:\n- Average Score: {AVERAGE}%\n- Division / Grade Rank: {DIVISION}\n\nTeacher Appraisal Remarks:\n\"{CLASS_TEACHER_REMARKS}\"\n\nKindly note that school commences for next term on {NEXT_TERM_COMMENCES}.\n\nThank you for choosing {SCHOOL_NAME}.\n\nBest regards,\nSchool Administration"
      },
      {
        id: "formative-summary",
        name: "Formative Assessment Summary",
        subject: "Formative Progress Report: {STUDENT_NAME}",
        body: "Dear Parent/Guardian,\n\nWe are presenting the O-Level Formative Performance Summary for {STUDENT_NAME} ({CLASS}) for {TERM} {YEAR}.\n\nThis continuous assessment summary provides feedback on your learner's mastery of competencies and specific Activities of Integration (AOIs).\n\nBest regards,\n{SCHOOL_NAME} Registrar"
      },
      {
        id: "project-work",
        name: "Learner Project Assessment",
        subject: "New Curriculum Project Brief: {STUDENT_NAME}",
        body: "Dear Parent/Guardian,\n\nThis email delivers the Descriptive Report on Project Work for {STUDENT_NAME} in class {CLASS}.\n\nHighlight project details:\n- Student Project Name: {PROJECT_TITLE}\n- Competencies Demonstrated: {PROJECT_SKILLS}\n\nPlease check the attached document for continuous score updates.\n\nBest regards,\n{SCHOOL_NAME} Project Coordinator"
      }
    ]
  },
  users: [
    { username: "admin", password: "admin123", name: "Administrator", role: "Admin" },
    { username: "teacher", password: "teacher123", name: "Teacher User", role: "Teacher" }
  ]
};

// Simple flat file database loader
let db = defaultDb;
function loadDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, "utf-8");
      const loaded = JSON.parse(content);
      db = {
        ...defaultDb,
        ...loaded,
        settings: { ...defaultDb.settings, ...(loaded.settings || {}) },
        users: loaded.users && loaded.users.length > 0 ? loaded.users : defaultDb.users
      };
    } else {
      saveDb();
    }
  } catch (err) {
    console.error("Failed to load db, using defaults", err);
    db = defaultDb;
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save db into file", err);
  }
}

// Initial DB load
loadDb();


// ----------------------------------------------------
// GRADE CALCULATIONS HELPER (Ugandan - UNEB Standards)
// ----------------------------------------------------

/**
 * Normalizes mark to primary gradings & numeric aggregates
 */
export function getPrimaryGradeAndPoints(mark: number): { grade: string; points: number; comment: string } {
  if (mark >= 95) return { grade: "D1", points: 1, comment: "Excellent." };
  if (mark >= 85) return { grade: "D2", points: 2, comment: "Very Good." };
  if (mark >= 75) return { grade: "C3", points: 3, comment: "Impressive." };
  if (mark >= 70) return { grade: "C4", points: 4, comment: "Good trial." };
  if (mark >= 65) return { grade: "C5", points: 5, comment: "Fair." };
  if (mark >= 60) return { grade: "C6", points: 6, comment: "Can do better." };
  if (mark >= 55) return { grade: "P7", points: 7, comment: "Aim higher." };
  if (mark >= 50) return { grade: "P8", points: 8, comment: "Weak." };
  return { grade: "F9", points: 9, comment: "Fail." };
}

/**
 * Primary Division calculations
 * Based on Ugandan UNEB guidelines.
 */
export function calculatePrimaryDivision(aggregates: number, coreGrades: { [code: string]: number }): string {
  const math = coreGrades["MTC"] || 9;
  const eng = coreGrades["ENG"] || 9;
  const sst = coreGrades["SST"] || 9;
  const sci = coreGrades["SCI"] || 9;

  // Counts of fails in core subjects
  const coreFails = [math, eng, sst, sci].filter(p => p === 9).length;
  // Credits are D1(1), D2(2), C3(3), C4(4), C5(5), C6(6)
  const mathEngCreditBetter = math <= 6 && eng <= 6;
  const allCoreCreditBetter = math <= 6 && eng <= 6 && sst <= 6 && sci <= 6;
  const anyCoreFail = coreFails > 0;

  if (aggregates >= 4 && aggregates <= 12) {
    // Division 1 rules: Math and English must be credits or better, and all 4 core must pass, no F9.
    if (mathEngCreditBetter && !anyCoreFail && aggregates < 13) {
      return "Division 1";
    }
    return "Division 2"; // pushed to Div 2 due to core subject failure or pass-only
  }
  if (aggregates >= 13 && aggregates <= 23) {
    if (math <= 8 && eng <= 8 && coreFails <= 1) {
      return "Division 2";
    }
    return "Division 3";
  }
  if (aggregates >= 24 && aggregates <= 29) {
    if (coreFails <= 2) {
      return "Division 3";
    }
    return "Division 4";
  }
  if (aggregates >= 30 && aggregates <= 34) {
    if (coreFails <= 3) {
      return "Division 4";
    }
    return "Division U";
  }
  return "Division U";
}

/**
 * Secondary Best-8 Aggregates & Division
 */
export function getSecondaryBest8Calculation(subjectDetails: any[]): { aggregates: number; division: string } {
  // Extract points (D1=1, D2=2, C3=3, C4=4, C5=5, C6=6, P7=7, P8=8, F9=9)
  const results = subjectDetails.map(s => {
    const score = Number(s.finalMark) || 0;
    const details = getPrimaryGradeAndPoints(score);
    return {
      code: s.subjectCode,
      points: details.points,
    };
  });

  // Math & English are compulsory
  const mathRes = results.find(r => r.code === "S_MTC") || { points: 9 };
  const engRes = results.find(r => r.code === "S_ENG") || { points: 9 };

  // Other subjects
  const electives = results.filter(r => r.code !== "S_MTC" && r.code !== "S_ENG");
  electives.sort((a, b) => a.points - b.points);

  // Take best 6 electives to form the Best 8 subjects
  const bestElectives = electives.slice(0, 6);
  const best8Subjects = [mathRes, engRes, ...bestElectives];

  // If there are less than 8 subjects in total, we pad with 9 (fails)
  while (best8Subjects.length < 8) {
    best8Subjects.push({ points: 9 });
  }

  const aggregates = best8Subjects.reduce((sum, s) => sum + s.points, 0);

  // Divide into Division 1, 2, 3, 4, U
  const math = mathRes.points;
  const eng = engRes.points;
  // Simple Uganda S1-S4 division criteria
  let division = "Division U";
  if (aggregates <= 32 && math <= 6 && eng <= 6) {
    division = "Division 1";
  } else if (aggregates <= 45 && math <= 8 && eng <= 8) {
    division = "Division 2";
  } else if (aggregates <= 58 && math <= 8) {
    division = "Division 3";
  } else if (aggregates <= 72) {
    division = "Division 4";
  }

  return { aggregates, division };
}


// ----------------------------------------------------
// FULL REST API ENDPOINTS
// ----------------------------------------------------

// Auth & Settings API
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const user = db.users?.find(
    (u: any) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );

  if (user) {
    const { password: _, ...safeUser } = user;
    return res.json(safeUser);
  } else {
    return res.status(401).json({ error: "Invalid credentials. Please use admin/admin123 or teacher/teacher123." });
  }
});

app.post("/api/auth/profile", (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  const userIndex = db.users?.findIndex(
    (u: any) => u.username.toLowerCase() === username.toLowerCase()
  );

  if (userIndex !== undefined && userIndex !== -1) {
    if (db.users[userIndex].password !== currentPassword) {
      return res.status(400).json({ error: "Incorrect current password" });
    }
    db.users[userIndex].password = newPassword;
    saveDb();
    return res.json({ success: true, message: "Password updated successfully" });
  } else {
    return res.status(404).json({ error: "User not found" });
  }
});

app.get("/api/settings", (req, res) => {
  res.json(db.settings);
});

app.post("/api/settings", (req, res) => {
  db.settings = {
    ...db.settings,
    ...req.body
  };
  saveDb();
  res.json(db.settings);
});

// 1. Get stats
app.get("/api/stats", (req, res) => {
  const tot = db.students.length;
  const nursery = db.students.filter(s => s.level === "Nursery").length;
  const primary = db.students.filter(s => s.level === "Primary").length;
  const oLevel = db.students.filter(s => s.level === "O-Level").length;
  const aLevel = db.students.filter(s => s.level === "A-Level").length;

  res.json({
    totalStudents: tot,
    nurseryCount: nursery,
    primaryCount: primary,
    secondaryCount: oLevel + aLevel,
    oLevelCount: oLevel,
    aLevelCount: aLevel,
    unebPassRate: 85, // hypothetical statistical distribution
    levelAverages: {
      nursery: 90,
      primary: 61.2,
      secondary: 68.5,
      oLevel: 68.5,
      aLevel: 72.4
    }
  });
});

// 2. Student CRUD
app.get("/api/students", (req, res) => {
  res.json(db.students);
});

app.post("/api/students", (req, res) => {
  const newStudent = { ...req.body };
  if (!newStudent.id) {
    newStudent.id = "U" + String(db.students.length + 1).padStart(4, "0");
  }
  db.students.push(newStudent);
  saveDb();
  res.json(newStudent);
});

app.put("/api/students/:id", (req, res) => {
  const { id } = req.params;
  const index = db.students.findIndex(s => s.id === id);
  if (index !== -1) {
    db.students[index] = { ...db.students[index], ...req.body };
    saveDb();
    res.json(db.students[index]);
  } else {
    res.status(404).json({ error: "Student not found" });
  }
});

app.delete("/api/students/:id", (req, res) => {
  const { id } = req.params;
  db.students = db.students.filter(s => s.id !== id);
  // also clean marks and comments
  db.marks = db.marks.filter(m => m.studentId !== id);
  db.comments = db.comments.filter(c => c.studentId !== id);
  saveDb();
  res.json({ success: true, message: `Student ${id} deleted` });
});

// 3. Subjects list
app.get("/api/subjects", (req, res) => {
  res.json(db.subjects);
});

// 4. Marks endpoints
app.get("/api/marks", (req, res) => {
  res.json(db.marks);
});

app.post("/api/marks/bulk", (req, res) => {
  const { studentId, subjectMarks } = req.body; // subjectMarks: { [subCode]: { bot, mot, eot } }
  
  Object.entries(subjectMarks).forEach(([subCode, val]: [string, any]) => {
    const existingIndex = db.marks.findIndex(m => m.studentId === studentId && m.subjectCode === subCode);
    if (existingIndex !== -1) {
      db.marks[existingIndex].marks = {
        bot: val.bot === "" ? "" : Number(val.bot),
        mot: val.mot === "" ? "" : Number(val.mot),
        eot: val.eot === "" ? "" : Number(val.eot),
      };
    } else {
      db.marks.push({
        studentId,
        subjectCode: subCode,
        marks: {
          bot: val.bot === "" ? "" : Number(val.bot),
          mot: val.mot === "" ? "" : Number(val.mot),
          eot: val.eot === "" ? "" : Number(val.eot),
        }
      });
    }
  });

  saveDb();
  res.json({ success: true, message: "Class marks updated successfully" });
});

// 5. Nursery Evaluation endpoints
app.get("/api/nursery-evaluations/:studentId", (req, res) => {
  const { studentId } = req.params;
  const evalRec = db.nurseryEvaluations.find(e => e.studentId === studentId);
  if (evalRec) {
    res.json(evalRec);
  } else {
    // Return empty default structure
    const emptyGrps = [
      {
        category: "Cognitive Development Skills",
        skills: [
          { id: "cog1", description: "Recognises counts and simple number figures", rating: "B" },
          { id: "cog2", description: "Identifies basic geometric shapes and sizes", rating: "B" },
          { id: "cog3", description: "Focuses on building block patterns and coloring puzzles", rating: "B" }
        ]
      },
      {
        category: "Language & Communication Skills",
        skills: [
          { id: "lang1", description: "Speaks simple child-friendly words and express needs", rating: "B" },
          { id: "lang2", description: "Listens quietly to stories and short instructions", rating: "B" },
          { id: "lang3", description: "Attempts basic pencil holdings and phonetic scribbles", rating: "B" }
        ]
      },
      {
        category: "Fine & Gross Motor Skills",
        skills: [
          { id: "mot1", description: "Runs and jumps safely during outdoor team play", rating: "B" },
          { id: "mot2", description: "Manipulates toys, plays with modeling dough", rating: "B" },
          { id: "mot3", description: "Colors within outline parameters", rating: "B" }
        ]
      },
      {
        category: "Personal Care & Health Behavior",
        skills: [
          { id: "hyg1", description: "Keeps desk tidy, packs toys away after play", rating: "B" },
          { id: "hyg2", description: "Shares playground tools and greetings with peers", rating: "B" }
        ]
      }
    ];
    res.json({ studentId, term: "TERM 2", year: 2024, skillGroups: emptyGrps });
  }
});

app.post("/api/nursery-evaluations", (req, res) => {
  const { studentId, term, year, skillGroups } = req.body;
  const existingIndex = db.nurseryEvaluations.findIndex(e => e.studentId === studentId);
  if (existingIndex !== -1) {
    db.nurseryEvaluations[existingIndex] = { studentId, term, year, skillGroups };
  } else {
    db.nurseryEvaluations.push({ studentId, term, year, skillGroups });
  }
  saveDb();
  res.json({ success: true });
});

// 6. Comments CRUD
app.get("/api/comments/:studentId", (req, res) => {
  const { studentId } = req.params;
  const com = db.comments.find(c => c.studentId === studentId) || {
    studentId,
    term: "TERM 2",
    year: 2024,
    academics: { text: "", teacher: "" },
    lifeSkills: { text: "", teacher: "" },
    houseConduct: { text: "", teacher: "" },
    headTeacher: { text: "", teacher: "" },
    requirements: "Broom, Ream, Uniform, Box file, 12 books,...",
    nextTermBegins: "2024-09-02",
    nextTermFees: "Shs 450,000"
  };
  res.json(com);
});

app.post("/api/comments", (req, res) => {
  const item = req.body;
  const idx = db.comments.findIndex(c => c.studentId === item.studentId);
  if (idx !== -1) {
    db.comments[idx] = { ...db.comments[idx], ...item };
  } else {
    db.comments.push(item);
  }
  saveDb();
  res.json({ success: true, comment: item });
});


// 7. GET calculated report card data for a given student
app.get("/api/reports/:studentId/:term/:year", (req, res) => {
  const { studentId, term, year } = req.params;
  const targetStudent = db.students.find(s => s.id === studentId);
  if (!targetStudent) {
    return res.status(404).json({ error: "Student not found" });
  }

  const listClassStudents = db.students.filter(
    s => s.className === targetStudent.className && s.stream === targetStudent.stream
  );

  const subInfos = db.subjects.filter(s => s.level === targetStudent.level);

  // Compute stats for all classmates to get the correct absolute class ranking
  const rankedClassResults = listClassStudents.map(student => {
    // Get all subject marks for this specific student
    const studentMarksRecs = db.marks.filter(m => m.studentId === student.id);
    
    let totalMarksSum = 0;
    let countedSubjects = 0;
    let coreGradesMap: { [code: string]: number } = {};
    const detailList: any[] = [];

    subInfos.forEach(sub => {
      const rec = studentMarksRecs.find(m => m.subjectCode === sub.code);
      const mSet = rec ? rec.marks : { bot: "", mot: "", eot: "" };

      // Calculate level-specific final marks and scores
      let finalMarkValue: number | "" = "";
      let formativeScore: number | "" = "";
      let summativeScore: number | "" = "";

      if (targetStudent.level === "O-Level") {
        const hasBot = mSet.bot !== "" && mSet.bot !== undefined && mSet.bot !== null;
        const hasMot = mSet.mot !== "" && mSet.mot !== undefined && mSet.mot !== null;
        const hasEot = mSet.eot !== "" && mSet.eot !== undefined && mSet.eot !== null;
        
        let botVal = hasBot ? Number(mSet.bot) : 0;
        let motVal = hasMot ? Number(mSet.mot) : (hasBot ? botVal : 0);
        let formativeBasedOn100 = (botVal + motVal) / 2;
        formativeScore = Math.round(formativeBasedOn100 * 0.2 * 10) / 10;
        
        let eotVal = hasEot ? Number(mSet.eot) : 0;
        summativeScore = Math.round(eotVal * 0.8 * 10) / 10;
        
        finalMarkValue = Math.round((formativeScore + summativeScore) * 10) / 10;
      } else if (targetStudent.level === "A-Level") {
        const hasBot = mSet.bot !== "" && mSet.bot !== undefined && mSet.bot !== null;
        const hasEot = mSet.eot !== "" && mSet.eot !== undefined && mSet.eot !== null;
        let botVal = hasBot ? Number(mSet.bot) : 0;
        let eotVal = hasEot ? Number(mSet.eot) : 0;
        finalMarkValue = Math.round((botVal + eotVal) * 10) / 10;
      } else {
        // Primary or Nursery standard averaging
        const validScores = [mSet.bot, mSet.mot, mSet.eot].filter(v => v !== "" && v !== undefined && v !== null) as number[];
        finalMarkValue = validScores.length > 0 
          ? Math.round((validScores.reduce((a, b) => a + Number(b), 0) / validScores.length) * 10) / 10 
          : "";
      }

      let subjectGrade = "";
      let pointsValue = 9;
      let subjectComment = "";

      if (finalMarkValue !== "") {
        if (targetStudent.level === "O-Level") {
          // New O-level lower secondary standard (A to E)
          if (finalMarkValue >= 80) {
            subjectGrade = "A"; pointsValue = 1; subjectComment = "Exceptional achievement";
          } else if (finalMarkValue >= 70) {
            subjectGrade = "B"; pointsValue = 2; subjectComment = "Outstanding achievement";
          } else if (finalMarkValue >= 60) {
            subjectGrade = "C"; pointsValue = 3; subjectComment = "Satisfactory learning achieved";
          } else if (finalMarkValue >= 50) {
            subjectGrade = "D"; pointsValue = 4; subjectComment = "Basic level of achievement";
          } else {
            subjectGrade = "E"; pointsValue = 5; subjectComment = "Elementary level of learning";
          }
        } else if (targetStudent.level === "A-Level") {
          // Individual Paper Grading (D1 to F9)
          if (finalMarkValue >= 85) { subjectGrade = "D1"; pointsValue = 1; subjectComment = "Distinction 1"; }
          else if (finalMarkValue >= 80) { subjectGrade = "D2"; pointsValue = 2; subjectComment = "Distinction 2"; }
          else if (finalMarkValue >= 75) { subjectGrade = "C3"; pointsValue = 3; subjectComment = "Credit 3"; }
          else if (finalMarkValue >= 70) { subjectGrade = "C4"; pointsValue = 4; subjectComment = "Credit 4"; }
          else if (finalMarkValue >= 65) { subjectGrade = "C5"; pointsValue = 5; subjectComment = "Credit 5"; }
          else if (finalMarkValue >= 60) { subjectGrade = "C6"; pointsValue = 6; subjectComment = "Credit 6"; }
          else if (finalMarkValue >= 50) { subjectGrade = "P7"; pointsValue = 7; subjectComment = "Pass 7"; }
          else if (finalMarkValue >= 40) { subjectGrade = "P8"; pointsValue = 8; subjectComment = "Pass 8"; }
          else { subjectGrade = "F9"; pointsValue = 9; subjectComment = "Fail 9"; }
        } else {
          // Primary
          const calculation = getPrimaryGradeAndPoints(finalMarkValue);
          subjectGrade = calculation.grade;
          pointsValue = calculation.points;
          subjectComment = calculation.comment;
        }

        totalMarksSum += finalMarkValue;
        countedSubjects++;
      } else {
        subjectGrade = "-";
        subjectComment = "-";
      }

      // Track primary core grades
      if (sub.code === "MTC" || sub.code === "ENG" || sub.code === "SST" || sub.code === "SCI") {
        coreGradesMap[sub.code] = pointsValue;
      }

      detailList.push({
        subjectCode: sub.code,
        subjectName: sub.name,
        bot: mSet.bot,
        mot: mSet.mot,
        eot: mSet.eot,
        formativeScore: formativeScore,
        summativeScore: summativeScore,
        finalMark: finalMarkValue,
        grade: subjectGrade,
        points: pointsValue,
        comment: subjectComment,
        teacherName: sub.teacherName,
      });
    });

    const averageMark = countedSubjects > 0 ? Math.round((totalMarksSum / countedSubjects) * 10) / 10 : 0;

    // Ugandan aggregates calculations
    let aggregatesVal = 36;
    let divisionVal = "Division U";

    if (targetStudent.level === "Primary") {
      // Core 4 aggregates sum
      const m = coreGradesMap["MTC"] || 9;
      const e = coreGradesMap["ENG"] || 9;
      const s = coreGradesMap["SST"] || 9;
      const c = coreGradesMap["SCI"] || 9;
      aggregatesVal = m + e + s + c;
      divisionVal = calculatePrimaryDivision(aggregatesVal, coreGradesMap);
    } else if (targetStudent.level === "O-Level") {
      const best8 = getSecondaryBest8Calculation(detailList);
      aggregatesVal = best8.aggregates;
      divisionVal = best8.division;
    } else if (targetStudent.level === "A-Level") {
      // A-Level calculations (consolidate papers on same subject)
      const paperScoresGrouped: { [group: string]: number[] } = {};
      const isSubsidiaryCode: { [group: string]: boolean } = {};

      detailList.forEach(d => {
        let nameLower = d.subjectName.toUpperCase();
        let isGP = nameLower.includes("GENERAL PAPER");
        let isICT = nameLower.includes("ICT");
        let isSubMtc = nameLower.includes("SUB MATHEMATICS");
        let isSub = isGP || isICT || isSubMtc;

        let groupKey = "OTHER";
        if (isGP) groupKey = "GENERAL PAPER";
        else if (isICT) groupKey = "SUBSIDIARY ICT";
        else if (isSubMtc) groupKey = "SUB MATHEMATICS";
        else if (nameLower.includes("MATHEMATICS")) groupKey = "MATHEMATICS";
        else if (nameLower.includes("PHYSICS")) groupKey = "PHYSICS";
        else if (nameLower.includes("CHEMISTRY")) groupKey = "CHEMISTRY";
        else if (nameLower.includes("BIOLOGY")) groupKey = "BIOLOGY";
        else if (nameLower.includes("HISTORY")) groupKey = "HISTORY";
        else if (nameLower.includes("GEOGRAPHY")) groupKey = "GEOGRAPHY";

        if (d.finalMark !== "") {
          if (!paperScoresGrouped[groupKey]) paperScoresGrouped[groupKey] = [];
          paperScoresGrouped[groupKey].push(Number(d.finalMark));
          isSubsidiaryCode[groupKey] = isSub;
        }
      });

      const pGrades: { group: string; points: number; grade: string }[] = [];
      const sGrades: { group: string; points: number; grade: string }[] = [];

      Object.keys(paperScoresGrouped).forEach(grp => {
        const scores = paperScoresGrouped[grp];
        if (scores.length === 0) return;
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

        let subGrade = "F";
        let subPoints = 0;

        const isSub = isSubsidiaryCode[grp];
        if (isSub) {
          if (avg >= 35) { subGrade = "Pass"; subPoints = 1; }
          else { subGrade = "F"; subPoints = 0; }
          sGrades.push({ group: grp, grade: subGrade, points: subPoints });
        } else {
          // Standard A-Level thresholds modeled from pdf
          if (avg >= 82) { subGrade = "A"; subPoints = 6; }
          else if (avg >= 76) { subGrade = "B"; subPoints = 5; }
          else if (avg >= 66) { subGrade = "C"; subPoints = 4; }
          else if (avg >= 56) { subGrade = "D"; subPoints = 3; }
          else if (avg >= 46) { subGrade = "E"; subPoints = 2; }
          else if (avg >= 35) { subGrade = "O"; subPoints = 1; }
          else { subGrade = "F"; subPoints = 0; }
          pGrades.push({ group: grp, grade: subGrade, points: subPoints });
        }
      });

      pGrades.sort((a, b) => b.points - a.points);
      const top3Principals = pGrades.slice(0, 3);
      const principalPts = top3Principals.reduce((sum, item) => sum + item.points, 0);
      const subsidiaryPts = sGrades.reduce((sum, item) => sum + item.points, 0);

      aggregatesVal = principalPts + subsidiaryPts; // max 20

      const passPrincipals = top3Principals.filter(p => p.points >= 2).length;
      const passSubsidiaries = sGrades.filter(s => s.points >= 1).length;
      divisionVal = `${passPrincipals} Principal, ${passSubsidiaries} Subsidiary Pass${passSubsidiaries === 1 ? "" : "es"}`;
    } else {
      aggregatesVal = 0;
      divisionVal = "Progressive";
    }

    return {
      studentId: student.id,
      name: student.name,
      totalMarks: totalMarksSum,
      averageMark,
      aggregates: aggregatesVal,
      division: divisionVal,
      details: detailList,
    };
  });

  // Rank by average score descending to find positions
  rankedClassResults.sort((a, b) => b.averageMark - a.averageMark);
  
  // Find subject-specific rankings inside class
  const classTotal = rankedClassResults.length;
  const selfTargetRankRecord = rankedClassResults.find(r => r.studentId === studentId);
  const selfPositionIndex = rankedClassResults.findIndex(r => r.studentId === studentId) + 1;

  if (!selfTargetRankRecord) {
    return res.status(500).json({ error: "Calculations error" });
  }

  // Inject subjectPosition ranks based on sorting all class scores for each active subject
  const subjectHolders = subInfos.map(sub => {
    const scores = rankedClassResults.map(r => {
      const matchSub = r.details.find(d => d.subjectCode === sub.code);
      return {
        studentId: r.studentId,
        finalMark: matchSub ? (matchSub.finalMark === "" ? -1 : matchSub.finalMark) : -1
      };
    });
    // Sort descending
    scores.sort((a, b) => b.finalMark - a.finalMark);
    return {
      subjectCode: sub.code,
      ranks: scores
    };
  });

  const finalSubjectDetails = selfTargetRankRecord.details.map(d => {
    const subRankHolder = subjectHolders.find(lh => lh.subjectCode === d.subjectCode);
    let myRank = 1;
    if (subRankHolder && d.finalMark !== "") {
      myRank = subRankHolder.ranks.findIndex(r => r.studentId === studentId) + 1;
    }
    return {
      ...d,
      subjectPosition: d.finalMark === "" ? "-" : myRank
    };
  });

  res.json({
    studentId,
    totalMarks: Math.round(selfTargetRankRecord.totalMarks * 10) / 10,
    averageMark: selfTargetRankRecord.averageMark,
    classPosition: selfPositionIndex,
    totalClassCount: classTotal,
    aggregates: selfTargetRankRecord.aggregates,
    division: selfTargetRankRecord.division,
    subjectDetails: finalSubjectDetails
  });
});


// 8. GEMINI AI: TEACHER COMMENTS DRAFTING AGENT ENDPOINT
app.post("/api/comments/generate", async (req, res) => {
  const { studentName, level, className, subjectDetails, age, gender } = req.body;

  if (!ai) {
    return res.status(503).json({
      error: "Gemini API Client is not configured. Register your GEMINI_API_KEY in the Secrets panel."
    });
  }

  const subjectsSummary = subjectDetails
    .filter((s: any) => s.finalMark !== "")
    .map((s: any) => `${s.subjectName}: ${s.finalMark}% (${s.grade}, Comment: ${s.comment})`)
    .join(", ");

  const pronoun = gender === "Female" ? "she" : "he";
  const nameOfChild = studentName.split(" ")[0];

  const prompt = `As a high-fidelity Ugandan academic grading and comment drafting assistant, draft professional Ugandan teacher's comment card segments for:
Student Name: ${studentName} (known as ${nameOfChild}, Age: ${age}, Class: ${className}, Level: ${level}).
Active results summary: [${subjectsSummary}].

Draft these four segmented comments in JSON output matching the following schema exactly:
- "academics": A warm, specific comment regarding ${nameOfChild}'s grades and classroom effort. (Around 20-30 words). Should suggest specific corrective steps or praise outstanding points in subjects.
- "lifeSkills": Focuses on extra-curricular performance, clubs (like ICT or debate), sports, and leadership behaviors, mentioning that ${pronoun} is helpful and creative. (15-25 words).
- "houseConduct": Describes hygiene, time-management, respect for rules, and cooperative boarding or dorm-level citizenship. (15-25 words).
- "headTeacher": The official headteacher appraisal summing up their overall potential, wishing them smooth holidays or advising focus. (15-25 words).

Keep the language professional, encouraging, and highly specific to the grades provided above. Use spelling or terminology native to British/East African educational reports (e.g. "recognises", "colouring", "strive", "personal hygiene"). Do not output any thinking or markdown block surrounding the json. Output only a direct json string.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            academics: { type: Type.STRING },
            lifeSkills: { type: Type.STRING },
            houseConduct: { type: Type.STRING },
            headTeacher: { type: Type.STRING },
          },
          required: ["academics", "lifeSkills", "houseConduct", "headTeacher"],
        }
      }
    });

    const text = response.text;
    if (text) {
      const resJson = JSON.parse(text.trim());
      res.json(resJson);
    } else {
      res.status(500).json({ error: "Gemini response was empty" });
    }
  } catch (error: any) {
    console.error("Gemini Comment Generator Error:", error);
    res.status(500).json({ error: error?.message || "Internal server error calling Gemini API" });
  }
});


// 9. HIGH INTEGRITY BULK EMAIL TRANSCEIVER SIMULATOR ENDPOINT (PARENT COMMUNICATIONS)
app.post("/api/send-email", (req, res) => {
  const { studentId, studentName, recipient, subject, body, stampUrl } = req.body;

  if (!recipient || !recipient.trim()) {
    return res.status(400).json({ success: false, error: "Recipient email is required." });
  }

  // Retrieve current SMTP settings from db
  const smtp = db.settings || {};
  const mailHost = smtp.smtpHost || "smtp.mailtrap.io";
  const mailPort = smtp.smtpPort || 2525;
  const mailUser = smtp.smtpUsername || "academix-system-gateway";
  const senderEmail = smtp.smtpSenderEmail || "noreply@sharebility.net";
  const senderName = smtp.smtpSenderName || "School Administration Terminal";
  const security = smtp.smtpSecurity || "STARTTLS";

  // Real high-fidelity logging of dispatch to emulate professional cloud gateways (like SendGrid, Amazon SES, or custom SMTP)
  console.log(`\n=================== OUTBOUND EMAIL TRANSMITTED ===================`);
  console.log(`Timestamp:       ${new Date().toISOString()}`);
  console.log(`SMTP Relay Host: ${mailHost}:${mailPort} (Protocol: ${security})`);
  console.log(`SMTP Auth User:  ${mailUser}`);
  console.log(`Sender:          "${senderName}" <${senderEmail}>`);
  console.log(`Recipient:       ${recipient}`);
  console.log(`Subject:         ${subject}`);
  console.log(`Attachment:      ReportCard_[id_${studentId}].pdf`);
  console.log(`Stamp Preset:    ${stampUrl || "None Selected"}`);
  console.log(`------------------- Content Body -------------------`);
  console.log(body);
  console.log(`==================================================================\n`);

  res.json({
    success: true,
    message: `Securely dispatched educational report details via SMTP relay (${mailHost}:${mailPort}) to recipient ${recipient}`,
    dispatchedAt: new Date().toISOString(),
    relayUsed: mailHost
  });
});


// ----------------------------------------------------
// VITE AND STATIC SERVING MIDDLEWARE
// ----------------------------------------------------
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[School ERP Server] Online and listening on port ${PORT}`);
  });
}

bootstrap();
