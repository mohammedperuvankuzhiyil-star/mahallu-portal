import { NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { getSession } from '@/lib/auth';
import * as XLSX from 'xlsx';
import { calculateAge } from '@/components/volunteer/HouseFormModal';

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
  if (lower.startsWith('f')) return 'Female';
  if (lower.startsWith('m')) return 'Male';
  return 'Male';
}

function normalizeBloodGroup(bg: string): string {
  if (!bg) return 'Unknown / Not Tested';
  const clean = bg.toUpperCase().replace(/\s+/g, '');
  const valid = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  return valid.includes(clean) ? clean : 'Unknown / Not Tested';
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
    let rowWard = getField(row, 'Ward');
    let rowEconomic = getField(row, 'Economic Status', 'EconomicStatus');
    let rowOwnership = getField(row, 'House Ownership', 'HouseOwnership', 'Ownership');
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

    const relation = getField(row, 'Relation to Head', 'Relation', 'Relationship');
    const relLower = relation.toLowerCase();
    const isExplicitHead =
      relLower === 'head' ||
      relLower === 'self' ||
      relLower === 'self (head)' ||
      relLower === 'house head' ||
      relLower === 'family head' ||
      relLower.includes('nathan') ||
      relLower.includes('nadhan');

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
    const educationStage = getField(row, 'Education Stage', 'Education') || 'High School (Class 8-10 / SSLC)';
    const classOrYear = getField(row, 'Class / Status', 'Class', 'ClassOrYear') || 'Course Completed / Graduated';
    const islamicEducation = getField(row, 'Islamic Education', 'IslamicEducation', 'Madrassa') || 'Madrassa High School (Class 5-10)';
    const jobCategory = getField(row, 'Job Category', 'Job', 'Occupation') || 'Daily Wage / Coolie / Construction';
    const specificJob = getField(row, 'Specific Job', 'Job Details');
    const pravasiStr = getField(row, 'Pravasi Status', 'Is Pravasi', 'Pravasi').toLowerCase();
    const isPravasi = pravasiStr === 'yes' || pravasiStr === 'true' || pravasiStr === '1' || pravasiStr === 'y';
    const pravasiCountry = getField(row, 'Pravasi Country', 'Country');
    const healthCondition = getField(row, 'Health Condition', 'Health', 'Medical Condition') || 'None (Healthy)';

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

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
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
