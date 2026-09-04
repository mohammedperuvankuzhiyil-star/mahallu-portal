import { NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { getSession } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function GET(req: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const houses = await Storage.getHouses();
    const citizens = await Storage.getAllCitizens();

    // 1. Households Sheet Data
    const housesData = houses.map((h: any, i: number) => {
      const head = h.members?.find((m: any) => m.isHead);
      const vehicleSummary = (h.vehicles || [])
        .filter((v: any) => v.count > 0)
        .map((v: any) => `${v.type}: ${v.count}`)
        .join(', ');

      return {
        'Sl No': i + 1,
        'House No': h.houseNo,
        'House Name': h.houseName,
        'Ward': h.ward,
        'Economic Status': h.economicStatus,
        'House Ownership': h.houseOwnership,
        'Head of Family': head?.name || 'N/A',
        'Head Phone': head?.phone || 'N/A',
        'Total Family Members': h.members?.length || 0,
        'Vehicles Owned': vehicleSummary || 'None',
        'Registered By': h.registeredByVolunteerName || 'N/A',
        'Last Updated': h.updatedAt ? new Date(h.updatedAt).toLocaleDateString() : 'N/A',
      };
    });

    // 2. All Citizens / Members Sheet Data
    const citizensData = citizens.map((c: any, i: number) => ({
      'Sl No': i + 1,
      'Name': c.name,
      'Age': c.age,
      'Gender': c.gender,
      'Relation to Head': c.relationToHead,
      'House No': c.houseNo,
      'House Name': c.houseName,
      'Ward': c.ward,
      'Blood Group': c.bloodGroup,
      'Phone': c.phone || 'N/A',
      'Education Stage': c.educationStage,
      'Class / Course Status': c.classOrYear,
      'Islamic Education': c.islamicEducation || 'None',
      'Job Category': c.jobCategory,
      'Specific Job': c.specificJob || 'N/A',
      'Pravasi Status': c.isPravasi ? `Yes (${c.pravasiCountry || 'Abroad'})` : 'No',
      'Health Issue': c.healthCondition === 'Other' ? `Other: ${c.healthConditionOther}` : c.healthCondition,
      'Special Skill': c.specialSkills === 'Other' ? `Other: ${c.specialSkillsOther}` : c.specialSkills,
      'Economic Status': c.economicStatus,
    }));

    // 3. Blood Donors List
    const bloodDonors = citizens
      .filter((c: any) => c.bloodGroup && c.bloodGroup !== 'Unknown / Not Tested')
      .map((c: any, i: number) => ({
        'Sl No': i + 1,
        'Blood Group': c.bloodGroup,
        'Donor Name': c.name,
        'Age': c.age,
        'Gender': c.gender,
        'Contact Phone': c.phone,
        'Ward': c.ward,
        'House No & Name': `${c.houseNo} - ${c.houseName}`,
      }));

    // 4. Students Directory
    const students = citizens
      .filter((c: any) => c.jobCategory === 'Student' || c.classOrYear?.includes('Class') || c.classOrYear?.includes('Degree') || c.classOrYear?.includes('+'))
      .map((c: any, i: number) => ({
        'Sl No': i + 1,
        'Student Name': c.name,
        'Age': c.age,
        'Gender': c.gender,
        'Education Level': c.educationStage,
        'Class / Year': c.classOrYear,
        'Islamic Study': c.islamicEducation,
        'Contact Phone': c.phone,
        'Ward': c.ward,
        'House Name': c.houseName,
      }));

    // Create Excel Workbook
    const wb = XLSX.utils.book_new();

    const wsHouses = XLSX.utils.json_to_sheet(housesData);
    const wsCitizens = XLSX.utils.json_to_sheet(citizensData);
    const wsBlood = XLSX.utils.json_to_sheet(bloodDonors);
    const wsStudents = XLSX.utils.json_to_sheet(students);

    XLSX.utils.book_append_sheet(wb, wsHouses, 'Households (Houses)');
    XLSX.utils.book_append_sheet(wb, wsCitizens, 'All Citizens');
    XLSX.utils.book_append_sheet(wb, wsBlood, 'Blood Donors');
    XLSX.utils.book_append_sheet(wb, wsStudents, 'Students Directory');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=Mahallu_Census_Report_${new Date().toISOString().slice(0, 10)}.xlsx`,
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to generate Excel export' }, { status: 500 });
  }
}
