/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Level = "Nursery" | "Primary" | "O-Level" | "A-Level";

export interface Student {
  id: string; // e.g., "U0001"
  name: string;
  age: number;
  level: Level;
  className: string; // e.g., "P4", "Baby Class", "S2"
  stream: string; // e.g., "E", "A", "North"
  payCode: string;
  gender: "Male" | "Female";
  registeredYear: number;
  photoUrl?: string;
  parentEmail?: string;
}

export interface Subject {
  code: string; // e.g., "MTC", "ENG", "SST", "SCI", "BIO"
  name: string;
  level: Level;
  teacherName: string;
}

export interface MarkSet {
  bot: number | ""; // Beginning of Term mark (0-100)
  mot: number | ""; // Mid Term mark (0-100)
  eot: number | ""; // End of Term mark (0-100)
}

export interface StudentSubjectMark {
  studentId: string;
  subjectCode: string;
  marks: MarkSet;
  finalMark: number | ""; // 100% Final mark (can be weighted or directly user entered)
  grade: string; // e.g., D1, D2, C3, C4, C5, C6, P7, P8, F9
  subjectPosition: number; // class wide rank
  comment: string; // e.g., "Impressive.", "Weak.", "Work harder."
}

export type SkillRating = "A" | "D" | "B"; // Achieved, Developing, Beginning

export interface NurserySkillGroup {
  category: string; // e.g., "Cognitive Development", "Motor Skills"
  skills: {
    id: string;
    description: string;
    rating: SkillRating;
  }[];
}

export interface NurseryEvaluation {
  studentId: string;
  term: string;
  year: number;
  skillGroups: NurserySkillGroup[];
}

export interface ReportCardComments {
  studentId: string;
  term: string;
  year: number;
  academics: { text: string; teacher: string };
  lifeSkills: { text: string; teacher: string };
  houseConduct: { text: string; teacher: string };
  headTeacher: { text: string; teacher: string };
  requirements: string; // e.g. "Broom, Ream, Uniform, Box file, 12 books,..."
  nextTermBegins: string;
  nextTermFees: string;
}

export interface ReportCardCalculation {
  studentId: string;
  totalMarks: number;
  averageMark: number;
  classPosition: number;
  totalClassCount: number;
  aggregates: number; // Sum of core subjects grades (Primary is best 4/core 4, Secondary is best 8 including Math/Eng)
  division: string; // "Division 1", "Division 2", "Division 3", "Division 4", "Division U"
  subjectDetails: Array<{
    subjectCode: string;
    subjectName: string;
    bot: string | number;
    mot: string | number;
    eot: string | number;
    finalMark: number | "";
    grade: string;
    subjectPosition: number;
    comment: string;
    teacherName: string;
  }>;
}

export interface SchoolStats {
  totalStudents: number;
  nurseryCount: number;
  primaryCount: number;
  secondaryCount?: number;
  oLevelCount: number;
  aLevelCount: number;
  unebPassRate: number; // percentage of Div 1 & 2
  levelAverages: {
    nursery: number;
    primary: number;
    secondary?: number;
    oLevel: number;
    aLevel: number;
  };
}

export interface SchoolSettings {
  schoolName: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoUrl: string;
  showLogo: boolean;
  stampUrl?: string;
  showStamp?: boolean;
  termName: string; // "TERM 1" | "TERM 2" | "TERM 3"
  academicYear: number;
  nextTermCommences?: string;
  termEndedOn?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  smtpSenderName?: string;
  smtpSenderEmail?: string;
  smtpSecurity?: "SSL" | "STARTTLS" | "None";
  emailTemplates?: Array<{
    id: string;
    name: string;
    subject: string;
    body: string;
  }>;
}

export interface SystemUser {
  username: string;
  name: string;
  role: "Admin" | "Teacher";
}
