/**
 * Academic Year Progression & Milestone Transition Engine for Mahallu Portal
 */

export function getCurrentAcademicYear(d = new Date()): string {
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed: 0 = Jan, 5 = June
  if (month >= 5) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

export const AUTO_PROGRESSION_MAP: Record<string, { nextClass: string; nextEducationStage?: string }> = {
  'Class 1': { nextClass: 'Class 2' },
  'Class 2': { nextClass: 'Class 3' },
  'Class 3': { nextClass: 'Class 4' },
  'Class 4': { nextClass: 'Class 5', nextEducationStage: 'Upper Primary (Class 5-7)' },
  'Class 5': { nextClass: 'Class 6' },
  'Class 6': { nextClass: 'Class 7' },
  'Class 7': { nextClass: 'Class 8', nextEducationStage: 'High School (Class 8-10 / SSLC)' },
  'Class 8': { nextClass: 'Class 9' },
  'Class 9': { nextClass: 'Class 10 (SSLC Candidate)' },
  '+1 (Plus One - 11th)': { nextClass: '+2 (Plus Two - 12th)' },
  '1st Year Diploma / ITI': { nextClass: '2nd Year Diploma / ITI' },
  '2nd Year Diploma / ITI': { nextClass: '3rd Year Diploma / ITI' },
  '1st Year Degree / UG': { nextClass: '2nd Year Degree / UG' },
  '2nd Year Degree / UG': { nextClass: 'Final Year Degree / UG' },
  '1st Year PG': { nextClass: 'Final Year PG' },
};

export const MILESTONE_CLASSES = [
  'Class 10 (SSLC Candidate)',
  '+2 (Plus Two - 12th)',
  'Final Year Degree / UG',
  '3rd Year Diploma / ITI',
  'Final Year PG',
];

export function isMilestoneClass(classOrYear: string): boolean {
  if (!classOrYear) return false;
  return MILESTONE_CLASSES.some((m) => classOrYear.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(classOrYear.toLowerCase()));
}

export const MILESTONE_TRANSITIONS: Record<string, Array<{ label: string; newClass: string; newStage: string; newJobCategory?: string }>> = {
  'Class 10 (SSLC Candidate)': [
    {
      label: 'Joined +1 Science',
      newClass: '+1 (Plus One - 11th)',
      newStage: 'Higher Secondary (+1 / +2 / VHSE)',
      newJobCategory: 'Student',
    },
    {
      label: 'Joined +1 Commerce',
      newClass: '+1 (Plus One - 11th)',
      newStage: 'Higher Secondary (+1 / +2 / VHSE)',
      newJobCategory: 'Student',
    },
    {
      label: 'Joined +1 Humanities',
      newClass: '+1 (Plus One - 11th)',
      newStage: 'Higher Secondary (+1 / +2 / VHSE)',
      newJobCategory: 'Student',
    },
    {
      label: 'Joined Diploma / Polytechnic',
      newClass: '1st Year Diploma / ITI',
      newStage: 'Diploma / ITI / Polytechnic',
      newJobCategory: 'Student',
    },
    {
      label: 'Joined ITI Technical Course',
      newClass: '1st Year Diploma / ITI',
      newStage: 'Diploma / ITI / Polytechnic',
      newJobCategory: 'Student',
    },
    {
      label: 'Discontinued / Entered Work',
      newClass: 'Discontinued / Dropped Out',
      newStage: 'High School (Class 8-10 / SSLC)',
      newJobCategory: 'Daily Wage / Coolie / Construction',
    },
  ],
  '+2 (Plus Two - 12th)': [
    {
      label: 'Joined Undergraduate Degree (BA / BSc / BCom / BTech)',
      newClass: '1st Year Degree / UG',
      newStage: 'Undergraduate (BA, BSc, BCom, BTech, etc.)',
      newJobCategory: 'Student',
    },
    {
      label: 'Joined Professional Medical/Engineering (MBBS, BDS, CA, LLB)',
      newClass: '1st Year Degree / UG',
      newStage: 'Professional (MBBS, BDS, CA, CS, LLB, etc.)',
      newJobCategory: 'Student',
    },
    {
      label: 'Joined Diploma / Polytechnic Course',
      newClass: '1st Year Diploma / ITI',
      newStage: 'Diploma / ITI / Polytechnic',
      newJobCategory: 'Student',
    },
    {
      label: 'Preparing for Entrance / Repeat',
      newClass: '+2 (Plus Two - 12th)',
      newStage: 'Higher Secondary (+1 / +2 / VHSE)',
      newJobCategory: 'Student',
    },
    {
      label: 'Job / Employed Locally',
      newClass: 'Course Completed / Graduated',
      newStage: 'Higher Secondary (+1 / +2 / VHSE)',
      newJobCategory: 'Private Sector Employee',
    },
    {
      label: 'Pravasi / Migrated Abroad for Work',
      newClass: 'Course Completed / Graduated',
      newStage: 'Higher Secondary (+1 / +2 / VHSE)',
      newJobCategory: 'Gulf / Pravasi Worker',
    },
    {
      label: 'Unemployed / Job Seeker',
      newClass: 'Course Completed / Graduated',
      newStage: 'Higher Secondary (+1 / +2 / VHSE)',
      newJobCategory: 'Unemployed / Job Seeker',
    },
  ],
  'Final Year Degree / UG': [
    {
      label: 'Graduated & Seeking Employment',
      newClass: 'Course Completed / Graduated',
      newStage: 'Undergraduate (BA, BSc, BCom, BTech, etc.)',
      newJobCategory: 'Unemployed / Job Seeker',
    },
    {
      label: 'Joined Postgraduate Degree (MA, MSc, MBA, etc.)',
      newClass: '1st Year PG',
      newStage: 'Postgraduate (MA, MSc, MCom, MBA, MCA, etc.)',
      newJobCategory: 'Student',
    },
    {
      label: 'Employed (Private / Gov / Professional)',
      newClass: 'Course Completed / Graduated',
      newStage: 'Undergraduate (BA, BSc, BCom, BTech, etc.)',
      newJobCategory: 'Private Sector Employee',
    },
    {
      label: 'Gulf / Pravasi Worker',
      newClass: 'Course Completed / Graduated',
      newStage: 'Undergraduate (BA, BSc, BCom, BTech, etc.)',
      newJobCategory: 'Gulf / Pravasi Worker',
    },
  ],
};
