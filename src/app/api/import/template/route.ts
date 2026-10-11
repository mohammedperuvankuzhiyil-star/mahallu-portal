import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import * as XLSX from 'xlsx';
import {
  WARDS,
  ECONOMIC_STATUS_OPTIONS,
  HOUSE_OWNERSHIP_OPTIONS,
  BLOOD_GROUPS,
  MARITAL_STATUS_OPTIONS,
  RELATION_OPTIONS,
  EDUCATION_STAGES,
  JOB_CATEGORIES,
} from '@/lib/constants';

export async function GET() {
  try {
    const user = await getSession();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const templateRows = [
      {
        'House No': '12/450',
        'House Name': 'Baitul Noor (Veliyil House)',
        'Ward': 'Ward 3',
        'Economic Status': 'BPL (Below Poverty Line)',
        'House Ownership': 'Own House',
        'Name': 'Ibrahim Kutty V.P.',
        'Relation to Head': 'Head',
        'Date of Birth': '1976-05-12',
        'Age': 50,
        'Gender': 'Male',
        'Blood Group': 'O+',
        'Marital Status': 'Married',
        'Phone': '9847123456',
        'Education Stage': 'High School (Class 8-10 / SSLC)',
        'Job Category': 'Business / Trade / Shop',
        'Pravasi Status': 'No',
        'Pravasi Country': '',
        'Health Condition': 'None (Healthy)',
      },
      {
        'House No': '12/450',
        'House Name': 'Baitul Noor (Veliyil House)',
        'Ward': 'Ward 3',
        'Economic Status': 'BPL (Below Poverty Line)',
        'House Ownership': 'Own House',
        'Name': 'Amina V.P.',
        'Relation to Head': 'Wife',
        'Date of Birth': '1982-10-20',
        'Age': 44,
        'Gender': 'Female',
        'Blood Group': 'B+',
        'Marital Status': 'Married',
        'Phone': '',
        'Education Stage': 'High School (Class 8-10 / SSLC)',
        'Job Category': 'Homemaker / Housewife',
        'Pravasi Status': 'No',
        'Pravasi Country': '',
        'Health Condition': 'None (Healthy)',
      },
      {
        'House No': '12/450',
        'House Name': '',
        'Ward': '',
        'Economic Status': '',
        'House Ownership': '',
        'Name': 'Salman V.P.',
        'Relation to Head': 'Son',
        'Date of Birth': '2008-03-15',
        'Age': 18,
        'Gender': 'Male',
        'Blood Group': 'O+',
        'Marital Status': 'Single / Unmarried',
        'Phone': '9847998877',
        'Education Stage': 'Higher Secondary (+1 / +2 / VHSE)',
        'Job Category': 'Student',
        'Pravasi Status': 'No',
        'Pravasi Country': '',
        'Health Condition': 'None (Healthy)',
      },
      {
        'House No': '12/451',
        'House Name': 'Al-Huda Villa',
        'Ward': 'Ward 3',
        'Economic Status': 'APL (Above Poverty Line)',
        'House Ownership': 'Own House',
        'Name': 'Kabeer K.T.',
        'Relation to Head': 'Head',
        'Date of Birth': '1974-01-08',
        'Age': 52,
        'Gender': 'Male',
        'Blood Group': 'A+',
        'Marital Status': 'Married',
        'Phone': '9847654321',
        'Education Stage': 'Graduate / Degree (BA/BSc/BCom)',
        'Job Category': 'Gulf / Pravasi / Expatriate',
        'Pravasi Status': 'Yes',
        'Pravasi Country': 'United Arab Emirates (UAE)',
        'Health Condition': 'None (Healthy)',
      },
      {
        'House No': '12/451',
        'House Name': '',
        'Ward': '',
        'Economic Status': '',
        'House Ownership': '',
        'Name': 'Suhara K.T.',
        'Relation to Head': 'Wife',
        'Date of Birth': '1979-08-14',
        'Age': 47,
        'Gender': 'Female',
        'Blood Group': 'A+',
        'Marital Status': 'Married',
        'Phone': '',
        'Education Stage': 'Higher Secondary (+1 / +2 / VHSE)',
        'Job Category': 'Homemaker / Housewife',
        'Pravasi Status': 'No',
        'Pravasi Country': '',
        'Health Condition': 'None (Healthy)',
      },
    ];

    const instructionsRows = [
      { Field: 'House No', Required: 'YES', Description: 'Unique house census number (e.g. 12/450)' },
      { Field: 'House Name', Required: 'YES (First row of house)', Description: 'House name or family name (e.g. Baitul Noor)' },
      { Field: 'Ward', Required: 'YES', Description: `Options: ${WARDS.join(', ')}` },
      { Field: 'Economic Status', Required: 'Optional', Description: `Options: ${ECONOMIC_STATUS_OPTIONS.map(e => e.split('(')[0].trim()).join(', ')} (Default: APL)` },
      { Field: 'House Ownership', Required: 'Optional', Description: `Options: ${HOUSE_OWNERSHIP_OPTIONS.join(', ')} (Default: Own House)` },
      { Field: 'Name', Required: 'YES', Description: "Full name of the family member" },
      { Field: 'Relation to Head', Required: 'YES', Description: 'Set "Head" for house head; Wife, Son, Daughter, Father, Mother, etc. for others' },
      { Field: 'Date of Birth', Required: 'Recommended', Description: 'Format YYYY-MM-DD or DD/MM/YYYY. If provided, age will be auto-calculated' },
      { Field: 'Age', Required: 'Optional', Description: 'Age in years (if Date of Birth is not known)' },
      { Field: 'Gender', Required: 'Optional', Description: 'Male, Female, or Other (Default: Male)' },
      { Field: 'Blood Group', Required: 'Optional', Description: `Options: ${BLOOD_GROUPS.join(', ')} (Default: Unknown / Not Tested)` },
      { Field: 'Phone', Required: 'Optional', Description: '10-digit mobile phone number' },
      { Field: 'Pravasi Status', Required: 'Optional', Description: 'Yes or No' },
      { Field: 'Pravasi Country', Required: 'Optional', Description: 'e.g. UAE, Saudi Arabia, Qatar, etc.' },
      { Field: 'Health Condition', Required: 'Optional', Description: 'Diabetes, Heart Disease, Dialysis / Kidney, Bedridden, None (Healthy)' },
    ];

    const wb = XLSX.utils.book_new();
    const wsTemplate = XLSX.utils.json_to_sheet(templateRows);
    const wsInstructions = XLSX.utils.json_to_sheet(instructionsRows);

    // Auto-fit column widths
    wsTemplate['!cols'] = [
      { wch: 12 }, // House No
      { wch: 26 }, // House Name
      { wch: 12 }, // Ward
      { wch: 25 }, // Economic Status
      { wch: 16 }, // House Ownership
      { wch: 22 }, // Name
      { wch: 18 }, // Relation to Head
      { wch: 14 }, // Date of Birth
      { wch: 8 },  // Age
      { wch: 10 }, // Gender
      { wch: 14 }, // Blood Group
      { wch: 18 }, // Marital Status
      { wch: 14 }, // Phone
      { wch: 28 }, // Education Stage
      { wch: 26 }, // Job Category
      { wch: 14 }, // Pravasi Status
      { wch: 24 }, // Pravasi Country
      { wch: 20 }, // Health Condition
    ];

    wsInstructions['!cols'] = [
      { wch: 22 },
      { wch: 25 },
      { wch: 70 },
    ];

    XLSX.utils.book_append_sheet(wb, wsTemplate, 'Census Data Entry');
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions & Field Guide');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=Mahallu_Family_Data_Entry_Template.xlsx',
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}
