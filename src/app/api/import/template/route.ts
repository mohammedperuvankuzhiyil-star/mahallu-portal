import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import ExcelJS from 'exceljs';
import {
  WARDS,
  ECONOMIC_STATUS_OPTIONS,
  HOUSE_OWNERSHIP_OPTIONS,
  GENDER_OPTIONS,
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

export async function GET() {
  try {
    const user = await getSession();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Mahallu Portal';
    workbook.lastModifiedBy = 'Executive Admin';
    workbook.created = new Date();

    // ==========================================
    // SHEET 1: FAMILY DATA ENTRY (MAIN SHEET)
    // ==========================================
    const wsData = workbook.addWorksheet('Family Data Entry', {
      views: [{ state: 'frozen', ySplit: 1, showGridLines: true }],
    });

    const columns = [
      { header: 'House No', key: 'houseNo', width: 14 },
      { header: 'House Name', key: 'houseName', width: 28 },
      { header: 'Ward', key: 'ward', width: 14 },
      { header: 'Economic Status', key: 'economicStatus', width: 28 },
      { header: 'House Ownership', key: 'houseOwnership', width: 24 },
      { header: 'Name', key: 'name', width: 24 },
      { header: 'Relation to Head', key: 'relation', width: 24 },
      { header: 'Date of Birth', key: 'dob', width: 16 },
      { header: 'Age', key: 'age', width: 8 },
      { header: 'Gender', key: 'gender', width: 12 },
      { header: 'Blood Group', key: 'bloodGroup', width: 16 },
      { header: 'Marital Status', key: 'maritalStatus', width: 22 },
      { header: 'Phone', key: 'phone', width: 16 },
      { header: 'Education Stage', key: 'educationStage', width: 34 },
      { header: 'Class / Year', key: 'classOrYear', width: 28 },
      { header: 'Islamic Education', key: 'islamicEducation', width: 34 },
      { header: 'Job Category', key: 'jobCategory', width: 32 },
      { header: 'Specific Job / Details', key: 'specificJob', width: 24 },
      { header: 'Pravasi Status', key: 'pravasiStatus', width: 16 },
      { header: 'Pravasi Country', key: 'pravasiCountry', width: 28 },
      { header: 'Health Condition', key: 'healthCondition', width: 30 },
    ];

    wsData.columns = columns;

    // Style the Header Row
    const headerRow = wsData.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF065F46' }, // Rich Dark Emerald
      };
      cell.font = {
        name: 'Arial',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF047857' } },
        bottom: { style: 'medium', color: { argb: 'FF047857' } },
        left: { style: 'thin', color: { argb: 'FF047857' } },
        right: { style: 'thin', color: { argb: 'FF047857' } },
      };
    });

    // Sample Families for clear understanding
    const sampleRows = [
      {
        houseNo: '12/450',
        houseName: 'Baitul Noor (Veliyil House)',
        ward: 'Ward 3',
        economicStatus: 'BPL (Below Poverty Line)',
        houseOwnership: 'Own House',
        name: 'Ibrahim Kutty V.P.',
        relation: 'Self (Head)',
        dob: '1976-05-12',
        age: 50,
        gender: 'Male',
        bloodGroup: 'O+',
        maritalStatus: 'Married',
        phone: '9847123456',
        educationStage: 'High School (Class 8-10 / SSLC)',
        classOrYear: 'Course Completed / Graduated',
        islamicEducation: 'Madrassa High School (Class 5-10)',
        jobCategory: 'Business / Self-Employed / Shop',
        specificJob: 'Grocery Store Owner',
        pravasiStatus: 'No',
        pravasiCountry: '',
        healthCondition: 'None (Healthy)',
      },
      {
        houseNo: '12/450',
        houseName: 'Baitul Noor (Veliyil House)',
        ward: 'Ward 3',
        economicStatus: 'BPL (Below Poverty Line)',
        houseOwnership: 'Own House',
        name: 'Amina V.P.',
        relation: 'Spouse (Wife/Husband)',
        dob: '1982-10-20',
        age: 44,
        gender: 'Female',
        bloodGroup: 'B+',
        maritalStatus: 'Married',
        phone: '',
        educationStage: 'High School (Class 8-10 / SSLC)',
        classOrYear: 'Course Completed / Graduated',
        islamicEducation: 'Madrassa High School (Class 5-10)',
        jobCategory: 'Homemaker',
        specificJob: '',
        pravasiStatus: 'No',
        pravasiCountry: '',
        healthCondition: 'None (Healthy)',
      },
      {
        houseNo: '12/450',
        houseName: '',
        ward: '',
        economicStatus: '',
        houseOwnership: '',
        name: 'Salman V.P.',
        relation: 'Son',
        dob: '2008-03-15',
        age: 18,
        gender: 'Male',
        bloodGroup: 'O+',
        maritalStatus: 'Single / Unmarried',
        phone: '9847998877',
        educationStage: 'Higher Secondary (+1 / +2 / VHSE)',
        classOrYear: '+2 (Plus Two - 12th)',
        islamicEducation: 'Madrassa Higher Secondary (11-12 Completed)',
        jobCategory: 'Student',
        specificJob: '+2 Commerce Student',
        pravasiStatus: 'No',
        pravasiCountry: '',
        healthCondition: 'None (Healthy)',
      },
      {
        houseNo: '12/451',
        houseName: 'Al-Huda Villa',
        ward: 'Ward 3',
        economicStatus: 'APL (Above Poverty Line)',
        houseOwnership: 'Own House',
        name: 'Kabeer K.T.',
        relation: 'Self (Head)',
        dob: '1974-01-08',
        age: 52,
        gender: 'Male',
        bloodGroup: 'A+',
        maritalStatus: 'Married',
        phone: '9847654321',
        educationStage: 'Undergraduate (BA, BSc, BCom, BTech, etc.)',
        classOrYear: 'Course Completed / Graduated',
        islamicEducation: 'Madrassa High School (Class 5-10)',
        jobCategory: 'Gulf / Pravasi Worker',
        specificJob: 'Sales Manager (Dubai)',
        pravasiStatus: 'Yes',
        pravasiCountry: 'United Arab Emirates (UAE)',
        healthCondition: 'None (Healthy)',
      },
      {
        houseNo: '12/451',
        houseName: '',
        ward: '',
        economicStatus: '',
        houseOwnership: '',
        name: 'Suhara K.T.',
        relation: 'Spouse (Wife/Husband)',
        dob: '1979-08-14',
        age: 47,
        gender: 'Female',
        bloodGroup: 'A+',
        maritalStatus: 'Married',
        phone: '',
        educationStage: 'Higher Secondary (+1 / +2 / VHSE)',
        classOrYear: 'Course Completed / Graduated',
        islamicEducation: 'Madrassa High School (Class 5-10)',
        jobCategory: 'Homemaker',
        specificJob: '',
        pravasiStatus: 'No',
        pravasiCountry: '',
        healthCondition: 'None (Healthy)',
      },
    ];

    sampleRows.forEach((r) => wsData.addRow(r));

    // ==========================================
    // SHEET 2: DROPDOWN LISTS (SOURCE OF VALIDATIONS)
    // ==========================================
    const wsLists = workbook.addWorksheet('Dropdown Lists', {
      views: [{ showGridLines: true }],
    });

    const pravasiStatusOptions = ['No', 'Yes'];

    const dropdownColumns = [
      { name: 'Ward', data: WARDS },
      { name: 'Economic Status', data: ECONOMIC_STATUS_OPTIONS },
      { name: 'House Ownership', data: HOUSE_OWNERSHIP_OPTIONS },
      { name: 'Relation to Head', data: RELATION_OPTIONS },
      { name: 'Gender', data: GENDER_OPTIONS },
      { name: 'Blood Group', data: BLOOD_GROUPS },
      { name: 'Marital Status', data: MARITAL_STATUS_OPTIONS },
      { name: 'Education Stage', data: EDUCATION_STAGES },
      { name: 'Class / Year', data: CLASS_YEAR_OPTIONS },
      { name: 'Islamic Education', data: ISLAMIC_EDUCATION_OPTIONS },
      { name: 'Job Category', data: JOB_CATEGORIES },
      { name: 'Pravasi Status', data: pravasiStatusOptions },
      { name: 'Pravasi Country', data: PRAVASI_COUNTRIES },
      { name: 'Health Condition', data: HEALTH_CONDITIONS },
    ];

    // Populate Sheet 2 Header and items
    dropdownColumns.forEach((col, idx) => {
      const colLetter = String.fromCharCode(65 + idx); // A, B, C, ...
      const headerCell = wsLists.getCell(`${colLetter}1`);
      headerCell.value = col.name;
      headerCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' },
      };

      col.data.forEach((val, itemIdx) => {
        wsLists.getCell(`${colLetter}${itemIdx + 2}`).value = val;
      });

      wsLists.getColumn(idx + 1).width = Math.max(col.name.length + 4, 25);
    });

    // ==========================================
    // APPLY DATA VALIDATIONS (DROPDOWNS) TO SHEET 1
    // ==========================================
    // Apply dropdowns to rows 2 to 500
    for (let r = 2; r <= 500; r++) {
      // Col C: Ward -> Dropdown Lists Col A
      wsData.getCell(`C${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`'Dropdown Lists'!$A$2:$A$${WARDS.length + 1}`],
        showErrorMessage: false,
      };

      // Col D: Economic Status -> Dropdown Lists Col B
      wsData.getCell(`D${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`'Dropdown Lists'!$B$2:$B$${ECONOMIC_STATUS_OPTIONS.length + 1}`],
        showErrorMessage: false,
      };

      // Col E: House Ownership -> Dropdown Lists Col C
      wsData.getCell(`E${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`'Dropdown Lists'!$C$2:$C$${HOUSE_OWNERSHIP_OPTIONS.length + 1}`],
        showErrorMessage: false,
      };

      // Col G: Relation to Head -> Dropdown Lists Col D
      wsData.getCell(`G${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`'Dropdown Lists'!$D$2:$D$${RELATION_OPTIONS.length + 1}`],
        showErrorMessage: false,
      };

      // Col J: Gender -> Dropdown Lists Col E
      wsData.getCell(`J${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`'Dropdown Lists'!$E$2:$E$${GENDER_OPTIONS.length + 1}`],
        showErrorMessage: false,
      };

      // Col K: Blood Group -> Dropdown Lists Col F
      wsData.getCell(`K${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`'Dropdown Lists'!$F$2:$F$${BLOOD_GROUPS.length + 1}`],
        showErrorMessage: false,
      };

      // Col L: Marital Status -> Dropdown Lists Col G
      wsData.getCell(`L${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`'Dropdown Lists'!$G$2:$G$${MARITAL_STATUS_OPTIONS.length + 1}`],
        showErrorMessage: false,
      };

      // Col N: Education Stage -> Dropdown Lists Col H
      wsData.getCell(`N${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`'Dropdown Lists'!$H$2:$H$${EDUCATION_STAGES.length + 1}`],
        showErrorMessage: false,
      };

      // Col O: Class / Year -> Dropdown Lists Col I
      wsData.getCell(`O${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`'Dropdown Lists'!$I$2:$I$${CLASS_YEAR_OPTIONS.length + 1}`],
        showErrorMessage: false,
      };

      // Col P: Islamic Education -> Dropdown Lists Col J
      wsData.getCell(`P${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`'Dropdown Lists'!$J$2:$J$${ISLAMIC_EDUCATION_OPTIONS.length + 1}`],
        showErrorMessage: false,
      };

      // Col Q: Job Category -> Dropdown Lists Col K
      wsData.getCell(`Q${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`'Dropdown Lists'!$K$2:$K$${JOB_CATEGORIES.length + 1}`],
        showErrorMessage: false,
      };

      // Col S: Pravasi Status -> Dropdown Lists Col L
      wsData.getCell(`S${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`'Dropdown Lists'!$L$2:$L$3`],
        showErrorMessage: false,
      };

      // Col T: Pravasi Country -> Dropdown Lists Col M
      wsData.getCell(`T${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`'Dropdown Lists'!$M$2:$M$${PRAVASI_COUNTRIES.length + 1}`],
        showErrorMessage: false,
      };

      // Col U: Health Condition -> Dropdown Lists Col N
      wsData.getCell(`U${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`'Dropdown Lists'!$N$2:$N$${HEALTH_CONDITIONS.length + 1}`],
        showErrorMessage: false,
      };
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Mahallu_Family_Data_Entry_Template.xlsx"',
      },
    });
  } catch (error: any) {
    console.error('Error generating Excel template:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate template' }, { status: 500 });
  }
}
