import { NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { getSession } from '@/lib/auth';
import * as XLSX from 'xlsx';
import { calculateAge } from '@/components/volunteer/HouseFormModal';
import {
  WARDS,
  ECONOMIC_STATUS_OPTIONS,
  HOUSE_OWNERSHIP_OPTIONS,
  BLOOD_GROUPS,
  MARITAL_STATUS_OPTIONS,
  RELATION_OPTIONS,
  EDUCATION_STAGES,
  CLASS_YEAR_OPTIONS,
  ISLAMIC_EDUCATION_OPTIONS,
  JOB_CATEGORIES,
  PRAVASI_COUNTRIES,
  HEALTH_CONDITIONS,
} from '@/lib/constants';

function getField(row: any, ...keys: string[]): string {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      return String(row[k]).trim();
    }
    const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const rowKey of Object.keys(row)) {
      if (rowKey.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanK) {
        const val = row[rowKey];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
    }
  }
  return '';
}

function parseExcelDate(val: any): string {
  if (!val) return '';
  if (typeof val === 'number') {
    // Excel date serial
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  const str = String(val).trim();
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const d = dmy[1].padStart(2, '0');
    const m = dmy[2].padStart(2, '0');
    const y = dmy[3];
    return `${y}-${m}-${d}`;
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  return '';
}

function normalizeGender(g: string): string {
  const lower = g.toLowerCase();
  if (lower.startsWith('f') || lower.includes('female') || lower.includes('sthree')) return 'Female';
  if (lower.startsWith('m') || lower.includes('male') || lower.includes('purushan')) return 'Male';
  if (lower.includes('other')) return 'Other';
  return 'Male';
}

function normalizeBloodGroup(bg: string): string {
  if (!bg) return 'Unknown / Not Tested';
  const clean = bg.toUpperCase().replace(/\s+/g, '');
  const valid = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  return valid.includes(clean) ? clean : 'Unknown / Not Tested';
}

function normalizeWard(val: string): string {
  if (!val) return 'Ward 1';
  const clean = val.trim();
  const match = clean.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    if (num >= 1 && num <= 12) return `Ward ${num}`;
  }
  const found = WARDS.find((w) => w.toLowerCase() === clean.toLowerCase());
  return found || 'Ward 1';
}

function normalizeEconomicStatus(val: string): string {
  if (!val) return 'APL (Above Poverty Line)';
  const lower = val.toLowerCase();
  if (lower.includes('bpl') || lower.includes('below poverty') || lower.includes('pink')) {
    return 'BPL (Below Poverty Line)';
  }
  if (lower.includes('yellow') || lower.includes('aay') || lower.includes('antyodaya')) {
    return 'AAY (Antyodaya Anna Yojana - Yellow)';
  }
  if (lower.includes('phh') || lower.includes('priority')) {
    return 'PHH (Priority Household - Pink)';
  }
  if (lower.includes('blue') || lower.includes('nps')) {
    return 'NPS (Non-Priority Subsidy - Blue)';
  }
  if (lower.includes('white') || lower.includes('npns')) {
    return 'NPNS (Non-Priority Non-Subsidy - White)';
  }
  const found = ECONOMIC_STATUS_OPTIONS.find((e) => e.toLowerCase() === lower);
  return found || 'APL (Above Poverty Line)';
}

function normalizeHouseOwnership(val: string): string {
  if (!val) return 'Own House';
  const lower = val.toLowerCase();
  if (lower.includes('rent')) return 'Rented House';
  if (lower.includes('mahallu') || lower.includes('quarter') || lower.includes('land')) return 'Mahallu Land / Quarters';
  if (lower.includes('ancestral') || lower.includes('tharavadu') || lower.includes('family')) return 'Family Ancestral House';
  if (lower.includes('shed') || lower.includes('temporary') || lower.includes('shelter')) return 'Temporary Shelter / Shed';
  if (lower.includes('relative')) return 'Living with Relatives';
  const found = HOUSE_OWNERSHIP_OPTIONS.find((h) => h.toLowerCase() === lower);
  return found || 'Own House';
}

function normalizeRelation(val: string): string {
  if (!val) return 'Family Member';
  const lower = val.toLowerCase();
  if (lower === 'head' || lower === 'self' || lower.includes('self (head)') || lower.includes('nathan') || lower.includes('nadhan')) {
    return 'Self (Head)';
  }
  if (lower.includes('wife') || lower.includes('husband') || lower.includes('spouse') || lower.includes('bhaarya')) {
    return 'Spouse (Wife/Husband)';
  }
  if (lower.includes('son-in-law') || lower.includes('marumakan')) return 'Son-in-law';
  if (lower.includes('daughter-in-law') || lower.includes('marumakal')) return 'Daughter-in-law';
  if (lower.includes('grandson')) return 'Grandson';
  if (lower.includes('granddaughter')) return 'Granddaughter';
  if (lower.includes('son') || lower.includes('makan')) return 'Son';
  if (lower.includes('daughter') || lower.includes('makal')) return 'Daughter';
  if (lower.includes('father-in-law')) return 'Father-in-law';
  if (lower.includes('mother-in-law')) return 'Mother-in-law';
  if (lower.includes('father') || lower.includes('vappah') || lower.includes('pithavu') || lower.includes('abba')) return 'Father';
  if (lower.includes('mother') || lower.includes('ummah') || lower.includes('maathavu') || lower.includes('ammi')) return 'Mother';
  if (lower.includes('brother')) return 'Brother';
  if (lower.includes('sister')) return 'Sister';
  const found = RELATION_OPTIONS.find((r) => r.toLowerCase() === lower);
  return found || 'Other Relative';
}

function normalizeEducationStage(val: string): string {
  if (!val) return 'High School (Class 8-10 / SSLC)';
  const lower = val.toLowerCase();
  if (lower.includes('illiterate') || lower.includes('no school')) return 'Illiterate / No Formal Schooling';
  if (lower.includes('primary') && !lower.includes('upper') && !lower.includes('madrassa')) return 'Primary School (Class 1-4)';
  if (lower.includes('upper primary') || lower.includes('up school')) return 'Upper Primary (Class 5-7)';
  if (lower.includes('higher secondary') || lower.includes('+1') || lower.includes('+2') || lower.includes('plus two') || lower.includes('plus one') || lower.includes('vhse')) {
    return 'Higher Secondary (+1 / +2 / VHSE)';
  }
  if (lower.includes('high school') || lower.includes('sslc') || lower.includes('10th')) return 'High School (Class 8-10 / SSLC)';
  if (lower.includes('diploma') || lower.includes('iti') || lower.includes('polytechnic')) return 'Diploma / ITI / Polytechnic';
  if (lower.includes('postgraduate') || lower.includes('pg') || lower.includes('msc') || lower.includes('mcom') || lower.includes('mba') || lower.includes('mca') || lower.includes('ma ')) {
    return 'Postgraduate (MA, MSc, MCom, MBA, MCA, etc.)';
  }
  if (lower.includes('doctorate') || lower.includes('phd') || lower.includes('mphil')) return 'Doctorate (PhD / MPhil)';
  if (lower.includes('mbbs') || lower.includes('bds') || lower.includes('professional') || lower.includes('lawyer') || lower.includes('llb') || lower.includes('ca ')) {
    return 'Professional (MBBS, BDS, CA, CS, LLB, etc.)';
  }
  if (lower.includes('degree') || lower.includes('undergraduate') || lower.includes('ug') || lower.includes('btech') || lower.includes('bsc') || lower.includes('bcom') || lower.includes('ba ')) {
    return 'Undergraduate (BA, BSc, BCom, BTech, etc.)';
  }
  const found = EDUCATION_STAGES.find((s) => s.toLowerCase() === lower);
  return found || 'High School (Class 8-10 / SSLC)';
}

function normalizeClassYear(val: string): string {
  if (!val) return 'Course Completed / Graduated';
  const lower = val.toLowerCase();
  if (lower.includes('sslc') || lower.includes('class 10')) return 'Class 10 (SSLC Candidate)';
  if (lower.includes('+1') || lower.includes('plus one') || lower.includes('11th')) return '+1 (Plus One - 11th)';
  if (lower.includes('+2') || lower.includes('plus two') || lower.includes('12th')) return '+2 (Plus Two - 12th)';
  if (lower.includes('1st year diploma') || lower.includes('diploma 1')) return '1st Year Diploma / ITI';
  if (lower.includes('2nd year diploma') || lower.includes('diploma 2')) return '2nd Year Diploma / ITI';
  if (lower.includes('3rd year diploma') || lower.includes('diploma 3')) return '3rd Year Diploma / ITI';
  if (lower.includes('1st year degree') || lower.includes('degree 1') || lower.includes('first year degree')) return '1st Year Degree / UG';
  if (lower.includes('2nd year degree') || lower.includes('degree 2') || lower.includes('second year degree')) return '2nd Year Degree / UG';
  if (lower.includes('final year degree') || lower.includes('3rd year degree') || lower.includes('degree 3')) return 'Final Year Degree / UG';
  if (lower.includes('1st year pg') || lower.includes('pg 1')) return '1st Year PG';
  if (lower.includes('final year pg') || lower.includes('2nd year pg') || lower.includes('pg 2')) return 'Final Year PG';
  if (lower.includes('completed') || lower.includes('graduated')) return 'Course Completed / Graduated';
  if (lower.includes('dropout') || lower.includes('discontinued')) return 'Discontinued / Dropped Out';
  if (lower.includes('not applicable') || lower === 'na' || lower === 'n/a') return 'Not Applicable';
  for (let i = 1; i <= 9; i++) {
    if (lower === `class ${i}` || lower === `${i}` || lower === `${i}th`) return `Class ${i}`;
  }
  const found = CLASS_YEAR_OPTIONS.find((c) => c.toLowerCase() === lower);
  return found || 'Course Completed / Graduated';
}

function normalizeIslamicEducation(val: string): string {
  if (!val) return 'Madrassa High School (Class 5-10)';
  const lower = val.toLowerCase();
  if (lower.includes('hifz') || lower.includes('hafiz') || lower.includes('quran')) return 'Hifz (Quran Memorizer / Hafiz)';
  if (lower.includes('dars') || lower.includes('arabic college') || lower.includes('alim') || lower.includes('moulavi')) return 'Dars / Arabic College (Moulavi / Alim)';
  if (lower.includes('wafy') || lower.includes('faizy') || lower.includes("da'wa") || lower.includes('specialized islamic')) {
    return "Specialized Islamic Degree (Faizy, Wafy, Da'wa, etc.)";
  }
  if (lower.includes('higher secondary') || lower.includes('11-12') || lower.includes('12 completed')) return 'Madrassa Higher Secondary (11-12 Completed)';
  if (lower.includes('primary') || lower.includes('1-4')) return 'Madrassa Primary (Class 1-4)';
  if (lower.includes('home') || lower.includes('veettil')) return 'Basic Home Islamic Study';
  if (lower.includes('none') || lower === 'nil') return 'None';
  if (lower.includes('high school') || lower.includes('5-10') || lower.includes('madrassa')) return 'Madrassa High School (Class 5-10)';
  const found = ISLAMIC_EDUCATION_OPTIONS.find((i) => i.toLowerCase() === lower);
  return found || 'Madrassa High School (Class 5-10)';
}

function normalizeJobCategory(val: string): string {
  if (!val) return 'Daily Wage / Coolie / Construction';
  const lower = val.toLowerCase();
  if (lower.includes('student') || lower.includes('padikkunnu')) return 'Student';
  if (lower.includes('homemaker') || lower.includes('housewife') || lower.includes('veetamma')) return 'Homemaker';
  if (lower.includes('gulf') || lower.includes('pravasi') || lower.includes('abroad') || lower.includes('expatriate')) return 'Gulf / Pravasi Worker';
  if (lower.includes('govt') || lower.includes('government')) return 'Government Employee (State/Central)';
  if (lower.includes('business') || lower.includes('shop') || lower.includes('trade') || lower.includes('kachaavadam')) return 'Business / Self-Employed / Shop';
  if (lower.includes('daily wage') || lower.includes('coolie') || lower.includes('construction') || lower.includes('cooly')) return 'Daily Wage / Coolie / Construction';
  if (lower.includes('driver')) return 'Driver (Auto, Taxi, Heavy)';
  if (lower.includes('agriculture') || lower.includes('farming') || lower.includes('dairy') || lower.includes('krishi')) return 'Agriculture / Farming / Dairy';
  if (lower.includes('doctor') || lower.includes('engineer') || lower.includes('teacher') || lower.includes('lawyer') || lower.includes('advocate') || lower.includes('professional')) {
    return 'Professional (Doctor, Engineer, Lawyer, Teacher)';
  }
  if (lower.includes('usthad') || lower.includes('imam') || lower.includes('scholar') || lower.includes('muazzin') || lower.includes('moulavi')) {
    return 'Religious Scholar / Usthad / Imam / Muazzin';
  }
  if (lower.includes('unemployed') || lower.includes('job seeker')) return 'Unemployed / Job Seeker';
  if (lower.includes('retired')) return 'Retired';
  if (lower.includes('unable') || lower.includes('bedridden')) return 'Unable to Work (Due to Health or Age)';
  if (lower.includes('private')) return 'Private Sector Employee';
  const found = JOB_CATEGORIES.find((j) => j.toLowerCase() === lower);
  return found || 'Daily Wage / Coolie / Construction';
}

function normalizeHealthCondition(val: string): string {
  if (!val) return 'None (Healthy)';
  const lower = val.toLowerCase();
  if (lower.includes('diabetes') || lower.includes('bp') || lower.includes('sugar') || lower.includes('hypertension')) return 'Diabetes / Hypertension (BP)';
  if (lower.includes('heart') || lower.includes('cardiac')) return 'Heart Disease / Cardiac Issue';
  if (lower.includes('kidney') || lower.includes('dialysis')) return 'Kidney Disease / Dialysis Patient';
  if (lower.includes('cancer')) return 'Cancer Patient / Under Treatment';
  if (lower.includes('disability') || lower.includes('handicap')) return 'Physical Disability / Handicapped';
  if (lower.includes('mental') || lower.includes('autism') || lower.includes('intellectual')) return 'Mental Health / Intellectual Disability';
  if (lower.includes('bedridden') || lower.includes('palliative')) return 'Bedridden / Palliative Care Needed';
  if (lower.includes('asthma') || lower.includes('respiratory')) return 'Asthma / Respiratory Illness';
  if (lower.includes('none') || lower.includes('healthy') || lower === 'nil' || lower === 'no') return 'None (Healthy)';
  const found = HEALTH_CONDITIONS.find((h) => h.toLowerCase() === lower);
  return found || 'None (Healthy)';
}

function parseExcelRowsToHouses(rows: any[]) {
  let currentHouseNo = '';
  let currentHouseName = '';
  let currentWard = '';
  let currentEconomicStatus = '';
  let currentOwnership = '';

  const housesMap = new Map<string, { house: any; head: any; members: any[] }>();

  for (const row of rows) {
    let rowHouseNo = getField(row, 'House No', 'House Number', 'HouseNo', 'House#');
    let rowHouseName = getField(row, 'House Name', 'HouseName');
    let rowWard = normalizeWard(getField(row, 'Ward'));
    let rowEconomic = normalizeEconomicStatus(getField(row, 'Economic Status', 'EconomicStatus', 'Economic'));
    let rowOwnership = normalizeHouseOwnership(getField(row, 'House Ownership', 'HouseOwnership', 'Ownership'));
    const name = getField(row, 'Name', 'Full Name', 'Citizen Name', 'Member Name');

    // Skip empty row
    if (!rowHouseNo && !name) continue;

    if (rowHouseNo) {
      currentHouseNo = rowHouseNo;
      if (rowHouseName) currentHouseName = rowHouseName;
      if (rowWard) currentWard = rowWard;
      if (rowEconomic) currentEconomicStatus = rowEconomic;
      if (rowOwnership) currentOwnership = rowOwnership;
    } else {
      rowHouseNo = currentHouseNo;
    }

    if (!rowHouseNo || !name) continue;

    const rawRelation = getField(row, 'Relation to Head', 'Relation', 'Relationship');
    const relation = normalizeRelation(rawRelation);
    const relLower = rawRelation.toLowerCase();
    const isExplicitHead =
      relLower === 'head' ||
      relLower === 'self' ||
      relLower === 'self (head)' ||
      relLower === 'house head' ||
      relLower === 'family head' ||
      relLower.includes('nathan') ||
      relLower.includes('nadhan') ||
      relation === 'Self (Head)';

    const dobRaw = getField(row, 'Date of Birth', 'DOB', 'Birth Date');
    const ageRaw = getField(row, 'Age');
    let dob = '';
    let age = 35;

    if (dobRaw) {
      dob = parseExcelDate(dobRaw);
      const calc = calculateAge(dob);
      if (calc !== null) {
        age = calc;
      } else if (ageRaw && !isNaN(Number(ageRaw))) {
        age = Number(ageRaw);
      }
    } else if (ageRaw && !isNaN(Number(ageRaw))) {
      age = Number(ageRaw);
    }

    const gender = normalizeGender(getField(row, 'Gender', 'Sex'));
    const bloodGroup = normalizeBloodGroup(getField(row, 'Blood Group', 'BloodGroup', 'Blood'));
    const maritalStatus = getField(row, 'Marital Status', 'MaritalStatus') || 'Married';
    const phone = getField(row, 'Phone', 'Phone Number', 'Mobile', 'Contact');
    const educationStage = normalizeEducationStage(getField(row, 'Education Stage', 'Education', 'Educational Stage'));
    const classOrYear = normalizeClassYear(getField(row, 'Class / Year', 'Class/Year', 'Class / Status', 'Class', 'ClassOrYear'));
    const islamicEducation = normalizeIslamicEducation(getField(row, 'Islamic Education', 'IslamicEducation', 'Madrassa'));
    const jobCategory = normalizeJobCategory(getField(row, 'Job Category', 'Job', 'Occupation'));
    const specificJob = getField(row, 'Specific Job / Details', 'Specific Job', 'Job Details', 'Profession');
    const pravasiStr = getField(row, 'Pravasi Status', 'Is Pravasi', 'Pravasi').toLowerCase();
    const isPravasi = pravasiStr === 'yes' || pravasiStr === 'true' || pravasiStr === '1' || pravasiStr === 'y';
    const pravasiCountry = getField(row, 'Pravasi Country', 'Country');
    const healthCondition = normalizeHealthCondition(getField(row, 'Health Condition', 'Health', 'Medical Condition'));

    const citizenData = {
      name,
      dob,
      age,
      gender,
      bloodGroup,
      maritalStatus,
      phone,
      educationStage,
      classOrYear,
      islamicEducation,
      isPravasi,
      pravasiCountry,
      jobCategory,
      specificJob,
      healthCondition,
    };

    if (!housesMap.has(rowHouseNo)) {
      // First person encountered for this House No is the Head
      housesMap.set(rowHouseNo, {
        house: {
          houseNo: rowHouseNo,
          houseName: currentHouseName || `House ${rowHouseNo}`,
          ward: currentWard || 'Ward 1',
          economicStatus: currentEconomicStatus || 'APL (Above Poverty Line)',
          houseOwnership: currentOwnership || 'Own House',
          vehicles: [],
        },
        head: {
          ...citizenData,
          isHead: true,
          relationToHead: 'Self (Head)',
        },
        members: [],
      });
    } else {
      const h = housesMap.get(rowHouseNo)!;
      if (isExplicitHead && !h.head.name) {
        h.head = {
          ...citizenData,
          isHead: true,
          relationToHead: 'Self (Head)',
        };
      } else {
        h.members.push({
          ...citizenData,
          isHead: false,
          relationToHead: relation || 'Family Member',
        });
      }
    }
  }

  return Array.from(housesMap.values());
}

export async function POST(req: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const contentType = req.headers.get('content-type') || '';

    // If confirm action with JSON payload of pre-validated houses
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { action, housesToImport } = body;

      if (action === 'confirm' && Array.isArray(housesToImport)) {
        // Fetch current houses to double-check no overwrite
        const currentHouses = await Storage.getHouses();
        const existingSet = new Set(currentHouses.map((h: any) => h.houseNo.trim().toLowerCase()));

        // Filter out any that already exist
        const strictlyNew = housesToImport.filter(
          (item: any) => !existingSet.has(item.house.houseNo.trim().toLowerCase())
        );

        if (strictlyNew.length === 0) {
          return NextResponse.json({
            error: 'No new houses to import. All specified house numbers already exist in database.',
          }, { status: 400 });
        }

        const imported = await Storage.bulkImportHousesWithMembers(strictlyNew, user);

        const totalImportedMembers = strictlyNew.reduce(
          (acc: number, item: any) => acc + 1 + (item.members?.length || 0),
          0
        );

        return NextResponse.json({
          success: true,
          importedHousesCount: imported.length,
          importedMembersCount: totalImportedMembers,
          message: `Successfully imported ${imported.length} houses and ${totalImportedMembers} citizens without modifying existing data.`,
        });
      }
    }

    // Otherwise handle multipart/form-data with file
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const action = formData.get('action') as string | null; // 'preview' or 'confirm'

    if (!file) {
      return NextResponse.json({ error: 'Please select an Excel file (.xlsx) to upload.' }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(fileBuffer, { type: 'array' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return NextResponse.json({ error: 'The uploaded file does not contain any sheets.' }, { status: 400 });
    }

    // Read the primary data sheet ('Family Data Entry' or first sheet)
    const targetSheetName =
      workbook.SheetNames.find((s) => s.toLowerCase().includes('family') || s.toLowerCase().includes('data')) ||
      workbook.SheetNames[0];

    const sheet = workbook.Sheets[targetSheetName];
    const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (rawRows.length === 0) {
      return NextResponse.json({ error: 'The uploaded sheet is empty.' }, { status: 400 });
    }

    const parsedHouses = parseExcelRowsToHouses(rawRows);

    if (parsedHouses.length === 0) {
      return NextResponse.json({
        error: 'Could not detect any valid family rows. Please make sure House No and Name columns are present.',
      }, { status: 400 });
    }

    // Cross-reference with existing database to guarantee zero overwrites
    const currentHouses = await Storage.getHouses();
    const existingMap = new Map<string, any>();
    currentHouses.forEach((h: any) => {
      existingMap.set(h.houseNo.trim().toLowerCase(), h);
    });

    const newHouses: any[] = [];
    const skippedHouses: any[] = [];

    parsedHouses.forEach((item) => {
      const key = item.house.houseNo.trim().toLowerCase();
      if (existingMap.has(key)) {
        skippedHouses.push({
          houseNo: item.house.houseNo,
          houseName: item.house.houseName,
          reason: 'Already registered by volunteer in portal',
        });
      } else {
        newHouses.push(item);
      }
    });

    const totalMembersToImport = newHouses.reduce(
      (acc, h) => acc + 1 + (h.members?.length || 0),
      0
    );

    // If only preview requested
    if (action === 'preview' || !action) {
      return NextResponse.json({
        success: true,
        preview: true,
        totalRowsDetected: rawRows.length,
        totalHousesDetected: parsedHouses.length,
        newHousesCount: newHouses.length,
        skippedHousesCount: skippedHouses.length,
        totalMembersToImport,
        skippedHouses,
        sampleNewHouses: newHouses.slice(0, 10).map((h) => ({
          houseNo: h.house.houseNo,
          houseName: h.house.houseName,
          ward: h.house.ward,
          headName: h.head.name,
          headAge: h.head.age,
          headDob: h.head.dob,
          membersCount: h.members.length,
          memberNames: h.members.map((m: any) => m.name).join(', '),
        })),
        allNewHouses: newHouses,
      });
    }

    // If confirm requested directly with file upload
    if (newHouses.length === 0) {
      return NextResponse.json({
        error: 'All houses in this file already exist in the portal. No new houses were added.',
        skippedHouses,
      }, { status: 400 });
    }

    const imported = await Storage.bulkImportHousesWithMembers(newHouses, user);

    return NextResponse.json({
      success: true,
      importedHousesCount: imported.length,
      importedMembersCount: totalMembersToImport,
      skippedHousesCount: skippedHouses.length,
      message: `Successfully imported ${imported.length} new houses and ${totalMembersToImport} members.`,
    });
  } catch (e: any) {
    console.error('Bulk Import Error:', e);
    return NextResponse.json({ error: 'Failed to process Excel import: ' + (e.message || 'Unknown error') }, { status: 500 });
  }
}
