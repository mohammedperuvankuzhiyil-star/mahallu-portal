import fs from 'fs';
import path from 'path';
import { House, Citizen, UserSession } from '@/types';
import { connectToDatabase } from './mongodb';
import { User } from '@/models/User';
import { House as HouseModel } from '@/models/House';
import { Citizen as CitizenModel } from '@/models/Citizen';

// Pre-seeded default SuperAdmin
export const DEFAULT_SUPERADMIN = {
  id: 'admin-1',
  name: 'Mahallu President / Secretary',
  username: 'SUPERADMIN',
  passwordHash: 'admin@123',
  phone: '9876543210',
  role: 'SUPERADMIN' as const,
  createdAt: new Date().toISOString(),
};

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'mahallu_store.json');

interface LocalStore {
  users: any[];
  houses: House[];
  citizens: Citizen[];
}

// Initial sample data so the portal starts populated and looks alive
const initialData: LocalStore = {
  users: [
    DEFAULT_SUPERADMIN,
    {
      id: 'vol-1',
      name: 'Mohammed Shafi',
      username: 'shafi',
      passwordHash: 'vol@123',
      phone: '9847123456',
      role: 'VOLUNTEER',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'vol-2',
      name: 'Abdul Rahman',
      username: 'rahman',
      passwordHash: 'vol@123',
      phone: '9847654321',
      role: 'VOLUNTEER',
      createdAt: new Date().toISOString(),
    },
  ],
  houses: [
    {
      _id: 'house-101',
      houseNo: '12/450',
      houseName: 'Baitul Noor (Veliyil House)',
      ward: 'Ward 3',
      economicStatus: 'BPL (Below Poverty Line)',
      houseOwnership: 'Own House',
      vehicles: [
        { type: 'Two Wheeler (Scooter / Motorcycle)', count: 2 },
        { type: 'Four Wheeler / Car', count: 1 },
      ],
      registeredByVolunteerName: 'Mohammed Shafi',
      registeredByVolunteerId: 'vol-1',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      _id: 'house-102',
      houseNo: '12/451',
      houseName: 'Al-Huda Villa',
      ward: 'Ward 3',
      economicStatus: 'APL (Above Poverty Line)',
      houseOwnership: 'Own House',
      vehicles: [
        { type: 'Two Wheeler (Scooter / Motorcycle)', count: 1 },
        { type: 'Four Wheeler / Car', count: 1 },
        { type: 'Auto Rickshaw', count: 1 },
      ],
      registeredByVolunteerName: 'Mohammed Shafi',
      registeredByVolunteerId: 'vol-1',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      _id: 'house-103',
      houseNo: '08/112',
      houseName: 'Darussalam (Kunnathu House)',
      ward: 'Ward 2',
      economicStatus: 'AAY (Antyodaya Anna Yojana - Yellow)',
      houseOwnership: 'Temporary Shelter / Shed',
      vehicles: [{ type: 'Bicycle', count: 1 }],
      registeredByVolunteerName: 'Abdul Rahman',
      registeredByVolunteerId: 'vol-2',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  citizens: [
    {
      _id: 'cit-1',
      houseId: 'house-101',
      isHead: true,
      relationToHead: 'Self (Head)',
      name: 'Ibrahim Kutty V.P.',
      age: 56,
      gender: 'Male',
      bloodGroup: 'O+',
      maritalStatus: 'Married',
      phone: '9847112233',
      educationStage: 'High School (Class 8-10 / SSLC)',
      classOrYear: 'Course Completed / Graduated',
      islamicEducation: 'Madrassa High School (Class 5-10)',
      isPravasi: true,
      pravasiCountry: 'United Arab Emirates (UAE)',
      jobCategory: 'Gulf / Pravasi Worker',
      specificJob: 'Retail Store Supervisor, Dubai',
      healthCondition: 'Diabetes / Hypertension (BP)',
      specialSkills: 'Social Work / Volunteer Leadership',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      _id: 'cit-2',
      houseId: 'house-101',
      isHead: false,
      relationToHead: 'Spouse (Wife/Husband)',
      name: 'Fathima Suhra',
      age: 50,
      gender: 'Female',
      bloodGroup: 'B+',
      maritalStatus: 'Married',
      phone: '9847112234',
      educationStage: 'High School (Class 8-10 / SSLC)',
      classOrYear: 'Course Completed / Graduated',
      islamicEducation: 'Madrassa Primary (Class 1-4)',
      isPravasi: false,
      jobCategory: 'Homemaker',
      healthCondition: 'None (Healthy)',
      specialSkills: 'Cooking / Catering / Baking',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      _id: 'cit-3',
      houseId: 'house-101',
      isHead: false,
      relationToHead: 'Son',
      name: 'Muhammed Nabeel',
      age: 21,
      gender: 'Male',
      bloodGroup: 'O+',
      maritalStatus: 'Single / Unmarried',
      phone: '9847112235',
      educationStage: 'Undergraduate (BA, BSc, BCom, BTech, etc.)',
      classOrYear: 'Final Year Degree / UG',
      islamicEducation: 'Hifz (Quran Memorizer / Hafiz)',
      isPravasi: false,
      jobCategory: 'Student',
      specificJob: 'B.Com Final Year Student',
      healthCondition: 'None (Healthy)',
      specialSkills: 'IT / Computer / Graphic Design / Typing',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      _id: 'cit-4',
      houseId: 'house-101',
      isHead: false,
      relationToHead: 'Daughter',
      name: 'Aisha Rifa',
      age: 16,
      gender: 'Female',
      bloodGroup: 'AB+',
      maritalStatus: 'Single / Unmarried',
      phone: '9847112236',
      educationStage: 'Higher Secondary (+1 / +2 / VHSE)',
      classOrYear: '+2 (Plus Two - 12th)',
      islamicEducation: 'Madrassa Higher Secondary (11-12 Completed)',
      isPravasi: false,
      jobCategory: 'Student',
      specificJob: 'Plus Two Science Student',
      healthCondition: 'None (Healthy)',
      specialSkills: 'Arts / Calligraphy / Tailoring',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      _id: 'cit-5',
      houseId: 'house-102',
      isHead: true,
      relationToHead: 'Self (Head)',
      name: 'Usman Haji K.',
      age: 62,
      gender: 'Male',
      bloodGroup: 'A+',
      maritalStatus: 'Married',
      phone: '9447334455',
      educationStage: 'Primary School (Class 1-4)',
      classOrYear: 'Course Completed / Graduated',
      islamicEducation: 'Madrassa High School (Class 5-10)',
      isPravasi: false,
      jobCategory: 'Business / Self-Employed / Shop',
      specificJob: 'Hardware Store Owner',
      healthCondition: 'Heart Disease / Cardiac Issue',
      specialSkills: 'Social Work / Volunteer Leadership',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      _id: 'cit-6',
      houseId: 'house-102',
      isHead: false,
      relationToHead: 'Son',
      name: 'Ameen Usman',
      age: 28,
      gender: 'Male',
      bloodGroup: 'A+',
      maritalStatus: 'Married',
      phone: '9447334456',
      educationStage: 'Undergraduate (BA, BSc, BCom, BTech, etc.)',
      classOrYear: 'Course Completed / Graduated',
      islamicEducation: 'Madrassa Higher Secondary (11-12 Completed)',
      isPravasi: true,
      pravasiCountry: 'Qatar',
      jobCategory: 'Gulf / Pravasi Worker',
      specificJob: 'Mechanical Engineer, Doha',
      healthCondition: 'None (Healthy)',
      specialSkills: 'Driving (Heavy / Light)',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      _id: 'cit-7',
      houseId: 'house-103',
      isHead: true,
      relationToHead: 'Self (Head)',
      name: 'Zainaba Beevi',
      age: 64,
      gender: 'Female',
      bloodGroup: 'O-',
      maritalStatus: 'Widowed',
      phone: '9656778899',
      educationStage: 'Illiterate / No Formal Schooling',
      classOrYear: 'Not Applicable',
      islamicEducation: 'Basic Home Islamic Study',
      isPravasi: false,
      jobCategory: 'Unable to Work (Due to Health or Age)',
      healthCondition: 'Kidney Disease / Dialysis Patient',
      healthConditionOther: 'Undergoing weekly dialysis at Govt Hospital',
      specialSkills: 'None',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      _id: 'cit-8',
      houseId: 'house-103',
      isHead: false,
      relationToHead: 'Son',
      name: 'Rashid K.',
      age: 19,
      gender: 'Male',
      bloodGroup: 'B-',
      maritalStatus: 'Single / Unmarried',
      phone: '9656778800',
      educationStage: 'Diploma / ITI / Polytechnic',
      classOrYear: '2nd Year Diploma / ITI',
      islamicEducation: 'Madrassa High School (Class 5-10)',
      isPravasi: false,
      jobCategory: 'Student',
      specificJob: 'ITI Electrical Student',
      healthCondition: 'None (Healthy)',
      specialSkills: 'Electrical / Plumbing / Wiring',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
};

function ensureLocalDb(): LocalStore {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return initialData;
  }
}

function saveLocalDb(data: LocalStore) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

async function seedMongoIfEmpty() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      for (const u of initialData.users) {
        await User.create({
          name: u.name,
          username: u.username.toLowerCase(),
          passwordHash: u.passwordHash,
          phone: u.phone,
          role: u.role,
        });
      }

      for (const h of initialData.houses) {
        const createdHouse = await HouseModel.create({
          houseNo: h.houseNo,
          houseName: h.houseName,
          ward: h.ward,
          economicStatus: h.economicStatus,
          houseOwnership: h.houseOwnership,
          vehicles: h.vehicles,
          registeredByVolunteerName: h.registeredByVolunteerName,
          registeredByVolunteerId: h.registeredByVolunteerId,
        });

        const membersForHouse = initialData.citizens.filter((c) => c.houseId === h._id);
        for (const m of membersForHouse) {
          await CitizenModel.create({
            ...m,
            _id: undefined,
            houseId: createdHouse._id.toString(),
          });
        }
      }
    }
  } catch (err) {
    console.error('Error seeding MongoDB:', err);
  }
}

export const Storage = {
  getUsers: async () => {
    const conn = await connectToDatabase();
    if (conn) {
      await seedMongoIfEmpty();
      const users = await User.find().lean();
      return users.map((u: any) => ({ ...u, id: u._id.toString() }));
    }
    return ensureLocalDb().users;
  },

  getUserByUsername: async (username: string) => {
    const cleanUsername = username.trim().toLowerCase();
    const conn = await connectToDatabase();
    if (conn) {
      await seedMongoIfEmpty();
      const user = await User.findOne({ username: cleanUsername }).lean();
      if (!user) return null;
      return { ...user, id: (user as any)._id.toString() };
    }
    const db = ensureLocalDb();
    return db.users.find((u) => u.username.toLowerCase() === cleanUsername);
  },

  addUser: async (userData: any) => {
    const conn = await connectToDatabase();
    if (conn) {
      const created = await User.create({
        name: userData.name,
        username: userData.username.toLowerCase().trim(),
        passwordHash: userData.passwordHash,
        phone: userData.phone,
        role: userData.role || 'VOLUNTEER',
      });
      return { ...created.toObject(), id: created._id.toString() };
    }
    const db = ensureLocalDb();
    const newUser = {
      id: 'vol-' + Date.now(),
      ...userData,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveLocalDb(db);
    return newUser;
  },

  deleteUser: async (id: string) => {
    const conn = await connectToDatabase();
    if (conn) {
      await User.findByIdAndDelete(id);
      return true;
    }
    const db = ensureLocalDb();
    db.users = db.users.filter((u) => u.id !== id && u.role !== 'SUPERADMIN');
    saveLocalDb(db);
    return true;
  },

  getHouses: async () => {
    const conn = await connectToDatabase();
    if (conn) {
      await seedMongoIfEmpty();
      const houses = await HouseModel.find().sort({ createdAt: -1 }).lean();
      const citizens = await CitizenModel.find().lean();
      return houses.map((h: any) => ({
        ...h,
        _id: h._id.toString(),
        members: citizens
          .filter((c: any) => c.houseId === h._id.toString())
          .map((c: any) => ({ ...c, _id: c._id.toString() })),
      }));
    }
    const db = ensureLocalDb();
    return db.houses.map((h) => ({
      ...h,
      members: db.citizens.filter((c) => c.houseId === h._id),
    }));
  },

  getHouseById: async (id: string) => {
    const conn = await connectToDatabase();
    if (conn) {
      const house: any = await HouseModel.findById(id).lean();
      if (!house) return null;
      const citizens = await CitizenModel.find({ houseId: id }).lean();
      return {
        ...house,
        _id: house._id.toString(),
        members: citizens.map((c: any) => ({ ...c, _id: c._id.toString() })),
      };
    }
    const db = ensureLocalDb();
    const house = db.houses.find((h) => h._id === id);
    if (!house) return null;
    return {
      ...house,
      members: db.citizens.filter((c) => c.houseId === house._id),
    };
  },

  createHouseWithMembers: async (
    houseData: Omit<House, '_id'>,
    headData: any,
    membersData: any[]
  ) => {
    const conn = await connectToDatabase();
    if (conn) {
      const createdHouse = await HouseModel.create(houseData);
      const houseIdStr = createdHouse._id.toString();

      const createdHead = await CitizenModel.create({
        ...headData,
        houseId: houseIdStr,
        isHead: true,
        relationToHead: 'Self (Head)',
      });

      const createdMembers = [];
      for (const m of membersData) {
        const cm = await CitizenModel.create({
          ...m,
          houseId: houseIdStr,
          isHead: false,
        });
        createdMembers.push({ ...cm.toObject(), _id: cm._id.toString() });
      }

      return {
        ...createdHouse.toObject(),
        _id: houseIdStr,
        members: [
          { ...createdHead.toObject(), _id: createdHead._id.toString() },
          ...createdMembers,
        ],
      };
    }

    const db = ensureLocalDb();
    const houseId = 'house-' + Date.now();
    const now = new Date().toISOString();

    const newHouse: House = {
      ...houseData,
      _id: houseId,
      createdAt: now,
      updatedAt: now,
    };

    const newHead: Citizen = {
      ...headData,
      _id: 'cit-' + Date.now() + '-0',
      houseId,
      isHead: true,
      relationToHead: 'Self (Head)',
      createdAt: now,
      updatedAt: now,
    };

    const newMembers: Citizen[] = membersData.map((m, idx) => ({
      ...m,
      _id: 'cit-' + Date.now() + '-' + (idx + 1),
      houseId,
      isHead: false,
      createdAt: now,
      updatedAt: now,
    }));

    db.houses.unshift(newHouse);
    db.citizens.push(newHead, ...newMembers);
    saveLocalDb(db);

    return {
      ...newHouse,
      members: [newHead, ...newMembers],
    };
  },

  updateHouseWithMembers: async (
    houseId: string,
    houseData: any,
    headData: any,
    membersData: any[],
    userSession?: UserSession
  ) => {
    const conn = await connectToDatabase();
    if (conn) {
      await HouseModel.findByIdAndUpdate(houseId, houseData);
      await CitizenModel.deleteMany({ houseId });

      const createdHead = await CitizenModel.create({
        ...headData,
        houseId,
        isHead: true,
        relationToHead: 'Self (Head)',
      });

      const createdMembers = [];
      for (const m of membersData) {
        const cm = await CitizenModel.create({
          ...m,
          houseId,
          isHead: false,
        });
        createdMembers.push({ ...cm.toObject(), _id: cm._id.toString() });
      }

      const updatedHouse: any = await HouseModel.findById(houseId).lean();
      return {
        ...updatedHouse,
        _id: houseId,
        members: [
          { ...createdHead.toObject(), _id: createdHead._id.toString() },
          ...createdMembers,
        ],
      };
    }

    const db = ensureLocalDb();
    const idx = db.houses.findIndex((h) => h._id === houseId);
    if (idx === -1) return null;

    const now = new Date().toISOString();
    db.houses[idx] = {
      ...db.houses[idx],
      ...houseData,
      _id: houseId,
      updatedAt: now,
    };

    db.citizens = db.citizens.filter((c) => c.houseId !== houseId);

    const updatedHead: Citizen = {
      ...headData,
      _id: headData._id || 'cit-' + Date.now() + '-0',
      houseId,
      isHead: true,
      relationToHead: 'Self (Head)',
      updatedAt: now,
    };

    const updatedMembers: Citizen[] = membersData.map((m, i) => ({
      ...m,
      _id: m._id || 'cit-' + Date.now() + '-' + (i + 1),
      houseId,
      isHead: false,
      updatedAt: now,
    }));

    db.citizens.push(updatedHead, ...updatedMembers);
    saveLocalDb(db);

    return {
      ...db.houses[idx],
      members: [updatedHead, ...updatedMembers],
    };
  },

  deleteHouse: async (houseId: string) => {
    const conn = await connectToDatabase();
    if (conn) {
      await HouseModel.findByIdAndDelete(houseId);
      await CitizenModel.deleteMany({ houseId });
      return true;
    }
    const db = ensureLocalDb();
    db.houses = db.houses.filter((h) => h._id !== houseId);
    db.citizens = db.citizens.filter((c) => c.houseId !== houseId);
    saveLocalDb(db);
    return true;
  },

  getAllCitizens: async () => {
    const conn = await connectToDatabase();
    if (conn) {
      await seedMongoIfEmpty();
      const citizens: any[] = await CitizenModel.find().lean();
      const houses: any[] = await HouseModel.find().lean();
      return citizens.map((c) => {
        const house = houses.find((h) => h._id.toString() === c.houseId);
        return {
          ...c,
          _id: c._id.toString(),
          houseNo: house?.houseNo || '',
          houseName: house?.houseName || '',
          ward: house?.ward || '',
          economicStatus: house?.economicStatus || '',
        };
      });
    }
    const db = ensureLocalDb();
    return db.citizens.map((c) => {
      const house = db.houses.find((h) => h._id === c.houseId);
      return {
        ...c,
        houseNo: house?.houseNo || '',
        houseName: house?.houseName || '',
        ward: house?.ward || '',
        economicStatus: house?.economicStatus || '',
      };
    });
  },
};
