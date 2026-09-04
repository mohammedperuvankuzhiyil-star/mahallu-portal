import { NextResponse } from 'next/server';
import { Storage } from '@/lib/storage';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { Citizen as CitizenModel } from '@/models/Citizen';
import {
  getCurrentAcademicYear,
  AUTO_PROGRESSION_MAP,
  isMilestoneClass,
  MILESTONE_TRANSITIONS,
} from '@/lib/academic';

export async function GET() {
  try {
    const user = await getSession();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const currentAcademicYear = getCurrentAcademicYear();
    const citizens = await Storage.getAllCitizens();

    // Filter students
    const students = citizens.filter((c) => {
      const isStudying =
        c.jobCategory === 'Student' ||
        c.classOrYear?.includes('Class') ||
        c.classOrYear?.includes('Degree') ||
        c.classOrYear?.includes('+') ||
        c.classOrYear?.includes('Diploma') ||
        c.classOrYear?.includes('PG');

      const isCompleted =
        c.classOrYear === 'Course Completed / Graduated' ||
        c.classOrYear === 'Discontinued / Dropped Out' ||
        c.classOrYear === 'Not Applicable';

      return isStudying && !isCompleted;
    });

    const autoPromotable: any[] = [];
    const milestoneStudents: any[] = [];

    students.forEach((s) => {
      if (isMilestoneClass(s.classOrYear)) {
        milestoneStudents.push({
          ...s,
          availableOptions: MILESTONE_TRANSITIONS[s.classOrYear] || [],
        });
      } else if (AUTO_PROGRESSION_MAP[s.classOrYear]) {
        const next = AUTO_PROGRESSION_MAP[s.classOrYear];
        autoPromotable.push({
          ...s,
          nextClass: next.nextClass,
          nextEducationStage: next.nextEducationStage || s.educationStage,
        });
      }
    });

    return NextResponse.json({
      currentAcademicYear,
      totalStudents: students.length,
      autoPromotableCount: autoPromotable.length,
      milestoneCount: milestoneStudents.length,
      autoPromotable,
      milestoneStudents,
    });
  } catch (e: any) {
    console.error('Academic rollover preview error:', e);
    return NextResponse.json({ error: 'Failed to fetch rollover preview' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await getSession();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const currentAcademicYear = getCurrentAcademicYear();
    const conn = await connectToDatabase();

    let autoPromotedCount = 0;
    let milestoneFlaggedCount = 0;

    if (conn) {
      const students = await CitizenModel.find({
        $or: [
          { jobCategory: 'Student' },
          { classOrYear: { $regex: /Class|\+|Degree|Diploma|PG/i } },
        ],
        classOrYear: {
          $nin: ['Course Completed / Graduated', 'Discontinued / Dropped Out', 'Not Applicable'],
        },
      });

      for (const s of students) {
        if (isMilestoneClass(s.classOrYear)) {
          s.academicStatus = 'NEEDS_UPDATE';
          s.academicYearRecorded = currentAcademicYear;
          s.age = s.age + 1;
          await s.save();
          milestoneFlaggedCount++;
        } else if (AUTO_PROGRESSION_MAP[s.classOrYear]) {
          const next = AUTO_PROGRESSION_MAP[s.classOrYear];
          s.classOrYear = next.nextClass;
          if (next.nextEducationStage) {
            s.educationStage = next.nextEducationStage;
          }
          s.age = s.age + 1;
          s.academicYearRecorded = currentAcademicYear;
          s.academicStatus = 'CURRENT';
          await s.save();
          autoPromotedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      currentAcademicYear,
      autoPromotedCount,
      milestoneFlaggedCount,
    });
  } catch (e: any) {
    console.error('Academic rollover execution error:', e);
    return NextResponse.json({ error: 'Failed to execute rollover' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getSession();
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { citizenId, newClass, newStage, newJobCategory, notes } = await req.json();

    if (!citizenId || !newClass) {
      return NextResponse.json({ error: 'Missing citizenId or newClass' }, { status: 400 });
    }

    const currentAcademicYear = getCurrentAcademicYear();
    const conn = await connectToDatabase();

    if (conn) {
      const citizen = await CitizenModel.findById(citizenId);
      if (!citizen) {
        return NextResponse.json({ error: 'Citizen not found' }, { status: 404 });
      }

      citizen.classOrYear = newClass;
      if (newStage) citizen.educationStage = newStage;
      if (newJobCategory) citizen.jobCategory = newJobCategory;
      citizen.academicStatus = 'CURRENT';
      citizen.academicYearRecorded = currentAcademicYear;
      if (notes) citizen.academicTransitionNotes = notes;

      await citizen.save();
      return NextResponse.json({ success: true, citizen });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Update milestone error:', e);
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 });
  }
}
